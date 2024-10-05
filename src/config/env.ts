import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, "../../.env") });

export const PORT = process.env.PORT;
