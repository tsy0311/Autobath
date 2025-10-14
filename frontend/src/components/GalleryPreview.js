import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const GalleryPreview = () => {
  
  const featuredWork = [
    {
      id: 1,
      before: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600',
      after: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
      titleKey: 'fullExteriorDetailing',
      categoryKey: 'exteriorCategory'
    },
    {
      id: 2,
      before: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600',
      after: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
      titleKey: 'interiorDeepClean',
      categoryKey: 'interiorCategory'
    },
    {
      id: 3,
      before: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600',
      after: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600',
      titleKey: 'paintCorrection',
      categoryKey: 'paintCategory'
    },
    {
      id: 4,
      before: 'https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?w=600',
      after: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600',
      titleKey: 'luxuryCarDetail',
      categoryKey: 'premiumCategory'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            {"Featured Work"}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {"See our amazing transformations"}
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredWork.map((work) => (
            <div
              key={work.id}
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Before/After Slider Effect */}
              <div className="relative h-80 overflow-hidden">
                {/* Before Image */}
                <div className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-0">
                  <img
                    src={work.before}
                    alt={`${work.title} - Before`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold inline-block">
                      {"Before"}
                    </div>
                  </div>
                </div>
                
                {/* After Image */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                  <img
                    src={work.after}
                    alt={`${work.title} - After`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="bg-secondary/90 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold inline-block">
                      {"After"} ✨
                    </div>
                  </div>
                </div>

                {/* Hover Instruction */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  {"Hover to see transformation"}
                </div>
              </div>

              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-bold text-lg">{work.title}</h3>
                <p className="text-white/80 text-sm">{work.category}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            {"View Full Gallery"}
            <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
          <p className="mt-4 text-gray-600">
            {"See All Transformations"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreview;

