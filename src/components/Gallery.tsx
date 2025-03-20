import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu as MenuIcon, X as XIcon } from "lucide-react";
import ImageModal from "./ImageModal";
import { ImageData } from "../types";

// Types for clarity
type FilterType = "date" | "size" | "downloads" | null;

interface GalleryProps {
  images: ImageData[];
  loading: boolean;
  isLoggedIn: boolean;
  handlePlusClick: (navigate: ReturnType<typeof useNavigate>) => void;
  setImages: (images: ImageData[]) => void;
  setLoading: (value: boolean) => void;
  searchTags: string[];
  setSearchTags: (tags: string[]) => void;
}

export default function Gallery({
  images,
  loading,
  isLoggedIn,
  handlePlusClick,
  setImages,
  setLoading,
  searchTags,
  setSearchTags,
}: GalleryProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Modal state
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  // Local loading (simulates spinner on route changes)
  const [localLoading, setLocalLoading] = useState<boolean>(loading);

  // Keep track of the currently active filter (both type & value)
  const [activeFilter, setActiveFilter] = useState<{ type: FilterType; value: string } | null>(null);

  // Dropdown management
  const [openDropdown, setOpenDropdown] = useState<FilterType>(null);
  const dropdownRefs = {
    date: useRef<HTMLDivElement>(null),
    size: useRef<HTMLDivElement>(null),
    downloads: useRef<HTMLDivElement>(null),
  };

  // Mobile filter menu toggles
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const mobileFilterRef = useRef<HTMLDivElement>(null);

  // For the mobile “Sort by Date” button
  const [mobileDateOpen, setMobileDateOpen] = useState(false);
  const mobileDateRef = useRef<HTMLDivElement>(null);

  // Close any open dropdown / mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown) {
        const ref = dropdownRefs[openDropdown];
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setOpenDropdown(null);
        }
      }
      if (mobileFilterOpen && mobileFilterRef.current && !mobileFilterRef.current.contains(e.target as Node)) {
        setMobileFilterOpen(false);
      }
      if (mobileDateOpen && mobileDateRef.current && !mobileDateRef.current.contains(e.target as Node)) {
        setMobileDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown, mobileFilterOpen, mobileDateOpen]);

  // Clear filters if user navigates away from "/"
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveFilter(null);
      setMobileFilterOpen(false);
      setOpenDropdown(null);
      setMobileDateOpen(false);
    }
  }, [location]);

  // Simulate local loading on route change
  useEffect(() => {
    setActiveFilter(null);
    setLocalLoading(true);
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [location]);

  // Handle open/close of a dropdown
  const handleDropdownToggle = (dropdown: FilterType) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Show/hide the selected image in a modal
  const handleImageClick = (img: ImageData) => setSelectedImage(img);
  const closeModal = () => setSelectedImage(null);

  // **Fix Clear Search**: Resets search without a page reload
  const clearSearch = () => {
    setSearchTags([]);
    // Optionally clear any active filters:
    setActiveFilter(null);
    navigate("/");
  };

    // **Reset filters & load all images**
  const clearFilters = async () => {
      setActiveFilter(null); // Reset filter state
      setLoading(true);
      try {
        const response = await fetch("/api/images"); // Fetch all images
        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }
        const allImages = await response.json();
        setImages(allImages);
      } catch (error) {
        console.error("Error resetting filters:", error);
      } finally {
        setLoading(false);
      }
    };


  const handleFilterChange = async (filterType: FilterType, filterValue: string) => {
    // Toggle off if same filter is chosen again
    if (activeFilter?.type === filterType && activeFilter?.value === filterValue) {
      setActiveFilter(null);
    } else {
      setActiveFilter({ type: filterType, value: filterValue });
    }
  
    // Build query params based on the selected filter.
    let queryParams = "";
    switch (filterType) {
      case "date":
        queryParams = `dateFilter=${filterValue}`;
        break;
      case "size":
        queryParams = `sizeFilter=${filterValue}`;
        break;
      case "downloads":
        queryParams = `downloadFilter=${filterValue}`;
        break;
      default:
        break;
    }
  
    setLoading(true);
    try {
      const response = await fetch(`/api/images?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch filtered images");
      }
      const filteredImages = await response.json();
      console.log("Filtered images response:", filteredImages);
      setImages(filteredImages);
    } catch (error) {
      console.error("Error fetching filtered images:", error);
    } finally {
      setLoading(false);
    }
  };

  // **Actual UI Render**
  return (
    <div className="p-4">
      <div className="max-w-[1400px] mx-auto">

        {/* SEARCH TAG RESULTS*/}
        {searchTags.length > 0 && (
          <div className="flex items-center bg-gray-200 dark:bg-gray-700 p-3 rounded-md mb-4 max-w-[400px]">
            <button
              onClick={clearSearch}
              className="text-red-500 font-semibold transition-all hover:font-bold"
            >
              Clear
            </button>
            <span className="mx-3 text-gray-700 dark:text-gray-200">
              {images.length === 0
                ? `No results for: ${searchTags.join(", ")}`
                : `Results: ${searchTags.join(", ")}`
              }
            </span>
          </div>
        )}

        {/* LOADING SPINNER */}
        {localLoading || loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-gray-900 dark:border-white"></div>
          </div>
        ) : (
          <>
            {/* Show filters only if there's no active search (optional) */}
            {searchTags.length === 0 && (
              <>
                {/* DESKTOP FILTER ROW*/}
                <div className="hidden md:flex flex-wrap gap-2 mb-4">
                  {/* Date Filter */}
                  <div className="relative" ref={dropdownRefs.date}>
                    <button
                      className={`px-4 py-2 rounded border dark:border-gray-600 transition-colors 
                        ${
                          activeFilter?.type === "date"
                            ? "bg-blue-700 text-white hover:bg-blue-800"
                            : "bg-gray-300 dark:bg-gray-800 dark:text-white"
                        }
                      `}
                      onClick={() =>
                        handleDropdownToggle(openDropdown === "date" ? null : "date")
                      }
                    >
                      {activeFilter?.type === "date"
                        ? activeFilter.value
                        : "Sort by Date"}
                    </button>
                    {openDropdown === "date" && (
                      <div className="absolute text-white left-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg w-48 z-10">
                        {["Today", "Last Week", "Last Month", "Last Year", "Oldest", "Newest"].map(
                          (option) => (
                            <div
                              key={option}
                              className="p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700"
                              onClick={() => {
                                setOpenDropdown(null);
                                handleFilterChange("date", option);
                              }}
                            >
                              {option}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Size Filter */}
                  <div className="relative" ref={dropdownRefs.size}>
                    <button
                      className={`px-4 py-2 rounded border dark:border-gray-600 transition-colors
                        ${
                          activeFilter?.type === "size"
                          ? "bg-blue-700 text-white hover:bg-blue-800"
                          : "bg-gray-300 dark:bg-gray-800 dark:text-white"
                        }
                      `}
                      onClick={() =>
                        handleDropdownToggle(openDropdown === "size" ? null : "size")
                      }
                    >
                      {activeFilter?.type === "size"
                        ? activeFilter.value
                        : "Sort by Size"}
                    </button>
                    {openDropdown === "size" && (
                      <div className="absolute left-0 mt-2 text-white bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg w-48 z-10">
                        {["Smallest", "Largest", "< 250kb", "< 500kb", "< 750kb"].map((option) => (
                          <div
                            key={option}
                            className="p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700"
                            onClick={() => {
                              setOpenDropdown(null);
                              handleFilterChange("size", option);
                            }}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Downloads Filter */}
                  <div className="relative" ref={dropdownRefs.downloads}>
                    <button
                      className={`px-4 py-2 rounded border dark:border-gray-600 transition-colors
                        ${
                          activeFilter?.type === "downloads"
                          ? "bg-blue-700 text-white hover:bg-blue-800"
                          : "bg-gray-300 dark:bg-gray-800 dark:text-white"
                        }
                      `}
                      onClick={() =>
                        handleDropdownToggle(
                          openDropdown === "downloads" ? null : "downloads"
                        )
                      }
                    >
                      {activeFilter?.type === "downloads"
                        ? activeFilter.value
                        : "Sort by Downloads"}
                    </button>
                    {openDropdown === "downloads" && (
                      <div className="absolute left-0 mt-2 text-white bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg w-48 z-10">
                        {["Least ↓", "Most ↓"].map((option) => (
                          <div
                            key={option}
                            className="p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700"
                            onClick={() => {
                              setOpenDropdown(null);
                              handleFilterChange("downloads", option);
                            }}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                    {activeFilter && (
                      <div className="mb-4">
                        <button
                          onClick={clearFilters}
                          className="bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                </div>

                {/* MOBILE FILTER ROW */}
                <div className="md:hidden flex items-center justify-between mb-4">
                  {/* Mobile "Sort by Date" button & Clear Filter (X) */}
                  <div className="flex items-center space-x-2">
                    <div className="relative" ref={mobileDateRef}>
                      <button
                        className={`px-4 py-2 rounded border dark:border-gray-600 transition-colors
                          ${
                            activeFilter?.type === "date"
                              ? "bg-blue-700 text-white hover:bg-blue-800"
                              : "bg-gray-300 dark:bg-gray-800 dark:text-white"
                          }
                        `}
                        onClick={() => setMobileDateOpen((prev) => !prev)}
                      >
                        {activeFilter?.type === "date"
                          ? activeFilter.value
                          : "Sort by Date"}
                      </button>
                      {mobileDateOpen && (
                        <div className="absolute left-0 mt-2 text-white bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg w-48 z-10">
                          {["Today", "Last Week", "Last Month", "Last Year", "Oldest", "Newest"].map(
                            (option) => (
                              <div
                                key={option}
                                className="p-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700"
                                onClick={() => {
                                  setMobileDateOpen(false);
                                  handleFilterChange("date", option);
                                }}
                              >
                                {option}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* "X" Button (Clear Filter) */}
                    {activeFilter && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center justify-center bg-red-700 text-white px-3 py-2 rounded-md hover:bg-red-800 transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Upload (+) and "Menu" button on mobile */}
                  <div className="flex items-center space-x-2">
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
                      {mobileFilterOpen ? (
                        <XIcon className="w-6 h-6 text-gray-700 dark:text-white" />
                      ) : (
                        <MenuIcon className="w-6 h-6 text-gray-700 dark:text-white" />
                      )}
                    </button>
                  </div>
                </div>


                {/* Mobile Additional Filters Menu (size / downloads) */}
                {mobileFilterOpen && (
                  <div
                    ref={mobileFilterRef}
                    className="md:hidden mb-4 p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  >
                    {/* Size filter buttons */}
                    <div className="mb-2">
                      <p className="font-semibold mb-1 dark:text-white">Size:</p>
                      {["Smallest", "Largest", "< 250kb", "< 500kb", "< 750kb"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            handleFilterChange("size", option);
                            setMobileFilterOpen(false);
                          }}
                          className={`px-2 py-1 border rounded mr-2 mb-1 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700
                            ${
                              activeFilter?.type === "size" && activeFilter.value === option
                              ? "bg-blue-700 text-white hover:bg-blue-800"
                              : "bg-gray-400 dark:bg-gray-600 text-white"
                            }
                          `}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {/* Downloads filter buttons */}
                    <div>
                      <p className="font-semibold mb-1 dark:text-white">Downloads:</p>
                      {["Least ↓", "Most ↓"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            handleFilterChange("downloads", option);
                            setMobileFilterOpen(false); 
                          }}
                          className={`px-2 py-1 border rounded mr-2 mb-1 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700
                            ${
                              activeFilter?.type === "downloads" && activeFilter.value === option
                              ? "bg-blue-700 text-white hover:bg-blue-800"
                              : "bg-gray-400 dark:bg-gray-600 text-white"
                            }
                          `}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* RESPONSIVE GALLERY GRID  */}
            <div className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* The "+ Upload" tile, only on md+ */}
              <div className="hidden md:block">
                <div
                  className="border border-dashed border-gray-300 dark:border-white h-72 flex items-center justify-center text-9xl text-gray-500 dark:text-white cursor-pointer"
                  aria-label="Upload a new image"
                  onClick={() => handlePlusClick(navigate)}
                >
                  +
                </div>
              </div>

              {images.map((img) => (
                <div
                  key={img._id}
                  className="border rounded overflow-hidden shadow hover:shadow-lg transition-shadow dark:border-gray-600 dark:bg-gray-800 cursor-pointer"
                  onClick={() => handleImageClick(img)}
                >
                  <img
                    src={img.src}
                    alt={img.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Photo by{" "}
                      <span className="font-semibold">{img.username}</span>
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
          </>
        )}
      </div>

      {/* IMAGE MODAL (if any) */}
      {selectedImage && <ImageModal image={selectedImage} closeModal={() => setSelectedImage(null)} />}
    </div>
  );
}
