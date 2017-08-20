//Import packages and files
var keysFile = require("./keys.js");
var fs = require("fs");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require("request");
var endOfLine = require('os').EOL;

//default variables
var defaultSpotify = {
    track: "The Sign",
    artist: "Ace of Base",
};
var defaultMovie = {
    t: "Mr. Nobody",
    y: "2009",
};
var defaultInstructionsFile = {
    name: "random.txt",
};

//misc variables
var logFile = "log.txt";

//logger (console logs and logs to file)
function myLog(message){
    console.log(message);
    var myDate = new Date();
    message = myDate.toDateString() + " " + myDate.toTimeString() + ": " + message + endOfLine;
    fs.appendFileSync(logFile, message);
}

//gets 20 most recent tweets from the dummy "Jason Bourne" account
function getTweets(){
    var client = new Twitter(keysFile.twitterKeys);
    var path = "search/tweets";
    var params = {
        q: "c_price12",
        count: 20,
    };
    client.get(path, params, function(error, tweets, response){
        myLog("Recent Tweets:");
        myLog("");
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

//builds a search object ot be used to spotify a song (get information about it)
function buildSpotifySearchObj(myType, myQuery, myLimit){
    var myObj = new Object();
    myObj.type = myType;
    myObj.query = myQuery;
    myObj.limit = myLimit;
    return myObj;
}

//convert some data to a query. Takes an object as first argument and iterates through its key/value pairs.
//separates the key from the value in the query string with the d1 arg.
//separates the key/value pair from another key/value pair in the query string with the d2 arg
function convertToQuery(searchObj, d1, d2){
    var q = "";
    var keys = Object.keys(searchObj);
    for(var i = 0; i < keys.length; i++){
        if(i < (keys.length - 1)){
            q = q + keys[i] + d1 + searchObj[keys[i]] + d2;
        } else {
            q = q + keys[i] + d1 + searchObj[keys[i]];
        }
    }
    q = encodeURI(q);
    return q;
}

//use the spotify node module to run a search against the spotify api
//takes in a search obj with parameters for search. song name is used for logging only
function spotifySong(searchObj, songName){
    var spotify = new Spotify(keysFile.spotifyKeys);
    spotify.search(searchObj, function(error, data) {
        myLog("Spotify This Song: " + songName);
        myLog("");
        if (error) {
            myLog(error);//log error
        } else {//everything is fine
            var tracks = data.tracks;
            var items = tracks.items;
            var artists;
            var artistsStr
            for(var i = 0; i < items.length; i++){
                myLog("Track: " + items[i].name);
                artistsStr = "Artists: ";
                artists = items[i].artists;//artists is stored in an array
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

//use the OMDB API to get movie information (depends on if the api key is still valid)
//takes in part of a query string to search (uses http to get info). movie name is used for logging only
function getMovieData(queryPart, movieName){   
    var queryUrl = "http://www.omdbapi.com/?" + queryPart + "&plot=short&apikey=40e9cece";
    request(queryUrl, function(err, response, body){
        myLog("Movie This: " + movieName);
        myLog("");
        if(!err && response.statusCode === 200){
            var jsonObj = JSON.parse(body);
            myLog("Title: " + jsonObj.Title);
            myLog("Year: " + jsonObj.Year);
            myLog("IMDB Rating: " + jsonObj.imdbRating);
            for(var i = 0; i < jsonObj.Ratings.length; i++){//Rotten Tomatoes rating is stored in an array of ratings. Why is IMDB separate?
                var source = jsonObj.Ratings[i].Source.toLowerCase().trim();
                if(source === "rotten tomatoes"){
                    myLog("Rotten Tomatoes Rating: " + jsonObj.Ratings[i].Value);
                    break;
                }
            }
            myLog("Country: " + jsonObj.Country);
            myLog("Language: " + jsonObj.Language);
            myLog("Plot: " + jsonObj.Plot);
            myLog("Actors: " + jsonObj.Actors);
            myLog("");
        } else if(err){
            myLog(err);
        } else {
            myLog("Error getting movies data, response.statusCode was: " + response.statusCode);
        }
    });
}

//reads a file to perform app commands.
//file format should have one command per line. option for the command on each line is separated from the command by a comma
//E.G.
/*
    <command>,<option>
    <command>,<option>
    <command>
    <command>
    <command>,<option>
*/
function readInstrFile(fname){
    fs.readFile(fname, "utf8", function(err, data){
        myLog("Doing what '" + fname + "' says");
        myLog("");
        if(err){
            myLog(err);   
        } else {
            var arrayOfLines = data.split(endOfLine);
            for(var i = 0; i < arrayOfLines.length; i++){
                arrayOfLines[i] = arrayOfLines[i].split(",");
                if(commands.hasOwnProperty(arrayOfLines[i][0])){
                    if(arrayOfLines[i].length > 1){
                        commands[arrayOfLines[i][0]].execute(arrayOfLines[i][1]);
                    } else {
                        commands[arrayOfLines[i][0]].execute("");
                    }
                } else {//will go onto the next line if there is an error. will tell you there was an invalid command
                    myLog("INVALID COMMAND '" + arrayOfLines[i][0] + "' FOUND IN '" + fname + "'");
                    printAvailableCommands();
                }
            }
        }
    });
}

//object of available commands
//key is the command name. value is an object with a description of the option and the execute() function
var commands = {
    "my-tweets" : {
        optionDesc : "NO OPTION",
        execute: function(option){
            getTweets();
        }
    },
    "spotify-this-song" : {
        optionDesc : "TRACK NAME",
        execute: function(option){
            if(option){
                spotifySong(buildSpotifySearchObj("track", convertToQuery({track: option}, ":", " "), 10), option);
            } else {
                spotifySong(buildSpotifySearchObj("track", convertToQuery(defaultSpotify, ":", " "), 1), defaultSpotify.track);
            }
        },
    },
    "movie-this" : {
        optionDesc: "MOVIE TITLE",
        execute: function(option){
            if(option){
                getMovieData(convertToQuery({t: option}, "=", "&"), option);
            } else {
                getMovieData(convertToQuery(defaultMovie, "=", "&"), defaultMovie.t);
            }
        }
    },
    "do-what-it-says" : {
        optionDesc : "FILE NAME",
        execute: function(option){
            if(option){
                readInstrFile(option);
            } else {
                readInstrFile(defaultInstructionsFile.name);
            }
        }
    },
}

//prints all commands found in the commands object
function printAvailableCommands(){
    myLog("");
    myLog("AVAILABLE COMMANDS ARE:");
    for(command in commands){
        myLog(command + " [" + commands[command].optionDesc + "]");
    }
}

//executes command specified by the user's command-line argument.
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
            commands[command].execute(option);
        } else {
            myLog("INVALID COMMAND: " + command);
            printAvailableCommands();
        }
    } else {
        myLog("Not enough command-line arguments");
        printAvailableCommands();
    }
}

//reads the package.json file for version name and runs the app by calling the executeCommand function for the command line args specified by the user
function runApp(){
    myLog("");
    myLog("APP STARTED");
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


//:D
runApp();