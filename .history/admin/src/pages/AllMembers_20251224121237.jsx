// src/pages/AllMembers.jsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  X,
  ChevronDown,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useAdminAuth } from "../context/AdminAuthContext";

const ITEMS_PER_PAGE = 10;

export default function AllMembers() {
  const { api: axiosAdmin } = useAdminAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "add", "edit", "view"
  const [selectedMember, setSelectedMember] = useState(null);

  // Form data for add/edit
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", joinDate: "", membership: "Active", plan: ""
  });

  // Fetch members from API
  const fetchMembers = useCallback(async (page = 1, search = "", status = "all") => {
    try {
      setLoading(true);
      const response = await axiosAdmin.get("/users", {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          search: search.trim(),
          status: status.toLowerCase()
        },
        withCredentials: true
      });

      if (response.data.success) {
        setMembers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.total);
        setCurrentPage(response.data.currentPage);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error(error.response?.data?.message || "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  }, [axiosAdmin]);

  // Initial load
  useEffect(() => {
    fetchMembers(1, "", "all");
  }, [fetchMembers]);

  // Search & Filter change
  useEffect(() => {
    const statusMap = { "All": "all", "Active": "active", "Expired": "expired", "Pending": "pending" };
    fetchMembers(1, searchTerm, statusMap[filterStatus] || "all");
  }, [searchTerm, filterStatus, fetchMembers]);

  // Pagination change
  const handlePageChange = (page) => {
    const statusMap = { "All": "all", "Active": "active", "Expired": "expired", "Pending": "pending" };
    fetchMembers(page, searchTerm, statusMap[filterStatus] || "all");
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await axiosAdmin.delete(`/users/${id}`);
        toast.success("Member deleted successfully!");
        const statusMap = { "All": "all", "Active": "active", "Expired": "expired", "Pending": "pending" };
        fetchMembers(currentPage, searchTerm, statusMap[filterStatus] || "all");
      } catch (error) {
        toast.error("Failed to delete member");
      }
    }
  };

  // Modal handlers
  const openModal = (type, member = null) => {
    setModalType(type);
    setSelectedMember(member);

    if (type === "edit" && member) {
      setFormData({
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
        plan: member.plan || "",
        membership: member.membership || "Active"
      });
    } else if (type === "add") {
      setFormData({ name: "", email: "", phone: "", plan: "", membership: "Active" });
    }
    // For "view", we don't need formData
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMember(null);
    setFormData({ name: "", email: "", phone: "", plan: "", membership: "Active" });
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 border-green-200";
      case "Expired": return "bg-red-100 text-red-800 border-red-200";
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (loading && members.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#e3002a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-lg p-6">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="dark"
        toastStyle={{
          backgroundColor: "#1E1E1E",
          color: "#fff",
          borderLeft: "6px solid #E3002A",
        }}
      />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Members</h1>
          <p className="text-gray-500 mt-1">
            Manage {totalCount} total gym members
          </p>
        </div>
        <button
          onClick={() => openModal("add")}
          className="flex items-center gap-2 bg-[#e3002a] hover:bg-[#c70024] text-white font-medium px-5 py-3 rounded-lg shadow-md transition"
          disabled={loading}
        >
          <UserPlus className="w-5 h-5" /> Add New Member
        </button>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e3002a] focus:border-[#e3002a] transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative w-40">
            <button
              onClick={() => setStatusDropdownOpen(prev => !prev)}
              className="w-full flex justify-between items-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 shadow-sm hover:shadow-md transition"
              disabled={loading}
            >
              {filterStatus === "All" ? "All Status" : filterStatus}
              <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
            </button>
            {statusDropdownOpen && (
              <div className="absolute mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                {["All", "Active", "Expired", "Pending"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${filterStatus === status ? "bg-gray-100 font-semibold" : "text-gray-700"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="border rounded-xl shadow-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#e3002a] text-white text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {loading ? "Loading members..." : "No members found."}
                  </td>
                </tr>
              ) : (
                members.map((member, i) => (
                  <tr
                    key={member.id}
                    className={`border-b ${i % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition-colors`}
                  >
                    // src/pages/AllMembers.jsx (Updated with Real Member Images)

{/* Inside the table row - Member column */}
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg flex-shrink-0">
      {member.avatar ? (
        <img
          src={member.avatar}
          alt={member.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = ""; // Trigger fallback
          }}
        />
      ) : (
        <div className="w-full h-full bg-[#e3002a] text-white flex items-center justify-center font-bold text-lg">
          {member.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
    <div>
      <div className="text-sm font-semibold text-gray-900">{member.name}</div>
      <div className="text-sm text-gray-500">ID: #{member.id.slice(-4)}</div>
    </div>
  </div>
</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{member.email}</div>
                      <div className="text-sm text-gray-500">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(member.joinDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.plan}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(member.membership)}`}>
                        {member.membership}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal("view", member)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => openModal("edit", member)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} members
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3
                  ? i + 1
                  : currentPage >= totalPages - 2
                    ? totalPages - 4 + i
                    : currentPage - 2 + i;
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg transition ${currentPage === pageNum
                      ? "bg-[#e3002a] text-white"
                      : "border hover:bg-gray-100"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* VIEW MODAL */}
            {modalType === "view" && selectedMember && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Member Details</h2>
                <div className="space-y-5">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-[#e3002a] text-white flex items-center justify-center font-bold text-3xl shadow-lg">
                      {selectedMember.avatar || selectedMember.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{selectedMember.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-gray-900">{selectedMember.email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-gray-900">{selectedMember.phone || "-"}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Member ID</label>
                    <p className="mt-1 text-gray-900">#{selectedMember.id}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Join Date</label>
                    <p className="mt-1 text-gray-900">
                      {new Date(selectedMember.joinDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Membership Plan</label>
                    <p className="mt-1 text-gray-900">{selectedMember.plan || "-"}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex mt-1 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedMember.membership)}`}>
                      {selectedMember.membership}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={closeModal}
                    className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {/* ADD / EDIT MODAL */}
            {(modalType === "add" || modalType === "edit") && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  {modalType === "add" ? "Add New Member" : "Edit Member"}
                </h2>

                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  // Yahan aap apna add/edit API call kar sakte hain
                  // Abhi ke liye sirf close kar dete hain
                  toast.success(modalType === "add" ? "Member added!" : "Member updated!");
                  closeModal();
                  fetchMembers(currentPage, searchTerm, filterStatus === "All" ? "all" : filterStatus.toLowerCase());
                }}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e3002a] focus:border-[#e3002a]"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e3002a] focus:border-[#e3002a]"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e3002a] focus:border-[#e3002a]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Membership Plan"
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e3002a] focus:border-[#e3002a]"
                    required
                  />
                  <select
                    value={formData.membership}
                    onChange={(e) => setFormData({ ...formData, membership: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e3002a] focus:border-[#e3002a]"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Pending">Pending</option>
                  </select>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#e3002a] hover:bg-[#c70024] text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                      {modalType === "add" ? "Add Member" : "Update Member"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}