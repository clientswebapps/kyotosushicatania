import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

/**
 * Processes an image upload directly in the browser:
 * 1. Checks file size (max 2MB)
 * 2. Reads file as data URL
 * 3. Draws to a Canvas to compress and convert to WebP format
 * @param {File} file - The file uploaded by the user
 * @returns {Promise<string>} - A promise that resolves to the compressed WebP base64 string
 */
export const processImageUpload = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    // Check file size (2MB = 2097152 bytes)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      reject(new Error(`File is too large! Max 2MB allowed. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set dimensions (could optionally resize here if needed, keeping original for now)
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to WebP with 0.8 quality (80%)
        const webpDataUrl = canvas.toDataURL("image/webp", 0.8);
        resolve(webpDataUrl);
      };
      img.onerror = () => {
        reject(new Error("Failed to read image file"));
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a media file (image or video) to Firebase Storage or uses base64 fallback.
 * @param {File} file - The file to upload
 * @param {function} setUploadingImage - React state setter to toggle upload spinner
 * @returns {Promise<string>} - A promise resolving to download URL or base64 string
 */
export const uploadMediaFile = async (file, setUploadingImage) => {
  const isImage = file.type.startsWith("image/");
  const MAX_SIZE = isImage ? 2 * 1024 * 1024 : 10 * 1024 * 1024;
  
  if (file.size > MAX_SIZE) {
    throw new Error(`File is too large! Max ${isImage ? "2MB" : "10MB"} allowed.`);
  }

  setUploadingImage(true);
  try {
    if (storage) {
      let fileToUpload = file;
      let fileName = `${Date.now()}_${file.name}`;
      
      if (isImage) {
        try {
          const compressedBase64 = await processImageUpload(file);
          const resBlob = await fetch(compressedBase64).then((r) => r.blob());
          fileToUpload = resBlob;
          const cleanName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          fileName = `${Date.now()}_${cleanName}.webp`;
        } catch (compressErr) {
          console.error("Compression failed, using original file:", compressErr);
        }
      }
      
      const storageRef = ref(storage, `uploads/${fileName}`);
      const metadata = {
        contentType: fileToUpload.type || file.type,
        cacheControl: "public, max-age=31536000"
      };
      const uploadResult = await uploadBytes(storageRef, fileToUpload, metadata);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      return downloadUrl;
    } else {
      // Fallback: local/mock data-URL encoding
      if (isImage) {
        return await processImageUpload(file);
      } else {
        // Video fallback
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }
    }
  } finally {
    setUploadingImage(false);
  }
};

