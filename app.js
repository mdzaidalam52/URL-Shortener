const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const validUrl = require("valid-url");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/urlDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Url = mongoose.model("Url", {
  url: String,
  shortened: String,
});

app.get("/", function (req, res) {
  res.render("index", {
    bool: false,
    short: "",
  });
});

app.post("/", function (req, res) {
  const full = req.body.url;

  if (validUrl.isUri(full)) {
    Url.find({ url: full }, function (err, response) {
      if (response.length == 0) {
        var shortened = makeNewUrl(full);
      } else {
        var shortened = response[0].shortened;
      }
      res.render("index", {
        bool: true,
        short: "The shortened url is " + "https://cryptic-waters-74246.herokuapp.com/" + shortened,
      });
    });
  } else {
    res.render("index", {
      bool: false,
      short: "This is an invalid url",
    });
  }
});

app.get("/:u", function (req, res) {
  var url = req.params.u;

  Url.find({ shortened: url }, function (err, doc) {
    if (doc.length == 1) {
      var full = doc[0].url;
      res.redirect(full);
    } else {
      res.sendStatus(404);
    }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000");
});

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function makeNewUrl(full) {
  var a = 0,
    k = 0;
  var short;
  while (a == 0) {
    short = makeid(5);
    console.log(short);
    Url.find({ shortened: short }, function (err, doc) {
      k = doc.length;
    });
    if (k == 0) {
      const u = new Url({
        url: full,
        shortened: short,
      });
      u.save();
      console.log("Saved data successfully");
      a = 1;
    }
  }
  return short;
}
