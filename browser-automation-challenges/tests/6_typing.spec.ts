import test, { expect } from "@playwright/test";

test("should solve typing challenge", async ({ page }) => {
  await page.goto("https://learn.manoonchai.com");

  const qwertyKeyboard = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  ];

  const rows = await page.locator(".font-sarabun .row").all();

  const mappedQwertyKeyboard = new Map();

  // Loop through all rows of the keyboard to create the mapping patterns
  for (let rowIndex = 0; rowIndex < qwertyKeyboard.length; rowIndex++) {
    const row = qwertyKeyboard[rowIndex];
    const rowElement = rows[rowIndex];

    for (let keyIndex = 0; keyIndex < row.length; keyIndex++) {
      const keyElement = rowElement.locator(".button").nth(keyIndex);

      // Break if the shift key is not visible
      if (!(await keyElement.locator(".key-shift").isVisible())) continue;

      // Get the key and shift key
      const manoonChaiKey = await keyElement.locator(".key").textContent();
      const manoonChaiShiftKey = await keyElement
        .locator(".key-shift")
        .textContent();

      // Set the key and shift key to the mapped keyboard
      mappedQwertyKeyboard.set(
        manoonChaiKey,
        `Key${row[keyIndex].toUpperCase()}`
      );
      mappedQwertyKeyboard.set(
        manoonChaiShiftKey,
        `Shift+Key${row[keyIndex].toUpperCase()}`
      );
    }
  }

  await expect(async () => {
    // Get the current text
    const currentText = (await page
      .getByTestId("input")
      .getAttribute("placeholder")) as string;

    // If the challenge is completed, then return
    if (await page.getByText(/You get/).isVisible()) return Promise.resolve();

    // Focus on the input
    await page.getByTestId("input").focus();

    // Loop through all characters of the current text
    for (const text of currentText.split("")) {
      // Get the key pattern of the current character
      const manoonChaiKey = mappedQwertyKeyboard.get(text);

      // Press the key pattern of the current character
      await page.keyboard.press(manoonChaiKey);
    }

    await page.keyboard.press("Space");

    throw new Error("Type Faster");
  }).toPass({ intervals: [10], timeout: 120_000 });
});
