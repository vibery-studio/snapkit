package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Simple password gate: env SNAPKIT_PASSWORD, session cookie, 30-day expiry

var (
	sessions   = map[string]time.Time{}
	sessionsMu sync.RWMutex
)

const sessionMaxAge = 30 * 24 * 60 * 60 // 30 days in seconds

func getPassword() string {
	if p := os.Getenv("SNAPKIT_PASSWORD"); p != "" {
		return p
	}
	return "snapkit2026"
}

func generateSessionToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func isValidSession(token string) bool {
	sessionsMu.RLock()
	defer sessionsMu.RUnlock()
	exp, ok := sessions[token]
	return ok && time.Now().Before(exp)
}

// AuthMiddleware checks for valid session cookie, skips login/static routes
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		// Skip auth for login routes and static assets
		if path == "/login" || path == "/auth/login" {
			c.Next()
			return
		}

		token, err := c.Cookie("snapkit_session")
		if err != nil || !isValidSession(token) {
			// API requests get 401, page requests redirect to login
			if len(path) > 4 && path[:5] == "/api/" {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
				return
			}
			c.Redirect(http.StatusFound, "/login")
			c.Abort()
			return
		}
		c.Next()
	}
}

// HandleLogin serves the login page
func HandleLogin(c *gin.Context) {
	c.Header("Content-Type", "text/html; charset=utf-8")
	c.String(http.StatusOK, loginHTML)
}

// HandleLoginPost validates password and sets session cookie
func HandleLoginPost(c *gin.Context) {
	password := c.PostForm("password")
	if password != getPassword() {
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(http.StatusOK, loginHTMLError)
		return
	}

	token := generateSessionToken()
	sessionsMu.Lock()
	sessions[token] = time.Now().Add(time.Duration(sessionMaxAge) * time.Second)
	sessionsMu.Unlock()

	c.SetCookie("snapkit_session", token, sessionMaxAge, "/", "", false, true)
	c.Redirect(http.StatusFound, "/")
}

const loginHTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SnapKit Login</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#f5f3f0;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#fff;border-radius:12px;padding:2.5rem;width:320px;box-shadow:0 2px 12px rgba(0,0,0,.08)}
h1{font-size:1.25rem;margin-bottom:1.5rem;color:#333}
input{width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:8px;font-size:15px;margin-bottom:1rem;outline:none}
input:focus{border-color:#c75b39}
button{width:100%;padding:10px;background:#c75b39;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer}
button:hover{background:#a94a2e}
.err{color:#c75b39;font-size:13px;margin-bottom:1rem}
</style></head><body>
<div class="card"><h1>SnapKit</h1>
<form method="POST" action="/auth/login">
<input type="password" name="password" placeholder="Password" autofocus required>
<button type="submit">Enter</button>
</form></div></body></html>`

const loginHTMLError = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SnapKit Login</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#f5f3f0;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#fff;border-radius:12px;padding:2.5rem;width:320px;box-shadow:0 2px 12px rgba(0,0,0,.08)}
h1{font-size:1.25rem;margin-bottom:1.5rem;color:#333}
input{width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:8px;font-size:15px;margin-bottom:1rem;outline:none}
input:focus{border-color:#c75b39}
button{width:100%;padding:10px;background:#c75b39;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer}
button:hover{background:#a94a2e}
.err{color:#c75b39;font-size:13px;margin-bottom:1rem}
</style></head><body>
<div class="card"><h1>SnapKit</h1>
<p class="err">Wrong password</p>
<form method="POST" action="/auth/login">
<input type="password" name="password" placeholder="Password" autofocus required>
<button type="submit">Enter</button>
</form></div></body></html>`
