import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSystemAdmin, unauthorized, forbidden } from "@/lib/auth-helpers";
import { createStaffSchema } from "@/lib/validations";

// GET /api/admin/staff - List all staff (System Admin only)
export async function GET(request: NextRequest) {
  try {
    await requireSystemAdmin();
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return forbidden();
    }
    return unauthorized();
  }

  try {
    const staff = await prisma.staff.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Staff list error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching staff" },
      { status: 500 }
    );
  }
}

// POST /api/admin/staff - Create new staff member (System Admin only)
export async function POST(request: NextRequest) {
  try {
    await requireSystemAdmin();
  } catch (error: any) {
    if (error.message.includes("Forbidden")) {
      return forbidden();
    }
    return unauthorized();
  }

  try {
    const body = await request.json();
    const validated = createStaffSchema.parse(body);

    const staff = await prisma.staff.create({
      data: {
        name: validated.name,
        service: validated.service,
        googleCalendar: validated.googleCalendar || null,
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error: any) {
    console.error("Staff creation error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while creating staff" },
      { status: 500 }
    );
  }
}
