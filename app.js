const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const timeStamp = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, timeStamp + "-" + file.originalname);
    }
})
const upload = multer({
    storage: storage
});

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (request, response) => {
    response.render("index", {
        summary: null,
        important_dates: null,
        transcript: null
    });

})

app.post("/run", upload.single("file"), (request, response) => {
    response.render("index", {
        summary: "1",
        important_dates: "2",
        transcript: "3"
    });
    let file = request.file;
    console.log(`Handled file: ${file.filename} at path ${file.path}`);

    fs.unlink(file.path, (err) => {
        if (err) {
            return response.status(500).send("Failed to delete file after processing");
        }
    })
    
})

app.listen(3000, () => {
    console.log("App is up: http://localhost:3000");
})