import { collection, addDoc, getDocs, query, where, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config/firebase";

// Helper to convert blob URL to actual Blob object
const fetchBlobFromUrl = async (blobUrl) => {
  const response = await fetch(blobUrl);
  return await response.blob();
};

export const saveBoxConfig = async (userId, payload) => {
  try {
    const { facesConfig, activeNetId, netFlipX, netFlipY } = payload;
    
    // Create a copy of config so we don't mutate the UI state unpredictably
    const configToSave = JSON.parse(JSON.stringify(facesConfig));

    // Process all 6 faces for textures that need uploading
    const faceKeys = Object.keys(configToSave);
    for (const key of faceKeys) {
      const face = configToSave[key];
      if (face.textureUrl && face.textureUrl.startsWith('blob:')) {
        // Fetch the blob
        const blob = await fetchBlobFromUrl(face.textureUrl);
        // Create unique path: users/{uid}/{timestamp}_{faceKey}.png
        const storageRef = ref(storage, `users/${userId}/${Date.now()}_${key}.png`);
        
        // Upload to Storage
        await uploadBytes(storageRef, blob, { contentType: 'image/png' });
        
        // Retrieve public download URL
        const downloadUrl = await getDownloadURL(storageRef);
        
        // Replace blob URL with Firebase Storage URL
        face.textureUrl = downloadUrl;
      }
    }

    // Save final structured config to Firestore
    const docRef = await addDoc(collection(db, "boxes"), {
      userId,
      facesConfig: configToSave,
      activeNetId,
      netFlipX,
      netFlipY,
      createdAt: Timestamp.now(),
      title: `Box Config ${new Date().toLocaleDateString()}`
    });

    return docRef.id;
  } catch (error) {
    console.error("Error saving box format:", error);
    throw error;
  }
};

export const getUserBoxes = async (userId) => {
  try {
    const q = query(
      collection(db, "boxes"), 
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const boxes = [];
    querySnapshot.forEach((doc) => {
      boxes.push({ id: doc.id, ...doc.data() });
    });
    // Sort client-side to prevent Firebase Index requirement errors
    return boxes.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  } catch (error) {
    console.error("Error retrieving boxes:", error);
    throw error;
  }
};

export const deleteBox = async (boxId) => {
  try {
    await deleteDoc(doc(db, "boxes", boxId));
    // Note: We are not aggressively deleting Storage images for simplicity,
    // though in a production app we'd probably want to parse configToSave and delete them.
  } catch (error) {
    console.error("Error deleting box:", error);
    throw error;
  }
};
