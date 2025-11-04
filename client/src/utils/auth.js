// Helper function to get auth token
// Uses sessionStorage instead of localStorage for better privacy
// (separate sessions for private/incognito windows)
export const getAuthToken = () => {
  return sessionStorage.getItem('token');
};

export const setAuthToken = (token) => {
  sessionStorage.setItem('token', token);
};

export const removeAuthToken = () => {
  sessionStorage.removeItem('token');
};
