"use client";

import { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";

export default function FilterBar({ currentMonth, currentYear }) {
    const today = new Date();
    const defaultMonthValue =
        currentYear && currentMonth
            ? `${currentYear}-${String(currentMonth).padStart(2, "0")}`
            : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    const [monthYear, setMonthYear] = useState(defaultMonthValue);

    const applyMonthYearFilter = () => {
        const [year, month] = monthYear.split("-").map(Number);
        router.get(route("sales.index"), { month, year }, { preserveScroll: true });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div>
                <label htmlFor="month-select" className="block text-xs font-semibold text-foreground mb-1">
                    Select Month
                </label>
                <input
                    id="month-select"
                    type="month"
                    value={monthYear}
                    onChange={(e) => setMonthYear(e.target.value)}
                    className="w-full sm:w-44 px-3 py-2 border border-border bg-background rounded-xl shadow-xs text-xs font-medium text-foreground focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
            </div>

            <Button
                onClick={applyMonthYearFilter}
                className="h-10 rounded-xl px-4 text-xs font-semibold"
            >
                Apply Filter
            </Button>
        </div>
    );
}