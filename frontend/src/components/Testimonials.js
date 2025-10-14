import React, { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: 'Ahmad Rahman',
      rating: 5,
      comment: 'Exceptional service! My car looks brand new after the Premium Package. The team was professional and paid attention to every detail. Highly recommended!',
      service: 'Premium Package',
      date: '2 weeks ago'
    },
    {
      id: 2,
      name: 'Sarah Lee',
      rating: 5,
      comment: 'Best car detailing experience ever! The ceramic coating they applied is amazing. Water just beads off now. Worth every ringgit!',
      service: 'Ultra Package',
      date: '1 month ago'
    },
    {
      id: 3,
      name: 'David Tan',
      rating: 5,
      comment: 'Quick and efficient! Used the quick booking link and it was so convenient. The interior deep clean removed stains I thought were permanent. Will definitely be back!',
      service: 'Interior Detailing',
      date: '3 days ago'
    },
    {
      id: 4,
      name: 'Priya Kumar',
      rating: 5,
      comment: 'Outstanding work! The paint correction service brought back the shine on my 5-year-old car. Looks like it just came from the showroom. Fantastic job!',
      service: 'Paint Correction',
      date: '2 weeks ago'
    },
    {
      id: 5,
      name: 'John Lim',
      rating: 5,
      comment: 'Professional, friendly, and thorough. They came to my office and detailed my truck while I worked. Super convenient and the results are impressive!',
      service: 'Basic Package',
      date: '1 week ago'
    },
    {
      id: 6,
      name: 'Michelle Wong',
      rating: 5,
      comment: 'Amazing service! The team was punctual, courteous, and did an incredible job. My SUV has never looked this good. The pricing is very fair too!',
      service: 'Premium Package',
      date: '4 days ago'
    }
  ];

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1 justify-center mb-4">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-secondary to-secondary-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        {/* Carousel */}
        <div className="max-w-4xl mx-auto relative">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 min-h-[350px] flex flex-col justify-center">
            <FaQuoteLeft className="text-5xl text-secondary/20 mb-6" />
            
            {renderStars(testimonials[currentIndex].rating)}
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed text-center italic">
              "{testimonials[currentIndex].comment}"
            </p>
            
            <div className="text-center">
              <h4 className="text-2xl font-bold text-primary mb-2">
                {testimonials[currentIndex].name}
              </h4>
              <p className="text-secondary font-semibold mb-1">
                {testimonials[currentIndex].service}
              </p>
              <p className="text-gray-500 text-sm">
                {testimonials[currentIndex].date}
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white text-primary p-4 rounded-full shadow-xl hover:bg-secondary hover:text-white transition-all duration-300 hover:scale-110"
          >
            <FaChevronLeft className="text-xl" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white text-primary p-4 rounded-full shadow-xl hover:bg-secondary hover:text-white transition-all duration-300 hover:scale-110"
          >
            <FaChevronRight className="text-xl" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'bg-white w-8'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">4.9/5.0</div>
            <p className="text-white/80">Average Rating</p>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">500+</div>
            <p className="text-white/80">Happy Customers</p>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl font-bold text-white mb-2">98%</div>
            <p className="text-white/80">Would Recommend</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;







