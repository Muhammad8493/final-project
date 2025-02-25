import React from 'react';

export default function ImageModal({ image, closeModal }) {
  if (!image) return null;

  const handleDownload = () => {
    // Create a temporary <a> element to trigger the download
    if (window.confirm('Are you sure you want to download this image?')) {
      const link = document.createElement('a');
      link.href = image.src; // Use the image source URL
      link.download = image.alt || 'downloaded-image'; // Default filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 bg-opacity-50 flex justify-center items-center p-4"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-gray-900 rounded p-4 max-w-lg w-full relative"
        onClick={(e) => e.stopPropagation()} // prevent close on inner click
      >
        <button
          className="absolute top-2 right-2 text-xl font-bold dark:text-white"
          onClick={closeModal}
          aria-label="Close"
        >
          &times;
        </button>
        <img
          src={image.src}
          alt={image.alt}
          className="w-full h-auto rounded mb-4"
        />
        <div className="flex justify-between items-center">
          <p className="dark:text-white">Downloads: {image.downloads}</p>
          <p className="dark:text-white">Likes: {image.likes}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleDownload}
            aria-label={`Download ${image.alt}`}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
