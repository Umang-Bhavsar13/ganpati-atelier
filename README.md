# Ganpati Atelier

An online store built with Next.js, Prisma, MongoDB, and Stripe.

## Run locally

Requirements: Node.js 20.9 or newer and a MongoDB database.

1. Copy `.env.example` to `.env` and fill in the values.
2. Install dependencies and generate the Prisma client:

   ```bash
   npm ci
   ```

3. Initialize and seed the database:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Open <http://localhost:3000>.

## Deploy to Vercel

1. Create a MongoDB database (for example, MongoDB Atlas) and allow connections from your Vercel deployment.
2. Import this Git repository in Vercel. Keep the project root as the Root Directory and leave the Framework Preset set to **Next.js**. Vercel detects the build settings automatically; do not enable static export.
3. In Vercel Project Settings → Environment Variables, add the variables from `.env.example`. Use production credentials and set `NEXT_PUBLIC_SITE_URL` to the deployed site’s HTTPS URL.
4. Create a Vercel Blob store and connect it to the project so Vercel provides `BLOB_READ_WRITE_TOKEN`. Admin image uploads use Blob on Vercel; local development writes uploads to `public/uploads`.
5. Deploy. The `postinstall` script generates Prisma Client during Vercel’s dependency installation.
6. From a machine with the production environment variables configured, initialize and seed the database once:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

7. In Stripe, configure a webhook pointing to `https://<your-domain>/api/payments/webhook` for the `checkout.session.completed` event, then set its signing secret as `STRIPE_WEBHOOK_SECRET` in Vercel and redeploy.

Vercel redeploys automatically when changes are pushed to the connected Git branch. Preview and production environment variables can be configured separately in Vercel.
