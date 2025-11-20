package main

import (
    "os"
    "path/filepath"
    "testing"
    "time"
)

func TestCleanupExpiredCacheRemovesExpiredEntries(t *testing.T) {
    fm := &FileManager{
        fileCache:   make(map[string][]byte),
        cacheExpiry: make(map[string]time.Time),
    }

    expiredPath := "expired"
    validPath := "valid"

    fm.fileCache[expiredPath] = []byte("old")
    fm.fileCache[validPath] = []byte("new")
    fm.cacheExpiry[expiredPath] = time.Now().Add(-time.Minute)
    fm.cacheExpiry[validPath] = time.Now().Add(time.Minute)

    fm.cleanupExpiredCache()

    if _, ok := fm.fileCache[expiredPath]; ok {
        t.Errorf("expected expired path to be removed from cache")
    }
    if _, ok := fm.cacheExpiry[expiredPath]; ok {
        t.Errorf("expected expired path to be removed from expiry map")
    }
    if _, ok := fm.fileCache[validPath]; !ok {
        t.Errorf("expected valid path to remain in cache")
    }
}

func TestCleanupOldFilesRemovesOldMarkdown(t *testing.T) {
    outputsDir := getOutputsDir()

    if err := os.MkdirAll(outputsDir, 0o755); err != nil {
        t.Fatalf("failed to create outputs dir: %v", err)
    }

    oldFile := filepath.Join(outputsDir, "filepool_cleanup_old.md")
    recentFile := filepath.Join(outputsDir, "filepool_cleanup_recent.md")

    if err := os.WriteFile(oldFile, []byte("old"), 0o644); err != nil {
        t.Fatalf("failed to write old file: %v", err)
    }
    if err := os.WriteFile(recentFile, []byte("recent"), 0o644); err != nil {
        t.Fatalf("failed to write recent file: %v", err)
    }

    // Ensure cleanup does not leave test artifacts
    defer os.Remove(oldFile)
    defer os.Remove(recentFile)

    thirtyOneDaysAgo := time.Now().AddDate(0, 0, -31)
    if err := os.Chtimes(oldFile, thirtyOneDaysAgo, thirtyOneDaysAgo); err != nil {
        t.Fatalf("failed to set mtime on old file: %v", err)
    }

    fm := &FileManager{}
    fm.cleanupOldFiles()

    if _, err := os.Stat(oldFile); !os.IsNotExist(err) {
        t.Errorf("expected old markdown file to be removed, got err=%v", err)
    }
    if _, err := os.Stat(recentFile); err != nil {
        t.Errorf("expected recent markdown file to remain, got err=%v", err)
    }
}

func TestEvictOldestEntryRemovesOldestExpiry(t *testing.T) {
    fm := &FileManager{
        fileCache:   make(map[string][]byte),
        cacheExpiry: make(map[string]time.Time),
    }

    older := "older"
    newer := "newer"

    fm.fileCache[older] = []byte("old")
    fm.fileCache[newer] = []byte("new")
    fm.cacheExpiry[older] = time.Now().Add(-time.Minute)
    fm.cacheExpiry[newer] = time.Now()

    fm.evictOldestEntry()

    if _, ok := fm.fileCache[older]; ok {
        t.Errorf("expected oldest cache entry to be evicted")
    }
    if _, ok := fm.cacheExpiry[older]; ok {
        t.Errorf("expected oldest expiry entry to be removed")
    }
    if _, ok := fm.fileCache[newer]; !ok {
        t.Errorf("expected newer cache entry to remain")
    }
}

func TestInvalidateCacheRemovesEntries(t *testing.T) {
    fm := &FileManager{
        fileCache:   make(map[string][]byte),
        cacheExpiry: make(map[string]time.Time),
    }

    path := "to-remove"
    fm.fileCache[path] = []byte("data")
    fm.cacheExpiry[path] = time.Now().Add(time.Minute)

    fm.InvalidateCache(path)

    if _, ok := fm.fileCache[path]; ok {
        t.Errorf("expected file cache entry to be removed")
    }
    if _, ok := fm.cacheExpiry[path]; ok {
        t.Errorf("expected cache expiry entry to be removed")
    }
}

func TestFileManagerStopDoesNotPanic(t *testing.T) {
    fm := NewFileManager(1, time.Minute)
    fm.Stop()
}

