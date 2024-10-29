import React, { useState, useEffect } from 'react';
import { User, Search, MoreVertical, Shield, Clock, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { User as UserType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from '../contexts/NavigationContext';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { navigateTo } = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin()) {
      navigateTo('home');
      return;
    }

    const loadUsers = () => {
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const usersWithoutPasswords = allUsers.map(({ password, ...user }: any) => user);
      setUsers(usersWithoutPasswords);
    };

    loadUsers();
  }, [isAdmin, navigateTo]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (userId: string, action: 'suspend' | 'activate' | 'promote' | 'demote' | 'delete') => {
    if (action === 'delete') {
      // Don't allow deleting the admin account
      const userToDelete = users.find(u => u.id === userId);
      if (userToDelete?.email === 'maxime.tijdink@gmail.com') {
        alert('Cannot delete the admin account');
        return;
      }

      // Remove from localStorage
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = allUsers.filter((user: any) => user.id !== userId);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Update state
      setUsers(users.filter(user => user.id !== userId));
    } else {
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'suspend':
              return { ...user, status: 'suspended' };
            case 'activate':
              return { ...user, status: 'active' };
            case 'promote':
              return { ...user, role: 'admin' };
            case 'demote':
              return { ...user, role: 'user' };
          }
        }
        return user;
      });

      // Update localStorage with the modified users (including passwords)
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedAllUsers = allUsers.map((user: any) => {
        const updatedUser = updatedUsers.find(u => u.id === user.id);
        return updatedUser ? { ...user, ...updatedUser } : user;
      });
      localStorage.setItem('users', JSON.stringify(updatedAllUsers));

      setUsers(updatedUsers);
    }
    setIsActionMenuOpen(null);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.role === 'admin' ? (
                          <Shield className="w-4 h-4 text-indigo-600 mr-1" />
                        ) : (
                          <User className="w-4 h-4 text-gray-400 mr-1" />
                        )}
                        <span className={user.role === 'admin' ? 'text-indigo-600' : 'text-gray-500'}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="relative">
                        <button
                          onClick={() => setIsActionMenuOpen(isActionMenuOpen === user.id ? null : user.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {isActionMenuOpen === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                            {user.status === 'active' ? (
                              <button
                                onClick={() => handleAction(user.id, 'suspend')}
                                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Ban className="w-4 h-4" />
                                Suspend User
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(user.id, 'activate')}
                                className="w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Activate User
                              </button>
                            )}
                            
                            {user.role === 'user' ? (
                              <button
                                onClick={() => handleAction(user.id, 'promote')}
                                className="w-full px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4" />
                                Promote to Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAction(user.id, 'demote')}
                                className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <User className="w-4 h-4" />
                                Demote to User
                              </button>
                            )}

                            {/* Delete User Button */}
                            {showDeleteConfirm !== user.id ? (
                              <button
                                onClick={() => setShowDeleteConfirm(user.id)}
                                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete User
                              </button>
                            ) : (
                              <div className="px-4 py-2 space-y-2">
                                <p className="text-sm text-gray-600">Are you sure?</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAction(user.id, 'delete')}
                                    className="flex-1 px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                                  >
                                    Yes, Delete
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}