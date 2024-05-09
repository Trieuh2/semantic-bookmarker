import Redis from "ioredis";
import * as dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS ? {} : undefined,
});

export default redis;
