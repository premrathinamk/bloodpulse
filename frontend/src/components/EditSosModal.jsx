import React, { useState, useEffect } from 'react';
import { X, Siren, AlertCircle, CheckCircle2, Trash2, Save, Radio, Building, Compass } from 'lucide-react';
import { updateSosAlert, deleteSosAlert } from '../services/api';
import { TAMIL_NADU_DISTRICTS, getTaluksForDistrict } from '../data/tamilNaduLocations';

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
const URGENCIES = ['CRITICAL', 'IMMEDIATE', 'URGENT'];
const STATUSES = ['ACTIVE', 'FULFILLED', 'EXPIRED'];

export default function EditSosModal({ alert, isOpen, onClose, currentUser, onAlertUpdated, onAlertDeleted }) {
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
    status: 'ACTIVE',
    details: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dynamic taluks
  const availableTaluks = getTaluksForDistrict(formData.city);

  useEffect(() => {
    if (alert) {
      const initialCity = alert.city || 'Chennai';
      const taluks = getTaluksForDistrict(initialCity);
      setFormData({
        patientName: alert.patientName || alert.patient_name || '',
        bloodGroup: alert.bloodGroup || alert.blood_group || 'O+',
        unitsNeeded: alert.unitsNeeded !== undefined ? alert.unitsNeeded : (alert.units_needed || 2),
        hospitalName: alert.hospitalName || alert.hospital_name || '',
        city: initialCity,
        area: alert.area || (taluks.length > 0 ? taluks[0] : ''),
        contactPerson: alert.contactPerson || alert.contact_person || '',
        contactPhone: alert.contactPhone ? alert.contactPhone.replace(/\D/g, '').slice(0, 10) : '',
        urgency: alert.urgency || 'CRITICAL',
        status: alert.status || 'ACTIVE',
        details: alert.details || ''
      });
      setError('');
      setSuccessMsg('');
    }
  }, [alert, isOpen]);

  if (!isOpen || !alert) return null;

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
      await updateSosAlert(alert.id, formData, currentUser?.email);
      setSuccessMsg('Emergency SOS Alert updated successfully!');
      setTimeout(() => {
        onAlertUpdated?.();
        onClose();
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to update SOS alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this SOS emergency broadcast?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteSosAlert(alert.id, currentUser?.email);
      onAlertDeleted?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete SOS alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 sm:p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Siren className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Edit Emergency SOS Alert</h2>
              <p className="text-[11px] sm:text-xs text-rose-100 font-medium">Update status or withdraw emergency post</p>
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
        <form onSubmit={handleUpdate} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Required Blood Group *
              </label>
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

          {/* Urgency and Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Urgency Level
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800"
              >
                {URGENCIES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Broadcast Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Case Notes / Details
            </label>
            <textarea
              rows="2"
              placeholder="Specific ward, blood component, details..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete SOS</span>
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
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
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
