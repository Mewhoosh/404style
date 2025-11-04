// Image URL helper - handles both external URLs and local uploads
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/400x300';
  
  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Local upload - add server prefix
  return `http://localhost:5000${imageUrl}`;
};
