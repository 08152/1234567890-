const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);

        const randomName =
            crypto.randomBytes(20).toString("hex") +
            extension;

        cb(null, randomName);
    }
});

const upload = multer({
    storage: storage,

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


/*
    Startseite
*/

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );
});


/*
    Bilder öffentlich machen
*/

app.use(
    "/images",
    express.static(uploadFolder)
);


/*
    Upload
*/

app.post(
    "/upload",
    upload.single("image"),

    (req, res) => {

        if (!req.file) {

            return res.status(400).json({
                error: "Kein Bild ausgewählt."
            });
        }

        const imageLink =
            `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;

        res.json({
            success: true,
            link: imageLink
        });
    }
);


/*
    Fehler
*/

app.use((error, req, res, next) => {

    res.status(400).json({
        error:
            error.message ||
            "Upload fehlgeschlagen."
    });
});


app.listen(PORT, () => {

    console.log(
        `Server läuft auf Port ${PORT}`
    );

});
