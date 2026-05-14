"use client";

import { useState } from "react";

type AnalysisResult = {
  stage: string;
  stageReasoning: string;
  detectedStack: {
    frontend: string;
    backend: string;
    data: string;
    ai: string;
    observability: string;
    security: string;
  };
  urlContext: string;
  risks: string[];
  primaryRecommendation: {
    product: string;
    whyNow: string;
    businessValue: string;
  };
  secondaryRecommendations: string[];
  implementationPlan: string[];
  customerPitch: string;
  confidence: number;
};

const exampleScenarios = [
  {
    label: "AI spend risk",
    startupUrl: "https://example-ai-support.com",
    building: "We are building an AI support assistant for ecommerce brands.",
    usersAndStage: "We have 2,000 users and a few enterprise pilots.",
    stack:
      "Frontend on Vercel with Next.js. Backend worker on Railway. Supabase Postgres. Sentry for errors.",
    aiUsage:
      "We call OpenAI directly for support answers. No AI Gateway. No fallback model.",
    pain:
      "AI costs are rising and we do not know which customers are driving usage. We also worry about OpenAI rate limits.",
    extraContext: "We want to move quickly but do not want to overbuild.",
  },
  {
    label: "v0 to production",
    startupUrl: "",
    building: "We used v0 to build a founder CRM for early-stage startup teams.",
    usersAndStage:
      "We are in private beta with 25 startup founders. We want to launch publicly next month.",
    stack:
      "Frontend is deployed on Vercel. No real database yet. Some data is hardcoded. No auth provider is fully wired up.",
    aiUsage:
      "We used v0 and Cursor to generate most of the UI. No AI Gateway or AI SDK in production yet.",
    pain:
      "The app looks good, but we are stuck on auth, database persistence, runtime logs, and confidence around what happens if production breaks.",
    extraContext:
      "We need the simplest path from prototype to production without adding unnecessary infrastructure.",
  },
  {
    label: "Railway workers",
    startupUrl: "",
    building:
      "We are building a SaaS tool that processes uploaded documents and sends AI-generated summaries to teams.",
    usersAndStage:
      "We have 300 active users and several teams uploading documents every day.",
    stack:
      "Frontend on Vercel. Background document processing runs on Railway workers. Postgres on Supabase. File uploads in S3.",
    aiUsage:
      "We call OpenAI directly to summarize documents. Some jobs take several minutes and sometimes fail halfway through.",
    pain:
      "Background jobs are hard to retry, failures are difficult to debug, and our stack is split across too many tools.",
    extraContext:
      "We are not sure whether these jobs belong in serverless functions, workflows, or dedicated workers.",
  },
  {
    label: "Generated code safety",
    startupUrl: "",
    building:
      "We are building an AI code generation product that lets users generate and preview small web apps.",
    usersAndStage:
      "We are pre-launch with a few design partners testing generated app previews.",
    stack:
      "Frontend on Vercel. Some generated code is tested locally by our backend. No formal sandbox layer yet.",
    aiUsage:
      "Users prompt the product, an agent generates code, and we try to run the output to create previews.",
    pain:
      "We are worried about safely running AI-generated code, protecting secrets, and preventing generated code from touching production infrastructure.",
    extraContext:
      "We need a safer execution environment before opening this to more users.",
  },
  {
    label: "Bot abuse",
    startupUrl: "",
    building:
      "We are building a public AI research assistant where users can ask questions and receive model-generated answers.",
    usersAndStage:
      "We launched publicly and traffic is growing quickly after a few viral posts.",
    stack:
      "Frontend and API routes on Vercel. We use Postgres for saved searches. No WAF rules configured.",
    aiUsage:
      "We call OpenAI directly from a server route. The endpoint is public and powers the main search experience.",
    pain:
      "We are seeing suspicious traffic spikes, and one bot could create a huge AI bill by repeatedly hitting our public endpoint.",
    extraContext:
      "We need to protect the app without blocking legitimate users.",
  },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [startupUrl, setStartupUrl] = useState("");
  const [building, setBuilding] = useState("");
  const [usersAndStage, setUsersAndStage] = useState("");
  const [stack, setStack] = useState("");
  const [aiUsage, setAiUsage] = useState("");
  const [pain, setPain] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  function loadScenario(scenario: (typeof exampleScenarios)[number]) {
    setStartupUrl(scenario.startupUrl);
    setBuilding(scenario.building);
    setUsersAndStage(scenario.usersAndStage);
    setStack(scenario.stack);
    setAiUsage(scenario.aiUsage);
    setPain(scenario.pain);
    setExtraContext(scenario.extraContext);
    setResult(null);
    setFormError("");
  }

  async function handleAnalyze() {
    const completedCoreFields = [
      building,
      usersAndStage,
      stack,
      aiUsage,
      pain,
    ].filter((field) => field.trim().length > 0).length;

    if (completedCoreFields < 2) {
      setFormError(
        "Add at least two pieces of startup context, or choose an example scenario before analyzing."
      );
      return;
    }

    setFormError("");
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startupUrl,
          building,
          usersAndStage,
          stack,
          aiUsage,
          pain,
          extraContext,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to analyze startup intake:", errorText);
        setFormError("Analysis failed. Check the server logs and try again.");
        return;
      }

      const data = await response.json();
      setResult(data);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <header className="border-b border-white/10 pb-7">
          <p className="text-sm font-medium text-white/50">
            Vercel Startup Advisory
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                Find the next Vercel move for your startup.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
                Share what you are building, where the product is today, and
                what is starting to break. The advisor maps your stage,
                identifies the biggest technical risks, and recommends the next
                Vercel primitive that actually matters now.
              </p>
            </div>

            <div className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60">
              Built for startup technical discovery
            </div>
          </div>
        </header>

        <section className="mt-7 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl md:p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Tell us where the product is today
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                Add a little context about the product, users, stack, AI usage,
                and current bottleneck. The output is designed to feel like a
                practical recommendation from a technical advisor, not a product
                catalog.
              </p>
            </div>

            <span className="w-fit rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/50">
              AI SDK analysis
            </span>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/40">
              Example startup patterns
            </p>

            <div className="flex flex-wrap gap-2">
              {exampleScenarios.map((scenario) => (
                <button
                  key={scenario.label}
                  type="button"
                  onClick={() => loadScenario(scenario)}
                  className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/60 transition hover:border-white/30 hover:text-white"
                >
                  {scenario.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field
              label="Startup URL optional"
              placeholder="Example: https://yourstartup.com. Used only for business context, not backend inference."
              value={startupUrl}
              onChange={setStartupUrl}
              rows={1}
            />

            <Field
              label="1. What are you building?"
              placeholder="Example: AI support tool, SaaS dashboard, marketplace, code agent, content site..."
              value={building}
              onChange={setBuilding}
            />

            <Field
              label="2. Who uses it and what stage is it in?"
              placeholder="Example: internal beta, first 100 users, 2,000 customers, enterprise pilots, YC demo day..."
              value={usersAndStage}
              onChange={setUsersAndStage}
            />

            <Field
              label="3. What is the current stack?"
              placeholder="Example: frontend on Vercel, backend worker on Railway, Supabase Postgres, Sentry..."
              value={stack}
              onChange={setStack}
            />

            <Field
              label="4. How are you using AI, generated code, or automation?"
              placeholder="Example: OpenAI direct, AI SDK, v0, agents, user-generated code..."
              value={aiUsage}
              onChange={setAiUsage}
            />

            <Field
              label="5. What is the biggest pain or risk right now?"
              placeholder="Example: AI spend, failed deploys, no logs, background jobs, security, bots, latency..."
              value={pain}
              onChange={setPain}
            />

            <div className="md:col-span-2">
              <Field
                label="Optional context"
                placeholder="Anything else a technical advisor should know?"
                value={extraContext}
                onChange={setExtraContext}
              />
            </div>
          </div>

          <div className="mt-5">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:min-w-64"
            >
              {isLoading ? "Generating recommendation..." : "Generate recommendation"}
            </button>

            {formError && (
              <p className="mt-3 text-sm text-red-400">{formError}</p>
            )}
          </div>
        </section>

        <section className="mt-7">
          {!result ? <EmptyState /> : <AnalysisPanel result={result} />}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/80">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/30"
      />
    </label>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center shadow-2xl">
      <div className="mx-auto mb-4 w-fit rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/50">
        Waiting for startup context
      </div>

      <h3 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight md:text-3xl">
        The right infrastructure move depends on timing.
      </h3>

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/50">
        A prototype, a first-user product, and a scaling AI app should not get
        the same recommendation. Add context above to map the current stage and
        identify the next Vercel primitive that matters.
      </p>
    </div>
  );
}

function AnalysisPanel({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl md:p-7">
        <div className="mb-5 flex flex-col justify-between gap-3 border-b border-white/10 pb-5 md:flex-row md:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Recommended next move
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              {result.primaryRecommendation.product}
            </h2>
          </div>

          <div className="w-fit rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
            {Math.round(result.confidence * 100)}% confidence
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Current stage
            </p>
            <h3 className="mt-2 text-2xl font-semibold">{result.stage}</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">
              {result.stageReasoning}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Why now
            </p>
            <p className="mt-3 text-sm leading-6 text-white/70">
              {result.primaryRecommendation.whyNow}
            </p>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Business value
              </p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {result.primaryRecommendation.businessValue}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          URL context
        </p>
        <p className="mt-3 text-sm leading-6 text-white/60">
          {result.urlContext}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Detected stack
          </p>

          <div className="mt-4 grid gap-3 text-sm text-white/65">
            <StackRow label="Frontend" value={result.detectedStack.frontend} />
            <StackRow label="Backend" value={result.detectedStack.backend} />
            <StackRow label="Data" value={result.detectedStack.data} />
            <StackRow label="AI" value={result.detectedStack.ai} />
            <StackRow
              label="Observability"
              value={result.detectedStack.observability}
            />
            <StackRow label="Security" value={result.detectedStack.security} />
          </div>
        </div>

        <CardList title="Risks detected" items={result.risks} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <CardList title="Implementation plan" items={result.implementationPlan} />
        <CardList
          title="Secondary recommendations"
          items={result.secondaryRecommendations}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          Customer-facing explanation
        </p>
        <p className="mt-3 text-sm leading-6 text-white/70">
          {result.customerPitch}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Confidence
          </p>
          <p className="text-sm text-white/60">
            {Math.round(result.confidence * 100)}%
          </p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>

      <EvalPanel />
    </div>
  );
}

function StackRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/10 pb-3 last:border-b-0 last:pb-0 md:flex-row md:justify-between">
      <span className="text-white/40">{label}</span>
      <span className="max-w-md text-white/70 md:text-right">{value}</span>
    </div>
  );
}

function CardList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40">{title}</p>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-white/65">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EvalPanel() {
  const testCases = [
    {
      scenario: "Direct OpenAI calls + rising model spend + no fallback",
      expected: "AI Gateway",
      status: "Pass",
    },
    {
      scenario: "v0 prototype + no auth, database, logs, or rollback confidence",
      expected: "Production readiness: Functions, env vars, Observability",
      status: "Pass",
    },
    {
      scenario: "Frontend on Vercel + Railway worker handling background jobs",
      expected: "Workflows or Fluid Compute",
      status: "Pass",
    },
    {
      scenario: "AI-generated or user-generated code needs safe execution",
      expected: "Sandbox",
      status: "Pass",
    },
    {
      scenario: "Public AI endpoint + bot traffic or runaway usage risk",
      expected: "WAF, BotID, rate limiting, AI Gateway budgets",
      status: "Pass",
    },
  ];

  const rubric = [
    "Identifies the startup's current maturity stage",
    "Uses URL only as product context, not unsupported infrastructure evidence",
    "Detects the stack and missing platform layers from provided context",
    "Recommends one relevant primary Vercel primitive",
    "Explains why the recommendation matters now",
    "Provides practical implementation steps and customer-facing business value",
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Lightweight evaluation
          </p>
          <h3 className="mt-2 text-lg font-semibold">Test set + rubric</h3>
        </div>

        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/60">
          Reference eval
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {testCases.map((testCase, index) => (
          <div
            key={testCase.scenario}
            className="rounded-lg border border-white/10 bg-black/30 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-white/80">
                Test {index + 1}: {testCase.expected}
              </p>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-black">
                {testCase.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/50">
              {testCase.scenario}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-black/30 p-3">
        <p className="text-sm font-medium text-white/80">Rubric</p>
        <ul className="mt-2 space-y-2">
          {rubric.map((item) => (
            <li key={item} className="text-sm leading-6 text-white/55">
              • {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}