# ReleaseNotes.ai

Turn raw Git commits, Jira tickets, and sprint bullets into polished, user-facing release notes with AI.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js (magic-link email via Postmark)
- **Database:** Supabase (PostgreSQL) + Prisma
- **AI:** OpenRouter (Gemini Flash — free tier)
- **Billing:** Stripe subscriptions
- **Rate Limiting:** Upstash Redis
- **Cron:** Vercel Cron Jobs

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project (for database)
- OpenRouter account (free API key)
- Postmark account (for transactional email)
- Stripe account (for billing)
- Upstash account (for rate limiting)

### Installation

```bash
git clone https://github.com/sifarellc/Changelog-to-Release-Notes-Writer.git
cd Changelog-to-Release-Notes-Writer
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (http://localhost:3000 for dev) |
| `EMAIL_SERVER_USER` | Postmark Server API token |
| `EMAIL_SERVER_PASSWORD` | Postmark Server API token (same) |
| `EMAIL_FROM` | Sender email address |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PRICE_ID` | Stripe price ID for the $19/mo plan |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `CRON_SECRET` | Random string (`openssl rand -hex 32`) |

### Database Setup

```bash
npx prisma db push
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import repo in Vercel
3. Add all environment variables
4. Deploy

### Stripe Webhook Setup

After deploying, create a webhook in Stripe Dashboard:

- URL: `https://your-domain.vercel.app/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth magic-link auth
│   │   ├── checkout/route.ts            # Stripe checkout session
│   │   ├── cron/reset-usage/route.ts    # Monthly free usage reset
│   │   ├── rewrite/route.ts             # AI rewrite endpoint
│   │   └── webhooks/stripe/route.ts     # Stripe webhook handler
│   ├── pricing/page.tsx                 # Pricing page
│   ├── layout.tsx                       # Root layout
│   └── page.tsx                         # Home page
├── components/
│   ├── Header.tsx                       # App header
│   ├── OutputPanel.tsx                  # Release notes output
│   └── ReleaseNotesForm.tsx             # Input form + tone selector
└── lib/
    ├── auth.ts                          # NextAuth config
    ├── db.ts                            # Prisma client singleton
    ├── llm.ts                           # OpenRouter AI helper
    ├── rate-limit.ts                    # Upstash rate limiter
    └── redis.ts                         # Upstash Redis client
prisma/
└── schema.prisma                        # Database schema
```

## License

MIT
