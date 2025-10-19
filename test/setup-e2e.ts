import { config } from 'dotenv';
import { resolve } from 'path';

// Load test environment variables
config({ path: resolve(__dirname, '../.env.test'), quiet: true });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
