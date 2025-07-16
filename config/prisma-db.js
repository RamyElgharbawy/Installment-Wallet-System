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
}).$extends({
  name: "AutoShareGenerator",
  query: {
    item: {
      async $allOperations({ args, query, operation }) {
        if (["create", "update"].includes(operation)) {
          const data = args.data || {};

          // 1. Calculate monthlyAmount
          if (
            typeof data.price === "number" &&
            typeof data.numberOfMonths === "number"
          ) {
            data.monthlyAmount = parseFloat(
              (data.price / data.numberOfMonths).toFixed(2)
            );
          }

          args.data = data;
        }

        const result = await query(args);

        // 2. Auto-create shares after item creation
        if (
          operation === "create" &&
          args.data.numberOfMonths &&
          args.data.startIn
        ) {
          await createMonthlyShares({
            parentId: result.id,
            parentType: "ITEM",
            numberOfMonths: args.data.numberOfMonths,
            monthlyAmount: args.data.monthlyAmount,
            startDate: new Date(args.data.startIn),
            startFromNextMonth: true,
          });
        }

        // reCreate shares after update item
        if (
          operation === "update" &&
          args.data.numberOfMonths &&
          args.data.startIn
        ) {
          // delete old shares data
          await prisma.share.deleteMany({
            where: { itemId: args.data.id },
          });

          // create new shares with current new data
          await createMonthlyShares({
            parentId: result.id,
            parentType: "ITEM",
            numberOfMonths: args.data.numberOfMonths,
            monthlyAmount: args.data.monthlyAmount,
            startDate: new Date(args.data.startIn),
            startFromNextMonth: true,
          });
        }

        return result;
      },

      //TODO: handle update shares after update fellow startDate || numberOfMonths
    },
    fellow: {
      async $allOperations({ args, query, operation }) {
        const result = await query(args);

        // create shares after fellow creation
        if (
          operation === "create" &&
          args.data.numberOfMonths &&
          args.data.startIn
        ) {
          await createMonthlyShares({
            parentId: result.id,
            parentType: "FELLOW",
            numberOfMonths: args.data.numberOfMonths,
            monthlyAmount: parseFloat(
              (args.data.amount / args.data.numberOfMonths).toFixed(2)
            ),
            startDate: new Date(args.data.startIn),
            startFromNextMonth: false,
          });
        }

        // update shares data after fellow update
        if (
          operation === "update" &&
          (args.data.amount !== undefined ||
            args.data.numberOfMonths !== undefined ||
            args.data.startIn !== undefined)
        ) {
          // get fellow data
          const fellow = await prisma.fellow.findUnique({
            where: { id: args.where.id },
          });

          if (fellow) {
            // delete old shares data
            await prisma.share.deleteMany({
              where: { fellowId: fellow.id },
            });

            // handle fellow data
            const numberOfMonths =
              args.data.numberOfMonths !== undefined
                ? args.data.numberOfMonths
                : fellow.numberOfMonths;
            const amount =
              args.data.amount !== undefined ? args.data.amount : fellow.amount;
            const startIn =
              args.data.startIn !== undefined
                ? args.data.startIn
                : fellow.startIn;

            // create new shares with current new data
            await createMonthlyShares({
              parentId: fellow.id,
              parentType: "FELLOW",
              numberOfMonths,
              monthlyAmount: parseFloat((amount / numberOfMonths).toFixed(2)),
              startDate: new Date(startIn),
              startFromNextMonth: false,
            });
          }
        }

        return result;
      },
    },
  },
});

// create shares func
async function createMonthlyShares({
  parentId,
  parentType,
  numberOfMonths,
  monthlyAmount,
  startDate,
  startFromNextMonth = false,
}) {
  // const baseDate = new Date(startDate);
  // // Set to first day of month at midnight UTC to avoid month-end issues
  // baseDate.setUTCDate(1);
  // baseDate.setUTCHours(0, 0, 0, 0);

  // if (startFromNextMonth) {
  //   baseDate.setUTCMonth(baseDate.getUTCMonth() + 1);
  // }

  // const sharesData = Array.from({ length: numberOfMonths }, (_, i) => {
  //   const dueDate = new Date(baseDate);
  //   dueDate.setUTCMonth(baseDate.getUTCMonth() + i);
  //   return {
  //     amount: monthlyAmount,
  //     dueDate,
  //     ...(parentType === "ITEM"
  //       ? { itemId: parentId }
  //       : { fellowId: parentId }),
  //   };
  // });

  const baseDate = new Date(startDate);
  // Set to first day of month at midnight UTC
  baseDate.setUTCDate(1);
  baseDate.setUTCHours(0, 0, 0, 0);
  // adjust start month for items only
  if (startFromNextMonth) {
    baseDate.setUTCMonth(baseDate.getUTCMonth() + 1);
  }
  // prepare shares data
  const sharesData = Array.from({ length: numberOfMonths }, (_, i) => ({
    amount: monthlyAmount,
    dueDate: new Date(
      Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + i, 1)
    ),
    ...(parentType === "ITEM" ? { itemId: parentId } : { fellowId: parentId }),
  }));

  // create All shares
  await prisma.share.createMany({
    data: sharesData,
  });
}

// Handle shutdown gracefully
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
