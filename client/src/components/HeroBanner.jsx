import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HeroBanner({ onOpenAuth, onExplore }) {
  return (
    <motion.div
      className="mx-4 sm:mx-6 lg:mx-8 mt-6 rounded-2xl overflow-hidden shadow-2xl"
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {/* Banner image — shown as-is, no text overlay since image already has text */}
      <div className="relative">
        <img
          src="/hero-banner.png"
          alt="Storely - Rate Stores, Build a Better Community"
          className="w-full object-cover block"
          style={{ maxHeight: '400px', objectPosition: 'center top' }}
        />

        {/* CTA buttons — positioned bottom-left over image, clear of image text */}
        <div className="absolute bottom-6 left-6 sm:left-10 lg:left-14 flex items-center gap-3">
          <motion.button
            onClick={onExplore}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="group flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-extrabold text-sm px-6 py-3 rounded-full shadow-xl shadow-yellow-500/40 transition-colors"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.button
            onClick={() => onOpenAuth('login')}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white font-bold text-sm px-5 py-3 rounded-full transition-colors"
          >
            Sign In
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
