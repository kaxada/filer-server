const path = require("path");
const express = require("express");
const multer = require("multer");
const File = require("../model/file.model");
const Router = express.Router();
const GridFsStorage = require("multer-gridfs-storage")

const storage = new GridFsStorage({
  url: "mongodb+srv://ekaxada:9h9qtHj8AeahCac@cluster0.etx8o.mongodb.net/ekaxada?retryWrites=true&w=majority",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, res) => {
    
  }
})

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "https://drive.google.com/drive/folders/1gOGLiOdfGJUtmh478-fs0yD0Tllo8Gnx?usp=sharing");
    },
    filename(req, file, cb) {
      cb(null, `${new Date().getTime()}_${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 100000000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png|pdf|doc|docx|xlsx|xls)$/)) {
      return cb(
        new Error(
          "only upload files with jpg, jpeg, png, pdf, doc, docx, xslx, xls format."
        )
      );
    }
    cb(undefined, true); //continue processing and uploading
  },
});

Router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const { path, mimetype } = req.file;
    const file = new File({
      title,
      description,
      file_path: path,
      file_mimetype: mimetype,
    });
    await file.save();
    res.send("file uploaded succesfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

Router.get("/getAllFiles", async (req, res) => {
  try {
    const files = await File.find({});
    const sortedByCreationDate = files.sort(
      (a, b) => b.createdAt - a.createdAt
    );
    res.send(sortedByCreationDate);
  } catch (error) {
    res
      .status(400)
      .send("Error while getting the list of files. Try again later.");
  }
});

Router.get("/download:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    res.set({
      "Content-Type": file.file_mimetype,
    });
    res.sendFile(path.join(__dirname, file.file_path));
  } catch (error) {
    res.status(400).send("Error while downloading the file. Try again later");
  }
});

module.exports = Router;
