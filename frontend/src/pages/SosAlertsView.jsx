import React from 'react';
import { Siren, Clock, Building2, MapPin, Phone, Radio, Plus, CheckCircle } from 'lucide-react';

export default function SosAlertsView({ alerts, loading, onOpenSosModal, onRefresh }) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Live Emergency SOS Alerts
            </h1>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Active emergency blood transfusion requests requiring immediate donor intervention.
          </p>
        </div>

        <button
          onClick={onOpenSosModal}
          className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md shadow-red-600/30 uppercase transition active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Broadcast New SOS</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading active emergencies...
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Critical Emergencies Active</h3>
          <p className="text-xs text-slate-500 mt-1">All broadcasted hospital emergencies are currently resolved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border-l-4 border-l-red-600 border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="bg-red-600 text-white font-extrabold text-sm px-3 py-1 rounded-lg">
                    {alert.bloodGroup}
                  </span>
                  <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                    <Radio className="w-3 h-3 text-red-600 animate-pulse" />
                    {alert.urgency}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Units Needed: <span className="text-red-600 font-extrabold">{alert.unitsNeeded}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Patient: {alert.patientName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {alert.hospitalName}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {alert.area ? `${alert.area}, ${alert.city}` : alert.city}
                    </span>
                  </div>
                </div>

                {alert.details && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{alert.details}"
                  </p>
                )}
              </div>

              {/* Action Box */}
              <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2">
                <div className="text-left md:text-right text-xs text-slate-500">
                  <span>Contact: </span>
                  <strong className="text-slate-800 font-semibold">{alert.contactPerson}</strong>
                </div>
                <a
                  href={`tel:${alert.contactPhone}`}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/30 uppercase tracking-wide transition active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Hospital ({alert.contactPhone})</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
