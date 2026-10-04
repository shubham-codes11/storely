import React from 'react';
import { X, User, Mail, MapPin, Shield, Store, Star, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserDetailsModal({ isOpen, onClose, userDetails }) {
  if (!isOpen || !userDetails) return null;

  const { user, submittedRatings = [] } = userDetails;

  const roleStyles = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    store_owner: 'bg-teal-100 text-teal-800 border-teal-200',
    user: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  const roleTitles = {
    admin: 'System Administrator',
    store_owner: 'Store Owner',
    user: 'Normal User'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                roleStyles[user.role] || 'bg-slate-700 text-slate-200'
              }`}
            >
              {roleTitles[user.role] || user.role}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white leading-snug">{user.name}</h2>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            {user.email}
          </p>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">User ID</div>
              <div className="text-sm font-semibold text-slate-800">#{user.id}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Member Since</div>
              <div className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Address
              </div>
              <div className="text-sm text-slate-700 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                {user.address}
              </div>
            </div>
          </div>

          {/* Special requirement: IF USER IS STORE OWNER, DISPLAY STORE RATING */}
          {user.role === 'store_owner' && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-teal-600" />
                  <span className="font-bold text-sm text-teal-950">Store Owner Performance</span>
                </div>
                <span className="text-[11px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                  Associated Store
                </span>
              </div>

              {user.store_name ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-base">{user.store_name}</div>
                      <div className="text-xs text-slate-500">{user.store_address}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-teal-700 flex items-center gap-1 justify-end">
                        {user.store_rating > 0 ? user.store_rating : 'New'}
                        <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {user.store_rating_count || 0} customer reviews
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No store currently linked to this owner account.</p>
              )}
            </div>
          )}

          {/* User's Submitted Ratings History */}
          {submittedRatings.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Ratings Submitted by This User ({submittedRatings.length})
              </h4>
              <div className="space-y-2">
                {submittedRatings.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{r.store_name}</p>
                      {r.comment && <p className="text-xs text-slate-500 italic mt-0.5">"{r.comment}"</p>}
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">
                      {r.rating} ★
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-all"
          >
            Close Details
          </button>
        </div>
      </motion.div>
    </div>
  );
}
