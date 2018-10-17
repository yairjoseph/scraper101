var express = require("express");
var hbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
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

// Set view engine
app.engine('hbs', hbs({ defaultLayout: "main", extname: ".hbs" }));
app.set('view engine', 'hbs');

//connect to mongo db
mongoose.connect("mongodb://localhost/scraperdb", { useNewUrlParser: true });


//Routes

app.get("/", (req, res) => {
    db.Article.find({})
        .then(dbArticle => {
            console.log(dbArticle)
            res.render("index", {dbArticle});
        })
        .catch(err => {
            res.json(err);
        });
})

app.get("/scrape", function (req, res) {
    axios.get("https://carbuzz.com/news/").then(function (response) {
        //Load to cheerio
        var $ = cheerio.load(response.data);
        console.log($)
        $(".feed-item").each((i, element) => {
            var result = {};
            result.title = $(element).children().children("div.cb-post-preview__right").find("a").text();
            result.link = $(element).children().children("div.cb-post-preview__image").find("img").attr("src");
            result.summary = $(element).children().children("div.cb-post-preview__right").find("div.cb-post-preview__subtitle").text();
            console.log(result);

            // console.log(db)
            // console.log(Article)
            db.Article.create(result)
                .then(dbArticle => {
                    console.log(dbArticle);
                })
                .catch(err => {
                    return res.json(err);
                })
        })
        res.redirect("/")
    })
});

app.get("/articles", (req, res) => {
    db.Articles.find({})
        .then(dbArticle => {
            res.json(dbArticle);
        })
        .catch(err => {
            res.json(err);
        });
});

app.get("/articles/:id", (req, res) => {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(dbArticle => {
            res.json(dbArticle);
        }).catch(err => {
            res.json(err);
        })
});

app.post("/articles/:id", (req, res) => {
    db.Note.create(req.body)
        .then(dbNote => {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true })
        })
        .then(dbArticle => {
            res.json(dbArticle);
        })
        .catch(err => {
            res.json(err)
        })
});

app.delete("/notes/:id", (req, res) => {
    console.log(req.params.id)
    db.Note.findByIdAndRemove(req.params.id, (err, response) => {
        if (err) throw err;
        res.json(response)
    });
});



app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});