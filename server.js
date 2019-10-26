// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();
app.use(express.static('public'));

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
    res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function (req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.json(found);
        }
    });
});

// new york times
// app.get('/scrape', function(req,res){
//     axios.get('https://www.nytimes.com/').then(function(response){
//         // console.log(response.data)
//         var $ = cheerio.load(response.data);
//         $('.title').each(function(i,element){
//             console.log($(element).html());
//             // console.log($('span.balancedHeadline')[0].innerText);
//             var title = $('span.balancedHeadline')[0].innerText
//             var link = $(element).children("a").attr("href");
//             if (title && link){
//                 db.scrapedData.insert({
//                     title:title,
//                     link:link
//                 },
//                 function(err, inserted){
//                     if (err){
//                         console.log(err);
//                     }else{
//                         console.log(inserted);
//                     }
//                 })
//             }

//         })
//     })
//     res.send("Scrape Complete");

// })
app.get('/scrape', function (req, res) {
    axios.get('https://www.enn.com').then(function (response) {
        // console.log(response.data);

        var $ = cheerio.load(response.data);
        $('h3').each(function (i, element) {
            // console.log($(element).html());

            var title = $(element).children('a').text();
            var link = $(element).children('a').attr('href');
            var summary =$(element).parent().children('p').text();
            var img = $(element).parent().children('img').attr('src');
            // console.log(summary);
            

            // $('p').each(function(i,element){
            //     // console.log($(element).html());
            //     var summary = $(element).text();

            
            if (title && link) {
                if (!link.includes('https://enn.com')) {
                    link = "https://enn.com" + link;
                
                db.scrapedData.insert({
                    title: title,
                    link: link,
                    summary: summary,
                    img:img,
                    // summary: summary
                },
                    function (err, inserted) {
                        if (err) {
                            console.log(err);
                        } else {
                            // console.log(inserted);
                            // console.log(summary); 
                            // console.log(img);
                            // console.log(summary);
                        }
                    }
                )
            }
        }
        })
    // })
    })
    res.send('Scraped completed!');
})
// Scrape data from one site and place it into the mongodb db
// app.get("/scrape", function (req, res) {
//     // Make a request via axios for the news section of `ycombinator`
//     axios.get("https://news.ycombinator.com/").then(function (response) {

//         console.log(response.data);

//         // Load the html body from axios into cheerio
//         var $ = cheerio.load(response.data);
//         // For each element with a "title" class
//         $(".title").each(function (i, element) {
//             // Save the text and href of each link enclosed in the current element

//             console.log($(element).html());


//             var title = $(element).children("a").text();
//             var link = $(element).children("a").attr("href");

//             // If this found element had both a title and a link
//             if (title && link) {
//                 // Insert the data in the scrapedData db
//                 db.scrapedData.insert({
//                     title: title,
//                     link: link
//                 },
//                     function (err, inserted) {
//                         if (err) {
//                             // Log the error if one is encountered during the query
//                             console.log(err);
//                         }
//                         else {
//                             // Otherwise, log the inserted data
//                             console.log(inserted);
//                         }
//                     });
//             }
//         });
//     });

//     // Send a "Scrape Complete" message to the browser
//     res.send("Scrape Complete");
// });


// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});
