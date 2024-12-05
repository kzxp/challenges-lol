import test from "@playwright/test";

test("should click on the segments to display the number", async ({ page }) => {
	await page.goto("https://lemon-meadow-0c732f100.5.azurestaticapps.net/ssg");

	const number = await page.locator(".target-number .number").innerText();

	for (let index = 0; index < number.length; index++) {
		const digit = number[index];
		const segment = page.locator(".seven-segment").nth(index);

		const top = segment.locator(".segment").first();
		const leftTop = segment.locator(".segment.left-top");
		const leftBottom = segment.locator(".segment.left-bottom");
		const rightTop = segment.locator(".segment.right-top");
		const rightBottom = segment.locator(".segment.right-bottom");
		const middle = segment.locator(".segment.middle");
		const bottom = segment.locator(".segment.bottom");

		const patterns = {
			0: [top, leftTop, leftBottom, rightTop, rightBottom, bottom],
			1: [rightTop, rightBottom],
			2: [top, rightTop, middle, leftBottom, bottom],
			3: [top, rightTop, middle, rightBottom, bottom],
			4: [leftTop, rightTop, middle, rightBottom],
			5: [top, leftTop, middle, rightBottom, bottom],
			6: [top, leftTop, leftBottom, middle, rightBottom, bottom],
			7: [top, rightTop, rightBottom],
			8: [top, leftTop, leftBottom, middle, rightTop, rightBottom, bottom],
			9: [top, leftTop, rightTop, middle, rightBottom, bottom],
		};

		for (const pattern of patterns[digit]) {
			await pattern.click();
		}
	}
});
