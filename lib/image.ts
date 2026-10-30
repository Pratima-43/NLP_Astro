/** Read an image file as a JPEG data URL, scaled so its longer side is at most `maxSide` px.
 *  Keeps saved palm photos small enough for browser storage while staying sharp enough to analyse. */
export async function imageFileToDataUrl(file: File, maxSide = 1600): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.9);
}

/** Turn a data URL back into a File, e.g. to upload a saved photo. */
export async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
