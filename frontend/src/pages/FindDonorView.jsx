import React from 'react';
import FilterBar from '../components/FilterBar';
import EmergencyBanner from '../components/EmergencyBanner';
import DonorCard from '../components/DonorCard';
import { Users, RefreshCw } from 'lucide-react';

export default function FindDonorView({
  donors,
  loading,
  bloodGroup,
  setBloodGroup,
  locality,
  setLocality,
  compatible,
  setCompatible,
  currentUser,
  onOpenSosModal,
  onRequestContact,
  onEditDonor,
  onDeleteDonor,
  onRefresh
}) {
  return (
    <div>
      {/* Filter Component */}
      <FilterBar
        bloodGroup={bloodGroup}
        setBloodGroup={setBloodGroup}
        locality={locality}
        setLocality={setLocality}
        compatible={compatible}
        setCompatible={setCompatible}
        verifiedCount={donors.length}
      />

      {/* Emergency Critical Banner */}
      <EmergencyBanner onOpenSosModal={onOpenSosModal} />

      {/* Donors Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mb-3" />
            <p className="text-sm font-medium">Scanning live verified donor network...</p>
          </div>
        ) : donors.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No matching donors found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Try enabling "Include medically compatible groups" or adjusting your search locality.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {donors.map((donor) => (
              <DonorCard
                key={donor.id}
                donor={donor}
                currentUser={currentUser}
                onRequestContact={onRequestContact}
                onEditDonor={onEditDonor}
                onDeleteDonor={onDeleteDonor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
