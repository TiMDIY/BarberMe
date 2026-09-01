// BarberMe - Subscription & Membership Service (MRR Engine)
import { db, SubscriptionRecord } from '../db/index.js';

export class SubscriptionService {

  /**
   * Contrata um novo Plano de Assinatura / Clube da Barba para o cliente
   */
  createSubscription(
    customerId: string, 
    planName: string = 'Clube da Barba Prime (2x/mês)', 
    monthlyPrice: number = 69.90, 
    cutsPerMonth: number = 2
  ): SubscriptionRecord {
    const customer = db.customers.find(c => c.id === customerId);
    if (!customer) throw new Error(`Cliente ${customerId} não encontrado`);

    const now = new Date();
    const renewsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const subscription: SubscriptionRecord = {
      id: `sub-${Date.now()}`,
      customer_id: customerId,
      plan_name: planName,
      monthly_price: monthlyPrice,
      cuts_per_month: cutsPerMonth,
      cuts_remaining: cutsPerMonth,
      status: 'ACTIVE',
      renews_at: renewsAt,
      created_at: now.toISOString()
    };

    db.subscriptions.push(subscription);
    db.saveToFile();

    return subscription;
  }

  /**
   * Debita um corte do saldo mensal do assinante ao realizar o atendimento
   */
  useSubscriptionCut(customerId: string): { success: boolean; cutsRemaining: number } {
    const sub = db.subscriptions.find(s => s.customer_id === customerId && s.status === 'ACTIVE');
    if (!sub) return { success: false, cutsRemaining: 0 };

    if (sub.cuts_remaining <= 0) {
      throw new Error(`Limite de cortes do mês atingido para a assinatura ${sub.plan_name}`);
    }

    sub.cuts_remaining -= 1;
    db.saveToFile();

    return {
      success: true,
      cutsRemaining: sub.cuts_remaining
    };
  }

  /**
   * RENOVAÇÃO MENSAL AUTOMÁTICA: Restaura o saldo de cortes e avança a data de renovação
   */
  renewSubscription(subscriptionId: string): SubscriptionRecord {
    const sub = db.subscriptions.find(s => s.id === subscriptionId);
    if (!sub) throw new Error(`Assinatura ${subscriptionId} não encontrada`);

    const currentRenew = new Date(sub.renews_at);
    const nextRenew = new Date(currentRenew.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    sub.cuts_remaining = sub.cuts_per_month;
    sub.renews_at = nextRenew;
    sub.status = 'ACTIVE';

    db.saveToFile();
    return sub;
  }

  /**
   * Cancela uma assinatura ativa
   */
  cancelSubscription(subscriptionId: string): SubscriptionRecord {
    const sub = db.subscriptions.find(s => s.id === subscriptionId);
    if (!sub) throw new Error(`Assinatura ${subscriptionId} não encontrada`);

    sub.status = 'CANCELLED';
    db.saveToFile();
    return sub;
  }

  /**
   * Calcula a Receita Recorrente Mensal (MRR) total do negócio
   */
  calculateMRR(): number {
    const activeSubs = db.subscriptions.filter(s => s.status === 'ACTIVE');
    const total = activeSubs.reduce((acc, s) => acc + s.monthly_price, 0);
    return Number(total.toFixed(2));
  }

  getActiveSubscriptions(): SubscriptionRecord[] {
    return db.subscriptions.filter(s => s.status === 'ACTIVE');
  }
}

export const subscriptionService = new SubscriptionService();
