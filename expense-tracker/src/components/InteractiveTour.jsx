import React, { useState, useEffect, useRef, useCallback } from "react";

const TOUR_STEPS = [
  {
    step: 1,
    id: "profile",
    tab: "budgets",
    selector: '[data-tour="profile-avatar-button"]',
    beaconText: "YOUR PROFILE",
    title: "Welcome! What's your name?",
    copy: "Let's personalize your workspace. Enter your name below to get started.",
    btnText: "Save & Continue",
    isProfileStep: true,
  },
  {
    step: 2,
    id: "budget-sync",
    tab: "budgets",
    selector: '[data-tour="budget-sync-card"]',
    beaconText: "LINKED BUDGETS",
    title: "1. Set Your Budgets",
    copy: "Budgets start at ₹0 until you set them. Setting daily (e.g. ₹500), monthly (₹15,000), or yearly updates all three automatically.",
    btnText: "Next",
  },
  {
    step: 3,
    id: "budget-safety",
    tab: "budgets",
    selector: '[data-tour="budget-progress-bar"]',
    beaconText: "SPENDING SAFETY",
    title: "2. Real-Time Safety Limit",
    copy: "Fills up as you log purchases. An instant red alert appears if you exceed your limit so you always stay in control.",
    btnText: "Next",
  },
  {
    step: 4,
    id: "expense-form",
    tab: "expenses",
    selector: '[data-tour="expense-form"]',
    beaconText: "ADD EXPENSE FORM",
    title: "3. Log Purchases in Seconds",
    copy: "Enter description, amount (₹), and category. You can backdate transactions or tap 'Set to Today'. Press [Enter] to save.",
    btnText: "Next",
  },
  {
    step: 5,
    id: "calendar-filter",
    tab: "expenses",
    selector: '[data-tour="header-calendar-filter"]',
    beaconText: "CALENDAR FILTER",
    title: "4. Review Past Dates",
    copy: "Tap the calendar in the top bar to inspect any past day or month. A 'Back to Today' shortcut appears when browsing history.",
    btnText: "Next",
  },
  {
    step: 6,
    id: "expense-ledger",
    tab: "expenses",
    selector: '[data-tour="expense-ledger-table"]',
    beaconText: "EXPENSE LEDGER & CSV",
    title: "5. Search, Delete & CSV Export",
    copy: "Search notes, filter by category, remove unwanted entries, and export your entire ledger to Excel/CSV with one click.",
    btnText: "Next",
  },
  {
    step: 7,
    id: "analytics-metrics",
    tab: "analytics",
    selector: '[data-tour="analytics-metric-ribbon"]',
    beaconText: "SPENDING INSIGHTS",
    title: "6. Plain-English Stats",
    copy: "No financial jargon. View Total Money Spent, Daily Average, and your Heaviest Spending Day of the week.",
    btnText: "Next",
  },
  {
    step: 8,
    id: "charts",
    tab: "analytics",
    selector: '[data-tour="charts-container"]',
    beaconText: "VISUAL CHARTS",
    title: "7. Charts ",
    copy: "SVG Donut and daily trend bars. When you finish this tour, the sample data clears so you start fresh with your own records!",
    btnText: "Start Tracking",
  },
];

export default function InteractiveTour({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
  userName = "",
  onSaveName = () => {},
  initialStep = 1,
}) {
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [targetRect, setTargetRect] = useState(null);
  const [inputName, setInputName] = useState(userName || "");
  const [hasSubmittedName, setHasSubmittedName] = useState(false);
  const inputRef = useRef(null);

  const step = TOUR_STEPS[stepIndex] || TOUR_STEPS[1] || TOUR_STEPS[0];
  const totalSteps = TOUR_STEPS.length;

  // Whenever the tour is opened, set to initialStep (defaults to Step 2, index 1)
  useEffect(() => {
    if (isOpen) {
      setStepIndex(typeof initialStep === "number" ? initialStep : 1);
      setHasSubmittedName(false);
    }
  }, [isOpen, initialStep]);

  // Sync user name from props if changed
  useEffect(() => {
    if (userName) {
      setInputName(userName);
    }
  }, [userName]);

  // Autofocus input on step 1
  useEffect(() => {
    if (isOpen && step.isProfileStep) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, step.isProfileStep]);

  // Handle advancing
  const handleNext = useCallback(() => {
    if (step.isProfileStep) {
      const trimmed = inputName.trim();
      if (!trimmed) {
        setHasSubmittedName(true);
        if (inputRef.current) inputRef.current.focus();
        return;
      }
      onSaveName(trimmed);
    }

    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  }, [stepIndex, totalSteps, step, inputName, onSaveName, onClose]);

  const handlePrev = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
    }
  }, [stepIndex]);

  // Measure targeted element
  const updatePosition = useCallback(() => {
    if (!isOpen || !step) return;

    const el = document.querySelector(step.selector);
    if (!el) {
      setTargetRect(null);
      return;
    }

    // Scroll element into view if not top header
    if (!step.selector.includes("header") && !step.selector.includes("profile")) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [isOpen, step]);

  // Tab switching sync
  useEffect(() => {
    if (!isOpen || !step) return;

    if (step.tab && currentTab !== step.tab) {
      setCurrentTab(step.tab);
    }

    const timer = setTimeout(() => {
      updatePosition();
    }, 180);

    return () => clearTimeout(timer);
  }, [stepIndex, isOpen, step, currentTab, setCurrentTab, updatePosition]);

  // Reposition on window events
  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => updatePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, updatePosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && !step.isProfileStep) {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowRight" && !step.isProfileStep) {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" && !step.isProfileStep) {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, step.isProfileStep, handleNext, handlePrev, onClose]);

  if (!isOpen || !step) return null;

  const isNameEmpty = !inputName.trim();
  const isTopBarElement = step.selector.includes("profile") || step.selector.includes("header");

  return (
    <>
      {/* 1. Crystal-Clear Cutout Spotlight: Zero blur, leaving the targeted feature 100% visible & sharp */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-40 transition-opacity duration-300"
        aria-hidden="true"
      >
        <defs>
          <mask id="tour-spotlight-cutout">
            {/* White area retains the dark overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout creates a 100% transparent, unblurred window over the targeted element */}
            {targetRect && (
              <rect
                x={Math.max(0, targetRect.left - 6)}
                y={Math.max(0, targetRect.top - 6)}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="12"
                ry="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Surrounding dark veil (without any blur filter) */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.55)"
          mask="url(#tour-spotlight-cutout)"
        />
      </svg>

      {/* 2. High-Visibility Pulsing Highlight Box around the Target */}
      {targetRect && (
        <>
          {/* Glowing Outline */}
          <div
            style={{
              top: Math.max(0, targetRect.top - 6),
              left: Math.max(0, targetRect.left - 6),
              width: targetRect.width + 12,
              height: targetRect.height + 12,
            }}
            className="fixed pointer-events-none rounded-xl border-2 border-white ring-4 ring-white/30 shadow-[0_0_35px_rgba(255,255,255,0.7)] z-50 transition-all duration-300 ease-out"
          />

          {/* Prominent Bouncing Beacon Tag Directly Below/Beside Target */}
          <div
            style={{
              top: isTopBarElement
                ? targetRect.top + targetRect.height + 14
                : Math.max(70, targetRect.top - 46),
              left: Math.min(
                window.innerWidth - 120,
                Math.max(120, targetRect.left + targetRect.width / 2)
              ),
            }}
            className="fixed -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center animate-bounce transition-all duration-300"
          >
            {isTopBarElement && (
              <div className="w-0 h-0 border-x-6 border-x-transparent border-b-6 border-b-white" />
            )}
            <div className="bg-white text-zinc-950 font-['JetBrains_Mono'] text-[11px] font-bold px-3 py-1 rounded-full shadow-xl shadow-white/30 whitespace-nowrap flex items-center gap-1.5 uppercase tracking-wider border border-zinc-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{isTopBarElement ? `▲ ${step.beaconText}` : `▼ ${step.beaconText}`}</span>
            </div>
            {!isTopBarElement && (
              <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white" />
            )}
          </div>
        </>
      )}

      {/* 3. Floating Dialogue Card */}
      <div
        className={`fixed z-50 w-[380px] max-w-[calc(100vw-32px)] bg-[#141417] border-2 border-zinc-500 rounded-2xl shadow-2xl shadow-black p-5 flex flex-col gap-3.5 transition-all duration-300 pointer-events-auto ${
          step.isProfileStep
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            : "bottom-6 right-6"
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
              Step {step.step} of {totalSteps}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-zinc-800 cursor-pointer"
            title="Skip tour"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Card Body */}
        <div>
          <h4 className="text-[16px] font-semibold text-white font-['Geist'] mb-1">
            {step.title}
          </h4>
          <p className="text-[13px] text-zinc-300 leading-relaxed font-['Geist']">
            {step.copy}
          </p>

          {/* Step 1: Inline User Name Input */}
          {step.isProfileStep && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
              className="mt-3.5 space-y-2"
            >
              <label
                htmlFor="tour-user-name-input"
                className="block font-['JetBrains_Mono'] text-[11px] font-medium text-zinc-300 uppercase tracking-wider"
              >
                Your Name <span className="text-rose-400">*</span>
              </label>
              <input
                ref={inputRef}
                id="tour-user-name-input"
                type="text"
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  if (hasSubmittedName && e.target.value.trim()) {
                    setHasSubmittedName(false);
                  }
                }}
                placeholder="e.g. Alex Morgan"
                className={`w-full px-3.5 py-2.5 bg-[#09090b] border rounded-lg font-['Geist'] text-[14px] text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                  hasSubmittedName && isNameEmpty
                    ? "border-rose-500 ring-2 ring-rose-500/30"
                    : "border-zinc-700 focus:border-white"
                }`}
              />
              {hasSubmittedName && isNameEmpty && (
                <p className="font-['JetBrains_Mono'] text-[11px] text-rose-400">
                  Please enter your name to personalize your workspace.
                </p>
              )}
            </form>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/80">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <span
                key={s.step}
                className={`h-1.5 rounded-full transition-all ${
                  stepIndex === idx
                    ? "w-4 bg-white"
                    : "w-1.5 bg-zinc-700"
                }`}
                title={`Step ${s.step}`}
              />
            ))}
          </div>

          {/* Action Button Pair */}
          <div className="flex items-center gap-2">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded transition-colors cursor-pointer font-['Geist']"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-zinc-500 hover:text-zinc-300 px-2.5 py-1.5 rounded transition-colors cursor-pointer font-['Geist']"
              >
                Skip Tour
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={step.isProfileStep && isNameEmpty}
              title={step.isProfileStep && isNameEmpty ? "Enter your name to continue" : step.btnText}
              className={`font-medium text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 font-['Geist'] shadow-sm ${
                step.isProfileStep && isNameEmpty
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                  : "bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 cursor-pointer"
              }`}
            >
              <span>{step.btnText}</span>
              <span className="material-symbols-outlined text-[15px]">
                {stepIndex === totalSteps - 1 ? "rocket_launch" : "arrow_forward"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
