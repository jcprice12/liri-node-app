//Import packages and files
var keysFile = require("./keys.js");
var fs = require("fs");
var Twitter = require('twitter');

//default variables
var defaultSpotify = {
    song: "The Sign",
    artist: "Ace of Base",
};
var defaultMovie = {
    title: "Mr. Nobody",
    year: "2009",
}
var defaultInstructionsFile = {
    name: "random.txt",
}

//logger
function myLog(message){
    console.log(message);
}

function getTweets(){
    var client = new Twitter(keysFile.twitterKeys);
    var path = "search/tweets";
    var params = {
        q: "c_price12",
        count: 20,
    };
    client.get(path, params, function(error, tweets, response){
        if(error){
            myLog(error);
        } else {
            var statuses = tweets.statuses;
            for(var i = 0; i < statuses.length; i++){
                myLog("Text: " + statuses[i].text);
                myLog("Created At: " + statuses[i].created_at);
            }
        }
    });
}

//object of available commands
var commands = {
    "my-tweets" : function(option){
        myLog("Recent Tweets:");
        getTweets();
    },
    "spotify-this-song" : function(option){
        if(option){
            myLog("Spotify This Song: " + option);
        } else {
            myLog("Spotify This Song: " + defaultSpotify.song);
        }
    },
    "movie-this" : function(option){
        if(option){
            myLog("Movie This: " + option);
        } else {
            myLog("Movie This: " + defaultMovie.title);
        }
    },
    "do-what-it-says" : function(option){
        if(option){
            myLog("Doing what '" + option + "' says");
        } else {
            myLog("Doing what '" + defaultInstructionsFile.name + "' says");
        }
    }
}

function printAvailableCommands(){
    myLog("");
    myLog("AVAILABLE COMMANDS ARE:");
    for(command in commands){
        myLog(command);
    }
}

function runApp(args){
    myLog("");
    if(args.length > 4){
        myLog("Too many command-line arguments");
        printAvailableCommands();
    } else if(args.length > 2){
        var command = args[2]
        var option = "";
        if(args.length > 3){
            option = args[3];
        }
        if(commands.hasOwnProperty(command)){
            commands[command](option);
        } else {
            printAvailableCommands();
        }
    } else {
        myLog("Not enough command-line arguments");
        printAvailableCommands();
    }
}

runApp(process.argv);