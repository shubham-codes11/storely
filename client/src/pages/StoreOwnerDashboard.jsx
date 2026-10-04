import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  BarChart3,
  TrendingUp,
  Store,
  Users,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export default function StoreOwnerDashboard({ onOpenPassword }) {
  const { user, store } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'feedback', 'profile'

  // Reply modal state
  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState({}); // local mock replies map reviewId -> replyText

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getStoreOwnerDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load store owner dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSendReply = (reviewId) => {
    if (!replyText.trim()) return;
    setReplies((prev) => ({
      ...prev,
      [reviewId]: replyText.trim()
    }));
    setReplyingReview(null);
    setReplyText('');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Store Analytics...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Store Profile Notice</h2>
          <p className="text-sm text-slate-600 mb-6">{error || 'No active store found for this account.'}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-teal-700 transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const { store: currentStore, overallRating, totalRatings, ratingBreakdown, userRatings } = dashboardData;

  // Calculate percentage of circular gauge (rating out of 5)
  const ratingNum = Number(overallRating) || 0;
  const ratingPercent = Math.min(Math.max((ratingNum / 5) * 100, 0), 100);
  const strokeDashoffset = 283 - (283 * ratingPercent) / 100; // 2 * PI * 45 ≈ 283

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Sub-header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white font-black flex items-center justify-center shadow-md">
              {currentStore.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">
                Store Owner Dashboard
              </h1>
              <p className="text-xs font-semibold text-teal-700 flex items-center gap-1">
                <span>{currentStore.name}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-normal truncate max-w-xs">{currentStore.address}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'feedback'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Customer Feedback ({userRatings.length})
          </button>
          <button
            onClick={() => onOpenPassword()}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm transition-all"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Store Analytics (Chart-Driven) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Store Analytics (Chart-Driven)
                </h3>
                <p className="text-xs text-slate-400">Live rating performance & feedback distribution</p>
              </div>
              <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <BarChart3 className="w-5 h-5" />
              </span>
            </div>

            {/* Circular Gauge Donut Chart */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-52 h-52 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                  />
                  {/* Progress Arc */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    stroke="url(#tealGradient)"
                    strokeWidth="10"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * ratingPercent) / 100}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 264 }}
                    animate={{ strokeDashoffset: 264 - (264 * ratingPercent) / 100 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0d9488" />
                      <stop offset="100%" stopColor="#2dd4bf" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Gauge Inner Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">
                    {ratingNum > 0 ? ratingNum : '0.0'}
                    <span className="text-xl font-bold text-slate-400">/5</span>
                  </span>
                  <span className="text-xs font-extrabold text-teal-700 uppercase tracking-widest mt-0.5">
                    Stars
                  </span>
                  <div className="flex items-center gap-0.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= Math.round(ratingNum)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center mt-3">
                <span className="text-sm font-bold text-slate-700">Average Rating</span>
                <p className="text-xs text-slate-400">Based on {totalRatings} customer reviews</p>
              </div>
            </div>

            {/* Rating Breakdown Bars */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Rating Breakdown
              </span>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingBreakdown[stars] || 0;
                const pct = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="w-12 font-bold text-slate-600 flex items-center gap-1">
                      {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    </span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="w-12 text-right text-slate-400 font-semibold">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Feed Scroll */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Recent Feed Scroll
                </h3>
                <p className="text-xs text-slate-400">Users who have submitted ratings for your store</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {userRatings.length} Total Submissions
              </span>
            </div>

            {userRatings.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No submitted reviews yet</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Once normal users submit ratings for your store, their reviews and scores will display here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
                {userRatings.map((item) => {
                  const hasReply = replies[item.id];
                  const isReplying = replyingReview?.id === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                    >
                      {/* Reviewer Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                            {item.user_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">
                                {item.user_name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 flex items-center gap-1 border border-teal-200">
                                <ShieldCheck className="w-3 h-3 text-teal-600" />
                                Verified Buyer
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">
                              {item.user_email}
                            </p>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= item.rating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-1.5">
                          {item.rating}/5
                        </span>
                      </div>

                      {/* Comment text */}
                      {item.comment ? (
                        <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60">
                          "{item.comment}"
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No written comment provided.</p>
                      )}

                      {/* Store Reply display */}
                      {hasReply && (
                        <div className="ml-4 pl-3 border-l-2 border-teal-500 bg-teal-50/60 p-2.5 rounded-r-lg text-xs space-y-1">
                          <span className="font-bold text-teal-900 flex items-center gap-1">
                            <Store className="w-3 h-3 text-teal-600" /> Response from {currentStore.name}:
                          </span>
                          <p className="text-slate-700">{hasReply}</p>
                        </div>
                      )}

                      {/* Reply button / Inline form */}
                      {!hasReply && !isReplying && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              setReplyingReview(item);
                              setReplyText('');
                            }}
                            className="px-3 py-1 rounded-lg bg-white hover:bg-teal-50 text-teal-700 border border-slate-200 text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Reply
                          </button>
                        </div>
                      )}

                      {/* Inline Reply input */}
                      {isReplying && (
                        <div className="mt-2 space-y-2 pt-2 border-t border-slate-200">
                          <textarea
                            rows="2"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply directly to ${item.user_name}...`}
                            className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setReplyingReview(null)}
                              className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSendReply(item.id)}
                              disabled={!replyText.trim()}
                              className="px-3.5 py-1 text-xs font-bold bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" /> Post Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
