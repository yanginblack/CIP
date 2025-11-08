"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StaffModal from "@/components/StaffModal";

interface Staff {
  staffId: string;
  name: string;
  service: string;
  googleCalendar: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function StaffManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // Check if user is system admin
  const userRole = (session?.user as any)?.role;
  const isSystemAdmin = userRole === "SYSTEM_ADMIN";

  // Fetch staff
  const { data: staff = [], isLoading } = useQuery<Staff[]>({
    queryKey: ["staff"],
    queryFn: async () => {
      const response = await fetch("/api/admin/staff");
      if (!response.ok) {
        throw new Error("Failed to fetch staff");
      }
      return response.json();
    },
    enabled: status === "authenticated" && isSystemAdmin,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const response = await fetch(`/api/admin/staff/${staffId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete staff");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleDelete = async (staffId: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      deleteMutation.mutate(staffId);
    }
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isSystemAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-4">
            You do not have permission to access this page. Only System Administrators can manage staff.
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/admin")}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Staff Member
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-600">Loading staff...</div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No staff members found. Add your first staff member to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Google Calendar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((member) => (
                    <tr key={member.staffId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {member.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {member.googleCalendar || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.staffId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <StaffModal
          staff={editingStaff}
          onClose={() => {
            setIsModalOpen(false);
            setEditingStaff(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            setIsModalOpen(false);
            setEditingStaff(null);
          }}
        />
      )}
    </div>
  );
}
