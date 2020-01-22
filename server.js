// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
var url = 'mongodb://localhost:8080/scraper'

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

app.get('/', function(req, res){
    res.json(path.join(__dirname, "public/index.html"));
})

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


//REACT
// component did mount connects to the data for heroku
//componentDidMount(){
    //fetch('/api/all,{
        //method: 'GET'
    // })
    // .then(r => r.json())
    // .then(r => console.log(r)) // same thing as (result) => {consoel.log(result)}
// }

// Retrieve data from the db
app.get("/comments", function (req, res) {
    // Find all results from the scrapedData collection in the db
    db.comments.find({}, function (error, found) {
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

app.post('/insert', function(req,res){
    console.log(req.body);
    var array = [];
    var noArray = [];
    var userComment = req.body.commentid;
    for (var i=0; i<userComment.length; i++){
        if(userComment[i] != ''){
            array.push(userComment[i]);
        }
    }
        console.log(array);
        var data = {
            'comment' : array
        }
        db.collection('comments').insertOne(data, function(error,collection){
            if(error) throw error;
            console.log('recorded successfully');
        })
        res.redirect('/');
        
    })

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
var port = process.env.PORT || 3000;

var server = app.listen(port,function(){
    console.log("App running on port 3000");
})
// Listen on port 3000
// app.listen(3000, function () {
//     console.log("App running on port 3000!");
// });
