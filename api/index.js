import "dotenv/config";
import { app } from "./src/app.js";

// Vercel Serverless Function entry point. Exporting the Express app directly
// works because Express apps are callable as `(req, res) => void`, which is
// exactly the signature the Node.js runtime expects. vercel.json rewrites
// every /api/* request to this function, and Express's own router (mounted
// in src/app.js) handles the sub-paths.
export default app;
