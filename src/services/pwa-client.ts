// BarberMe - PWA Client Service & 1-Tap Booking Handler
import { db, CustomerRecord, HaircutSpecRecord, SubscriptionRecord, AppointmentRecord } from '../db/index.js';
import { barberCheckoutService } from './barber-checkout.js';

export interface OneTapConfirmationResult {
  success: boolean;
  appointment: AppointmentRecord;
  customer: CustomerRecord;
  message: string;
}

export interface CustomerPWAProfile {
  customer: CustomerRecord;
  latestSpec: HaircutSpecRecord | null;
  specHistory: HaircutSpecRecord[];
  subscription: SubscriptionRecord | null;
}

export class PWAClientService {

  /**
   * Valida o token recebido pelo link do WhatsApp e decodifica os dados
   */
  decodeToken(token: string): { customerId: string; timestamp: number } {
    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf-8');
      const [customerId, tsStr] = decoded.split(':');
      if (!customerId || !tsStr) throw new Error('Token formato inválido');
      return { customerId, timestamp: parseInt(tsStr, 10) };
    } catch (_err) {
      throw new Error('Token de confirmação inválido ou expirado');
    }
  }

  /**
   * Confirma a pré-reserva de horário com 1 toque a partir do link do WhatsApp
   */
  confirmOneTapBooking(token: string, slotTime?: string): OneTapConfirmationResult {
    const { customerId } = this.decodeToken(token);
    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) throw new Error(`Cliente ${customerId} não encontrado`);

    const barberId = customer.preferred_barber_id || 'barber-rafael';
    const now = new Date().toISOString();
    const scheduledTime = slotTime || 'Quinta-feira às 17:00';

    // Criar agendamento agendado (SCHEDULED)
    const appointment: AppointmentRecord = {
      id: `apt-${Date.now()}`,
      customer_id: customer.id,
      barber_id: barberId,
      scheduled_at: now,
      completed_at: null,
      price: 70.0,
      barber_earned: 35.0,
      status: 'SCHEDULED',
      created_at: now
    };

    db.appointments.push(appointment);
    db.saveToFile();

    return {
      success: true,
      appointment,
      customer,
      message: `Horário confirmado com sucesso para ${customer.name} em ${scheduledTime}!`
    };
  }

  /**
   * Retorna o perfil completo do cliente no PWA (Ficha Técnica + Fotos + Assinatura)
   */
  getCustomerPWAProfile(customerId: string): CustomerPWAProfile {
    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) throw new Error(`Cliente ${customerId} não encontrado`);

    const specHistory = barberCheckoutService.getCustomerSpecs(customerId);
    const latestSpec = specHistory.length > 0 ? specHistory[specHistory.length - 1] : null;
    const subscription = db.subscriptions.find(s => s.customer_id === customerId && s.status === 'ACTIVE') || null;

    return {
      customer,
      latestSpec,
      specHistory,
      subscription
    };
  }
}

export const pwaClientService = new PWAClientService();
