import React, { useState, useEffect } from 'react';
import { Clock, Plus, Calendar, Users } from 'lucide-react';
import SessionModal from './SessionModal';
import CreateSessionModal from './CreateSessionModal';
import { Session } from '../types';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import WorkspaceRoom from './WorkspaceRoom';
import { formatDuration } from '../utils/timeUtils';

interface ActiveSessionsProps {
  onJoinSession: () => void;
}

export default function ActiveSessions({ onJoinSession }: ActiveSessionsProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInSession, setIsInSession] = useState(false);
  const [currentSessionDuration, setCurrentSessionDuration] = useState(45);
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled'>('all');

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = new Date(session.startTime).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, Session[]>);

  // Sort dates and sessions within each date
  const sortedDates = Object.keys(groupedSessions).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSessions(prevSessions => 
        prevSessions.map(session => {
          const now = new Date();
          const startTime = new Date(session.startTime);
          if (session.status === 'scheduled' && startTime <= now) {
            return { ...session, status: 'active' };
          }
          return session;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleJoinClick = (session: Session) => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setSelectedSession(session);
    }
  };

  const handleCreateSession = (newSession: Session) => {
    setSessions(prevSessions => [...prevSessions, newSession].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    ));
  };

  const handleJoinSession = () => {
    if (selectedSession) {
      setCurrentSessionDuration(selectedSession.durationMinutes);
      setIsInSession(true);
    }
    setSelectedSession(null);
  };

  const handleSessionEnd = () => {
    if (selectedSession) {
      setSessions(sessions.filter(session => session.id !== selectedSession.id));
    }
    setIsInSession(false);
    setSelectedSession(null);
  };

  const getSessionStatus = (session: Session) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(startTime.getTime() + session.durationMinutes * 60000);

    if (now < startTime) {
      return 'scheduled';
    } else if (now >= startTime && now <= endTime) {
      return 'active';
    } else {
      return 'ended';
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Work Sessions</h2>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'all' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('scheduled')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'scheduled'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Scheduled
              </button>
            </div>
          </div>
          {user && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Session
            </button>
          )}
        </div>
        
        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No sessions scheduled yet.</p>
            {user && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="w-5 h-5" />
                Schedule your first session
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map(date => {
              const daySessions = groupedSessions[date].filter(session => {
                if (filter === 'all') return true;
                return session.status === filter;
              });

              if (daySessions.length === 0) return null;

              return (
                <div key={date} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {daySessions.map((session) => (
                      <div 
                        key={session.id} 
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={session.avatar}
                            alt={session.host}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg text-gray-900">{session.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                session.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : session.status === 'scheduled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-gray-600">Hosted by {session.host}</p>
                            {session.description && (
                              <p className="mt-2 text-gray-600">{session.description}</p>
                            )}
                            <div className="mt-4 flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {new Date(session.startTime).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}
                                  {' • '}
                                  {formatDuration(session.durationMinutes)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{session.participants}/{session.maxParticipants}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={() => handleJoinClick(session)}
                            disabled={session.status === 'ended'}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              session.status === 'active'
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : session.status === 'scheduled'
                                ? 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {session.status === 'active' ? 'Join Now' : 'Join When Started'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedSession && (
        <SessionModal
          session={selectedSession}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          onJoin={handleJoinSession}
        />
      )}

      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSession={handleCreateSession}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <WorkspaceRoom 
        isOpen={isInSession} 
        onClose={handleSessionEnd}
        sessionDuration={currentSessionDuration}
      />
    </div>
  );
}