#!/usr/bin/env node
const { Queue } = require('bullmq');
require('dotenv').config();

const jobId = process.argv[2];
if (!jobId) {
  console.error('Usage: node scripts/reenqueue_video.js <jobId>');
  process.exit(2);
}

const host = process.env.REDIS_HOST || '127.0.0.1';
const port = parseInt(process.env.REDIS_PORT || '6379', 10);
const password = process.env.REDIS_PASSWORD || undefined;

const connection = {
  host,
  port,
  ...(password ? { password } : {}),
};

const queue = new Queue('video-generation', { connection });

(async () => {
  try {
    await queue.add('create', { jobId }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
    console.log(`Enqueued video job for ${jobId}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to enqueue job:', err);
    process.exit(1);
  }
})();
