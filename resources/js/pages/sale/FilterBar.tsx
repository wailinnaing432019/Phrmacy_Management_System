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
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div>
                <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Month
                </label>
                <input
                    id="month-select"
                    type="month"
                    value={monthYear}
                    onChange={(e) => setMonthYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 text-gray-700"
                />
            </div>

            {/* The button is now a primary, standalone element */}
            <Button
                onClick={applyMonthYearFilter}
                className="w-full sm:w-auto px-5 py-2.5 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150"
            >
                Apply Filter
            </Button>
        </div>
    );
}