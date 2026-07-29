# QuoteMate AI

Turn rough tradie job notes into professional quotes using AI.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Add your OpenAI API key:

```bash
cp .env.example .env.local
# Edit .env.local and set OPENAI_API_KEY
```

3. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

Enter three fields:

- **Customer name** — who the quote is for
- **Job type** — plumbing, electrical, carpentry, etc.
- **Job notes** — rough notes about the job

Click **Generate quote** to get:

- Quote title
- Scope of work
- Materials (with quantities and prices)
- Labor (with hours and rates)
- Terms and conditions

Copy or print the result to send to your customer.

## Tech stack

- Next.js 15 (App Router)
- Tailwind CSS 4
- OpenAI GPT-4o-mini

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |

## Out of scope (MVP)

- Invoicing
- Scheduling
- CRM
- Payments
- Mobile app
