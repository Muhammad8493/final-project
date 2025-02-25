import React, { useState } from 'react';

export default function UploadModal({ onClose, onUpload }) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [useTemp, setUseTemp] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const newImage = {
        id: Date.now(),
        src: '/src/images/temp.webp', // Always use temp.webp
        alt: 'User upload',
        user: '', 
        downloads: 0,
        tags: ['user', 'upload'],
      };

      onUpload(newImage);
      setLoading(false);
      onClose();
    }, 1500);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]); // Store file for UI feedback
      setUseTemp(false); // Uncheck "Use temp.webp" if they pick a file
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 bg-opacity-50 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded relative w-96"
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
            <label className="block mb-2">Select a file (Will use Temp file for now)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-2 block w-full border border-gray-300 rounded p-2 dark:bg-gray-800 dark:border-gray-600"
              disabled={useTemp} // Disable file picker if "Use temp.webp" is checked
            />

            {/* Show selected file name (UI feedback only) */}
            {selectedFile && !useTemp && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Checkbox for using temp.webp */}
          <div className="flex items-center mb-4 dark:text-white">
            <input
              type="checkbox"
              id="useTemp"
              className="mr-2"
              checked={useTemp}
              onChange={() => {
                setUseTemp(!useTemp);
                setSelectedFile(null); // Clear selected file if "Use temp.webp" is checked
              }}
            />
            <label htmlFor="useTemp" className="cursor-pointer">
              Use <strong>temp.webp</strong>
            </label>
          </div>

          {/* Loading Spinner or Upload Button */}
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <button
              type="submit"
              className={`px-4 py-2 rounded w-full ${
                (selectedFile || useTemp) ? 'bg-blue-500 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
              }`}
              disabled={!selectedFile && !useTemp} // Prevent submission if nothing is selected
            >
              Upload
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
