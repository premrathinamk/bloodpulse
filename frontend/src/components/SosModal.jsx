import React, { useState } from 'react';
import { X, Siren, AlertCircle, Building2, User, Phone, Droplet, Radio, Building, Compass } from 'lucide-react';
import { broadcastEmergencySos } from '../services/api';
import { TAMIL_NADU_DISTRICTS, getTaluksForDistrict } from '../data/tamilNaduLocations';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const URGENCIES = ['CRITICAL', 'IMMEDIATE', 'URGENT'];

export default function SosModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'O+',
    unitsNeeded: 2,
    hospitalName: '',
    city: 'Chennai',
    area: 'Guindy',
    contactPerson: '',
    contactPhone: '',
    urgency: 'CRITICAL',
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dynamic taluks
  const availableTaluks = getTaluksForDistrict(formData.city);

  if (!isOpen) return null;

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
    if (!formData.patientName || !formData.hospitalName || !formData.contactPhone) {
      setError('Please fill in all mandatory emergency fields.');
      return;
    }

    if (formData.contactPhone.length !== 10) {
      setError('Emergency contact phone must be exactly 10 digits.');
      return;
    }

    try {
      setLoading(true);
      await broadcastEmergencySos(formData);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to broadcast SOS alert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 sm:p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Siren className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Broadcast Emergency SOS</h2>
              <p className="text-[11px] sm:text-xs text-rose-100 font-medium">Alerts all active compatible donors in district</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Required Blood Group *
              </label>
              <div className="relative">
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-bold text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Units Needed *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.unitsNeeded}
                onChange={(e) => setFormData({ ...formData, unitsNeeded: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Patient Full Name *
            </label>
            <input
              type="text"
              placeholder="Enter patient name"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Hospital Name *
            </label>
            <input
              type="text"
              placeholder="Hospital name"
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              required
            />
          </div>

          {/* District & Dynamic Area (Taluk) Dropdowns */}
          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                placeholder="Contact person name"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Emergency Phone (10 Digits) *
              </label>
              <input
                type="tel"
                placeholder="10-digit emergency number"
                maxLength={10}
                pattern="[0-9]{10}"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-mono text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Urgency Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {URGENCIES.map((urg) => (
                <button
                  type="button"
                  key={urg}
                  onClick={() => setFormData({ ...formData, urgency: urg })}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    formData.urgency === urg
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {urg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Emergency Case Notes (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Case details, specific ward/unit..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-red-600/30 uppercase tracking-wide transition active:scale-95"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{loading ? 'Broadcasting...' : 'BROADCAST SOS NOW'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
