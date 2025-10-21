import React, { useEffect } from 'react';

const Gallery = () => {
  // Redirect to Instagram gallery on load
  useEffect(() => {
    const instagramUrl = 'https://www.instagram.com/autobath_my';
    // Use replace to avoid back button loop
    window.location.replace(instagramUrl);
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container py-8 sm:py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            {"Our Gallery"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {"Redirecting to our Instagram gallery..."}
          </p>
          <div className="mt-6">
            <a
              href="https://www.instagram.com/autobath_my"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              {"Open Instagram Gallery"}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Gallery;


