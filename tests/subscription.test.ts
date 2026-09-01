import { describe, it, expect, beforeEach } from 'vitest';
import { db, seedTestData } from '../src/db/index.js';
import { SubscriptionService } from '../src/services/subscription-service.js';

describe('Ticket 06: Módulo de Assinaturas & Clube da Barba (Receita Recorrente)', () => {
  let subService: SubscriptionService;

  beforeEach(() => {
    seedTestData();
    subService = new SubscriptionService();
  });

  it('deve criar um contrato de assinatura e disponibilizar o saldo de cortes', () => {
    const sub = subService.createSubscription('cust-2', 'Clube VIP Semanal', 129.90, 4);

    expect(sub.customer_id).toBe('cust-2');
    expect(sub.plan_name).toBe('Clube VIP Semanal');
    expect(sub.monthly_price).toBe(129.90);
    expect(sub.cuts_remaining).toBe(4);
    expect(sub.status).toBe('ACTIVE');
  });

  it('deve debitar cortes do saldo do assinante e bloquear quando o limite for atingido', () => {
    const result1 = subService.useSubscriptionCut('cust-1'); // Pedro Henrique tem 2 cortes no seed
    expect(result1.success).toBe(true);
    expect(result1.cutsRemaining).toBe(1);

    const result2 = subService.useSubscriptionCut('cust-1');
    expect(result2.cutsRemaining).toBe(0);

    // Próximo deve falhar por saldo esgotado
    expect(() => subService.useSubscriptionCut('cust-1')).toThrow('Limite de cortes do mês atingido');
  });

  it('deve renovar a assinatura mensal restaurando o saldo de cortes', () => {
    // Pedro usou os cortes
    subService.useSubscriptionCut('cust-1');
    subService.useSubscriptionCut('cust-1');

    const sub = db.subscriptions.find(s => s.customer_id === 'cust-1')!;
    const renewed = subService.renewSubscription(sub.id);

    expect(renewed.cuts_remaining).toBe(2); // Saldo restaurado
    expect(renewed.status).toBe('ACTIVE');
  });

  it('deve calcular a Receita Recorrente Mensal (MRR) total', () => {
    // Seed tem 1 assinatura de R$ 69.90
    subService.createSubscription('cust-2', 'Clube VIP Semanal', 129.90, 4);

    const mrr = subService.calculateMRR();
    expect(mrr).toBe(69.90 + 129.90); // R$ 199.80
  });
});
