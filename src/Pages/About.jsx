import { useEffect, useState, useRef } from "react";
import Footer from "../Components/Footer";

export default function About() {
  // ENHANCED: Multiple animated counters with intersection observer
  const [stats, setStats] = useState({
    hotels: 0,
    bookings: 0,
    rating: 0
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);

  // NEW: Intersection Observer to trigger animation when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // ENHANCED: Animate all stats when visible
  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds animation
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setStats({
        hotels: Math.floor(500 * easeOut),
        bookings: Math.floor(1200 * easeOut),
        rating: parseFloat((4.8 * easeOut).toFixed(1))
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible]);

  // NEW: Team data with roles and colors
  const team = [
    { name: "Ahmed", role: "Frontend Lead", color: "bg-blue-500" },
    { name: "Sara", role: "UX Designer", color: "bg-purple-500" },
    { name: "Omar", role: "Backend Dev", color: "bg-green-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* NEW: Hero Section with better visual hierarchy */}
      <div className="py-20 bg-slate-800 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">
            About Our Hotel
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            Simplifying hotel booking experiences through powerful search tools, 
            transparent reviews, and interactive discovery.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 py-16 space-y-20">

        {/* Mission Section - ENHANCED with icon and card layout */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-slate-800 font-semibold mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Our Purpose
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              We connect travelers with the best accommodations through 
              intuitive technology and trusted reviews. Every booking should 
              feel like a breeze, not a burden.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Trusted by 10k+ users
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                500+ partner hotels
              </div>
            </div>
          </div>
          
          {/* Decorative element */}
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-100 rounded-3xl transform rotate-3"></div>
            <div className="relative bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              <blockquote className="text-2xl font-medium text-gray-800 italic">
                "Travel is the only thing you buy that makes you richer."
              </blockquote>
              <p className="mt-4 text-gray-500">— Anonymous Traveler</p>
            </div>
          </div>
        </section>

        {/* Stats Section - ENHANCED with animation trigger */}
        <section ref={statsRef}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-gray-600">Numbers that speak for themselves</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Stat Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center group hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats.hotels}+
              </div>
              <p className="text-gray-600 font-medium">Hotels Listed</p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center group hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats.bookings}+
              </div>
              <p className="text-gray-600 font-medium">Successful Bookings</p>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center group hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats.rating}
              </div>
              <p className="text-gray-600 font-medium">Average Rating</p>
            </div>
          </div>
        </section>

        {/* Team Section - ENHANCED with better cards */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600">The people behind the magic</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div 
                key={i} 
                className="bg-slate- rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Avatar with gradient background */}
                <div className={`h-32 ${member.color} relative`}>
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                    <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg">
                      <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400">
                        {member.name[0]}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-12 pb-6 px-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-indigo-600 font-medium text-sm mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Passionate about creating the best travel experience for you.
                  </p>
                  
                  {/* Social links */}
                  <div className="flex justify-center gap-3 mt-4">
                    <button className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </button>
                    <button className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Map Section - ENHANCED with better container */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Us
            </h2>
            <p className="text-gray-600">Visit our headquarters</p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <iframe
              title="Company Location Map"
              src="https://maps.google.com/maps?q=hotels&t=&z=13&ie=UTF8&iwloc=&output=embed"
              className="w-full h-96 rounded-xl grayscale hover:grayscale-0 transition-all duration-500"
              loading="lazy"
            />
          </div>
        </section>

      </div>
       <Footer />
    </div>
  );
}