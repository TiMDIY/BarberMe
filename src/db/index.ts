// BarberMe - Database Layer (Pure TypeScript Data Store & File Persistence)
import fs from 'fs';
import path from 'path';

export type CustomerStatus = 'EM_DIA' | 'NA_JANELA' | 'EM_RISCO' | 'DORMENTE' | 'PERDIDO';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface BarberRecord {
  id: string;
  name: string;
  phone: string;
  commission_pct: number;
  created_at: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  avg_interval_days: number;
  days_passed: number;
  status: CustomerStatus;
  last_service_date: string | null;
  cold_start_phase: number;
  preferred_barber_id: string | null;
  created_at: string;
}

export interface HaircutSpecRecord {
  id: string;
  customer_id: string;
  barber_id: string;
  appointment_id: string | null;
  photo_before_url: string | null;
  photo_after_url: string | null;
  top_guard: string;
  sides_guard: string;
  finish_guard: string;
  products_used: string; // JSON array
  notes: string | null;
  created_at: string;
}

export interface AppointmentRecord {
  id: string;
  customer_id: string;
  barber_id: string;
  scheduled_at: string;
  completed_at: string | null;
  price: number;
  barber_earned: number;
  status: string;
  created_at: string;
}

export interface SubscriptionRecord {
  id: string;
  customer_id: string;
  plan_name: string;
  monthly_price: number;
  cuts_per_month: number;
  cuts_remaining: number;
  status: SubscriptionStatus;
  renews_at: string;
  created_at: string;
}

// In-Memory Storage
class BarberMeDatabase {
  barbers: BarberRecord[] = [];
  customers: CustomerRecord[] = [];
  haircutSpecs: HaircutSpecRecord[] = [];
  appointments: AppointmentRecord[] = [];
  subscriptions: SubscriptionRecord[] = [];

  private dbPath = path.join(process.cwd(), 'barberme_data.json');

  initSchema() {
    this.barbers = [];
    this.customers = [];
    this.haircutSpecs = [];
    this.appointments = [];
    this.subscriptions = [];
  }

  seedTestData() {
    this.initSchema();

    const rafael: BarberRecord = {
      id: 'barber-rafael',
      name: 'Rafael Silva',
      phone: '+55 11 91111-2222',
      commission_pct: 50.0,
      created_at: new Date().toISOString()
    };

    const joao: BarberRecord = {
      id: 'barber-joao',
      name: 'João Carlos',
      phone: '+55 11 93333-4444',
      commission_pct: 50.0,
      created_at: new Date().toISOString()
    };

    this.barbers.push(rafael, joao);

    const cust1: CustomerRecord = {
      id: 'cust-1',
      name: 'Pedro Henrique',
      phone: '+55 11 98765-4321',
      avg_interval_days: 21.0,
      days_passed: 21,
      status: 'NA_JANELA',
      last_service_date: '2026-08-08T10:00:00.000Z',
      cold_start_phase: 1,
      preferred_barber_id: 'barber-rafael',
      created_at: new Date().toISOString()
    };

    const cust2: CustomerRecord = {
      id: 'cust-2',
      name: 'Lucas Mendes',
      phone: '+55 11 97654-3210',
      avg_interval_days: 25.0,
      days_passed: 31,
      status: 'EM_RISCO',
      last_service_date: '2026-07-29T10:00:00.000Z',
      cold_start_phase: 1,
      preferred_barber_id: 'barber-rafael',
      created_at: new Date().toISOString()
    };

    const cust3: CustomerRecord = {
      id: 'cust-3',
      name: 'Marcelo Oliveira',
      phone: '+55 11 96543-2109',
      avg_interval_days: 30.0,
      days_passed: 52,
      status: 'PERDIDO',
      last_service_date: '2026-07-08T10:00:00.000Z',
      cold_start_phase: 1,
      preferred_barber_id: 'barber-joao',
      created_at: new Date().toISOString()
    };

    this.customers.push(cust1, cust2, cust3);

    this.haircutSpecs.push({
      id: 'spec-1',
      customer_id: 'cust-1',
      barber_id: 'barber-rafael',
      appointment_id: null,
      photo_before_url: 'assets/img/corte_1.jpg',
      photo_after_url: 'assets/img/corte_1.jpg',
      top_guard: 'Tesoura (3cm - Pompadour)',
      sides_guard: 'Pente 1.5 (Mid Fade)',
      finish_guard: 'Navalha',
      products_used: JSON.stringify(['Pomada Matte BarberMe', 'Óleo de Barba']),
      notes: 'Redemoinho acentuado na coroa.',
      created_at: new Date().toISOString()
    });

    this.subscriptions.push({
      id: 'sub-1',
      customer_id: 'cust-1',
      plan_name: 'Clube da Barba Prime (2x/mês)',
      monthly_price: 69.90,
      cuts_per_month: 2,
      cuts_remaining: 2,
      status: 'ACTIVE',
      renews_at: '2026-09-08T00:00:00.000Z',
      created_at: new Date().toISOString()
    });

    this.saveToFile();
  }

  saveToFile() {
    try {
      const data = {
        barbers: this.barbers,
        customers: this.customers,
        haircutSpecs: this.haircutSpecs,
        appointments: this.appointments,
        subscriptions: this.subscriptions
      };
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (_err) {
      // Memory fallback if filesystem restricted
    }
  }

  loadFromFile() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        const data = JSON.parse(raw);
        this.barbers = data.barbers || [];
        this.customers = data.customers || [];
        this.haircutSpecs = data.haircutSpecs || [];
        this.appointments = data.appointments || [];
        this.subscriptions = data.subscriptions || [];
      }
    } catch (_err) {
      this.seedTestData();
    }
  }
}

export const db = new BarberMeDatabase();

export function initSchema() {
  db.initSchema();
}

export function seedTestData() {
  db.seedTestData();
}
