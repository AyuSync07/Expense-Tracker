import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import BudgetsView from "./components/BudgetsView";
import ExpensesView from "./components/ExpensesView";
import AnalyticsView from "./components/AnalyticsView";
import InteractiveTour from "./components/InteractiveTour";
import { INITIAL_EXPENSES } from "./data";

const LOCAL_STORAGE_KEY = "stitch_expense_tracker_data";
const BUDGETS_STORAGE_KEY = "stitch_expense_tracker_budgets";
const TOUR_COMPLETED_KEY = "has_completed_tour";
const USER_NAME_KEY = "stitch_expense_tracker_user";

// Default base budget starts at ZERO until the user defines it
const DEFAULT_BUDGETS = {
  baseMonthly: 0,
  categories: {},
};

// Demo sample budget during active tour
const TOUR_DEMO_BUDGETS = {
  baseMonthly: 150000,
  categories: {
    "Equipment & Tech": 50000,
    "Food & Dining": 30000,
    "Utilities & Bills": 25000,
  },
};

export default function App() {
  const [currentView, setCurrentView] = useState("budgets");
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isTourSeeded, setIsTourSeeded] = useState(false);
  const [tourInitialStep, setTourInitialStep] = useState(1);

  // User's name
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem(USER_NAME_KEY) || "";
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [realExpenses, setRealExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Failed to load expenses from localStorage:", err);
    }
    return [];
  });

  const [realBudgets, setRealBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem(BUDGETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.baseMonthly === "number") {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Failed to load budgets from localStorage:", err);
    }
    return DEFAULT_BUDGETS;
  });

  // Check tour completion status on first load:
  // If not completed and no user name, start at Step 1 (profile), otherwise Step 2
  useEffect(() => {
    const hasCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
    if (!hasCompleted || hasCompleted === "false") {
      setCurrentView("budgets");
      setTourInitialStep(userName ? 1 : 0);
      setIsTourOpen(true);
      setIsTourSeeded(true);
    }
  }, [userName]);

  // When tour closes, clean up demo seed data back to user's real data
  const handleCloseTour = () => {
    setIsTourOpen(false);
    setIsTourSeeded(false);
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
  };

  const handleReplayTour = () => {
    setIsTourSeeded(true);
    setCurrentView("budgets");
    setTourInitialStep(1); // Always start from Step 2 when clicking Help / Quick Tour
    setIsTourOpen(true);
  };

  // Active data during tour vs real mode
  const activeExpenses = isTourSeeded ? INITIAL_EXPENSES : realExpenses;
  const activeBudgets = isTourSeeded && realBudgets.baseMonthly === 0 ? TOUR_DEMO_BUDGETS : realBudgets;

  // Sync real expenses to localStorage
  useEffect(() => {
    if (!isTourSeeded) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(realExpenses));
      } catch (err) {
        console.error("Failed to save to localStorage:", err);
      }
    }
  }, [realExpenses, isTourSeeded]);

  // Sync real budgets to localStorage
  useEffect(() => {
    if (!isTourSeeded) {
      try {
        localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(realBudgets));
      } catch (err) {
        console.error("Failed to save budgets to localStorage:", err);
      }
    }
  }, [realBudgets, isTourSeeded]);

  const handleAddExpense = (newExp) => {
    const txDate = newExp.date ? new Date(newExp.date) : new Date();
    const isToday = new Date().toDateString() === txDate.toDateString();
    const formattedDisplay = isToday
      ? `Today, ${txDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
      : txDate.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

    const item = {
      id: "tx-" + Date.now(),
      name: newExp.name,
      amount: newExp.amount,
      category: newExp.category,
      note: newExp.note,
      date: txDate.toISOString(),
      displayDate: formattedDisplay,
    };
    setRealExpenses((prev) => [item, ...prev]);
  };

  const handleDeleteExpense = (id) => {
    setRealExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveBaseBudget = (newBaseMonthly) => {
    setRealBudgets((prev) => ({
      ...prev,
      baseMonthly: newBaseMonthly,
    }));
  };

  const handleSaveCategoryBudget = (category, limit) => {
    setRealBudgets((prev) => ({
      ...prev,
      categories: {
        ...(prev.categories || {}),
        [category]: limit,
      },
    }));
  };

  const handleResetData = () => {
    if (window.confirm("Clear all expense and budget data?")) {
      setRealExpenses([]);
      setRealBudgets(DEFAULT_BUDGETS);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(BUDGETS_STORAGE_KEY);
    }
  };

  const handleUpdateUserName = (newName) => {
    setUserName(newName);
    if (newName) {
      localStorage.setItem(USER_NAME_KEY, newName);
    } else {
      localStorage.removeItem(USER_NAME_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e4e1e6] flex flex-col font-['Geist'] selection:bg-[#fafafa] selection:text-[#09090b]">
      {/* Global Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onReset={handleResetData}
        onOpenTutorial={handleReplayTour}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        todayStr={todayStr}
        userName={userName}
        onUpdateUserName={handleUpdateUserName}
      />

      {/* Interactive Spotlight Tour */}
      <InteractiveTour
        isOpen={isTourOpen}
        onClose={handleCloseTour}
        currentTab={currentView}
        setCurrentTab={setCurrentView}
        userName={userName}
        onSaveName={handleUpdateUserName}
        initialStep={tourInitialStep}
      />

      {/* Main Workspace */}
      <main className="w-full pt-14 pb-20 md:pb-8 flex-1 flex flex-col">
        {currentView === "budgets" && (
          <BudgetsView
            expenses={activeExpenses}
            budgets={activeBudgets}
            onSaveBaseBudget={handleSaveBaseBudget}
            onSaveCategoryBudget={handleSaveCategoryBudget}
            onGoToExpenses={() => setCurrentView("expenses")}
          />
        )}

        {currentView === "expenses" && (
          <ExpensesView
            expenses={activeExpenses}
            budgets={activeBudgets}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            todayStr={todayStr}
          />
        )}

        {currentView === "analytics" && (
          <AnalyticsView expenses={activeExpenses} budgets={activeBudgets} />
        )}
      </main>
    </div>
  );
}
