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
          "<form><input type='button' value='Save Article' class='save-article' data-id=" + dataArticles._id + "></form>" +
          "</div>");
      }
    });

  });

});

// When you click the savenote button
$(document).on("click", ".save-article", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
