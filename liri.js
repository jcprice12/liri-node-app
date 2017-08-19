//Import packages and files
var keysFile = require("./keys.js");
var fs = require("fs");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');

//default variables
var defaultSpotify = {
    track: "The Sign",
    artist: "Ace of Base",
};
var defaultMovie = {
    title: "Mr. Nobody",
    year: "2009",
};
var defaultInstructionsFile = {
    name: "random.txt",
};

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
                myLog("");
            }
        }
    });
}

function buildSpotifySearchObj(myType, myQuery, myLimit){
    var myObj = new Object();
    myObj.type = myType;
    myObj.query = myQuery;
    myObj.limit = myLimit;
    return myObj;
}

function convertToSpotifyQuery(spotifySearchObj){
    var q = "";
    var keys = Object.keys(spotifySearchObj);
    for(var i = 0; i < keys.length; i++){
        if(i < (keys.length - 1)){
            q = q + keys[i] + ":" + spotifySearchObj[keys[i]] + " ";
        } else {
            q = q + keys[i] + ":" + spotifySearchObj[keys[i]];
        }
    }
    q = encodeURI(q);
    return q;
}

function spotifySong(searchObj){
    var spotify = new Spotify(keysFile.spotifyKeys);
    spotify.search(searchObj, function(error, data) {
        if (error) {
            myLog(error);
        } else {
            var tracks = data.tracks;
            var items = tracks.items;
            var artists;
            var artistsStr
            for(var i = 0; i < items.length; i++){
                myLog("Track: " + items[i].name);
                artistsStr = "Artists: ";
                artists = items[i].artists;
                for(var j = 0; j < artists.length; j++){
                    if(j < (artists.length-1)){
                        artistsStr = artistsStr + artists[j].name + ", ";
                    } else {
                        artistsStr = artistsStr + artists[j].name;
                    }
                }
                myLog(artistsStr);
                myLog("Album: " + items[i].album.name);
                myLog("Preview URL: " + items[i].preview_url);
                myLog("");
            }
        }
    });
}

//object of available commands
var commands = {
    "my-tweets" : function(option){
        myLog("Recent Tweets:");
        myLog("");
        getTweets();
    },
    "spotify-this-song" : function(option){
        if(option){
            myLog("Spotify This Song: " + option);
            myLog("");
            spotifySong(buildSpotifySearchObj("track", convertToSpotifyQuery({track: option}), 10));
        } else {
            myLog("Spotify This Song: " + defaultSpotify.track);
            myLog("");
            spotifySong(buildSpotifySearchObj("track", convertToSpotifyQuery(defaultSpotify), 1));
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
        myLog(command + " [option]");
    }
}

function runApp(){
    myLog("");
    var readPromise = fs.readFile("package.json", "utf8", function(err, data){
        if(err){
            myLog("Error getting app version:");
            myLog(err); 
            myLog("");
            executeCommand(process.argv); 
        } else {
            myLog("APP VERSION: " + JSON.parse(data).version);
            myLog("");
            executeCommand(process.argv);
        }
    });
}

function executeCommand(args){
    if(args.length > 2){
        var command = args[2];
        var option = "";
        if(args.length > 3){
            for(var i = 3; i < args.length; i++){
                if(i < (args.length-1)){
                    option = option + args[i] + " ";
                } else {
                    option = option + args[i];
                }
            }
        }
        if(commands.hasOwnProperty(command)){
            commands[command](option);
        } else {
            myLog("INVALID COMMAND: " + command);
            printAvailableCommands();
        }
    } else {
        myLog("Not enough command-line arguments");
        printAvailableCommands();
    }
}

runApp();