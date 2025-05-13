const userRoute = require("./user.routes");
const authRoute = require("./auth.routes");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
};

module.exports = mountRoutes;
