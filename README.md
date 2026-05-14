# Vercel Startup Advisor

Vercel Startup Advisor is a small AI-powered discovery assistant that helps startup teams identify the next Vercel primitive they should adopt based on where their product is today.

The app collects lightweight startup context, maps the company’s current product and infrastructure stage, identifies the biggest technical risks, and recommends one practical next Vercel move.

## Why I built this

Startups do not adopt the full Vercel platform all at once.

A founder may start with a simple Vercel deployment, a v0-generated prototype, or a Next.js app built quickly with Cursor. As the product grows, the next problem changes. They may need auth, database persistence, logs, deployment confidence, AI spend controls, background workflows, safe code execution, bot protection, or enterprise readiness.

The core idea behind this project is timing-based expansion:

> The best technical advisor does not sell every feature to every startup. The best technical advisor understands when the customer is ready for the next layer.

This project turns that idea into a lightweight customer-facing advisor.

## What it does

The app asks for startup context:

- Optional startup URL

- What the startup is building

- Who uses it and what stage it is in

- Current stack

- AI, generated code, or automation usage

- Biggest pain or risk right now

- Optional extra context

The app then returns:

- Current startup maturity stage

- Stage reasoning

- URL context

- Detected stack

- Key risks

- Primary Vercel recommendation

- Why now

- Business value

- Secondary recommendations

- Implementation plan

- Customer-facing explanation

- Confidence score

- Lightweight evaluation panel

## Product philosophy

The app is designed around one principle:

> Recommend the next Vercel primitive that matters now, not every product that could possibly apply.

For example:

- A v0-built prototype without auth, persistence, or logs should not be sold advanced platform features first. It likely needs production readiness basics.

- A startup with direct OpenAI calls, rising model spend, and no fallback should probably look at AI Gateway.

- A team with background jobs and unreliable retries may be ready for Workflows or Fluid Compute.

- A product that runs AI-generated code may need Sandbox.

- A public AI endpoint with suspicious traffic may need WAF, BotID, rate limiting, and AI Gateway budgets.

The tool is meant to model that kind of stage-aware judgment.

## URL context design decision

This version includes an optional startup URL field, but it does not scrape the website or pretend to infer hidden infrastructure from it.

A public website can help understand product and business context, but it cannot reliably reveal:

- Backend architecture

- Deployment architecture

- Observability setup

- Security posture

- AI provider usage

- Worker architecture

- Rate limiting

- Database design

Because of that, the prompt explicitly tells the model:

> If a startup URL is provided, use it only as product or business context. Do not claim to know backend infrastructure, observability, security posture, AI usage, or deployment architecture from a public URL alone.

This was an intentional tradeoff. The prototype stays reliable and defensible, while leaving room for a production version that combines URL context with real telemetry.

## Example

A startup might enter:

> We are building an AI support assistant for ecommerce brands. We have 2,000 users and a few enterprise pilots. Frontend is on Vercel with Next.js. Backend worker is on Railway. Database is Supabase Postgres. We call OpenAI directly. AI costs are rising and we do not know which customers are driving usage.

The app should identify this as an AI Usage Growth stage and recommend AI Gateway as the primary next Vercel move.

The recommendation should explain:

- Why the startup is ready for AI Gateway now

- What risks exist in the current setup

- What business value AI Gateway creates

- What implementation steps the team should take

- Which secondary Vercel primitives may become relevant soon

## Architecture

The app uses:

- Next.js App Router for the web application

- React client state for the intake form and result rendering

- Vercel AI SDK for model interaction

- OpenAI through the AI SDK for structured reasoning

- Zod for structured output validation

- A server-side API route for the model call

- Vercel Functions for the `/api/analyze` endpoint when deployed

- A lightweight reference evaluation panel

## Request flow

```txt

Founder enters startup context

        ↓

Next.js frontend sends intake to /api/analyze

        ↓

Server-side API route reads the JSON body

        ↓

Route builds the Startup Advisor prompt

        ↓

Vercel AI SDK calls OpenAI with generateObject

        ↓

Zod schema forces structured output

        ↓

API route returns JSON

        ↓

Frontend stores result in state

        ↓

Recommendation report renders in the UI

```

## Key files

### `app/page.tsx`

Main customer-facing interface.

This file handles:

- Form state

- Optional startup URL input

- Example startup scenarios

- Loading state

- Error state

- Client-side validation

- Calling `/api/analyze`

- Rendering the recommendation report

- Rendering the lightweight evaluation panel

This file is marked with:

```tsx

"use client";

```

because it uses React state and click handlers.

### `app/api/analyze/route.ts`

Server-side API route.

This file receives the startup intake, builds the prompt, calls OpenAI through the Vercel AI SDK, validates the response against the Zod schema, and returns structured JSON to the frontend.

The model call happens here instead of directly in the browser because the OpenAI API key must stay server-side.

### `lib/prompts.ts`

Prompt builder.

This file contains the Startup Advisor maturity model and instructions for the model.

It tells the model to:

- Act like a Vercel Startup Solutions Architect

- Avoid selling every Vercel product

- Classify the startup’s stage

- Recommend one primary Vercel primitive

- Explain why now

- Stay practical and customer-facing

- Avoid overclaiming from the URL

This file controls how the model reasons.

### `lib/schema.ts`

Structured output schema.

This file uses Zod to define the exact shape of the AI response.

It includes:

- `stage`

- `stageReasoning`

- `detectedStack`

- `urlContext`

- `risks`

- `primaryRecommendation`

- `secondaryRecommendations`

- `implementationPlan`

- `customerPitch`

- `confidence`

This file controls what shape the model returns.

### `README.md`

Project memo.

This file explains the product idea, architecture, request flow, evaluation approach, Vercel platform notes, tradeoffs, and production path.

## Prompt vs schema

A key design choice is separating model reasoning from output structure.

`lib/prompts.ts` controls how the model should think.

`lib/schema.ts` controls what shape the model must return.

The prompt says:

> Think like a Vercel Startup Solutions Architect.

The schema says:

> Return an object with predictable fields the frontend can render.

This makes the app easier to reason about, easier to debug, and easier to present.

## Vercel platform notes

The app uses a Next.js API route at:

```txt

app/api/analyze/route.ts

```

When deployed on Vercel, this route runs as a Vercel Function.

Because the route calls an external model provider, it is an I/O-bound workload. Most of the function’s time is spent waiting for the model response, not doing CPU-heavy computation.

The route includes:

```ts

export const maxDuration = 60;

```

This gives the AI analysis endpoint more tolerance for slower model responses before timing out.

## Why the model call happens server-side

The model call happens inside:

```txt

app/api/analyze/route.ts

```

not directly inside:

```txt

app/page.tsx

```

This keeps the OpenAI API key private.

The browser sends startup intake to the server route. The server route reads the API key from `.env.local` locally, or from Vercel environment variables in production, and handles the model call securely.

The frontend never receives the API key.

## Why use `generateObject`

This is not a chat interface.

The UI needs structured fields that map cleanly to sections of the recommendation report.

The app uses:

```ts

generateObject

```

from the Vercel AI SDK because it lets the route request structured output that matches the Zod schema.

Without structured output, the model might return inconsistent paragraphs, markdown, or incomplete fields.

With structured output, the frontend can reliably render:

- Stage

- Risks

- Recommendation

- Business value

- Implementation plan

- Confidence

## Why use Zod

Zod acts as the contract for the model response.

The AI can reason flexibly, but the final output must match the schema.

This makes the app more reliable because the UI expects predictable data.

For example, the schema requires:

```ts

primaryRecommendation: z.object({

  product: z.string(),

  whyNow: z.string(),

  businessValue: z.string(),

})

```

That means the result must include a primary recommendation with a product, timing rationale, and business outcome.

## Evaluation approach

The assignment required a lightweight evaluation approach.

This app includes a reference evaluation panel with fixed test cases and a rubric.

### Test cases

1. Direct OpenAI calls + rising model spend + no fallback  

   Expected: AI Gateway

2. v0 prototype + no auth, database, logs, or rollback confidence  

   Expected: Production readiness with Functions, environment variables, and Observability

3. Frontend on Vercel + Railway worker handling background jobs  

   Expected: Workflows or Fluid Compute

4. AI-generated or user-generated code needs safe execution  

   Expected: Sandbox

5. Public AI endpoint + bot traffic or runaway usage risk  

   Expected: WAF, BotID, rate limiting, and AI Gateway budgets

### Rubric

The recommendation should:

- Identify the startup’s current maturity stage

- Use URL only as product context, not unsupported infrastructure evidence

- Detect stack and missing platform layers from provided context

- Recommend one relevant primary Vercel primitive

- Explain why the recommendation matters now

- Provide practical implementation steps

- Connect the recommendation to customer-facing business value

For this take-home, the evaluation panel is a reference eval. In a production version, I would automate it by running each test case through `/api/analyze` and scoring whether the expected primitive appears in the response.

## Production thinking

If this were a real Vercel internal or customer-facing tool, I would add:

- AI Gateway for provider abstraction, usage visibility, budgets, and fallback behavior

- Observability for latency, errors, and model-call debugging

- Rate limiting to protect the public analysis endpoint from abuse

- URL crawling for public product and business context

- GitHub/repo analysis to detect framework usage, direct model imports, workers, and security gaps

- Vercel account telemetry for deployments, failed builds, function usage, route errors, and cache behavior

- AI Gateway telemetry for provider usage, model costs, and fallback patterns

- Account history so advisors can track how recommendations evolve over time

- Human-in-the-loop review before recommendations are sent to customers

- Automated regression evals for recommendation quality

The production version would combine:

```txt

public website context

+ founder-provided context

+ repo analysis

+ Vercel telemetry

+ AI Gateway usage data

```

That would turn the prototype into a telemetry-driven next-best-action system for startup Solutions Architects.

## Defensible tradeoffs

I intentionally kept the scope small.

I did not add:

- Authentication

- Database persistence

- Real URL scraping

- GitHub integration

- Real Vercel telemetry

- Automated eval execution

- User accounts

- Saved recommendation history

That was deliberate. The goal of this take-home was not to build a large platform. The goal was to build a focused proof-of-concept that demonstrates product judgment, AI SDK usage, structured output, server-side model calls, and Vercel platform thinking.

The key architectural decision was to keep the advisor guided and reliable rather than pretending a public website can reveal hidden infrastructure. A URL can help explain product context, but it cannot reliably expose backend architecture, AI usage, observability, security posture, or deployment design.

The production version would combine founder-provided context with URL crawling, GitHub/repo analysis, Vercel account telemetry, AI Gateway usage data, and automated evaluations.

## Local development

Install dependencies:

```bash

npm install

```

Create a `.env.local` file:

```bash

OPENAI_API_KEY=your_openai_api_key

```

Run locally:

```bash

npm run dev

```

Open:

```txt

[http://localhost:3000](http://localhost:3000)

```

## Environment variables

Local development uses:

```txt

.env.local

```

Production on Vercel requires adding the environment variable in the Vercel dashboard:

```txt

OPENAI_API_KEY

```

Make sure the variable is applied to:

- Production

- Preview

- Development

After adding or changing the environment variable in Vercel, redeploy the project.

## Deployment

To deploy on Vercel:

1. Push the project to GitHub.

2. Import the GitHub repo into Vercel.

3. Add `OPENAI_API_KEY` to the project environment variables.

4. Deploy or redeploy.

5. Test the production URL with an example scenario.

## Git safety

Do not commit `.env.local`.

The project’s `.gitignore` should include:

```txt

.env*

```

Before committing, check:

```bash

git status

```

Make sure `.env.local` is not listed under staged files.

## Presentation framing

I would present this as a customer-facing startup discovery assistant, not just a generic AI chatbot.

The opening framing:

> Startups do not need every Vercel product at once. They need the right primitive at the right time. This tool helps map where a startup is today, identify what is starting to break, and recommend the next Vercel move that creates immediate value.

The technical framing:

> The frontend collects guided startup context. The server-side API route builds a Vercel Startup Advisor prompt, calls OpenAI through the Vercel AI SDK with `generateObject`, validates the output against a Zod schema, and returns structured JSON that the UI renders as a recommendation report.

The product framing:

> The point is not to automate a sales pitch. The point is to make technical discovery more consistent, stage-aware, and useful for founders.

## Demo flow

A strong demo flow:

1. Open the app.

2. Explain the thesis: timing-based expansion.

3. Click the `AI spend risk` example.

4. Generate recommendation.

5. Show the primary recommendation: likely AI Gateway.

6. Explain why the recommendation makes sense.

7. Show detected stack and risks.

8. Show implementation plan and customer-facing explanation.

9. Show eval panel.

10. Open code and explain `page.tsx`, `route.ts`, `prompts.ts`, and `schema.ts`.

## Code walkthrough summary

The entire app can be summarized like this:

```txt

page.tsx

collects input, calls /api/analyze, renders result

route.ts

runs server-side, calls OpenAI through AI SDK, returns JSON

prompts.ts

defines the Startup Advisor reasoning framework

schema.ts

defines the structured output contract

[README.md](http://README.md)

explains the product, architecture, tradeoffs, evals, and production path

```

## One-minute explanation

Vercel Startup Advisor is a small AI-powered discovery assistant for startup teams. It asks for product, stage, stack, AI usage, and current pain, then recommends the next Vercel primitive that matters now.

The frontend is built in `app/page.tsx`. When the user clicks Generate Recommendation, the app sends the intake to `/api/analyze`. That API route runs server-side as a Vercel Function, builds a Startup Advisor prompt, calls OpenAI through the Vercel AI SDK using `generateObject`, validates the output against a Zod schema, and returns structured JSON.

The UI renders that JSON as a recommendation report with stage, risks, detected stack, why now, business value, implementation plan, customer-facing explanation, confidence, and a lightweight eval panel.

I kept the scope intentionally small and defensible. In production, I would add AI Gateway, Observability, rate limiting, URL crawling, repo analysis, Vercel telemetry, and automated evals.

