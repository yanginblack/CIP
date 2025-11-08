import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireSystemAdmin() {
  const session = await getSession();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userRole = (session.user as any).role;
  if (userRole !== "SYSTEM_ADMIN") {
    throw new Error("Forbidden - System Admin access required");
  }

  return session;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
}
