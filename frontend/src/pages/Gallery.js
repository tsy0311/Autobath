import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Gallery = () => {
  // Redirect to Instagram gallery on load
  useEffect(() => {
    const instagramUrl = 'https://www.instagram.com/autobath_my';
    // Use replace to avoid back button loop
    window.location.replace(instagramUrl);
  }, []);

  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all');

  const galleryImages = [
    {
      id: 1,
      before: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600',
      after: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
      category: 'exterior',
      titleKey: 'fullExteriorDetailing',
      descKey: 'fullExteriorDesc'
    },
    {
      id: 2,
      before: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600',
      after: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
      category: 'interior',
      titleKey: 'interiorDeepClean',
      descKey: 'interiorDeepCleanDesc'
    },
    {
      id: 3,
      before: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600',
      after: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600',
      category: 'paint',
      titleKey: 'paintCorrectionCeramic',
      descKey: 'paintCorrectionCeramicDesc'
    },
    {
      id: 4,
      before: 'https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?w=600',
      after: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600',
      category: 'exterior',
      titleKey: 'luxuryCarDetailing',
      descKey: 'luxuryCarDetailingDesc'
    },
    {
      id: 5,
      before: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600',
      after: 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=600',
      category: 'interior',
      titleKey: 'leatherTreatment',
      descKey: 'leatherTreatmentDesc'
    },
    {
      id: 6,
      before: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600',
      after: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600',
      category: 'paint',
      titleKey: 'paintProtectionFilm',
      descKey: 'paintProtectionFilmDesc'
    }
  ];

  const categories = [
    { id: 'all', labelKey: 'allWork' },
    { id: 'exterior', labelKey: 'exterior' },
    { id: 'interior', labelKey: 'interior' },
    { id: 'paint', labelKey: 'paintProtection' }
  ];

  const filteredImages = filter === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === filter);

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigate = (direction) => {
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredImages.length;
    } else {
      newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    }
    
    setSelectedImage(filteredImages[newIndex]);
  };

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


