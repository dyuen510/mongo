// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();
app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}))

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData","comments"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
// app.get("/", function (req, res) {
//     res.send("Hello world");
// });

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

//retrieve comments from db 
// app.post('/comments', function(req,res){
//     db.comments.find(req.param('_id'),{
//         comments:req.param('input')
//     }, function(error,res){
//         res.redirect('/' + req.param('_id'))
//     })
// })

// app.post('/do-comment', function(req,res){
//     var comment_id = ObjectID();
//     scraper.collection('posts').update({'_id': ObjectId(req.body.post_id)}
//     ,{
//         $push: {
//             'comments': {_id:comment_id, comment: req.body.comment}
//         }
//     },function(error,post){
//         res.send({
//             text:'comment successful',
//             _id:post.insertedId
//         })
//     }
//     )
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


            if (title && link) {
                if (!link.includes('https://enn.com')) {
                    link = "https://enn.com" + link;
                    if (!img.includes('https:')){
                        img ='https:' + img;
                    }
                    
                
                db.scrapedData.insert({
                    title: title,
                    link: link,
                    summary: summary,
                    img:img,
                    // summary: summary
                },
            

                    
                )
            }
            
        }
        })
    })
    res.send('Scraped completed!');
})


// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});
