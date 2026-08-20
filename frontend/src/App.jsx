import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FindDonorView from './pages/FindDonorView';
import SosAlertsView from './pages/SosAlertsView';
import RequestsView from './pages/RequestsView';
import BecomeDonorView from './pages/BecomeDonorView';
import SosModal from './components/SosModal';
import ContactModal from './components/ContactModal';
import SignInModal from './components/SignInModal';
import AdminConsoleModal from './components/AdminConsoleModal';
import EditDonorModal from './components/EditDonorModal';
import IntroScreen from './components/IntroScreen';
import { fetchStats, fetchDonors, fetchSosAlerts, fetchBloodRequests, deleteMyDonorProfile } from './services/api';
import { ShieldAlert, ShieldCheck, Play } from 'lucide-react';

const ADMIN_EMAILS = [
  'premrathinamk@gmail.com',
  'sathyan2007sara@gmail.com'
];

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('find');
  const [stats, setStats] = useState({ availableDonors: 10, activeSosAlerts: 1 });
  const [donors, setDonors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authentication State with safe try/catch
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bloodpulse_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
      return null;
    }
  });

  // Filters for Find a Donor view
  const [bloodGroup, setBloodGroup] = useState('Any Blood Group');
  const [locality, setLocality] = useState('');
  const [compatible, setCompatible] = useState(false);

  // Modals state
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isAdminConsoleOpen, setIsAdminConsoleOpen] = useState(false);
  const [selectedDonorForContact, setSelectedDonorForContact] = useState(null);
  const [selectedDonorForEdit, setSelectedDonorForEdit] = useState(null);

  const isAdmin = currentUser?.email && (
    ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) || 
    currentUser.role === 'ADMIN'
  );

  // Load stats
  const loadStats = async () => {
    try {
      const data = await fetchStats();
      if (data && data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Load donors based on active filters
  const loadDonors = async () => {
    try {
      setLoading(true);
      const data = await fetchDonors({ bloodGroup, locality, compatible });
      if (data && data.success) {
        setDonors(data.donors || []);
      }
    } catch (err) {
      console.error('Failed to load donors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load SOS alerts
  const loadSosAlerts = async () => {
    try {
      const data = await fetchSosAlerts();
      if (data && data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to load SOS alerts:', err);
    }
  };

  // Load patient blood requests
  const loadRequests = async () => {
    try {
      const data = await fetchBloodRequests();
      if (data && data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    }
  };

  // Refresh all global state
  const refreshAll = () => {
    loadStats();
    loadDonors();
    loadSosAlerts();
    loadRequests();
  };

  // Initial load
  useEffect(() => {
    loadStats();
    loadSosAlerts();
    loadRequests();
  }, []);

  // Reload donors whenever filters change
  useEffect(() => {
    loadDonors();
  }, [bloodGroup, locality, compatible]);

  const handleSosSuccess = () => {
    loadStats();
    loadSosAlerts();
    setActiveTab('sos');
  };

  const handleDonorRegistered = () => {
    loadStats();
    loadDonors();
    setActiveTab('find');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('bloodpulse_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user session:', e);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('bloodpulse_user');
    } catch (e) {
      console.warn('Failed to clear user session:', e);
    }
  };

  const handleAdminConsoleClick = () => {
    if (!currentUser) {
      alert('Please Sign In with an Admin ID (premrathinamk@gmail.com or sathyan2007sara@gmail.com) to access the Admin Console.');
      setIsSignInModalOpen(true);
      return;
    }
    if (!isAdmin) {
      alert('Access restricted. Only authorized BloodPulse administrators can access this console.');
      return;
    }
    setIsAdminConsoleOpen(true);
  };

  const handleDeleteDonorClick = async (donor) => {
    if (!window.confirm(`Are you sure you want to delete your donor post "${donor.fullName}"?`)) {
      return;
    }

    try {
      await deleteMyDonorProfile(donor.id, currentUser?.email);
      refreshAll();
    } catch (err) {
      alert(err.message || 'Failed to delete donor post');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans relative pb-20 sm:pb-16 antialiased overflow-x-hidden w-full max-w-full">
      {/* Intro Animation Screen */}
      {showIntro && <IntroScreen onEnter={() => setShowIntro(false)} />}

      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableDonorsCount={stats.availableDonors}
        sosCount={stats.activeSosAlerts}
        currentUser={currentUser}
        onOpenSignIn={() => setIsSignInModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenSosModal={() => setIsSosModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 box-border">
        {activeTab === 'find' && (
          <FindDonorView
            donors={donors}
            loading={loading}
            bloodGroup={bloodGroup}
            setBloodGroup={setBloodGroup}
            locality={locality}
            setLocality={setLocality}
            compatible={compatible}
            setCompatible={setCompatible}
            currentUser={currentUser}
            onOpenSosModal={() => setIsSosModalOpen(true)}
            onRequestContact={(donor) => setSelectedDonorForContact(donor)}
            onEditDonor={(donor) => setSelectedDonorForEdit(donor)}
            onDeleteDonor={handleDeleteDonorClick}
            onRefresh={loadDonors}
          />
        )}

        {activeTab === 'sos' && (
          <SosAlertsView
            alerts={alerts}
            loading={loading}
            onOpenSosModal={() => setIsSosModalOpen(true)}
            onRefresh={loadSosAlerts}
          />
        )}

        {activeTab === 'requests' && (
          <RequestsView
            requests={requests}
            loading={loading}
            onRefresh={loadRequests}
          />
        )}

        {activeTab === 'become' && (
          <BecomeDonorView
            currentUser={currentUser}
            onSuccessRegistration={handleDonorRegistered}
            onDonorDeleted={refreshAll}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-5 sm:py-6 text-center text-xs text-slate-500 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold text-slate-700 text-center sm:text-left">
            🩸 BloodPulse Emergency Donor Response Network
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAdminConsoleClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Admin Console</span>
            </button>
            <span className="text-slate-300">|</span>
            <p className="text-[11px] sm:text-xs">Privacy-First Architecture</p>
          </div>
        </div>
      </footer>

      {/* Floating Admin Console Bottom Button */}
      <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40">
        <button
          onClick={handleAdminConsoleClick}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full font-extrabold text-[11px] sm:text-xs shadow-xl transition-all duration-200 active:scale-95 border ${
            isAdmin
              ? 'bg-[#0B1120] text-rose-400 hover:text-white hover:bg-rose-600 border-rose-500/50 shadow-rose-950/40 animate-pulse'
              : 'bg-[#0B1120] text-slate-400 hover:text-white border-slate-700 shadow-slate-950/40'
          }`}
          title="Admin Ops Console"
        >
          <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
          <span>{isAdmin ? '🛡️ Admin Console (Active)' : '🛡️ Admin Console'}</span>
        </button>
      </div>

      {/* Interactive Modals */}
      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onSuccess={handleSosSuccess}
      />

      <ContactModal
        donor={selectedDonorForContact}
        isOpen={!!selectedDonorForContact}
        onClose={() => setSelectedDonorForContact(null)}
      />

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <EditDonorModal
        donor={selectedDonorForEdit}
        isOpen={!!selectedDonorForEdit}
        onClose={() => setSelectedDonorForEdit(null)}
        currentUser={currentUser}
        onDonorUpdated={refreshAll}
        onDonorDeleted={refreshAll}
      />

      <AdminConsoleModal
        isOpen={isAdminConsoleOpen}
        onClose={() => setIsAdminConsoleOpen(false)}
        currentUser={currentUser}
        onDataChanged={refreshAll}
      />
    </div>
  );
}
