import React, { useState, JSX } from 'react';
import ImageModal from './ImageModal';
import { ImageData } from '../types';

interface HomeProps {
  images: ImageData[];
  isLoggedIn: boolean;
}

export default function Home({ images, isLoggedIn }: HomeProps): JSX.Element {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  const handleImageClick = (img: ImageData): void => {
    setSelectedImage(img);
  };

  const closeModal = (): void => {
    setSelectedImage(null);
  };

  return (
    <div className="p-4">
      {/* Example grid of images */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Optional "+" upload cell */}
        <div
          className="border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-3xl font-bold cursor-pointer"
          aria-label="Upload a new image"
        >
          +
        </div>

        {images.map((img) => (
          <div
            key={img._id}
            className="border rounded overflow-hidden shadow hover:shadow-lg transition-shadow dark:border-gray-600 dark:bg-gray-800 cursor-pointer"
            onClick={() => handleImageClick(img)}
          >
            <img src={img.src} alt={img.name} className="w-full h-auto object-cover" />
            <div className="p-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Photo by <span className="font-semibold">{img.username}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Downloads: {img.downloads}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {img.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-200 text-xs text-gray-700 px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image modal for enlarged view */}
      {selectedImage && (
        <ImageModal image={selectedImage} closeModal={closeModal} />
      )}
    </div>
  );
}
