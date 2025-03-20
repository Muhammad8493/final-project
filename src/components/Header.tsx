import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Sun,
  Moon,
  Menu as MenuIcon,
  X as XIcon,
  Search as SearchIcon,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  setUploadModalOpen: (value: boolean) => void;
  setImages: (images: any[]) => void;
  setLoading: (value: boolean) => void;
  setSearchTags: (tags: string[]) => void;
}

export default function Header({
  darkMode,
  setDarkMode,
  isLoggedIn,
  setIsLoggedIn,
  setUploadModalOpen,
  setImages,
  setLoading,
  setSearchTags,
}: HeaderProps) {
  const navigate = useNavigate();

  // Hide/show header on scroll
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [lastScrollY, setLastScrollY] = useState<number>(window.scrollY);

  // Search Bar State
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Mobile Menu Controls
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY || currentScrollY <= 0);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu if click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleUploadClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      setSearchValue("");
      setSearchTags([]);
    } else {
      setUploadModalOpen(true);
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
    setMobileMenuOpen(false);
    setSearchValue("");
    setSearchTags([]);
  };

  const clearSearch = () => {
    setSearchValue("");
    setSearchTags([]);
  };

  const handleSearch = async (): Promise<void> => {
    const tags = searchValue
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    if (tags.length === 0) return;

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => setSearchTags(tags), 100);
    } else {
      setIsSearching(true);
      setLoading(true);
      setSearchTags(tags);
      try {
        const res = await fetch(`/api/images?tags=${encodeURIComponent(tags.join(','))}`);
        if (!res.ok) throw new Error("Failed to fetch search results");

        const results = await res.json();
        setImages(results);
      } catch (error) {
        console.error("Error during search:", error);
      } finally {
        setIsSearching(false);
        setLoading(false);
      }
    } 
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
        style={{ '--header-height': '4rem' } as React.CSSProperties}
      >
        {/* LEFT: Home button and (desktop) Upload */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Link
            to="/"
            onClick={clearSearch}
            className="text-lg font-bold dark:text-white transition-transform transform hover:scale-110"
            aria-label="Home"
          >
            <Home className="w-7 h-7" />
          </Link>
          <button
            className="hidden md:block px-3 py-1 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-200 border-gray-300 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
            onClick={handleUploadClick}
            aria-label="Upload"
          >
            Upload
          </button>
        </div>

        {/* MIDDLE: Search Bar */}
        <div className="flex items-center relative mx-2 flex-grow max-w-full md:max-w-lg">
          <input
            type="search"
            placeholder="Search: Tag1, Tag2, ..."
            className="w-full p-2 pr-8 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-100 border-gray-300"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="absolute right-2 top-2">
            {isSearching ? <div className="animate-spin w-5 h-5 border-b-2 border-gray-500"></div> : <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 cursor-pointer" />}
          </button>
        </div>

        {/* RIGHT: Desktop Profile, Login/Logout, Dark Mode; Mobile Hamburger */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {isLoggedIn ? (
            <Link
              to="/profile"
              onClick={clearSearch}
              className="hidden md:block px-3 py-1 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-200 border-gray-300 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
              aria-label="Profile Page"
            >
              Profile
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={clearSearch}
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
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded bg-gray-200 dark:bg-gray-700 transition-transform transform hover:scale-110"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen((prev) => !prev);
            }}
            className="md:hidden p-2 rounded border dark:bg-gray-800 dark:border-gray-600 dark:text-white bg-gray-200 border-gray-300 transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
            aria-label="Mobile menu"
          >
            {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>
      
      {/* Mobile Menu: Upload, Profile, Login/Logout */}
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
      
      <div className="pt-16"></div>
    </>
  );
}
