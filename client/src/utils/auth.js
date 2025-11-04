// Helper function to get auth token
// Uses localStorage to persist across tabs and browser sessions
// Token persists until explicit logout
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};
