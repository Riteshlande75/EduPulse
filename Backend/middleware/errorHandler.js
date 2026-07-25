const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.method !== "GET" ? req.body : undefined,
  });

  res.status(500).json({ message: "Internal Server Error" });
};

module.exports = errorHandler;
