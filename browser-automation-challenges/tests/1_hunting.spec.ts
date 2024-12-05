import test from "@playwright/test";

test("should click checkboxes for all given numbers", async ({ page }) => {
  await page.goto(
    "https://showdownspace-rpa-challenge.vercel.app/challenge-hunting-fed83d58/"
  );

  await page.getByRole("button", { name: "Start challenge" }).click();

  // Gather all given numbers
  const badges = await page.locator(".chakra-badge").all();
  const givenNumbers = await Promise.all(
    badges.map(async (badge) => await badge.innerText())
  );

  const checkboxes = await page.locator("div > img").all();

  // Loop through all checkboxes
  for (const checkbox of checkboxes) {
    // Break if the checkbox is not visible
    if (!(await checkbox.isVisible())) {
      break;
    }

    // Hover on the checkbox
    await checkbox.hover();

    // Click if the number is in the given numbers
    if (
      givenNumbers.includes(
        await page.locator(".chakra-portal ~ div").innerText()
      )
    ) {
      await checkbox.click();
    }
  }
});
