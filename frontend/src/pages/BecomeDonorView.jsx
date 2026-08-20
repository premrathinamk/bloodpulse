import React, { useState, useEffect } from 'react';
import { Heart, UserCheck, Shield, Sparkles, CheckCircle2, AlertCircle, Trash2, Edit3, Save, Building, Compass } from 'lucide-react';
import { registerDonor, fetchMyDonorProfile, deleteMyDonorProfile } from '../services/api';
import { TAMIL_NADU_DISTRICTS, getTaluksForDistrict } from '../data/tamilNaduLocations';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BecomeDonorView({ currentUser, onSuccessRegistration, onDonorDeleted }) {
  const [formData, setFormData] = useState({
    fullName: '',
    bloodGroup: 'O+',
    city: 'Chennai',
    area: 'Velachery',
    phone: '',
    email: '',
    age: 24,
    gender: 'Male',
    lastDonationDate: '',
    totalDonations: 0
  });

  const [existingDonorId, setExistingDonorId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Available taluks for the selected district
  const availableTaluks = getTaluksForDistrict(formData.city);

  // Load existing profile if user is logged in
  useEffect(() => {
    async function loadProfile() {
      if (currentUser?.email) {
        try {
          setCheckingProfile(true);
          const res = await fetchMyDonorProfile(currentUser.email);
          if (res.success && res.exists && res.donor) {
            setExistingDonorId(res.donor.id);
            setFormData({
              fullName: res.donor.fullName || currentUser.fullName || '',
              bloodGroup: res.donor.bloodGroup || 'O+',
              city: res.donor.city || 'Chennai',
              area: res.donor.area || 'Velachery',
              phone: res.donor.phone ? res.donor.phone.replace(/\D/g, '').slice(0, 10) : '',
              email: currentUser.email,
              age: res.donor.age || 24,
              gender: res.donor.gender || 'Male',
              lastDonationDate: res.donor.lastDonationDate || '',
              totalDonations: res.donor.totalDonations !== undefined ? res.donor.totalDonations : 0
            });
          } else {
            setExistingDonorId(null);
            setFormData((prev) => ({
              ...prev,
              fullName: currentUser.fullName || '',
              email: currentUser.email
            }));
          }
        } catch (e) {
          console.warn('Could not load donor profile:', e);
        } finally {
          setCheckingProfile(false);
        }
      }
    }
    loadProfile();
  }, [currentUser]);

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    const taluks = getTaluksForDistrict(selectedCity);
    setFormData({
      ...formData,
      city: selectedCity,
      area: taluks.length > 0 ? taluks[0] : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.fullName || !formData.phone || !formData.city) {
      setError('Please fill in your name, 10-digit mobile number, and district.');
      return;
    }

    if (formData.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerDonor(formData);
      setSuccessMsg(existingDonorId ? 'Your donor profile has been updated successfully!' : 'You are now registered as an active lifesaver on BloodPulse!');
      if (res.donorId) {
        setExistingDonorId(res.donorId);
      }
      onSuccessRegistration?.();
    } catch (err) {
      setError(err.message || 'Failed to save donor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!existingDonorId) return;
    if (!window.confirm('Are you sure you want to permanently delete your donor listing from BloodPulse?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteMyDonorProfile(existingDonorId, currentUser?.email);
      setExistingDonorId(null);
      setSuccessMsg('Your donor listing has been removed.');
      setFormData({
        fullName: currentUser?.fullName || '',
        bloodGroup: 'O+',
        city: 'Chennai',
        area: 'Velachery',
        phone: '',
        email: currentUser?.email || '',
        age: 24,
        gender: 'Male',
        lastDonationDate: '',
        totalDonations: 0
      });
      onDonorDeleted?.();
    } catch (err) {
      setError(err.message || 'Failed to delete donor profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-rose-100 text-rose-600 mb-1">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {existingDonorId ? 'Manage Your Donor Profile' : 'Join the Rapid Donor Network'}
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {existingDonorId 
            ? 'Update your availability, district, taluk, and blood donation records anytime.'
            : 'Every donation saves up to 3 lives. Your contact details remain protected and are only requested during verified emergencies.'}
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
        {existingDonorId && (
          <div className="bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs p-4 rounded-2xl mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-sm">Active Donor Listing Verified</span>
                <p className="text-emerald-700 text-[11px]">You can edit your details or withdraw your post below.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDeleteProfile}
              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-[11px] flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Post</span>
            </button>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-xl mb-5 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Saved Successfully!</p>
              <p>{successMsg}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl mb-5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-800 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Blood Group *
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-800 transition"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Phone Number (10 Digits) *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 rounded-xl py-2.5 px-3 text-sm font-mono text-slate-800 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-800 transition"
              />
            </div>
          </div>

          {/* District & Dynamic Area (Taluk) Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                District / City (Tamil Nadu) *
              </label>
              <select
                value={formData.city}
                onChange={handleCityChange}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-800 transition cursor-pointer"
              >
                {TAMIL_NADU_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Area / Taluk *
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 rounded-xl py-2.5 px-3 text-sm font-medium text-slate-800 transition cursor-pointer"
              >
                {availableTaluks.map((taluk) => (
                  <option key={taluk} value={taluk}>
                    {taluk}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Age
              </label>
              <input
                type="number"
                min="18"
                max="65"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Total Past Donations
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalDonations}
                onChange={(e) => setFormData({ ...formData, totalDonations: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                Last Donation Date
              </label>
              <input
                type="date"
                value={formData.lastDonationDate}
                onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {existingDonorId ? (
              <>
                <button
                  type="button"
                  onClick={handleDeleteProfile}
                  disabled={loading}
                  className="px-4 py-3 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Withdraw My Post</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm tracking-wide shadow-md transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Updating...' : 'UPDATE MY DONOR DETAILS'}</span>
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white py-3 rounded-xl font-bold text-sm tracking-wide shadow-md shadow-rose-600/30 uppercase transition active:scale-98 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Registering...' : 'REGISTER AS BLOOD DONOR'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
