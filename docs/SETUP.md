# Vespa Puducherry: setup, testing, deployment

## 1. Supabase
1. Create a project at supabase.com.
2. SQL editor: run `supabase/migrations/0001_init.sql` (tables, RLS, `place_order`, rate limiter, storage bucket `products`).
3. Auth > URL configuration: set Site URL to your domain and add `<domain>/auth/callback` to Redirect URLs. Keep email confirmation ON.
4. Copy `.env.example` to `.env.local` and fill in the URL, anon key and service-role key. The service-role key is server-only.

## 2. Create the owner (the only way to get admin access)
```
OWNER_EMAIL=you@example.com OWNER_PASSWORD='choose-a-12+char-Password1' OWNER_NAME='Your Name' npm run create-owner
```
(PowerShell: set `$env:OWNER_EMAIL=...` first.) There is no default password and no web endpoint that promotes users. A database trigger blocks end users from changing `profiles.role`.
Sign in at `/admin/login`.

## 3. Run
`npm install`, `npm run dev` (http://localhost:3000) or `npm run build && npm start`.

## 4. First content (admin)
Categories (suggested scooter ones: Classic Elegance, Modern Style, Sporty Design, Premium Collections, Urban Riding, which power the homepage tiles), then scooters and accessories (upload only licensed images), then Settings (address, phone, email, hours, shipping/tax).

## 5. Tests
- `npm run typecheck`, `npm run lint`
- `npm test` (Vitest: slot rules, pricing, validation, redirect safety, card rendering)
- `npm run test:e2e` (Playwright desktop + mobile; runs without Supabase and checks honest degraded states)
Not automated yet: flows needing a live Supabase (register, booking save, order placement, admin CRUD). Verify these manually after setup using the checklist below.

### Manual checklist (needs Supabase)
Register and verify email; reset password; create scooter/accessory with image in admin; see it publicly; book a test ride; confirm it in admin; try confirming a second booking in the same slot (must be refused); add accessory to cart, place order request, see stock drop; cancel order in admin, see stock return; submit enquiry; confirm a non-owner account is refused at `/admin`.

## 6. Deploy (e.g. Vercel)
Set the env vars from `.env.example` (not the OWNER_* ones) and `NEXT_PUBLIC_SITE_URL`. Run the migration on the production project and the owner script once.

## Known gaps / decisions
- No licensed photography or 3D scooter models are included. The hero uses an original SVG illustration and the 3D studio an original concept model; both are labelled. Add real assets via admin uploads.
- Payments: not integrated. Checkout is an order request; the owner marks orders paid with a verified reference. Adding Razorpay/Stripe needs provider credentials and a verified webhook route.
- Email notifications are not sent (no provider configured); the UI never claims they are.
- The cart is stored in the browser (ids and quantities only); it is not synced to the database per user.
- Customer reviews are hidden because none are verified.
