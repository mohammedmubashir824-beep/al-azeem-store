# AL AZEEM KIRANA AND GENERAL STORE — Website

A complete online store for your kirana shop: customers browse and order, you manage
stock and orders from an admin panel, and stock counts update automatically the
moment an order is placed.

## What's included
- **Customer site** (`/`) — browse products by category, search, cart, checkout with
  Cash on Delivery or online UPI/card payment (Razorpay), order history.
- **Admin panel** (`/admin`) — daily stock entry, product list with edit/delete,
  order list with status updates, dashboard with today's sales and low-stock alerts.
- **Backend** — Node.js + Express API, with a real Supabase (PostgreSQL) database
  so your products, customers, and orders are safely stored in the cloud and never
  disappear when the server restarts.

---

## 1. Set up your free Supabase database

1. Go to https://supabase.com and sign up (free).
2. Click **"New project"**, give it a name (e.g. `al-azeem-store`), set a database
   password (save it somewhere), and choose a region close to you. Click **Create**.
3. Once it's ready, go to the **SQL Editor** (left sidebar) → **New query**.
4. Open the file `supabase-schema.sql` from this project, copy all of its contents,
   paste into the SQL editor, and click **Run**. This creates the tables your
   store needs (`admins`, `customers`, `products`, `orders`).
5. Go to **Project Settings** (gear icon) → **API**. You'll need two values from
   here in the next step:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **service_role key** (under "Project API keys" — click "Reveal" to see it.
     Keep this secret, never share it publicly.)

---

## 2. Run it on your own computer first (recommended)

You'll need **Node.js** installed (version 18 or higher) from https://nodejs.org.

1. Open a terminal/command prompt in this folder.
2. Install the dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to a new file named `.env`, then open `.env` and fill in:
   - `JWT_SECRET` — any long random text.
   - `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` — from step 1 above.
   - `ADMIN_USERNAME` / `ADMIN_PASSWORD` — the login you'll use for the admin panel.
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — optional; only needed for online
     UPI/card payments. Leave blank to use Cash on Delivery only for now.
4. Start the server:
   ```
   npm start
   ```
5. Open **http://localhost:5000** — that's your customer site. Open
   **http://localhost:5000/admin** to log in to the admin panel.
6. Add a few products under **Today's Stock Entry** — they'll appear on the
   customer site immediately, and are now saved permanently in Supabase.

---

## 3. Put it live on the internet

### Step A — Put your code on GitHub
Upload this whole project folder to a GitHub repository (skip `node_modules`
and your `.env` file — never upload `.env`, it has your real secrets).

### Step B — Deploy on Railway
1. Go to https://railway.app, sign in with GitHub.
2. **New Project → Deploy from GitHub repo** → select your repository.
3. Go to your service's **Variables** tab and add all the same variables from
   your `.env` file: `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`,
   `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `STORE_NAME`, `STORE_PHONE`, and the
   Razorpay ones if you have them. Do **not** set `PORT` — Railway sets it
   automatically.
4. Go to **Settings → Networking → Generate Domain** to get your live public link.

Because your data now lives in Supabase (not a local file), you don't need to
worry about persistent volumes for your product/order data — it will survive
restarts and redeploys automatically. (Product photo uploads are still stored on
the server's local disk, so add a volume mounted at `/app/public/uploads` if you
want uploaded photos to survive redeploys too.)

### Step C — Go live with real payments
Your Razorpay test keys only simulate payments. To accept real money, complete
Razorpay's business verification at https://dashboard.razorpay.com, then replace
your test keys with the **live** keys in Railway's Variables tab.

---

## Optional: Google Sign-In, Confirmation Emails, and Forgot Password

Your store also supports Google sign-in and email-based password reset/confirmation.
Both are optional — the site works fine without them, just without those specific
buttons/emails.

### Set up the database changes
1. In Supabase → SQL Editor → New query, paste the contents of
   `supabase-migration-auth.sql` and click Run. This adds email login support to
   your existing `customers` table.

### Set up Google Sign-In (optional)
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a project (or use an existing one) → **Create Credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Under "Authorized JavaScript origins", add both:
   - `http://localhost:5000` (for local testing)
   - your live Railway URL (e.g. `https://al-azeem-store-production-8f5a.up.railway.app`)
5. Copy the generated **Client ID** and put it in `.env` / Railway Variables as
   `GOOGLE_CLIENT_ID`.

### Set up confirmation & password-reset emails (optional)
1. Sign up free at https://resend.com
2. Go to **API Keys** → create one → copy it into `.env` / Railway Variables as
   `RESEND_API_KEY`.
3. By default, emails send from Resend's shared test address, which can only
   reach the email you signed up to Resend with. To email real customers,
   verify your own domain under **Domains** in Resend, then set `EMAIL_FROM`
   to an address on that domain (e.g. `AL AZEEM Store <noreply@yourdomain.com>`).
4. Set `APP_URL` to your site's real address (e.g. your Railway URL) so the
   links inside emails point to the right place.

---

## Everyday use, once it's live

- **Every morning**, log in to `/admin`, open **Today's Stock Entry**, and add what
  you bought — quantity, cost price, and selling price. If it's an item you already
  sell, the quantity just adds on top of what's left.
- **Customers** browse the site, add items to cart, and check out. The moment an
  order is placed, that quantity is deducted from your stock automatically.
- **Orders** tab shows every order — update the status as you pack and deliver it.
- **Dashboard** shows today's total sales and flags anything running low.

## Notes
- Your data (products, customers, orders) lives in Supabase — you can view and
  edit it directly from the Supabase dashboard's **Table Editor** if you ever need to.
- The admin username/password you set in `.env` is the only login for the store
  owner — keep it private.

