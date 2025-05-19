const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  omit: {
    user: {
      password: true,
    },
  },

  log: [
    { level: "warn", emit: "event" },
    { level: "error", emit: "event" },
  ],
});

// Handle shutdown gracefully
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
