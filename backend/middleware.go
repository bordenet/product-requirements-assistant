package main

import (
	"log"
	"net/http"
	"sync"
	"time"
)

// RequestSizeLimit middleware limits request body size
func RequestSizeLimit(maxSize int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, maxSize)
			next.ServeHTTP(w, r)
		})
	}
}

// RateLimiter implements basic rate limiting per IP
type RateLimiter struct {
	mu       sync.RWMutex
	clients  map[string]*ClientInfo
	requests int
	window   time.Duration
}

type ClientInfo struct {
	requests  int
	resetTime time.Time
}

func NewRateLimiter(requests int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		clients:  make(map[string]*ClientInfo),
		requests: requests,
		window:   window,
	}

	// Clean up old entries every minute
	go func() {
		ticker := time.NewTicker(time.Minute)
		for range ticker.C {
			rl.cleanup()
		}
	}()

	return rl
}

func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for ip, client := range rl.clients {
		if now.After(client.resetTime) {
			delete(rl.clients, ip)
		}
	}
}

func (rl *RateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	client, exists := rl.clients[ip]

	if !exists {
		rl.clients[ip] = &ClientInfo{
			requests:  1,
			resetTime: now.Add(rl.window),
		}
		return true
	}

	if now.After(client.resetTime) {
		client.requests = 1
		client.resetTime = now.Add(rl.window)
		return true
	}

	if client.requests >= rl.requests {
		return false
	}

	client.requests++
	return true
}

func (rl *RateLimiter) Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Get client IP
			ip := r.RemoteAddr
			if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
				ip = forwarded
			} else if realIP := r.Header.Get("X-Real-IP"); realIP != "" {
				ip = realIP
			}

			if !rl.Allow(ip) {
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				log.Printf("Rate limit exceeded for IP: %s", ip)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// LoggingMiddleware logs all requests
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		
		// Wrap the response writer to capture status code
		lrw := &LoggingResponseWriter{ResponseWriter: w, statusCode: 200}
		
		next.ServeHTTP(lrw, r)
		
		log.Printf("%s %s %d %v", r.Method, r.URL.Path, lrw.statusCode, time.Since(start))
	})
}

type LoggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *LoggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}