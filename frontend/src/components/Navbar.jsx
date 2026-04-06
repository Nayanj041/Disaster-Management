"use client";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  BellRing,
  Sparkles,
} from "lucide-react";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/80 bg-card/88 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 md:px-6 lg:pl-[18.5rem] lg:pr-8">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-base font-semibold text-foreground md:text-lg">
                DisasterPrep OS
              </span>
              <span className="hidden text-xs text-muted-foreground md:block">
                Preparedness intelligence for communities
              </span>
            </div>
          </Link>
          <a href="https://opportunitycell.com/smart-india-hackathon-2022/" target="_blank" rel="noopener noreferrer" className="hidden lg:block">
            <div className="rounded-full border border-border/70 bg-secondary/55 px-3 py-1 text-xs font-medium text-secondary-foreground">
              SIH 2022 Showcase
            </div>
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleDarkMode}
            className="rounded-xl border border-border/70 bg-card p-2.5 text-muted-foreground transition hover:text-foreground"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {!user ? (
            <>
              <Link to="/" className="btn-secondary">
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
                className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-secondary/40 px-3.5 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-secondary"
              >
                <Home className="h-4 w-4" />
                Workspace
              </Link>

              <a
                href="tel:112"
                className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-destructive/90"
              >
                <BellRing className="h-4 w-4" />
                Emergency 112
              </a>

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-2.5 py-1.5 text-left transition hover:border-primary/35"
                >
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
                  />
                  <div className="max-w-[130px]">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-xs capitalize text-muted-foreground">
                      {user.role}
                    </p>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] min-w-56 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground transition hover:bg-secondary/65"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/drill-management"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 border-y border-border/65 px-4 py-3 text-sm text-foreground transition hover:bg-secondary/65"
                      >
                        <Settings className="h-4 w-4" />
                        Drill Management
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleDarkMode}
            className="rounded-xl border border-border/70 bg-card p-2 text-muted-foreground transition hover:text-foreground"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-xl border border-border/70 bg-card p-2 text-foreground transition hover:border-primary/35"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border/75 bg-card/95 px-4 py-4 md:hidden">
          {!user ? (
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/login"
                className="btn-primary w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-xl border border-border/70 bg-secondary/45 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="h-9 w-9 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
                  </div>
                </div>
              </div>

              <a
                href="tel:112"
                className="flex items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                <BellRing className="h-4 w-4" />
                Emergency 112
              </a>

              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                Workspace
              </Link>

              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>

              {isAdmin && (
                <Link
                  to="/drill-management"
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Drill Management
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>

              <div className="rounded-xl bg-secondary/35 px-3 py-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Tip:
                </span>{" "}
                Keep emergency contacts and alert channels updated weekly.
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
