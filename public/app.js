//var mongoose = require("mongoose");
// Require all models
//var db = require("../models");


$("#get-articles").on("click", function () {
  // Empty the articles from the articles section
  $("#articles").empty();

  $.get("/scrape", function (data) {
    console.log("data.length in scrape $.get: " + data.length);

    // Grab the articles as a json
    $.getJSON("/articles", function (dataArticles) {

      alert("Found " + dataArticles.length + " articles!");

      // For each one
      for (var i = 0; i < dataArticles.length; i++) {
        // Display the apropos information on the page
        $("#articles").append("<div class='article-post'>" +
          "<a href='" + dataArticles[i].link + "'>" + dataArticles[i].title + "</a>" +
          "<br /> <p data-id='" + dataArticles[i]._id + "'>" +
          dataArticles[i].preview + "...</p>" +
          "<form><input type='button' value='Save Article' id='save-articles'></form>" +
          "</div>");
      }
    });

  });

});