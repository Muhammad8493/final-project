"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialsProvider = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class CredentialsProvider {
    collection;
    constructor(mongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection(COLLECTION_NAME);
    }
    async registerUser(username, plaintextPassword) {
        const existingUser = await this.collection.findOne({ username });
        if (existingUser) {
            return false;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(plaintextPassword, salt);
        await this.collection.insertOne({
            username,
            password: hashedPassword,
        });
        return true;
    }
    async verifyPassword(username, plaintextPassword) {
        const user = await this.collection.findOne({ username });
        if (!user) {
            return false;
        }
        return bcryptjs_1.default.compare(plaintextPassword, user.password);
    }
}
exports.CredentialsProvider = CredentialsProvider;
