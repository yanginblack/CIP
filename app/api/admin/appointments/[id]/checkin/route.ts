import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";

// POST /api/admin/appointments/:id/checkin - Check in to appointment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
  } catch {
    return unauthorized();
  }

  try {
    const { id } = params;

    // Check if appointment exists
    const existing = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if already checked in
    if (existing.checkinTime) {
      return NextResponse.json(
        { error: "Already checked in" },
        { status: 400 }
      );
    }

    // Update with check-in time
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        checkinTime: new Date(),
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { error: "An error occurred during check-in" },
      { status: 500 }
    );
  }
}
