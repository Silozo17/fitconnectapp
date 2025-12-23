# App Store Demo Account Setup Guide

This guide explains how to set up the demo account for Apple App Store review.

## Demo Account Credentials

| Field | Value |
|-------|-------|
| Email | `appstore.review@fitconnect.app` |
| Password | `FitConnect2024!Review` |
| Account Type | Client |

## Step 1: Create the Auth User

You must manually create the auth user in Supabase Dashboard:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create New User"
3. Enter:
   - Email: `appstore.review@fitconnect.app`
   - Password: `FitConnect2024!Review`
   - Toggle "Auto Confirm User" to ON
4. Click "Create User"
5. Copy the user's UUID for the next step

## Step 2: Run the Demo Data Setup SQL

After creating the auth user, run the SQL script in `scripts/setup-demo-account.sql`.

Replace `YOUR_AUTH_USER_ID_HERE` with the actual UUID from Step 1.

## Features to Demonstrate

The demo account should have access to:

- ✅ Full client dashboard
- ✅ Active coach relationship  
- ✅ Sample workout plans (multiple weeks)
- ✅ Sample nutrition plans
- ✅ Progress tracking entries
- ✅ Messaging history with coach
- ✅ Active Pro subscription tier
- ✅ Sample habits and habit logs
- ✅ Badge achievements

## Testing Checklist

Before submitting to App Store:

- [ ] Demo account can log in successfully
- [ ] Dashboard loads with sample data
- [ ] Workout plans display correctly
- [ ] Nutrition plans display correctly
- [ ] Progress photos/entries visible
- [ ] Messages with coach visible
- [ ] No placeholder content visible
- [ ] IAP products load correctly
- [ ] Signup flow works on iPad

## Important Notes

1. **No placeholder content**: Ensure `digital_products` has no test products with `is_published = true`
2. **Coach must be verified**: The linked coach must have `is_verified = true`
3. **Subscription tier**: Set client's coach subscription to `pro` tier
