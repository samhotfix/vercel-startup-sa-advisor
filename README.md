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

1. Optional startup URL

2. What the startup is building

3. Who uses it and what stage it is in

4. Current stack

5. AI, generated code, or automation usage

6. Biggest pain or risk right now

7. Optional extra context

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

- backend architecture

- deployment architecture

- observability setup

- security posture

- AI provider usage

- worker architecture

- rate limiting

- database design

Because of that, the prompt explicitly tells the model:

> If a startup URL is provided, use it only as product or business context. Do not claim to know backend infrastructure, observability, security posture, AI usage, or deployment architecture from a public URL alone.

This was an intentional tradeoff. The prototype stays reliable and defensible, while leaving room for a production version that combines URL context with real telemetry.

## Example

A startup might enter:

> We are building an AI support assistant for ecommerce brands. We have 2,000 users and a few enterprise pilots. Frontend is on Vercel with Next.js. Backend worker is on Railway. Database is Supabase Postgres. We call OpenAI directly. AI costs are rising and we do not know which customers are driving usage.

The app should identify this as an AI Usage Growth stage and recommend AI Gateway as the primary next Vercel move.

The recommendation should explain:

- why the startup is ready for AI Gateway now

- what risks exist in the current setup

- what business value AI Gateway creates

- what implementation steps the team should take

- which secondary Vercel primitives may become relevant soon

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

## Key files

### `app/page.tsx`

Main user interface.

This file handles:

- form state
- optional startup URL input
- example startup scenarios
- loading state
- error state
- client-side validation
- calling `/api/analyze`
- rendering the recommendation report
- rendering the lightweight evaluation panel

This file is marked with:

```

```

```
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

-   
act like a Vercel Startup Solutions Architect  

-   
avoid selling every Vercel product  

-   
classify the startup’s stage  

-   
recommend one primary Vercel primitive  

-   
explain why now  

-   
stay practical and customer-facing  

-   
avoid overclaiming from the URL  


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

```

```

```
app/api/analyze/route.ts
```

When deployed on Vercel, this route runs as a Vercel Function.

Because the route calls an external model provider, it is an I/O-bound workload. Most of the function’s time is spent waiting for the model response, not doing CPU-heavy computation.

The route includes:

```

```

```
export const maxDuration = 60;
```

This gives the AI analysis endpoint more tolerance for slower model responses before timing out.

## Why the model call happens server-side

The model call happens inside:

```

```

```
app/api/analyze/route.ts
```

not directly inside:

```

```

```
app/page.tsx
```

This keeps the OpenAI API key private.

The browser sends startup intake to the server route. The server route reads the API key from `.env.local` locally, or from Vercel environment variables in production, and handles the model call securely.

The frontend never receives the API key.

## Why use `generateObject`

This is not a chat interface.

The UI needs structured fields that map cleanly to sections of the recommendation report.

The app uses:

```

```

```
generateObject
```

from the Vercel AI SDK because it lets the route request structured output that matches the Zod schema.

Without structured output, the model might return inconsistent paragraphs, markdown, or incomplete fields.

With structured output, the frontend can reliably render:

-   
stage  

-   
risks  

-   
recommendation  

-   
business value  

-   
implementation plan  

-   
confidence  


## Why use Zod

Zod acts as the contract for the model response.

The AI can reason flexibly, but the final output must match the schema.

This makes the app more reliable because the UI expects predictable data.

For example, the schema requires:

```

```

```
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

1.   
Direct OpenAI calls + rising model spend + no fallback  
  
Expected: AI Gateway  

2.   
v0 prototype + no auth, database, logs, or rollback confidence  
  
Expected: Production readiness with Functions, environment variables, and Observability  

3.   
Frontend on Vercel + Railway worker handling background jobs  
  
Expected: Workflows or Fluid Compute  

4.   
AI-generated or user-generated code needs safe execution  
  
Expected: Sandbox  

5.   
Public AI endpoint + bot traffic or runaway usage risk  
  
Expected: WAF, BotID, rate limiting, and AI Gateway budgets  


### Rubric

The recommendation should:

-   
identify the startup’s current maturity stage  

-   
use URL only as product context, not unsupported infrastructure evidence  

-   
detect stack and missing platform layers from provided context  

-   
recommend one relevant primary Vercel primitive  

-   
explain why the recommendation matters now  

-   
provide practical implementation steps  

-   
connect the recommendation to customer-facing business value  


For this take-home, the evaluation panel is a reference eval. In a production version, I would automate it by running each test case through `/api/analyze` and scoring whether the expected primitive appears in the response.

## Production thinking

If this were a real Vercel internal or customer-facing tool, I would add:

-   
AI Gateway for provider abstraction, usage visibility, budgets, and fallback behavior  

-   
Observability for latency, errors, and model-call debugging  

-   
Rate limiting to protect the public analysis endpoint from abuse  

-   
URL crawling for public product and business context  

-   
GitHub/repo analysis to detect framework usage, direct model imports, workers, and security gaps  

-   
Vercel account telemetry for deployments, failed builds, function usage, route errors, and cache behavior  

-   
AI Gateway telemetry for provider usage, model costs, and fallback patterns  

-   
Account history so advisors can track how recommendations evolve over time  

-   
Human-in-the-loop review before recommendations are sent to customers  

-   
Automated regression evals for recommendation quality  


The production version would combine:

```

```

```
public website context
+ founder-provided context
+ repo analysis
+ Vercel telemetry
+ AI Gateway usage data
```

That would turn the prototype into a telemetry-driven next-best-action system for startup Solutions Architects.

## Tradeoffs

I intentionally kept the scope small.

I did not add:

-   
authentication  

-   
database persistence  

-   
real URL scraping  

-   
GitHub integration  

-   
real Vercel telemetry  

-   
automated eval execution  

-   
user accounts  

-   
saved recommendation history  


The goal was to build something small, useful, and defensible.