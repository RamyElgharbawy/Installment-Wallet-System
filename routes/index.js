const userRoute = require("./user.routes");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRoute);
};

module.exports = mountRoutes;
