import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Sun,
  Moon,
  Menu as MenuIcon,
  X as XIcon,
  Search as SearchIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header({
  darkMode,
  setDarkMode,
  isLoggedIn,
  setIsLoggedIn,
  setUploadModalOpen
}) {
  const navigate = useNavigate();

  // Hide/show header on scroll
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(typeof window !== 'undefined' ? window.scrollY : 0);

  // For the search input
  const [searchValue, setSearchValue] = useState('');

  // Controls the mobile hamburger menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ref to the mobile menu container for outside-click detection
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show header if scrolling up or at top, hide if scrolling down
      setIsVisible(currentScrollY < lastScrollY || currentScrollY <= 0);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu if click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Handle the upload button
  const handleUploadClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      setUploadModalOpen(true);
    }
    setMobileMenuOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 w-full z-50
          bg-white dark:bg-gray-900 shadow-md p-4 border-b dark:border-gray-700
          transition-transform duration-300 h-16
          flex items-center justify-between
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        `}
        style={{ '--header-height': '4rem' }}
      >
        {/* LEFT: Home button and (desktop) Upload */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Home button with hover scale */}
          <Link 
            to="/"
            className="text-lg font-bold dark:text-white transition-transform transform hover:scale-110"
            aria-label="Home"
          >
            <Home className="w-7 h-7" />
          </Link>

          {/* Upload button (desktop only) */}
          <button
            className="hidden md:block px-3 py-1 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-200 border-gray-300 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
            onClick={handleUploadClick}
            aria-label="Upload"
          >
            Upload
          </button>
        </div>

        {/* MIDDLE: Search Bar (always visible, shrinks on mobile) */}
        <div className="flex items-center relative mx-2 flex-grow max-w-full md:max-w-lg">
          <input
            type="search"
            placeholder="Search images..."
            className="w-full p-2 pr-8 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-100 border-gray-300"
            aria-label="Search images"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <div className="absolute right-2 top-2 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        {/* RIGHT: Profile, Login/Logout, Dark Mode, and Hamburger (mobile) */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Desktop Profile & Login/Logout */}
          {isLoggedIn ? (
            <Link
              to="/profile"
              className="hidden md:block px-3 py-1 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-200 border-gray-300 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
              aria-label="Profile Page"
            >
              Profile
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden md:block px-3 py-1 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-200 border-gray-300 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
              aria-label="Login Page"
            >
              Login
            </Link>
          )}

          {isLoggedIn && (
            <button 
              className="hidden md:block px-4 py-1 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-200 border-gray-300 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
              onClick={handleLogout}
              aria-label="Logout"
            >
              Logout
            </button>
          )}

          {/* Dark mode toggle with hover scale */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded bg-gray-200 dark:bg-gray-700 transition-transform transform hover:scale-110"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>

          {/* Hamburger menu (mobile) */}
          <button
            className="md:hidden p-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-200 border-gray-300 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Mobile menu"
          >
            {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU: Upload, Profile, Login/Logout */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed top-16 left-0 w-full bg-white dark:bg-gray-900 z-40 flex flex-col items-center space-y-2 p-4 border-b dark:border-gray-700 md:hidden"
        >
          <button
            onClick={handleUploadClick}
            className="w-full text-center px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-200 border-gray-300 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            Upload
          </button>

          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-200 border-gray-300 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-center px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-200 border-gray-300 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-3 py-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-200 border-gray-300 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
            >
              Login
            </Link>
          )}
        </div>
      )}

      {/* Spacer below the fixed header */}
      <div className="pt-16"></div>
    </>
  );
}
