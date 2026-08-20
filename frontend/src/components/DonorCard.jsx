import React from 'react';
import { MapPin, Phone, ShieldCheck, Edit, Trash2, UserCheck } from 'lucide-react';

export default function DonorCard({ donor, onRequestContact, currentUser, onEditDonor, onDeleteDonor }) {
  const isEligible = donor.eligibilityStatus === 'eligible';
  const isOwner = currentUser?.email && donor.email && (
    currentUser.email.trim().toLowerCase() === donor.email.trim().toLowerCase() ||
    currentUser.role === 'ADMIN'
  );

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group ${
      isOwner ? 'border-rose-300 ring-2 ring-rose-100/80' : 'border-slate-200/90'
    }`}>
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          {/* Blood Group Pill */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center font-bold text-xs sm:text-sm px-3 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600">
              {donor.bloodGroup}
            </span>
            {isOwner && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>Your Post</span>
              </span>
            )}
          </div>

          {/* Eligibility / Cooldown Badge */}
          <span
            className={`text-[11px] font-semibold px-3 py-0.5 rounded-full shadow-xs ${
              isEligible
                ? 'bg-[#0F172A] text-emerald-400 border border-emerald-950/40'
                : 'bg-[#1E293B] text-slate-300 border border-slate-800'
            }`}
          >
            {donor.eligibilityBadge}
          </span>
        </div>

        {/* Donor Name & Location */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                {donor.fullName}
              </h3>
              {donor.isVerified && (
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" title="Verified Donor" />
              )}
            </div>

            {/* Owner quick edit/delete buttons */}
            {isOwner && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditDonor?.(donor)}
                  title="Edit Your Donor Details"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteDonor?.(donor)}
                  title="Delete Your Donor Listing"
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              {donor.area ? `${donor.area}, ${donor.city}` : donor.city}
            </span>
          </p>
        </div>

        {/* Divider / Stats */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div>
            Donations: <strong className="text-slate-700 font-semibold">{donor.totalDonations}</strong>
          </div>
          <div>
            <span className={isEligible && donor.lastDonationText === 'First-time donor' ? 'text-indigo-600 font-semibold' : 'text-slate-500'}>
              {donor.lastDonationText}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 space-y-2">
        {isOwner ? (
          <button
            onClick={() => onEditDonor?.(donor)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98]"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit My Donor Post</span>
          </button>
        ) : (
          <button
            onClick={() => onRequestContact(donor)}
            className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all duration-150 active:scale-[0.98]"
          >
            <Phone className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            <span className="truncate">
              Request Contact ({donor.maskedPhone})
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
