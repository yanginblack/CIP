import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPasswordHash =
    process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync("admin123", 10);

  // Create or update normal admin user
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const admin = await prisma.adminUser.create({
      data: {
        email: adminEmail,
        password: adminPasswordHash,
        role: "ADMIN",
      },
    });
    console.log(`Created admin user: ${admin.email}`);
  } else {
    console.log(`Admin user already exists: ${existingAdmin.email}`);
  }

  // Create system admin user
  const sysAdminEmail = "sysadmin@example.com";
  const sysAdminPasswordHash = bcrypt.hashSync("sysadmin123", 10);

  const existingSysAdmin = await prisma.adminUser.findUnique({
    where: { email: sysAdminEmail },
  });

  if (!existingSysAdmin) {
    const sysAdmin = await prisma.adminUser.create({
      data: {
        email: sysAdminEmail,
        password: sysAdminPasswordHash,
        role: "SYSTEM_ADMIN",
      },
    });
    console.log(`Created system admin user: ${sysAdmin.email}`);
  } else {
    console.log(`System admin user already exists: ${existingSysAdmin.email}`);
  }

  // Delete existing appointments
  await prisma.appointment.deleteMany({});
  console.log("Cleared existing appointments");

  // Create sample appointments with varied dates
  const sampleAppointments = [
    // 3 appointments BEFORE Nov 8th
    {
      firstName: "Alice",
      lastName: "Johnson",
      startUtc: new Date("2025-11-05T09:00:00Z"),
      staff: "Dr. Smith",
      notes: "Annual checkup",
    },
    {
      firstName: "Bob",
      lastName: "Williams",
      startUtc: new Date("2025-11-06T14:30:00Z"),
      staff: "Dr. Johnson",
      notes: "Follow-up consultation",
    },
    {
      firstName: "Carol",
      lastName: "Davis",
      startUtc: new Date("2025-11-07T11:00:00Z"),
      staff: "Dr. Williams",
      notes: "Initial assessment",
    },

    // 3 appointments ON Nov 9th
    {
      firstName: "David",
      lastName: "Miller",
      startUtc: new Date("2025-11-09T08:00:00Z"),
      checkinTime: new Date("2025-11-09T08:00:00Z"),
      checkoutTime: new Date("2025-11-09T08:30:00Z"),
      staff: "Dr. Smith",
      notes: "Morning consultation",
    },
    {
      firstName: "Emma",
      lastName: "Wilson",
      startUtc: new Date("2025-11-09T13:00:00Z"),
      checkinTime: new Date("2025-11-09T13:00:00Z"),
      staff: "Dr. Johnson",
      notes: "Afternoon checkup",
    },
    {
      firstName: "Frank",
      lastName: "Moore",
      startUtc: new Date("2025-11-09T16:30:00Z"),
      staff: "Dr. Williams",
      notes: "Evening appointment",
    },

    // 5 appointments AFTER Nov 8th
    {
      firstName: "Grace",
      lastName: "Taylor",
      startUtc: new Date("2025-11-09T10:00:00Z"),
      staff: "Dr. Smith",
      notes: "Regular checkup",
    },
    {
      firstName: "Henry",
      lastName: "Anderson",
      startUtc: new Date("2025-11-10T15:00:00Z"),
      staff: "Dr. Johnson",
      notes: "Follow-up visit",
    },
    {
      firstName: "Iris",
      lastName: "Thomas",
      startUtc: new Date("2025-11-11T09:30:00Z"),
      staff: "Dr. Williams",
      notes: "Initial consultation",
    },
    {
      firstName: "Jack",
      lastName: "Jackson",
      startUtc: new Date("2025-11-12T14:00:00Z"),
      staff: "Dr. Smith",
      notes: "Treatment review",
    },
    {
      firstName: "Kelly",
      lastName: "White",
      startUtc: new Date("2025-11-13T11:30:00Z"),
      staff: "Dr. Johnson",
      notes: "Annual physical",
    },
  ];

  for (const appointment of sampleAppointments) {
    await prisma.appointment.create({
      data: appointment,
    });
  }

  console.log(`Created ${sampleAppointments.length} sample appointments`);

  // Delete existing staff
  await prisma.staff.deleteMany({});
  console.log("Cleared existing staff");

  // Create sample staff
  const sampleStaff = [
    {
      name: "Dr. Smith",
      service: "General Practice",
      googleCalendar: "dr.smith@clinic.com",
    },
    {
      name: "Dr. Johnson",
      service: "Pediatrics",
      googleCalendar: "dr.johnson@clinic.com",
    },
    {
      name: "Dr. Williams",
      service: "Cardiology",
      googleCalendar: "dr.williams@clinic.com",
    },
    {
      name: "Dr. Brown",
      service: "Dermatology",
      googleCalendar: "dr.brown@clinic.com",
    },
    {
      name: "Dr. Davis",
      service: "Orthopedics",
      googleCalendar: "dr.davis@clinic.com",
    },
  ];

  for (const staff of sampleStaff) {
    await prisma.staff.create({
      data: staff,
    });
  }

  console.log(`Created ${sampleStaff.length} sample staff members`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
