require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
var crypto = require("crypto");
var dns = require("dns");
const shortid = require("shortid");
const bodyParser = require("body-parser");
const mware = bodyParser.urlencoded({ extended: false });
let mongoose = require("mongoose");
console.log(process.env.MONGO_URI);
mongoose.connect('mongodb+srv://gandhidhyani:Mongoose-2024@mongoosecluster.5ftk1sz.mongodb.net/test?retryWrites=true&w=majority');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(mware);

//console.log(mongoose.connection.readyState);
const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: String,
  hash: String,
});

const URL = mongoose.model("URL", urlSchema);

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  var url = decodeURIComponent(req.body.url);
  console.log(url);
  dns.lookup(url, function (err) {
    if (err) {
      res.json({ error: "invalid url" });
    } else {
      const urlId = shortid.generate();
      URL.findOne({ original_url: url })
        .then((data) => {
          if (!data) {
            let urlObj = new URL({
              original_url: url,
              hash: urlId,
            });
            urlObj.save();
            res.json({
              original_url: urlObj.original_url,
              short_url: urlObj.hash,
            });
          } else {
            res.json({ original_url: data.original_url, short_url: data.hash });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});

app.get("/api/shorturl/:hash", function (req, res) {
  URL.findOne({ hash: req.params.hash }).then((data) => {
    dns.lookup(data.original_url, function (err) {
      if (err) {
        res.json({ error: "invalid url" });
      } else {
        res.redirect(data.original_url);
      }
    });
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
