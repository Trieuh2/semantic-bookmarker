import "module-alias/register";
import processBatchUpdates from "./batchProcessor";
import redis from "./redis";

async function setupIntervalJobs() {
  console.log("Setting up interval jobs...");

  setInterval(async () => {
    const lock = await redis.set(
      "lock:processBatchUpdates",
      "true",
      "EX",
      10,
      "NX"
    );
    if (lock) {
      try {
        await processBatchUpdates();
      } finally {
        await redis.del("lock:processBatchUpdates");
      }
    } else {
      console.log("Process is already running.");
    }
  }, 1000); // Runs every second, but ensures no overlap
}

setupIntervalJobs();
