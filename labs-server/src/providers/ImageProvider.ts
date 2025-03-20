import { Collection, MongoClient, ObjectId, Sort } from "mongodb";

interface Image {
    _id: string | ObjectId;
    src: string;
    name: string;
    username: string;
    tags: string[];
    downloads: number;
    dateUploaded: string;
    imageSize: number;
}

export class ImageProvider {
    private imageCollection: Collection<Image>;

    constructor(private readonly mongoClient: MongoClient) {
        const db = this.mongoClient.db();
        const imageCollectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!imageCollectionName) {
            throw new Error("Missing collection names from environment variables");
        }
        this.imageCollection = db.collection<Image>(imageCollectionName);
    }

    // Accept an optional query and sort options
    async getAllImages(query: object = {}, sort: Sort = {}): Promise<Image[]> {
        const images = await this.imageCollection.find(query).sort(sort).toArray();
        return images.map(img => ({
          ...img,
          _id: img._id.toString(),
        }));
    }

    async getImagesByUsername(username: string): Promise<Image[]> {
        const images = await this.imageCollection.find({ username }).toArray();
        return images.map(img => ({
            ...img,
            _id: img._id.toString(),
        }));
    }

    async getImageById(imageId: string): Promise<Image | null> {
        const objectId = new ObjectId(imageId);
        return this.imageCollection.findOne({ _id: objectId });
    }

    
    async createImage(imageData: Omit<Image, "_id">): Promise<Image> {
        const result = await this.imageCollection.insertOne({
            ...imageData,
            downloads: 0,
        } as unknown as Image);
        return {
            ...imageData,
            _id: result.insertedId.toString(),
            downloads: 0,
        };
    }

    async deleteImage(imageId: string): Promise<boolean> {
        const objectId = new ObjectId(imageId);
        const result = await this.imageCollection.deleteOne({ _id: objectId });
        return result.deletedCount > 0;
    }

    async updateImageTags(imageId: string, newTags: string[]): Promise<boolean> {
        try {
            const objectId = new ObjectId(imageId);
            const result = await this.imageCollection.updateOne(
                { _id: objectId },
                { $set: { tags: newTags } }
            );
            return result.modifiedCount > 0;
        } catch (error) {
            console.error("Error updating image tags:", error);
            return false;
        }
    }


    async incrementDownloads(imageId: string, increment: number): Promise<boolean> {
        try {
          const objectId = new ObjectId(imageId);
          const result = await this.imageCollection.updateOne(
            { _id: objectId },
            { $inc: { downloads: increment } }
          );
          return result.modifiedCount > 0;
        } catch (error) {
          console.error("Error incrementing downloads:", error);
          return false;
        }
    }
      
}
