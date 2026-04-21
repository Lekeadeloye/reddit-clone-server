import express from "express";
import {env} from './config/env.js'
import morgan from "morgan";
import cors from 'cors'
import postsRouter from "./routes/posts.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Cors
app.use(cors())

// Logging
app.use(morgan('dev'))

// Routes
app.use('/posts', postsRouter);
app.get("/", (req, res) => {
  res.json({ message: "Reddit Clone API Server" });
});

// Error Handling Example
app.use((error, req, res, next) => {
  console.log(error.stack);
  const status = error.status || 500;
  res.status(status).send(error.message)
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
