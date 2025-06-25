export function drawImageSmoothly(canvas: HTMLCanvasElement, imageUrl: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = new Image();
  img.onload = () => {
    requestAnimationFrame(() => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    });
  };
  img.src = imageUrl;
}
