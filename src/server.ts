import { app } from "./app.js";
import { connectToDatabase } from "./db/connection.js";
import { seedDatabase } from "./db/seed.js";

const port = Number(process.env.PORT ?? 4000);
//already
async function bootstrap() {
  await connectToDatabase();
  await seedDatabase();

  app.listen(port, () => {
    console.log(`Tutor API running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start Tutor API", error);
  process.exit(1);
});
