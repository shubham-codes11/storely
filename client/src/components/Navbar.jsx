import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Star,
  LogOut,
  KeyRound,
  Bell,
  ChevronDown,
  CheckCheck,
  MessageSquare,
  ShieldCheck,
  Clock,
  X
} from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onOpenAuth, onOpenPassword, activeTab, setActiveTab, onSelectStore }) {
  const { user, store, isAuthenticated, isAdmin, isStoreOwner, logout, switchDemoRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Notification panel state
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'rating',
      title: 'New 5-Star Rating Received',
      description: 'Jonathan Reynolds rated Apex Electronics 5/5 stars.',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'review',
      title: 'Customer Feedback Submitted',
      description: 'Dorlan Shopi left a review: "Product quality is good. Arrived on schedule."',
      time: '5 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'security',
      title: 'Account Security Verified',
      description: 'Single sign-on session validated successfully.',
      time: '1 day ago',
      read: false
    }
  ]);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Live search suggestions as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.getStores({ search: searchQuery.trim() });
        setSearchResults(res.stores.slice(0, 5));
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0f1d33] text-white shadow-md border-b border-slate-700/50">
      {/* Account Quick Switcher Sub-bar */}
      <div className="bg-[#0b1424] px-4 py-1.5 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-semibold text-slate-300">Quick Switch Account:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => switchDemoRole('admin')}
            className={`px-2.5 py-0.5 rounded-full font-medium transition-all ${
              isAdmin
                ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            👑 Admin Account
          </button>
          <button
            onClick={() => switchDemoRole('store_owner')}
            className={`px-2.5 py-0.5 rounded-full font-medium transition-all ${
              isStoreOwner
                ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🏪 Store Owner (Apex)
          </button>
          <button
            onClick={() => switchDemoRole('user')}
            className={`px-2.5 py-0.5 rounded-full font-medium transition-all ${
              isAuthenticated && !isAdmin && !isStoreOwner
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            👤 Customer (Jonathan)
          </button>
          {isAuthenticated && (
            <button
              onClick={() => switchDemoRole('guest')}
              className="px-2 py-0.5 rounded-full font-medium text-slate-400 hover:text-rose-400 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* ──── Storely Brand Logo with animation ──── */}
        <motion.div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setActiveTab('explore')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        >
          {/* Animated "R" icon matching the uploaded logo */}
          <motion.div
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 ring-1 ring-white/20"
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* "R" letter matching the logo */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4h6a5 5 0 0 1 0 10h-4l4.5 6H9l-4.5-6H6V4zm2 2v6h4a3 3 0 0 0 0-6H8z"/>
            </svg>
          </motion.div>

          {/* "Storely" text — "Store" white, "ly" teal — matching uploaded image */}
          <div className="flex items-baseline">
            <motion.span
              className="text-xl font-extrabold text-white tracking-tight leading-none"
              initial={{ x: -12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Store
            </motion.span>
            <motion.span
              className="text-xl font-extrabold text-teal-400 tracking-tight leading-none"
              initial={{ x: -8, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.18 }}
            >
              ly
            </motion.span>
          </div>
        </motion.div>

        {/* Center Search Bar with Dropdown */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search stores by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              className="w-full bg-white text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2 rounded-full text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 border border-slate-300 transition-all"
            />
          </div>

          {/* Autocomplete suggestions dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Stores
              </div>
              {searchResults.map((storeItem) => (
                <div
                  key={storeItem.id}
                  onClick={() => {
                    if (onSelectStore) onSelectStore(storeItem.id);
                    setShowDropdown(false);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 hover:bg-teal-50 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                      {storeItem.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{storeItem.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-xs">{storeItem.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">
                    <span>{storeItem.overall_rating > 0 ? storeItem.overall_rating : 'New'}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Bell with Functional Panel */}
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors focus:outline-none"
                  title="View Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      key={unreadCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-4 h-4 bg-teal-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 text-slate-800 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-teal-400" />
                          <span className="font-bold text-sm">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/40">
                              {unreadCount} New
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-xs">
                            No notifications right now.
                          </div>
                        ) : (
                          notifications.map((item) => (
                            <div
                              key={item.id}
                              className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 relative ${
                                !item.read ? 'bg-teal-50/30' : ''
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  item.type === 'rating'
                                    ? 'bg-amber-100 text-amber-600'
                                    : item.type === 'review'
                                    ? 'bg-teal-100 text-teal-600'
                                    : 'bg-blue-100 text-blue-600'
                                }`}
                              >
                                {item.type === 'rating' ? (
                                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                                ) : item.type === 'review' ? (
                                  <MessageSquare className="w-4 h-4" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <p className="text-xs font-bold text-slate-900 leading-tight">
                                    {item.title}
                                  </p>
                                  <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" />
                                    {item.time}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                              <button
                                onClick={() => clearNotification(item.id)}
                                className="text-slate-300 hover:text-slate-500 p-1 transition-colors"
                                title="Dismiss"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-500">Storely Notification Center</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Dropdown */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-full px-3 py-1.5 transition-all text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-xs border border-teal-500/40">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block max-w-[130px]">
                    <div className="font-semibold text-xs text-slate-200 truncate">{user?.name}</div>
                    <div className="text-[10px] text-teal-400 font-medium capitalize">
                      {user?.role === 'admin'
                        ? 'Admin'
                        : user?.role === 'store_owner'
                        ? store?.name || 'Store Owner'
                        : 'Normal User'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div
                    onClick={() => setUserMenuOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50 text-slate-700"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => onOpenPassword()}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium"
                    >
                      <KeyRound className="w-4 h-4 text-slate-400" />
                      Update Password
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 text-sm font-semibold bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg shadow-teal-500/25 transition-all"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
