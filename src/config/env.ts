import path from "path";
import dotenv from "dotenv";
import { __dirname } from "./constants.js";

dotenv.config({ path: path.join(__dirname, "../../.env") });

export const PORT = process.env.PORT;
