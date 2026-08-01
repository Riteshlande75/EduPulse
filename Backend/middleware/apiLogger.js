// API Logger - writes silently to file only, no console output
const logger = require("../config/logger");

const apiLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    // Only write to log file (not console)
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration} ms`,
    });
  });

  next();
};

module.exports = apiLogger;
