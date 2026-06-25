import { triggerProposal } from "@features/business-os/proposal-generator/api/handlers";

/** POST /api/proposals — delegates to the Proposal Generator feature. */
export function POST(req: Request) {
  return triggerProposal(req);
}
