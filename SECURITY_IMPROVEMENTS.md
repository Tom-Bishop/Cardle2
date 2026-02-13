# Security Improvements for Cardle - Implementation Guide

## ✅ COMPLETED: Critical Admin Authentication Fix

**Status:** DONE
- Created `_admin-auth.js` with secure PBKDF2 password verification
- Added `is_admin` column to users table (migration 023)
- Updated all admin endpoints to require proper authentication:
  - `/api/admin.js`
  - `/api/admin/users.js`
  - `/api/admin/delete-user.js`
  - `/api/admin/reset-password.js`
  - `/api/admin/update-user-stats.js`
  - `/api/admin/guesses.js`
  - `/api/admin/delete-guesses.js`

**Action Required:** 
1. Run migration: `wrangler d1 migrations apply Cardle2`
2. Set yourself as admin: `UPDATE users SET is_admin = 1 WHERE username = 'Tom';`
3. Update frontend admin code to send password with admin requests

---

## 🔄 IN PROGRESS: CORS and Security Headers

**Status:** Partially Done
- Created `_security-utils.js` with:
  - `getPublicApiHeaders()` - For public endpoints
  - `getAuthApiHeaders()` - For auth endpoints  
  - `validateCsrfToken()` - CSRF validation
  - `checkRateLimit()` - Rate limiting utility
- Started updating `auth.js`

**Remaining Work:**
Need to update all "corsHeaders" references in:
- `auth.js` (15 occurrences remaining)
- `submit.js`
- `record-guess.js`
- `cars.js`
- `leaderboard.js`
- `stats.js`
- `me.js`
- `ping.js`

---

## ⏰ TODO: CSRF Token Improvement

**Current Issue:** Static hardcoded token `'cardle-csrf-protection'`

**Solution Options:**
1. **Simple:** Keep static token but validate Origin header
2. **Better:** Generate per-session tokens stored in cookies
3. **Best:** Use Cloudflare signed tokens

**Recommendation:** Option 1 (simplest, adequate for this use case)
- Add Origin header validation in auth endpoints
- Ensure frontend sends proper Origin

---

## ⏰ TODO: Content Security Policy (CSP)

Add to `public/index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://cardle.jogn.co.uk;
  font-src 'self';
  frame-ancestors 'none';
">
```

---

## ⏰ TODO: Environment Variables

**Critical:** Move sensitive values to Cloudflare secrets

```bash
# Set production URL
wrangler secret put ALLOWED_ORIGIN
# Enter: https://cardle.jogn.co.uk

# Optional: Set admin email for notifications
wrangler secret put ADMIN_EMAIL
```

Then update `_security-utils.js` to use `env.ALLOWED_ORIGIN`

---

##⏰ TODO: Rate Limiting Setup

**Create KV namespace for rate limiting:**

```bash
wrangler kv:namespace create "RATE_LIMIT_KV"
wrangler kv:namespace create "RATE_LIMIT_KV" --preview
```

Add to `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-id-here"
preview_id = "your-preview-id-here"
```

---

## ⏰ TODO: Input Validation Improvements

1. **Add max length validation** for all text inputs
2. **Sanitize HTML** in car make/model displays
3. **Validate car_id** existence before any database operations
4. **Add request size limits** (prevent large payload attacks)

---

## ⏰ TODO: Monitoring & Error Handling

1. **Set up error logging** (use Cloudflare Logpush or external service)
2. **Add health check endpoint** `/api/health`
3. **Monitor rate limit hits** to detect attacks
4. **Set up alerts** for:
   - Failed admin login attempts
   - Database errors
   - Rate limit violations

---

## 🔒 Security Checklist Before Launch

- [ ] Run database migration (023_add_admin_flag.sql)
- [ ] Set admin user in database
- [ ] Update all API CORS headers
- [ ] Add CSP meta tag to index.html
- [ ] Set up RATE_LIMIT_KV namespace
- [ ] Configure environment variables/secrets
- [ ] Test admin authentication
- [ ] Test rate limiting
- [ ] Review all error messages (don't leak sensitive info)
- [ ] Enable HTTPS only (should be automatic with Cloudflare Pages)
- [ ] Test CSRF protection
- [ ] Scan for SQL injection vulnerabilities
- [ ] Review password requirements (currently 8+ chars)
- [ ] Add logging for security events

---

## 📊 Security Headers Summary

### Admin Endpoints:
- `Access-Control-Allow-Origin`: `https://cardle.jogn.co.uk`
- `Access-Control-Allow-Credentials`: `true`
- `Strict-Transport-Security`: `max-age=31536000`
- `X-Frame-Options`: `DENY`
- `X-Content-Type-Options`: `nosniff`

### Public API Endpoints:
- `Access-Control-Allow-Origin`: `*` (or specific origin if credential needed)
- `X-Frame-Options`: `DENY`
- `X-Content-Type-Options`: `nosniff`

---

## 🚀 Deployment Steps

1. **Test locally:**
   ```bash
   wrangler pages dev
   ```

2. **Run migrations:**
   ```bash
   wrangler d1 migrations apply Cardle2
   ```

3. **Deploy:**
   ```bash
   wrangler pages deploy ./public
   ```

4. **Verify security:**
   - Test admin login with password
   - Test rate limiting
   - Check security headers with browser devtools
   - Verify CORS restrictions

---

## 📝 Notes

- All admin passwords should be minimum 8 characters
- Rate limiting is set to 5 attempts per hour
- PBKDF2 iterations: 100,000 (NIST recommendation)
- Session cookies are HttpOnly, Secure, SameSite=Strict
- Database queries use parameterized statements (SQL injection safe)

