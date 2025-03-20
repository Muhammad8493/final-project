import dotenv from "dotenv";
import express from "express";
import path from "path";
import { MongoClient } from "mongodb";
import { registerImageRoutes } from "./routes/images";
import { registerAuthRoutes, verifyAuthToken } from "./routes/auth";

dotenv.config();

const PORT = process.env.PORT || 3000;
const staticDir = process.env.STATIC_DIR || "public";

const app = express();
app.use(express.static(staticDir));
app.use(express.json());
app.use("/uploads", express.static(process.env.IMAGE_UPLOAD_DIR || "uploads"));

async function setUpServer() {
    const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME } = process.env;

    if (!MONGO_USER || !MONGO_PWD || !MONGO_CLUSTER || !DB_NAME) {
        throw new Error("Missing required environment variables");
    }

    const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;
    console.log("Attempting Mongo connection...");

    try {
        const mongoClient = await MongoClient.connect(connectionString);
        console.log("Connected to MongoDB successfully");

        registerAuthRoutes(app, mongoClient);
        registerImageRoutes(app, mongoClient);
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

(async () => {
    await setUpServer();
})();
