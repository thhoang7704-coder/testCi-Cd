import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuth, user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (isAuth && user) {
      // Redirect authenticated users to their dashboard
      const roleRoutes = {
        SYSTEM_ADMIN: '/system-admin/dashboard',
        LAB_ADMIN: '/lab-admin/dashboard',
        COMPANY: '/enterprise/dashboard',
        MENTOR: '/mentor/dashboard',
        TALENT: '/candidate/dashboard',
        TALENT_LEADER: '/candidate/dashboard',
      };

      const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes] || '/candidate/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuth, user, navigate]);

  if (isAuth) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">LabOdc</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button text="Sign In" className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50" />
              </Link>
              <Link to="/register">
                <Button text="Get Started" className="bg-primary-500 text-white hover:bg-primary-600" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Connecting Enterprises with
              <span className="text-primary-600 block">Top Student Talent</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              LabOdc bridges the gap between businesses and skilled students through structured
              ODC (Offshore Development Center) projects, fostering innovation and professional growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  text="Join as Company"
                  className="bg-primary-600 text-white hover:bg-primary-700 px-8 py-3 text-lg"
                />
              </Link>
              <Link to="/register">
                <Button
                  text="Join as Talent"
                  className="bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 px-8 py-3 text-lg"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How LabOdc Works
            </h2>
            <p className="text-lg text-gray-600">
              A streamlined process from project ideation to successful delivery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Project Submission</h3>
              <p className="text-gray-600">
                Companies submit detailed project proposals with requirements, budget, and timeline.
                Our lab validates and matches with suitable student talent.
              </p>
            </Card>

            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Talent Matching</h3>
              <p className="text-gray-600">
                Students apply and get matched based on skills, experience, and project requirements.
                Expert mentors guide the development process.
              </p>
            </Card>

            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Delivery & Funding</h3>
              <p className="text-gray-600">
                Transparent fund distribution (70/20/10 split), regular reporting, and successful
                project delivery with performance evaluation.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600">Student Talents</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">200+</div>
              <div className="text-gray-600">Partner Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Next Project?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join LabOdc today and connect with top student talent for your development needs.
          </p>
          <Link to="/register">
            <Button
              text="Get Started Now"
              className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold"
            />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">LabOdc</h3>
            <p className="text-gray-400 mb-4">
              Connecting enterprises with exceptional student talent through structured ODC projects.
            </p>
            <p className="text-sm text-gray-500">
              © 2024 LabOdc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
