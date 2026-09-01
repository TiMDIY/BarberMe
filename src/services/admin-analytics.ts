// BarberMe - Admin Analytics & Invisible Churn Cohort Engine
import { db, CustomerRecord, BarberRecord } from '../db/index.js';
import { subscriptionService } from './subscription-service.js';

export interface ChurnRiskClient {
  customer: CustomerRecord;
  daysOverdue: number;
  estimatedLostRevenue: number;
  recommendedAction: string;
}

export interface BarberPerformance {
  barber: BarberRecord;
  appointmentsCount: number;
  totalRevenue: number;
  totalCommissionEarned: number;
  specsCompletedCount: number;
}

export interface ExecutiveDashboardMetrics {
  mrrTotal: number;
  totalCustomers: number;
  activeCustomersCount: number;
  riskCustomersCount: number;
  invisibleChurnRatePct: number;
  specStandardizationPct: number;
}

export class AdminAnalyticsService {

  /**
   * Retorna os indicadores executivos do painel do dono
   */
  getExecutiveMetrics(): ExecutiveDashboardMetrics {
    const totalCustomers = db.customers.length;
    const activeCustomers = db.customers.filter(c => c.status === 'EM_DIA' || c.status === 'NA_JANELA');
    const riskCustomers = db.customers.filter(c => c.status === 'EM_RISCO');
    const dormantCustomers = db.customers.filter(c => c.status === 'DORMENTE' || c.status === 'PERDIDO');

    const mrrTotal = subscriptionService.calculateMRR();
    const invisibleChurnRatePct = totalCustomers > 0 ? Number(((dormantCustomers.length / totalCustomers) * 100).toFixed(1)) : 0;

    // Calcular índice de padronização por Ficha Técnica
    const totalApts = db.appointments.length;
    const totalSpecs = db.haircutSpecs.length;
    const specStandardizationPct = totalApts > 0 ? Number(((totalSpecs / totalApts) * 100).toFixed(1)) : 100.0;

    return {
      mrrTotal,
      totalCustomers,
      activeCustomersCount: activeCustomers.length,
      riskCustomersCount: riskCustomers.length,
      invisibleChurnRatePct,
      specStandardizationPct
    };
  }

  /**
   * Identifica o Cohort de Evasão (Clientes em Risco de Churn Invisível)
   */
  getInvisibleChurnCohort(): ChurnRiskClient[] {
    const riskAndDormant = db.customers.filter(c => c.status === 'EM_RISCO' || c.status === 'DORMENTE' || c.status === 'PERDIDO');

    return riskAndDormant.map(cust => {
      const daysOverdue = Math.max(0, Math.round(cust.days_passed - cust.avg_interval_days));
      const estimatedLostRevenue = 70.0; // Valor médio por atendimento

      let recommendedAction = '';
      if (cust.status === 'EM_RISCO') {
        recommendedAction = 'Disparar convite de agendamento no WhatsApp com oferta de Clube de Assinatura';
      } else {
        recommendedAction = 'Oferecer brinde de lavagem/barba ou sugestão de atendimento com novo barbeiro';
      }

      return {
        customer: cust,
        daysOverdue,
        estimatedLostRevenue,
        recommendedAction
      };
    });
  }

  /**
   * Relatório de Desempenho e Independência por Barbeiro
   */
  getBarberPerformanceReport(): BarberPerformance[] {
    return db.barbers.map(barber => {
      const barberApts = db.appointments.filter(a => a.barber_id === barber.id);
      const barberSpecs = db.haircutSpecs.filter(s => s.barber_id === barber.id);

      const totalRevenue = barberApts.reduce((acc, a) => acc + a.price, 0);
      const totalCommissionEarned = barberApts.reduce((acc, a) => acc + a.barber_earned, 0);

      return {
        barber,
        appointmentsCount: barberApts.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalCommissionEarned: Number(totalCommissionEarned.toFixed(2)),
        specsCompletedCount: barberSpecs.length
      };
    });
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
