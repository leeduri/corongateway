import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PostProvider } from './contexts/PostContext';
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import Header from './components/layout/Header';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PostProvider>
        <ToastProvider>
          <HashRouter>
            <Main />
          </HashRouter>
        </ToastProvider>
      </PostProvider>
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user } = useAuth();

  // Conditionally apply background color only when logged in
  const backgroundClasses = user ? 'bg-gray-50 dark:bg-gray-900' : '';

  return (
    <div className={`min-h-screen text-gray-900 dark:text-gray-100 ${backgroundClasses}`}>
      {user && <Header />}
      <main className={`${user ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </main>
    </div>
  );
};

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};


export default App;