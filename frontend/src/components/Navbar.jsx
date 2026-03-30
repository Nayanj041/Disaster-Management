"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useTheme } from "../context/ThemeContext";
import {
  Shield,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Home,
  User,
  Settings,
} from "lucide-react";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                DisasterPrep
              </span>
            </Link>
            <a
              href="https://opportunitycell.com/smart-india-hackathon-2022/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/sih25.png"
                alt="Smart India Hackathon 2022"
                className="h-8 w-auto animate-pulse"
              />
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>

            {!user ? (
              <>
                <Link
                  to="/"
                  className="text-gray-700 dark:text-gray-400 hover:text-primary-600 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link to="/login" className="btn-primary">
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-400 hover:text-primary-600 font-medium transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>

                <a
                  href="tel:112"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition duration-200"
                >
                  🚨 Emergency Call
                </a>

                <div className="flex items-center space-x-4 relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition"
                  >
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.name}
                    </span>
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                      {user.role}
                    </span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 top-full bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 min-w-48">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600"
                      >
                        <User className="h-5 w-5" />
                        <span>My Profile</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/drill-management"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600"
                        >
                          <Settings className="h-5 w-5" />
                          <span>Drill Management</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 w-full text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-400 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            {!user ? (
              <div className="space-y-2">
                <Link
                  to="/"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                    </div>
                  </div>
                </div>

                <a
                  href="tel:112"
                  className="block px-4 py-2 text-white bg-red-600 rounded-lg text-center font-semibold hover:bg-red-700 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🚨 Emergency Call
                </a>

                <Link
                  to="/dashboard"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/drill-management"
                    className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Drill Management</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
