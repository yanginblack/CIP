import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/auth-helpers";
import { z } from "zod";

// PUT /api/admin/appointments/:id - Update appointment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth();
  } catch {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const { id } = params;

    // Validate that appointment exists
    const existing = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (body.firstName !== undefined) {
      updateData.firstName = String(body.firstName).trim();
      if (!updateData.firstName || updateData.firstName.length > 80) {
        return NextResponse.json(
          { error: "Invalid firstName" },
          { status: 400 }
        );
      }
    }
    if (body.lastName !== undefined) {
      updateData.lastName = String(body.lastName).trim();
      if (!updateData.lastName || updateData.lastName.length > 80) {
        return NextResponse.json(
          { error: "Invalid lastName" },
          { status: 400 }
        );
      }
    }
    if (body.startUtc !== undefined) {
      updateData.startUtc = new Date(body.startUtc);
      if (isNaN(updateData.startUtc.getTime())) {
        return NextResponse.json(
          { error: "Invalid startUtc" },
          { status: 400 }
        );
      }
    }
    if (body.staff !== undefined) {
      updateData.staff = String(body.staff).trim();
      if (!updateData.staff || updateData.staff.length > 80) {
        return NextResponse.json({ error: "Invalid staff" }, { status: 400 });
      }
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes ? String(body.notes) : null;
      if (updateData.notes && updateData.notes.length > 500) {
        return NextResponse.json({ error: "Notes too long" }, { status: 400 });
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating appointment" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/appointments/:id - Delete appointment
export async function DELETE(
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

    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    console.error("Delete appointment error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting appointment" },
      { status: 500 }
    );
  }
}
