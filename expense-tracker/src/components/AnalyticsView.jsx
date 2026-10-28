import React, { useState } from "react";
import { CATEGORIES, CATEGORY_COLORS } from "../data";

export default function AnalyticsView({ expenses }) {
  const [timeRange, setTimeRange] = useState("month");
  const [sortBy, setSortBy] = useState("total_desc");

  // Filter expenses by time range
  const filteredExpenses = expenses.filter((e) => {
    if (timeRange === "custom" || timeRange === "year") return true;
    const date = new Date(e.date);
    const now = new Date();
    if (timeRange === "30d") {
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }
    // "month": current month
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyAverage = totalSpent > 0 ? (totalSpent / 30).toFixed(2) : "0.00";

  // Category stats computed directly from active filteredExpenses
  const categoryStats = CATEGORIES.map((cat) => {
    const list = filteredExpenses.filter((e) => e.category === cat);
    const sum = list.reduce((acc, curr) => acc + curr.amount, 0);
    const count = list.length;
    const percentage = totalSpent > 0 ? (sum / totalSpent) * 100 : 0;
    const avg = count > 0 ? (sum / count).toFixed(2) : "0.00";
    return {
      name: cat,
      sum,
      count,
      percentage,
      avg,
      color: CATEGORY_COLORS[cat] || "#fafafa",
    };
  }).filter((c) => c.sum > 0);

  // Sorting
  const sortedCategories = [...categoryStats].sort((a, b) => {
    if (sortBy === "total_desc") return b.sum - a.sum;
    if (sortBy === "count_desc") return b.count - a.count;
    if (sortBy === "name_asc") return a.name.localeCompare(b.name);
    return b.sum - a.sum;
  });

  // Calculate SVG Donut parameters
  const circumference = 2 * Math.PI * 38;
  const donutSegments = sortedCategories.reduce((acc, cat) => {
    const prevOffset = acc.accumulated;
    const strokeDash = (cat.percentage / 100) * circumference;
    const strokeOffset = -((prevOffset / 100) * circumference);
    const item = {
      ...cat,
      strokeDash: `${strokeDash.toFixed(2)} ${circumference.toFixed(2)}`,
      strokeOffset: strokeOffset.toFixed(2),
    };
    return {
      list: [...acc.list, item],
      accumulated: prevOffset + cat.percentage,
    };
  }, { list: [], accumulated: 0 }).list;

  // Daily Spending Trend calculated from real expenses
  const dailySpendingMap = {};
  filteredExpenses.forEach((e) => {
    const d = new Date(e.date);
    const dayNum = String(d.getDate()).padStart(2, "0");
    dailySpendingMap[dayNum] = (dailySpendingMap[dayNum] || 0) + e.amount;
  });

  const dayKeys = Object.keys(dailySpendingMap).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const maxSpend = dayKeys.length > 0 ? Math.max(...Object.values(dailySpendingMap)) : 0;

  const dynamicBars = dayKeys.map((day) => {
    const amt = dailySpendingMap[day];
    const height = maxSpend > 0 ? Math.max(10, Math.round((amt / maxSpend) * 90)) : 0;
    return {
      label: day,
      amount: amt,
      height,
      isPeak: amt === maxSpend && maxSpend > 0,
    };
  });

  // Calculate day with the highest spending
  const dayOfWeekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeekCounts = {};
  filteredExpenses.forEach((e) => {
    const dow = new Date(e.date).getDay();
    dayOfWeekCounts[dow] = (dayOfWeekCounts[dow] || 0) + e.amount;
  });

  let peakDayName = "—";
  let peakPercent = 0;
  if (totalSpent > 0) {
    let maxDow = 0;
    let maxDowAmt = 0;
    Object.entries(dayOfWeekCounts).forEach(([dow, amt]) => {
      if (amt > maxDowAmt) {
        maxDowAmt = amt;
        maxDow = parseInt(dow, 10);
      }
    });
    peakDayName = dayOfWeekNames[maxDow];
    peakPercent = Math.round((maxDowAmt / totalSpent) * 100);
  }

  const handleExportReportCSV = () => {
    let csv = "Category,Total Spent,Percent of Total,Transactions,Average Per Expense\n";
    sortedCategories.forEach((c) => {
      csv += `"${c.name}","₹${c.sum.toFixed(2)}","${c.percentage.toFixed(1)}%","${c.count}","₹${c.avg}"\n`;
    });
    csv += `"Total Spent","₹${totalSpent.toFixed(2)}","100%","${filteredExpenses.length}","₹${dailyAverage}"\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spending-analytics-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8 space-y-8">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider">
              Spending Insights
            </span>
          </div>
          <h1 className="font-['Geist'] font-semibold text-[32px] text-[#fafafa] tracking-tight">
            Analytics &amp; Spending Trends
          </h1>
          <p className="font-['Geist'] text-[14px] text-[#a1a1aa]">
            Simple visual breakdown of where your money goes and daily spending patterns.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1 bg-[#121215] rounded-lg border border-[#27272a]">
            {[
              { id: "month", label: "This Month" },
              { id: "30d", label: "Last 30 Days" },
              { id: "year", label: "This Year" },
              { id: "custom", label: "All Time" },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setTimeRange(btn.id)}
                className={`px-3 py-1.5 font-['JetBrains_Mono'] text-[12px] rounded transition-all cursor-pointer ${
                  timeRange === btn.id
                    ? "bg-[#fafafa] text-[#09090b] font-medium"
                    : "text-[#c4c7c8] hover:text-[#fafafa]"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={filteredExpenses.length === 0}
            onClick={handleExportReportCSV}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#121215] border border-[#27272a] hover:bg-[#1f1f22] rounded-lg font-['JetBrains_Mono'] text-[12px] text-[#e4e1e6] hover:text-[#fafafa] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div data-tour="analytics-metric-ribbon" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Money Spent */}
        <div className="bg-[#121215] border border-[#27272a] p-5 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider block">
              Total Money Spent
            </span>
            <div className="font-['JetBrains_Mono'] text-[30px] font-semibold text-[#fafafa] tracking-tight">
              ₹{totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-3 bg-[#2a2a2d] rounded-lg text-[#fafafa]">
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </div>
        </div>

        {/* Card 2: Average Spent Per Day */}
        <div className="bg-[#121215] border border-[#27272a] p-5 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider block">
              Average Spent Per Day
            </span>
            <div className="font-['JetBrains_Mono'] text-[30px] font-semibold text-[#fafafa] tracking-tight">
              ₹{dailyAverage}
            </div>
          </div>
          <div className="p-3 bg-[#2a2a2d] rounded-lg text-[#fafafa]">
            <span className="material-symbols-outlined text-[20px]">timeline</span>
          </div>
        </div>

        {/* Card 3: Highest Spending Day */}
        <div className="bg-[#121215] border border-[#27272a] p-5 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider block">
              Heaviest Spending Day
            </span>
            <div className="font-['JetBrains_Mono'] text-[30px] font-semibold text-[#fafafa] tracking-tight">
              {peakDayName}{" "}
              {totalSpent > 0 && (
                <span className="font-['JetBrains_Mono'] text-[12px] font-normal text-[#a1a1aa]">
                  ({peakPercent}% of total)
                </span>
              )}
            </div>
          </div>
          <div className="p-3 bg-[#2a2a2d] rounded-lg text-[#fafafa]">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          </div>
        </div>
      </div>

      {/* Visual Breakdown Row */}
      <div data-tour="charts-container" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: Category Donut Chart */}
        <div className="bg-[#121215] border border-[#27272a] p-6 lg:p-7 rounded-xl flex flex-col justify-between min-h-[360px]">
          <div className="flex items-center justify-between pb-4">
            <div className="space-y-0.5">
              <h2 className="font-['Geist'] font-semibold text-[20px] text-[#fafafa]">Spending by Category</h2>
              <p className="font-['Geist'] text-[12px] text-[#a1a1aa]">
                How your money is shared across different categories
              </p>
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#1f1f22] text-[#a1a1aa] uppercase">
              {sortedCategories.length} Categories
            </span>
          </div>

          {sortedCategories.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 my-auto py-4">
              {/* Elegant Empty Donut Ring */}
              <div className="relative flex items-center justify-center">
                <svg
                  aria-label="Empty Category Donut Chart"
                  className="w-48 h-48 -rotate-90 transform"
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" fill="transparent" r="38" stroke="#1f1f22" strokeWidth="12" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="38"
                    stroke="#27272a"
                    strokeWidth="12"
                    strokeDasharray="4 8"
                    className="opacity-60"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider">
                    Total
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[15px] font-semibold text-[#fafafa]">
                    ₹0.00
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#a1a1aa]">0% Spent</span>
                </div>
              </div>

              {/* Empty state hint */}
              <div className="space-y-2 text-left">
                <div className="font-['Geist'] text-[13px] font-medium text-[#fafafa]">
                  Awaiting Expenses
                </div>
                <p className="font-['Geist'] text-[12px] text-[#a1a1aa] leading-relaxed">
                  As you log purchases, this donut chart will automatically slice into colored category shares.
                </p>
                <div className="flex items-center gap-2 pt-1 font-['JetBrains_Mono'] text-[11px] text-[#71717a]">
                  <span className="w-2 h-2 rounded-full bg-[#3f3f46]"></span>
                  <span>5 Categories Ready</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 my-auto py-4">
              {/* Donut SVG */}
              <div className="relative flex items-center justify-center">
                <svg
                  aria-label="Category Donut Chart"
                  className="w-48 h-48 -rotate-90 transform"
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" fill="transparent" r="38" stroke="#1f1f22" strokeWidth="12" />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.name}
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="38"
                      stroke={seg.color}
                      strokeWidth="12"
                      strokeDasharray={seg.strokeDash}
                      strokeDashoffset={seg.strokeOffset}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <title>{`${seg.name}: ₹${seg.sum.toFixed(2)} (${seg.percentage.toFixed(1)}%)`}</title>
                    </circle>
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] uppercase tracking-wider">
                    Total
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[14px] font-semibold text-[#fafafa]">
                    ₹{Math.round(totalSpent).toLocaleString("en-IN")}
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[11px] text-[#c4c7c8]">100%</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-3 font-['JetBrains_Mono'] text-[12px]">
                {sortedCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-[#fafafa] group-hover:underline truncate max-w-[120px]">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#fafafa] font-medium">₹{cat.sum.toFixed(2)}</span>
                      <span className="text-[#a1a1aa] ml-1.5">{cat.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] border-t border-[#27272a]/60">
            <span>{sortedCategories.length > 0 ? `Biggest Expense: ${sortedCategories[0].name}` : "No expenses recorded"}</span>
            <span className="font-medium text-[#fafafa]">{filteredExpenses.length} Total Expenses</span>
          </div>
        </div>

        {/* Card B: Spending Trend Bar Chart */}
        <div className="bg-[#121215] border border-[#27272a] p-6 lg:p-7 rounded-xl flex flex-col justify-between min-h-[360px]">
          <div className="flex items-center justify-between pb-4">
            <div className="space-y-0.5">
              <h2 className="font-['Geist'] font-semibold text-[20px] text-[#fafafa]">Daily Spending Chart</h2>
              <p className="font-['Geist'] text-[12px] text-[#a1a1aa]">
                See how much you spent on each day
              </p>
            </div>
            {dynamicBars.length > 0 && (
              <div className="hidden sm:flex items-center gap-4 font-['JetBrains_Mono'] text-[11px]">
                <div className="flex items-center gap-1.5 text-[#a1a1aa]">
                  <span className="w-2 h-2 rounded bg-[#fafafa]"></span>
                  <span>Daily Amount</span>
                </div>
              </div>
            )}
          </div>

          {dynamicBars.length === 0 ? (
            <div className="py-4">
              <div className="relative h-44 w-full flex items-end justify-between gap-2 px-4 border border-dashed border-[#27272a] rounded-lg">
                {[15, 25, 40, 20, 60, 30, 45, 18, 35, 12].map((mockH, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end opacity-20">
                    <div
                      className="w-full max-w-[20px] rounded-t bg-[#fafafa]"
                      style={{ height: `${mockH}%` }}
                    />
                    <span className="mt-2 font-['JetBrains_Mono'] text-[10px] text-[#a1a1aa]">
                      --
                    </span>
                  </div>
                ))}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-[#121215]/85 rounded-lg">
                  <span className="material-symbols-outlined text-[26px] text-[#a1a1aa] mb-1">bar_chart</span>
                  <span className="font-['Geist'] text-[13px] font-medium text-[#fafafa]">Daily Trend Ready</span>
                  <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">Awaiting first recorded transaction</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 overflow-x-auto">
              <div className="relative h-44 min-w-[320px] w-full flex items-end justify-between gap-1.5 sm:gap-2 px-2">
                {dynamicBars.map((bar) => (
                  <div
                    key={bar.label}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  >
                    <div
                      className={`w-full max-w-[22px] rounded-t transition-colors ${
                        bar.isPeak ? "bg-[#fafafa]" : "bg-[#45464e] hover:bg-[#fafafa]"
                      }`}
                      style={{ height: `${bar.height}%` }}
                    />
                    <span
                      className={`mt-2 font-['JetBrains_Mono'] text-[11px] ${
                        bar.isPeak ? "font-semibold text-[#fafafa]" : "text-[#a1a1aa] group-hover:text-[#fafafa]"
                      }`}
                    >
                      {bar.label}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                      <div className="bg-[#353438] px-2 py-1 rounded text-[#fafafa] font-['JetBrains_Mono'] text-[11px] shadow-md whitespace-nowrap">
                        Day {bar.label}: ₹{bar.amount.toFixed(2)} {bar.isPeak ? "(Highest)" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa] border-t border-[#27272a]/60">
            <span>{dynamicBars.length > 0 ? `${dynamicBars.length} Active Days With Spending` : "No activity"}</span>
            <span className="text-[#fafafa] font-medium">₹{dailyAverage} Per Day Average</span>
          </div>
        </div>
      </div>

      {/* Category Spending Details Table */}
      <div className="bg-[#121215] border border-[#27272a] rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-['Geist'] font-semibold text-[20px] text-[#fafafa]">Category Spending Breakdown</h2>
            <p className="font-['Geist'] text-[14px] text-[#a1a1aa]">
              Detailed table showing total spent per category
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1f1f22] border border-[#27272a] text-[#fafafa] font-['JetBrains_Mono'] text-[11px] px-2.5 py-1 rounded focus:outline-none cursor-pointer"
            >
              <option value="total_desc">Highest Amount First</option>
              <option value="count_desc">Most Transactions First</option>
              <option value="name_asc">Category Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Mobile Category List View */}
        <div className="md:hidden divide-y divide-[#27272a]/60">
          {sortedCategories.length === 0 ? (
            <div className="p-6 text-center text-[#a1a1aa] text-[13px]">
              No categorized expenses recorded yet.
            </div>
          ) : (
            sortedCategories.map((c) => (
              <div key={c.name} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-['Geist'] font-medium text-[14px] text-white truncate">
                      {c.name}
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">
                      {c.count} items • {c.percentage.toFixed(1)}% share
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-['JetBrains_Mono'] font-bold text-[15px] text-white">
                    ₹{c.sum.toFixed(2)}
                  </div>
                  <div className="font-['JetBrains_Mono'] text-[11px] text-[#a1a1aa]">
                    ₹{c.avg}/item
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full min-w-[540px] text-left font-['Geist'] text-[14px] text-[#e4e1e6]">
            <thead className="font-['JetBrains_Mono'] text-[11px] uppercase text-[#a1a1aa] tracking-wider bg-[#0e0e11] border-y border-[#27272a]">
              <tr>
                <th className="py-3 px-6 font-medium">Category</th>
                <th className="py-3 px-6 text-right font-medium">Total Spent</th>
                <th className="py-3 px-6 text-right font-medium">% Share</th>
                <th className="py-3 px-6 text-right font-medium">Transactions</th>
                <th className="py-3 px-6 text-right font-medium">Average Per Item</th>
              </tr>
            </thead>
            <tbody className="font-['JetBrains_Mono'] text-[12px] divide-y divide-[#27272a]">
              {sortedCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#a1a1aa]">
                    No categorized expenses recorded yet.
                  </td>
                </tr>
              ) : (
                sortedCategories.map((c) => (
                  <tr key={c.name} className="hover:bg-[#1f1f22]/60 transition-colors group">
                    <td className="py-3.5 px-6 font-['Geist'] text-[14px] text-[#fafafa] font-medium flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></span>
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3.5 px-6 text-right text-[#fafafa] font-medium">₹{c.sum.toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right text-[#c4c7c8]">{c.percentage.toFixed(1)}%</td>
                    <td className="py-3.5 px-6 text-right text-[#c4c7c8]">{c.count} items</td>
                    <td className="py-3.5 px-6 text-right text-[#c4c7c8]">₹{c.avg}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-[#0e0e11] font-['JetBrains_Mono'] text-[12px] border-t border-[#27272a]">
              <tr>
                <th className="py-4 px-6 text-[#fafafa] font-semibold">Total</th>
                <td className="py-4 px-6 text-right text-[#fafafa] font-bold text-[16px] font-['Geist']">
                  ₹{totalSpent.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right text-[#a1a1aa]">{totalSpent > 0 ? "100.0%" : "0%"}</td>
                <td className="py-4 px-6 text-right text-[#a1a1aa]">{filteredExpenses.length} items</td>
                <td className="py-4 px-6 text-right text-[#a1a1aa]">₹{dailyAverage} avg</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
