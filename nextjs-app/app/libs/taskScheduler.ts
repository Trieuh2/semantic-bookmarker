import "module-alias/register";
import processBatchUpdates from "./batchProcessor";
import redis from "./redis";

async function setupIntervalJobs() {
  console.log("Setting up interval jobs...");

  const runProcess = async () => {
    const lock = await redis.set(
      "lock:processBatchUpdates",
      "true",
      "EX",
      10,
      "NX"
    );

    if (lock) {
      let lockExtender: NodeJS.Timeout | null = null;

      try {
        // Function to extend the lock duration if batch still processing
        const extendLock = async () => {
          const result = await redis.expire("lock:processBatchUpdates", 10);
          if (result === 0) {
            throw new Error("Failed to extend lock.");
          }
        };

        // Periodically extend lock every 0.5s
        lockExtender = setInterval(async () => {
          try {
            await extendLock();
          } catch (error) {
            console.error("Failed to extend lock:", error);
          }
        }, 500);

        await processBatchUpdates();
      } catch (error) {
        console.error("Error during batch update processing:", error);
      } finally {
        if (lockExtender) {
          clearInterval(lockExtender);
        }
        await redis.del("lock:processBatchUpdates");
      }
    } else {
      console.log("Process is already running.");
    }
    // Schedule the next run
    setTimeout(runProcess, 1000); // Runs every second
  };
  runProcess();
}

setupIntervalJobs();
