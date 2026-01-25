# Clerk Authentication Setup Guide

This project now uses Clerk for authentication. Follow these steps to get it working:

## 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up for a free account
2. Create a new application in the Clerk Dashboard
3. Choose your preferred authentication methods (Email, Google, GitHub, etc.)

## 2. Get Your API Keys

1. In your Clerk Dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_`)
3. Copy your **Secret Key** (starts with `sk_`)

## 3. Set Up Environment Variables

1. Copy the `.env.example` file to create a new `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Clerk keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_key_here
   ```

3. Keep your other existing environment variables (GEMINI_API_KEY, PERPLEXITY_API_KEY)

## 4. Run the Application

```bash
pnpm dev
```

## How Authentication Works

- **Public Access**: The main page loads normally for everyone
- **Authentication Required**: When users click "Extract Event", they will be prompted to sign in if not already authenticated
- **Clerk Popup**: Authentication happens via Clerk's modal popup - no redirect needed
- **After Sign In**: Users can immediately use all features

## Customizing Authentication

To customize the authentication experience:

1. **Sign-in/Sign-up URLs**: Modify these in `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   ```

2. **Redirect URLs**: Change where users go after authentication:
   ```env
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

3. **Styling**: Customize Clerk components in the [Clerk Dashboard](https://dashboard.clerk.com) under **Customization**

## Protecting API Routes

The API routes are already protected by Clerk middleware. Only authenticated users can access:
- `/api/convert`
- All other non-public API endpoints

Public routes (no authentication required):
- `/` (home page)
- `/api/health`
- Sign-in/Sign-up pages

## Troubleshooting

**Issue**: Authentication popup not appearing
- Make sure your Clerk keys are correctly set in `.env.local`
- Restart your development server after adding keys

**Issue**: "Invalid publishable key" error
- Double-check you're using the correct keys from your Clerk Dashboard
- Ensure the keys match your development/production environment

**Issue**: Users are redirected instead of popup
- The implementation uses `openSignIn()` which shows a modal popup
- If you prefer redirect behavior, you can modify the code

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Components](https://clerk.com/docs/components/overview)
