// BarberMe - WhatsApp Automation Worker & 1-Tap Booking Dispatcher
import { CustomerRecord, CustomerStatus } from '../db/index.js';
import { clockEngine } from '../engine/clock-engine.js';

export interface WhatsAppDispatchPayload {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  status: CustomerStatus;
  daysPassed: number;
  avgIntervalDays: number;
  messageText: string;
  oneTapBookingUrl: string;
  suggestedSlot: string; // Ex: "Quinta-feira às 17:00"
  dispatchedAt: string;
}

export class WhatsAppAutomationService {
  private dispatchLogs: WhatsAppDispatchPayload[] = [];
  private deduplicationMap: Map<string, number> = new Map(); // customerId -> timestamp

  /**
   * Varre os clientes no banco de dados e identifica os elegíveis para notificação de recompra
   */
  scanAndDispatch(minDaysBetweenMessages: number = 3): WhatsAppDispatchPayload[] {
    const actionClients = clockEngine.getFrontierActionClients();
    const newDispatches: WhatsAppDispatchPayload[] = [];
    const now = Date.now();

    for (const cust of actionClients) {
      // Verificar trava anti-spam (frequência mínima entre disparos)
      const lastSentTime = this.deduplicationMap.get(cust.id);
      if (lastSentTime && (now - lastSentTime) < minDaysBetweenMessages * 24 * 60 * 60 * 1000) {
        continue; // Pulado para evitar spam
      }

      const payload = this.createDispatchPayload(cust);
      this.dispatchLogs.push(payload);
      this.deduplicationMap.set(cust.id, now);
      newDispatches.push(payload);
    }

    return newDispatches;
  }

  /**
   * Gera a mensagem personalizada e o link seguro de 1 toque para o PWA do cliente
   */
  createDispatchPayload(customer: CustomerRecord): WhatsAppDispatchPayload {
    const suggestedSlot = this.generateSuggestedSlot();
    const token = Buffer.from(`${customer.id}:${Date.now()}`).toString('base64url');
    const oneTapUrl = `https://barberme.app/confirm?token=${token}&cust=${customer.id}`;

    let messageText = '';
    const firstName = customer.name.split(' ')[0];

    if (customer.status === 'NA_JANELA') {
      messageText = `Olá ${firstName}! 👋 Notamos que faz ${customer.days_passed} dias do seu último corte. Reservamos seu horário preferido para ${suggestedSlot}. Clique abaixo para confirmar em 1 toque: ${oneTapUrl}`;
    } else if (customer.status === 'EM_RISCO') {
      messageText = `Olá ${firstName}! ⚠️ Já faz ${customer.days_passed} dias (intervalo médio: ${customer.avg_interval_days}d). Seu cabelo já está precisando de renovação! Que tal garantir um plano recorrente ou agendar seu horário em 1 toque? ${oneTapUrl}`;
    } else {
      messageText = `Olá ${firstName}! Sentimos sua falta. Clique aqui para agendar seu horário: ${oneTapUrl}`;
    }

    return {
      id: `wa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      status: customer.status,
      daysPassed: customer.days_passed,
      avgIntervalDays: customer.avg_interval_days,
      messageText,
      oneTapBookingUrl: oneTapUrl,
      suggestedSlot,
      dispatchedAt: new Date().toISOString()
    };
  }

  private generateSuggestedSlot(): string {
    const daysOfWeek = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
    const randomDay = daysOfWeek[Math.floor(Math.random() * daysOfWeek.length)];
    const hours = ['10:00', '14:00', '15:30', '17:00', '18:30'];
    const randomHour = hours[Math.floor(Math.random() * hours.length)];
    return `${randomDay} às ${randomHour}`;
  }

  getDispatchLogs(): WhatsAppDispatchPayload[] {
    return this.dispatchLogs;
  }
}

export const whatsAppAutomation = new WhatsAppAutomationService();
