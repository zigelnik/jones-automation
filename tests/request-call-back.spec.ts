import { test, expect } from '@playwright/test';

const URL = 'https://test.netlify.app/';

const data = {
  name: 'TalZ Automation',
  email: 'talz.automation@example.com',
  phone: '0501234567',
  company: 'Jones Automation Ltd.',
  website: 'https://jones-software.com',
};

test('request a call back form', async ({ page }) => {
  await page.goto(URL);

  await fillField(page, 'Name', data.name);
  await fillField(page, 'Email', data.email);
  await fillField(page, 'Phone', data.phone);
  await fillField(page, 'Company', data.company);
  await fillField(page, 'Website', data.website);

  await page.screenshot({ path: 'screenshots/before-submit.png', fullPage: true });

  const employees = await getEmployeesSelect(page);
  await employees.selectOption({ label: '51-500' });
  await expect(employees).toHaveValue(/51-500|51.*500/i);

  const submitBtn = page.getByRole('button', { name: /request a call back/i })
    .or(page.getByRole('link', { name: /request a call back/i }))
    .or(page.locator('input[type="submit"][value*="Request a call back" i]'));
  await submitBtn.first().click();

  await confirmThankYouPage(page);
});

async function fillField(page: import('@playwright/test').Page, label: string, value: string) {
  const byLabel = page.getByLabel(label, { exact: false });

  if (await byLabel.count()) {
    await byLabel.first().fill(value);
    return;
  }

  const key = label.toLowerCase();
  const fallback = page.locator(
    `input[name="${key}" i], input[id="${key}" i], input[placeholder*="${label}" i]`
  );
  await fallback.first().fill(value);
}

async function getEmployeesSelect(page: import('@playwright/test').Page) {
  const byLabel = page.getByLabel(/number of employees/i);
  if (await byLabel.count()) return byLabel.first();

  const bySelector = page.locator('select[name*="employ" i], select[id*="employ" i]');
  if (await bySelector.count()) return bySelector.first();

  return page.locator('select').first();
}

async function confirmThankYouPage(page: import('@playwright/test').Page) {
  const inlineThankYou = page.getByText(/thank you/i);

  try {
    await Promise.race([
      page.waitForURL(/thank/i, { timeout: 8000 }),
      inlineThankYou.waitFor({ state: 'visible', timeout: 8000 }),
    ]);
  } catch {
    throw new Error('Timed out waiting for the thank you page after submitting the form.');
  }

  if (/thank/i.test(page.url()) || (await inlineThankYou.count())) {
    console.log(`Reached thank you page. URL: ${page.url()}`);
  }

  await page.screenshot({ path: 'screenshots/after-submit-thank-you.png', fullPage: true });
}
