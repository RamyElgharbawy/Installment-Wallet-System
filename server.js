const express = require("express");

const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
dotenv.config({ path: "config.env" });

const globalErrorHandling = require("./middleware/errorMiddleware");
const ApiError = require("./utils/apiError");
const mountRoutes = require("./routes");

// create app instance
const app = express();

// enable cors on all incoming requests
app.use(cors());
app.options(/(.*)/, cors());

// parsing json from body
app.use(express.json());

// log http requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
mountRoutes(app);

// handle unknown routes
app.all(/(.*)/, (req, res, next) => {
  new ApiError(`Can't Find this Route: ${req.originalUrl}`, 400);
});

// global error handling middleware
app.use(globalErrorHandling);

// Create server
const Port = process.env.PORT || 8000;
const server = app.listen(Port, () => {
  console.log(`App Running on port ${Port}`);
});

// @desc  handle rejections error outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("Shutting Down.....");
    process.exit(1);
  });
});
