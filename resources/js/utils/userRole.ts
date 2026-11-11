// export const roleTextMap: Record<string, string> = {
//     admin: "Admin",
//     cashier: "Cashier",
//     user: "Customer",
// };
export const roleTextMap: Record<string, { label: string; color: string; badge: string }> = {
    admin: {
        label: "Admin",
        color: "text-purple-700",
        badge: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
    },
    cashier: {
        label: "Cashier",
        color: "text-indigo-600",
        badge: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
    },
    user: {
        label: "Customer",
        color: "text-slate-600",
        badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    },
};