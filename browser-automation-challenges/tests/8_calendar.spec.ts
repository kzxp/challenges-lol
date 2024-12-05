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
    const dateObject = new Date(date as string);

    await page.getByLabel("pick date").click();

    await page.locator(".MuiPickersCalendarHeader-label").click();

    await page
      .getByRole("radio", { name: dateObject.getFullYear().toString() })
      .click();

    const expectedMonth = dateObject.getMonth() + 1;

    while (true) {
      // Loop to select the month until the current month is the expected month
      const currentMonth = await page
        .locator(".MuiPickersCalendarHeader-label")
        .textContent();
      const currentMonthNumber =
        new Date(currentMonth as string).getMonth() + 1;

      if (currentMonthNumber === expectedMonth) {
        break;
      }

      if (currentMonthNumber > expectedMonth) {
        await page.getByLabel("Previous month").click();
        continue;
      }

      if (currentMonthNumber < expectedMonth) {
        await page.getByLabel("Next month").click();
        continue;
      }
    }

    await page.waitForTimeout(1000);

    await page
      .getByRole("gridcell", { name: `${dateObject.getDate()}`, exact: true })
      .click();

    // Wait for animate transition
    await page.waitForTimeout(250);

    // Couldn't click directly on the element, need to get x,y position of the element
    // Then click on the browser with x,y position
    const hoursElement = await page.getByLabel(
      `${dateObject.getHours() === 0 ? "00" : dateObject.getHours()} hours`,
      { exact: true }
    );
    const boundingBox = await hoursElement.boundingBox();
    if (boundingBox) {
      await page.mouse.click(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
      );
    }

    const minutes = dateObject.getMinutes();
    const remainingMinutes = minutes % 5;
    const pointerMinutes = minutes - remainingMinutes;

    // Solve minutes selection
    // Mod minutes by 5
    // subtract minutes from mod result
    // Select the minutes from subtraction
    // use mod result to calibrate remaining minutes if existed
    const minutesElement = await page.getByLabel(
      `${pointerMinutes.toString().padStart(2, "0")} minutes`,
      { exact: true }
    );
    const minutesBoundingBox = await minutesElement.boundingBox();
    if (minutesBoundingBox) {
      await page.mouse.click(
        minutesBoundingBox.x + minutesBoundingBox.width / 2,
        minutesBoundingBox.y + minutesBoundingBox.height / 2
      );
    }

    if (remainingMinutes > 0) {
      while (true) {
        const minutesDisplayText = await page
          .locator(".MuiDateTimePickerToolbar-timeDigitsContainer button")
          .nth(1)
          .textContent();

        if (minutesDisplayText === minutes.toString()) {
          break;
        }

        // Calibrate the remaining minutes
        // Eg. if minutes is 17, then calibrate the pointer 2 more minutes
        await page.locator(".MuiClockPointer-root").evaluate((element) => {
          const currentRotatation = Number(
            element.style.transform.replace(/\D+/g, "").trim()
          );

          element.style.transform = `rotateZ(${currentRotatation + 1}deg)`;
        });

        await page.waitForTimeout(25);

        const thumbElement = await page.locator(".MuiClockPointer-thumb");
        const thumbBoundingBox = await thumbElement.boundingBox();
        if (thumbBoundingBox) {
          await page.mouse.click(
            thumbBoundingBox.x + thumbBoundingBox.width / 2,
            thumbBoundingBox.y + thumbBoundingBox.height / 2
          );
        }
      }
    }

    await page.getByRole("button", { name: "OK" }).click();
  }
});
