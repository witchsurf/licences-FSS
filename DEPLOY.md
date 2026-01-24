# Deploying FSS License Manager (Supabase Version)

## Prerequisites
1.  **Supabase Project**:
    -   Create a project at [supabase.com](https://supabase.com).
    -   Run the SQL from `supabase_schema.sql` in the SQL Editor.
    -   Get your `SUPABASE_URL` and `SUPABASE_KEY` (Service Role Key recommended for this backend server).
2.  **Hosting**:
    -   Free options: Vercel, Render (Free Web Service), Railway.
    -   **Important**: You do NOT need a persistent disk anymore!

## Environment Variables
Failed deployments are usually due to missing environment variables. Set these in your hosting dashboard:

| Variable | Value |
| :--- | :--- |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | `your-service-role-key` |
| `ADMIN_PASSWORD` | `your-secure-password` (Default: admin) |

## Deploy to Vercel (Recommended)
1.  Push code to GitHub.
2.  Import project in Vercel.
3.  Add the Environment Variables above.
4.  Deploy.

## Deploy to Render
1.  New Web Service -> Connect Repo.
2.  Build Command: `npm install && npm run build`
3.  Start Command: `npm start`
4.  Add Environment Variables.
5.  Plan: **Free** (select Free instance type).
