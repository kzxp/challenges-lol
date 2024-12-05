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

	for (let rowIndex = 0; rowIndex < qwertyKeyboard.length; rowIndex++) {
		const row = qwertyKeyboard[rowIndex];
		const rowElement = rows[rowIndex];

		for (let keyIndex = 0; keyIndex < row.length; keyIndex++) {
			const keyElement = rowElement.locator(".button").nth(keyIndex);

			if (!(await keyElement.locator(".key-shift").isVisible())) continue;

			const manoonChaiKey = await keyElement.locator(".key").textContent();
			const manoonChaiShiftKey = await keyElement
				.locator(".key-shift")
				.textContent();

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
		const currentText = (await page
			.getByTestId("input")
			.getAttribute("placeholder")) as string;

		if (await page.getByText(/You get/).isVisible()) return Promise.resolve();

		await page.getByTestId("input").focus();

		for (const text of currentText.split("")) {
			const manoonChaiKey = mappedQwertyKeyboard.get(text);

			await page.keyboard.press(manoonChaiKey);
		}

		await page.keyboard.press("Space");

		throw new Error("Type Faster");
	}).toPass({ intervals: [10], timeout: 120_000 });
});
