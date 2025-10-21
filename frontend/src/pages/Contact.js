import React, { useState } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaClock, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/contact/submit', formData);
      toast.success("Message sent successfully!");
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="contact section py-12 sm:py-16 md:py-20">
      <div className="container px-4">
        <div className="section-title">
          <h2>{"Contact Us"}</h2>
          <p>{"Get in touch with our team"}</p>
        </div>
        
        <div className="contact-grid grid grid-2">
          <div className="contact-info">
            <h3>{"Get In Touch"}</h3>
            <div className="contact-details">
              <p>
                <FaMapMarkerAlt /> 
                <a 
                  href="https://maps.app.goo.gl/gL9iTam3z9VrX3ev7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary transition-colors"
                >
                  13 jalan rakan 12/2 Cheras, 43200 Kajang, Selangor
                </a>
              </p>
              <p>
              </p>
              <p>
                <FaEnvelope /> 
                <a href="mailto:autobath36@gmail.com" className="hover:text-secondary transition-colors">
                  autobath36@gmail.com
                </a>
              </p>
              <p>
                <FaWhatsapp /> 
                <a 
                  href="https://wa.me/60167700033?text=Hi%20AUTOBATH%2C%20I%27d%20like%20to%20inquire%20about%20your%20services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green-500 transition-colors font-semibold"
                >
                  WhatsApp Us
                </a>
              </p>
              <p><FaClock /> {"Mon-Sat: 9AM-6PM"}</p>
            </div>
            <div className="social-icons">
              <a 
                href="https://www.instagram.com/autobath_my" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className="font-bold"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
          
          <div className="contact-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder={`${"Your Name"} *`}
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder={`${"Your Email"} *`}
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder={"Your Phone"}
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">{"Select Service"}</option>
                  <option value="Exterior Detailing">{"Exterior Detailing"}</option>
                  <option value="Interior Detailing">{"Interior Detailing"}</option>
                  <option value="Premium Package">{"Premium Package"}</option>
                  <option value="Product Inquiry">{"Product Inquiry"}</option>
                </select>
              </div>
              
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder={`${"Your Message"} *`}
                  value={formData.message}
                  onChange={handleChange}
                  className="form-control"
                  rows="5"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    {"Sending..."}
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
