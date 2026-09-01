import { test, expect } from '@playwright/test';

test.describe('Estágio 8: E2E Happy Path (Navegador Headless Playwright)', () => {

  test('deve carregar a aplicação, avançar 7 dias no tempo e realizar o checkout do barbeiro em 20s', async ({ page }) => {
    // 1. Acessar a aplicação em execução
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveTitle(/BarberMe/);

    // 2. Testar o Simulador de Tempo (Avançar 7 Dias)
    const advanceBtn = page.locator('#btn-advance-7');
    await expect(advanceBtn).toBeVisible();
    await advanceBtn.click();
    await expect(page.getByText(/Avançamos 7 dias/)).toBeVisible();

    // 3. Navegar até a aba do Barbeiro
    const barberTab = page.locator('.tab-btn[data-tab="barbeiro"]');
    await barberTab.click();

    // 4. Submeter o formulário de Checkout em 20 segundos
    const checkoutSubmitBtn = page.locator('#form-haircut-spec button[type="submit"]');
    await expect(checkoutSubmitBtn).toBeVisible();
    await checkoutSubmitBtn.click();

    // 5. Validar que o toast de sucesso de atendimento aparece
    await expect(page.getByText(/Atendimento concluído/)).toBeVisible();
  });

});
