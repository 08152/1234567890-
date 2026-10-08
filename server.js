const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const filename =
      crypto.randomBytes(16).toString("hex") + extension;

    cb(null, filename);
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
      cb(new Error("Nur Bilder sind erlaubt."));
    }
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/images",
  express.static(uploadDir)
);

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "Kein Bild hochgeladen."
    });
  }

  const baseUrl =
    `${req.protocol}://${req.get("host")}`;

  const imageUrl =
    `${baseUrl}/images/${encodeURIComponent(req.file.filename)}`;

  res.json({
    success: true,
    imageUrl: imageUrl
  });
});

app.use((err, req, res, next) => {
  res.status(400).json({
    error: err.message || "Upload fehlgeschlagen."
  });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
