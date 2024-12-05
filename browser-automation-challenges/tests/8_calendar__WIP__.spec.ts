import test from "@playwright/test";

test("should pick the correct date", async ({ page }) => {
	await page.goto(
		"https://showdownspace-rpa-challenge.vercel.app/challenge-mui-168af805/"
	);

	await page.getByRole("button", { name: /Start challenge/ }).click();

	const dates = await Promise.all(
		(
			await page.locator(".chakra-card__body .chakra-badge").all()
		).map((date) => date.textContent())
	);

	for (const date of dates) {
		console.log(date);

		// await page.getByRole('gridcell', { name: '5', exact: true }).click();
		// await page.getByLabel('pick date').click();
		// await page.getByLabel('pick time').click();
		// await page.locator('.MuiClock-squareMask').click();
		// await page.locator('.MuiClock-squareMask').click();

    // .MuiDateTimePickerToolbar-timeDigitsContainer button
    // .MuiClockNumber-root
	}

	// Solve seconds selection
	// Mod seconds by 5
	// subtract seconds from mod result
	// Select the seconds from subtraction
	// use mod result to calibrate remaining seconds if existed
});
