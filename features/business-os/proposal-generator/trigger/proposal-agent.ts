import { task, logger } from "@trigger.dev/sdk";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { agentOutputSchema, type AgentOutput, type ProposalInput } from "../utils/schema.js";
import { getProposalSystemPrompt } from "../prompts/proposal-agent.js";

/**
 * The model's ONLY job: executive summary, premium item descriptions, terms,
 * and client email copy. It receives NO prices and produces NO numbers — all
 * pricing is deterministic (see ../utils/calc.ts).
 */
export const proposalAgent = task({
  id: "proposal-agent",
  retry: { maxAttempts: 3 },
  run: async (payload: {
    input: ProposalInput;
    totalDisplay: string; // display string only
    promptVersion?: string;
  }): Promise<AgentOutput> => {
    const { input, totalDisplay, promptVersion } = payload;

    const itemsForPrompt = input.items.map((it, i) => ({
      index: i,
      name: it.name,
      description: it.description ?? "",
    }));

    const prompt = JSON.stringify(
      {
        company: input.company.name,
        client: { name: input.client.name, company: input.client.company ?? "" },
        proposalTitle: input.proposal.title,
        proposalNumber: input.proposal.number,
        validUntil: input.proposal.validUntil,
        project: input.project,
        totalInvestment: totalDisplay, // display string only
        items: itemsForPrompt,
      },
      null,
      2,
    );

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: agentOutputSchema,
      system: getProposalSystemPrompt(promptVersion),
      prompt,
      temperature: 0.5,
    });

    if (object.items.length !== input.items.length) {
      logger.warn("Agent returned mismatched item count; padding/truncating", {
        got: object.items.length,
        expected: input.items.length,
      });
      const fixed = input.items.map(
        (it, i) => object.items[i] ?? { premiumDescription: it.description ?? it.name },
      );
      return { ...object, items: fixed };
    }

    return object;
  },
});
