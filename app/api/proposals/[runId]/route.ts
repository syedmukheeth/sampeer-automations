import { getProposalRun } from "@features/business-os/proposal-generator/api/handlers";

/** GET /api/proposals/:runId — delegates to the Proposal Generator feature. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;
  return getProposalRun(runId);
}
