import express, { Request, Response } from "express";
import { MongoClient, Sort, ObjectId } from "mongodb";
import { ImageProvider } from "../providers/ImageProvider";
import { verifyAuthToken } from "./auth";
import { imageMiddlewareFactory, handleImageFileErrors } from "../middleware/imageUploadMiddleware";

export function registerImageRoutes(app: express.Application, mongoClient: MongoClient) {
    const imageProvider = new ImageProvider(mongoClient);

  // GET /api/images with filtering and sorting
  app.get("/api/images", async (req: Request, res: Response) => {
    try {
      let query: any = {};
      let sort: { [key: string]: 1 | -1 } = {};
  
      // Tags filter (case-insensitive)
      if (req.query.tags) {
        const tags = (req.query.tags as string)
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0)
          .map(t => new RegExp(`^${t}$`, 'i'));
        if (tags.length > 0) {
          query.tags = { $all: tags };
        }
      }
  
      // Date filter
      if (req.query.dateFilter) {
        const dateFilter = req.query.dateFilter as string;
        const now = new Date();
        if (dateFilter === "Today") {
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          query.dateUploaded = { $gte: start.toISOString() };
        } else if (dateFilter === "Last Week") {
          const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          query.dateUploaded = { $gte: start.toISOString() };
        } else if (dateFilter === "Last Month") {
          const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          query.dateUploaded = { $gte: start.toISOString() };
        } else if (dateFilter === "Last Year") {
          const start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          query.dateUploaded = { $gte: start.toISOString() };
        } else if (dateFilter === "Oldest") {
          sort.dateUploaded = 1;
        } else if (dateFilter === "Newest") {
          sort.dateUploaded = -1;
        }
      }
  
      // Size filter (using new thresholds)
      if (req.query.sizeFilter) {
        const sizeFilter = req.query.sizeFilter as string;
        if (sizeFilter === "Smallest") {
          sort.imageSize = 1;
        } else if (sizeFilter === "Largest") {
          sort.imageSize = -1;
        } else if (sizeFilter === "< 250kb") {
          query.imageSize = { $lt: 250 };
        } else if (sizeFilter === "< 500kb") {
          query.imageSize = { $lt: 500 };
        } else if (sizeFilter === "< 750kb") {
          query.imageSize = { $lt: 750 };
        }
      }
  
      // Downloads filter
      if (req.query.downloadFilter) {
        const downloadFilter = req.query.downloadFilter as string;
        if (downloadFilter === "Least ↓") {
          sort.downloads = 1;
        } else if (downloadFilter === "Most ↓") {
          sort.downloads = -1;
        }
      }
  
      const images = await imageProvider.getAllImages(query, sort);
      res.json(images);
    } catch (error) {
      console.error("Error fetching images:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  
      

    app.get("/api/images/author/:username", async (req: Request, res: Response): Promise<void> => {
        try {
            const username = req.params.username;
            if (!username) {
                res.status(400).json({ error: "Bad Request", message: "Missing username parameter" });
                return;
            }
            const userImages = await imageProvider.getImagesByUsername(username);
            res.json(userImages);
        } catch (error) {
            console.error("Error fetching user's images:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.patch("/api/images/:id/tags", verifyAuthToken, async (req, res): Promise<void> => {
        try {
          const imageId = req.params.id;
          const { tags } = req.body;
          const authUsername = res.locals.token.username;
      
          if (!Array.isArray(tags) || tags.length > 5 || tags.some((tag: string) => tag.length > 10)) {
            res.status(400).json({ error: "Invalid tags", message: "Up to 5 tags, each max 10 chars" });
            return;
          }
      
          const image = await imageProvider.getImageById(imageId);
          if (!image) {
            res.status(404).json({ error: "Image not found" });
            return;
          }
      
          if (image.username !== authUsername) {
            res.status(403).json({ error: "Unauthorized", message: "You can only edit your own images" });
            return;
          }
      
          const success = await imageProvider.updateImageTags(imageId, tags);
          if (!success) {
            res.status(500).json({ error: "Failed to update tags" });
            return;
          }
      
          res.status(200).json({ success: true, tags });
        } catch (error) {
          console.error("Error updating tags:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.patch("/api/images/:id/download", async (req: Request, res: Response): Promise<void> => {
        try {
          const imageId = req.params.id;
          const increment = req.body.increment ? Number(req.body.increment) : 1;
          const success = await imageProvider.incrementDownloads(imageId, increment);
          if (!success) {
            res.status(500).json({ error: "Failed to update download count" });
            return;
          }
          res.status(200).json({ success: true });
        } catch (error) {
          console.error("Error updating download count:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      });

      

    app.get("/api/images/:id", async (req: Request, res: Response): Promise<void>  => {
        try {
            const image = await imageProvider.getImageById(req.params.id);
            if (!image) {
                res.status(404).json({ error: "Image not found" });
                return;
            }
            res.json(image);
        } catch (error) {
            console.error("Error fetching image:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.post(
        "/api/images",
        verifyAuthToken,
        imageMiddlewareFactory.single("image"),
        handleImageFileErrors,
        async (req: Request, res: Response): Promise<void> => {
            try {
                if (!req.file || !req.body.name) {
                    res.status(400).json({ error: "Bad Request", message: "Missing file or name" });
                    return;
                }
    
                const username = res.locals.token.username;
                const newImage = {
                    src: `/uploads/${req.file.filename}`,
                    name: req.body.name,
                    username,
                    tags: req.body.tags ? req.body.tags.split(",").slice(0, 5) : [],
                    downloads: 0,
                    dateUploaded: new Date().toISOString(),
                    imageSize: Math.round(req.file.size / 1024),
                };
    
                const createdImage = await imageProvider.createImage(newImage);
                res.status(201).json(createdImage);
            } catch (error) {
                console.error("Error handling image upload:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    );
    
    app.delete(
        "/api/images/:id",
        verifyAuthToken,
        async (req: Request, res: Response): Promise<void> => {
            try {
                const authUsername = res.locals.token.username;
                const imageId = req.params.id;
                const image = await imageProvider.getImageById(imageId);
                if (!image) {
                    res.status(404).json({ error: "Not Found", message: "Image not found" });
                    return;
                }
                if (image.username !== authUsername) {
                    res.status(403).json({ error: "Forbidden", message: "You can only delete your own images" });
                    return;
                }
                const success = await imageProvider.deleteImage(imageId);
                if (!success) {
                    res.status(500).json({ error: "Internal Server Error", message: "Failed to delete image" });
                    return;
                }
                res.status(204).end();
            } catch (error) {
                console.error("Error deleting image:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    );

    
}
