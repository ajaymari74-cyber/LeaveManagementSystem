// Serverless function to dynamically serve LMS_CONFIG with environment variables
module.exports = (req, res) => {
  const apiUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:8080/api';
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.status(200).send(`window.LMS_CONFIG = window.LMS_CONFIG || {}; window.LMS_CONFIG.apiUrl = "${apiUrl}";\n`);
};
