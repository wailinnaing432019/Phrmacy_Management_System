// resources/js/Components/FilterBar.tsx
"use client";

import { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from "date-fns";

export default function FilterBar({ currentMonth, currentYear }) {
    const [month, setMonth] = useState(currentMonth ?? new Date().getMonth() + 1);
    const [year, setYear] = useState(currentYear ?? new Date().getFullYear());
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const applyMonthYearFilter = () => {
        router.get(route('sales.index'), { month, year });
    };

    const applyDateRangeFilter = () => {
        if (startDate && endDate) {
            router.get(route('sales.index'), { start_date: startDate, end_date: endDate });
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            {/* Month Filter */}
            <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent  >
                        {[...Array(12)].map((_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1)}>
                                {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Year Filter */}
            <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>

            <Button onClick={applyMonthYearFilter}>Filter by Month</Button>

            <div className="border-l h-8 mx-4"></div>

            {/* Start/End Date */}
            {/* <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <Button onClick={applyDateRangeFilter}>Filter by Date</Button> */}
        </div>
    );
}
