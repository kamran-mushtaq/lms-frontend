
'use client';


import React, { useState } from 'react';
import { Eye, EyeOff, Github, Linkedin } from 'lucide-react';
import { LoginForm } from "@/components/login-form";

function AuthSide() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      "title": "Personalized Learning Paths",
      "description": "Every child learns differently. Our system adapts to your child’s strengths and weaknesses, offering personalized content that builds confidence and improves performance.",
      "image": "/images/log2.png"
    },
    {
      "title": "Safe & Controlled Digital Learning",
      "description": "With built-in safety features and monitored usage, you can be assured your child is learning in a secure, distraction-free environment designed for growth.",
      "image": "/images/log1.png"
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
          <div
        className="hidden lg:block w-1/2 bg-gray-100 relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://unified.cloudways.com/guests-app/latest/25b154d6cecb3dec35ac.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div
          className="absolute inset-0"
        >
          <div className="absolute inset-0 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slides.map((slide, index) => (
              <div
                key={index}
                className="absolute inset-0 w-full h-full flex flex-col justify-center items-center p-12"
                style={{ left: `${index * 100}%` }}
              >
                <div className="max-w-lg text-center space-y-6">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-64 object-contain mb-8"
                  />
                  <h3 className="text-2xl font-bold text-white">{slide.title}</h3>
                  <p className="text-white">{slide.description}</p>
                  <button className="bg-white text-blue-600 px-6 py-2 rounded-lg shadow hover:shadow-lg transition-shadow">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Slide indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>
  );
}

export default AuthSide;
