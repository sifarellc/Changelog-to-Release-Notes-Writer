# Product Hunt Launch Checklist

## Assets needed
- [ ] Screenshot: main app UI (1280×720)
- [ ] GIF: demo of paste → generate → export flow
- [ ] Logo (use favicon or simple text mark)
- [ ] Tagline: "Turn dev notes into polished release notes with AI"

## Copy

**Description:**
Every SaaS ships updates. Almost nobody writes good release notes.
ReleaseNotes.ai takes your raw commits, Jira tickets, and sprint bullets — and rewrites them into polished, user-facing release notes in your brand voice. Casual, professional, or technical. Paste, generate, export.

**First comment (maker comment):**
Hey Hunters! 👋 I built ReleaseNotes.ai because I was tired of spending 30 minutes every sprint writing release notes that nobody reads. You paste in your raw dev notes, pick a tone, and get polished release notes in seconds. Free to try (3/mo), $19/mo for unlimited. Would love your feedback!

## Launch day tasks
- [ ] Submit to Product Hunt (schedule for 12:01 AM PT)
- [ ] Post on Twitter/X with demo GIF
- [ ] Post in Indie Hackers
- [ ] Post in relevant Slack communities
- [ ] Email any beta users

## Pre-launch checklist
- [ ] Push code to GitHub
- [ ] Import repo in Vercel
- [ ] Add all environment variables in Vercel project settings
- [ ] Run `npx prisma db push` against production database
- [ ] Configure Stripe webhook endpoint (URL: `https://your-domain.vercel.app/api/webhooks/stripe`)
- [ ] Test sign-up flow end-to-end
- [ ] Test AI rewrite with real notes
- [ ] Test Stripe checkout in test mode
