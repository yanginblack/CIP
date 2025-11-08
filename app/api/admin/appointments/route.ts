import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";
import {
  adminAppointmentQuerySchema,
  createAppointmentSchema,
} from "@/lib/validations";
import { z } from "zod";

// GET /api/admin/appointments - List appointments with filters
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return unauthorized();
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = adminAppointmentQuerySchema.parse({
      q: searchParams.get("q") || undefined,
      staff: searchParams.get("staff") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined,
      page: searchParams.get("page") || "1",
      pageSize: searchParams.get("pageSize") || "20",
    });

    const { q, staff, from, to, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause (SQLite compatible - no case-insensitive mode)
    const where: any = {};

    if (from || to) {
      where.startUtc = {};
      if (from) where.startUtc.gte = new Date(from);
      if (to) where.startUtc.lte = new Date(to);
    }

    // Fetch all appointments matching date range
    let allAppointments = await prisma.appointment.findMany({
      where,
      orderBy: { startUtc: "asc" },
    });

    // Client-side filtering for case-insensitive search (SQLite compatible)
    if (q) {
      const searchLower = q.toLowerCase();
      allAppointments = allAppointments.filter(
        (apt) =>
          apt.firstName.toLowerCase().includes(searchLower) ||
          apt.lastName.toLowerCase().includes(searchLower)
      );
    }

    if (staff) {
      const staffLower = staff.toLowerCase();
      allAppointments = allAppointments.filter((apt) =>
        apt.staff.toLowerCase().includes(staffLower)
      );
    }

    // Pagination
    const total = allAppointments.length;
    const appointments = allAppointments.slice(skip, skip + pageSize);

    return NextResponse.json({
      appointments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      );
    }

    console.error("List appointments error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching appointments" },
      { status: 500 }
    );
  }
}

// POST /api/admin/appointments - Create appointment
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const data = createAppointmentSchema.parse(body);

    // Check that appointment is in the future
    if (data.startUtc <= new Date()) {
      return NextResponse.json(
        { error: "Appointment must be in the future" },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data,
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create appointment error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating appointment" },
      { status: 500 }
    );
  }
}
