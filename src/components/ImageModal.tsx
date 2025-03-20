import React, { JSX } from 'react';
import { ImageData } from '../types';

interface ImageModalProps {
  image: ImageData;
  closeModal: () => void;
}

export default function ImageModal({ image, closeModal }: ImageModalProps): JSX.Element | null {
  if (!image) return null;

  const handleDownload = async () => {
    if (window.confirm('Are you sure you want to download this image?')) {
      try {
        const response = await fetch(image.src);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = image.name || 'downloaded-image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
        URL.revokeObjectURL(blobUrl);
        
        await fetch(`/api/images/${image._id}/download`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ increment: 1 }),
        });
      } catch (error) {
        console.error('Error downloading the image:', error);
      }
    }
  };
  

  return (
    <div
      className="fixed inset-0 bg-black/60 bg-opacity-50 flex justify-center items-center p-4"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded p-4 max-w-lg w-full max-h-[85vh] relative overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-xl font-bold dark:text-white"
          onClick={closeModal}
          aria-label="Close"
        >
          &times;
        </button>
        <img src={image.src} alt={image.name} className="w-full h-auto rounded mb-4" />
        <div className="flex justify-between items-center">
          <p className="dark:text-white">Downloads: {image.downloads}</p>
          {/* <p className="dark:text-white">Likes: {image.likes ?? 0}</p> */}
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleDownload}
            aria-label={`Download ${image.name}`}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
