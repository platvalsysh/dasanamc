import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// console.log("process.cwd:", process.cwd());

let currentDir = __dirname;
let found = false;

while (true) {
  const envPath = path.join(currentDir, ".env");
  // console.log("envPath:", envPath);
  if (fs.existsSync(envPath)) {
    console.log("Found .env at:", envPath);
    dotenv.config({ path: envPath });
    found = true;
    break;
  }
  const parentDir = path.dirname(currentDir);
  if (parentDir === currentDir) {
    break;
  }
  currentDir = parentDir;
}

if (!found) {
  console.warn("Could not find .env file in parent directories");
}

export const DATABASE_URL = process.env.DATABASE_URL;
export const DIRECT_URL = process.env.DIRECT_URL;
export const NODE_ENV = process.env.NODE_ENV;
export const PORT = process.env.PORT;

export const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
