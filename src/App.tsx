import React, { useState } from 'react';
import { Users, Brain, Clock, Zap } from 'lucide-react';
import Navbar from './components/Navbar';
import ActiveSessions from './components/ActiveSessions';
import Footer from './components/Footer';
import WorkspaceRoom from './components/WorkspaceRoom';
import ProfilePage from './components/ProfilePage';
import AdminDashboard from './components/AdminDashboard';
import { useNavigate } from './contexts/NavigationContext';

export default function App() {
  const [isInSession, setIsInSession] = useState(false);
  const { currentPage } = useNavigate();

  if (currentPage === 'profile') {
    return <ProfilePage />;
  }

  if (currentPage === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Get in the <span className="text-indigo-600">flow</span> together
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join focused co-working sessions with professionals worldwide. 
            Boost your productivity in a supportive community.
          </p>
        </div>
      </div>

      {/* Active Sessions */}
      <ActiveSessions onJoinSession={() => setIsInSession(true)} />

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Community Focus</h3>
            <p className="text-gray-600">Work alongside motivated professionals in real-time focused sessions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Deep Work</h3>
            <p className="text-gray-600">Achieve flow state with structured work sessions and breaks</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Boost Productivity</h3>
            <p className="text-gray-600">Track your progress and celebrate wins with the community</p>
          </div>
        </div>
      </div>

      <Footer />

      <WorkspaceRoom 
        isOpen={isInSession} 
        onClose={() => setIsInSession(false)} 
      />
    </div>
  );
}