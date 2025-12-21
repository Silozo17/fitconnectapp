export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Create a cropped image from the original image and crop area
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  outputWidth: number = 400,
  aspectRatio: number = 1 // 1 = square, 4/3 = landscape card
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Calculate output dimensions based on aspect ratio
  const outputHeight = Math.round(outputWidth / aspectRatio);

  // Set canvas size to desired output dimensions
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // Draw the cropped image preserving aspect ratio
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas is empty"));
        }
      },
      "image/jpeg",
      0.9
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}
