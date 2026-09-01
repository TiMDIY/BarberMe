// BarberMe - Operational Zero-Dependency HTTP REST Server
import http from 'http';
import fs from 'fs';
import path from 'path';
import { db, seedTestData } from './db/index.js';
import { clockEngine } from './engine/clock-engine.js';
import { barberCheckoutService } from './services/barber-checkout.js';
import { whatsAppAutomation } from './services/whatsapp-automation.js';
import { pwaClientService } from './services/pwa-client.js';
import { subscriptionService } from './services/subscription-service.js';
import { adminAnalyticsService } from './services/admin-analytics.js';

if (db.customers.length === 0) {
  seedTestData();
}

function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function serveStaticFile(reqPath: string, res: http.ServerResponse) {
  let filePath = path.join(process.cwd(), reqPath === '/' ? 'index.html' : reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(process.cwd(), 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.json': 'application/json'
  };

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
}

async function handleCustomerRoutes(req: http.IncomingMessage, res: http.ServerResponse, pathname: string): Promise<boolean> {
  if (req.method === 'GET' && pathname === '/api/barbers') {
    sendJson(res, 200, { barbers: db.barbers });
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/engine/customers') {
    sendJson(res, 200, { customers: db.customers });
    return true;
  }
  if (req.method === 'POST' && pathname === '/api/engine/advance-time') {
    const body = await parseJsonBody(req);
    const days = Number(body.days || 7);
    const transitions = db.customers.map(c => clockEngine.advanceCustomerClock(c.id, days)).filter(Boolean);
    sendJson(res, 200, { simulatedDaysAdvanced: days, transitions, customers: db.customers });
    return true;
  }
  return false;
}

async function handleBarberAndPwaRoutes(req: http.IncomingMessage, res: http.ServerResponse, pathname: string): Promise<boolean> {
  if (req.method === 'POST' && pathname === '/api/barber/checkout') {
    try {
      const body = await parseJsonBody(req);
      sendJson(res, 200, { success: true, ...barberCheckoutService.processCheckout(body) });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: err.message });
    }
    return true;
  }
  if (req.method === 'GET' && pathname.startsWith('/api/barber/specs/')) {
    sendJson(res, 200, { specs: barberCheckoutService.getCustomerSpecs(pathname.replace('/api/barber/specs/', '')) });
    return true;
  }
  if (req.method === 'POST' && pathname === '/api/pwa/confirm-booking') {
    try {
      const body = await parseJsonBody(req);
      sendJson(res, 200, pwaClientService.confirmOneTapBooking(body.token, body.slotTime));
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: err.message });
    }
    return true;
  }
  return false;
}

async function handleBusinessRoutes(req: http.IncomingMessage, res: http.ServerResponse, pathname: string): Promise<boolean> {
  if (req.method === 'POST' && pathname === '/api/whatsapp/scan') {
    const body = await parseJsonBody(req);
    const dispatches = whatsAppAutomation.scanAndDispatch(body.minDaysBetweenMessages || 3);
    sendJson(res, 200, { dispatchesCount: dispatches.length, dispatches });
    return true;
  }
  if (req.method === 'POST' && pathname === '/api/subscriptions') {
    try {
      const body = await parseJsonBody(req);
      sendJson(res, 200, { success: true, subscription: subscriptionService.createSubscription(body.customerId, body.planName, body.monthlyPrice, body.cutsPerMonth) });
    } catch (err: any) {
      sendJson(res, 400, { success: false, error: err.message });
    }
    return true;
  }
  return false;
}

async function handleAdminAndProfileRoutes(req: http.IncomingMessage, res: http.ServerResponse, pathname: string): Promise<boolean> {
  if (req.method === 'GET' && pathname.startsWith('/api/pwa/profile/')) {
    try {
      sendJson(res, 200, { success: true, profile: pwaClientService.getCustomerPWAProfile(pathname.replace('/api/pwa/profile/', '')) });
    } catch (err: any) {
      sendJson(res, 404, { success: false, error: err.message });
    }
    return true;
  }
  if (req.method === 'GET' && pathname === '/api/admin/dashboard') {
    sendJson(res, 200, {
      metrics: adminAnalyticsService.getExecutiveMetrics(),
      churnCohort: adminAnalyticsService.getInvisibleChurnCohort(),
      barberPerformance: adminAnalyticsService.getBarberPerformanceReport()
    });
    return true;
  }
  return false;
}

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end();
    return;
  }

  const handled = (await handleCustomerRoutes(req, res, url.pathname)) ||
                  (await handleBarberAndPwaRoutes(req, res, url.pathname)) ||
                  (await handleBusinessRoutes(req, res, url.pathname)) ||
                  (await handleAdminAndProfileRoutes(req, res, url.pathname));

  if (!handled) {
    serveStaticFile(url.pathname, res);
  }
});

if (process.env.NODE_ENV !== 'test' && process.env.NO_AUTO_SERVER !== 'true') {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`💈 BarberMe Operational REST Server rodando em http://localhost:${PORT}`);
  });
}
