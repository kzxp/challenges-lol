import test, { expect } from "@playwright/test";

test("find the answers to the questions", async ({ page, browser }) => {
	// await page.goto(
	// 	"https://docs.google.com/spreadsheets/d/1ZK1w_wy2a4kRN1LvaeoGQIPg4Z4SgvlykgUMImtebAE/edit?usp=sharing"
	// );

	// Get the spreadsheet data as a CSV
	const response = await fetch(
		"https://docs.google.com/spreadsheets/d/1ZK1w_wy2a4kRN1LvaeoGQIPg4Z4SgvlykgUMImtebAE/gviz/tq?tqx=out:csv&sheet=Sheet1"
	);
	const csvData = await response.text();
	const rows = csvData.split("\n").slice(1);
	const spreadsheetData = new Map<string, number>();
	for (const row of rows) {
		const [title, wordCount] = row.split('","');
		spreadsheetData.set(
			title.replace('"', ""),
			parseInt(wordCount.replace('"', ""))
		);
	}
	await page.goto("https://dtinth.github.io/bacblog/");

	const seenPosts = new Map<string, string>();
	const duplicatePosts = new Set<string>();
	const missingPosts = new Set<string>();
	const incorrectWordCounts = new Set<string>();

	await expect(async () => {
		const posts = await page.locator(".post-link").all();
		await Promise.all(
			posts.map(async (post) => {
				const href = (await post.getAttribute("href")) as string;

				const newPage = await browser.newPage();
				await newPage.goto(`https://dtinth.github.io/${href}`);
				const title = (await newPage.locator(".post-title").innerText()).trim();
				const content = (
					await newPage.locator(".post-content").innerText()
				).replace(/\s+/g, "");
				const wordCount = content.length;

				if (spreadsheetData.has(title)) {
					const spreadsheetWordCount = spreadsheetData.get(title);

					if (wordCount !== spreadsheetWordCount) {
						incorrectWordCounts.add(title);
					}
				} else {
					missingPosts.add(title);
				}

				if (seenPosts.has(title)) {
					duplicatePosts.add(title);
				} else {
					seenPosts.set(title, content);
				}

				await newPage.close();
			})
		);

		if (!(await page.locator(".next-page").isVisible())) {
			return Promise.resolve();
		} else {
			await page.locator(".next-page").click();
			throw new Error("Not all posts were checked");
		}
	}).toPass({ intervals: [250], timeout: 120_000 });

	await page.goto(
		"https://docs.google.com/forms/d/e/1FAIpQLSespJgfjZc0ifw7As_9Y8zYo5UZheLmEPnoGtrJaSqFyy7rNw/viewform"
	);

	console.log(Array.from(missingPosts));
	console.log(Array.from(duplicatePosts));
	console.log(Array.from(incorrectWordCounts));

	// await page.getByLabel("Question 1: Identify the").click();
	// await page.keyboard.type(Array.from(duplicatePosts).join(", "));
	// await page.getByLabel("Question 2: Identify the").click();
	// await page.keyboard.type(Array.from(missingPosts).join(", "));
	// await page.getByLabel("Question 3: Identify the").click();
	// await page.keyboard.type(Array.from(incorrectWordCounts).join(", "));
});
