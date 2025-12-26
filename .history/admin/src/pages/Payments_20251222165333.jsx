import React, { useState, useEffect } from "react";
import {
    CreditCard,
    Receipt,
    FileText,
    RefreshCw,
    BarChart2,
    Eye,
    Trash2,
    Download,
    Loader2,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useAdminAuth } from "../context/AdminAuthContext";

const THEME = "#e3002a";
const LOGO_URL = "/logo.png";
const API_BASE = "/api/revenue";

export default function PaymentsPage() {
    const [activeTab, setActiveTab] = useState("transactions");
    const [viewData, setViewData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Data states
    const [transactions, setTransactions] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [thisMonthRevenue, setThisMonthRevenue] = useState(0);
    const [revenueData, setRevenueData] = useState([]);
    // Fetch functions
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await axiosAdmin.get("/api/revenue/transactions?limit=50");
            const data = res.data.data.map(t => ({
                id: t._id,
                user: t.user?.name || "Guest",
                amount: t.total,
                method: t.paymentMethod || "UPI",
                status: t.status === "Completed" ? "Success" : t.status === "Failed" ? "Failed" : "Pending",
                date: new Date(t.createdAt).toLocaleDateString("en-IN"),
                raw: t,
            }));
            setTransactions(data);
            setInvoices(data.slice(0, 10));
        } catch (err) {
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    const fetchMemberships = async () => {
        setLoading(true);
        try {
            const res = await axiosAdmin.get("/api/revenue/membership/users?limit=50");
            const data = res.data.data.map(m => ({
                id: m.userId || m._id,
                member: m.name,
                plan: m.plan,
                amount: m.payment,
                status: m.status === "Active" ? "Paid" : "Pending",
                renewal: new Date(m.expiresAt).toLocaleDateString("en-IN"),
                raw: m,
            }));
            setMemberships(data);
        } catch (err) {
            toast.error("Failed to load memberships");
        } finally {
            setLoading(false);
        }
    };

    const fetchRevenuePerformance = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/performance?period=monthly`);
            const monthlyData = res.data.data;

            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const formatted = monthNames.map((name, idx) => {
                const monthIdx = (currentMonth - (11 - idx) + 12) % 12;
                const yearOffset = currentMonth - (11 - idx) < 0 ? -1 : 0;
                const targetMonth = monthIdx + 1; // Mongo $month is 1-based

                const entry = monthlyData.find(d => d.month === targetMonth);
                return {
                    month: name,
                    value: entry ? entry.revenue : 0,
                };
            });

            setRevenueData(formatted);
            setThisMonthRevenue(formatted[formatted.length - 1].value);
        } catch (err) {
            // Fallback to last 7 days if monthly not ideal
            try {
                const weeklyRes = await axios.get(`${API_BASE}/last-7-days`);
                const days = weeklyRes.data.days;
                const revenues = weeklyRes.data.revenues;
                const recent = days.slice(-12).map((d, i) => ({
                    month: d,
                    value: revenues[revenues.length - 12 + i] || 0,
                }));
                setRevenueData(recent);
                setThisMonthRevenue(revenues[revenues.length - 1] || 0);
            } catch (e) {
                toast.error("Failed to load revenue data");
            }
        } finally {
            setLoading(false);
        }
    };

    // Load data based on active tab
    useEffect(() => {
        if (activeTab === "transactions") fetchTransactions();
        if (activeTab === "memberships") fetchMemberships();
        if (activeTab === "invoices") fetchTransactions();
        if (activeTab === "revenue") fetchRevenuePerformance();
    }, [activeTab]);

    const badgeClasses = (status) => {
        switch (status) {
            case "Success":
            case "Paid":
            case "Active":
                return "bg-green-100 text-green-800";
            case "Failed":
                return "bg-red-100 text-red-800";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleView = (item) => setViewData(item.raw || item);
    const handleCloseView = () => setViewData(null);

    const handleDelete = (id, type) => {
        if (!window.confirm("Are you sure you want to delete?")) return;
        // No delete endpoint provided – just remove locally
        if (type === "transactions") setTransactions(prev => prev.filter(t => t.id !== id));
        if (type === "memberships") setMemberships(prev => prev.filter(m => m.id !== id));
        toast.success("Deleted locally");
    };

    const handleDownloadInvoice = async (invoice) => {
        const doc = new jsPDF("p", "pt", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const THEME = "#e3002a";
        const DARK = "#111827";
        const GRAY = "#4b5563";
        const LIGHT = "#f3f4f6";
        const BORDER = "#d1d5db";

        /* ================= HEADER BAND ================= */
        doc.setFillColor(LIGHT);
        doc.rect(0, 0, pageWidth, 120, "F");

        // Bottom red divider (Adani style)
        doc.setFillColor(THEME);
        doc.rect(0, 118, pageWidth, 4, "F");

        /* ================= LOGO ================= */
        let logoAdded = false;
        if (LOGO_URL) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = LOGO_URL;
            await new Promise((res) => {
                img.onload = () => {
                    doc.addImage(img, "PNG", 20, 1, 230, 125);
                    logoAdded = true;
                    res();
                };
                img.onerror = res;
            });
        }

        if (!logoAdded) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(24);
            doc.setTextColor(THEME);
            doc.text("FitTrack", 40, 68);
        }

        /* ================= INVOICE META ================= */
        doc.setFont("helvetica", "bold");
        doc.setFontSize(26);
        doc.setTextColor(DARK);
        doc.text("TAX INVOICE", pageWidth - 40, 55, { align: "right" });

        const invoiceId = `INV-${invoice.id.slice(-8).toUpperCase()}`;
        const date = new Date(invoice.raw?.createdAt || invoice.date).toLocaleDateString("en-IN");
        const amount = invoice.amount.toLocaleString("en-IN");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(GRAY);
        doc.text(`Invoice No : ${invoiceId}`, pageWidth - 40, 80, { align: "right" });
        doc.text(`Invoice Date : ${date}`, pageWidth - 40, 95, { align: "right" });

        let y = 150;

        /* ================= COMPANY DETAILS ================= */
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(DARK);
        doc.text("BILL TO", 40, y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(GRAY);
        doc.text(invoice.user || "Valued Customer", 40, y + 18);
        doc.text(`Member ID: MEM-${(invoice.raw?.user?._id?.slice(-6) || "N/A").toUpperCase()}`, 40, y + 34);
        doc.text(invoice.raw?.user?.email || "-", 40, y + 50);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(DARK);
        doc.text("PAYMENT DETAILS", pageWidth - 240, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(GRAY);
        doc.text(`Mode: ${invoice.method || "Card / UPI"}`, pageWidth - 240, y + 18);
        doc.text(`Transaction ID: ${invoice.id.slice(-10).toUpperCase()}`, pageWidth - 240, y + 34);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(THEME);
        doc.text("Status: PAID", pageWidth - 240, y + 50);

        y += 90;

        // Section divider
        doc.setDrawColor(BORDER);
        doc.line(40, y, pageWidth - 40, y);

        y += 25;

        /* ================= DESCRIPTION ================= */
        let description = "Fitness Service";
        if (invoice.raw?.membershipInfo) {
            description = `${invoice.raw.membershipInfo.plan} Membership (${invoice.raw.membershipInfo.duration})`;
        } else if (invoice.raw?.programs?.length) {
            description = invoice.raw.programs.map(p => p.title).join(", ");
        }

        /* ================= TABLE ================= */
        autoTable(doc, {
            startY: y,
            head: [["Sr.", "Description", "Qty", "Rate (Rs.)", "Amount (Rs.)"]],
            body: [
                ["1", description, "1", amount, amount],
                ["", "", "", "Subtotal", amount],
                ["", "", "", "Tax", "0.00"],
                ["", "", "", "TOTAL", amount]
            ],
            theme: "grid",
            headStyles: {
                fillColor: LIGHT,
                textColor: DARK,
                fontStyle: "bold",
                lineColor: BORDER
            },
            bodyStyles: {
                fontSize: 10,
                textColor: DARK,
                cellPadding: 10,
                lineColor: BORDER
            },
            columnStyles: {
                0: { halign: "center", cellWidth: 40 },
                2: { halign: "center" },
                3: { halign: "right" },
                4: { halign: "right", fontStyle: "bold" }
            },
            margin: { left: 40, right: 40 }
        });

        const endY = doc.lastAutoTable.finalY + 30;

        /* ================= DECLARATION ================= */
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(GRAY);
        doc.text(
            "This is a computer generated invoice and does not require signature.",
            40,
            endY
        );

        /* ================= FOOTER ================= */
        doc.setDrawColor(THEME);
        doc.setLineWidth(2);
        doc.line(40, pageHeight - 60, pageWidth - 40, pageHeight - 60);

        doc.setFontSize(9);
        doc.setTextColor(GRAY);
        doc.text("FitTrack Fitness | support@fittrack.com | India", pageWidth / 2, pageHeight - 35, { align: "center" });

        doc.save(`${invoiceId}.pdf`);
    };

    const renderTable = (data, columns, type) => (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md p-6 border">
            {loading && (
                <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-gray-500" size={32} />
                </div>
            )}
            {!loading && data.length === 0 && (
                <p className="text-center py-8 text-gray-500">No data available</p>
            )}
            {!loading && data.length > 0 && (
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            {columns.map((col, i) => (
                                <th key={i} className={`p-3 border-b text-${col.align || "left"}`}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, i) => (
                            <tr key={item.id || i} className="hover:bg-gray-50 transition">
                                {columns.map((col, j) => (
                                    <td key={j} className={`p-3 border-b text-${col.align || "left"}`}>
                                        {col.key === "status" ? (
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses(item[col.key])}`}>
                                                {item[col.key]}
                                            </span>
                                        ) : col.key === "actions" ? (
                                            <div className="flex gap-3 justify-center">
                                                <Eye className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => handleView(item)} />
                                                {type === "invoices" && (
                                                    <Download className="text-green-600 hover:text-green-800 cursor-pointer" onClick={async () => await handleDownloadInvoice(item)} />
                                                )}
                                                {type !== "invoices" && (
                                                    <Trash2 className="text-red-600 hover:text-red-800 cursor-pointer" onClick={() => handleDelete(item.id, type)} />
                                                )}
                                            </div>
                                        ) : col.key === "amount" ? (
                                            `₹${item[col.key].toLocaleString("en-IN")}`
                                        ) : (
                                            item[col.key]
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <ToastContainer position="top-right" autoClose={2000} />

            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <CreditCard size={32} color={THEME} /> Payments Dashboard
            </h1>

            {/* Tabs */}
            <div className="flex gap-3 border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide py-2">
                {[
                    { id: "transactions", label: "Transactions", icon: CreditCard },
                    { id: "memberships", label: "Membership Payments", icon: Receipt },
                    { id: "invoices", label: "Invoices", icon: FileText },
                    { id: "revenue", label: "Revenue Reports", icon: BarChart2 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2 rounded-lg font-semibold flex items-center gap-2 transition ${activeTab === tab.id
                            ? "bg-white shadow-md text-gray-900 border-b-2 border-red-600"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            }`}
                    >
                        <tab.icon size={18} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
                {activeTab === "transactions" &&
                    renderTable(transactions, [
                        { label: "User", key: "user" },
                        { label: "Amount", key: "amount", align: "right" },
                        { label: "Method", key: "method" },
                        { label: "Status", key: "status", align: "center" },
                        { label: "Date", key: "date", align: "center" },
                        { label: "Action", key: "actions", align: "center" },
                    ], "transactions")}

                {activeTab === "memberships" &&
                    renderTable(memberships, [
                        { label: "Member", key: "member" },
                        { label: "Plan", key: "plan" },
                        { label: "Amount", key: "amount", align: "right" },
                        { label: "Status", key: "status", align: "center" },
                        { label: "Renewal", key: "renewal", align: "center" },
                        { label: "Action", key: "actions", align: "center" },
                    ], "memberships")}

                {activeTab === "invoices" &&
                    renderTable(invoices, [
                        { label: "Invoice ID", key: "id", align: "left" },
                        { label: "User", key: "user" },
                        { label: "Amount", key: "amount", align: "right" },
                        { label: "Date", key: "date", align: "center" },
                        { label: "Action", key: "actions", align: "center" },
                    ], "invoices")}




                {activeTab === "revenue" && (
                    <div className="bg-white rounded-2xl shadow-md p-6 border">
                        <h2 className="text-xl font-semibold mb-4">Revenue Reports</h2>

                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="animate-spin text-gray-500" size={40} />
                            </div>
                        ) : (
                            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-md">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold">Revenue Performance</h3>
                                        <p className="text-sm text-gray-500">Monthly overview</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">This month</div>
                                        <div className="text-xl font-semibold">₹{thisMonthRevenue.toLocaleString("en-IN")}</div>
                                    </div>
                                </div>

                                <div style={{ width: "100%", height: 300 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={revenueData}>
                                            <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                                            <XAxis dataKey="month" tick={{ fill: "#888" }} />
                                            <YAxis tick={{ fill: "#888" }} />
                                            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }} />
                                            <Line type="monotone" dataKey="value" stroke={THEME} strokeWidth={3} dot={{ r: 4, fill: THEME }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="overflow-x-auto mt-6">
                                    <table className="w-full text-sm border-collapse shadow-sm rounded-lg">
                                        <thead className="bg-gray-100 text-gray-600">
                                            <tr>
                                                <th className="p-3 border-b text-left">Month</th>
                                                <th className="p-3 border-b text-right">Revenue (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenueData.map((r, i) => (
                                                <tr key={i} className="hover:bg-gray-50 transition">
                                                    <td className="p-3 border-b">{r.month}</td>
                                                    <td className="p-3 border-b text-right">₹{r.value.toLocaleString("en-IN")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* View Modal */}
            {viewData && (
                <div className="fixed Z-50 inset-0 bg-black/50 flex justify-center items-center">
                    <div className="bg-white rounded-2xl p-6 w-11/12 md:w-1/2 shadow-lg relative max-h-screen overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Details</h2>
                        <div className="space-y-2">
                            {Object.entries(viewData).map(([key, value]) =>
                                key !== "_id" && key !== "id" && key !== "__v" ? (
                                    <div key={key}>
                                        <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                                        {key.includes("amount") || key.includes("total") || key.includes("price")
                                            ? `₹${Number(value).toLocaleString("en-IN")}`
                                            : typeof value === "object" && value !== null
                                                ? JSON.stringify(value)
                                                : String(value)}
                                    </div>
                                ) : null
                            )}
                        </div>
                        <button onClick={handleCloseView} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl">
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}