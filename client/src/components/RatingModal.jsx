import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export default function RatingModal({ isOpen, onClose, store, initialRating = 0, initialComment = '', onSubmit }) {
  const [rating, setRating] = useState(initialRating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialComment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRating) setRating(initialRating);
    if (initialComment) setComment(initialComment);
  }, [initialRating, initialComment]);

  if (!isOpen || !store) return null;

  const starLabels = {
    1: 'Poor (1/5)',
    2: 'Fair (2/5)',
    3: 'Good (3/5)',
    4: 'Very Good (4/5)',
    5: 'Excellent! (5/5)'
  };

  const currentDisplayRating = hoverRating || rating;

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(store.id, { rating, comment });
      // Fire celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not submit rating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
      >
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            {initialRating ? 'Modify Your Submitted Rating' : 'Submit Store Rating'}
          </div>
          <h2 className="text-xl font-extrabold text-white leading-snug">{store.name}</h2>
          <p className="text-xs text-slate-300 mt-1 truncate">{store.address}</p>
        </div>

        <form onSubmit={handleRatingSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Star selector */}
          <div className="text-center py-2">
            <div className="text-sm font-bold text-slate-700 mb-2">
              Select Score: <span className="text-teal-600">{starLabels[currentDisplayRating] || 'Click to rate'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const filled = starVal <= (hoverRating || rating);
                return (
                  <button
                    type="button"
                    key={starVal}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starVal)}
                    className="p-1.5 focus:outline-none transform hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        filled
                          ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                          : 'text-slate-300 hover:text-amber-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback comment note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Feedback / Review Comment (Optional)
            </label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details of your experience with this store..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !rating}
              className="px-5 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : initialRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
