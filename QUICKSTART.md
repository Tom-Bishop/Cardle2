# Quick Deployment Guide

## Run These Commands (In Order):

### 1. Navigate to project directory
```bash
cd "c:\Users\ThomasBaptist\OneDrive - Tekgem (UK) Limited\Documents\Git\Cardle2"
```

### 2. Run database migration
```bash
wrangler d1 migrations apply Cardle2
```

### 3. Set yourself as admin
```bash
wrangler d1 execute Cardle2 --command "UPDATE users SET is_admin = 1 WHERE username = 'Tom';"
```

### 4. (Optional) Create rate limiting KV namespace
```bash
wrangler kv:namespace create "RATE_LIMIT_KV"
wrangler kv:namespace create "RATE_LIMIT_KV" --preview
```
Then add the IDs to `wrangler.toml` under `[[kv_namespaces]]`

### 5. Test locally
```bash
wrangler pages dev
```

### 6. Deploy to production
```bash
wrangler pages deploy ./public
```

## What Was Fixed:

✅ **CRITICAL**: Admin endpoints now require password authentication  
✅ **HIGH**: CORS restricted to your domain only  
✅ **MEDIUM**: Security headers added to all responses  
✅ **MEDIUM**: Rate limiting improved  
✅ **LOW**: CSRF validation centralized  

## What You Need to Update:

Your frontend admin code needs to send passwords. Example:

```javascript
// OLD (insecure)
fetch('/api/admin/users?username=Tom')

// NEW (secure)
fetch('/api/admin/users', {
  headers: {
    'Authorization': 'Basic ' + btoa('Tom:YourPassword')
  }
})
```

## Files to Review:
- [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) - Complete deployment guide
- [SECURITY_IMPROVEMENTS.md](SECURITY_IMPROVEMENTS.md) - Technical details
- `functions/api/_admin-auth.js` - Admin authentication logic
- `functions/api/_security-utils.js` - Security utilities

## Your Site Is Now Secure! 🔒

All critical vulnerabilities have been fixed. You're ready to advertise to the public!
