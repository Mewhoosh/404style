import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Apply theme to DOM
  const applyTheme = (theme) => {
    if (!theme) return;
    
    document.documentElement.style.setProperty('--color-primary', theme.colorPrimary);
    document.documentElement.style.setProperty('--color-secondary', theme.colorSecondary);
    document.documentElement.style.setProperty('--color-accent', theme.colorAccent);

    // Calculate derived colors
    const primaryLight = adjustColor(theme.colorPrimary, 30);
    const primaryDark = adjustColor(theme.colorPrimary, -30);
    const secondaryLight = adjustColor(theme.colorSecondary, 30);
    const secondaryDark = adjustColor(theme.colorSecondary, -30);
    
    document.documentElement.style.setProperty('--color-primary-light', primaryLight);
    document.documentElement.style.setProperty('--color-primary-dark', primaryDark);
    document.documentElement.style.setProperty('--color-secondary-light', secondaryLight);
    document.documentElement.style.setProperty('--color-secondary-dark', secondaryDark);
  };

  const adjustColor = (color, percent) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  // Load default theme
  const loadDefaultTheme = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/themes');
      if (response.ok) {
        const themes = await response.json();
        const defaultTheme = themes.find(t => t.isDefault);
        if (defaultTheme) {
          applyTheme(defaultTheme);
        }
      }
    } catch (error) {
      console.error('Failed to load default theme:', error);
    }
  };

  // Load user theme
  const loadUserTheme = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/themes/user/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const theme = await response.json();
        applyTheme(theme);
      } else {
        loadDefaultTheme();
      }
    } catch (error) {
      console.error('Failed to load user theme:', error);
      loadDefaultTheme();
    }
  };

  // Load user from API on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = sessionStorage.getItem('token');

      if (!token) {
        // No token - load default theme
        await loadDefaultTheme();
        setLoading(false);
        return;
      }

      try {
        // Fetch fresh user data from API
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          sessionStorage.setItem('user', JSON.stringify(data.user));
          
          // Load user's theme
          await loadUserTheme(token);
        } else {
          // Token invalid, clear everything and load default theme
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          await loadDefaultTheme();
        }
      } catch (error) {
        console.error('Load user error:', error);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        await loadDefaultTheme();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (userData, token) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    // Load user's theme after login
    await loadUserTheme(token);
  };

  const logout = async () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('savedEmail'); // Email można zostawić w localStorage
    setUser(null);
    
    // Reset to default theme after logout
    await loadDefaultTheme();
    
    navigate('/');
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};