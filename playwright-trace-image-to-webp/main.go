package main

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"sync"
)

func processZipFile(zipPath string) error {
	// Open the zip file
	reader, err := zip.OpenReader(zipPath)
	if err != nil {
		return fmt.Errorf("error opening zip file %s: %v", zipPath, err)
	}
	defer reader.Close()

	// Create a directory with the same name as zip file (without .zip extension)
	extractPath := strings.TrimSuffix(zipPath, filepath.Ext(zipPath))
	err = os.MkdirAll(extractPath, 0755)
	if err != nil {
		return fmt.Errorf("error creating directory %s: %v", extractPath, err)
	}

	// Extract files concurrently
	var wg sync.WaitGroup
	errChan := make(chan error, len(reader.File))

	for _, file := range reader.File {
		wg.Add(1)
		go func(f *zip.File) {
			defer wg.Done()

			// Open the file inside zip
			rc, err := f.Open()
			if err != nil {
				errChan <- fmt.Errorf("error opening file %s inside zip: %v", f.Name, err)
				return
			}
			defer rc.Close()

			// Create the file path for extraction
			path := filepath.Join(extractPath, f.Name)

			// Create directory for this file if needed
			if f.FileInfo().IsDir() {
				os.MkdirAll(path, 0755)
				return
			}

			// Make sure the file's directory exists
			os.MkdirAll(filepath.Dir(path), 0755)

			// Create the file
			outFile, err := os.Create(path)
			if err != nil {
				errChan <- fmt.Errorf("error creating file %s: %v", path, err)
				return
			}
			defer outFile.Close()

			// Copy the contents
			if _, err := io.Copy(outFile, rc); err != nil {
				errChan <- fmt.Errorf("error extracting file %s: %v", f.Name, err)
				return
			}

			// Recursively process if it's a zip file
			if strings.HasSuffix(strings.ToLower(path), ".zip") {
				if err := processZipFile(path); err != nil {
					errChan <- fmt.Errorf("error processing nested zip %s: %v", path, err)
				}
				os.Remove(path) // Clean up the nested zip after processing
			}
		}(file)
	}

	wg.Wait()
	close(errChan)

	// Check for extraction errors
	for err := range errChan {
		fmt.Println(err)
	}

	fmt.Printf("Successfully extracted %s to %s\n", zipPath, extractPath)

	// Collect all JPEG files
	var jpegFiles []string
	err = filepath.Walk(extractPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if strings.HasSuffix(strings.ToLower(path), ".jpeg") || strings.HasSuffix(strings.ToLower(path), ".jpg") {
			jpegFiles = append(jpegFiles, path)
		}
		return nil
	})

	if err != nil {
		os.RemoveAll(extractPath) // Clean up on error
		return fmt.Errorf("error walking through directory %s: %v", extractPath, err)
	}

	// Sort files to ensure consistent order
	sort.Strings(jpegFiles)

	if len(jpegFiles) == 0 {
		os.RemoveAll(extractPath) // Clean up if no JPEGs found
		return fmt.Errorf("no JPEG files found in %s", extractPath)
	}

	// Convert JPEGs to WebP concurrently
	webpFiles := make([]string, len(jpegFiles))
	var convertWg sync.WaitGroup
	semaphore := make(chan struct{}, 4) // Limit concurrent conversions

	for i, jpeg := range jpegFiles {
		convertWg.Add(1)
		go func(idx int, jpegPath string) {
			defer convertWg.Done()
			semaphore <- struct{}{}        // Acquire semaphore
			defer func() { <-semaphore }() // Release semaphore

			webpFile := jpegPath + ".webp"
			cmd := exec.Command("cwebp", "-quiet", jpegPath, "-o", webpFile)
			if err := cmd.Run(); err != nil {
				fmt.Printf("Error converting %s to webp: %v\n", jpegPath, err)
				return
			}
			webpFiles[idx] = webpFile
		}(i, jpeg)
	}

	convertWg.Wait()

	// Filter out empty entries from failed conversions
	var validWebpFiles []string
	for _, webp := range webpFiles {
		if webp != "" {
			validWebpFiles = append(validWebpFiles, webp)
		}
	}

	// Create output webp file path
	outWebp := extractPath + ".webp"

	// Calculate frame duration to fit within 30s max duration
	frameDuration := 100                           // default 100ms
	if len(validWebpFiles)*frameDuration > 30000 { // if total duration > 30s
		frameDuration = 30000 / len(validWebpFiles) // adjust duration to fit in 30s
	}

	// Build webpmux command to create animated webp
	args := make([]string, 0, len(validWebpFiles)*3+2)
	for _, webp := range validWebpFiles {
		args = append(args, "-frame", webp, fmt.Sprintf("+%d+x+x+x", frameDuration))
	}
	args = append(args, "-o", outWebp)

	// Execute webpmux command
	cmd := exec.Command("webpmux", args...)
	if err := cmd.Run(); err != nil {
		// Clean up webp files and extracted directory on error
		for _, webp := range validWebpFiles {
			os.Remove(webp)
		}
		os.RemoveAll(extractPath)
		return fmt.Errorf("error creating animated webp: %v", err)
	}

	// Clean up individual webp files concurrently
	var cleanupWg sync.WaitGroup
	for _, webp := range validWebpFiles {
		cleanupWg.Add(1)
		go func(path string) {
			defer cleanupWg.Done()
			os.Remove(path)
		}(webp)
	}
	cleanupWg.Wait()

	// Clean up extracted directory after successful operation
	os.RemoveAll(extractPath)

	fmt.Printf("Successfully created animated webp: %s\n", outWebp)
	return nil
}

func main() {
	// Get command line arguments
	args := os.Args[1:]
	if len(args) == 0 {
		fmt.Println("Please provide directory paths separated by space")
		os.Exit(1)
	}

	// Process directories concurrently
	var wg sync.WaitGroup
	for _, dirPath := range args {
		wg.Add(1)
		go func(dir string) {
			defer wg.Done()
			// Walk through the directory recursively
			err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
				if err != nil {
					return err
				}

				// Process zip files
				if !info.IsDir() && strings.HasSuffix(strings.ToLower(path), ".zip") {
					if err := processZipFile(path); err != nil {
						fmt.Println(err)
					}
				}
				return nil
			})

			if err != nil {
				fmt.Printf("Error walking through directory %s: %v\n", dir, err)
			}
		}(dirPath)
	}

	wg.Wait()
}
