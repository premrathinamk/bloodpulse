import React from 'react';
import { Search, AlertTriangle, FileText, UserPlus, Droplets, LogIn, UserCheck, LogOut } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  availableDonorsCount = 9,
  sosCount = 1,
  currentUser = null,
  onOpenSignIn,
  onSignOut,
  onOpenSosModal
}) {
  const tabs = [
    { id: 'find', label: 'Find a Donor', icon: Search },
    { id: 'sos', label: 'SOS Alerts', icon: AlertTriangle, badge: sosCount > 0 ? sosCount : null },
    { id: 'requests', label: 'Requests', icon: FileText },
    { id: 'become', label: 'Become a Donor', icon: UserPlus },
  ];

  return (
    <header className="bg-[#0B1120] text-white border-b border-slate-800/80 sticky top-0 z-40 shadow-md w-full overflow-hidden">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-1.5 sm:gap-4 w-full">
        {/* Brand & Logo */}
        <div 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0" 
          onClick={() => setActiveTab('find')}
        >
          <div className="relative flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-md shadow-rose-900/40 flex-shrink-0">
            <Droplets className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-lg font-extrabold tracking-tight text-white font-sans">
                BloodPulse
              </span>
              <span className="bg-[#DC2626] text-white text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase hidden sm:inline-block">
                EMERGENCY OPS
              </span>
            </div>
            <p className="text-[9px] sm:text-xs text-slate-400 font-medium hidden md:block">
              Rapid Donor Response Network
            </p>
          </div>
        </div>

        {/* Status Pill & User Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Live Donors Pill */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-[#131E35] border border-slate-700/80 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium text-slate-200 shadow-inner">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
            </span>
            <span className="whitespace-nowrap">
              <strong className="text-emerald-400 font-bold">{availableDonorsCount}</strong>{' '}
              <span className="hidden xs:inline">Donors</span>
            </span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 border border-slate-700 px-2 sm:px-2.5 py-1 rounded-lg text-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="font-semibold text-slate-200 truncate max-w-[65px] sm:max-w-[120px] text-[10px] sm:text-xs">
                  {currentUser.fullName || currentUser.email}
                </span>
              </div>
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenSignIn}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm shadow-rose-900/30 flex items-center gap-1 active:scale-95 whitespace-nowrap flex-shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs (Smooth Scroll on Mobile) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 border-t border-slate-800/60 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <nav className="flex space-x-1 sm:space-x-4 py-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2.5 sm:px-3.5 text-xs sm:text-sm font-semibold rounded-t-md transition-colors relative whitespace-nowrap ${
                  isActive
                    ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-[#DC2626] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
