import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import ImageModal from './ImageModal';

export default function Profile({ images, username, onDelete }) {
  // Local loading state for the profile page
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // Filter images by the logged-in username
  const userImages = images.filter(img => img.user === username);

  // Simulate loading indicator on mount every time this page is opened
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleImageClick = (img) => setSelectedImage(img);
  const closeModal = () => setSelectedImage(null);

  // Handler for delete button click
  const handleDelete = (id) => {
    // Confirm deletion (optional)
    if (window.confirm('Are you sure you want to delete this image?')) {
      onDelete(id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4 dark:text-white">{username}'s Uploaded Images</h2>
      {userImages.length === 0 ? (
        <p className="dark:text-white">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userImages.map((img) => (
            <div
              key={img.id}
              className="relative border rounded overflow-hidden shadow dark:border-gray-600 dark:bg-gray-800 cursor-pointer"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-48 object-cover"
                onClick={() => handleImageClick(img)}
              />
              <div className="p-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Photo by <span className="font-semibold">{img.user}</span>
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
              {/* Delete Button */}
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-700 rounded-full transition-colors hover:bg-red-500 hover:text-white"
                aria-label="Delete image"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ImageModal for enlarged view */}
      {selectedImage && <ImageModal image={selectedImage} closeModal={closeModal} />}
    </div>
  );
}
