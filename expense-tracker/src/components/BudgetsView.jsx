import React, { useState } from "react";
import { CATEGORIES } from "../data";

export default function BudgetsView({
  expenses,
  budgets,
  onSaveBaseBudget,
  onSaveCategoryBudget,
  onGoToExpenses,
  isInitialSetup
}) {
  const [period, setPeriod] = useState("daily"); // "daily" | "monthly" | "yearly"
  const [budgetInput, setBudgetInput] = useState("");
  const [editingCategory, setEditingCategory] = useState("Overall");
  const [catInput, setCatInput] = useState("");

  const baseMonthly = budgets.baseMonthly || 0;
  const dailyLimit = baseMonthly / 30;
  const monthlyLimit = baseMonthly;
  const yearlyLimit = baseMonthly * 12;

  // Active overall limit for selected tab
  const currentOverallLimit =
    period === "daily" ? dailyLimit : period === "monthly" ? monthlyLimit : yearlyLimit;

  // Filter expenses for selected period
  const now = new Date();
  const filteredByPeriod = expenses.filter((e) => {
    if (!e.date) return false;
    const d = new Date(e.date);
    if (period === "daily") {
      return d.toDateString() === now.toDateString();
    } else if (period === "monthly") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } else if (period === "yearly") {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalSpent = filteredByPeriod.reduce((sum, item) => sum + item.amount, 0);
  const remaining = Math.max(0, currentOverallLimit - totalSpent);
  const percentUsed =
    currentOverallLimit > 0 ? Math.min(100, (totalSpent / currentOverallLimit) * 100) : 0;
  const isOverBudget = currentOverallLimit > 0 && totalSpent > currentOverallLimit;

  // Handle setting linked base budget
  const handleSetBaseBudget = (e) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val <= 0) return;

    // Convert input based on current active tab into baseMonthly
    let calculatedMonthly = val;
    if (period === "daily") {
      calculatedMonthly = val * 30; // 5000/day -> 1,50,000/month
    } else if (period === "yearly") {
      calculatedMonthly = val / 12; // 18,00,000/yr -> 1,50,000/month
    }

    onSaveBaseBudget(calculatedMonthly);
    setBudgetInput("");
  };

  // Handle setting category budget
  const handleSetCategoryBudget = (e) => {
    e.preventDefault();
    const val = parseFloat(catInput);
    if (isNaN(val) || val < 0) return;

    onSaveCategoryBudget(editingCategory, val);
    setCatInput("");
  };

  const periodLabel = period === "daily" ? "Daily" : period === "monthly" ? "Monthly" : "Yearly";
  const periodSub = period === "daily" ? "Today" : period === "monthly" ? "This Month" : "This Year";

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Onboarding Welcome Banner if no budget has been set yet */}
      {baseMonthly === 0 && (
        <div className="bg-[#121215] border-2 border-[#fafafa]/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#fafafa] text-[#09090b] text-[11px] font-['JetBrains_Mono'] font-semibold">
              STEP 1: GET STARTED
            </div>
            <h2 className="font-['Geist'] font-semibold text-[24px] text-[#fafafa] tracking-tight">
              Welcome! Please set your budget first
            </h2>
            <p className="font-['Geist'] text-[14px] text-[#a1a1aa]">
              Enter your target budget below (daily, monthly, or yearly). The tracker will automatically calculate your daily allowance (30 days) and yearly total (12 months).
            </p>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider">
              Budget Planner
            </span>
            <span className="text-[#a1a1aa]">•</span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#fafafa]">{periodSub}</span>
          </div>
          <h1 className="font-['Geist'] font-semibold text-[32px] text-[#fafafa] tracking-tight">
            Budgets &amp; Spending Limits
          </h1>
          <p className="font-['Geist'] text-[14px] text-[#a1a1aa]">
            Linked budget system: daily, monthly, and yearly limits adjust together automatically.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="inline-flex p-1 bg-[#121215] rounded-lg border border-[#27272a] self-start md:self-auto">
          {[
            { id: "daily", label: "Daily (x30)" },
            { id: "monthly", label: "Monthly" },
            { id: "yearly", label: "Yearly (x12)" },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => {
                setPeriod(btn.id);
                setBudgetInput("");
              }}
              className={`px-3.5 py-1.5 font-['JetBrains_Mono'] text-[12px] rounded transition-all cursor-pointer ${
                period === btn.id
                  ? "bg-[#fafafa] text-[#09090b] font-medium"
                  : "text-[#c4c7c8] hover:text-[#fafafa]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Way Linked Budget Synchronizer Ribbon */}
      <div data-tour="budget-sync-card" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Daily Card */}
        <div
          onClick={() => setPeriod("daily")}
          className={`bg-[#121215] border rounded-xl p-5 flex flex-col justify-between transition-all cursor-pointer ${
            period === "daily" ? "border-[#fafafa] ring-1 ring-[#fafafa]/20" : "border-[#27272a] hover:border-[#a1a1aa]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-['Geist'] text-[14px] text-[#a1a1aa] font-medium">Daily Allowance</span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#a1a1aa] px-2 py-0.5 rounded bg-[#09090b] border border-[#27272a]">
              Monthly ÷ 30
            </span>
          </div>
          <div className="my-3">
            <div className="font-['JetBrains_Mono'] font-semibold text-[26px] text-[#fafafa]">
              ₹{dailyLimit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div className="font-['Geist'] text-[12px] text-[#a1a1aa] mt-0.5">
              Target spending for today
            </div>
          </div>
          <div className="pt-2 border-t border-[#27272a] font-['JetBrains_Mono'] text-[11px] text-[#c4c7c8]">
            {period === "daily" ? "● Currently active view" : "Click to view daily"}
          </div>
        </div>

        {/* Monthly Card */}
        <div
          onClick={() => setPeriod("monthly")}
          className={`bg-[#121215] border rounded-xl p-5 flex flex-col justify-between transition-all cursor-pointer ${
            period === "monthly" ? "border-[#fafafa] ring-1 ring-[#fafafa]/20" : "border-[#27272a] hover:border-[#a1a1aa]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-['Geist'] text-[14px] text-[#a1a1aa] font-medium">Monthly Budget</span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#a1a1aa] px-2 py-0.5 rounded bg-[#09090b] border border-[#27272a]">
              Base Budget
            </span>
          </div>
          <div className="my-3">
            <div className="font-['JetBrains_Mono'] font-semibold text-[26px] text-[#fafafa]">
              ₹{monthlyLimit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div className="font-['Geist'] text-[12px] text-[#a1a1aa] mt-0.5">
              Target spending this month
            </div>
          </div>
          <div className="pt-2 border-t border-[#27272a] font-['JetBrains_Mono'] text-[11px] text-[#c4c7c8]">
            {period === "monthly" ? "● Currently active view" : "Click to view monthly"}
          </div>
        </div>

        {/* Yearly Card */}
        <div
          onClick={() => setPeriod("yearly")}
          className={`bg-[#121215] border rounded-xl p-5 flex flex-col justify-between transition-all cursor-pointer ${
            period === "yearly" ? "border-[#fafafa] ring-1 ring-[#fafafa]/20" : "border-[#27272a] hover:border-[#a1a1aa]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-['Geist'] text-[14px] text-[#a1a1aa] font-medium">Yearly Total</span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#a1a1aa] px-2 py-0.5 rounded bg-[#09090b] border border-[#27272a]">
              Monthly × 12
            </span>
          </div>
          <div className="my-3">
            <div className="font-['JetBrains_Mono'] font-semibold text-[26px] text-[#fafafa]">
              ₹{yearlyLimit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div className="font-['Geist'] text-[12px] text-[#a1a1aa] mt-0.5">
              Target spending this year
            </div>
          </div>
          <div className="pt-2 border-t border-[#27272a] font-['JetBrains_Mono'] text-[11px] text-[#c4c7c8]">
            {period === "yearly" ? "● Currently active view" : "Click to view yearly"}
          </div>
        </div>
      </div>

      {/* Main Budget Progress Card */}
      <div data-tour="budget-progress-bar" className="bg-[#121215] border border-[#27272a] rounded-xl p-6 lg:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
          <div>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider block mb-1">
              {periodLabel} Spending Status
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-['JetBrains_Mono'] text-[36px] font-semibold text-[#fafafa]">
                ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="font-['JetBrains_Mono'] text-[14px] text-[#a1a1aa]">
                spent of ₹{currentOverallLimit.toLocaleString("en-IN", { maximumFractionDigits: 2 })} budget
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {isOverBudget ? (
              <span className="px-3 py-1 rounded bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444] font-['JetBrains_Mono'] text-[12px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Over budget by ₹{(totalSpent - currentOverallLimit).toFixed(2)}
              </span>
            ) : (
              <span className="px-3 py-1 rounded bg-[#1f1f22] border border-[#27272a] text-[#fafafa] font-['JetBrains_Mono'] text-[12px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#fafafa]">check_circle</span>
                ₹{remaining.toFixed(2)} remaining ({100 - Math.round(percentUsed)}% left)
              </span>
            )}

            {/* Quick link to record expenses */}
            <button
              type="button"
              onClick={onGoToExpenses}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fafafa] text-[#09090b] rounded-lg font-['Geist'] text-[12px] font-medium hover:bg-[#e4e1e6] transition-colors cursor-pointer"
            >
              <span>Go to Expenses</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">
            <span>{percentUsed.toFixed(1)}% Used</span>
            <span>{isOverBudget ? "Budget Limit Exceeded" : `${(100 - percentUsed).toFixed(1)}% Available`}</span>
          </div>
          <div className="w-full bg-[#09090b] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#27272a]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget
                  ? "bg-[#ef4444]"
                  : percentUsed > 80
                  ? "bg-[#eab308]"
                  : "bg-[#fafafa]"
              }`}
              style={{ width: `${Math.min(100, percentUsed)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Section: Budget Settings & Category Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Set Overall Budget */}
        <div className="lg:col-span-5 bg-[#121215] border border-[#27272a] rounded-xl p-6 flex flex-col gap-5">
          <div>
            <h2 className="font-['Geist'] font-semibold text-[16px] text-[#fafafa]">
              Set {periodLabel} Budget
            </h2>
            <p className="font-['Geist'] text-[12px] text-[#a1a1aa] mt-0.5">
              Enter your {periodLabel.toLowerCase()} budget. Changing this will automatically update the other periods!
            </p>
          </div>

          <form onSubmit={handleSetBaseBudget} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider">
                {periodLabel} Amount (₹)
              </label>
              <div className="flex rounded-lg border border-[#27272a] bg-[#09090b] focus-within:border-[#fafafa] overflow-hidden">
                <span className="flex items-center px-3.5 font-['JetBrains_Mono'] text-[14px] text-[#a1a1aa] border-r border-[#27272a]">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder={
                    period === "daily"
                      ? "e.g., 5000"
                      : period === "monthly"
                      ? "e.g., 150000"
                      : "e.g., 1800000"
                  }
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-full bg-transparent px-3 py-2.5 text-[14px] font-['JetBrains_Mono'] text-[#fafafa] focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-lg font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] space-y-1">
              <div>• 1 Month = 30 Days</div>
              <div>• 1 Year = 12 Months</div>
              <div className="text-[#fafafa]">
                Setting ₹{budgetInput || (period === "daily" ? "5,000" : period === "monthly" ? "1,50,000" : "18,00,000")} will set:
              </div>
              <div className="text-[#c4c7c8]">
                {period === "daily" &&
                  `₹${((parseFloat(budgetInput) || 5000) * 30).toLocaleString("en-IN")}/mo and ₹${((parseFloat(budgetInput) || 5000) * 30 * 12).toLocaleString("en-IN")}/yr`}
                {period === "monthly" &&
                  `₹${Math.round((parseFloat(budgetInput) || 150000) / 30).toLocaleString("en-IN")}/day and ₹${((parseFloat(budgetInput) || 150000) * 12).toLocaleString("en-IN")}/yr`}
                {period === "yearly" &&
                  `₹${Math.round((parseFloat(budgetInput) || 1800000) / 360).toLocaleString("en-IN")}/day and ₹${Math.round((parseFloat(budgetInput) || 1800000) / 12).toLocaleString("en-IN")}/mo`}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-[#fafafa] text-[#09090b] font-medium text-[14px] py-2.5 px-4 rounded-lg hover:bg-[#e4e1e6] active:opacity-90 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Update Budget</span>
            </button>
          </form>

          {/* Category Budget Form */}
          <div className="pt-4 border-t border-[#27272a]">
            <h3 className="font-['Geist'] font-medium text-[14px] text-[#fafafa] mb-1">
              Optional: Set Category Limits (Monthly)
            </h3>
            <form onSubmit={handleSetCategoryBudget} className="flex flex-col gap-3 mt-3">
              <select
                value={editingCategory}
                onChange={(e) => setEditingCategory(e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-[13px] text-[#fafafa] focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className="flex rounded-lg border border-[#27272a] bg-[#09090b] focus-within:border-[#fafafa] overflow-hidden">
                <span className="flex items-center px-3 font-['JetBrains_Mono'] text-[13px] text-[#a1a1aa] border-r border-[#27272a]">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  placeholder="Monthly limit for category"
                  value={catInput}
                  onChange={(e) => setCatInput(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-[13px] font-['JetBrains_Mono'] text-[#fafafa] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1f1f22] border border-[#27272a] hover:border-[#fafafa] text-[#fafafa] text-[13px] py-2 px-3 rounded-lg transition-colors cursor-pointer"
              >
                <span>Set {editingCategory} Limit</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Category Budgets Breakdown */}
        <div className="lg:col-span-7 bg-[#121215] border border-[#27272a] rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
            <div>
              <h2 className="font-['Geist'] font-semibold text-[16px] text-[#fafafa]">
                Category Budgets ({periodLabel})
              </h2>
              <p className="font-['Geist'] text-[12px] text-[#a1a1aa]">
                Compare your actual spending against category targets
              </p>
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">
              {CATEGORIES.length} Categories
            </span>
          </div>

          <div className="divide-y divide-[#27272a]/60 p-4 sm:p-6 flex flex-col gap-4">
            {CATEGORIES.map((cat) => {
              const spent = filteredByPeriod
                .filter((e) => e.category === cat)
                .reduce((s, curr) => s + curr.amount, 0);

              const monthlyCatLimit = (budgets.categories && budgets.categories[cat]) || 0;
              // Scale category limit according to selected period
              const scaledLimit =
                period === "daily"
                  ? monthlyCatLimit / 30
                  : period === "yearly"
                  ? monthlyCatLimit * 12
                  : monthlyCatLimit;

              const catPercent = scaledLimit > 0 ? Math.min(100, (spent / scaledLimit) * 100) : 0;
              const isCatOver = scaledLimit > 0 && spent > scaledLimit;

              return (
                <div key={cat} className="pt-3 first:pt-0 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-['Geist'] font-medium text-[#fafafa]">{cat}</span>
                    </div>

                    <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[12px]">
                      <span className="text-[#fafafa] font-medium">₹{spent.toFixed(2)}</span>
                      <span className="text-[#a1a1aa]">
                        {scaledLimit > 0 ? `/ ₹${scaledLimit.toFixed(2)}` : "(No target set)"}
                      </span>
                      {scaledLimit > 0 && (
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded ${
                            isCatOver ? "bg-[#ef4444]/20 text-[#ef4444]" : "bg-[#1f1f22] text-[#a1a1aa]"
                          }`}
                        >
                          {catPercent.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar if limit is set */}
                  {scaledLimit > 0 && (
                    <div className="w-full bg-[#09090b] h-2 rounded-full overflow-hidden border border-[#27272a]">
                      <div
                        className={`h-full rounded-full ${
                          isCatOver ? "bg-[#ef4444]" : "bg-[#fafafa]"
                        }`}
                        style={{ width: `${catPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
