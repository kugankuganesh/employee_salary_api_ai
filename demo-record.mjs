import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  recordVideo: { dir: "demo-video", size: { width: 1440, height: 1000 } },
});
const page = await context.newPage();

const scenarios = [
  { name: "Early-career profile", experience: "1", technical: "45", interview: "50" },
  { name: "Borderline profile", experience: "6", technical: "78", interview: "80" },
  { name: "Experienced profile", experience: "10", technical: "92", interview: "95" },
];

await page.goto("http://localhost:5174", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

for (const scenario of scenarios) {
  await page.locator('input[name="experience_years"]').fill(scenario.experience);
  await page.locator('input[name="technical_score"]').fill(scenario.technical);
  await page.locator('input[name="interview_score"]').fill(scenario.interview);
  await page.getByRole("button", { name: "Predict Salary" }).click();
  await page.getByText("Prediction Result").waitFor({ state: "visible" });
  await page.waitForTimeout(2500);
  await page.getByRole("button", { name: "Reset" }).click();
  await page.waitForTimeout(700);
}

await page.waitForTimeout(1000);
await context.close();
await browser.close();
