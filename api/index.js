import "dotenv/config";
import { app } from "../server/src/app.js";

// Vercel Serverless Function entry point. Exporting the Express app directly
// works because Express apps are callable as `(req, res) => void`, which is
// exactly the signature the Node.js runtime expects. vercel.json rewrites
// every /api/* request to this function, and Express's own router (mounted
// in server/src/app.js) handles the sub-paths.
//
// This is the ONLY file inside /api: Vercel's Hobby plan treats every .js
// file under /api as a separate Serverless Function (capped at 12 total),
// so app code lives in ../server instead and is just imported here.
export default app;
