import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Login from "./components/Login";
import Profile from "./components/Profile";
import UploadModal from "./components/UploadModal";
import { ImageData } from "./types";

function App() {
  // Dark mode toggle
  const [darkMode, setDarkMode] = useState<boolean>(false);
  // User authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  // Image gallery state
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Search state
  const [searchTags, setSearchTags] = useState<string[]>([]);
  // Upload modal control
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);

  // Fetch images from the backend, considering search tags
  useEffect(() => {
    setLoading(true);
    let url = "/api/images";

    if (searchTags.length > 0) {
      url += `?tags=${encodeURIComponent(searchTags.join(","))}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch images");
        }
        return res.json();
      })
      .then((data: ImageData[]) => {
        setImages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching images:", err);
        setLoading(false);
      });
  }, [searchTags]);

  // Handler for new uploaded image
  const handleAddImage = (newImage: ImageData) => {
    newImage.username = username;
    setImages((prev) => [newImage, ...prev]);
  };

  // If the "+" card is clicked in Gallery
  const handlePlusClick = (navigate: ReturnType<typeof useNavigate>) => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      setUploadModalOpen(true);
    }
  };

  // Handler for deleting an image
  const handleDeleteImage = (id: string) => {
    setImages((prevImages) => prevImages.filter((img) => img._id !== id));
  };

  return (
    <Router>
      <div className={darkMode ? "dark bg-slate-950 min-h-screen flex flex-col" : "bg-gray-500 min-h-screen flex flex-col"}>
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          setUploadModalOpen={setUploadModalOpen}
          setImages={setImages}
          setLoading={setLoading}
          setSearchTags={setSearchTags}
        />

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <Gallery
                  images={images}
                  loading={loading}
                  isLoggedIn={isLoggedIn}
                  handlePlusClick={handlePlusClick}
                  setImages={setImages}
                  setLoading={setLoading}
                  searchTags={searchTags}
                  setSearchTags={setSearchTags}
                />
              }
            />
            <Route
              path="/login"
              element={<Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />}
            />
            <Route
              path="/profile"
              element={
                isLoggedIn ? (
                  <Profile images={images} setImages={setImages} username={username} onDelete={handleDeleteImage} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            {/* Fallback route */}
            <Route
              path="*"
              element={
                <Gallery
                  images={images}
                  loading={loading}
                  isLoggedIn={isLoggedIn}
                  handlePlusClick={handlePlusClick}
                  setImages={setImages}
                  setLoading={setLoading}
                  searchTags={searchTags}
                  setSearchTags={setSearchTags}
                />
              }
            />
          </Routes>
        </main>

        <Footer />

        {uploadModalOpen && <UploadModal onClose={() => setUploadModalOpen(false)} onUpload={handleAddImage} />}
      </div>
    </Router>
  );
}

export default App;
