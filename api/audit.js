// Vercel Serverless Function entrypoint for Audit Service
const app = require('../backend/audit-service/server');

module.exports = (req, res) => {
  return app(req, res);
};
