import React, { useState, useEffect, JSX } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import ImageModal from './ImageModal';
import EditImageTagsModal from './EditImageTagsModal';
import { ImageData } from '../types';

interface ProfileProps {
  images: ImageData[];
  setImages: React.Dispatch<React.SetStateAction<ImageData[]>>;
  username: string;
  onDelete: (id: string) => void;
}

export default function Profile({ images, setImages, username, onDelete }: ProfileProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedImageForEdit, setSelectedImageForEdit] = useState<ImageData | null>(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const userImages = images.filter((img) => img.username === username);

  // Open Edit Modal
  const openEditModal = (image: ImageData) => {
    setSelectedImageForEdit(image);
    setEditModalOpen(true);
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedImageForEdit(null);
  };

  // Update image tags after edit
  const updateImageTags = (imageId: string, updatedTags: string[]) => {
    setImages((prev) =>
      prev.map((img) => (img._id === imageId ? { ...img, tags: updatedTags } : img))
    );
  };


  // Handle image delete
  const handleDelete = async (imageId: string) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        const response = await fetch(`/api/images/${imageId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          setImages((prev) => prev.filter((img) => img._id !== imageId));
        } else {
          console.error("Failed to delete image:", await response.json());
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }
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
        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userImages.map((img) => (
            <div
              key={img._id}
              className="relative border rounded overflow-hidden shadow dark:border-gray-600 dark:bg-gray-800 cursor-pointer"
            >
              {/* Image Display */}
              <img
                src={img.src}
                alt={img.name}
                className="w-full h-48 object-cover"
                onClick={() => setSelectedImage(img)}
              />

              {/* Image Info */}
              <div className="p-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Photo by <span className="font-semibold">{img.username}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Downloads: {img.downloads}
                </p>

                {/* Tags Display */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {img.tags.slice(0, 5).map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-200 text-xs text-gray-700 px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Edit & Delete Buttons */}
              <div className="absolute bottom-2 right-2 flex flex-col gap-2">
                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(img)}
                  className="p-2 bg-white dark:bg-gray-700 rounded-full transition-colors hover:bg-blue-500 hover:text-white"
                  aria-label="Edit image tags"
                >
                  <Edit2 className="w-5 h-5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(img._id)}
                  className="p-2 bg-white dark:bg-gray-700 rounded-full transition-colors hover:bg-red-500 hover:text-white"
                  aria-label="Delete image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && <ImageModal image={selectedImage} closeModal={() => setSelectedImage(null)} />}

      {/* Edit Tags Modal */}
      {editModalOpen && selectedImageForEdit && (
        <EditImageTagsModal
          imageId={selectedImageForEdit._id}
          currentTags={selectedImageForEdit.tags}
          onClose={closeEditModal}
          onUpdateTags={updateImageTags}
        />
      )}
    </div>
  );
}
