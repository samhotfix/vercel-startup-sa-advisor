import { z } from "zod";

export const analysisSchema = z.object({
  stage: z
    .string()
    .describe(
      "The startup's current maturity stage, such as Prototype, First Users, AI Usage Growth, Workflow Complexity, Scale Readiness, or Optimization."
    ),

  stageReasoning: z
    .string()
    .describe("A concise explanation of why this startup fits that stage."),

  detectedStack: z.object({
    frontend: z
      .string()
      .describe("Detected frontend, hosting, or app framework."),
    backend: z
      .string()
      .describe("Detected backend, server, functions, or worker setup."),
    data: z.string().describe("Detected database, storage, or data layer."),
    ai: z
      .string()
      .describe("Detected AI model, SDK, generated code, or agent usage."),
    observability: z
      .string()
      .describe("Detected logs, monitoring, analytics, or debugging setup."),
    security: z
      .string()
      .describe("Detected security, auth, rate limiting, WAF, or access controls."),
  }),

  urlContext: z
    .string()
    .describe(
      "How the provided startup URL was used, if provided. This should only describe business or product context, not unsupported backend assumptions."
    ),

  risks: z
    .array(z.string())
    .describe("The most important risks or blockers in the current setup."),

  primaryRecommendation: z.object({
    product: z
      .string()
      .describe(
        "The single most important Vercel product or primitive to recommend next."
      ),
    whyNow: z
      .string()
      .describe(
        "Why this recommendation matters now based on the startup's current stage, usage, pain, or risk."
      ),
    businessValue: z
      .string()
      .describe(
        "The business outcome this recommendation creates for the startup."
      ),
  }),

  secondaryRecommendations: z
    .array(z.string())
    .describe("Other Vercel products or primitives that may become relevant soon."),

  implementationPlan: z
    .array(z.string())
    .describe("A clear 3-5 step implementation plan."),

  customerPitch: z
    .string()
    .describe(
      "A short customer-facing explanation a Vercel Startup Solutions Architect could say to the founder."
    ),

  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence score from 0 to 1."),
});

export type AnalysisResult = z.infer<typeof analysisSchema>;