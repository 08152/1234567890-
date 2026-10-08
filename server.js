const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const uploads = path.join(__dirname, "uploads");

if (!fs.existsSync(uploads)) {
    fs.mkdirSync(uploads);
}

const storage = multer.diskStorage({
    destination: uploads,

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = crypto.randomBytes(16).toString("hex");

        cb(null, name + ext);
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Nur Bilder erlaubt."));
        }
    }
});

// index.html aus demselben Ordner
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Bilder öffentlich erreichbar machen
app.use("/images", express.static(uploads));

// Upload
app.post("/upload", upload.single("image"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            error: "Kein Bild ausgewählt."
        });
    }

    const imageUrl =
        `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;

    res.json({
        success: true,
        url: imageUrl
    });
});

app.use((err, req, res, next) => {
    res.status(400).json({
        error: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
