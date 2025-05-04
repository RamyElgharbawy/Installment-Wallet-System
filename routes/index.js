const mountRoutes = (app) => {
  app.use("/api/v1/categories", (req, res, next) => {
    console.log("welcome");
  });
};

module.exports = mountRoutes;
