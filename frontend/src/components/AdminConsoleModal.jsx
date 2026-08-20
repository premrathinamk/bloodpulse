import React, { useState, useEffect } from 'react';
import { 
  X, ShieldAlert, Trash2, RefreshCw, AlertTriangle, Users, FileText, 
  PhoneCall, Building2, MapPin, Calendar, CheckCircle2, Search, ShieldCheck 
} from 'lucide-react';
import { fetchAdminData, deleteDonorById, deleteSosAlertById, deleteBloodRequestById } from '../services/api';

export default function AdminConsoleModal({ isOpen, onClose, currentUser, onDataChanged }) {
  const [activeTab, setActiveTab] = useState('donors');
  const [data, setData] = useState({
    donors: [],
    sosAlerts: [],
    bloodRequests: [],
    contactLogs: [],
    users: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadData = async () => {
    if (!currentUser?.email) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetchAdminData(currentUser.email);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin console data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeleteDonor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete donor "${name}" (#${id})?`)) {
      return;
    }
    try {
      setDeletingId(id);
      await deleteDonorById(id, currentUser.email);
      setActionMessage(`Donor #${id} (${name}) deleted successfully.`);
      await loadData();
      onDataChanged?.();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete donor');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteSos = async (id, patientName) => {
    if (!window.confirm(`Are you sure you want to delete Emergency SOS Alert for patient "${patientName}" (#${id})?`)) {
      return;
    }
    try {
      setDeletingId(id);
      await deleteSosAlertById(id, currentUser.email);
      setActionMessage(`Emergency SOS #${id} deleted successfully.`);
      await loadData();
      onDataChanged?.();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete SOS alert');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteRequest = async (id, patientName) => {
    if (!window.confirm(`Are you sure you want to delete Blood Request for "${patientName}" (#${id})?`)) {
      return;
    }
    try {
      setDeletingId(id);
      await deleteBloodRequestById(id, currentUser.email);
      setActionMessage(`Blood Request #${id} deleted successfully.`);
      await loadData();
      onDataChanged?.();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete request');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter lists based on search
  const filteredDonors = data.donors.filter(d => 
    d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.blood_group?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSos = data.sosAlerts.filter(s => 
    s.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.blood_group?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = data.bloodRequests.filter(r => 
    r.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.blood_group?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Admin Header */}
        <div className="bg-[#0B1120] text-white p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-950/80">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">BloodPulse Admin Console</h2>
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                  ROOT ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Logged in as Superuser: <strong className="text-rose-400 font-mono">{currentUser?.email}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Refresh Data"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Search Bar */}
        <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'donors', label: 'Registered Donors', count: data.donors.length, icon: Users },
              { id: 'sos', label: 'SOS Broadcasts', count: data.sosAlerts.length, icon: AlertTriangle },
              { id: 'requests', label: 'Blood Requests', count: data.bloodRequests.length, icon: FileText },
              { id: 'contacts', label: 'Contact Access Logs', count: data.contactLogs.length, icon: PhoneCall },
              { id: 'users', label: 'Auth Accounts', count: data.users.length, icon: ShieldCheck },
            ].map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive 
                      ? 'bg-rose-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-rose-800 text-rose-100' : 'bg-slate-800 text-slate-400'}`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {actionMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-2xl mb-4 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <RefreshCw className="w-7 h-7 animate-spin text-rose-600 mb-2" />
              <span>Loading database tables from Turso...</span>
            </div>
          ) : (
            <>
              {/* 1. DONORS TAB */}
              {activeTab === 'donors' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Total Donors in Database: {filteredDonors.length}
                  </div>
                  {filteredDonors.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                      No donors found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredDonors.map(d => (
                        <div key={d.id} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">{d.full_name}</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600">
                                {d.blood_group}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">#{d.id}</span>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{d.area ? `${d.area}, ${d.city}` : d.city}</span>
                            </p>
                            <p className="text-xs text-slate-600 font-mono font-medium">
                              📞 {d.phone} {d.email ? `• ${d.email}` : ''}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Donations: {d.total_donations || 0} • Registered: {d.created_at ? new Date(d.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteDonor(d.id, d.full_name)}
                            disabled={deletingId === d.id}
                            title="Delete Donor Permanently"
                            className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white p-2.5 rounded-xl border border-rose-200 hover:border-rose-600 transition flex items-center gap-1 text-xs font-bold flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. SOS BROADCASTS TAB */}
              {activeTab === 'sos' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Active & Past SOS Broadcasts: {filteredSos.length}
                  </div>
                  {filteredSos.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                      No SOS alerts found.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredSos.map(s => (
                        <div key={s.id} className="bg-white border-l-4 border-l-red-600 border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="bg-red-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded">
                                {s.blood_group}
                              </span>
                              <span className="font-bold text-sm text-slate-900">Patient: {s.patient_name}</span>
                              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded uppercase">
                                {s.urgency}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">#{s.id}</span>
                            </div>
                            <p className="text-xs text-slate-600">
                              🏥 <strong>{s.hospital_name}</strong> ({s.area}, {s.city}) • Units: {s.units_needed}
                            </p>
                            <p className="text-xs text-slate-500">
                              Contact: <strong>{s.contact_person}</strong> ({s.contact_phone})
                            </p>
                            {s.details && (
                              <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                "{s.details}"
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteSos(s.id, s.patient_name)}
                            disabled={deletingId === s.id}
                            title="Delete Emergency Alert"
                            className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white p-2.5 rounded-xl border border-rose-200 hover:border-rose-600 transition flex items-center gap-1 text-xs font-bold flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Alert</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. BLOOD REQUESTS TAB */}
              {activeTab === 'requests' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Patient Blood Requests: {filteredRequests.length}
                  </div>
                  {filteredRequests.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                      No blood requests found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredRequests.map(r => (
                        <div key={r.id} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">{r.patient_name}</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-600">
                                {r.blood_group} • {r.units_needed}U
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{r.hospital_name} ({r.city})</span>
                            </p>
                            <p className="text-xs text-slate-500">
                              Phone: <strong className="font-mono">{r.contact_phone}</strong>
                            </p>
                            {r.notes && (
                              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
                                "{r.notes}"
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteRequest(r.id, r.patient_name)}
                            disabled={deletingId === r.id}
                            title="Delete Blood Request"
                            className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white p-2.5 rounded-xl border border-rose-200 hover:border-rose-600 transition flex items-center gap-1 text-xs font-bold flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. CONTACT LOGS TAB */}
              {activeTab === 'contacts' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Protected Contact Access Logs: {data.contactLogs.length}
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                        <tr>
                          <th className="p-3">Log ID</th>
                          <th className="p-3">Donor Requested</th>
                          <th className="p-3">Requester Name</th>
                          <th className="p-3">Purpose</th>
                          <th className="p-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.contactLogs.map(l => (
                          <tr key={l.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono">#{l.id}</td>
                            <td className="p-3 font-semibold text-slate-900">
                              {l.donor_name || `Donor #${l.donor_id}`} {l.donor_blood_group && `(${l.donor_blood_group})`}
                            </td>
                            <td className="p-3">{l.requester_name || 'Emergency Caller'}</td>
                            <td className="p-3 text-slate-500">{l.purpose || 'Emergency Requirement'}</td>
                            <td className="p-3 text-slate-400 font-mono">
                              {l.created_at ? new Date(l.created_at).toLocaleString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. USERS TAB */}
              {activeTab === 'users' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Registered Users: {data.users.length}
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                        <tr>
                          <th className="p-3">User ID</th>
                          <th className="p-3">Full Name</th>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Email Verified</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.users.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono">#{u.id}</td>
                            <td className="p-3 font-semibold text-slate-900">{u.full_name}</td>
                            <td className="p-3 font-mono">{u.email}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === 'ADMIN' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-emerald-600 font-bold">✓ Verified</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>BloodPulse Emergency Response System • Admin Privileges Active</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
}
