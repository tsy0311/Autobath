import React, { useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Gallery = () => {
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
            {"See the amazing transformations we've achieved"}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${
                filter === cat.id
                  ? 'bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-secondary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredImages.map(image => (
            <div
              key={image.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
              onClick={() => openLightbox(image)}
            >
              <div className="relative">
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary">
                  {"Before & After"}
                </div>
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="relative overflow-hidden">
                    <img
                      src={image.before}
                      alt={`${image.title} - ${"Before"}`}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {"Before"}
                    </div>
                  </div>
                  <div className="relative overflow-hidden">
                    <img
                      src={image.after}
                      alt={`${image.title} - ${"After"}`}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 right-2 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {"After"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-2">{image.title}</h3>
                <p className="text-gray-600">{image.description}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{"No images found"}</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-8 max-w-3xl mx-auto shadow-xl">
            <h3 className="text-3xl font-bold mb-4">{"Ready to Transform Your Vehicle?"}</h3>
            <p className="text-xl mb-6">{"Book your appointment today"}</p>
            <a href="/booking" className="btn bg-white text-primary hover:bg-gray-100 inline-block">
              {"Book Now"}
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-3xl hover:text-secondary transition-colors z-10"
          >
            <FaTimes />
          </button>
          
          <button
            onClick={() => navigate('prev')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-secondary transition-colors z-10"
          >
            <FaChevronLeft />
          </button>
          
          <button
            onClick={() => navigate('next')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-secondary transition-colors z-10"
          >
            <FaChevronRight />
          </button>

          <div className="max-w-6xl w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <img
                  src={selectedImage.before}
                  alt={"Before"}
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full font-semibold">
                  {"Before"}
                </div>
              </div>
              <div className="relative">
                <img
                  src={selectedImage.after}
                  alt={"After"}
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute bottom-4 right-4 bg-secondary text-white px-4 py-2 rounded-full font-semibold">
                  {"After"}
                </div>
              </div>
            </div>
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
              <p className="text-gray-300">{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;


