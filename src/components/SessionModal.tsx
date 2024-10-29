import React from 'react';
import { Clock, Users } from 'lucide-react';
import Modal from './Modal';
import { Session } from '../types';

interface SessionModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
}

export default function SessionModal({ session, isOpen, onClose, onJoin }: SessionModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <img
              src={session.avatar}
              alt={session.host}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{session.title}</h2>
              <p className="text-gray-600">Hosted by {session.host}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm border-y border-gray-100 py-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{session.timeLeft} remaining</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{session.participants} participants</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Session Rules</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Keep your camera on during the session</li>
              <li>• Stay focused on your declared task</li>
              <li>• Respect others' concentration time</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onJoin}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Join Now
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}