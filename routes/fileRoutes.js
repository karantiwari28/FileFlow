const express = require("express");
const multer = require("multer");
const axios = require("axios");
const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// TinyURL API details
const TINYURL_API_KEY = "dUWjaC5V462AkhS7WdnL4NhRhEZvPGPbGFVG8TZNLqRgylL0x0Ym3plkam69";
const TINYURL_API_ENDPOINT = "https://api.tinyurl.com/create";

// Home page route
router.get("/", (req, res) => {
    res.render("index");
});

// Upload page route
router.get("/upload", (req, res) => {
    res.render("upload", { link: null });
});

// Handle file upload and URL shortening
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        const filePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

        // Create shortened URL using TinyURL API
        const response = await axios.post(
            TINYURL_API_ENDPOINT,
            {
                url: filePath,
                domain: "tiny.one", // TinyURL's default domain
            },
            {
                headers: {
                    Authorization: `Bearer ${TINYURL_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const shortUrl = response.data.data.tiny_url;

        // Render upload page with link
        res.render("upload", { link: shortUrl });
    } catch (error) {
        console.error("Error generating short URL:", error);
        res.status(500).send("Error generating download link.");
    }
});

// Download page route
router.get("/download", (req, res) => {
    // You can pass the download link dynamically if required
    const downloadLink = req.query.link || ""; // Example: Get link from query params
    res.render("download", { downloadLink });
});

module.exports = router;
