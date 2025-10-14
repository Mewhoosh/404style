import { useState, useEffect } from 'react';
import { Check, Loader } from 'lucide-react';

export default function ThemeSelector() {
  const [themes, setThemes] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchThemes();
    fetchUserTheme();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/themes');
      if (response.ok) {
        const data = await response.json();
        setThemes(data);
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTheme = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/themes/user/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const theme = await response.json();
        setSelectedThemeId(theme.id);
        applyTheme(theme);
      }
    } catch (error) {
      console.error('Failed to fetch user theme:', error);
    }
  };

  const applyTheme = (theme) => {
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

  const handleSelectTheme = async (theme) => {
    setApplying(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/themes/user/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ themeId: theme.id })
      });

      if (response.ok) {
        setSelectedThemeId(theme.id);
        applyTheme(theme);
      }
    } catch (error) {
      console.error('Apply theme error:', error);
    } finally {
      setApplying(false);
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
      <div className="grid md:grid-cols-2 gap-6">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleSelectTheme(theme)}
            disabled={applying}
            className={`text-left border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
              selectedThemeId === theme.id
                ? 'border-secondary bg-secondary bg-opacity-5'
                : 'border-gray-200 hover:border-primary'
            } ${applying ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  {theme.name}
                  {theme.isDefault && (
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                      DEFAULT
                    </span>
                  )}
                </h3>
              </div>
              {selectedThemeId === theme.id && (
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Check className="text-primary" size={20} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Color Preview */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <div
                  className="h-12 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: theme.colorPrimary }}
                ></div>
                <p className="text-xs text-center text-text-secondary font-mono">
                  Primary
                </p>
              </div>
              <div className="space-y-1">
                <div
                  className="h-12 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: theme.colorSecondary }}
                ></div>
                <p className="text-xs text-center text-text-secondary font-mono">
                  Secondary
                </p>
              </div>
              <div className="space-y-1">
                <div
                  className="h-12 rounded-lg border-2 border-gray-200"
                  style={{ backgroundColor: theme.colorAccent }}
                ></div>
                <p className="text-xs text-center text-text-secondary font-mono">
                  Accent
                </p>
              </div>
            </div>

            {/* Selected indicator text */}
            {selectedThemeId === theme.id && (
              <p className="mt-3 text-sm font-semibold text-secondary text-center">
                ✓ Currently Active
              </p>
            )}
          </button>
        ))}
      </div>

      {themes.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          No themes available yet.
        </div>
      )}

      {applying && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex items-center gap-3">
            <Loader className="animate-spin text-secondary" size={24} />
            <span className="font-semibold text-primary">Applying theme...</span>
          </div>
        </div>
      )}
    </div>
  );
}