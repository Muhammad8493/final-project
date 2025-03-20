import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import { MongoClient } from "mongodb";
import { CredentialsProvider } from "../providers/CredentialsProvider";
import jwt from "jsonwebtoken";

const signatureKey = process.env.JWT_SECRET;
if (!signatureKey) {
    throw new Error("Missing JWT_SECRET from env file");
}

function generateAuthToken(username: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(
            { username },
            signatureKey!,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

export function registerAuthRoutes(app: express.Application, mongoClient: MongoClient) {
    const credentialsProvider = new CredentialsProvider(mongoClient);

    app.post("/auth/register", async (req: Request, res: Response): Promise<void> => {
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
        } catch (error) {
            console.error("Error in /auth/register:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
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
        } catch (error) {
            console.error("Error in /auth/login:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
}

export function verifyAuthToken(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).end();
        return;
    }

    jwt.verify(token, signatureKey!, (error, decoded) => {
        if (error) {
            res.status(403).end();
        } else {
            res.locals.token = decoded;
            next();
        }
    });
}
