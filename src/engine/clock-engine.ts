// BarberMe - Core Recurrence Engine & Client Clock Algorithm
import { db, CustomerRecord, CustomerStatus } from '../db/index.js';

export interface ClockTransitionEvent {
  customerId: string;
  customerName: string;
  previousStatus: CustomerStatus;
  newStatus: CustomerStatus;
  daysPassed: number;
  avgIntervalDays: number;
  triggeredAt: string;
}

export const CATEGORY_DEFAULT_INTERVALS: Record<string, number> = {
  corte: 21,
  barba: 14,
  combo: 20,
  default: 21
};

export class CustomerClockEngine {

  /**
   * Calcula o estado dinâmico do cliente com base nos dias decorridos vs intervalo médio
   */
  calculateStatus(daysPassed: number, avgInterval: number): CustomerStatus {
    if (daysPassed < avgInterval - 3) return 'EM_DIA';
    if (daysPassed <= avgInterval + 3) return 'NA_JANELA';
    if (daysPassed <= avgInterval + 15) return 'EM_RISCO';
    if (daysPassed <= avgInterval + 45) return 'DORMENTE';
    return 'PERDIDO';
  }

  /**
   * Avança os dias no relógio de um cliente e verifica transições de estado
   */
  advanceCustomerClock(customerId: string, daysToAdvance: number): ClockTransitionEvent | null {
    const cust = db.customers.find(c => c.id === customerId);
    if (!cust) throw new Error(`Cliente ${customerId} não encontrado`);

    const prevStatus = cust.status;
    cust.days_passed += daysToAdvance;
    cust.status = this.calculateStatus(cust.days_passed, cust.avg_interval_days);

    db.saveToFile();

    if (prevStatus !== cust.status) {
      return {
        customerId: cust.id,
        customerName: cust.name,
        previousStatus: prevStatus,
        newStatus: cust.status,
        daysPassed: cust.days_passed,
        avgIntervalDays: cust.avg_interval_days,
        triggeredAt: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * Auxiliar de cálculo de Cold Start com baixa complexidade ciclomática
   */
  private calculateNewInterval(phase: number, currentAvg: number, observedDays?: number, categoryDefault: number = 21): { newAvg: number; nextPhase: number } {
    if (!observedDays || observedDays <= 0) {
      return { newAvg: phase === 1 ? categoryDefault : currentAvg, nextPhase: phase };
    }

    if (phase === 1) {
      const newAvg = Number((0.6 * categoryDefault + 0.4 * observedDays).toFixed(1));
      return { newAvg, nextPhase: 2 };
    }

    if (phase === 2) {
      const newAvg = Number((0.5 * currentAvg + 0.5 * observedDays).toFixed(1));
      return { newAvg, nextPhase: 3 };
    }

    const newAvg = Number((0.7 * currentAvg + 0.3 * observedDays).toFixed(1));
    return { newAvg, nextPhase: 3 };
  }

  /**
   * Executa o Algoritmo de Cold Start ao registrar um novo corte concluído
   */
  recordCompletedCut(customerId: string, observedIntervalDays?: number, serviceCategory: string = 'corte'): CustomerRecord {
    const cust = db.customers.find(c => c.id === customerId);
    if (!cust) throw new Error(`Cliente ${customerId} não encontrado`);

    const categoryDefault = CATEGORY_DEFAULT_INTERVALS[serviceCategory.toLowerCase()] || CATEGORY_DEFAULT_INTERVALS.default;
    const { newAvg, nextPhase } = this.calculateNewInterval(cust.cold_start_phase, cust.avg_interval_days, observedIntervalDays, categoryDefault);

    cust.avg_interval_days = newAvg;
    cust.cold_start_phase = nextPhase;
    cust.days_passed = 0;
    cust.status = 'EM_DIA';
    cust.last_service_date = new Date().toISOString();

    db.saveToFile();
    return cust;
  }

  /**
   * Retorna clientes que precisam de ação imediata (Na Janela ou Em Risco)
   */
  getFrontierActionClients(): CustomerRecord[] {
    return db.customers.filter(c => c.status === 'NA_JANELA' || c.status === 'EM_RISCO');
  }
}

export const clockEngine = new CustomerClockEngine();
