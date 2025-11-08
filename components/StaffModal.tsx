"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

interface Staff {
  staffId: string;
  name: string;
  service: string;
  googleCalendar: string | null;
}

interface StaffModalProps {
  staff: Staff | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface StaffFormData {
  name: string;
  service: string;
  googleCalendar: string;
}

export default function StaffModal({ staff, onClose, onSuccess }: StaffModalProps) {
  const isEditing = !!staff;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StaffFormData>({
    defaultValues: {
      name: staff?.name || "",
      service: staff?.service || "",
      googleCalendar: staff?.googleCalendar || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      const url = isEditing
        ? `/api/admin/staff/${staff.staffId}`
        : "/api/admin/staff";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save staff");
      }

      return response.json();
    },
    onSuccess: () => {
      onSuccess();
      reset();
    },
  });

  const onSubmit = (data: StaffFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isEditing ? "Edit Staff Member" : "Add Staff Member"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              id="name"
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
              Service *
            </label>
            <input
              id="service"
              type="text"
              {...register("service", { required: "Service is required" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.service && (
              <p className="text-red-600 text-sm mt-1">{errors.service.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="googleCalendar" className="block text-sm font-medium text-gray-700 mb-1">
              Google Calendar
            </label>
            <input
              id="googleCalendar"
              type="text"
              {...register("googleCalendar")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="optional"
            />
            {errors.googleCalendar && (
              <p className="text-red-600 text-sm mt-1">{errors.googleCalendar.message}</p>
            )}
          </div>

          {mutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "An error occurred"}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
