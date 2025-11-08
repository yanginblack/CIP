"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppointmentModal, {
  type AppointmentFormData,
} from "@/components/AppointmentModal";

type Appointment = {
  id: string;
  firstName: string;
  lastName: string;
  startUtc: string;
  staff: string;
  notes: string | null;
  checkinTime: string | null;
  checkoutTime: string | null;
  createdAt: string;
  updatedAt: string;
};

type AppointmentsResponse = {
  appointments: Appointment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Helper function to get today's date in local datetime-local format
  const getTodayDatetimeLocal = (isStartOfDay: boolean = true) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const time = isStartOfDay ? "00:00" : "23:59";
    return `${year}-${month}-${day}T${time}`;
  };

  // Filter states - default to today's appointments
  const [nameQuery, setNameQuery] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [fromDate, setFromDate] = useState(getTodayDatetimeLocal(true));
  const [toDate, setToDate] = useState(getTodayDatetimeLocal(false));
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"startUtc" | "staff">("startUtc");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (nameQuery) params.append("q", nameQuery);
    if (staffFilter) params.append("staff", staffFilter);
    if (fromDate) params.append("from", new Date(fromDate).toISOString());
    if (toDate) params.append("to", new Date(toDate).toISOString());
    params.append("page", currentPage.toString());
    params.append("pageSize", "20");
    return params.toString();
  };

  // Fetch appointments
  const { data, isLoading, error } = useQuery<AppointmentsResponse>({
    queryKey: ["appointments", nameQuery, staffFilter, fromDate, toDate, currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/admin/appointments?${buildQueryParams()}`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return response.json();
    },
    enabled: status === "authenticated",
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      const response = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create appointment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setIsModalOpen(false);
      setSelectedAppointment(null);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AppointmentFormData;
    }) => {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update appointment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setIsModalOpen(false);
      setSelectedAppointment(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete appointment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  // Check-in mutation
  const checkinMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/appointments/${id}/checkin`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to check in");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  // Check-out mutation
  const checkoutMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/appointments/${id}/checkout`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to check out");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const handleSubmit = async (data: AppointmentFormData) => {
    if (selectedAppointment) {
      await updateMutation.mutateAsync({ id: selectedAppointment.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCreateNew = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const getAppointmentStatus = (appointment: Appointment): "Open" | "In Meeting" | "Done" => {
    if (appointment.checkoutTime) {
      return "Done";
    }
    if (appointment.checkinTime) {
      return "In Meeting";
    }
    return "Open";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-800";
      case "In Meeting":
        return "bg-yellow-100 text-yellow-800";
      case "Open":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCheckin = async (id: string) => {
    try {
      await checkinMutation.mutateAsync(id);
    } catch (error: any) {
      alert(error.message || "Failed to check in");
    }
  };

  const handleCheckout = async (id: string) => {
    try {
      await checkoutMutation.mutateAsync(id);
    } catch (error: any) {
      alert(error.message || "Failed to check out");
    }
  };

  const handleSort = (field: "startUtc" | "staff") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Client-side sorting
  const sortedAppointments = data?.appointments
    ? [...data.appointments].sort((a, b) => {
        let aVal, bVal;
        if (sortField === "startUtc") {
          aVal = new Date(a.startUtc).getTime();
          bVal = new Date(b.startUtc).getTime();
        } else {
          aVal = a.staff.toLowerCase();
          bVal = b.staff.toLowerCase();
        }
        if (sortDirection === "asc") {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      })
    : [];

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Logged in as {session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Log Out
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Name
                </label>
                <input
                  type="text"
                  value={nameQuery}
                  onChange={(e) => {
                    setNameQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="First or last name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff
                </label>
                <input
                  type="text"
                  value={staffFilter}
                  onChange={(e) => {
                    setStaffFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Staff name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="datetime-local"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="datetime-local"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setNameQuery("");
                setStaffFilter("");
                setFromDate(getTodayDatetimeLocal(true));
                setToDate(getTodayDatetimeLocal(false));
                setCurrentPage(1);
              }}
              className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Reset to Today
            </button>
          </div>

          {/* Action Button */}
          <div className="mb-4">
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Create New Appointment
            </button>
          </div>

          {/* Appointments Table */}
          {isLoading && <div className="text-center py-8">Loading...</div>}
          {error && (
            <div className="text-center py-8 text-red-600">
              Error loading appointments
            </div>
          )}

          {data && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("startUtc")}
                      >
                        Time{" "}
                        {sortField === "startUtc" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("staff")}
                      >
                        Staff{" "}
                        {sortField === "staff" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedAppointments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No appointments found
                        </td>
                      </tr>
                    ) : (
                      sortedAppointments.map((appointment) => {
                        const status = getAppointmentStatus(appointment);
                        return (
                          <tr key={appointment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {appointment.firstName} {appointment.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDateTime(appointment.startUtc)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {appointment.staff}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  status
                                )}`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {appointment.notes || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                {status === "Open" && (
                                  <button
                                    onClick={() => handleCheckin(appointment.id)}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                                    disabled={checkinMutation.isPending}
                                  >
                                    Check In
                                  </button>
                                )}
                                {status === "In Meeting" && (
                                  <button
                                    onClick={() => handleCheckout(appointment.id)}
                                    className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-xs"
                                    disabled={checkoutMutation.isPending}
                                  >
                                    Check Out
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEdit(appointment)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(appointment.id)}
                                  className="text-red-600 hover:text-red-900"
                                  disabled={deleteMutation.isPending}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * data.pageSize + 1} to{" "}
                    {Math.min(currentPage * data.pageSize, data.total)} of{" "}
                    {data.total} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm">
                      Page {currentPage} of {data.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(data.totalPages, currentPage + 1))
                      }
                      disabled={currentPage === data.totalPages}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSubmit={handleSubmit}
        appointment={selectedAppointment}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </main>
  );
}
