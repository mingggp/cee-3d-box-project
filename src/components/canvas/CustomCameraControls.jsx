import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * CustomCameraControls
 * Mobile:
 *   - 1 finger drag → orbit (horizontal = yaw, vertical = pitch, no roll)
 *   - 2 finger pinch → zoom in/out
 *   - 2 finger drag  → trackball rotation (any axis, including roll)
 * Desktop:
 *   - Left-click drag → trackball rotation
 *   - Scroll wheel    → zoom
 */
export default function CustomCameraControls({
  target = [0, 2, 0],
  minDistance = 3,
  maxDistance = 15,
  orbitSpeed = 0.006,
  trackballSpeed = 2.0,
}) {
  const { camera, gl } = useThree();
  const targetV = useRef(new THREE.Vector3(...target));

  // Internal camera state
  const state = useRef({
    dir: new THREE.Vector3(),   // unit direction from target to camera
    distance: 10,
  });

  // Initialize from camera's actual starting position
  useEffect(() => {
    const s = state.current;
    s.dir.copy(camera.position).sub(targetV.current);
    s.distance = s.dir.length();
    s.dir.normalize();
  }, []); // eslint-disable-line

  useEffect(() => {
    const canvas = gl.domElement;
    const s = state.current;

    // ─── Helpers ────────────────────────────────────────────────────────────

    /** Project screen point to point on virtual trackball sphere. */
    const project = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
      const r2 = nx * nx + ny * ny;
      // Inside sphere: exact sphere point; outside: Holroyd's hyperbola
      const v = r2 <= 0.5
        ? new THREE.Vector3(nx, ny, Math.sqrt(1 - r2))
        : new THREE.Vector3(nx, ny, 0.5 / Math.sqrt(r2));
      return v.normalize();
    };

    /** Apply trackball rotation from screen (x1,y1) → (x2,y2). */
    const applyTrackball = (x1, y1, x2, y2) => {
      const p1 = project(x1, y1);
      const p2 = project(x2, y2);
      const axis = p1.clone().cross(p2);
      const len = axis.length();
      if (len < 1e-6) return;
      axis.divideScalar(len);
      const angle = Math.acos(Math.max(-1, Math.min(1, p1.dot(p2)))) * trackballSpeed;
      // Rotate axis from screen-space → world-space via current camera orientation
      const worldAxis = axis.applyQuaternion(camera.quaternion);
      const q = new THREE.Quaternion().setFromAxisAngle(worldAxis, -angle);
      s.dir.applyQuaternion(q).normalize();
    };

    /** Apply orbit rotation from (dx, dy) screen deltas. No roll. */
    const applyOrbit = (dx, dy) => {
      // Horizontal → yaw around world Y
      const yaw = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), -dx * orbitSpeed
      );
      // Vertical → pitch around camera's right vector
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      const pitch = new THREE.Quaternion().setFromAxisAngle(right, -dy * orbitSpeed);
      s.dir.applyQuaternion(pitch).applyQuaternion(yaw).normalize();
    };

    const clampDistance = (d) => Math.max(minDistance, Math.min(maxDistance, d));

    // ─── Touch state ─────────────────────────────────────────────────────────
    let prevTouches = [];
    let prevPinchDist = 0;

    const touchArr = (e) => Array.from(e.touches);

    const onTouchStart = (e) => {
      e.preventDefault();
      prevTouches = touchArr(e);
      if (prevTouches.length === 2) {
        prevPinchDist = Math.hypot(
          prevTouches[1].clientX - prevTouches[0].clientX,
          prevTouches[1].clientY - prevTouches[0].clientY,
        );
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      const curr = touchArr(e);

      if (curr.length === 1 && prevTouches.length === 1) {
        // ── 1 finger: orbit ──────────────────────────────────────────────────
        applyOrbit(
          curr[0].clientX - prevTouches[0].clientX,
          curr[0].clientY - prevTouches[0].clientY,
        );
      } else if (curr.length === 2) {
        // ── 2 fingers: trackball + pinch zoom ────────────────────────────────

        // Pinch zoom
        const pinch = Math.hypot(
          curr[1].clientX - curr[0].clientX,
          curr[1].clientY - curr[0].clientY,
        );
        if (prevPinchDist > 0) {
          s.distance = clampDistance(s.distance * (prevPinchDist / pinch));
        }
        prevPinchDist = pinch;

        // Trackball using midpoint of the two fingers
        const prev1 = prevTouches[0];
        const prev2 = prevTouches.length >= 2 ? prevTouches[1] : prevTouches[0];
        const prevCx = (prev1.clientX + prev2.clientX) / 2;
        const prevCy = (prev1.clientY + prev2.clientY) / 2;
        const currCx = (curr[0].clientX + curr[1].clientX) / 2;
        const currCy = (curr[0].clientY + curr[1].clientY) / 2;
        applyTrackball(prevCx, prevCy, currCx, currCy);
      }

      prevTouches = curr;
    };

    const onTouchEnd = (e) => {
      prevTouches = touchArr(e);
      prevPinchDist = 0;
    };

    // ─── Mouse state (desktop) ───────────────────────────────────────────────
    let mouseDown = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      mouseDown = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!mouseDown) return;
      applyTrackball(prevMouse.x, prevMouse.y, e.clientX, e.clientY);
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { mouseDown = false; };

    const onWheel = (e) => {
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      s.distance = clampDistance(s.distance * factor);
    };

    // ─── Reset camera event ──────────────────────────────────────────────────
    const onReset = () => {
      const initial = new THREE.Vector3(8, 6, 9).sub(targetV.current);
      s.distance = initial.length();
      s.dir.copy(initial).normalize();
    };

    // ─── Register ────────────────────────────────────────────────────────────
    canvas.addEventListener('touchstart',  onTouchStart,  { passive: false });
    canvas.addEventListener('touchmove',   onTouchMove,   { passive: false });
    canvas.addEventListener('touchend',    onTouchEnd,    { passive: false });
    canvas.addEventListener('mousedown',   onMouseDown);
    window.addEventListener('mousemove',   onMouseMove);
    window.addEventListener('mouseup',     onMouseUp);
    canvas.addEventListener('wheel',       onWheel,       { passive: true });
    window.addEventListener('resetCamera', onReset);

    return () => {
      canvas.removeEventListener('touchstart',  onTouchStart);
      canvas.removeEventListener('touchmove',   onTouchMove);
      canvas.removeEventListener('touchend',    onTouchEnd);
      canvas.removeEventListener('mousedown',   onMouseDown);
      window.removeEventListener('mousemove',   onMouseMove);
      window.removeEventListener('mouseup',     onMouseUp);
      canvas.removeEventListener('wheel',       onWheel);
      window.removeEventListener('resetCamera', onReset);
    };
  }, [gl, minDistance, maxDistance, orbitSpeed, trackballSpeed]); // eslint-disable-line

  useFrame(() => {
    const s = state.current;
    if (s.dir.length() < 0.5) s.dir.set(0, 0, 1); // safety guard
    s.dir.normalize();
    camera.position
      .copy(targetV.current)
      .addScaledVector(s.dir, s.distance);
    camera.lookAt(targetV.current);
  });

  return null;
}
