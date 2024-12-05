import test, { expect } from "@playwright/test";

test("should solve math questions", async ({ page }) => {
	await page.goto(
		"https://showdownspace-rpa-challenge.vercel.app/challenge-buttons-a9808c5e/"
	);
	await page.getByRole("button", { name: "Start challenge" }).click();

	const digits = {
		1: page.getByRole("button", { name: "1" }),
		2: page.getByRole("button", { name: "2" }),
		3: page.getByRole("button", { name: "3" }),
		4: page.getByRole("button", { name: "4" }),
		5: page.getByRole("button", { name: "5" }),
		6: page.getByRole("button", { name: "6" }),
		7: page.getByRole("button", { name: "7" }),
		8: page.getByRole("button", { name: "8" }),
		9: page.getByRole("button", { name: "9" }),
		0: page.getByRole("button", { name: "0" }),
	};

	await expect(async () => {
		if (await page.getByText("Challenge completed").isVisible()) {
			return Promise.resolve();
		}

		const question = (await page
			.locator(".chakra-text")
			.first()
			.textContent()) as string;

		let result;

		if (question.includes("+")) {
			result = question
				.split("+")
				.map((value) => Number(value.replace(/\D+/g, "").trim()))
				.reduce((acc, curr) => acc + curr, 0);
		} else if (question.includes("-")) {
			const numbers = question
				.split("-")
				.map((value) => Number(value.replace(/\D+/g, "").trim()));

			result = numbers.slice(1).reduce((acc, curr) => acc - curr, numbers[0]);
		} else if (question.includes("×")) {
			const numbers = question
				.split("×")
				.map((value) => Number(value.replace(/\D+/g, "").trim()));

			result = numbers.reduce((acc, curr) => acc * curr, 1);
		} else if (question.includes("÷")) {
			const numbers = question
				.split("÷")
				.map((value) => Number(value.replace(/\D+/g, "").trim()));

			result = numbers.slice(1).reduce((acc, curr) => acc / curr, numbers[0]);

		}

		if (result >= 0) {
			for (const digit of String(result)) {
				await digits[Number(digit)].click();
			}
		}

		await page.getByRole("button", { name: "Submit" }).click();
		throw new Error("Question solved");
	}).toPass({ intervals: [250], timeout: 120_000 });
});
