import { describe, it, expect, beforeEach } from 'vitest';
import { db, seedTestData } from '../src/db/index.js';
import { AdminAnalyticsService } from '../src/services/admin-analytics.js';
import { barberCheckoutService } from '../src/services/barber-checkout.js';

describe('Ticket 07: Painel Analytics do Dono & Cohort de Evasão (Churn Invisível)', () => {
  let analyticsService: AdminAnalyticsService;

  beforeEach(() => {
    seedTestData();
    analyticsService = new AdminAnalyticsService();
  });

  it('deve calcular métricas executivas de MRR, retenção e padronização por Ficha Técnica', () => {
    const metrics = analyticsService.getExecutiveMetrics();

    expect(metrics.mrrTotal).toBe(69.90);
    expect(metrics.totalCustomers).toBe(3);
    expect(metrics.activeCustomersCount).toBe(1); // Pedro Henrique (NA_JANELA)
    expect(metrics.riskCustomersCount).toBe(1); // Lucas Mendes (EM_RISCO)
    expect(metrics.specStandardizationPct).toBeGreaterThan(0);
  });

  it('deve identificar o Cohort de Evasão (clientes em risco de churn invisível) com ação de resgate', () => {
    const cohort = analyticsService.getInvisibleChurnCohort();

    expect(cohort.length).toBeGreaterThanOrEqual(2); // Lucas Mendes & Marcelo Oliveira

    const lucasRisk = cohort.find(c => c.customer.name === 'Lucas Mendes');
    expect(lucasRisk).toBeDefined();
    expect(lucasRisk?.daysOverdue).toBe(6); // 31d - 25d = 6d atrasado
    expect(lucasRisk?.recommendedAction).toContain('Disparar convite de agendamento');
  });

  it('deve gerar relatório de desempenho por barbeiro com comissões acumuladas', () => {
    // Processar checkout para o barbeiro Rafael
    barberCheckoutService.processCheckout({
      customerId: 'cust-1',
      barberId: 'barber-rafael',
      price: 80.0,
      topGuard: 'Pente 3',
      sidesGuard: 'Pente 1',
      finishGuard: 'Navalha',
      productsUsed: ['Pomada Matte']
    });

    const report = analyticsService.getBarberPerformanceReport();
    expect(report.length).toBe(2); // Rafael & João

    const rafael = report.find(r => r.barber.name === 'Rafael Silva');
    expect(rafael).toBeDefined();
    expect(rafael?.appointmentsCount).toBe(1);
    expect(rafael?.totalRevenue).toBe(80.0);
    expect(rafael?.totalCommissionEarned).toBe(40.0); // 50% de 80
  });
});
