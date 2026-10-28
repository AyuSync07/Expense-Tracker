import React, { useState, useEffect, useRef } from "react";

export default function Header({
  currentView,
  setCurrentView,
  onReset,
  onOpenTutorial = () => {},
  selectedDate,
  setSelectedDate,
  todayStr,
  userName,
  onUpdateUserName
}) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [tempName, setTempName] = useState(userName || "");
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const dateInputRef = useRef(null);

  useEffect(() => {
    setTempName(userName || "");
  }, [userName]);

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileModal(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setShowMobileActions(false);
      }
    };
    if (showProfileModal || showMobileActions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileModal, showMobileActions]);

  const handleOpenProfile = () => {
    setTempName(userName);
    setShowProfileModal(true);
    setShowMobileActions(false);
  };

  const handleSaveName = (e) => {
    e.preventDefault();
    const trimmed = tempName.trim();
    onUpdateUserName(trimmed);
    setShowProfileModal(false);
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isToday = selectedDate === todayStr;
  const displayDateFormatted = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "Pick Date";

  const displayDateShort = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })
    : "Today";

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 w-full z-30 bg-[#09090b]/95 backdrop-blur-md border-b border-[#27272a]">
        <div className="h-14 max-w-7xl mx-auto px-3 sm:px-6 lg:px-12 flex items-center justify-between gap-2">
          
          {/* Left Section: Brand / Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Brand Title */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-white shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-['Geist'] font-semibold text-[14px] sm:text-[16px] text-white tracking-tight truncate">
                  {userName ? `${userName}'s Expenses` : "Personal Expenses"}
                </span>
                <span className="text-[10px] text-[#a1a1aa] font-['JetBrains_Mono'] -mt-0.5 md:hidden">
                  Personal Finance
                </span>
              </div>
            </div>

            {/* Desktop Calendar Filter Widget (Hidden on Budgets view) */}
            {currentView !== "budgets" && (
              <>
                <div data-tour="header-calendar-filter" className="relative hidden md:flex items-center shrink-0">
                  <div
                    onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#27272a] bg-[#121215] hover:border-white transition-colors rounded-lg cursor-pointer group shadow-sm"
                    title="Filter by date (past & today only)"
                  >
                    <span className="material-symbols-outlined text-[17px] text-white">calendar_month</span>
                    <span className="font-['JetBrains_Mono'] text-[12px] text-white font-medium">
                      {displayDateFormatted}
                    </span>
                    {isToday && (
                      <span className="text-[10px] bg-[#27272a] px-1.5 py-0.5 rounded text-[#a1a1aa] font-['JetBrains_Mono']">
                        Today
                      </span>
                    )}
                  </div>
                  <input
                    ref={dateInputRef}
                    type="date"
                    max={todayStr}
                    value={selectedDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && val <= todayStr) {
                        setSelectedDate(val);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer pointer-events-auto w-full h-full"
                  />
                </div>

                {!isToday && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate(todayStr)}
                    className="text-[11px] font-['JetBrains_Mono'] text-[#a1a1aa] hover:text-white underline transition-colors cursor-pointer shrink-0 hidden md:inline"
                  >
                    Back to Today
                  </button>
                )}
              </>
            )}
          </div>

          {/* Center Navigation (Desktop Only) */}
          <nav className="hidden md:flex items-center gap-6 h-14">
            <button
              type="button"
              onClick={() => setCurrentView("budgets")}
              className={`h-full inline-flex items-center transition-colors text-[14px] font-['Geist'] cursor-pointer ${
                currentView === "budgets"
                  ? "text-white border-b-2 border-white font-medium"
                  : "text-[#a1a1aa] hover:text-white"
              }`}
            >
              Budgets
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("expenses")}
              className={`h-full inline-flex items-center transition-colors text-[14px] font-['Geist'] cursor-pointer ${
                currentView === "expenses"
                  ? "text-white border-b-2 border-white font-medium"
                  : "text-[#a1a1aa] hover:text-white"
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("analytics")}
              className={`h-full inline-flex items-center transition-colors text-[14px] font-['Geist'] cursor-pointer ${
                currentView === "analytics"
                  ? "text-white border-b-2 border-white font-medium"
                  : "text-[#a1a1aa] hover:text-white"
              }`}
            >
              Analytics &amp; Charts
            </button>
          </nav>

          {/* Right Section: Mobile Date Pill + Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Mobile Date Filter Button (Hidden on Budgets view) */}
            {currentView !== "budgets" && (
              <div className="relative md:hidden flex items-center">
                <div
                  onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#141417] border border-[#27272a] rounded-lg text-white font-['JetBrains_Mono'] text-[11px] font-medium active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#a1a1aa]">calendar_today</span>
                  <span>{displayDateShort}</span>
                  {!isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </div>
                <input
                  ref={dateInputRef}
                  type="date"
                  max={todayStr}
                  value={selectedDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && val <= todayStr) {
                      setSelectedDate(val);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer pointer-events-auto w-full h-full"
                />
              </div>
            )}

            {/* Desktop Action Controls (Quick Tour & Clear Data) */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenTutorial}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#27272a] bg-[#121215] hover:border-white hover:text-white transition-colors font-['JetBrains_Mono'] text-[11px] text-[#c4c7c8] rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px] text-white">help</span>
                <span>? Quick Tour</span>
              </button>

              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#27272a] bg-[#121215] hover:bg-[#1f1f22] hover:text-rose-400 transition-colors font-['JetBrains_Mono'] text-[11px] text-[#c4c7c8] rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                <span>Clear Data</span>
              </button>
            </div>

            {/* Unified Profile Avatar Button on the Right (Visible on BOTH mobile & desktop) */}
            <div data-tour="profile-avatar-button" className="relative shrink-0" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={handleOpenProfile}
                title={userName ? `Profile: ${userName}` : "Click to enter your name"}
                className="h-8 sm:h-9 px-2 sm:px-3 rounded-full bg-[#121215] border-2 border-[#27272a] hover:border-white flex items-center justify-center gap-2 text-white transition-all cursor-pointer shadow-sm group active:scale-95"
              >
                {userName ? (
                  <>
                    <span className="w-5 h-5 rounded-full bg-white text-zinc-950 flex items-center justify-center font-['JetBrains_Mono'] text-[10px] font-bold">
                      {getInitials(userName)}
                    </span>
                    <span className="font-['Geist'] text-[13px] text-white max-w-[100px] truncate font-medium hidden sm:inline">
                      {userName}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <span className="text-[12px] font-['Geist'] text-[#c4c7c8] hidden sm:inline">Add Name</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile Overflow Menu Button (•••) */}
            <div className="relative md:hidden" ref={mobileMenuRef}>
              <button
                type="button"
                onClick={() => setShowMobileActions((prev) => !prev)}
                className="w-8 h-8 rounded-lg bg-[#141417] border border-[#27272a] flex items-center justify-center text-[#a1a1aa] hover:text-white active:scale-95 transition-all"
                title="More actions"
              >
                <span className="material-symbols-outlined text-[18px]">more_vert</span>
              </button>

              {/* Mobile Overflow Popover */}
              {showMobileActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#141417] border border-[#27272a] rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileActions(false);
                      onOpenTutorial();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-['Geist'] text-white hover:bg-zinc-800 rounded-lg text-left transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-white">help</span>
                    <span>Replay Tour</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileActions(false);
                      handleOpenProfile();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-['Geist'] text-white hover:bg-zinc-800 rounded-lg text-left transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-white">person</span>
                    <span>Edit Name</span>
                  </button>

                  {!isToday && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileActions(false);
                        setSelectedDate(todayStr);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-['Geist'] text-emerald-400 hover:bg-zinc-800 rounded-lg text-left transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">today</span>
                      <span>Back to Today</span>
                    </button>
                  )}

                  <div className="h-px bg-zinc-800 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowMobileActions(false);
                      onReset();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-[12px] font-['Geist'] text-rose-400 hover:bg-rose-500/10 rounded-lg text-left transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Clear All Data</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Shared User Profile Modal (Used on both mobile & desktop) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#141417] border border-[#27272a] rounded-2xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-white">account_circle</span>
                <span className="font-['Geist'] font-semibold text-[15px] text-white">Your Profile</span>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-[#a1a1aa] hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveName} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider">
                  Full Name or Nickname
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Alex Morgan"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] focus:border-white rounded-lg px-3.5 py-2.5 text-[14px] text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                {userName ? (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateUserName("");
                      setTempName("");
                      setShowProfileModal(false);
                    }}
                    className="px-3 py-1.5 text-[12px] font-['JetBrains_Mono'] text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-3.5 py-2 text-[13px] font-['Geist'] text-[#a1a1aa] hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-zinc-950 font-['Geist'] font-semibold text-[13px] rounded-lg hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile & Tablet Bottom App Bar (Thumb Navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0c0c0e]/95 backdrop-blur-md border-t border-[#27272a] h-14 flex items-center justify-around px-2">
        <button
          type="button"
          onClick={() => setCurrentView("budgets")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            currentView === "budgets" ? "text-white" : "text-[#71717a] hover:text-[#a1a1aa]"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          <span className="font-['Geist'] text-[11px] font-medium tracking-tight">Budgets</span>
          {currentView === "budgets" && (
            <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setCurrentView("expenses")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            currentView === "expenses" ? "text-white" : "text-[#71717a] hover:text-[#a1a1aa]"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          <span className="font-['Geist'] text-[11px] font-medium tracking-tight">Expenses</span>
          {currentView === "expenses" && (
            <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setCurrentView("analytics")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            currentView === "analytics" ? "text-white" : "text-[#71717a] hover:text-[#a1a1aa]"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">insights</span>
          <span className="font-['Geist'] text-[11px] font-medium tracking-tight">Analytics</span>
          {currentView === "analytics" && (
            <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
          )}
        </button>
      </nav>
    </>
  );
}
