var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
// db = require("./models");
var PORT = 3000;

//initialize express
var app = express();

//Use morgan logger 
app.use(logger("dev"));

//Pare request body JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Make public a static folder
app.use(express.static("public"));

//connect to mongo db
mongoose.connect("mongodb://localhost/scraperdb", { useNewUrlParser: true });


//Routes
app.get("/scrape", function (req, res) {
    axios.get("https://carbuzz.com/news/").then(function (response) {
        //Load to cheerio
        var $ = cheerio.load(response.data);
        console.log($)
        $(".feed-item").each((i, element) => {
            result = {};
            result.title = $(element).children().children("div.cb-post-preview__right").find("a").text()
            result.link = $(element).children().children("div.cb-post-preview__image").find("img").attr("src");
            result.summary = $(element).children().children("div.cb-post-preview__right").find("div.cb-post-preview__subtitle").text();
            console.log(title, link, summary);

         
        })
    })
});



app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});