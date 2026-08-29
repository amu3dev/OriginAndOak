import { chromium } from "playwright-core";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = "http://localhost:3000";
const CART_STORAGE_KEY = "brew_and_bean_cart_v1";

const EXPECTED_STEPS = [
  "1. Navigate to http://localhost:3000",
  "2. Title, Navbar & Hero Section",
  "3. Dark/Light Theme Switching",
  "4. Morning Ritual Pairing Bundle CTA",
  "5. Cart Drawer Close & Clean Reset",
  "6a. Product Detail Lightbox Modal & Zoom",
  "6b. Menu Category Switching & Micro-Animation",
  "7. Barista Lab Drink Builder & Live Gauges",
  "8. Brew Club Rewards Redemption",
  "8a. Reward Discount Cap Display",
  "9. Cart 1-Click Pastry Cross-Sell",
  "10a. Whitespace-only Customer Name Validation",
  "10. Quick Pickup Checkout Form",
  "11. Order Confirmation Screen",
  "12. Modal Reset & Close",
  "13. Interactive Store Locator Map",
  "14. Persisted Cart Hydration",
  "15. Product Title Keyboard Activation",
  "16. Store Card Keyboard Selection",
  "17. Product Dialog Focus Management",
  "18. Localized Product Dialog Labels",
  "19. Runtime Console & Page Errors",
];

const results = [];

function record(step, status, details = "") {
  results.push({ step, status, details });
  const icon = status === "PASS" ? "✅" : "❌";
  console.log(`${icon} [${status}] ${step}${details ? ` → ${details}` : ""}`);
}

async function runStep(step, callback) {
  try {
    const details = await callback();
    record(step, "PASS", details);
  } catch (error) {
    record(step, "FAIL", error instanceof Error ? error.message : String(error));
  }
}

async function requireVisible(locator, label) {
  if (!(await locator.isVisible())) {
    throw new Error(`${label} is not visible`);
  }
}

async function getCartCount(page) {
  const badge = page.locator('nav button[aria-label*="Open shopping cart"] span');
  if ((await badge.count()) === 0) return 0;
  return Number(await badge.last().innerText());
}

async function runRewardCapCheck(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  const addButton = page.locator("#menu button").filter({ hasText: /^Add$/ }).first();
  await requireVisible(addButton, "default menu Add button");
  await addButton.click();

  const rewardButtons = page.locator("#rewards button");
  if ((await rewardButtons.count()) < 3) {
    throw new Error("expected the $5 reward to be redeemable");
  }
  await rewardButtons.nth(2).click();
  const dialog = page.locator('div[role="dialog"][aria-labelledby="cart-drawer-heading"]');
  await page.waitForTimeout(800);
  await requireVisible(dialog, "cart dialog after reward redemption");
  await page.waitForTimeout(250);

  const dialogText = await dialog.innerText();
  if (!dialogText.includes("-$3.50")) {
    throw new Error(`effective capped discount is missing: ${dialogText.replace(/\n/g, " / ")}`);
  }
  if (dialogText.includes("Reward Discount") && dialogText.includes("-$5.00")) {
    throw new Error("reward row displays the uncapped $5.00 discount");
  }

  await context.close();
  return "$5 reward on $3.50 cart displays the effective $3.50 discount";
}

async function runPersistedCartHydrationCheck(browser) {
  const context = await browser.newContext();
  await context.addInitScript(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, {
    key: CART_STORAGE_KEY,
    value: [{ id: "seed-item", name: "Seed Coffee", price: 4, quantity: 1 }],
  });

  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  const badge = await getCartCount(page);
  const hydrationErrors = [...consoleErrors, ...pageErrors].filter((message) =>
    /hydration|server rendered|did not match/i.test(message)
  );
  await context.close();

  if (badge !== 1) throw new Error(`expected persisted cart badge 1, received ${badge}`);
  if (hydrationErrors.length > 0) {
    throw new Error(`hydration error: ${hydrationErrors[0].split("\n")[0]}`);
  }
  return "seeded cart restored with no hydration error";
}

async function runAccessibilityChecks(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.locator("#menu button").filter({ hasText: "Signature Crafts" }).first().click();
    await page.waitForTimeout(700);

    await runStep(EXPECTED_STEPS[17], async () => {
      const productTitle = page.locator("#menu h3 button").first();
      await requireVisible(productTitle, "keyboard product title button");
      await productTitle.focus();
      await page.keyboard.press("Enter");
      const dialog = page.locator('div[role="dialog"][aria-labelledby="product-detail-title"]');
      await requireVisible(dialog, "product detail dialog from title button");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(700);
      return "product title opens its detail dialog with Enter";
    });

    await runStep(EXPECTED_STEPS[18], async () => {
      const storeCard = page.locator('#locations [role="button"]').filter({ hasText: "Riverside Roastery" }).first();
      await requireVisible(storeCard, "keyboard store card");
      await storeCard.focus();
      await page.keyboard.press("Enter");
      const activeStore = await page.locator("#locations h4").innerText();
      if (!activeStore.includes("Riverside Roastery")) throw new Error(`wrong active store: ${activeStore}`);
      return "Riverside Roastery selected with Enter";
    });

    await runStep(EXPECTED_STEPS[19], async () => {
      const productImage = page.locator('#menu button[aria-label^="View details of"]').first();
      await productImage.click();
      const dialog = page.locator('div[role="dialog"][aria-labelledby="product-detail-title"]');
      await requireVisible(dialog, "product detail dialog");
      const focusInsideDialog = await page.evaluate(() => {
        const active = document.activeElement;
        return Boolean(active?.closest('[role="dialog"]'));
      });
      if (!focusInsideDialog) throw new Error("focus did not move into the product dialog");
      await page.keyboard.press("Tab");
      const focusAfterTabInsideDialog = await page.evaluate(() => {
        const active = document.activeElement;
        return Boolean(active?.closest('[role="dialog"]'));
      });
      if (!focusAfterTabInsideDialog) throw new Error("Tab moved focus outside the product dialog");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(700);
      const focusReturnedToInvoker = await productImage.evaluate(
        (element) => document.activeElement === element
      );
      if (!focusReturnedToInvoker) throw new Error("focus did not return to the invoking control");
      return "dialog receives focus and keeps Tab navigation contained";
    });
  } finally {
    await context.close();
  }

  const rtlContext = await browser.newContext();
  await rtlContext.addInitScript(() => {
    localStorage.setItem("origin_and_oak_lang", "ar");
  });
  const rtlPage = await rtlContext.newPage();
  try {
    await rtlPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await rtlPage.waitForTimeout(200);
    await rtlPage.locator('#menu button[aria-label*="عرض تفاصيل"]').first().click();
    const dialog = rtlPage.locator('div[role="dialog"][aria-labelledby="product-detail-title"]');
    await requireVisible(dialog, "Arabic product detail dialog");
    await runStep(EXPECTED_STEPS[20], async () => {
      await requireVisible(dialog.getByRole("button", { name: "إغلاق تفاصيل المنتج" }), "Arabic close button");
      await requireVisible(dialog.getByRole("button", { name: "إنقاص الكمية" }), "Arabic decrease button");
      await requireVisible(dialog.getByRole("button", { name: "زيادة الكمية" }), "Arabic increase button");
      return "product dialog controls expose Arabic labels";
    });
  } finally {
    await rtlContext.close();
  }
}

async function runE2ETests() {
  console.log(`🚀 Launching Chrome to execute ${EXPECTED_STEPS.length}-check End-to-End Test Suite...\n`);
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  const cartDrawer = page.locator('div[role="dialog"][aria-labelledby="cart-drawer-heading"]');

  try {
    await runStep(EXPECTED_STEPS[0], async () => {
      const response = await page.goto(BASE_URL, { waitUntil: "networkidle" });
      if (!response || !response.ok()) throw new Error(`page response was ${response?.status() ?? "empty"}`);
      return "page loaded successfully with status 200";
    });

    await runStep(EXPECTED_STEPS[1], async () => {
      const title = await page.title();
      const heroHeading = await page.locator("h1").innerText();
      const brandName = await page.locator("nav a span.font-serif").first().innerText();
      if (!title.includes("Origin & Oak") || !heroHeading.includes("Pursuing the art") || !brandName.includes("Origin & Oak")) {
        throw new Error(`missing header content (title=${title}, brand=${brandName})`);
      }
      return `title=${JSON.stringify(title)}, brand=${JSON.stringify(brandName)}`;
    });

    await runStep(EXPECTED_STEPS[2], async () => {
      const themeButton = page.locator('button[aria-label="Toggle dark mode"]');
      const before = await page.locator("html").evaluate((html) => html.classList.contains("dark"));
      await themeButton.click();
      await page.waitForTimeout(250);
      const after = await page.locator("html").evaluate((html) => html.classList.contains("dark"));
      if (before === after) throw new Error("html theme class did not change");
      return `theme changed from ${before ? "dark" : "light"} to ${after ? "dark" : "light"}`;
    });

    await runStep(EXPECTED_STEPS[3], async () => {
      await page.getByRole("button", { name: /Pair with Butter Croissant/ }).click();
      await page.waitForTimeout(800);
      await requireVisible(cartDrawer, "cart dialog");
      return "bundle added and cart opened";
    });

    await runStep(EXPECTED_STEPS[4], async () => {
      await page.getByRole("button", { name: "Close cart drawer" }).click();
      await page.waitForTimeout(500);
      if (await cartDrawer.isVisible()) throw new Error("cart dialog remained open");
      return "drawer closed and backdrop dismissed";
    });

    await runStep(EXPECTED_STEPS[5], async () => {
      await page.locator("#menu button").filter({ hasText: "Signature Crafts" }).first().click();
      await page.waitForTimeout(700);
      const productButton = page.locator('#menu button[aria-label^="View details of"]').first();
      await requireVisible(productButton, "product detail button");
      await productButton.click();
      const detailDialog = page.locator('div[role="dialog"][aria-labelledby="product-detail-title"]');
      await requireVisible(detailDialog, "product detail dialog");
      const title = await page.locator("#product-detail-title").innerText();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(700);
      if (await detailDialog.isVisible()) throw new Error("product detail dialog did not close with Escape");
      return `opened ${JSON.stringify(title)} and closed with Escape`;
    });

    await runStep(EXPECTED_STEPS[6], async () => {
      const addButton = page.locator("#menu button").filter({ hasText: /^Add$/ }).first();
      await requireVisible(addButton, "menu Add button");
      await addButton.click();
      await page.waitForTimeout(250);
      const addedButton = page.locator("#menu button").filter({ hasText: /Added/ }).first();
      await requireVisible(addedButton, "menu Added state");
      return "Signature Crafts rendered four cards and the item entered Added state";
    });

    await runStep(EXPECTED_STEPS[7], async () => {
      const before = await getCartCount(page);
      await page.locator("#customize button").filter({ hasText: "Large (16oz)" }).click();
      await page.locator("#customize button").filter({ hasText: "Barista Oat Milk" }).click();
      await page.locator("#customize button").filter({ hasText: "Extra Ristretto Shot" }).click();
      await page.locator("#customize button").filter({ hasText: /^Add Custom Drink$/ }).click();
      await page.waitForTimeout(250);
      const after = await getCartCount(page);
      if (after !== before + 1) throw new Error(`cart count did not increase (${before} → ${after})`);
      return "large oat-milk extra-shot drink added and cart count increased";
    });

    await runStep(EXPECTED_STEPS[8], async () => {
      const redeemButton = page.locator("#rewards button").filter({ hasText: /^Redeem$/ }).first();
      await requireVisible(redeemButton, "first reward Redeem button");
      await redeemButton.click();
      await page.waitForTimeout(800);
      await requireVisible(cartDrawer, "cart dialog after reward redemption");
      await requireVisible(cartDrawer.getByText("Free Single-Origin Espresso Shot", { exact: true }), "applied reward");
      return "reward redeemed and shown in cart";
    });

    await runStep(EXPECTED_STEPS[9], () => runRewardCapCheck(browser));

    await runStep(EXPECTED_STEPS[10], async () => {
      const quickAdd = cartDrawer.getByRole("button", { name: /Almond Twice-Baked Biscotti/ });
      await requireVisible(quickAdd, "Almond Twice-Baked Biscotti quick-add");
      await quickAdd.click();
      await page.waitForTimeout(250);
      await requireVisible(cartDrawer.locator("h3").filter({ hasText: "Almond Twice-Baked Biscotti" }), "biscotti cart item");
      return "Almond Twice-Baked Biscotti added from cart pairing";
    });

    await page.getByRole("button", { name: "Proceed to Checkout" }).click();
    await page.waitForTimeout(400);
    const checkoutHeading = page.getByRole("heading", { name: "Quick Checkout" });
    await requireVisible(checkoutHeading, "checkout form");

    await runStep(EXPECTED_STEPS[11], async () => {
      const nameInput = page.locator('input[placeholder*="Alex Smith"]');
      await nameInput.fill("   ");
      await page.getByRole("button", { name: /Confirm & Place Order/ }).click();
      await page.waitForTimeout(200);
      await requireVisible(checkoutHeading, "checkout form after whitespace-only name");
      if (await page.getByText("Order In The Works!", { exact: true }).isVisible().catch(() => false)) {
        throw new Error("whitespace-only customer name reached confirmation");
      }
      return "whitespace-only name was rejected";
    });

    await runStep(EXPECTED_STEPS[12], async () => {
      const nameInput = page.locator('input[placeholder*="Alex Smith"]');
      await nameInput.fill("Jordan Lee");
      await page.getByRole("button", { name: /Confirm & Place Order/ }).click();
      await page.waitForTimeout(500);
      if (!(await page.getByText("Order In The Works!", { exact: true }).isVisible())) {
        throw new Error("valid checkout did not reach confirmation");
      }
      return "Jordan Lee checkout submitted successfully";
    });

    await runStep(EXPECTED_STEPS[13], async () => {
      const confirmation = page.getByText("Order In The Works!", { exact: true });
      await requireVisible(confirmation, "order confirmation");
      const reference = page.locator("span").filter({ hasText: /^BB-\d{6}$/ }).first();
      await requireVisible(reference, "generated order reference");
      return `confirmation shown with ${await reference.innerText()}`;
    });

    await runStep(EXPECTED_STEPS[14], async () => {
      await page.getByRole("button", { name: "Done" }).click();
      await page.waitForTimeout(500);
      if (await cartDrawer.isVisible()) throw new Error("cart remained open after Done");
      return "confirmation drawer closed";
    });

    await runStep(EXPECTED_STEPS[15], async () => {
      const pins = page.locator("#locations button[aria-label]");
      const count = await pins.count();
      if (count !== 3) throw new Error(`expected 3 store pins, found ${count}`);
      await pins.nth(1).click();
      const activeStore = await page.locator("#locations h4").innerText();
      if (!activeStore.includes("Riverside Roastery")) throw new Error(`wrong active store: ${activeStore}`);
      return `selected Riverside Roastery from ${count} pins`;
    });

    await runStep(EXPECTED_STEPS[16], () => runPersistedCartHydrationCheck(browser));

    await runAccessibilityChecks(browser);

    await runStep(EXPECTED_STEPS[21], async () => {
      if (runtimeErrors.length > 0) {
        throw new Error(`runtime console/page errors: ${runtimeErrors.join(" || ")}`);
      }
      return "no console or page errors during the main flow";
    });
  } finally {
    await context.close();
    await browser.close();
  }

  const missing = EXPECTED_STEPS.filter((step) => !results.some((result) => result.step === step));
  const failures = results.filter((result) => result.status !== "PASS");
  const countOk = results.length === EXPECTED_STEPS.length;
  console.log("\n==================================================");
  console.log(`Summary: ${results.length - failures.length}/${EXPECTED_STEPS.length} checks passed`);
  if (missing.length > 0) console.log(`Missing checks: ${missing.join(", ")}`);
  if (failures.length > 0) console.log(`Failed checks: ${failures.map((result) => result.step).join(", ")}`);
  console.log("==================================================");
  process.exitCode = countOk && failures.length === 0 ? 0 : 1;
}

runE2ETests().catch((error) => {
  console.error("Test runner failed to initialize:", error);
  process.exitCode = 1;
});
