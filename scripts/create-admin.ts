import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log("\n🔐 Create Admin User\n");

  const email = await question("Enter admin email: ");
  const password = await question("Enter admin password: ");

  if (!email || !password) {
    console.error("❌ Email and password are required");
    process.exit(1);
  }

  // Check if user already exists
  const existing = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (existing) {
    const overwrite = await question(
      `⚠️  Admin user with email ${email} already exists. Overwrite? (y/n): `
    );
    if (overwrite.toLowerCase() !== "y") {
      console.log("❌ Cancelled");
      process.exit(0);
    }

    // Update existing user
    const passwordHash = bcrypt.hashSync(password, 10);
    await prisma.adminUser.update({
      where: { email },
      data: { password: passwordHash },
    });
    console.log(`✅ Admin user updated: ${email}`);
  } else {
    // Create new user
    const passwordHash = bcrypt.hashSync(password, 10);
    await prisma.adminUser.create({
      data: {
        email,
        password: passwordHash,
      },
    });
    console.log(`✅ Admin user created: ${email}`);
  }

  console.log("\nYou can now log in with:");
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    rl.close();
  });
