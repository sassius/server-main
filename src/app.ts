import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";


import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/v1", routes);

//serve audio files 
app.use("/audio", express.static(path.join(process.cwd(), "public/audio")));

// Error handler
app.use(errorHandler);

export default app;
