//var mongoose = require("mongoose");
// Require all models
//var db = require("../models");


$("#get-articles").on("click", function () {
    // Empty the articles from the articles section
    $("#articles").empty();

    scrapeArticles();

  // Grab the articles as a json
  $.getJSON("/articles", function (data) {

    alert("Found " + data.length + " articles!");
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<div class='article-post'>" + 
      "<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link +
      "</p></div>");
    }
  });


});

function scrapeArticles() {
  $.get("/scrape", function (data) {});

}