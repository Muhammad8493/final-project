import React, { useState, ChangeEvent, FormEvent, JSX } from "react";
import { ImageData } from "../types";

interface UploadModalProps {
  onClose: () => void;
  onUpload: (newImage: ImageData) => void;
}

export default function UploadModal({ onClose, onUpload }: UploadModalProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();

    if (
      trimmedTag &&
      !tags.includes(trimmedTag) &&
      tags.length < 5 &&
      trimmedTag.length <= 10 &&
      tags.join("").length + trimmedTag.length <= 40
    ) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile || !imageName.trim()) {
      alert("Please select a file and enter an image name.");
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("name", imageName);
    formData.append("tags", tags.join(","));

    try {
      const token = localStorage.getItem("token"); 
      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const newImage: ImageData = await response.json();
      onUpload(newImage);
      onClose();
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded relative w-96 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-xl font-bold dark:text-white"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-xl mb-4 dark:text-white">Upload Image</h2>

        <form onSubmit={handleSubmit}>
          {/* File Upload */}
          <div className="mb-4 dark:text-white">
            <label className="block mb-2">Select a file:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-2 block w-full border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-600"
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 w-30 rounded" />
            )}
          </div>

          {/* Image Name */}
          <div className="mb-4">
            <label className="block mb-2 dark:text-white">Image Name:</label>
            <input
              type="text"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              className="block w-full border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-600 text-white"
              placeholder="Enter image name"
            />
          </div>

          {/* Tags Section */}
          <div className="mb-4">
            <label className="block mb-2 dark:text-white">Tags:</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full flex items-center dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-2 text-gray-500 hover:text-red-500"
                    onClick={() => handleRemoveTag(index)}
                    aria-label={`Remove ${tag}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            {/* Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-grow border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-600 text-white"
                placeholder="Enter a tag"
                maxLength={10}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={tags.length >= 5 || tagInput.trim().length === 0}
              >
                +
              </button>
            </div>
            {/* Tag Info */}
            <p className="text-xs text-gray-500 mt-1">
              Add up to 5 tags
            </p>
          </div>

          {/* Submit Button */}
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded w-full"
              disabled={!selectedFile}
            >
              Upload
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
