import { describe, it, expect, beforeEach } from 'vitest';
import { db, seedTestData } from '../src/db/index.js';

describe('Ticket 01: Setup da Infraestrutura e Modelagem de Dados Base', () => {
  beforeEach(() => {
    seedTestData();
  });

  it('deve inicializar o schema e carregar barbeiros via seed', () => {
    expect(db.barbers.length).toBeGreaterThanOrEqual(2);
    expect(db.barbers[0].name).toBe('Rafael Silva');
    expect(db.barbers[0].commission_pct).toBe(50.0);
  });

  it('deve carregar clientes e mapear seus estados no relógio', () => {
    expect(db.customers.length).toBe(3);

    const pedro = db.customers.find(c => c.name === 'Pedro Henrique');
    expect(pedro).toBeDefined();
    expect(pedro?.avg_interval_days).toBe(21.0);
    expect(pedro?.days_passed).toBe(21);
    expect(pedro?.status).toBe('NA_JANELA');
  });

  it('deve armazenar e recuperar Fichas Técnicas do Corte', () => {
    expect(db.haircutSpecs.length).toBe(1);
    const spec = db.haircutSpecs[0];
    expect(spec.top_guard).toContain('Tesoura');
    expect(spec.sides_guard).toContain('Pente 1.5');
    
    const products = JSON.parse(spec.products_used);
    expect(products).toContain('Pomada Matte BarberMe');
  });

  it('deve armazenar contratos de Assinatura (Membership MRR)', () => {
    expect(db.subscriptions.length).toBe(1);
    const sub = db.subscriptions[0];
    expect(sub.plan_name).toContain('Clube da Barba');
    expect(sub.monthly_price).toBe(69.90);
    expect(sub.status).toBe('ACTIVE');
  });
});
