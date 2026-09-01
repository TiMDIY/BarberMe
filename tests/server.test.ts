import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { server } from '../src/server.js';
import { seedTestData } from '../src/db/index.js';
import type { Server } from 'http';

describe('BarberMe Operational REST API Server Tests', () => {
  let testServer: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      testServer = server.listen(0, () => {
        const addr = testServer.address() as { port: number };
        baseUrl = `http://localhost:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => testServer.close(() => resolve()));
  });

  beforeEach(() => {
    seedTestData();
  });

  it('GET /api/engine/customers deve retornar a lista de clientes e seus relógios', async () => {
    const res = await fetch(`${baseUrl}/api/engine/customers`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.customers).toBeDefined();
    expect(data.customers.length).toBeGreaterThanOrEqual(3);
  });

  it('POST /api/engine/advance-time deve avançar dias e emitir transições de estado', async () => {
    const res = await fetch(`${baseUrl}/api/engine/advance-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: 7 })
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.simulatedDaysAdvanced).toBe(7);
    expect(data.customers).toBeDefined();
  });

  it('POST /api/barber/checkout deve processar o fechamento de atendimento e Ficha Técnica', async () => {
    const res = await fetch(`${baseUrl}/api/barber/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'cust-1',
        barberId: 'barber-rafael',
        price: 70.0,
        topGuard: 'Tesoura',
        sidesGuard: 'Pente 1.5',
        finishGuard: 'Navalha',
        productsUsed: ['Pomada Matte']
      })
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.barberEarned).toBe(35.0);
    expect(data.customer.days_passed).toBe(0);
  });

  it('POST /api/whatsapp/scan deve disparar mensagens para clientes Na Janela/Em Risco', async () => {
    const res = await fetch(`${baseUrl}/api/whatsapp/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.dispatches).toBeDefined();
    expect(data.dispatches.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/admin/dashboard deve retornar métricas de MRR e cohort de evasão', async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.metrics.mrrTotal).toBeGreaterThan(0);
    expect(data.churnCohort).toBeDefined();
    expect(data.barberPerformance).toBeDefined();
  });
});
