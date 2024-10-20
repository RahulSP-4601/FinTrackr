import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 5001; // or any port you prefer

app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000', // Your Flask server
  changeOrigin: true,
  onProxyRes: function (proxyRes, req, res) {
    // Add CORS headers to the response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*'; // Change to '*' for testing
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
}));

app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
