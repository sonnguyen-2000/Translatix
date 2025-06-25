import React, { useEffect, useRef } from 'react';

interface CanvasImageProps {
  src: string;
}

const CanvasImage = ({ src }: CanvasImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
    };
  }, [src]);

  return (
    <div className="overflow-auto w-full h-full">
      <canvas ref={canvasRef} className="block max-w-full h-auto mx-auto" />
    </div>
  );
};

CanvasImage.displayName = 'CanvasImage';

export default React.memo(CanvasImage);
