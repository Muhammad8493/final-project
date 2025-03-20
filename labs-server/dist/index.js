"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const images_1 = require("./routes/images");
const auth_1 = require("./routes/auth");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const staticDir = process.env.STATIC_DIR || "public";
const app = (0, express_1.default)();
app.use(express_1.default.static(staticDir));
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(process.env.IMAGE_UPLOAD_DIR || "uploads"));
async function setUpServer() {
    const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME } = process.env;
    if (!MONGO_USER || !MONGO_PWD || !MONGO_CLUSTER || !DB_NAME) {
        throw new Error("Missing required environment variables");
    }
    const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;
    console.log("Attempting Mongo connection...");
    try {
        const mongoClient = await mongodb_1.MongoClient.connect(connectionString);
        console.log("Connected to MongoDB successfully");
        (0, auth_1.registerAuthRoutes)(app, mongoClient);
        (0, images_1.registerImageRoutes)(app, mongoClient);
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
    }
}
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
(async () => {
    await setUpServer();
})();
