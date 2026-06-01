import { connectToDatabase } from "../db/connection.js";
import { seedDatabase } from "../db/seed.js";

async function main() {
  await connectToDatabase();
  const result = await seedDatabase({ force: true });
  console.log("Seed complete", result);
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  });
