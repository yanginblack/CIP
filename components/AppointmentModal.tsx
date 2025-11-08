"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type Appointment = {
  id: string;
  firstName: string;
  lastName: string;
  startUtc: string;
  staff: string;
  notes: string | null;
};

type AppointmentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  appointment?: Appointment | null;
  isLoading?: boolean;
};

const appointmentFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  startUtc: z.string().min(1, "Date and time is required"),
  staff: z.string().trim().min(1, "Staff name is required").max(80),
  notes: z.string().max(500).optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

export default function AppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  isLoading = false,
}: AppointmentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
  });

  useEffect(() => {
    if (appointment) {
      // Convert UTC to local datetime for the input
      const localDate = new Date(appointment.startUtc);
      const localDatetimeString = new Date(
        localDate.getTime() - localDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

      reset({
        firstName: appointment.firstName,
        lastName: appointment.lastName,
        startUtc: localDatetimeString,
        staff: appointment.staff,
        notes: appointment.notes || "",
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        startUtc: "",
        staff: "",
        notes: "",
      });
    }
  }, [appointment, reset]);

  const handleFormSubmit = async (data: AppointmentFormData) => {
    // Convert local time to UTC ISO string
    const localDate = new Date(data.startUtc);
    const utcDateString = localDate.toISOString();

    await onSubmit({
      ...data,
      startUtc: utcDateString,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {appointment ? "Edit Appointment" : "Create Appointment"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                {...register("firstName")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name *
              </label>
              <input
                id="lastName"
                type="text"
                {...register("lastName")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="startUtc"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date & Time (Local) *
              </label>
              <input
                id="startUtc"
                type="datetime-local"
                {...register("startUtc")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              {errors.startUtc && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.startUtc.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="staff"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Staff *
              </label>
              <input
                id="staff"
                type="text"
                {...register("staff")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              {errors.staff && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.staff.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                {...register("notes")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.notes.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading
                  ? "Saving..."
                  : appointment
                  ? "Update"
                  : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
