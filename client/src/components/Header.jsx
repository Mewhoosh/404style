import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-primary text-accent sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-5">
          {/* Logo */}
          <Link to="/" className="group">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tighter text-accent group-hover:text-secondary transition-colors">
                404
              </span>
              <span className="text-2xl font-light text-secondary group-hover:text-accent transition-colors">
                STYLE
              </span>
              <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-150 transition-transform"></div>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-12">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full px-6 py-3 rounded-full bg-primary-light text-accent placeholder-text-light border-2 border-transparent focus:border-secondary focus:outline-none transition-all"
              />
              <Search 
                className="absolute right-5 top-3.5 text-secondary group-hover:scale-110 transition-transform" 
                size={22} 
              />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-6">
            {/* User Menu */}
            {isAuthenticated() ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:text-secondary transition-colors"
                >
                  <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center font-bold text-primary">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <span className="hidden md:block font-medium">
                    {user?.firstName}
                  </span>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden animate-slide-left">
                    <div className="p-4 bg-gradient-to-r from-primary to-secondary text-accent">
                      <p className="font-bold text-lg">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm opacity-80">{user?.email}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-secondary text-primary text-xs font-bold rounded-full">
                        {user?.role?.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="p-2">
                      {/* Dashboard (admin/moderator only) */}
                      {(user?.role === 'admin' || user?.role === 'moderator') && (
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-primary hover:bg-gray-100 rounded-lg transition-all"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={20} />
                          <span className="font-medium">Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-primary hover:bg-gray-100 rounded-lg transition-all"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={20} />
                        <span className="font-medium">Profile Settings</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login" 
                className="hover:text-secondary transition-colors hover:scale-110 transform flex items-center gap-2"
              >
                <User size={26} strokeWidth={1.5} />
                <span className="hidden md:block font-medium"></span>
                {/* <span className="hidden md:block font-medium">Login</span> */}
              </Link>
            )}

            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative hover:text-secondary transition-colors hover:scale-110 transform group"
            >
              <ShoppingCart size={26} strokeWidth={1.5} />
              <span className="absolute -top-2 -right-2 bg-secondary text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold group-hover:scale-125 transition-transform">
                3
              </span>
            </Link>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden hover:text-secondary transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:block border-t border-primary-light py-4">
          <ul className="flex gap-10 text-sm font-medium tracking-wide">
            <li>
              <Link to="/" className="hover:text-secondary transition-colors relative group">
                HOME
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all"></span>
              </Link>
            </li>
            <li>
              <Link to="/men" className="hover:text-secondary transition-colors relative group">
                MEN
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all"></span>
              </Link>
            </li>
            <li>
              <Link to="/women" className="hover:text-secondary transition-colors relative group">
                WOMEN
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all"></span>
              </Link>
            </li>
            <li>
              <Link to="/accessories" className="hover:text-secondary transition-colors relative group">
                ACCESSORIES
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all"></span>
              </Link>
            </li>
            <li className="ml-auto">
              <Link to="/sale" className="text-secondary font-bold hover:text-secondary-light transition-colors">
                SALE -50%
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-primary-light animate-slide-left">
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/" className="block hover:text-secondary transition-colors">HOME</Link></li>
              <li><Link to="/men" className="block hover:text-secondary transition-colors">MEN</Link></li>
              <li><Link to="/women" className="block hover:text-secondary transition-colors">WOMEN</Link></li>
              <li><Link to="/accessories" className="block hover:text-secondary transition-colors">ACCESSORIES</Link></li>
              <li><Link to="/sale" className="block text-secondary font-bold">SALE -50%</Link></li>
              
              {isAuthenticated() && (
                <>
                  {(user?.role === 'admin' || user?.role === 'moderator') && (
                    <li className="border-t border-primary-light pt-4 mt-4">
                      <Link to="/dashboard" className="block hover:text-secondary transition-colors">
                        Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/profile" className="block hover:text-secondary transition-colors">
                      Profile Settings
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={logout}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}