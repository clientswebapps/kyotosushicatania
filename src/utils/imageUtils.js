/**
 * Processes an image upload directly in the browser:
 * 1. Checks file size (max 1MB)
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

    // Check file size (1MB = 1048576 bytes)
    const MAX_SIZE = 1 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      reject(new Error(`File size must be less than 1MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`));
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
