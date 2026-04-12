// The EXACT 11 Distinct Mathematical Nets of a Cube (Hexominoes)
// Root face id is always 'top' — this is the face whose normal points +Y (upward) when the box is folded.
// The root node starts at center (0,0) in tree-space, which becomes the TOP face of the folded cube.
// Children fold DOWN (gravity) relative to the flat net.
//
// Face IDs: top, bottom, front, back, left, right
//   - top:    roof of the box (faces up, visible from above)
//   - bottom: floor of the box (faces down)
//   - front:  the face facing toward the viewer (+Z in world)
//   - back:   the face facing away from viewer (-Z in world)
//   - left:   left side (-X)
//   - right:  right side (+X)

export const VALID_CUBE_NETS = [
  // --- 1-4-1 Variations ---
  // 1. Cross
  {
    id: 'top',
    children: [
      { id: 'back',   edge: 'top' },
      { id: 'front',  edge: 'bottom', children: [
        { id: 'bottom', edge: 'bottom' }
      ]},
      { id: 'left',   edge: 'left' },
      { id: 'right',  edge: 'right' },
    ]
  },

  // 2. T-Shape
  {
    id: 'top',
    children: [
      { id: 'back', edge: 'top', children: [
        { id: 'left',  edge: 'left' },
        { id: 'right', edge: 'right' },
      ]},
      { id: 'front', edge: 'bottom', children: [
        { id: 'bottom', edge: 'bottom' }
      ]},
    ]
  },

  // 3. Shift-1
  {
    id: 'top',
    children: [
      { id: 'back', edge: 'top', children: [
        { id: 'left', edge: 'left' }
      ]},
      { id: 'right',  edge: 'right' },
      { id: 'front',  edge: 'bottom', children: [
        { id: 'bottom', edge: 'bottom' }
      ]},
    ]
  },

  // 4. Asymmetric
  {
    id: 'top',
    children: [
      { id: 'back', edge: 'top', children: [
        { id: 'left', edge: 'left' }
      ]},
      { id: 'front', edge: 'bottom', children: [
        { id: 'right',  edge: 'right' },
        { id: 'bottom', edge: 'bottom' },
      ]},
    ]
  },

  // 5. S-Shape
  {
    id: 'top',
    children: [
      { id: 'back', edge: 'top', children: [
        { id: 'left', edge: 'left' }
      ]},
      { id: 'front', edge: 'bottom', children: [
        { id: 'bottom', edge: 'bottom', children: [
          { id: 'right', edge: 'right' }
        ]}
      ]},
    ]
  },

  // 6. Middle-Shift
  {
    id: 'top',
    children: [
      { id: 'back',  edge: 'top' },
      { id: 'left',  edge: 'left' },
      { id: 'front', edge: 'bottom', children: [
        { id: 'right',  edge: 'right' },
        { id: 'bottom', edge: 'bottom' },
      ]},
    ]
  },

  // --- 2-3-1 Variations ---
  // 7.
  {
    id: 'top',
    children: [
      { id: 'front', edge: 'bottom' },
      { id: 'back',  edge: 'top', children: [
        { id: 'left', edge: 'left', children: [
          { id: 'bottom', edge: 'top' }
        ]},
        { id: 'right', edge: 'right' },
      ]},
    ]
  },

  // 8.
  {
    id: 'top',
    children: [
      { id: 'right', edge: 'right' },
      { id: 'front', edge: 'bottom' },
      { id: 'back',  edge: 'top', children: [
        { id: 'left', edge: 'left', children: [
          { id: 'bottom', edge: 'top' }
        ]},
      ]},
    ]
  },

  // 9.
  {
    id: 'top',
    children: [
      { id: 'front', edge: 'bottom', children: [
        { id: 'right', edge: 'right' }
      ]},
      { id: 'back', edge: 'top', children: [
        { id: 'left', edge: 'left', children: [
          { id: 'bottom', edge: 'top' }
        ]},
      ]},
    ]
  },

  // --- 2-2-2 Variations ---
  // 10. Staircase
  {
    id: 'top',
    children: [
      { id: 'left',  edge: 'left', children: [
        { id: 'back', edge: 'top' }
      ]},
      { id: 'front', edge: 'bottom', children: [
        { id: 'right', edge: 'right', children: [
          { id: 'bottom', edge: 'bottom' }
        ]}
      ]},
    ]
  },

  // --- 3-3 Variations ---
  // 11. Offset Rows
  {
    id: 'top',
    children: [
      { id: 'left',  edge: 'left' },
      { id: 'right', edge: 'right', children: [
        { id: 'front', edge: 'bottom', children: [
          { id: 'bottom', edge: 'right', children: [
            { id: 'back', edge: 'right' }
          ]}
        ]}
      ]},
    ]
  },
];
