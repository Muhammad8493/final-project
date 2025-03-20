"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageProvider = void 0;
const mongodb_1 = require("mongodb");
class ImageProvider {
    mongoClient;
    imageCollection;
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const db = this.mongoClient.db();
        const imageCollectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!imageCollectionName) {
            throw new Error("Missing collection names from environment variables");
        }
        this.imageCollection = db.collection(imageCollectionName);
    }
    // Accept an optional query and sort options
    async getAllImages(query = {}, sort = {}) {
        const images = await this.imageCollection.find(query).sort(sort).toArray();
        return images.map(img => ({
            ...img,
            _id: img._id.toString(),
        }));
    }
    async getImagesByUsername(username) {
        const images = await this.imageCollection.find({ username }).toArray();
        return images.map(img => ({
            ...img,
            _id: img._id.toString(),
        }));
    }
    async getImageById(imageId) {
        const objectId = new mongodb_1.ObjectId(imageId);
        return this.imageCollection.findOne({ _id: objectId });
    }
    async createImage(imageData) {
        const result = await this.imageCollection.insertOne({
            ...imageData,
            downloads: 0,
        });
        return {
            ...imageData,
            _id: result.insertedId.toString(),
            downloads: 0,
        };
    }
    async deleteImage(imageId) {
        const objectId = new mongodb_1.ObjectId(imageId);
        const result = await this.imageCollection.deleteOne({ _id: objectId });
        return result.deletedCount > 0;
    }
    async updateImageTags(imageId, newTags) {
        try {
            const objectId = new mongodb_1.ObjectId(imageId);
            const result = await this.imageCollection.updateOne({ _id: objectId }, { $set: { tags: newTags } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            console.error("Error updating image tags:", error);
            return false;
        }
    }
    async incrementDownloads(imageId, increment) {
        try {
            const objectId = new mongodb_1.ObjectId(imageId);
            const result = await this.imageCollection.updateOne({ _id: objectId }, { $inc: { downloads: increment } });
            return result.modifiedCount > 0;
        }
        catch (error) {
            console.error("Error incrementing downloads:", error);
            return false;
        }
    }
}
exports.ImageProvider = ImageProvider;
