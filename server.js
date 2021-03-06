var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = process.env.PORT || 3000;

//initialize express
var app = express();

//Use morgan logger 
app.use(logger("dev"));

//Pare request body JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Make public a static folder
app.use(express.static("public"));

if(process.env.MONGODB_URI){
    mongoose.connect(process.env.MONGODB_URI)
}
else {
//connect to mongo db on local host
mongoose.connect("mongodb://localhost/scraperdb", { useNewUrlParser: true });
}

var hbs = exphbs.create({
    defaultLayout: "main", 
    extname: ".hbs",
    helpers: {}

});
// Set view engine
app.engine(hbs.extname, hbs.engine);
app.set('view engine', hbs.extname);
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
        // console.log($)
        var main = "https://carbuzz.com";
        $(".feed-item").each((i, element) => {
            var result = {};
            result.title = $(element).children().children("div.cb-post-preview__right").find("a").text();
            result.link = $(element).children().children("div.cb-post-preview__image").find("img").attr("src");
            result.summary = $(element).children().children("div.cb-post-preview__right").find("div.cb-post-preview__subtitle").text();
            result.article = main + $(element).children().children("div.cb-post-preview__right").find("a").attr("href");

            console.log(result);

            // console.log(db)
            // console.log(Article)
            db.Article.create(result)
                .then(dbArticle => {
                    console.log(dbArticle);
                })
                .catch(err => {
                   console.log(err);
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

app.get("/notes/:id", (req, res) => {
    db.Article.findOne({ _id: req.params.id })
        .then(dbArticle => {
            // console.log(dbArticle.note)
            db.Note.find({_id : dbArticle.note})
            .then(dbNote => {
                res.json(dbNote);
            })
        }).catch(err => {
            res.json(err);
        })
});
app.post("/articles/:id", (req, res) => {
    // console.log(req.body)
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



app.listen(PORT, () => {
    console.log("App running on port " + PORT + "!");
});