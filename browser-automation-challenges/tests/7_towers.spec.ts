import test, { expect } from "@playwright/test";

test("should sort towers", async ({ page }) => {
  await page.goto(
    "https://showdownspace-rpa-challenge.vercel.app/challenge-towers-6d3a20be/"
  );

  await page.getByRole("button", { name: /Start challenge/ }).click();

  const towers = await page.locator('[draggable="true"]').all();
  const n = towers.length;

  // Loop through all towers to sort them
  for (let i = 0; i < n - 1; i++) {
    // If the challenge is completed, then return
    if (await page.getByText("Challenge completed!").isVisible()) {
      return Promise.resolve();
    }

    // Drag the tower with the current index to the current tower position
    await page
      .locator('[draggable="true"]')
      .getByText(`${i + 1}`, { exact: true })
      .dragTo(towers[i]);
  }
});
