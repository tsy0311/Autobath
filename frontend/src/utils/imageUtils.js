// Utility function to get the correct image URL
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative URL starting with /img/, prepend the API base URL
  if (imageUrl.startsWith('/img/')) {
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    return `${apiBaseUrl}${imageUrl}`;
  }
  
  // For any other relative URL, prepend the API base URL
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  return `${apiBaseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
};

// Utility function to get the correct image URL for multiple images
export const getImageUrls = (images) => {
  if (!images || !Array.isArray(images)) return [];
  
  return images.map(image => ({
    ...image,
    image_url: getImageUrl(image.image_url)
  }));
};
