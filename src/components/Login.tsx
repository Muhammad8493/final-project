import React, { useState, FormEvent , JSX} from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  setIsLoggedIn: (value: boolean) => void;
  setUsername: (username: string) => void;
}

export default function Login({ setIsLoggedIn, setUsername }: LoginProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    const endpoint = isRegistering ? '/auth/register' : '/auth/login';
    const payload: any = { username: userInput, password };

    if (isRegistering) {
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        setLoading(false);
        return;
      }
      payload.confirmPassword = confirmPassword;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        setErrorMessage(errData.message || 'Error');
        setLoading(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      setUsername(userInput);
      setLoading(false);
      navigate('/');
    } catch (err) {
      setErrorMessage('An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto dark:text-white">
      <h2 className="text-2xl mb-4">{isRegistering ? 'Create New Account' : 'Login'}</h2>
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
        {isRegistering && (
          <div>
            <label className="block mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full p-2 border dark:bg-gray-800 dark:border-gray-600"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}
        {errorMessage && (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        )}
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : (
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        )}
      </form>
      <div className="mt-4 text-center">
        {isRegistering ? (
          <p>
            Already have an account?{' '}
            <button
              className="text-blue-500 underline"
              onClick={() => setIsRegistering(false)}
            >
              Login here
            </button>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <button
              className="text-blue-500 underline"
              onClick={() => setIsRegistering(true)}
            >
              Create New Account
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
