const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

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
const multerUpload = multer({ // middleware for audio file upload
    storage: storage
});
app.use(express.urlencoded({ extended: false })); // middleware for other form options

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (request, response) => {
    response.render("index", {
        summary: null,
        important_dates: null,
        transcript: null
    });

});

app.post("/run", multerUpload.single("file"), async (request, response) => {
    
    let file = request.file;
    console.log(`Handling file: ${file.filename} at path ${file.path}`);

    // fetch user chosen options
    let audio_type = request.body.audio_type;
    let language = request.body.language;
    let whisper_model = request.body.whisper_model;
    let gpt_model = request.body.gpt_model;
    let api_key = request.body.api_key;
    if (whisper_model != "large" && language == "English") {
        whisper_model = `${whisper_model}.en`;
    } 

    
    const { stdout, stderr } = await exec(`python3 transcription_service.py ${file.path} ${whisper_model}`);
    let transcript = stdout;
    console.log(transcript);

    fs.unlink(file.path, (error) => {
        console.log(error);
    })

    // exec(`python3 transcription_service.py ${file.path}`, (error, stdout, stderr) => {
    //     if (error || stderr) {
    //         error ? console.log(error) : console.log(stderr);
    //     }
    //     console.log(stdout);
    //     transcript = stdout;

    //     fs.unlink(file.path, (error) => {
    //         console.log(error);
    //     })
    // })


    

    return response.render("index", {
        summary: "1",
        important_dates: "2",
        transcript: transcript
    });
});

app.listen(3000, () => {
    console.log("App is up: http://localhost:3000");
});