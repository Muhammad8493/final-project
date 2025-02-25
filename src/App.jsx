import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import Gallery from './components/Gallery';
import Login from './components/Login';
import Profile from './components/Profile';
import UploadModal from './components/UploadModal';

// ---- ALL IMAGES DEFINED IN THE PARENT ----
const allImages = [
  // Animal images (6)
  {
    id: 1,
    src: '/src/images/animal1.jpg',
    alt: 'Animal 1',
    user: 'WildlifeUser',
    downloads: 1200,
    tags: ['animal', 'wildlife', 'nature'],
  },
  {
    id: 2,
    src: '/src/images/animal2.jpg',
    alt: 'Animal 2',
    user: 'WildlifeUser',
    downloads: 980,
    tags: ['animal', 'zoo', 'nature'],
  },
  {
    id: 3,
    src: '/src/images/animal3.jpg',
    alt: 'Animal 3',
    user: 'WildlifeUser',
    downloads: 1500,
    tags: ['animal', 'safari', 'wild'],
  },
  {
    id: 4,
    src: '/src/images/animal4.jpg',
    alt: 'Animal 4',
    user: 'WildlifeUser',
    downloads: 2200,
    tags: ['animal', 'wild', 'nature'],
  },
  {
    id: 5,
    src: '/src/images/animal5.jpg',
    alt: 'Animal 5',
    user: 'WildlifeUser',
    downloads: 450,
    tags: ['animal', 'cute', 'wildlife'],
  },
  {
    id: 6,
    src: '/src/images/animal6.jpg',
    alt: 'Animal 6',
    user: 'WildlifeUser',
    downloads: 890,
    tags: ['animal', 'wild', 'nature'],
  },

  // City images (6)
  {
    id: 7,
    src: '/src/images/city1.jpg',
    alt: 'City 1',
    user: 'CityUser',
    downloads: 3000,
    tags: ['city', 'urban', 'buildings'],
  },
  {
    id: 8,
    src: '/src/images/city2.jpg',
    alt: 'City 2',
    user: 'CityUser',
    downloads: 2100,
    tags: ['city', 'night', 'skyscraper'],
  },
  {
    id: 9,
    src: '/src/images/city3.jpg',
    alt: 'City 3',
    user: 'CityUser',
    downloads: 1100,
    tags: ['city', 'downtown', 'urban'],
  },
  {
    id: 10,
    src: '/src/images/city4.jpg',
    alt: 'City 4',
    user: 'CityUser',
    downloads: 1600,
    tags: ['city', 'bridge', 'urban'],
  },
  {
    id: 11,
    src: '/src/images/city5.jpg',
    alt: 'City 5',
    user: 'CityUser',
    downloads: 2750,
    tags: ['city', 'tourism', 'architecture'],
  },
  {
    id: 12,
    src: '/src/images/city6.jpg',
    alt: 'City 6',
    user: 'CityUser',
    downloads: 800,
    tags: ['city', 'downtown', 'night'],
  },

  // Landscape images (5)
  {
    id: 13,
    src: '/src/images/landscape1.jpg',
    alt: 'Landscape 1',
    user: 'LandscapeUser',
    downloads: 1430,
    tags: ['landscape', 'mountains', 'scenic'],
  },
  {
    id: 14,
    src: '/src/images/landscape2.jpg',
    alt: 'Landscape 2',
    user: 'LandscapeUser',
    downloads: 2000,
    tags: ['landscape', 'forest', 'nature'],
  },
  {
    id: 15,
    src: '/src/images/landscape3.jpg',
    alt: 'Landscape 3',
    user: 'LandscapeUser',
    downloads: 300,
    tags: ['landscape', 'sunset', 'horizon'],
  },
  {
    id: 16,
    src: '/src/images/landscape4.jpg',
    alt: 'Landscape 4',
    user: 'LandscapeUser',
    downloads: 2400,
    tags: ['landscape', 'river', 'mountains'],
  },
  {
    id: 17,
    src: '/src/images/landscape5.jpg',
    alt: 'Landscape 5',
    user: 'LandscapeUser',
    downloads: 570,
    tags: ['landscape', 'hiking', 'nature'],
  },
];

// Simple shuffle helper (Durstenfeld)
function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function App() {
  // Dark mode toggle
  const [darkMode, setDarkMode] = useState(false);
  // Simulated login state and username (empty string when not logged in)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  // Main gallery images (initially empty until "fetched")
  const [images, setImages] = useState([]);
  // Loading state for the "fetch"
  const [loading, setLoading] = useState(true);
  // Control the upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Simulate "fetching" and randomizing images on mount
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const shuffled = shuffleArray(allImages);
      setImages(shuffled);
      setLoading(false);
    }, 1500);
  }, []);

  // Add a new image from UploadModal, using the current username
  const handleAddImage = (newImage) => {
    // Make sure the new image stores the logged-in username
    newImage.user = username;
    setImages((prev) => [newImage, ...prev]);
  };

  // If the "+" card is clicked in the Gallery
  const handlePlusClick = (navigate) => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      setUploadModalOpen(true);
    }
  };

  const handleDeleteImage = (id) => {
    setImages((prevImages) => prevImages.filter((img) => img.id !== id));
  };

  return (
    <Router>
      <div className={darkMode ? 'dark bg-gray-900 min-h-screen flex flex-col' : 'bg-gray-500 min-h-screen flex flex-col'}>
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          setUploadModalOpen={setUploadModalOpen}
        />

        {/* Main Content - Expands to push Footer down */}
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
                />
              }
            />
            <Route 
              path="/login"
              element={
                <Login
                  setIsLoggedIn={setIsLoggedIn}
                  setUsername={setUsername}
                />
              }
            />
            <Route 
              path="/profile"
              element={
                isLoggedIn
                  ? <Profile images={images} username={username} onDelete={handleDeleteImage} />
                  : <Navigate to="/login" />
              }
            />
          </Routes>
        </main>

        {/* Footer - Always stays at the bottom */}
        <Footer />

        {/* Upload Modal */}
        {uploadModalOpen && (
          <UploadModal
            onClose={() => setUploadModalOpen(false)}
            onUpload={handleAddImage}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
