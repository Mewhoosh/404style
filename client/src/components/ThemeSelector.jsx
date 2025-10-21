import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Toast from './Toast';

export default function ThemeSelector() {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchThemes();
    fetchUserTheme();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchThemes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/themes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setThemes(data);
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
    }
  };

  const fetchUserTheme = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/themes/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedTheme(data.id);
      }
    } catch (error) {
      console.error('Failed to fetch user theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyThemeColors = (theme) => {
    
    document.documentElement.style.setProperty('--color-primary', theme.colorPrimary);
    document.documentElement.style.setProperty('--color-secondary', theme.colorSecondary);
    document.documentElement.style.setProperty('--color-accent', theme.colorAccent);
    console.log('🎨 Theme applied:', theme);
  };

  const handleSelectTheme = async (themeId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Save preference
      const response = await fetch('http://localhost:5000/api/themes/user/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ themeId })
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedTheme(themeId);
        
        
        applyThemeColors(data.theme);
        
        showToast('Theme applied!', 'success');
      } else {
        showToast('Failed to apply theme', 'error');
      }
    } catch (error) {
      console.error('Failed to apply theme:', error);
      showToast('Failed to apply theme', 'error');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-secondary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading themes...</p>
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {themes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">No themes available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {themes.map(theme => (
            <div
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedTheme === theme.id
                  ? 'border-secondary bg-secondary bg-opacity-10'
                  : 'border-gray-200 hover:border-primary'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-primary">{theme.name}</h4>
                {selectedTheme === theme.id && (
                  <Check className="text-secondary" size={20} />
                )}
              </div>
              <div className="flex gap-2">
                <div
                  className="w-10 h-10 rounded border-2 border-gray-300"
                  style={{ backgroundColor: theme.colorPrimary }}
                ></div>
                <div
                  className="w-10 h-10 rounded border-2 border-gray-300"
                  style={{ backgroundColor: theme.colorSecondary }}
                ></div>
                <div
                  className="w-10 h-10 rounded border-2 border-gray-300"
                  style={{ backgroundColor: theme.colorAccent }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}