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

const URLModel = mongoose.model("URLModel", urlSchema);

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  var url1 = decodeURIComponent(req.body.url);
  var url = new URL(url1).hostname;
  console.log(url);
  dns.lookup(url, function (err) {
    if (err) {
      console.error(err);
      res.json({ error: "invalid url" });
    } else {
      const urlId = shortid.generate();
      URLModel.findOne({ original_url: url1 })
        .then((data) => {
          if (!data) {
            let urlObj = new URLModel({
              original_url: url1,
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
  URLModel.findOne({ hash: req.params.hash }).then((data) => {
    var url1 = data.original_url;
    var dnsUrl = new URL(url1).hostname;
    dns.lookup(dnsUrl, function (err) {
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
