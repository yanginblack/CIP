import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSystemAdmin, unauthorized, forbidden } from "@/lib/auth-helpers";
import { updateStaffSchema } from "@/lib/validations";

// PUT /api/admin/staff/:staffId - Update staff member (System Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    await requireSystemAdmin();
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return forbidden();
    }
    return unauthorized();
  }

  try {
    const { staffId } = params;
    const body = await request.json();

    // Validate input
    const validated = updateStaffSchema.parse({ ...body, staffId });

    // Check if staff exists
    const existing = await prisma.staff.findUnique({
      where: { staffId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Update staff
    const updateData: any = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.service !== undefined) updateData.service = validated.service;
    if (validated.googleCalendar !== undefined) {
      updateData.googleCalendar = validated.googleCalendar || null;
    }

    const staff = await prisma.staff.update({
      where: { staffId },
      data: updateData,
    });

    return NextResponse.json(staff);
  } catch (error: any) {
    console.error("Staff update error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while updating staff" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/staff/:staffId - Delete staff member (System Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    await requireSystemAdmin();
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return forbidden();
    }
    return unauthorized();
  }

  try {
    const { staffId } = params;

    // Check if staff exists
    const existing = await prisma.staff.findUnique({
      where: { staffId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Delete staff
    await prisma.staff.delete({
      where: { staffId },
    });

    return NextResponse.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Staff deletion error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting staff" },
      { status: 500 }
    );
  }
}
