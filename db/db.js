const bcrypt = require("bcryptjs");
const supabase = require("./supabase");

// Ensures a default admin account exists on first run, using the
// credentials from the environment variables.
async function ensureDefaultAdmin() {
  try {
    const { count, error: countError } = await supabase
      .from("admins")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Could not check for existing admin (check your Supabase settings):", countError.message);
      return;
    }

    if (count === 0) {
      const username = process.env.ADMIN_USERNAME || "admin";
      const password = process.env.ADMIN_PASSWORD || "admin123";
      const passwordHash = bcrypt.hashSync(password, 10);
      const { error } = await supabase.from("admins").insert({ username, password_hash: passwordHash });
      if (error) {
        console.error("Could not create default admin:", error.message);
        return;
      }
      console.log(`Default admin created -> username: "${username}"`);
    }
  } catch (err) {
    console.error("Error setting up default admin:", err.message);
  }
}

module.exports = { ensureDefaultAdmin };
