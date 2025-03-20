import React, { useState, ChangeEvent, FormEvent, JSX } from "react";

interface EditImageTagsModalProps {
  imageId: string;
  currentTags: string[];
  onClose: () => void;
  onUpdateTags: (imageId: string, updatedTags: string[]) => void;
}

export default function EditImageTagsModal({
  imageId,
  currentTags,
  onClose,
  onUpdateTags,
}: EditImageTagsModalProps): JSX.Element {
  const [tags, setTags] = useState<string[]>(currentTags);
  const [newTag, setNewTag] = useState<string>("");

  const handleTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTag(e.target.value);
  };

  const addTag = () => {
    if (newTag.trim() && tags.length < 5 && newTag.length <= 10) {
      const updatedTags = [...tags, newTag.trim()].slice(0, 5);
      setTags(updatedTags);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/images/${imageId}/tags`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tags }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tags");
      }

      onUpdateTags(imageId, tags);
      onClose();
    } catch (error) {
      console.error("Error updating tags:", error);
      alert("Failed to update tags.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center p-4"
      aria-modal="true"
      onClick={onClose} 
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded relative w-96 overflow-y-auto max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="absolute top-2 right-2 text-xl font-bold dark:text-white" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-xl mb-4 dark:text-white">Edit Image Tags</h2>

        {/* Form Submission */}
        <form onSubmit={handleSubmit}>
          {/* Display Existing Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-gray-200 text-xs text-gray-700 px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-200 relative"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2  text-gray-500 hover:text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Add New Tag */}
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={newTag}
              onChange={handleTagInputChange}
              className="block w-full text-white border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-600"
              placeholder="Add new tag..."
            />
            <button
              type="button"
              onClick={addTag}
              className="ml-2 px-3 py-2 bg-blue-500 text-white rounded"
              disabled={tags.length >= 5 || newTag.length > 10}
            >
              +
            </button>
          </div>
            <p className="text-xs text-gray-500 mt-1 pb-1">
                Add up to 5 tags
            </p>
          {/* Submit Button */}
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded w-full">
            Save Tags
          </button>
        </form>
      </div>
    </div>
  );
}

