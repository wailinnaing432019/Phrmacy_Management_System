// export const roleTextMap: Record<string, string> = {
//     admin: "Admin",
//     cashier: "Cashier",
//     user: "Customer",
// };
export const roleTextMap: Record<string, { label: string; color: string }> = {
    admin: { label: "Admin", color: "text-red-600" },
    cashier: { label: "Cashier", color: "text-green-600" },
    user: { label: "Customer", color: "text-gray-600" },
};