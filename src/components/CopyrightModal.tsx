import React from 'react';
import { X, ShieldCheck, FileText, Sparkles, Building, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CopyrightModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const CopyrightModal: React.FC<CopyrightModalProps> = ({
  isOpen,
  onClose,
  isDark
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-10 border-2 border-[#D4AF37] shadow-2xl text-left ${
            isDark ? 'bg-[#18120D] text-[#FAF5EE]' : 'bg-[#FAF6EF] text-[#2C2117]'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#B93826] text-white hover:bg-[#A22B1A] transition-all shadow-md"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              <span className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#B93826] dark:text-[#E5A93C]">
                Official Legal & Intellectual Property Notice
              </span>
            </div>

            <h3 className={`font-cinzel text-2xl font-black ${isDark ? 'text-[#FFE58F]' : 'text-[#2D1E16]'}`}>
              Copyright & Publication Rights
            </h3>

            <div className="h-[1.5px] w-full bg-gradient-to-r from-[#D4AF37] via-[#B93826] to-transparent" />

            <div className="space-y-3 font-serif text-xs sm:text-sm text-[#4A382A] dark:text-[#DCD0C4] leading-relaxed">
              <p>
                <strong>© 2026 Pratyay Saha. All Rights Reserved.</strong>
              </p>
              
              <p>
                The literary work titled <strong className="font-cinzel text-[#B93826] dark:text-[#E5A93C]">Wilting of Words</strong>, including all manuscript pages, prose, chapter titles, character names, cover artwork, and original illustrations, is the exclusive intellectual property of author <strong>Pratyay Saha</strong> and published under <strong>Technodef Press</strong>.
              </p>

              <p>
                No part of this publication or website may be reproduced, stored in a retrieval system, or transmitted in any form or by any means—electronic, mechanical, photocopying, recording, or otherwise—without the prior written permission of the author and publisher, except for brief quotations embodied in critical reviews or literary features.
              </p>

              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[#D4AF37]/30 text-xs">
                <h5 className="font-cinzel font-bold text-[#8B2213] dark:text-[#ECC480] mb-1">
                  Publisher Consecration
                </h5>
                <p className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                  Published by Technodef Press • Chakdaha, West Bengal, India.<br />
                  First Edition Publication Date: 29 November 2026.
                </p>
              </div>

              <div className="pt-3 border-t border-black/10 dark:border-white/10 text-[11px] font-mono opacity-70 text-center">
                Legal Inquiries: legal@technodef.com • Ref: WOW-2026-COPYRIGHT
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
