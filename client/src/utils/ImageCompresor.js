import imageCompression from "browser-image-compression";

export const compressImageTo200KB = async (file) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("File bukan gambar");
  }

  const options = {
    maxSizeMB: 0.2,         
    maxWidthOrHeight: 1024,  
    useWebWorker: true,
    initialQuality: 0.8,
  };

  const compressedFile = await imageCompression(file, options);

  if (compressedFile.size > 200 * 1024) {
    throw new Error("Gambar tidak bisa dikompres di bawah 200KB");
  }

  return compressedFile;
};
