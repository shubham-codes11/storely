import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import UpdatePasswordModal from './components/UpdatePasswordModal';
import HeroBanner from './components/HeroBanner';
import UserStoresView from './pages/UserStoresView';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Shield, Users } from 'lucide-react';

function MainApp() {
  const { user, isAdmin, isStoreOwner, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('auto');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  // Compute which view to show
  const currentView = (() => {
    if (activeTab === 'explore') return 'explore';
    if (activeTab === 'owner_dash' && isStoreOwner) return 'owner_dash';
    if (activeTab === 'admin_dash' && isAdmin) return 'admin_dash';
    if (isAdmin) return 'admin_dash';
    if (isStoreOwner) return 'owner_dash';
    return 'explore';
  })();

  const openAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSelectStoreFromSearch = (storeId) => {
    setActiveTab('explore');
    setSelectedStoreId(storeId);
    setTimeout(() => {
      const el = document.getElementById(`store-${storeId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenAuth={openAuth}
        onOpenPassword={() => setPasswordModalOpen(true)}
        activeTab={currentView}
        setActiveTab={setActiveTab}
        onSelectStore={handleSelectStoreFromSearch}
      />

      {/* Hero Banner — shown only to guests (not logged in) on explore view */}
      <AnimatePresence>
        {!isAuthenticated && currentView === 'explore' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45 }}
          >
            <HeroBanner
              onOpenAuth={openAuth}
              onExplore={() => {
                // Smooth scroll down past banner
                window.scrollTo({ top: 520, behavior: 'smooth' });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Sub-Tabs for Admin or Store Owner */}
      {(isAdmin || isStoreOwner) && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex space-x-1 py-2 text-xs font-bold">
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin_dash')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    currentView === 'admin_dash'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" /> Admin Dashboard
                </button>
              )}
              {isStoreOwner && (
                <button
                  onClick={() => setActiveTab('owner_dash')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    currentView === 'owner_dash'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" /> Store Owner Dashboard
                </button>
              )}
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === 'explore'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Browse Stores
              </button>
            </div>

            <div className="text-[11px] font-semibold text-slate-500 hidden sm:block">
              Role: <span className="text-teal-700 capitalize font-bold">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area with Animated Transition */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'admin_dash' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AdminDashboard />
            </motion.div>
          )}

          {currentView === 'owner_dash' && (
            <motion.div
              key="owner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <StoreOwnerDashboard onOpenPassword={() => setPasswordModalOpen(true)} />
            </motion.div>
          )}

          {currentView === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <UserStoresView
                onOpenAuth={openAuth}
                selectedStoreId={selectedStoreId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            {/* Storely mini logo in footer */}
            <span className="flex items-center gap-1">
              <span className="w-5 h-5 rounded-md bg-teal-500 text-white flex items-center justify-center text-xs font-black">
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4h6a5 5 0 0 1 0 10h-4l4.5 6H9l-4.5-6H6V4zm2 2v6h4a3 3 0 0 0 0-6H8z"/>
                </svg>
              </span>
              Store<span className="text-teal-500">ly</span>
            </span>
          </div>
          <div className="text-slate-400">
            Storely © 2026. Rate Stores, Build a Better Community.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <UpdatePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
