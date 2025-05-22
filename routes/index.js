const userRoute = require("./user.routes");
const authRoute = require("./auth.routes");
const itemsRoute = require("./items.route");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/items", itemsRoute);
};

module.exports = mountRoutes;
