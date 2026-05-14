export const maxDuration = 60;

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { analysisSchema } from "@/lib/schema";
import { buildAnalysisPrompt } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const prompt = buildAnalysisPrompt({
      startupUrl: body.startupUrl || "",
      building: body.building || "",
      usersAndStage: body.usersAndStage || "",
      stack: body.stack || "",
      aiUsage: body.aiUsage || "",
      pain: body.pain || "",
      extraContext: body.extraContext || "",
    });

    const result = await generateObject({
      model: openai("gpt-4.1"),
      schema: analysisSchema,
      prompt,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error("Analysis failed:", error);

    return Response.json(
      {
        error: "Failed to analyze startup intake.",
      },
      { status: 500 }
    );
  }
}
