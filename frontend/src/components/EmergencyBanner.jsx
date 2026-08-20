import React from 'react';
import { Siren, Radio } from 'lucide-react';

export default function EmergencyBanner({ onOpenSosModal }) {
  return (
    <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-start sm:items-center gap-3 sm:gap-3.5">
        <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#EF4444] text-white flex items-center justify-center shadow-md shadow-red-500/20">
          <Siren className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">
              Critical Blood Emergency?
            </h3>
            <span className="bg-[#DC2626] text-white text-[9px] sm:text-[10px] uppercase font-extrabold px-1.5 sm:px-2 py-0.5 rounded tracking-wide flex items-center gap-1 shadow-xs">
              <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-pulse" />
              LIVE BROADCAST
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
            Instantly broadcast an SOS alert to all compatible registered donors in this district.
          </p>
        </div>
      </div>

      <button
        onClick={onOpenSosModal}
        className="w-full md:w-auto bg-[#DC2626] hover:bg-[#B91C1C] text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md shadow-red-600/30 uppercase transition-all duration-150 active:scale-95 whitespace-nowrap"
      >
        <Siren className="w-4 h-4" />
        <span>SEND EMERGENCY SOS</span>
      </button>
    </div>
  );
}
