import React, { useState } from "react";
import { CATEGORIES } from "../data";

export default function ExpensesView({
  expenses,
  budgets,
  onAddExpense,
  onDeleteExpense,
  selectedDate,
  setSelectedDate,
  todayStr
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Equipment & Tech");
  const [note, setNote] = useState("");

  // Date for transaction entry defaults to today's date
  const [txDate, setTxDate] = useState(todayStr);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterMode, setFilterMode] = useState("ALL"); // "ALL" | "SELECTED_DATE" | "SELECTED_MONTH"
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter expenses
  const filtered = expenses.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filterCategory === "ALL" || item.category === filterCategory;

    let matchesDate = true;
    const itemDateStr = item.date ? item.date.slice(0, 10) : "";
    if (filterMode === "SELECTED_DATE") {
      matchesDate = itemDateStr === selectedDate;
    } else if (filterMode === "SELECTED_MONTH") {
      matchesDate = itemDateStr.slice(0, 7) === selectedDate.slice(0, 7);
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  // Dynamic budget limit based on filterMode:
  // User preference: default/all-time comparisons use Daily budget rather than Yearly
  const baseMonthly = budgets?.baseMonthly || 0;
  const dailyLimit = baseMonthly / 30;
  const activeBudgetLimit =
    filterMode === "SELECTED_MONTH" ? baseMonthly : dailyLimit;

  // Metrics computed over filtered set
  const totalSpent = filtered.reduce((sum, item) => sum + item.amount, 0);
  const budgetLeft = Math.max(0, activeBudgetLimit - totalSpent);
  const budgetUsedPercent =
    activeBudgetLimit > 0 ? Math.min(100, (totalSpent / activeBudgetLimit) * 100).toFixed(1) : "0.0";

  // Category breakdown calculations
  const categoryStats = CATEGORIES.map((cat) => {
    const matching = filtered.filter((e) => e.category === cat);
    const sum = matching.reduce((acc, curr) => acc + curr.amount, 0);
    const count = matching.length;
    const percentage = totalSpent > 0 ? (sum / totalSpent) * 100 : 0;
    return { name: cat, sum, count, percentage };
  })
    .filter((cat) => cat.sum > 0)
    .sort((a, b) => b.sum - a.sum);

  const highestCat = categoryStats[0] || { name: "None", sum: 0, count: 0, percentage: 0 };
  const secondHighest = categoryStats[1] || null;
  const avgPerItem = filtered.length > 0 ? (totalSpent / filtered.length).toFixed(2) : "0.00";

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !amount || parseFloat(amount) <= 0) return;

    // Use txDate or fallback to today
    const chosenDateStr = txDate || todayStr;
    const expenseDateTime = new Date(`${chosenDateStr}T12:00:00`).toISOString();

    onAddExpense({
      name: name.trim(),
      amount: parseFloat(amount),
      category,
      date: expenseDateTime,
      note: note.trim() || "Manual entry",
    });

    setName("");
    setAmount("");
    setNote("");
  };

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // CSV Export
  const handleExportCSV = () => {
    let csv = "Expense Name,Category,Date,Cost,Note\n";
    filtered.forEach((r) => {
      const cleanName = r.name.replace(/"/g, '""');
      const cleanNote = (r.note || "").replace(/"/g, '""');
      csv += `"${cleanName}","${r.category}","${r.displayDate}","₹${r.amount.toFixed(2)}","${cleanNote}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses-${filterMode.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getCategorySegmentColor = (catName) => {
    switch (catName) {
      case "Equipment & Tech":
        return "bg-[#fafafa]";
      case "Utilities & Bills":
        return "bg-[#d4d4d8]";
      case "Food & Dining":
        return "bg-[#a1a1aa]";
      case "Transportation":
        return "bg-[#71717a]";
      case "Health & Fitness":
        return "bg-[#52525b]";
      default:
        return "bg-[#45464e]";
    }
  };

  const selectedDateFormatted = new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Date Filter & Scope Banner */}
      <div className="bg-[#121215] border border-[#27272a] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-[#fafafa]">filter_alt</span>
          <span className="font-['Geist'] text-[14px] text-[#fafafa] font-medium">Filter by Date:</span>

          <div className="inline-flex p-1 bg-[#09090b] rounded-lg border border-[#27272a]">
            <button
              type="button"
              onClick={() => {
                setFilterMode("ALL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 font-['JetBrains_Mono'] text-[11px] rounded transition-all cursor-pointer ${
                filterMode === "ALL"
                  ? "bg-[#fafafa] text-[#09090b] font-medium"
                  : "text-[#c4c7c8] hover:text-[#fafafa]"
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterMode("SELECTED_DATE");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 font-['JetBrains_Mono'] text-[11px] rounded transition-all cursor-pointer ${
                filterMode === "SELECTED_DATE"
                  ? "bg-[#fafafa] text-[#09090b] font-medium"
                  : "text-[#c4c7c8] hover:text-[#fafafa]"
              }`}
            >
              Selected Date ({selectedDateFormatted})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterMode("SELECTED_MONTH");
                setCurrentPage(1);
              }}
              className={`px-3 py-1 font-['JetBrains_Mono'] text-[11px] rounded transition-all cursor-pointer ${
                filterMode === "SELECTED_MONTH"
                  ? "bg-[#fafafa] text-[#09090b] font-medium"
                  : "text-[#c4c7c8] hover:text-[#fafafa]"
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Change date directly from filter bar */}
        <div className="flex items-center gap-2">
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">Change Date:</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#09090b] border border-[#27272a]">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                  setFilterMode("SELECTED_DATE");
                  setCurrentPage(1);
                }
              }}
              className="bg-transparent text-[12px] font-['JetBrains_Mono'] text-[#fafafa] focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Top Metric Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Spent */}
        <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6 flex flex-col justify-between transition-colors hover:border-[#444748]/60">
          <div className="flex items-center justify-between">
            <span className="font-['Geist'] font-medium text-[16px] text-[#a1a1aa]">
              Total Spent {filterMode === "SELECTED_DATE" ? `(${selectedDateFormatted})` : ""}
            </span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] px-2 py-0.5 border border-[#27272a] rounded bg-[#09090b]">
              {filterMode}
            </span>
          </div>
          <div className="mt-4 mb-3">
            <div className="font-['JetBrains_Mono'] font-semibold text-[30px] leading-tight text-[#fafafa] tracking-tight">
              ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="font-['Geist'] text-[12px] text-[#a1a1aa] mt-1">
              Target: ₹{activeBudgetLimit.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ({filterMode === "SELECTED_MONTH" ? "Monthly" : "Daily"})
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#27272a]/60">
            <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">
              <span>Budget left:</span>
              <span className="text-[#fafafa] font-medium">
                {activeBudgetLimit > 0
                  ? `₹${budgetLeft.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "No budget set"}
              </span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#c4c7c8] bg-[#1f1f22] px-2 py-0.5 rounded">
              {activeBudgetLimit > 0 ? `${budgetUsedPercent}% used` : "0% used"}
            </span>
          </div>
        </div>

        {/* Card 2: Highest Spending Category */}
        <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6 flex flex-col justify-between transition-colors hover:border-[#444748]/60">
          <div className="flex items-center justify-between">
            <span className="font-['Geist'] font-medium text-[16px] text-[#a1a1aa]">
              Highest Spending Category
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#a1a1aa]">pie_chart</span>
          </div>
          <div className="mt-4 mb-3">
            <div className="font-['Geist'] font-semibold text-[20px] text-[#fafafa] tracking-tight truncate">
              {highestCat.name}
            </div>
            <div className="font-['JetBrains_Mono'] text-[12px] text-[#a1a1aa] mt-1">
              ₹{highestCat.sum.toFixed(2)} across {highestCat.count} payments
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[#27272a]/60">
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">Second highest:</span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#c4c7c8] font-medium">
              {secondHighest ? `${secondHighest.name} (${secondHighest.percentage.toFixed(1)}%)` : "N/A"}
            </span>
          </div>
        </div>

        {/* Card 3: Total Expenses Logged */}
        <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6 flex flex-col justify-between transition-colors hover:border-[#444748]/60">
          <div className="flex items-center justify-between">
            <span className="font-['Geist'] font-medium text-[16px] text-[#a1a1aa]">
              Total Expenses Logged
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#a1a1aa]">receipt_long</span>
          </div>
          <div className="mt-4 mb-3">
            <div className="font-['JetBrains_Mono'] font-semibold text-[30px] leading-tight text-[#fafafa] tracking-tight">
              {filtered.length} Records
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[#27272a]/60 font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">
            <span>
              Avg: <strong className="text-[#fafafa] font-normal">₹{avgPerItem}</strong>/item
            </span>
            <span className="text-[#27272a]">•</span>
            <span>{filtered.length} entries</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Add Expense + Breakdown) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Add New Expense Form */}
          <div data-tour="expense-form" className="bg-[#121215] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-['Geist'] font-semibold text-[16px] text-[#fafafa]">Add New Expense</h2>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] px-1.5 py-0.5 border border-[#27272a] rounded bg-[#09090b]">
                [Enter] to add
              </span>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider" htmlFor="expense-name">
                  What did you spend on?
                </label>
                <input
                  id="expense-name"
                  type="text"
                  required
                  placeholder="e.g., Grocery run, Metro pass, Dinner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3.5 py-2.5 text-[14px] text-[#fafafa] placeholder:text-[#a1a1aa]/60 focus:outline-none focus:border-[#fafafa] transition-colors"
                />
              </div>

              {/* Amount with Currency Prefix */}
              <div className="flex flex-col gap-1.5">
                <label className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider" htmlFor="expense-amount">
                  Amount
                </label>
                <div className="flex rounded-lg border border-[#27272a] bg-[#09090b] focus-within:border-[#fafafa] transition-colors overflow-hidden">
                  <span className="flex items-center px-3.5 font-['JetBrains_Mono'] text-[14px] text-[#a1a1aa] select-none border-r border-[#27272a] bg-[#121215]/40">
                    ₹
                  </span>
                  <input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent px-3 py-2.5 text-[14px] font-['JetBrains_Mono'] text-[#fafafa] placeholder:text-[#a1a1aa]/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Date Input Widget: Defaulted to user's today's date, allows past dates */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider" htmlFor="expense-date">
                    Transaction Date
                  </label>
                  {txDate !== todayStr && (
                    <button
                      type="button"
                      onClick={() => setTxDate(todayStr)}
                      className="text-[10px] font-['JetBrains_Mono'] text-[#a1a1aa] hover:text-[#fafafa] underline cursor-pointer"
                    >
                      Set to Today
                    </button>
                  )}
                </div>
                <div className="flex rounded-lg border border-[#27272a] bg-[#09090b] focus-within:border-[#fafafa] transition-colors overflow-hidden px-3 py-2">
                  <span className="material-symbols-outlined text-[18px] text-[#a1a1aa] mr-2 flex items-center">
                    event
                  </span>
                  <input
                    id="expense-date"
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-transparent text-[13px] font-['JetBrains_Mono'] text-[#fafafa] focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider" htmlFor="expense-category">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="expense-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none bg-[#09090b] border border-[#27272a] rounded-lg px-3.5 py-2.5 pr-9 text-[14px] text-[#fafafa] focus:outline-none focus:border-[#fafafa] transition-colors cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a1a1aa] text-[18px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Optional Note */}
              <div className="flex flex-col gap-1.5">
                <label className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider" htmlFor="expense-note">
                  Note / Tag (Optional)
                </label>
                <input
                  id="expense-note"
                  type="text"
                  placeholder="e.g., Work setup, Personal"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3.5 py-2 text-[14px] text-[#fafafa] placeholder:text-[#a1a1aa]/60 focus:outline-none focus:border-[#fafafa] transition-colors"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-[#fafafa] text-[#09090b] font-medium text-[14px] py-2.5 px-4 rounded-lg hover:bg-[#e4e1e6] active:opacity-90 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Record Entry</span>
              </button>
            </form>
          </div>

          {/* Spending by Category Card */}
          <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="font-['Geist'] font-semibold text-[16px] text-[#fafafa]">Spending by Category</h2>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">
                {categoryStats.length} active
              </span>
            </div>

            {/* Segmented Top Bar */}
            <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-[#09090b] gap-0.5 p-0.5 border border-[#27272a]">
              {categoryStats.length === 0 ? (
                <div className="w-full h-full bg-[#27272a] rounded-sm" />
              ) : (
                categoryStats.map((item) => (
                  <div
                    key={item.name}
                    className={`h-full rounded-sm transition-all ${getCategorySegmentColor(item.name)}`}
                    style={{ width: `${item.percentage}%` }}
                    title={`${item.name}: ${item.percentage.toFixed(1)}%`}
                  />
                ))
              )}
            </div>

            {/* Category Breakdown List */}
            <div className="flex flex-col gap-4 text-[12px]">
              {categoryStats.length === 0 ? (
                <p className="text-[#a1a1aa] text-[12px] py-2 text-center">No expenses in this period.</p>
              ) : (
                categoryStats.map((item) => (
                  <div key={item.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getCategorySegmentColor(item.name)}`} />
                        <span className="text-[#fafafa]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-['JetBrains_Mono']">
                        <span className="text-[#fafafa]">₹{item.sum.toFixed(2)}</span>
                        <span className="text-[#a1a1aa] text-[11px]">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#09090b] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getCategorySegmentColor(item.name)}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Ledger Table) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div data-tour="expense-ledger-table" className="bg-[#121215] border border-[#27272a] rounded-xl overflow-hidden flex flex-col">
            {/* Header & Controls */}
            <div className="p-6 border-b border-[#27272a] flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-['Geist'] font-semibold text-[16px] text-[#fafafa]">Expense History</h2>
                  <p className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] mt-0.5">
                    Showing {paginated.length} of {filtered.length} entries ({filterMode === "SELECTED_DATE" ? selectedDateFormatted : filterMode === "SELECTED_MONTH" ? "Selected Month" : "All Time"})
                  </p>
                </div>
                <button
                  type="button"
                  disabled={filtered.length === 0}
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#09090b] border border-[#27272a] hover:border-[#a1a1aa] text-[#fafafa] rounded-lg font-['JetBrains_Mono'] text-[11px] transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                {/* Search */}
                <div className="sm:col-span-7 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search expenses..."
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg pl-9 pr-3.5 py-2 text-[14px] text-[#fafafa] placeholder:text-[#a1a1aa]/60 focus:outline-none focus:border-[#fafafa] transition-colors"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="sm:col-span-5 relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none bg-[#09090b] border border-[#27272a] rounded-lg px-3.5 py-2 pr-9 text-[14px] text-[#fafafa] focus:outline-none focus:border-[#fafafa] transition-colors cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a1a1aa] text-[18px]">
                    filter_list
                  </span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[520px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#27272a] bg-[#09090b]/60 font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase">
                    <th className="py-3 px-5 font-normal tracking-wider">Expense Name</th>
                    <th className="py-3 px-4 font-normal tracking-wider">Category</th>
                    <th className="py-3 px-4 font-normal tracking-wider">Date</th>
                    <th className="py-3 px-5 font-normal tracking-wider text-right">Cost</th>
                    <th className="py-3 px-4 font-normal tracking-wider text-center w-12">
                      <span className="sr-only">Actions</span>
                      <span className="material-symbols-outlined text-[15px] text-[#a1a1aa]">more_horiz</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]/70 text-[14px]">
                  {paginated.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3.5 px-5">
                        <div className="text-[14px] text-[#fafafa] font-medium">{item.name}</div>
                        <div className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">{item.note || "Personal note"}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 border border-[#27272a] rounded font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] bg-[#09090b]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-['JetBrains_Mono'] text-[12px] text-[#a1a1aa] whitespace-nowrap">
                        {item.displayDate}
                      </td>
                      <td className="py-3.5 px-5 font-['JetBrains_Mono'] text-[14px] text-[#fafafa] text-right whitespace-nowrap">
                        -₹{item.amount.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(item.id)}
                          title="Delete entry"
                          className="text-[#a1a1aa] hover:text-[#ef4444] transition-colors p-1 rounded cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Zero State */}
            {filtered.length === 0 && (
              <div className="m-6 p-8 border border-dashed border-[#27272a] rounded-lg flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-[28px] text-[#a1a1aa] mb-2">event_busy</span>
                <p className="font-['JetBrains_Mono'] text-[12px] text-[#fafafa]">No expenses found for this date selection</p>
                <p className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] mt-1">
                  Try switching to "All Time" or pick another date above.
                </p>
              </div>
            )}

            {/* Pagination footer */}
            <div className="p-4 border-t border-[#27272a] bg-[#09090b]/30 flex flex-col sm:flex-row items-center justify-between gap-3 font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">
              <div>
                Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border border-[#27272a] rounded bg-[#09090b] hover:bg-[#1f1f22] text-[#a1a1aa] hover:text-[#fafafa] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-2 text-[#fafafa]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 border border-[#27272a] rounded bg-[#09090b] hover:bg-[#1f1f22] text-[#fafafa] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
