import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, CheckCircle2, Building, Compass } from 'lucide-react';
import { TAMIL_NADU_DISTRICTS, getTaluksForDistrict } from '../data/tamilNaduLocations';

const BLOOD_GROUPS = [
  'Any Blood Group',
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-'
];

export default function FilterBar({
  bloodGroup,
  setBloodGroup,
  locality,
  setLocality,
  compatible,
  setCompatible,
  verifiedCount = 0
}) {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  // Available taluks for the currently selected district
  const availableTaluks = selectedDistrict ? getTaluksForDistrict(selectedDistrict) : [];

  // When district changes, update area list and locality filter
  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    setSelectedArea('');
    setLocality(district);
  };

  // When area changes, update locality filter
  const handleAreaChange = (e) => {
    const area = e.target.value;
    setSelectedArea(area);
    if (area) {
      setLocality(area);
    } else {
      setLocality(selectedDistrict);
    }
  };

  return (
    <div className="mb-6 sm:mb-8">
      {/* Title & Description */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Compatible Blood Donors
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-500 mt-1 sm:mt-1.5 font-normal">
          Search active donors by patient blood group, Tamil Nadu district, and local taluk/area.
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          
          {/* 1. Blood Group Selector */}
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              BLOOD GROUP NEEDED
            </label>
            <div className="relative">
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full appearance-none bg-slate-50/70 hover:bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 pr-10 transition cursor-pointer"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 2. City / District Dropdown (All 38 Districts) */}
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              DISTRICT / CITY (38 DISTRICTS)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-rose-500">
                <Building className="w-4 h-4" />
              </div>
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                className="w-full appearance-none bg-slate-50/70 hover:bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-10 transition cursor-pointer"
              >
                <option value="">All Districts / Cities</option>
                {TAMIL_NADU_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 3. Area / Taluk Dropdown (Dynamic based on selected district) */}
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              AREA / TALUK
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none text-teal-600">
                <Compass className="w-4 h-4" />
              </div>
              <select
                value={selectedArea}
                onChange={handleAreaChange}
                disabled={!selectedDistrict}
                className={`w-full appearance-none border focus:ring-2 text-xs sm:text-sm rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-10 transition cursor-pointer font-medium ${
                  selectedDistrict
                    ? 'bg-slate-50/70 hover:bg-slate-50 border-slate-200 focus:border-rose-500 focus:ring-rose-200 text-slate-800'
                    : 'bg-slate-100/60 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {!selectedDistrict ? (
                  <option value="">← Select District First</option>
                ) : (
                  <>
                    <option value="">All Areas in {selectedDistrict}</option>
                    {availableTaluks.map((taluk) => (
                      <option key={taluk} value={taluk}>
                        {taluk}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Compatibility Row & Counter */}
        <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={compatible}
                onChange={(e) => setCompatible(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-10 sm:w-11 h-5 sm:h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  compatible ? 'bg-teal-700' : 'bg-slate-300'
                }`}
              ></div>
              <div
                className={`absolute left-0.5 top-0.5 bg-white w-4 sm:w-5 h-4 sm:h-5 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${
                  compatible ? 'transform translate-x-5' : ''
                }`}
              ></div>
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              Include medically compatible groups <span className="text-slate-400 text-xs hidden md:inline">(e.g. O- universal donors)</span>
            </span>
          </label>

          <div className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
            <span>
              Showing <strong className="text-slate-800 font-bold">{verifiedCount}</strong> verified donors
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
