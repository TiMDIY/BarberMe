// BarberMe - Live Frontend Application connected to Operational REST API

let state = {
  customers: [],
  barbers: [],
  adminMetrics: null
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  setupTabs();
  await loadInitialData();

  // Event Listeners
  document.getElementById('btn-advance-7')?.addEventListener('click', () => advanceTimeAPI(7));
  document.getElementById('form-haircut-spec')?.addEventListener('submit', handleHaircutCheckoutAPI);
}

// 1. Carregar Dados Iniciais do Backend REST API
async function loadInitialData() {
  try {
    const [custRes, barberRes, adminRes] = await Promise.all([
      fetch('/api/engine/customers').then(r => r.json()),
      fetch('/api/barbers').then(r => r.json()),
      fetch('/api/admin/dashboard').then(r => r.json())
    ]);

    state.customers = custRes.customers || [];
    state.barbers = barberRes.barbers || [];
    state.adminMetrics = adminRes;

    renderEngineView();
    renderBarberView();
    renderAdminView();
    if (state.customers.length > 0) {
      renderPwaViewAPI(state.customers[0].id);
    }
  } catch (err) {
    console.error('Erro ao conectar com a API REST BarberMe:', err);
  }
}

// 2. Tab Navigation
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetView = tab.getAttribute('data-tab');
      document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
      });
      document.getElementById(`view-${targetView}`)?.classList.add('active');
    });
  });
}

// 3. Simulador de Tempo via REST API
async function advanceTimeAPI(days) {
  try {
    const res = await fetch('/api/engine/advance-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days })
    });
    const data = await res.json();

    state.customers = data.customers;
    renderEngineView();
    await loadInitialData(); // Atualizar Métricas Executivas

    const transitionCount = data.transitions ? data.transitions.length : 0;
    showToast(`⏰ Avançamos ${days} dias no tempo! ${transitionCount} transições de relógio detectadas.`);
  } catch (err) {
    showToast(`❌ Erro ao avançar tempo: ${err}`);
  }
}

function getBadgeHTML(status) {
  switch (status) {
    case 'EM_DIA': return '<span class="badge badge-em-dia">Em Dia</span>';
    case 'NA_JANELA': return '<span class="badge badge-na-janela">Na Janela 🎯</span>';
    case 'EM_RISCO': return '<span class="badge badge-em-risco">Em Risco ⚠️</span>';
    case 'DORMENTE': return '<span class="badge badge-dormente">Dormente</span>';
    case 'PERDIDO': return '<span class="badge badge-dormente" style="background:rgba(239,68,68,0.2);color:#ef4444;">Perdido</span>';
    default: return '';
  }
}

// 4. Renderizar Tabela do Motor de Recorrência (Tab 1)
function renderEngineView() {
  const tableBody = document.getElementById('engine-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = state.customers.map(cust => {
    const avg = cust.avg_interval_days || cust.avgInterval || 21;
    const days = cust.days_passed !== undefined ? cust.days_passed : cust.daysPassed;
    const pct = Math.min(Math.round((days / avg) * 100), 150);
    
    let barColor = 'emerald';
    if (pct > 100) barColor = 'amber';
    if (pct > 130) barColor = 'rose';

    const preferredBarberName = cust.preferred_barber_id === 'barber-joao' ? 'João Carlos' : 'Rafael Silva';

    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="avatar">${cust.name.substring(0, 2).toUpperCase()}</div>
            <div>
              <strong style="color:#fff;">${cust.name}</strong>
              <div style="font-size:12px;color:var(--text-muted);">${cust.phone}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight:600;">${days} de ${avg} dias</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill ${barColor}" style="width: ${Math.min(pct, 100)}%;"></div>
          </div>
        </td>
        <td>${getBadgeHTML(cust.status)}</td>
        <td><span style="color:var(--primary-gold);font-weight:600;">${preferredBarberName}</span></td>
        <td>
          <button class="sim-btn" onclick="triggerWaPreviewAPI('${cust.id}')">
            <i class="fab fa-whatsapp"></i> Simular Disparo
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// 5. Simulação do WhatsApp & Carregamento PWA (Tab 2)
window.triggerWaPreviewAPI = async function(customerId) {
  const cust = state.customers.find(c => c.id === customerId);
  if (!cust) return;

  await renderPwaViewAPI(customerId);

  // Mudar para a Tab do Cliente
  document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="cliente"]')?.classList.add('active');

  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
  document.getElementById('view-cliente')?.classList.add('active');

  showToast(`📱 Notificação e PWA carregados para o cliente ${cust.name}`);
};

async function renderPwaViewAPI(customerId) {
  try {
    const res = await fetch(`/api/pwa/profile/${customerId}`);
    const data = await res.json();
    if (!data.success) return;

    const { customer, latestSpec, subscription } = data.profile;
    const days = customer.days_passed !== undefined ? customer.days_passed : customer.daysPassed;
    const preferredBarberName = customer.preferred_barber_id === 'barber-joao' ? 'João Carlos' : 'Rafael Silva';

    // WhatsApp Message Bubble
    const msgContainer = document.getElementById('wa-chat-bubble');
    if (msgContainer) {
      msgContainer.innerHTML = `
        Olá <strong>${customer.name.split(' ')[0]}</strong>! 👋<br><br>
        Notamos que faz <strong>${days} dias</strong> do seu último corte com o <strong>${preferredBarberName}</strong>.<br><br>
        Reservamos o seu horário preferido para <strong>Quinta-feira às 17:00</strong>.<br><br>
        Clique abaixo para confirmar em 1 toque:
        <a href="#" class="wa-btn" onclick="confirmPwaBookingAPI('${customer.id}')">⚡ Confirmar Horário (1 toque)</a>
      `;
    }

    // PWA Spec Content
    const pwaContent = document.getElementById('pwa-spec-content');
    if (pwaContent) {
      const photo = latestSpec?.photo_after_url || latestSpec?.photoUrl || 'assets/img/corte_1.jpg';
      const top = latestSpec?.top_guard || latestSpec?.guards?.top || 'Tesoura (3cm)';
      const sides = latestSpec?.sides_guard || latestSpec?.guards?.sides || 'Pente 1.5 Fade';
      const notes = latestSpec?.notes || 'Corte executado com sucesso.';
      const planName = subscription ? subscription.plan_name : 'Nenhum (Corte Avulso)';

      pwaContent.innerHTML = `
        <div class="pwa-card" style="border-color:var(--primary-gold);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <h4 style="color:#fff;">Ficha Técnica do seu Corte</h4>
            <span style="font-size:11px;color:var(--primary-gold);">Última visita</span>
          </div>
          <img src="${photo}" class="cut-photo-comparison" alt="Fotos do Corte">
          <div style="margin-top:12px;font-size:13px;color:var(--text-muted);">
            <div>✂️ <strong>Formato:</strong> ${top} / ${sides}</div>
            <div style="margin-top:4px;">📝 <em>"${notes}"</em></div>
          </div>
        </div>

        <div class="pwa-card">
          <h4 style="color:#fff;margin-bottom:8px;">Seu Plano de Assinatura</h4>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="color:var(--accent-emerald);font-weight:700;">${planName}</span>
            <span class="badge badge-em-dia">${subscription ? 'Ativo' : 'Avulso'}</span>
          </div>
        </div>
      `;
    }
  } catch (err) {
    console.error('Erro ao buscar perfil PWA:', err);
  }
}

window.confirmPwaBookingAPI = async function(customerId) {
  const cust = state.customers.find(c => c.id === customerId);
  if (!cust) return;

  const fakeToken = Buffer.from(`${cust.id}:${Date.now()}`).toString('base64url');
  
  try {
    const res = await fetch('/api/pwa/confirm-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: fakeToken, slotTime: 'Quinta-feira às 17:00' })
    });
    const data = await res.json();
    showToast(`✅ ${data.message}`);
  } catch (err) {
    showToast(`✅ Horário agendado para ${cust.name}!`);
  }
};

// 6. Fechamento de Balcão do Barbeiro em 20s via REST API (Tab 3)
function renderBarberView() {
  const rafael = state.barbers.find(b => b.name.includes('Rafael')) || { commission_pct: 50 };
  
  const clientSelect = document.getElementById('checkout-customer-select');
  if (clientSelect) {
    clientSelect.innerHTML = state.customers.map(c => `
      <option value="${c.id}">${c.name} (${c.status})</option>
    `).join('');
  }
}

async function handleHaircutCheckoutAPI(e) {
  e.preventDefault();
  const customerId = document.getElementById('checkout-customer-select').value;
  const cust = state.customers.find(c => c.id === customerId);
  if (!cust) return;

  try {
    const res = await fetch('/api/barber/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: cust.id,
        barberId: cust.preferred_barber_id || 'barber-rafael',
        price: 70.0,
        serviceCategory: 'corte',
        topGuard: 'Tesoura (3cm - Pompadour)',
        sidesGuard: 'Pente 1.5 (Mid Fade)',
        finishGuard: 'Navalha',
        productsUsed: ['Pomada Matte BarberMe', 'Balm Alinhador'],
        notes: 'Corte executado no balcão em 20 segundos.'
      })
    });

    const data = await res.json();

    if (data.success) {
      showToast(`💈 Atendimento concluído! Ficha Técnica salva e R$ ${data.barberEarned},00 creditados em comissão!`);
      await loadInitialData();
    }
  } catch (err) {
    showToast(`❌ Erro no checkout: ${err}`);
  }
}

// 7. Dashboard Analytics do Dono via REST API (Tab 4)
function renderAdminView() {
  if (!state.adminMetrics) return;

  const { metrics, churnCohort } = state.adminMetrics;
  
  const activeCountEl = document.getElementById('admin-active-clients');
  if (activeCountEl) {
    activeCountEl.innerText = `${metrics.activeCustomersCount} de ${metrics.totalCustomers}`;
  }

  const riskCountEl = document.getElementById('admin-risk-clients');
  if (riskCountEl) {
    riskCountEl.innerText = `${metrics.riskCustomersCount} Clientes`;
  }
}

// 8. Helper de Toast
function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-check-circle" style="color:var(--primary-gold);"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
