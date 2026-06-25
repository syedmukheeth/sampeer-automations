import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  // Replace with your project ref from the Trigger.dev dashboard (proj_...)
  project: "proj_riwwwudaoobdfynosfrd",
  // Each automation registers its own trigger folder here. Keeping this list
  // explicit (rather than scanning all of ./features) avoids the indexer
  // touching client `.tsx` components and keeps worker builds fast.
  dirs: [
    "./features/business-os/invoice-generator/trigger",
    "./features/business-os/proposal-generator/trigger",
    "./features/business-os/expense-tracker/trigger",
  ],
  maxDuration: 300,
  machine: "small-2x", // headroom for @react-pdf/renderer font embedding
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
});
