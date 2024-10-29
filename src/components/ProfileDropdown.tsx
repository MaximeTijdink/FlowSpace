import React, { useRef, useEffect } from 'react';
import { User, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../contexts/NavigationContext';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDropdown({ isOpen, onClose }: ProfileDropdownProps) {
  const { user, logout, isAdmin } = useAuth();
  const { navigateTo } = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50"
    >
      <div className="px-4 py-2 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      <button
        onClick={() => {
          navigateTo('profile');
          onClose();
        }}
        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Profile Settings
      </button>

      {isAdmin() && (
        <button
          onClick={() => {
            navigateTo('admin');
            onClose();
          }}
          className="w-full px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Admin Dashboard
        </button>
      )}

      <button
        onClick={() => {
          logout();
          onClose();
        }}
        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}