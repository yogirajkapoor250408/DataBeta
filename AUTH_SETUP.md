# DataBeta PKCE Google OAuth & Authentication Setup Guide

This document provides complete instructions for configuring Supabase and Google Cloud Console for DataBeta's PKCE OAuth flow, as well as the manual QA testing checklist.

---

## 1. Supabase Configuration

### Step A: Enable PKCE & Auth URL Settings
In your [Supabase Dashboard](https://app.supabase.com):
1. Navigate to **Authentication $\rightarrow$ URL Configuration**.
2. Set **Site URL**:
   - Local Development: `http://localhost:5173`
   - Production: `https://databeta.vercel.app`
3. Add the following to **Redirect URLs**:
   ```
   http://localhost:5173/auth/callback
   http://localhost:5173/auth/callback.html
   https://databeta.vercel.app/auth/callback
   https://databeta.vercel.app/auth/callback.html
   ```

### Step B: Enable Google Provider
1. Navigate to **Authentication $\rightarrow$ Providers $\rightarrow$ Google**.
2. Toggle **Enable Sign in with Google** to `ON`.
3. Enter your **Client ID** and **Client Secret** (from Google Cloud Console).
4. Copy the Supabase Callback URL provided in the dashboard:
   - Format: `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback`

---

## 2. Google Cloud Console Setup

1. Open [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Create or select your OAuth 2.0 Client ID (Web Application).
3. Under **Authorized JavaScript origins**, add:
   ```
   http://localhost:5173
   https://databeta.vercel.app
   ```
4. Under **Authorized redirect URIs**, add your Supabase Callback URL:
   ```
   https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback
   ```

---

## 3. Environment Variables Checklist

Ensure your `.env` (or Vercel Environment Variables) contains:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase Project URL | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anonymous Client Key | `eyJhbGciOi...` |

---

## 4. Security Invariants Enforced

1. **PKCE Flow Only**: Implicit OAuth token hash fragments are completely deprecated. Authorization codes are exchanged via `supabase.auth.exchangeCodeForSession(window.location.href)`.
2. **Instant URL Sanitization**: As soon as code exchange finishes, `window.history.replaceState({}, document.title, '/dashboard.html?mode=live')` purges the authorization code and all query parameters from browser history.
3. **Zero Token Logging**: Access tokens, refresh tokens, and provider tokens are redacted by `sanitizeErrorMessage` before any console logging or UI rendering.
4. **Global Sign Out**: `supabase.auth.signOut({ scope: 'global' })` revokes sessions and flushes local/session caches while preserving UI preferences.
5. **No Blank Screens**: Global `ErrorBoundary` and `AuthProvider` catch unhandled rejections and render branded, recoverable error screens with support reference IDs (`REF-AUTH-xxxx`).

---

## 5. Manual QA Verification Checklist

- [ ] **1. Google OAuth Sign-In**:
  - Click "Continue with Google" on the login modal.
  - Complete Google authentication.
  - Verify redirection to `/auth/callback` displaying "Completing Secure Sign-In...".
  - Verify final landing on `/dashboard.html?mode=live` with no tokens or codes in the URL.
- [ ] **2. Hard Refresh Session Preservation**:
  - While logged in, press `Cmd + Shift + R` (hard refresh).
  - Verify the dashboard loads your workspace directly without kicking you out.
- [ ] **3. Sign Out Purge**:
  - Click your avatar in the sidebar and select "Sign Out".
  - Verify redirection to `/`.
  - Perform hard refresh and verify you remain signed out.
- [ ] **4. Error Recovery**:
  - Visit `/auth/callback?error=access_denied&error_description=User%20cancelled`.
  - Verify branded error screen displays: *"We couldn’t complete sign-in. Your account is safe. Please try again."* with "Retry Sign In" and a diagnostic reference ID.
