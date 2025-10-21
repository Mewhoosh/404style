import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ThemeLoader() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadTheme();
  }, [isAuthenticated]);

  const loadTheme = async () => {
    try {
      let endpoint = 'http://localhost:5000/api/themes/default';
      const token = localStorage.getItem('token');

      // If logged in, try to get user's theme
      if (isAuthenticated() && token) {
        endpoint = 'http://localhost:5000/api/themes/user';
      }

      const response = await fetch(endpoint, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const theme = await response.json();
        console.log('🎨 Theme loaded:', theme);
        
        // Apply theme colors to CSS variables
        document.documentElement.style.setProperty('--color-primary', theme.colorPrimary);
        document.documentElement.style.setProperty('--color-secondary', theme.colorSecondary);
        document.documentElement.style.setProperty('--color-accent', theme.colorAccent);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  return null; // This component doesn't render anything
}