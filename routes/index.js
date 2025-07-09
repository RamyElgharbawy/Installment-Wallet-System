const userRoute = require("./user.routes");
const authRoute = require("./auth.routes");
const itemsRoute = require("./items.route");
const fellowsRoute = require("./fellows.route");
const spendingsRoute = require("./spendings.route");
const bankFeesRoute = require("./bankFees.route");
const sharesRoute = require("./shares.routes");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/items", itemsRoute);
  app.use("/api/v1/fellows", fellowsRoute);
  app.use("/api/v1/spendings", spendingsRoute);
  app.use("/api/v1/installmentFees", bankFeesRoute);
  app.use("/api/v1/shares", sharesRoute);
};

module.exports = mountRoutes;
