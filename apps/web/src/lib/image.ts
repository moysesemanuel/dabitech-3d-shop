const acceptedImageMimeTypes = ["image/png", "image/jpeg", "image/webp"];

const acceptedImageExtensions = [".png", ".jpg", ".jpeg", ".webp"];

export function isAcceptedImageFile(file: File) {
  const normalizedName = file.name.toLowerCase();

  return (
    acceptedImageMimeTypes.includes(file.type) &&
    acceptedImageExtensions.some((extension) =>
      normalizedName.endsWith(extension)
    )
  );
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Não foi possível ler a imagem."));
    };

    reader.onerror = () => {
      reject(new Error("Não foi possível ler a imagem."));
    };

    reader.readAsDataURL(file);
  });
}

export function resizeImageToFit(
  dataUrl: string,
  targetWidth: number,
  targetHeight: number
) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Não foi possível processar a imagem."));
        return;
      }

      const scale = Math.min(
        targetWidth / image.width,
        targetHeight / image.height
      );

      const width = image.width * scale;
      const height = image.height * scale;
      const x = (targetWidth - width) / 2;
      const y = (targetHeight - height) / 2;

      context.clearRect(0, 0, targetWidth, targetHeight);
      context.drawImage(image, x, y, width, height);

      resolve(canvas.toDataURL("image/webp", 0.92));
    };

    image.onerror = () => {
      reject(new Error("Não foi possível processar a imagem."));
    };

    image.src = dataUrl;
  });
}

export function resizeImageToCover(
  dataUrl: string,
  targetWidth: number,
  targetHeight: number
) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Não foi possível processar a imagem."));
        return;
      }

      const scale = Math.max(
        targetWidth / image.width,
        targetHeight / image.height
      );

      const width = image.width * scale;
      const height = image.height * scale;
      const x = (targetWidth - width) / 2;
      const y = (targetHeight - height) / 2;

      context.clearRect(0, 0, targetWidth, targetHeight);
      context.drawImage(image, x, y, width, height);

      resolve(canvas.toDataURL("image/webp", 0.92));
    };

    image.onerror = () => {
      reject(new Error("Não foi possível processar a imagem."));
    };

    image.src = dataUrl;
  });
}
