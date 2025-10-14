import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Lock, Palette, Bell } from 'lucide-react';
import ThemeSelector from '../components/ThemeSelector';

export default function ProfileSettings() {
  const { user, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-secondary"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Header */}
      <div className="container mx-auto px-4 mb-8">
        <h1 className="text-4xl font-black text-primary mb-2">Profile Settings</h1>
        <p className="text-text-secondary">Manage your account settings and preferences</p>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
                      activeTab === tab.id
                        ? 'bg-secondary text-primary font-bold'
                        : 'text-text-secondary hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 mt-6">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-3xl font-black text-primary mx-auto mb-4">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <h3 className="text-lg font-bold text-primary text-center">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-sm text-text-secondary text-center">{user?.email}</p>
              <span className="block mt-3 text-center">
                <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
                  {user?.role?.toUpperCase()}
                </span>
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-primary mb-6">Profile Information</h2>
                <p className="text-text-secondary mb-6">Update your personal details</p>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.firstName}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.lastName}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                      disabled
                    />
                    <p className="text-xs text-text-secondary mt-1">Email cannot be changed</p>
                  </div>

                  <button className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-primary mb-6">Security Settings</h2>
                <p className="text-text-secondary mb-6">Change your password</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none"
                    />
                  </div>

                  <button className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary-light transition-all">
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-primary mb-6">Appearance</h2>
                <p className="text-text-secondary mb-6">Choose your preferred color theme</p>
                
                <ThemeSelector />
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
                <h2 className="text-2xl font-bold text-primary mb-6">Notification Preferences</h2>
                <p className="text-text-secondary mb-6">Manage how you receive notifications</p>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-all">
                    <div>
                      <p className="font-semibold text-primary">Email Notifications</p>
                      <p className="text-sm text-text-secondary">Receive updates via email</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </label>

                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-all">
                    <div>
                      <p className="font-semibold text-primary">Order Updates</p>
                      <p className="text-sm text-text-secondary">Get notified about order status</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </label>

                  <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-all">
                    <div>
                      <p className="font-semibold text-primary">Promotional Emails</p>
                      <p className="text-sm text-text-secondary">Receive special offers and promotions</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}