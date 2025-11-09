import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating admin user roles...");

  // Update existing admin@example.com to have ADMIN role
  const adminUser = await prisma.adminUser.findUnique({
    where: { email: "admin@example.com" },
  });

  if (adminUser) {
    await prisma.adminUser.update({
      where: { email: "admin@example.com" },
      data: { role: "ADMIN" },
    });
    console.log("✓ Updated admin@example.com role to ADMIN");
  }

  // Check for system admin
  const sysAdmin = await prisma.adminUser.findUnique({
    where: { email: "sysadmin@example.com" },
  });

  if (sysAdmin) {
    console.log("✓ System admin already exists: sysadmin@example.com");
  } else {
    console.log("✗ System admin does not exist. Run: npm run db:seed");
  }

  // List all admin users
  const allAdmins = await prisma.adminUser.findMany({
    select: { email: true, role: true },
  });

  console.log("\nCurrent admin users:");
  allAdmins.forEach((admin) => {
    console.log(`  - ${admin.email}: ${admin.role}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
