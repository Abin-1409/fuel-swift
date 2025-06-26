'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

function NavBar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
      setFirstName(localStorage.getItem('firstName') || '');
    }
  }, [pathname]);

  const isActive = (path) => {
    return pathname === path ? 'bg-blue-700' : 'hover:bg-blue-600';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('firstName');
      setIsLoggedIn(false);
      window.location.href = '/';
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold">AutoNest</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link 
                href="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}
              >
                Home
              </Link>
              <Link 
                href="/service" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/service')}`}
              >
                Services
              </Link>
              {isLoggedIn && firstName && (
                <span className="px-3 py-2 rounded-md text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-md animate-fade-in">
                  Hi, {firstName}
                </span>
              )}
              {!isLoggedIn && (
                <>
                  <Link 
                    href="/login" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/login')}`}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/register')}`}
                  >
                    Register
                  </Link>
                  <Link 
                    href="/agent_registration" 
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-blue-400 text-white shadow-lg border-2 border-white/20 hover:from-purple-700 hover:to-blue-600 transition-all duration-200 scale-105 hover:scale-110"
                  >
                    <span className="inline-block text-lg">🛡️</span>
                    <span>Agent Register</span>
                  </Link>
                </>
              )}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} 
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            href="/" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/petrol_service" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/petrol_service')}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Petrol Service
          </Link>
          {!isLoggedIn && (
            <>
              <Link 
                href="/login" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/login')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/register')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
              <Link 
                href="/agent_registration" 
                className="flex items-center gap-2 block px-4 py-2 rounded-full text-base font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-blue-400 text-white shadow-lg border-2 border-white/20 hover:from-purple-700 hover:to-blue-600 transition-all duration-200 scale-105 hover:scale-110 mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="inline-block text-lg">🛡️</span>
                <span>Agent Register</span>
              </Link>
            </>
          )}
          {isLoggedIn && (
            <button
              onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-500 hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
