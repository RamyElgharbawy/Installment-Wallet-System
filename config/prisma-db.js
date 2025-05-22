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

// middleware
prisma.$use(async (params, next) => {
  if (
    params.model === "Item" &&
    (params.action === "create" || params.action === "update")
  ) {
    const data = params.args.data;
    console.log(data);

    // calculate monthlyAmount
    data.monthlyAmount = parseFloat(
      (data.price / data.numberOfMonths).toFixed(2)
    );

    // set endDate if not provided
    // if (!data.endIn && data.numberOfMonths) {
    //   const endDate = new Date(data.startIn);
    //   endDate.setMonth(endDate.getMonth() + data.numberOfMonths);
    //   data.endIn = endDate;
    // }
  }
  return next(params);
});

// Handle shutdown gracefully
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
