package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

// FileManager handles file operations with connection pooling-like optimizations
type FileManager struct {
	mu            sync.RWMutex
	fileCache     map[string][]byte
	maxCacheSize  int
	cacheTTL      time.Duration
	cacheExpiry   map[string]time.Time
	cleanupTicker *time.Ticker
	stopCleanup   chan bool
}

// NewFileManager creates a new file manager with caching
func NewFileManager(maxCacheSize int, cacheTTL time.Duration) *FileManager {
	fm := &FileManager{
		fileCache:    make(map[string][]byte),
		maxCacheSize: maxCacheSize,
		cacheTTL:     cacheTTL,
		cacheExpiry:  make(map[string]time.Time),
		stopCleanup:  make(chan bool),
	}

	// Start cleanup goroutine
	fm.cleanupTicker = time.NewTicker(time.Minute * 5) // Cleanup every 5 minutes
	go fm.cleanupLoop()

	return fm
}

// cleanupLoop periodically cleans expired cache entries and old files
func (fm *FileManager) cleanupLoop() {
	for {
		select {
		case <-fm.cleanupTicker.C:
			fm.cleanupExpiredCache()
			fm.cleanupOldFiles()
		case <-fm.stopCleanup:
			fm.cleanupTicker.Stop()
			return
		}
	}
}

// cleanupExpiredCache removes expired entries from file cache
func (fm *FileManager) cleanupExpiredCache() {
	fm.mu.Lock()
	defer fm.mu.Unlock()

	now := time.Now()
	for path, expiry := range fm.cacheExpiry {
		if now.After(expiry) {
			delete(fm.fileCache, path)
			delete(fm.cacheExpiry, path)
		}
	}
}

// cleanupOldFiles removes old project files and outputs
func (fm *FileManager) cleanupOldFiles() {
	// Clean old markdown files (older than 30 days)
	outputsDir := getOutputsDir()
	files, err := os.ReadDir(outputsDir)
	if err != nil {
		return
	}

	cutoff := time.Now().AddDate(0, 0, -30) // 30 days ago
	for _, file := range files {
		if !file.IsDir() && (filepath.Ext(file.Name()) == ".md") {
			filePath := filepath.Join(outputsDir, file.Name())
			if info, err := file.Info(); err == nil {
				if info.ModTime().Before(cutoff) {
					os.Remove(filePath)
				}
			}
		}
	}
}

// ReadFile reads a file with caching
func (fm *FileManager) ReadFile(path string) ([]byte, error) {
	fm.mu.RLock()
	if data, exists := fm.fileCache[path]; exists {
		if expiry, hasExpiry := fm.cacheExpiry[path]; hasExpiry {
			if time.Now().Before(expiry) {
				fm.mu.RUnlock()
				return data, nil
			}
		}
	}
	fm.mu.RUnlock()

	// Read from disk
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	// Cache the data if under size limit
	if len(data) < 1024*1024 { // Cache files under 1MB
		fm.mu.Lock()
		// Ensure cache doesn't grow too large
		if len(fm.fileCache) >= fm.maxCacheSize {
			fm.evictOldestEntry()
		}
		fm.fileCache[path] = data
		fm.cacheExpiry[path] = time.Now().Add(fm.cacheTTL)
		fm.mu.Unlock()
	}

	return data, nil
}

// WriteFile writes a file and updates cache
func (fm *FileManager) WriteFile(path string, data []byte, perm os.FileMode) error {
	err := os.WriteFile(path, data, perm)
	if err != nil {
		return err
	}

	// Update cache if file is small enough
	if len(data) < 1024*1024 {
		fm.mu.Lock()
		fm.fileCache[path] = data
		fm.cacheExpiry[path] = time.Now().Add(fm.cacheTTL)
		fm.mu.Unlock()
	}

	return nil
}

// evictOldestEntry removes the oldest cache entry
func (fm *FileManager) evictOldestEntry() {
	if len(fm.cacheExpiry) == 0 {
		return
	}

	var oldestPath string
	var oldestTime time.Time
	first := true

	for path, expiry := range fm.cacheExpiry {
		if first || expiry.Before(oldestTime) {
			oldestPath = path
			oldestTime = expiry
			first = false
		}
	}

	delete(fm.fileCache, oldestPath)
	delete(fm.cacheExpiry, oldestPath)
}

// InvalidateCache removes a specific file from cache
func (fm *FileManager) InvalidateCache(path string) {
	fm.mu.Lock()
	defer fm.mu.Unlock()
	delete(fm.fileCache, path)
	delete(fm.cacheExpiry, path)
}

// GetCacheStats returns cache statistics
func (fm *FileManager) GetCacheStats() map[string]interface{} {
	fm.mu.RLock()
	defer fm.mu.RUnlock()

	return map[string]interface{}{
		"cached_files":    len(fm.fileCache),
		"max_cache_size":  fm.maxCacheSize,
		"cache_hit_ratio": fm.getCacheHitRatio(),
	}
}

// getCacheHitRatio calculates cache hit ratio (simplified)
func (fm *FileManager) getCacheHitRatio() float64 {
	// This would need proper instrumentation in a real implementation
	return 0.0 // Placeholder
}

// Stop gracefully shuts down the file manager
func (fm *FileManager) Stop() {
	close(fm.stopCleanup)
}

// Global file manager instance
var globalFileManager *FileManager

// InitFileManager initializes the global file manager
func InitFileManager() {
	globalFileManager = NewFileManager(100, time.Minute*15) // Cache up to 100 files for 15 minutes
}

// GetFileManager returns the global file manager instance
func GetFileManager() *FileManager {
	if globalFileManager == nil {
		InitFileManager()
	}
	return globalFileManager
}

// FileSystemStats provides information about file system usage
type FileSystemStats struct {
	TotalProjects int            `json:"total_projects"`
	TotalFiles    int            `json:"total_files"`
	DiskUsage     int64          `json:"disk_usage_bytes"`
	OldestFile    time.Time      `json:"oldest_file"`
	NewestFile    time.Time      `json:"newest_file"`
	FilesByType   map[string]int `json:"files_by_type"`
}

// GetFileSystemStats returns comprehensive file system statistics
func GetFileSystemStats() (*FileSystemStats, error) {
	stats := &FileSystemStats{
		FilesByType: make(map[string]int),
	}

	outputsDir := getOutputsDir()
	files, err := os.ReadDir(outputsDir)
	if err != nil {
		return nil, fmt.Errorf("error reading outputs directory: %v", err)
	}

	var allFiles []os.FileInfo
	var totalSize int64

	for _, file := range files {
		if !file.IsDir() {
			info, err := file.Info()
			if err != nil {
				continue
			}

			allFiles = append(allFiles, info)
			totalSize += info.Size()

			ext := filepath.Ext(file.Name())
			if ext == "" {
				ext = "no_extension"
			}
			stats.FilesByType[ext]++

			if ext == ".json" {
				stats.TotalProjects++
			}
		}
	}

	stats.TotalFiles = len(allFiles)
	stats.DiskUsage = totalSize

	if len(allFiles) > 0 {
		// Sort by modification time to find oldest and newest
		sort.Slice(allFiles, func(i, j int) bool {
			return allFiles[i].ModTime().Before(allFiles[j].ModTime())
		})

		stats.OldestFile = allFiles[0].ModTime()
		stats.NewestFile = allFiles[len(allFiles)-1].ModTime()
	}

	return stats, nil
}
