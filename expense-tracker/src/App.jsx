import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ExpensesView from "./components/ExpensesView";
import AnalyticsView from "./components/AnalyticsView";

const LOCAL_STORAGE_KEY = "stitch_expense_tracker_data";

export default function App() {
  const [currentView, setCurrentView] = useState("expenses"); // "expenses" | "analytics"

  // User's today date string in YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [expenses, setExpenses] = useState(() => {
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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
    } catch (err) {
      console.error("Failed to save to localStorage:", err);
    }
  }, [expenses]);

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
    setExpenses((prev) => [item, ...prev]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetData = () => {
    if (window.confirm("Clear all expense data?")) {
      setExpenses([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e4e1e6] flex flex-col font-['Geist'] selection:bg-[#fafafa] selection:text-[#09090b]">
      {/* Global Header with interactive calendar badge on top left */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onReset={handleResetData}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        todayStr={todayStr}
      />

      {/* Main Workspace with view transition */}
      <main className="w-full pt-14 flex-1 flex flex-col">
        {currentView === "expenses" ? (
          <ExpensesView
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            todayStr={todayStr}
          />
        ) : (
          <AnalyticsView expenses={expenses} />
        )}
      </main>
    </div>
  );
}
