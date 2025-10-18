import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaSearch } from 'react-icons/fa';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqData = [
    {
      category: 'Booking & Appointments',
      questions: [
        {
          q: 'How long does each service take?',
          a: 'Service duration varies: Basic Package (75 min), Premium Package (3 hours), Ultra Package (8 hours). Individual services range from 90 minutes to 6 hours depending on the service.'
        },
        {
          q: 'Can I reschedule my appointment?',
          a: 'Yes! You can reschedule up to 24 hours before your appointment. Contact us via WhatsApp to reschedule.'
        },
        {
          q: 'What if I need to cancel?',
          a: 'You can cancel up to 24 hours before your appointment for a full refund. Cancellations within 24 hours may incur a 50% cancellation fee.'
        },
        {
          q: 'How do I book an appointment?',
          a: 'You can book online through our booking page or message us on WhatsApp. Online booking is available 24/7!'
        }
      ]
    },
    {
      category: 'Services',
      questions: [
        {
          q: 'Do I need to drop off my car?',
          a: 'No! We offer mobile detailing services. We come to your location (home or office) with all necessary equipment. Just ensure there\'s water access and parking space.'
        },
        {
          q: 'What areas do you serve?',
          a: 'We serve Cheras, Kajang, and surrounding areas within a 20km radius. Contact us to check if we serve your location.'
        },
        {
          q: 'What\'s the difference between packages?',
          a: 'Basic: Essential cleaning. Premium: Complete detailing with wax. Ultra: Full treatment including paint correction and ceramic coating. See our package comparison table for details.'
        },
        {
          q: 'Do you offer warranty or guarantee?',
          a: 'Yes! We offer a 100% satisfaction guarantee. If you\'re not happy with our service, we\'ll redo it for free. Ceramic coating comes with a 2-year warranty.'
        }
      ]
    },
    {
      category: 'Payment',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept Credit/Debit Cards (via Stripe), Touch \'n Go eWallet, Bank Transfer, and Cash on completion. All major cards are accepted.'
        },
        {
          q: 'When do I need to pay?',
          a: 'Payment is due after service completion. For online purchases, payment is required at checkout. We also accept deposits for premium packages.'
        },
        {
          q: 'Do you offer discounts?',
          a: 'Yes! We offer package discounts (save 10-20%), loyalty rewards, referral bonuses, and seasonal promotions. Follow us on social media for special offers!'
        },
        {
          q: 'Can I get a refund?',
          a: 'Yes. If you cancel 24+ hours before your appointment, you get a full refund. Product returns are accepted within 7 days if unopened.'
        }
      ]
    },
    {
      category: 'Products',
      questions: [
        {
          q: 'Are your products safe for all vehicles?',
          a: 'Yes! We use professional-grade, pH-neutral products that are safe for all paint types, finishes, and vehicle materials.'
        },
        {
          q: 'Can I buy products without booking a service?',
          a: 'Absolutely! Browse our Products page and order online. We offer delivery or pickup options.'
        },
        {
          q: 'Do you offer product bundles?',
          a: 'Yes! Check our product bundles for savings. Popular bundles include Cleaning Starter Kit, Interior Care Bundle, and Professional Protection Kit.'
        }
      ]
    },
    {
      category: 'General',
      questions: [
        {
          q: 'What makes AUTOBATH different?',
          a: 'Professional certified detailers, eco-friendly products, mobile service, dynamic pricing, satisfaction guarantee, and personalized care for every vehicle.'
        },
        {
          q: 'Do you detail commercial vehicles?',
          a: 'Yes! We detail cars, SUVs, trucks, vans, and commercial fleets. Contact us for fleet pricing and scheduling.'
        },
        {
          q: 'Can I watch the detailing process?',
          a: 'Of course! We encourage it. Whether at your location or our facility, you\'re welcome to observe and ask questions.'
        },
        {
          q: 'Do you offer membership or subscription?',
          a: 'We\'re launching a loyalty program soon! Regular customers earn points for discounts and exclusive offers. Sign up for our newsletter to be notified.'
        }
      ]
    }
  ];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Filter FAQs based on search
  const filterFAQs = () => {
    if (!searchTerm) return faqData;
    
    return faqData.map(category => ({
      ...category,
      questions: category.questions.filter(item =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.questions.length > 0);
  };

  const filteredFAQs = filterFAQs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container py-8 sm:py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            {"Frequently Asked Questions"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {"Find answers to common questions about our services"}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={"Search questions..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-secondary focus:outline-none text-lg"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-8">
          {filteredFAQs.map((category, catIdx) => (
            <div key={catIdx} className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-primary mb-6 pb-3 border-b-2 border-secondary/20">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((item, qIdx) => {
                  const globalIndex = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === globalIndex;
                  
                  return (
                    <div
                      key={qIdx}
                      className="border-2 border-gray-100 rounded-xl overflow-hidden hover:border-secondary/30 transition-all"
                    >
                      <button
                        onClick={() => toggleQuestion(globalIndex)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-800 pr-4">
                          {item.q}
                        </span>
                        {isOpen ? (
                          <FaChevronUp className="text-secondary flex-shrink-0" />
                        ) : (
                          <FaChevronDown className="text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                          <p className="text-gray-700 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions? */}
        <div className="max-w-2xl mx-auto mt-12 text-center bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-8 shadow-xl">
          <h3 className="text-2xl font-bold mb-4">{"Still Have Questions?"}</h3>
          <p className="mb-6">{"Our team is here to help you"}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/60167700033?text=Hi%20AUTOBATH%2C%20I%20have%20a%20question"
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-green-500 text-white hover:bg-green-600"
            >
              {"WhatsApp Us"}
            </a>
            <a 
              href="/contact"
              className="btn btn-outline bg-white/10 text-white border-white hover:bg-white/20"
            >
              Send Message
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;


