/**
 * Shrink a camera photo before upload: phone photos are often 5–12 MB, the server only needs
 * 1600 px on the longest side, and re-encoding to JPEG also turns HEIC photos the browser can
 * read into a format the server accepts. Falls back to the original file if the browser can't.
 */
export async function shrinkPhoto(file: File, maxSide = 1600): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) return file;
    return new File([blob], "palm.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_PHOTO_MB = 8;
