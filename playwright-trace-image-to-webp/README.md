# Playwright Trace Image to Animated Webp

I asked AI to generate overengineered Go script to convert Playwright trace images to animated Webp.

- Recursively extract all trace.zip in the given directory.
- Convert trace images to animated Webp.
- Save the animated Webp to the same directory as the trace.zip.
- Delete the extracted trace.zip.
- Optimize codes to run concurrently.

## How to use

```bash
go run main.go <Path that has subdirectories with trace.zip>
```

## Disclaimer

AI generated code by [Cursor](https://www.cursor.com/), use at your own risk.
