import React, { useState, useEffect } from 'react';
import { UserSettings, ComponentState } from '../../types/dashboard';

type SettingsTab = 'profile' | 'subscription' | 'notifications' | 'security';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [settingsState, setSettingsState] = useState<ComponentState<UserSettings>>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setSettingsState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Mock user settings data
      const mockSettings: UserSettings = {
        profile: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          avatar: '',
          joinDate: '2024-01-15'
        },
        preferences: {
          darkMode: true,
          realTimeUpdates: true,
          defaultCurrency: 'INR',
          language: 'English',
          timezone: 'Asia/Kolkata'
        },
        subscription: {
          plan: 'PRO',
          status: 'active',
          expiryDate: '2024-12-31',
          features: ['Real-time data', 'Advanced analytics', 'Portfolio tracking', 'API access']
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
          priceAlerts: true,
          portfolioUpdates: true
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: '2024-01-15',
          activeSessions: 2
        }
      };

      setSettingsState({
        data: mockSettings,
        isLoading: false,
        error: null,
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettingsState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load settings'
      }));
    }
  };

  const updateSetting = async (section: keyof UserSettings, key: string, value: any) => {
    if (!settingsState.data) return;

    try {
      const updatedSettings = {
        ...settingsState.data,
        [section]: {
          ...settingsState.data[section],
          [key]: value
        }
      };

      setSettingsState(prev => ({
        ...prev,
        data: updatedSettings
      }));

      // Here you would make an API call to save the settings
      console.log('Saving setting:', { section, key, value });
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'subscription', label: 'Subscription', icon: 'credit_card' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'security', label: 'Security', icon: 'security' }
  ];

  if (settingsState.isLoading) {
    return (
      <div className="p-4 lg:p-10 pb-32">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="text-white">Loading settings...</div>
        </div>
      </div>
    );
  }

  if (settingsState.error) {
    return (
      <div className="p-4 lg:p-10 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">{settingsState.error}</p>
            <button 
              onClick={loadUserSettings}
              className="mt-2 text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const settings = settingsState.data!;

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-bold text-lg mb-4">Profile Information</h3>
        
        {/* Avatar Upload */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">Profile Picture</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-400 text-2xl">person</span>
            </div>
            <button className="px-4 py-2 bg-[#22c55e] text-black font-bold rounded-lg hover:bg-[#16a34a] transition-colors">
              Upload Photo
            </button>
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">Full Name</label>
          <input
            type="text"
            value={settings.profile.name}
            onChange={(e) => updateSetting('profile', 'name', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#22c55e] transition-colors"
          />
        </div>

        {/* Email (Read-only) */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">Email Address</label>
          <input
            type="email"
            value={settings.profile.email}
            readOnly
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
          />
          <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
        </div>
      </div>
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-bold text-lg mb-4">Subscription Details</h3>
        
        {/* Current Plan */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-white font-bold text-xl">Current Plan: {settings.subscription.plan}</h4>
              <p className="text-gray-400">Status: {settings.subscription.status}</p>
            </div>
            <div className="text-right">
              <p className="text-[#22c55e] font-bold text-2xl">Active</p>
              <p className="text-gray-400 text-sm">Expires: {settings.subscription.expiryDate}</p>
            </div>
          </div>
          
          <button className="w-full py-3 border-2 border-[#22c55e] text-[#22c55e] font-bold rounded-lg hover:bg-[#22c55e] hover:text-black transition-colors">
            Manage Subscription
          </button>
        </div>

        {/* Features */}
        <div>
          <h4 className="text-white font-medium mb-3">Included Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {settings.subscription.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <span className="material-symbols-outlined text-[#22c55e]">check_circle</span>
                <span className="text-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-bold text-lg mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <h4 className="text-white font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-gray-400 text-sm">
                  {key === 'email' && 'Receive notifications via email'}
                  {key === 'push' && 'Browser push notifications'}
                  {key === 'sms' && 'SMS notifications for important updates'}
                  {key === 'priceAlerts' && 'Alerts when stock prices change significantly'}
                  {key === 'portfolioUpdates' && 'Daily portfolio performance summaries'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-bold text-lg mb-4">Security Settings</h3>
        
        <div className="space-y-4">
          {/* Two Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Two-Factor Authentication</h4>
              <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
            </div>
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                settings.security.twoFactorEnabled 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-[#22c55e] hover:bg-[#16a34a] text-black'
              }`}
              onClick={() => updateSetting('security', 'twoFactorEnabled', !settings.security.twoFactorEnabled)}
            >
              {settings.security.twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          {/* Password */}
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Password</h4>
              <button className="text-[#22c55e] hover:text-[#16a34a] font-medium">
                Change Password
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              Last changed: {settings.security.lastPasswordChange}
            </p>
          </div>

          {/* Active Sessions */}
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Active Sessions</h4>
              <span className="text-[#22c55e] font-bold">{settings.security.activeSessions}</span>
            </div>
            <p className="text-gray-400 text-sm">
              Manage devices that are currently signed in to your account
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="mt-8 pt-8 border-t border-gray-700">
      <h3 className="text-white font-bold text-lg mb-4">Preferences</h3>
      
      <div className="space-y-4">
        {/* Dark Mode (Locked) */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Dark Mode</h4>
            <p className="text-gray-400 text-sm">Currently locked to maintain optimal experience</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Locked On</span>
            <div className="w-11 h-6 bg-[#22c55e] rounded-full relative">
              <div className="absolute top-[2px] right-[2px] bg-white rounded-full h-5 w-5"></div>
            </div>
          </div>
        </div>

        {/* Real-time Updates */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Real-time Updates</h4>
            <p className="text-gray-400 text-sm">Live price updates and market data</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.preferences.realTimeUpdates}
              onChange={(e) => updateSetting('preferences', 'realTimeUpdates', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
          </label>
        </div>

        {/* Default Currency */}
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div>
            <h4 className="text-white font-medium">Default Currency</h4>
            <p className="text-gray-400 text-sm">Primary currency for displaying values</p>
          </div>
          <select
            value={settings.preferences.defaultCurrency}
            onChange={(e) => updateSetting('preferences', 'defaultCurrency', e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#22c55e]"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-10 pb-32" style={{ backgroundColor: '#050505' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="border-b border-gray-800 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and configuration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#22c55e] text-black font-bold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'subscription' && renderSubscriptionTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'security' && renderSecurityTab()}
              
              {/* Preferences section appears on profile tab */}
              {activeTab === 'profile' && renderPreferences()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}