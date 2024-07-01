const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const { summarize } = require("./summarization_service.js");

const UPLOAD_EXTENSIONS = ['m4a','mp3','webm','mp4','mpga','wav','mpeg'];

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
        transcript: null,
        error: null,
        run: false
    });

});

app.post("/run", multerUpload.single("file"), async (request, response) => {
    
    let file = request.file;
    // check file extension
    let fileNameArr = file.filename.split(".");
    let fileExtension = fileNameArr[fileNameArr.length - 1];
    console.log(`File extension: ${fileExtension}`);
   

    // fetch user chosen options
    let audio_type = request.body.audio_type;
    let language = request.body.language;
    let whisper_model = request.body.whisper_model;
    let gpt_model = request.body.gpt_model;
    let api_key = request.body.api_key;
    if (whisper_model != "large" && language == "English") {
        whisper_model = `${whisper_model}.en`;
    } 

    // output variables
    let summary = null;
    let important_dates = null;
    let transcript = null;
    let error = null;

    // creates transcript
    if (UPLOAD_EXTENSIONS.includes(fileExtension)) {
        console.log(`Transcribing file: ${file.filename} at path ${file.path}`);
        const { stdout, stderr } = await exec(`python3 transcription_service.py ${file.path} ${whisper_model}`);
        transcript = stdout;
        console.log(transcript);

        fs.unlink(file.path, (error) => {
            console.log(error);
        });
    } else {
        fs.unlink(file.path, (error) => {
            console.log(error);
        });
        return response.render("index", {
            summary: null,
            important_dates: null,
            transcript: null,
            error: "File type not supported. Please select one of: .m4a .mp3 .webm .mp4 .mpga .wav .mpeg",
            run: true
        });
    }

    // summarizes transcript as nessesary 

    try {
        if (audio_type != "transcript only") {
            summary = await summarize(transcript, gpt_model, api_key, "summarize");
            if (audio_type != "other") {
                important_dates = await summarize(transcript, gpt_model, api_key, audio_type);
            }        
        }
    } catch (error) {
        return response.render("index", {
            summary: null,
            important_dates: null,
            transcript: transcript,
            error: error.message,
            run: true
        });
    }

    


    

    return response.render("index", {
        summary: summary,
        important_dates: important_dates,
        transcript: transcript,
        error: null,
        run: true
    });
});

app.listen(3000, () => {
    console.log("App is up: http://localhost:3000");
});