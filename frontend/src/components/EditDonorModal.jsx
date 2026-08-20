import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Calendar, Heart, Shield, CheckCircle2, AlertCircle, Trash2, Save, ToggleLeft, ToggleRight, Building, Compass } from 'lucide-react';
import { updateDonorProfile, deleteMyDonorProfile } from '../services/api';
import { TAMIL_NADU_DISTRICTS, getTaluksForDistrict } from '../data/tamilNaduLocations';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EditDonorModal({ donor, isOpen, onClose, currentUser, onDonorUpdated, onDonorDeleted }) {
  const [formData, setFormData] = useState({
    fullName: '',
    bloodGroup: 'O+',
    city: 'Chennai',
    area: 'Velachery',
    phone: '',
    age: 25,
    gender: 'Male',
    totalDonations: 0,
    lastDonationDate: '',
    isAvailable: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Available taluks for currently selected city
  const availableTaluks = getTaluksForDistrict(formData.city);

  useEffect(() => {
    if (donor) {
      const initialCity = donor.city || 'Chennai';
      const taluks = getTaluksForDistrict(initialCity);
      setFormData({
        fullName: donor.fullName || donor.full_name || '',
        bloodGroup: donor.bloodGroup || donor.blood_group || 'O+',
        city: initialCity,
        area: donor.area || (taluks.length > 0 ? taluks[0] : ''),
        phone: donor.phone ? donor.phone.replace(/\D/g, '').slice(0, 10) : '',
        age: donor.age || 25,
        gender: donor.gender || 'Male',
        totalDonations: donor.totalDonations !== undefined ? donor.totalDonations : (donor.total_donations || 0),
        lastDonationDate: donor.lastDonationDate || donor.last_donation_date || '',
        isAvailable: donor.isAvailable !== undefined ? donor.isAvailable : (donor.is_available !== 0)
      });
      setError('');
      setSuccessMsg('');
    }
  }, [donor, isOpen]);

  if (!isOpen || !donor) return null;

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    const taluks = getTaluksForDistrict(selectedCity);
    setFormData({
      ...formData,
      city: selectedCity,
      area: taluks.length > 0 ? taluks[0] : ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.fullName || !formData.phone || !formData.city) {
      setError('Please fill in all mandatory fields (Name, Phone, City).');
      return;
    }

    if (formData.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      setLoading(true);
      await updateDonorProfile(donor.id, formData, currentUser?.email);
      setSuccessMsg('Your donor profile has been updated successfully!');
      setTimeout(() => {
        onDonorUpdated?.();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to update donor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete / remove your donor profile from the network?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteMyDonorProfile(donor.id, currentUser?.email);
      onDonorDeleted?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete donor profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0B1120] p-4 sm:p-5 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold">Edit Donor Profile</h2>
              <p className="text-xs text-slate-400 font-medium">Manage your BloodPulse network listing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Blood Group *
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Contact Phone (10 Digits) *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl py-2.5 px-3 text-xs font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl py-2.5 px-3 text-xs text-slate-800"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* District & Dynamic Area (Taluk) Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                District / City *
              </label>
              <select
                value={formData.city}
                onChange={handleCityChange}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-800 cursor-pointer"
              >
                {TAMIL_NADU_DISTRICTS.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Area / Taluk *
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl py-2.5 px-3 text-xs font-medium text-slate-800 cursor-pointer"
              >
                {availableTaluks.map((taluk) => (
                  <option key={taluk} value={taluk}>
                    {taluk}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Age
              </label>
              <input
                type="number"
                min="18"
                max="65"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Past Donations
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalDonations}
                onChange={(e) => setFormData({ ...formData, totalDonations: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Last Donation Date
              </label>
              <input
                type="date"
                value={formData.lastDonationDate}
                onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-[11px]"
              />
            </div>
          </div>

          {/* Availability Status Toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Active Donor Status</p>
              <p className="text-[11px] text-slate-500">
                {formData.isAvailable ? 'Visible in donor search results' : 'Temporarily hidden from search'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
              className={`p-1 rounded-xl transition ${formData.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}
            >
              {formData.isAvailable ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Listing</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
