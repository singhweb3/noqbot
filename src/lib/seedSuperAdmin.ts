import bcrypt from "bcryptjs";
import User from "@/models/User";

export async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";

  if (!email || !password) {
    console.warn("⚠️ Super admin env vars not set");
    return;
  }

  const existingAdmin = await User.findOne({
    email,
    role: "super_admin",
  });

  if (existingAdmin) {
    // ✅ Already exists — do nothing
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    passwordHash,
    role: "super_admin",
    clientId: null,
    isActive: true,
  });

  console.log("✅ Super Admin created:", email);
}
