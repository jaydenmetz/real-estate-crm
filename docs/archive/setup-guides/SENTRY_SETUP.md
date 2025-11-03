# 🔍 Sentry Setup Instructions

## ✅ Sentry is Installed - Just Need DSN Keys!

### 📋 Quick Setup (5 minutes)

1. **Sign up at Sentry.io** (free)
   - Go to: https://sentry.io/signup
   - Use Google signin for speed

2. **Create Backend Project**
   - Click "Create Project"
   - Platform: **Node.js**
   - Framework: **Express**
   - Name: `real-estate-crm-backend`

3. **Create Frontend Project**
   - Click "Create Project" again
   - Platform: **React**
   - No additional framework
   - Name: `real-estate-crm-frontend`

4. **Copy Your DSN Keys**
   - Backend DSN looks like: `https://abc123@o12345.ingest.sentry.io/67890`
   - Frontend DSN looks like: `https://xyz789@o12345.ingest.sentry.io/54321`

5. **Add to Railway Variables**

Go to Railway dashboard → Your project → Variables → RAW Editor

Add these lines:
```
SENTRY_DSN=your-backend-dsn-here
REACT_APP_SENTRY_DSN=your-frontend-dsn-here
```

## 🎯 Testing Sentry

### Backend Test:
Visit: `https://api.jaydenmetz.com/v1/debug-sentry`
This will trigger a test error that Sentry should capture.

### Frontend Test:
Add this temporary button to any component:
```jsx
<button onClick={() => { throw new Error('Sentry test!'); }}>
  Test Sentry
</button>
```

## 📊 What Sentry Monitors

### Backend Tracking:
- API errors and crashes
- Database query failures
- Authentication issues
- Performance bottlenecks
- Rate limit violations

### Frontend Tracking:
- JavaScript errors
- Component crashes
- Network failures
- User interactions leading to errors
- Performance metrics

## 🔒 Security Note

**Sentry DSNs are safe to expose** - they can only send data TO Sentry, not read from it. However, we're using environment variables as a best practice.

GitGuardian detected these as "high entropy secrets" but they're actually safe. Still, using environment variables prevents the security alerts.

## ✨ Features Enabled

- **Error Tracking**: All unhandled errors captured
- **Performance Monitoring**: 10% sample rate in production
- **Session Replay**: Records user sessions when errors occur
- **Release Tracking**: Tracks which version has errors
- **User Context**: Associates errors with logged-in users
- **Breadcrumbs**: Shows steps leading to errors

## 📈 Next Steps

After adding DSN keys:
1. Deploy will auto-trigger
2. Check Sentry dashboard for first events
3. Set up alerts for critical errors
4. Configure team notifications
5. Add custom error boundaries

Your error tracking is now production-ready! 🎉