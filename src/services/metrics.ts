// BarberMe - Prometheus Metrics Collector
import { db } from '../db/index.js';
import { subscriptionService } from './subscription-service.js';

export interface HttpRequestMetric {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
}

export class MetricsCollector {
  private requestCount: Map<string, number> = new Map();
  private requestDurationSum: Map<string, number> = new Map();

  recordRequest(metric: HttpRequestMetric): void {
    const key = `${metric.method}_${metric.route}_${metric.statusCode}`;
    const current = this.requestCount.get(key) || 0;
    this.requestCount.set(key, current + 1);

    const currentSum = this.requestDurationSum.get(key) || 0;
    this.requestDurationSum.set(key, currentSum + metric.durationMs);
  }

  generatePrometheusMetrics(): string {
    const lines: string[] = [
      '# HELP barberme_http_requests_total Total de requisições HTTP processadas por rota e status',
      '# TYPE barberme_http_requests_total counter'
    ];

    for (const [key, count] of this.requestCount.entries()) {
      const [method, route, status] = key.split('_');
      lines.push(`barberme_http_requests_total{method="${method}",route="${route}",status="${status}"} ${count}`);
    }

    lines.push('');
    lines.push('# HELP barberme_active_customers_total Total de clientes no banco por estado de frequência');
    lines.push('# TYPE barberme_active_customers_total gauge');

    const statusCounts: Record<string, number> = {
      EM_DIA: 0,
      NA_JANELA: 0,
      EM_RISCO: 0,
      DORMENTE: 0,
      PERDIDO: 0
    };

    for (const cust of db.customers) {
      if (statusCounts[cust.status] !== undefined) {
        statusCounts[cust.status]++;
      }
    }

    for (const [status, count] of Object.entries(statusCounts)) {
      lines.push(`barberme_active_customers_total{status="${status}"} ${count}`);
    }

    lines.push('');
    lines.push('# HELP barberme_mrr_total_brl Receita Recorrente Mensal acumulada em R$ (MRR)');
    lines.push('# TYPE barberme_mrr_total_brl gauge');
    lines.push(`barberme_mrr_total_brl ${subscriptionService.calculateMRR()}`);

    return lines.join('\n');
  }
}

export const metricsCollector = new MetricsCollector();
