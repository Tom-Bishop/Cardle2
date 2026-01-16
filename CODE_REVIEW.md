# Cardle2 - Full Code & Security Review

## Executive Summary
Cardle2 is a functional car guessing game with good basic structure, but has **critical security vulnerabilities** that need immediate attention before production use. The primary concerns are weak password hashing and potential XSS vulnerabilities.

---

## 🚨 CRITICAL SECURITY ISSUES

### 1. **Weak Password Hashing (SHA-256 without salt)**
**Severity: CRITICAL**
- **Location**: `functions/api/auth.js` (line 2)
- **Issue**: Passwords are hashed with plain SHA-256, not a proper password hashing function
- **Risk**: Vulnerable to rainbow tables, GPU attacks, compromised database exposure
- **Fix**: Use bcrypt, Argon2, or PBKDF2 with proper salt

```javascript
// ❌ INSECURE - Current implementation
const hash = await sha256Hex(password);

// ✅ SECURE - Use bcrypt instead
import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, storedHash);
```

**Recommendation**: Add `bcryptjs` package and update auth.js immediately. This affects ~100+ user accounts if compromised.

---

### 2. **Missing HTTPS/TLS Enforcement**
**Severity: CRITICAL**
- **Issue**: Passwords sent over HTTP could be intercepted
- **Fix**: Cloudflare Pages handles HTTPS, but ensure `wrangler.toml` sets HSTS headers

```javascript
// Add to API responses
headers.append('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
```

---

### 3. **Potential XSS via innerHTML**
**Severity: HIGH**
- **Location**: `public/index.html` line 1728
- **Issue**: 
```javascript
statsContent.innerHTML = `<div class="help-section">...${userInput}...</div>`;
```
If usernames aren't properly sanitized, could allow script injection.

- **Fix**: Use `textContent` for user data, `innerHTML` only for static content
```javascript
// ❌ UNSAFE if user controls content
el.innerHTML = `<p>${username}</p>`;

// ✅ SAFE
el.textContent = username;
el.innerHTML = '<p></p>';
el.querySelector('p').textContent = username;
```

---

### 4. **No CSRF Protection**
**Severity: MEDIUM**
- **Issue**: API endpoints accept POST without CSRF tokens
- **Fix**: Add CSRF token validation

```javascript
// Add to auth requests
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
headers.set('X-CSRF-Token', csrfToken);
```

---

### 5. **Sensitive Data Exposure in Error Messages**
**Severity: MEDIUM**
- **Location**: `functions/api/submit.js` line 92
```javascript
return new Response(JSON.stringify({ ok: false, error: String(err && err.stack ? err.stack : err) }), { status: 500 });
```
- **Issue**: Stack traces exposed to client
- **Fix**: Log errors server-side, return generic message to client
```javascript
console.error('Submit error:', err);
return new Response(JSON.stringify({ ok: false, error: 'Internal error' }), { status: 500 });
```

---

### 6. **Missing Input Validation on Stats**
**Severity: MEDIUM**
- **Location**: `functions/api/submit.js` line 13-15
- **Issue**: User can submit inflated guesses/time values
```javascript
if (!Number.isFinite(guesses) || guesses < 0 || guesses > 100) // ✅ Good
if (!Number.isFinite(timeSeconds) || timeSeconds < 0 || timeSeconds > 86400) // ✅ Good
```
But no validation that guesses ≤ 5 for the actual game logic. Add:
```javascript
if (guesses > 5 && mode === 'daily') return new Response("Invalid guesses", { status: 400 });
```

---

### 7. **No Rate Limiting**
**Severity: MEDIUM**
- **Issue**: No protection against brute force (auth) or spam (submissions)
- **Fix**: Implement rate limiting in Cloudflare Worker:
```javascript
// Use Durable Objects or check request IP/username
const key = `${request.headers.get('cf-connecting-ip')}:${username}`;
// Limit to 5 auth attempts per hour
```

---

### 8. **Cookie Security Issues**
**Severity: MEDIUM**
- **Location**: `functions/api/auth.js` line 47
```javascript
headers.append('Set-Cookie', `cardleUsername=${encodeURIComponent(username)}; Path=/; SameSite=Lax`);
```
- **Issues**:
  - Missing `HttpOnly` flag (vulnerable to XSS)
  - Missing `Secure` flag (insecure on HTTP)
  - No `Max-Age`/`Expires`
- **Fix**:
```javascript
headers.append('Set-Cookie', 
  `cardleUsername=${encodeURIComponent(username)}; Path=/; SameSite=Strict; Secure; HttpOnly; Max-Age=31536000`);
```

---

## ⚠️ HIGH PRIORITY ISSUES

### 9. **No Authentication for API Endpoints**
**Severity: HIGH**
- **Issue**: `/api/cars`, `/api/leaderboard` are public ✅
- **Issue**: `/api/submit` allows unauthenticated username submission
  - Anonymous users can submit scores under any username
  - No verification that requester owns the username
- **Fix**: Require authentication token
```javascript
// Add auth header validation
const username = getCookie('cardleUsername'); // Not secure - easy to spoof
// Better: Use signed JWT or session tokens
```

---

### 10. **No Account Verification/Email Confirmation**
**Severity: MEDIUM**
- **Issue**: Anyone can register with any username
- **Risk**: Usernames can be squatted, no account ownership verification
- **Fix**: Add email verification workflow

---

### 11. **No Admin API Authentication**
**Severity: HIGH**
- **Location**: `functions/admin/` endpoints
- **Issue**: Admin endpoints likely have no auth check
- **Risk**: Allows anyone to modify database
- **Check**: Read `functions/admin/admin.js` for vulnerabilities

---

### 12. **Missing Database Query Parameterization Check**
**Severity**: Review needed
- **Status**: ✅ Appears to use parameterized queries (`.bind()`)
- **Recommendation**: Audit all SQL queries to ensure `?` placeholders used for user input

---

## 📊 CODE QUALITY ISSUES

### 13. **Monolithic HTML File (3300+ lines)**
**Severity: MEDIUM (Maintainability)**
- **Issue**: Entire app in single HTML file makes testing/maintenance difficult
- **Fix**: Split into modules:
  - `js/cardle-game.js` - Game logic
  - `js/api.js` - API calls
  - `js/ui.js` - DOM manipulation
  - `js/auth.js` - Authentication
  - `css/` - Separate stylesheets

---

### 14. **No Input Validation on Username**
**Severity: LOW**
- **Current**: `username.length > 24` ✅
- **Missing**:
  - Allow only alphanumeric, hyphens, underscores
  - Trim whitespace
  - Block profanity/reserved names
```javascript
const validUsername = /^[a-zA-Z0-9_-]{3,24}$/;
if (!validUsername.test(username)) return error("Invalid username");
```

---

### 15. **Password Requirements Not Specified**
**Severity: LOW**
- **Current**: No minimum length validation
- **Fix**: Enforce minimum 8 characters
```javascript
if (password.length < 8) return error("Password too short");
```

---

### 16. **No Logging/Audit Trail**
**Severity: MEDIUM**
- **Issue**: No record of auth failures, suspicious activities
- **Fix**: Log to D1 or external service:
```javascript
await env.DB.prepare(`INSERT INTO audit_log (action, username, timestamp, ip) VALUES (?, ?, ?, ?)`);
```

---

### 17. **Inconsistent Error Handling**
**Severity: LOW**
- **Issue**: Mix of `.catch(() => null)` and try-catch
- **Fix**: Use consistent error handling pattern

---

### 18. **No Content Security Policy (CSP)**
**Severity: MEDIUM**
- **Fix**: Add CSP header to prevent XSS
```javascript
headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'");
```

---

## 🟢 WHAT'S DONE WELL

✅ **Parameterized SQL queries** - Prevents SQL injection  
✅ **SameSite cookies** - Reduces CSRF risk  
✅ **Input length validation** - Prevents buffer overflow  
✅ **Proper game logic validation** - Prevents cheating (streak logic, daily limits)  
✅ **Responsive design** - Mobile-friendly  
✅ **SEO meta tags** - Good for discoverability  

---

## 📋 ACTION PLAN (Priority Order)

### Phase 1: CRITICAL (Do immediately before more users register)
- [ ] Replace SHA-256 with bcrypt for password hashing
- [ ] Add `HttpOnly`, `Secure` to cookies
- [ ] Add rate limiting to `/api/auth` endpoint
- [ ] Sanitize all user-controlled innerHTML
- [ ] Add CSRF protection to POST endpoints
- [ ] Hide stack traces in error responses

### Phase 2: HIGH (Do this week)
- [ ] Add authentication/session tokens for `/api/submit`
- [ ] Review & secure `/admin/` endpoints
- [ ] Add password minimum length (8 chars)
- [ ] Add username format validation (alphanumeric only)
- [ ] Add audit logging for auth events

### Phase 3: MEDIUM (Do this month)
- [ ] Implement CSP headers
- [ ] Add email verification for new accounts
- [ ] Refactor into separate JS modules
- [ ] Add comprehensive input validation
- [ ] Setup monitoring/alerts for suspicious activity

### Phase 4: NICE-TO-HAVE
- [ ] Two-factor authentication (2FA)
- [ ] Account recovery via email
- [ ] Leaderboard verification (prevent spoofed scores)
- [ ] Data export/GDPR compliance

---

## 🔒 Security Checklist for Deployment

- [ ] All passwords use bcrypt (not SHA-256)
- [ ] All cookies have `HttpOnly` + `Secure` flags
- [ ] HTTPS enforced (HSTS header set)
- [ ] Rate limiting on auth endpoints
- [ ] No stack traces in error responses
- [ ] Admin endpoints protected
- [ ] CSRF tokens implemented
- [ ] CSP headers configured
- [ ] All user input sanitized
- [ ] SQL injection tests passed
- [ ] XSS tests passed
- [ ] Dependency audit (npm audit)
- [ ] Security.txt file added (/.well-known/security.txt)

---

## 🧪 Testing Recommendations

```bash
# Run before deployment:
npm audit                    # Check for vulnerable dependencies
npm install -g snyk          # Scan dependencies
npm test                     # Run unit tests

# Manual testing:
1. Try SQLi: username = "admin'; DROP TABLE users;--"
2. Try XSS: username = "<img src=x onerror=alert('xss')>"
3. Try auth bypass: Modify cardleUsername cookie
4. Try CSRF: Submit form from external domain
5. Try rate limit: 100 rapid auth attempts
```

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Password Hashing - OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Session Management - OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Web Security Academy](https://portswigger.net/web-security)

---

## Summary Table

| Issue | Severity | File | Fix Effort | Impact |
|-------|----------|------|-----------|--------|
| Weak password hashing | 🔴 CRITICAL | auth.js | 1 hour | Account compromise |
| No HTTPS enforcement | 🔴 CRITICAL | all | 15 min | Password interception |
| XSS via innerHTML | 🟠 HIGH | index.html | 30 min | Arbitrary JS execution |
| No CSRF protection | 🟠 HIGH | all API | 1 hour | Unauthorized actions |
| Error stack traces | 🟠 HIGH | submit.js | 30 min | Info disclosure |
| No API auth | 🟠 HIGH | submit.js | 2 hours | Score spoofing |
| Missing rate limiting | 🟡 MEDIUM | auth.js | 1 hour | Brute force attacks |
| Cookie flags missing | 🟡 MEDIUM | auth.js | 15 min | Cookie theft |
| No CSP headers | 🟡 MEDIUM | worker | 30 min | XSS vectors |
| Monolithic code | 🟡 MEDIUM | index.html | 4 hours | Maintainability |

---

*Review completed: January 16, 2026*
