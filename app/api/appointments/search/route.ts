import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nameSearchSchema } from "@/lib/validations";
import { z } from "zod";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { firstName, lastName } = nameSearchSchema.parse(body);

    // For SQLite compatibility, fetch all future appointments and filter in-memory
    // Note: For PostgreSQL in production, use mode: "insensitive" directly in the query
    const allAppointments = await prisma.appointment.findMany({
      where: {
        startUtc: {
          gte: new Date(), // Only future appointments
        },
      },
      orderBy: {
        startUtc: "asc",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        startUtc: true,
        staff: true,
        notes: true,
      },
    });

    // Case-insensitive filtering
    const appointments = allAppointments
      .filter(
        (apt) =>
          apt.firstName.toLowerCase() === firstName.toLowerCase() &&
          apt.lastName.toLowerCase() === lastName.toLowerCase()
      )
      .map(({ firstName: _f, lastName: _l, ...rest }) => rest); // Remove name fields from response

    return NextResponse.json(appointments);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Search error:", error);
    return NextResponse.json(
      { error: "An error occurred while searching" },
      { status: 500 }
    );
  }
}
