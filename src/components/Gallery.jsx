import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X as XIcon } from 'lucide-react';
import ImageModal from './ImageModal';

export default function Gallery({ images, handlePlusClick }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedDate, setSelectedDate] = useState('Sort by Date');
  const [selectedSize, setSelectedSize] = useState('Sort by Size');
  const [selectedDownloads, setSelectedDownloads] = useState('Sort by Downloads');

  // Desktop dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);

  // Refs for desktop dropdown containers
  const dropdownRefs = {
    date: useRef(null),
    size: useRef(null),
    downloads: useRef(null),
  };

  // Mobile filter menu state and ref for outside click
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const mobileFilterRef = useRef(null);

  // Mobile "Sort by Date" dropdown state and ref
  const [mobileDateOpen, setMobileDateOpen] = useState(false);
  const mobileDateRef = useRef(null);

  // 1) Close any open desktop/mobile dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Desktop dropdown
      if (openDropdown) {
        const ref = dropdownRefs[openDropdown];
        if (ref.current && !ref.current.contains(e.target)) {
          setOpenDropdown(null);
        }
      }
      // Mobile date dropdown
      if (mobileDateOpen) {
        if (mobileDateRef.current && !mobileDateRef.current.contains(e.target)) {
          setMobileDateOpen(false);
        }
      }
      // Mobile additional filters menu
      if (mobileFilterOpen) {
        if (mobileFilterRef.current && !mobileFilterRef.current.contains(e.target)) {
          setMobileFilterOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown, mobileDateOpen, mobileFilterOpen]);

  // 2) If user leaves the home page, clear all filters
  useEffect(() => {
    if (location.pathname !== '/') {
      setSelectedDate('Sort by Date');
      setSelectedSize('Sort by Size');
      setSelectedDownloads('Sort by Downloads');
      setMobileFilterOpen(false);
      setOpenDropdown(null);
      setMobileDateOpen(false);
    }
  }, [location]);
  
  
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [location]);


  // Desktop toggle function for dropdowns
  const handleDropdownToggle = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // On image click open modal
  const handleImageClick = (img) => {
    setSelectedImage(img);
  };
  const closeModal = () => {
    setSelectedImage(null);
  };

  // Loading spinner while "fetching"
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Desktop Filter Row */}
        <div className="hidden md:flex flex-wrap gap-2 mb-4">
          {/* Sort by Date */}
          <div className="relative" ref={dropdownRefs.date}>
            <button
              className="px-4 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-300 border-gray-400 flex items-center transition-colors hover:bg-gray-400 dark:hover:bg-gray-700"
              onClick={() => handleDropdownToggle("date")}
            >
              {selectedDate}
              <span className="ml-2">&#9662;</span>
            </button>
            {openDropdown === "date" && (
              <div className="absolute left-0 text-white mt-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg w-48 z-10">
                {["Today", "Last Week", "Last Month", "Last Year", "Oldest", "Newest"].map((option) => (
                  <div
                    key={option}
                    className="p-2 cursor-pointer transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSelectedDate(option);
                      setOpenDropdown(null);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort by Size */}
          <div className="relative" ref={dropdownRefs.size}>
            <button
              className="px-4 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-300 border-gray-400 flex items-center transition-colors hover:bg-gray-400 dark:hover:bg-gray-700"
              onClick={() => handleDropdownToggle("size")}
            >
              {selectedSize}
              <span className="ml-2">&#9662;</span>
            </button>
            {openDropdown === "size" && (
              <div className="absolute left-0 text-white mt-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg w-48 z-10">
                {["Smallest", "Largest", ">1mb", ">5mb", ">10mb"].map((option) => (
                  <div
                    key={option}
                    className="p-2 cursor-pointer transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSelectedSize(option);
                      setOpenDropdown(null);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort by Downloads */}
          <div className="relative" ref={dropdownRefs.downloads}>
            <button
              className="px-4 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-300 border-gray-400 flex items-center transition-colors hover:bg-gray-400 dark:hover:bg-gray-700"
              onClick={() => handleDropdownToggle("downloads")}
            >
              {selectedDownloads}
              <span className="ml-2">&#9662;</span>
            </button>
            {openDropdown === "downloads" && (
              <div className="absolute left-0 mt-2 text-white bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg w-48 z-10">
                {["Least ↓", "Most ↓"].map((option) => (
                  <div
                    key={option}
                    className="p-2 cursor-pointer transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSelectedDownloads(option);
                      setOpenDropdown(null);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Row */}
        <div className="md:hidden flex items-center justify-between mb-4">
          {/* Mobile Sort by Date dropdown */}
          <div className="relative" ref={mobileDateRef}>
            <button
              className="px-4 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-300 border-gray-400 flex items-center transition-colors hover:bg-gray-400 dark:hover:bg-gray-700"
              onClick={() => setMobileDateOpen(!mobileDateOpen)}
            >
              {selectedDate}
              <span className="ml-2">&#9662;</span>
            </button>
            {mobileDateOpen && (
              <div className="absolute left-0 mt-2 text-white bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg w-48 z-10">
                {["Today", "Last Week", "Last Month", "Last Year", "Oldest", "Newest"].map((option) => (
                  <div
                    key={option}
                    className={`p-2 cursor-pointer transition-colors hover:bg-gray-300 dark:hover:bg-gray-700 ${selectedDate === option ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
                    onClick={() => {
                      setSelectedDate(option);
                      setMobileDateOpen(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* The plus icon with no dashed outline on mobile */}
            <button
              onClick={() => handlePlusClick(navigate)}
              className="flex items-center justify-center text-3xl font-bold text-gray-500 dark:text-white"
              aria-label="Upload"
            >
              +
            </button>
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="p-2 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700 rounded"
              aria-label="More filters"
            >
              {mobileFilterOpen ? <XIcon className="w-6 h-6 text-gray-700 dark:text-white" /> : <MenuIcon className="w-6 h-6 text-gray-700 dark:text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Additional Filters Menu */}
        {mobileFilterOpen && (
          <div ref={mobileFilterRef} className="md:hidden mb-4 p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800">
            {/* Sort by Size */}
            <div className="mb-2">
              <p className="font-semibold mb-1 text-white dark:text-white">Size:</p>
              {["Smallest", "Largest", ">1mb", ">5mb", ">10mb"].map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedSize(option)}
                  className={`
                    px-2 py-1 border rounded mr-2 mb-1 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700 text-white
                    ${selectedSize === option ? 'bg-gray-500 dark:bg-gray-600' : ''}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
            {/* Sort by Downloads */}
            <div>
              <p className="font-semibold mb-1 dark:text-white">Downloads:</p>
              {["Least ↓", "Most ↓"].map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedDownloads(option)}
                  className={`
                    px-2 py-1 border rounded text-white mr-2 mb-1 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700 text-white
                    ${selectedDownloads === option ? 'bg-gray-300 dark:bg-gray-600' : ''}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Grid with responsive columns:
            - Default (below ~450px): 1 column
            - Custom breakpoint "xs" for ~450px: 2 columns (assumes you've defined "xs" in your Tailwind config)
            - md: 3 columns
            - lg: 4 columns */}
        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" >
          {/* Desktop only: The + card in first cell */}
          <div className="hidden md:block">
            <div
              className="border border-dashed border-gray-300 h-72 dark:border-white flex items-center justify-center text-9xl text-gray-500 dark:text-white cursor-pointer"
              aria-label="Upload a new image"
              onClick={() => handlePlusClick(navigate)}
            >
              +
            </div>
          </div>

          {/* Render image cards */}
          {images.map((img) => (
            <div
              key={img.id}
              className="border rounded overflow-hidden shadow hover:shadow-lg transition-shadow dark:border-gray-600 dark:bg-gray-800 cursor-pointer"
              onClick={() => handleImageClick(img)}
            >
              <img src={img.src} alt={img.alt} className="w-full h-48 object-cover" />
              <div className="p-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Photo by <span className="font-semibold">{img.user}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Downloads: {img.downloads}</p>
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
      </div>

      {/* Modal for enlarged image view */}
      {selectedImage && <ImageModal image={selectedImage} closeModal={closeModal} />}
    </div>
  );
}
