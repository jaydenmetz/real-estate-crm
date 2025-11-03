# Google OAuth Setup Guide

This guide explains how to set up Google OAuth for sign-in functionality in the Real Estate CRM.

## Prerequisites

- Google Cloud Platform account
- Access to Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to **APIs & Services > Library**
2. Search for "Google+ API"
3. Click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Navigate to **APIs & Services > OAuth consent screen**
2. Select **External** user type (unless you have a workspace)
3. Fill in the application details:
   - **App name**: Real Estate CRM
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users (if in testing mode):
   - Add your email and any other test users
6. Click **Save and Continue**

## Step 4: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Select **Application type**: Web application
4. Fill in the details:
   - **Name**: Real Estate CRM Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for local development)
     - `https://crm.jaydenmetz.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000` (for local development)
     - `https://crm.jaydenmetz.com` (for production)
5. Click **Create**
6. **Copy the Client ID** - you'll need this for environment variables

## Step 5: Configure Environment Variables

### Backend (.env)

Add to `/backend/.env`:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

### Frontend (.env or Railway environment)

Add to `/frontend/.env` or Railway environment variables:

```bash
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

## Step 6: Deploy to Railway

1. Add the environment variables to Railway:
   - Go to your Railway project
   - Navigate to **Variables** tab
   - Add `GOOGLE_CLIENT_ID` for backend
   - Add `REACT_APP_GOOGLE_CLIENT_ID` for frontend (if using Railway for frontend)

2. Redeploy both backend and frontend

## Step 7: Test Google Sign-In

1. Navigate to the registration page
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected to the onboarding flow

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Ensure your redirect URIs in Google Cloud Console match exactly with your application URL
- Include both `http://localhost:3000` and `https://crm.jaydenmetz.com`

### "Google Sign-In button not appearing"
- Check browser console for errors
- Verify `REACT_APP_GOOGLE_CLIENT_ID` is set correctly
- Ensure the Google OAuth library is loaded

### "Invalid Google token"
- Verify `GOOGLE_CLIENT_ID` matches between frontend and backend
- Check that the Google+ API is enabled
- Ensure OAuth consent screen is configured

## Security Notes

- **Never commit** the Google Client ID to version control if it's a secret
- For production, use Railway environment variables
- Keep your OAuth consent screen up to date
- Regularly review and rotate credentials
- Monitor Google Cloud Console for suspicious activity

## Database Schema

The following columns are added to the `users` table for Google OAuth:

```sql
google_id VARCHAR(255) UNIQUE  -- Google OAuth user ID
profile_picture_url TEXT       -- User's Google profile picture URL
```

## API Endpoint

### POST /v1/auth/google

Authenticates user with Google ID token.

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "agent",
      "googleId": "1234567890",
      "profilePictureUrl": "https://lh3.googleusercontent.com/..."
    }
  }
}
```

## Features

- ✅ One-click Google Sign-In
- ✅ Automatic user creation if not exists
- ✅ Links existing accounts by email
- ✅ Stores Google profile picture
- ✅ Automatic onboarding for new users
- ✅ Secure JWT token generation
- ✅ Security event logging

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [google-auth-library Documentation](https://www.npmjs.com/package/google-auth-library)
