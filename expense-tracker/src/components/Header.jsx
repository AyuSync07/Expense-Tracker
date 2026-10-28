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
  const [tempName, setTempName] = useState(userName || "");
  const dropdownRef = useRef(null);
  const dateInputRef = useRef(null);

  useEffect(() => {
    setTempName(userName || "");
  }, [userName]);

  // Close popup if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProfileModal(false);
      }
    };
    if (showProfileModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileModal]);

  const handleOpenProfile = () => {
    setTempName(userName);
    setShowProfileModal(true);
  };

  const handleSaveName = (e) => {
    e.preventDefault();
    const trimmed = tempName.trim();
    onUpdateUserName(trimmed);
    setShowProfileModal(false);
  };

  // User initials if name is set
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Human readable date display for header
  const isToday = selectedDate === todayStr;
  const displayDateFormatted = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    : "Pick Date";

  return (
    <header className="fixed top-0 left-0 w-full z-30 bg-[#09090b]/95 backdrop-blur-sm border-b border-[#27272a]">
      <div className="h-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand & Left Date Picker */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#fafafa]"></span>
            <span className="font-['Geist'] font-medium text-[16px] text-[#fafafa] tracking-tight select-none">
              {userName ? `${userName}'s Expenses` : "Personal Expenses"}
            </span>
          </div>

          {/* Interactive Date Picker Widget with prominent highlight container */}
          <div data-tour="header-calendar-filter" className="relative flex items-center">
            <div
              onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
              className="flex items-center gap-2 px-3 py-1.5 border border-[#27272a] bg-[#121215] hover:border-[#fafafa] hover:bg-[#1a1a1e] transition-all rounded-lg cursor-pointer group shadow-sm"
              title="Click to view expenses for a previous or specific date"
            >
              <span className="material-symbols-outlined text-[17px] text-[#fafafa] group-hover:scale-110 transition-transform">
                calendar_month
              </span>
              <span className="font-['JetBrains_Mono'] text-[12px] text-[#fafafa] font-medium tracking-tight">
                {displayDateFormatted}
              </span>
              {isToday && (
                <span className="text-[10px] bg-[#27272a] px-1.5 py-0.5 rounded text-[#a1a1aa] font-['JetBrains_Mono']">
                  Today
                </span>
              )}
            </div>

            {/* Hidden native date input triggered by clicking the badge */}
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer pointer-events-auto w-full h-full"
            />
          </div>

          {/* Quick button to jump back to today if a past date is selected */}
          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] font-['JetBrains_Mono'] text-[#a1a1aa] hover:text-[#fafafa] underline transition-colors cursor-pointer"
              title="Jump back to today"
            >
              Back to Today
            </button>
          )}
        </div>

        {/* View Switcher Navigation */}
        <nav className="flex items-center gap-6 h-14">
          <button
            type="button"
            onClick={() => setCurrentView("budgets")}
            className={`h-full inline-flex items-center transition-colors text-[14px] font-['Geist'] cursor-pointer ${
              currentView === "budgets"
                ? "text-[#fafafa] border-b-2 border-[#ffffff] font-medium"
                : "text-[#c4c7c8] hover:text-[#fafafa]"
            }`}
          >
            Budgets
          </button>
          <button
            type="button"
            onClick={() => setCurrentView("expenses")}
            className={`h-full inline-flex items-center transition-colors text-[14px] font-['Geist'] cursor-pointer ${
              currentView === "expenses"
                ? "text-[#fafafa] border-b-2 border-[#ffffff] font-medium"
                : "text-[#c4c7c8] hover:text-[#fafafa]"
            }`}
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => setCurrentView("analytics")}
            className={`h-full inline-flex items-center transition-colors text-[14px] font-['Geist'] cursor-pointer ${
              currentView === "analytics"
                ? "text-[#fafafa] border-b-2 border-[#ffffff] font-medium"
                : "text-[#c4c7c8] hover:text-[#fafafa]"
            }`}
          >
            Analytics &amp; Charts
          </button>
        </nav>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Tour Replay Button */}
          <button
            type="button"
            onClick={onOpenTutorial}
            title="Replay Interactive Tour"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#27272a] bg-[#121215] hover:border-[#fafafa] hover:text-[#fafafa] transition-colors font-['JetBrains_Mono'] text-[11px] text-[#c4c7c8] rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-[#fafafa]">help</span>
            <span className="hidden sm:inline">? Quick Tour</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Clear all expense data"
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#27272a] bg-[#121215] hover:bg-[#1f1f22] hover:text-[#ef4444] transition-colors font-['JetBrains_Mono'] text-[11px] text-[#c4c7c8] rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
            <span className="hidden sm:inline">Clear Data</span>
          </button>

          {/* Profile Trigger & Dropdown */}
          <div data-tour="profile-avatar-button" className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={handleOpenProfile}
              title={userName ? `Profile: ${userName}` : "Click to enter your name"}
              className="h-9 px-3 rounded-full bg-[#121215] border-2 border-[#27272a] hover:border-[#fafafa] flex items-center justify-center gap-2 text-[#fafafa] transition-all cursor-pointer shadow-sm group"
            >
              {userName ? (
                <>
                  <span className="w-5 h-5 rounded-full bg-[#fafafa] text-[#09090b] flex items-center justify-center font-['JetBrains_Mono'] text-[10px] font-bold">
                    {getInitials(userName)}
                  </span>
                  <span className="font-['Geist'] text-[13px] text-[#fafafa] max-w-[100px] truncate font-medium">
                    {userName}
                  </span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] text-[#fafafa] group-hover:scale-110 transition-transform">
                    person
                  </span>
                  <span className="text-[12px] font-['Geist'] text-[#c4c7c8] hidden sm:inline">
                    Add Name
                  </span>
                </>
              )}
            </button>

            {/* Profile Popover / Modal */}
            {showProfileModal && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#121215] border border-[#27272a] rounded-xl shadow-2xl p-4 z-50 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#fafafa]">account_circle</span>
                    <span className="font-['Geist'] font-medium text-[14px] text-[#fafafa]">User Profile</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                <form onSubmit={handleSaveName} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g., Alex Johnson"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-[13px] text-[#fafafa] placeholder:text-[#a1a1aa]/60 focus:outline-none focus:border-[#fafafa] transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {userName && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateUserName("");
                          setTempName("");
                          setShowProfileModal(false);
                        }}
                        className="px-2.5 py-1.5 text-[11px] font-['JetBrains_Mono'] text-[#ef4444] hover:bg-[#ef4444]/10 rounded transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => setShowProfileModal(false)}
                        className="px-3 py-1.5 text-[12px] font-['Geist'] text-[#a1a1aa] hover:text-[#fafafa] rounded transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-[#fafafa] text-[#09090b] text-[12px] font-medium font-['Geist'] rounded-md hover:bg-[#e4e1e6] transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
