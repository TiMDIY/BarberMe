// BarberMe - Barber Checkout Service & Ficha Técnica
import { db, HaircutSpecRecord, AppointmentRecord, CustomerRecord } from '../db/index.js';
import { clockEngine } from '../engine/clock-engine.js';

export interface CheckoutInput {
  customerId: string;
  barberId: string;
  price: number;
  serviceCategory?: string;
  observedIntervalDays?: number;
  photoBeforeUrl?: string;
  photoAfterUrl?: string;
  topGuard: string;
  sidesGuard: string;
  finishGuard: string;
  productsUsed: string[];
  notes?: string;
}

export interface CheckoutResult {
  appointment: AppointmentRecord;
  haircutSpec: HaircutSpecRecord;
  customer: CustomerRecord;
  barberEarned: number;
}

export class BarberCheckoutService {

  /**
   * Processa o fechamento de atendimento no balcão em 20 segundos
   */
  processCheckout(input: CheckoutInput): CheckoutResult {
    const customer = db.customers.find(c => c.id === input.customerId);
    if (!customer) throw new Error(`Cliente ${input.customerId} não encontrado`);

    const barber = db.barbers.find(b => b.id === input.barberId);
    if (!barber) throw new Error(`Barbeiro ${input.barberId} não encontrado`);

    // 1. Calcular comissão do barbeiro (ex: 50% de R$ 70 = R$ 35)
    const barberEarned = Number((input.price * (barber.commission_pct / 100)).toFixed(2));
    const now = new Date().toISOString();

    // 2. Criar registro de Agendamento Concluído
    const appointment: AppointmentRecord = {
      id: `apt-${Date.now()}`,
      customer_id: customer.id,
      barber_id: barber.id,
      scheduled_at: now,
      completed_at: now,
      price: input.price,
      barber_earned: barberEarned,
      status: 'COMPLETED',
      created_at: now
    };

    db.appointments.push(appointment);

    // 3. Criar a Ficha Técnica do Corte (Visual & Parâmetros)
    const haircutSpec: HaircutSpecRecord = {
      id: `spec-${Date.now()}`,
      customer_id: customer.id,
      barber_id: barber.id,
      appointment_id: appointment.id,
      photo_before_url: input.photoBeforeUrl || 'assets/img/corte_1.jpg',
      photo_after_url: input.photoAfterUrl || 'assets/img/corte_1.jpg',
      top_guard: input.topGuard,
      sides_guard: input.sidesGuard,
      finish_guard: input.finishGuard,
      products_used: JSON.stringify(input.productsUsed),
      notes: input.notes || null,
      created_at: now
    };

    db.haircutSpecs.push(haircutSpec);

    // 4. Acionar o Motor de Recorrência (Resetar Relógio para 0 dias & Atualizar Cold Start)
    const updatedCustomer = clockEngine.recordCompletedCut(
      customer.id, 
      input.observedIntervalDays || customer.days_passed, 
      input.serviceCategory || 'corte'
    );

    // Salvar estado no arquivo JSON
    db.saveToFile();

    return {
      appointment,
      haircutSpec,
      customer: updatedCustomer,
      barberEarned
    };
  }

  /**
   * Recupera o histórico de Fichas Técnicas de um cliente específico
   */
  getCustomerSpecs(customerId: string): HaircutSpecRecord[] {
    return db.haircutSpecs.filter(s => s.customer_id === customerId);
  }
}

export const barberCheckoutService = new BarberCheckoutService();
