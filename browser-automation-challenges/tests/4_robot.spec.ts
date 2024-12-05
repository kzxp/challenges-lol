import { test, expect } from "@playwright/test";

test("should navigate to finish line", async ({ page }) => {
  await page.goto(
    "https://showdownspace-rpa-challenge.vercel.app/challenge-robot-d34b4b04/"
  );

  await page.getByRole("button", { name: /Start challenge/ }).click();

  await expect(async () => {
    // Break if the forward button is not visible
    if (!(await page.getByRole("button", { name: /Go forward/ }).isVisible())) {
      return Promise.resolve();
    }

    // Check if there is a wall to the left
    const isWallToTheLeft = async () =>
      (await page.locator("#wallToTheLeft").getAttribute("data-state")) ===
      "present";

    // Check if there is a wall to the right
    const isWallToTheRight = async () =>
      (await page.locator("#wallToTheRight").getAttribute("data-state")) ===
      "present";

    // Check if there is a wall in front
    const isWallInFront = async () =>
      (await page.locator("#wallInFront").getAttribute("data-state")) ===
      "present";

    // If there is a wall to the left, right, and front, then turn left
    if (
      (await isWallToTheLeft()) &&
      (await isWallToTheRight()) &&
      (await isWallInFront())
    ) {
      await page.getByRole("button", { name: /Turn left/ }).click();
      throw new Error("Robot is not at the finish line");
    }

    // If there is no wall in front, then go forward
    if (!(await isWallInFront())) {
      if (!(await isWallToTheLeft())) {
        await page.getByRole("button", { name: /Turn left/ }).click();
      }
      await page.getByRole("button", { name: /Go forward/ }).click();
      throw new Error("Robot is not at the finish line");
    }

    // If there is a wall to the left, then turn left
    if (!(await isWallToTheLeft())) {
      await page.getByRole("button", { name: /Turn left/ }).click();
      await page.getByRole("button", { name: /Go forward/ }).click();
      throw new Error("Robot is not at the finish line");
    }

    // If there is a wall to the right, then turn right
    if (!(await isWallToTheRight())) {
      await page.getByRole("button", { name: /Turn right/ }).click();
      await page.getByRole("button", { name: /Go forward/ }).click();
      throw new Error("Robot is not at the finish line");
    }
  }).toPass({ intervals: [50], timeout: 120_000 });
});
