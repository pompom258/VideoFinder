import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();
const app = express();

const PORT = process.env.PORT;
console.log(PORT);
