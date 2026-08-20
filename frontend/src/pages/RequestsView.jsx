import React, { useState } from 'react';
import { Plus, FileText, Calendar, Building2, MapPin, Phone, AlertCircle, CheckCircle, Building, Compass } from 'lucide-react';
import { createBloodRequest } from '../services/api';
import { TAMIL_NADU_DISTRICTS, getTaluksForDistrict } from '../data/tamilNaduLocations';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RequestsView({ requests, loading, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: 'B+',
    unitsNeeded: 1,
    hospitalName: '',
    city: 'Chennai',
    area: 'Mambalam',
    requiredByDate: '',
    contactPhone: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Available taluks for currently selected city
  const availableTaluks = getTaluksForDistrict(formData.city);

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
    if (formData.contactPhone.length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setSubmitting(true);
      await createBloodRequest(formData);
      setMessage('Blood request created successfully!');
      setTimeout(() => {
        setMessage('');
        setShowModal(false);
        onRefresh?.();
      }, 1200);
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Patient Blood Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Planned transfusions, scheduled surgery requirements, and ongoing patient blood requests across Tamil Nadu.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Post Blood Request</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Pending Blood Requests</h3>
          <p className="text-xs text-slate-500 mt-1">All hospital blood requests are currently fulfilled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600">
                    {req.bloodGroup} • {req.unitsNeeded} {req.unitsNeeded > 1 ? 'Units' : 'Unit'}
                  </span>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {req.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  Patient: {req.patientName}
                </h3>

                <div className="text-xs text-slate-500 space-y-1 mt-2">
                  <p className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.hospitalName} ({req.area ? `${req.area}, ${req.city}` : req.city})</span>
                  </p>
                  {req.requiredByDate && (
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Required by: {req.requiredByDate}</span>
                    </p>
                  )}
                  {req.notes && (
                    <p className="italic text-slate-600 bg-slate-50 p-2 rounded-lg mt-1.5">
                      "{req.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${req.contactPhone}`}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Attender ({req.contactPhone})</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-slate-200 overflow-hidden">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex-shrink-0">Post Patient Blood Request</h2>
            {message && (
              <div className="bg-emerald-50 text-emerald-700 text-xs p-3 rounded-xl mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="Enter patient name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Blood Group *</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold"
                  >
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Units *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.unitsNeeded}
                    onChange={(e) => setFormData({ ...formData, unitsNeeded: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Hospital Name *</label>
                <input
                  type="text"
                  required
                  value={formData.hospitalName}
                  onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                  placeholder="Hospital name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              {/* District & Dynamic Area (Taluk) Dropdowns */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">District / City *</label>
                  <select
                    value={formData.city}
                    onChange={handleCityChange}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl py-2 px-3 text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    {TAMIL_NADU_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Area / Taluk *</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 rounded-xl py-2 px-3 text-xs font-medium text-slate-800 cursor-pointer"
                  >
                    {availableTaluks.map((taluk) => (
                      <option key={taluk} value={taluk}>
                        {taluk}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Required By Date</label>
                  <input
                    type="date"
                    value={formData.requiredByDate}
                    onChange={(e) => setFormData({ ...formData, requiredByDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Phone (10 Digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Notes (Optional)</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details, blood components (e.g. Platelets, FFP)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs"
                >
                  {submitting ? 'Submitting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
