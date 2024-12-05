import test from "@playwright/test";

test("should click checkboxes for all given numbers", async ({ page }) => {
	await page.goto(
		"https://showdownspace-rpa-challenge.vercel.app/challenge-hunting-fed83d58/"
	);

	await page.getByRole("button", { name: "Start challenge" }).click();

	const badges = await page.locator(".chakra-badge").all();
	const givenNumbers = await Promise.all(
		badges.map(async (badge) => await badge.innerText())
	);

	const checkboxes = await page.locator("div > img").all();

	for (const checkbox of checkboxes) {
		if (!(await checkbox.isVisible())) {
			break;
		}

		await checkbox.hover();

		if (
			givenNumbers.includes(
				await page.locator(".chakra-portal ~ div").innerText()
			)
		) {
			await checkbox.click();
		}
	}
});
