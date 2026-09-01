import { describe, it, expect, beforeEach } from 'vitest';
import { db, seedTestData } from '../src/db/index.js';
import { CustomerClockEngine } from '../src/engine/clock-engine.js';

describe('Ticket 02: Core Recurrence Engine & Algoritmo do Relógio do Cliente', () => {
  let engine: CustomerClockEngine;

  beforeEach(() => {
    seedTestData();
    engine = new CustomerClockEngine();
  });

  describe('1. Máquina de Estados do Relógio', () => {
    it('deve classificar corretamente os 5 estados do cliente baseados no intervalo médio (21 dias)', () => {
      expect(engine.calculateStatus(10, 21)).toBe('EM_DIA');
      expect(engine.calculateStatus(18, 21)).toBe('NA_JANELA');
      expect(engine.calculateStatus(21, 21)).toBe('NA_JANELA');
      expect(engine.calculateStatus(24, 21)).toBe('NA_JANELA');
      expect(engine.calculateStatus(28, 21)).toBe('EM_RISCO');
      expect(engine.calculateStatus(40, 21)).toBe('DORMENTE');
      expect(engine.calculateStatus(70, 21)).toBe('PERDIDO');
    });

    it('deve emitir um evento de transição quando um cliente avança para NA_JANELA', () => {
      // Pedro Henrique começa com 21 dias (NA_JANELA). Vamos testar um cliente em dia: Gabriel
      const newCust = {
        id: 'cust-test',
        name: 'Gabriel Teste',
        phone: '+55 11 90000-0000',
        avg_interval_days: 20.0,
        days_passed: 10,
        status: 'EM_DIA' as const,
        last_service_date: null,
        cold_start_phase: 1,
        preferred_barber_id: null,
        created_at: new Date().toISOString()
      };
      db.customers.push(newCust);

      // Avançar 8 dias -> 18 dias decorridos (Intervalo 20d -> entra NA_JANELA)
      const event = engine.advanceCustomerClock('cust-test', 8);
      expect(event).not.toBeNull();
      expect(event?.previousStatus).toBe('EM_DIA');
      expect(event?.newStatus).toBe('NA_JANELA');
      expect(event?.daysPassed).toBe(18);
    });
  });

  describe('2. Algoritmo de Cold Start (3 Fases de Ponderação)', () => {
    it('Fase 1: Deve atribuir o padrão da categoria para novo cliente', () => {
      const newCust = {
        id: 'cust-cold-1',
        name: 'Cliente Novo',
        phone: '+55 11 99999-0001',
        avg_interval_days: 0,
        days_passed: 0,
        status: 'EM_DIA' as const,
        last_service_date: null,
        cold_start_phase: 1,
        preferred_barber_id: null,
        created_at: new Date().toISOString()
      };
      db.customers.push(newCust);

      const updated = engine.recordCompletedCut('cust-cold-1', undefined, 'barba');
      expect(updated.avg_interval_days).toBe(14); // Padrão da categoria barba
      expect(updated.days_passed).toBe(0);
      expect(updated.status).toBe('EM_DIA');
    });

    it('Fase 2: Deve calcular a média ponderada (60% categoria + 40% observado) no segundo corte', () => {
      const newCust = {
        id: 'cust-cold-2',
        name: 'Cliente Fase 2',
        phone: '+55 11 99999-0002',
        avg_interval_days: 21,
        days_passed: 25,
        status: 'NA_JANELA' as const,
        last_service_date: null,
        cold_start_phase: 1,
        preferred_barber_id: null,
        created_at: new Date().toISOString()
      };
      db.customers.push(newCust);

      // 2º corte ocorreu após 25 dias (esperado: 0.6 * 21 + 0.4 * 25 = 12.6 + 10 = 22.6 dias)
      const updated = engine.recordCompletedCut('cust-cold-2', 25, 'corte');
      expect(updated.avg_interval_days).toBe(22.6);
      expect(updated.cold_start_phase).toBe(2);
      expect(updated.days_passed).toBe(0);
    });

    it('Fase 3: Deve convergir para a média móvel exponencial individual a partir do terceiro corte', () => {
      const newCust = {
        id: 'cust-cold-3',
        name: 'Cliente Fase 3',
        phone: '+55 11 99999-0003',
        avg_interval_days: 22.6,
        days_passed: 20,
        status: 'EM_DIA' as const,
        last_service_date: null,
        cold_start_phase: 2,
        preferred_barber_id: null,
        created_at: new Date().toISOString()
      };
      db.customers.push(newCust);

      // 3º corte ocorreu após 20 dias (fase 2 -> fase 3: 0.5 * 22.6 + 0.5 * 20 = 11.3 + 10 = 21.3)
      const updated = engine.recordCompletedCut('cust-cold-3', 20, 'corte');
      expect(updated.avg_interval_days).toBe(21.3);
      expect(updated.cold_start_phase).toBe(3);
    });
  });
});
