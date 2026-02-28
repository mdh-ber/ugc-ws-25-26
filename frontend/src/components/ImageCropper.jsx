import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Button from './Button';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const generateCroppedImage = async () => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = image;

    await new Promise((resolve) => (img.onload = resolve));

    const ctx = canvas.getContext('2d');
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    const base64Image = canvas.toDataURL('image/jpeg');
    onCropComplete(base64Image);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl h-[400px] bg-gray-900 rounded-lg overflow-hidden">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={16 / 9} // Perfect ratio for event cards
          onCropChange={onCropChange}
          onCropComplete={handleCropComplete}
          onZoomChange={onZoomChange}
        />
      </div>
      <div className="mt-6 flex gap-4 w-full max-w-2xl">
        <Button text="Cancel" onClick={onCancel} className="flex-1 bg-gray-600 text-white" />
        <Button text="Apply Crop" onClick={generateCroppedImage} className="flex-1 bg-blue-600 text-white" />
      </div>
    </div>
  );
};

export default ImageCropper;