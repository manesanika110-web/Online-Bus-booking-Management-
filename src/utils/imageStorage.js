import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";

export const uploadImage = async (file, path) => {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please choose a valid image file.");
  }
  if (!storage) throw new Error("Image storage is not configured.");

  const imageRef = ref(storage, path);
  await uploadBytes(imageRef, file, { contentType: file.type });
  return getDownloadURL(imageRef);
};

export const imageDataUrlToFile = (dataUrl, fileName) => {
  const [metadata, encoded] = dataUrl.split(",");
  const mimeType = metadata.match(/data:(.*?);base64/)?.[1];
  if (!mimeType || !encoded) {
    throw new Error("The saved profile photo is not a valid image.");
  }

  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], fileName, { type: mimeType });
};
