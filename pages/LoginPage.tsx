
import React, { Suspense, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';

const PinkSky = React.lazy(() => import('../components/three/PinkSky'));

const LoginPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('bret');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const { login, signup, isLoading } = useAuth();

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setEmail('');
    setUsername(isLoginView ? '' : 'bret');
    setPassword(isLoginView ? '' : 'password123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLoginView) {
      if (!username || !password) {
        setError('Username and password are required.');
        return;
      }
    } else {
      if (!email || !username || !password) {
        setError('All fields are required for sign up.');
        return;
      }
    }

    try {
      if (isLoginView) {
        await login(username, password);
      } else {
        await signup(email, username, password);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setPopupMessage(isLoginView ? 'Invalid username or password.' : `Signup failed: ${message}`);
      setPopupOpen(true);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center text-white">
        <Suspense fallback={<div className="absolute inset-0 bg-black" />}>
          <PinkSky />
        </Suspense>

        <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-black bg-opacity-40 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-pink-400">CoronGateway X bar</h1>
            <p className="mt-2 text-gray-300">{isLoginView ? 'Log in to your account' : 'Create a new account'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoginView && (
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            )}
            <Input
              label="Username"
              type="text"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? <Spinner /> : (isLoginView ? 'Log In' : 'Sign Up')}
            </Button>

            <p className="text-center text-sm text-gray-400">
              {isLoginView ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={toggleView} className="font-semibold text-pink-400 hover:underline focus:outline-none">
                {isLoginView ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </form>
        </div>
      </div>
      <Modal isOpen={isPopupOpen} onClose={() => setPopupOpen(false)} title={isLoginView ? "Login Error" : "Sign Up Error"}>
        <p>{popupMessage}</p>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setPopupOpen(false)}>Close</Button>
        </div>
      </Modal>
    </>
  );
};

export default LoginPage;