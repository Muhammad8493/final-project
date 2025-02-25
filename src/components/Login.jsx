import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setIsLoggedIn, setUsername }) {
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate verifying credentials (all credentials are accepted)
    setTimeout(() => {
      setIsLoggedIn(true);
      setUsername(userInput); // store the username given in login
      setLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="p-4 max-w-md mx-auto dark:text-white">
      <h2 className="text-2xl mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Username</label>
          <input
            type="text"
            className="w-full p-2 border dark:bg-gray-800 dark:border-gray-600"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            className="w-full p-2 border dark:bg-gray-800 dark:border-gray-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : (
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Login
          </button>
        )}
      </form>
    </div>
  );
}
