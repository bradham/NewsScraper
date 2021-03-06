var express = require("express");
//TODO: implement morgan
//var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// TODO: Use morgan logger for logging requests
//app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsscraper";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
//Old connection
//mongoose.connect("mongodb://localhost/newsscraper", { useNewUrlParser: true });

// Routes

// A GET route for scraping the Reddit news website
app.get("/scrape", function (req, res) {
  // Drop data collection to crreate a fresh, updated query
  /*   db.Article.remove({}, function(){
  
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
   */

  // First, we grab the body of the html with axios
  axios.get("https://www.macrumors.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    //Save data to file for debugging
    // fs.writeFile('./page_data.txt', response.data, function (err) {
    //   if (err) throw err;
    //   console.log('Saved data to file!');
    // });

    //TODO: Check proper tags
    // Now, we grab every h2 (for macrumors) within an article class, and do the following:
    $(".article").each(function (i, element) {
      // Save an empty result object
      //console.log("element in '.article' is: " + element);
      let result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("h2")
        .children("a")
        .text();
      //console.log("The title is " + result.title);
      result.link = $(this)
        .children("h2")
        .children("a")
        .attr("href");
      let tempString = $(this)
        .children(".content")
        .children(".content_inner")
        .text();
      //Only save the 1st 100 chars to the databse for the preview.
      result.preview = tempString.substr(0, 100);

      //Check to see if article is already present
      db.Article.find({ title: result.title })
        .then(function (dbArticle) {
          // View the added result in the console
          //console.log("dbArticle from dup check:\n" + dbArticle)
          if (!dbArticle.length) {
            console.log("Didn't find a match for title.");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
              .then(function (dbArticleReturn) {
                // View the added result in the console
                console.log("New dbArticle added");
              })
              .catch(function (err) {
                // If an error occurred, log it
                console.log(err);
              });

          } else {
            console.log("Found Article.find: " + dbArticle[0].title + "\nNot saving duplicate in db.");
          };
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });

    });

    // Send a message to the client
    res.send("Scrape Complete");

  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated Article -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { saved: dbNote.saved }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!\n***\nhttp://localhost:" + PORT + "\n***");

});
