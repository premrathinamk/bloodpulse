import React, { useState } from 'react';
import { X, Phone, Shield, Copy, Check, AlertCircle, HeartHandshake } from 'lucide-react';
import { requestDonorContact } from '../services/api';

export default function ContactModal({ donor, isOpen, onClose }) {
  const [unmaskedData, setUnmaskedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [requesterName, setRequesterName] = useState('');
  const [purpose, setPurpose] = useState('Emergency Blood Requirement');

  if (!isOpen || !donor) return null;

  const handleRevealContact = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await requestDonorContact(donor.id, {
        requesterName: requesterName || 'Emergency Requester',
        purpose
      });
      setUnmaskedData(data.donor);
    } catch (err) {
      setError(err.message || 'Failed to retrieve donor contact details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (unmaskedData?.phone) {
      navigator.clipboard.writeText(unmaskedData.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 p-4 sm:p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold">Request Donor Contact</h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Privacy-First Protected Access</p>
            </div>
          </div>
          <button
            onClick={() => {
              setUnmaskedData(null);
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Donor Summary Info */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">{donor.fullName}</span>
                <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600">
                  {donor.bloodGroup}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {donor.area ? `${donor.area}, ${donor.city}` : donor.city}
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="text-slate-500">Status: </span>
              <strong className={donor.eligibilityStatus === 'eligible' ? 'text-emerald-600' : 'text-slate-700'}>
                {donor.eligibilityBadge}
              </strong>
            </div>
          </div>

          {!unmaskedData ? (
            <form onSubmit={handleRevealContact} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Please use donor contacts responsibly for genuine medical emergencies only. Contact requests are logged for security.
                </span>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Your Name / Hospital Attender
                </label>
                <input
                  type="text"
                  placeholder="Enter your name / hospital attender"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Requirement Reason
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-medium"
                >
                  <option value="Emergency Blood Requirement">Emergency Blood Requirement</option>
                  <option value="Scheduled Hospital Surgery">Scheduled Hospital Surgery</option>
                  <option value="Platelets / Dialysis Support">Platelets / Dialysis Support</option>
                  <option value="Blood Bank Reserve">Blood Bank Reserve</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{loading ? 'Revealing...' : 'Reveal Phone Number'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-2 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Direct Contact Number</h4>
                <div className="text-2xl font-mono font-extrabold text-slate-900 mt-1 select-all">
                  {unmaskedData.phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`tel:${unmaskedData.phone}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Directly</span>
                </a>

                <button
                  onClick={handleCopy}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Number'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
