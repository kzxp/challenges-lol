# Browser Automation Challenges

Try to solve random challenges on the web browser.

## From this event

- https://showdown.space/events/browser-automation-challenges

## Tools

- Playwright
- TypeScript

## Solutions

### 1. Hunting the checkboxes

- Read all numbers and store into an array.
- Hover all checkboxes
- If the number popover is included in the array, click the checkbox.

![Preview](test-results-archive/1_hunting-should-click-checkboxes-for-all-given-numbers-chromium/trace.webp)

### 2. Seven

- Create digit pattern for each number.
- Read the given number
- Click the segments to display the number.

![Preview](test-results-archive/2_seven-should-click-on-the-segments-to-display-the-number-chromium/trace.webp)

### 4. Robot

- Navigate to the finish line with below logics
  - If the there is a wall on the left and right, move forward.
  - If the there is a wall on the left, turn right.
  - If the there is a wall on the right, turn left.

![Preview](test-results-archive/4_robot-should-navigate-to-finish-line-chromium/trace.webp)

### 5. Button

- Read the given questions
- Check the math operator in each question and calculate the result
- Click the button with the result

![Preview](test-results-archive/5_button-should-solve-math-questions-chromium/trace.webp)

### 6. Typing

- Create a mapping between qwerty keyboard and manoonchai keyboard
- Read the given text
- Use the mapping to type the text

![Preview](test-results-archive/6_typing-should-solve-typing-challenge-chromium/trace.webp)

### 7. Towers

- Sort towers by reading the number label and dragging them to the correct position

![Preview](test-results-archive/7_towers-should-sort-towers-chromium/trace.webp)

### 8. Calendar

- Read the given date
- Select the correct year
- Select the correct month
- Select the correct date
- Select the correct hour
- Select the correct minute
  - As in the UI, the minute increment by 5 minutes, if the minute is not divisible by 5
  then we calibrate the remaining minutes by rotating the clock pin and recheck the minute display until the minute is correct.

![Preview](test-results-archive/8_calendar-should-pick-the-correct-date-chromium/trace.webp)
