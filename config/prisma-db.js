const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  omit: {
    user: {
      password: true,
    },
  },

  log: ["warn", "error"],
});

module.exports = prisma;
