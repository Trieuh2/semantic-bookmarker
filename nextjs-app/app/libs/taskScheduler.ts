import "module-alias/register";
import processBatchUpdates from "./batchProcessor";

// Set up the function to run at a scheduled interval
function setupIntervalJobs() {
  console.log("Setting up interval jobs...");

  // Schedule the batch processing to run every second
  setInterval(async () => {
    await processBatchUpdates();
  }, 1000);
}

setupIntervalJobs();
