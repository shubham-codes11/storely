import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle,
  MapPin,
  Store,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import RatingModal from '../components/RatingModal';

export default function UserStoresView({ onOpenAuth, selectedStoreId }) {
  const { user, isAuthenticated } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState(false); // 4.5+ filter
  const [sortBy, setSortBy] = useState('name'); // 'name', 'rating', 'address'
  const [sortOrder, setSortOrder] = useState('asc');

  // Rating modal state
  const [activeRatingStore, setActiveRatingStore] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Fetch stores from API
  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.getStores({
        search,
        category: categoryFilter === 'All' ? '' : categoryFilter,
        sortBy,
        sortOrder
      });
      setStores(res.stores);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, categoryFilter, sortBy, sortOrder]);

  const handleRatingSubmit = async (storeId, { rating, comment }) => {
    await api.submitRating(storeId, { rating, comment });
    await fetchStores(); // Refresh store list with updated user rating & average
  };

  const openRating = (store) => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    setActiveRatingStore(store);
    setIsRatingModalOpen(true);
  };

  // Category & rating filter pills
  const filterPills = [
    { label: 'All Stores', category: 'All', ratingMin: false },
    { label: 'Highly Rated (4.5+)', category: 'All', ratingMin: true },
    { label: 'Electronics', category: 'Electronics', ratingMin: false },
    { label: 'Food & Grocery', category: 'Food & Grocery', ratingMin: false },
    { label: 'Fashion', category: 'Fashion', ratingMin: false },
    { label: 'Storely Picks', category: 'All', ratingMin: false }
  ];

  // Client-side 4.5+ filter if activated
  const displayedStores = ratingFilter
    ? stores.filter((s) => Number(s.overall_rating) >= 4.5)
    : stores;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quick Filter Bar */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-teal-600" />
          Quick Filter
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {filterPills.map((pill, idx) => {
            const isActive =
              pill.ratingMin
                ? ratingFilter
                : categoryFilter === pill.category && !ratingFilter;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (pill.ratingMin) {
                    setRatingFilter(!ratingFilter);
                  } else {
                    setRatingFilter(false);
                    setCategoryFilter(pill.category);
                  }
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-teal-500/25 ring-2 ring-teal-400/40'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Section Header with Search & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Linear Store Rows
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse verified stores, read community reviews, and submit your ratings (1 to 5 stars).
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="address">Sort by Address</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm flex items-center gap-1 text-xs font-bold transition-colors"
            title="Toggle Ascending/Descending"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="uppercase text-[10px]">{sortOrder}</span>
          </button>
        </div>
      </div>

      {/* Store Rows List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading verified stores...</p>
        </div>
      ) : displayedStores.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No stores found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to see more results.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {displayedStores.map((store) => {
              const hasUserRated = store.user_rating !== null && store.user_rating !== undefined;
              const isTargeted = Number(selectedStoreId) === Number(store.id);

              return (
                <motion.div
                  key={store.id}
                  id={`store-${store.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-white rounded-2xl p-5 border transition-all shadow-sm hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                    isTargeted ? 'ring-2 ring-teal-500 border-teal-500 bg-teal-50/20' : 'border-slate-200'
                  }`}
                >
                  {/* Left Column: Store Avatar, Name, Address, Category, and Overall Rating */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Store Logo/Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#122844] to-[#1e3a63] text-teal-300 font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md border border-slate-700">
                      {store.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                          {store.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          {store.category || 'Retail'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{store.address}</span>
                      </div>

                      {/* Overall Rating and review snippet */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(Number(store.overall_rating || 0))
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-extrabold text-slate-900">
                          {store.overall_rating > 0 ? `${store.overall_rating}/5` : 'No ratings yet'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          ({store.total_ratings} {store.total_ratings === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>

                      {store.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 pt-1 border-t border-slate-100 italic">
                          "{store.description}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Embedded Box: "Your Rating" */}
                  <div className="lg:w-64 bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col items-center justify-center text-center shadow-inner shrink-0">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Rating
                    </span>

                    {/* Star row */}
                    <div className="flex items-center gap-1 mb-2.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = hasUserRated && star <= store.user_rating;
                        return (
                          <Star
                            key={star}
                            className={`w-5 h-5 transition-transform ${
                              isFilled
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Action Button: Submit or Modify */}
                    {hasUserRated ? (
                      <div className="w-full space-y-1">
                        <button
                          onClick={() => openRating(store)}
                          className="w-full py-1.5 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs border border-teal-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                          Modify Rating ({store.user_rating}★)
                        </button>
                        {store.user_comment && (
                          <p className="text-[11px] text-slate-500 italic truncate px-1">
                            "{store.user_comment}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => openRating(store)}
                        className="w-full py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Submit Rating
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Rating Modal for Submitting / Modifying */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        store={activeRatingStore}
        initialRating={activeRatingStore?.user_rating || 0}
        initialComment={activeRatingStore?.user_comment || ''}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
}
