import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPasswordHash =
    process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync("admin123", 10);

  // Check if admin user already exists
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const admin = await prisma.adminUser.create({
      data: {
        email: adminEmail,
        password: adminPasswordHash,
      },
    });
    console.log(`Created admin user: ${admin.email}`);
  } else {
    console.log(`Admin user already exists: ${existingAdmin.email}`);
  }

  // Create some sample appointments for testing
  const now = new Date();
  const sampleAppointments = [
    {
      firstName: "John",
      lastName: "Doe",
      startUtc: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      staff: "Dr. Smith",
      notes: "Initial consultation",
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      startUtc: new Date(now.getTime() + 48 * 60 * 60 * 1000), // Day after tomorrow
      staff: "Dr. Johnson",
      notes: "Follow-up appointment",
    },
    {
      firstName: "John",
      lastName: "Doe",
      startUtc: new Date(now.getTime() + 72 * 60 * 60 * 1000), // 3 days from now
      staff: "Dr. Williams",
      notes: "Regular checkup",
    },
  ];

  for (const appointment of sampleAppointments) {
    await prisma.appointment.create({
      data: appointment,
    });
  }

  console.log(`Created ${sampleAppointments.length} sample appointments`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
