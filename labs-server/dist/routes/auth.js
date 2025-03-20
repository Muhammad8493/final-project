"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthRoutes = registerAuthRoutes;
exports.verifyAuthToken = verifyAuthToken;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const CredentialsProvider_1 = require("../providers/CredentialsProvider");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signatureKey = process.env.JWT_SECRET;
if (!signatureKey) {
    throw new Error("Missing JWT_SECRET from env file");
}
function generateAuthToken(username) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign({ username }, signatureKey, { expiresIn: "1d" }, (error, token) => {
            if (error)
                reject(error);
            else
                resolve(token);
        });
    });
}
function registerAuthRoutes(app, mongoClient) {
    const credentialsProvider = new CredentialsProvider_1.CredentialsProvider(mongoClient);
    app.post("/auth/register", async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                res.status(400).json({ error: "Bad request", message: "Missing username or password" });
                return;
            }
            const success = await credentialsProvider.registerUser(username, password);
            if (!success) {
                res.status(400).json({ error: "Bad request", message: "Username already taken" });
                return;
            }
            const token = await generateAuthToken(username);
            res.status(201).json({ token });
        }
        catch (error) {
            console.error("Error in /auth/register:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
    app.post("/auth/login", async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                res.status(400).json({ error: "Bad request", message: "Missing username or password" });
                return;
            }
            const validUser = await credentialsProvider.verifyPassword(username, password);
            if (!validUser) {
                res.status(401).json({ error: "Unauthorized", message: "Incorrect username or password" });
                return;
            }
            const token = await generateAuthToken(username);
            res.json({ token });
        }
        catch (error) {
            console.error("Error in /auth/login:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
}
function verifyAuthToken(req, res, next) {
    const authHeader = req.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).end();
        return;
    }
    jsonwebtoken_1.default.verify(token, signatureKey, (error, decoded) => {
        if (error) {
            res.status(403).end();
        }
        else {
            res.locals.token = decoded;
            next();
        }
    });
}
