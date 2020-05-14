// The Telegram Bot Bootloader
// Licensed under the GPL v3 license
// Written by: NateDogg1232 and Dorge47

const CONFIG_FOLDER = '/etc/tgbb/';

// Load up the filesystem module
const fs = require('fs');
//And the https module
const https = require('https');
//And now a URL Parser
const urlParser = require('url');

// This will store all the bots which we will use
var bots = [];

const initDataObject = {
    killFunc: killBot,
    startFunc: startBot,
    initBotFunc: setBotWebhook,
}

var server = null;

//First we need to load our configuration files.
var tokens = JSON.parse(fs.readFileSync(CONFIG_FOLDER + 'tokens.json'));
var certs  = JSON.parse(fs.readFileSync(CONFIG_FOLDER + 'certs.json' ));
var config = JSON.parse(fs.readFileSync(CONFIG_FOLDER + 'server.json'));
//Check to see if the status.json file exists before we start messing with it.
//If not, we just make the variable an empty array
var status = [];
if (fs.existsSync(CONFIG_FOLDER + 'status.json')) {
    status = JSON.parse(fs.readFileSync(CONFIG_FOLDER + 'status.json'));
}

//And now we start to get our directories
var dirs = fs.readdirSync(".", {withFileTypes: true})
            //Make sure it only contains directories
            .filter(dir => dir.isDirectory());

//Call startBot on each directory
for (let i = 0; i < dirs.length; i++) {
    switch (startBot(dirs[i].name)) {
        // Success
        case 0:
            console.log()
            break;
        // Bot already started
        case 1:
            console.error("Somehow the bot in directory " + dirs[i].name + " is already started...");
            break;
        // Folder is not a bot or doesn't exist
        case 2:
            //Ignore
            break;
        //Bot does not have a token defined
        case 3:
            console.error("Bot in directory " + dirs[i].name + " does not have a token assigned to it! Will not start this bot");
            break;
        default:
            console.error("Undefined error while starting bot in directory " + dirs[i].name);
    }
}


var serverOpts = {
    key: fs.readFileSync(certs.key),
    cert: fs.readFileSync(certs.cert),
    ca: fs.readFileSync(certs.ca)
}

//And now we start the server
server = https.createServer(serverOpts, serverResponse).listen(8443);

//We go through each bot and see if their URL has been created
bots.forEach(function(bot) {
    //Get the bot's token and use that to check if its url has been made a webhook.
    if (status[bot.token] === undefined || status[bot.token].isWebhookSet === false) {
        //If it's undefined, then we obviously need to set up its URL
        //If it returns false, we took off the webhook at some point, and need to start that again
        setBotWebhook(bot.token);
        //Set its webhook to set
        status[bot.token] = { isWebhookSet: true };
        //And save the status
        fs.writeFileSync(CONFIG_FOLDER + 'status.json', JSON.stringify(status));
    }
});

function setBotWebhook(token) {
    let options = {
        hostname: 'api.telegram.org',
        path: '/bot' + token + '/' + "setWebhook",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    }
    var req = https.request(options, (resp) => {}).on('error', (err) => console.error("Error sending request: " + err.message));
    req.write(JSON.stringify({url: config.serverUrl + "/" + token}));
    req.end();
}

//This is our callback for when the server recieves a request
function serverResponse(req, res) {
    //We parse the URL first
    let reqDate = new Date();
    let dateString = "";
    dateString += reqDate.getFullYear() + ":" + (reqDate.getMonth() + 1) + ":"
    + reqDate.getDay() + ":" + reqDate.getHours() + ":" + reqDate.getMinutes()
    + ":" + reqDate.getSeconds();
    console.log(dateString + ": Request from " + url.pathname);
    console.log("Request from " + url.pathname);
    //First we find the bot
    let bot = bots.find(bot => ("/" + bot.token) == url.pathname);
    if (bot === undefined) {
        //This bot doesn't exist, so we'll just say that we aren't supposed to
        //be here for now. Later on we can add something for a web interface
        //here.
        res.writeHead(403);
        res.end(
`
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Get out plz</title>
    </head>
    <body>
        <h1>This isn't for you!</h1>
        <p>Why are you here? Get out.</p>
    </body>
</html>
`);
        //Yeet outta here
        return;
    }
    //If we do find the bot, we will get the data and push it to the bot
    let data = "";
    req.on('data', chunk => data += chunk);
    req.on('end', function() {
        data = JSON.parse(data);
        console.log(bot.name + " data:");
        console.log(data);
        //Run the callback
        bot.callback(data);
        //Tell Telegram that we got their message well
        res.writeHead(200);
        res.end(data + "\n");
    })

}

// This function will kill whatever bot called it
function killBot(token) {
    let botIndex = bots.findIndex(bot => bot.token == token);
    // Move bot to a temporary variable so that we can destroy it
    let bot = bots[botIndex];
    // Remove the bot at this index
    bots.splice(botIndex, 1);
    // Let the bot know it's been killed
    bot.onKill();
    //And we check if there are still any bots even running anymore. If not, we just kill the server
    if (bots.length == 0) {
        server.close(function() { console.log("Server shutting down") });
    }
}

function startBot(botDirectory) {
    //Check to see if this bot has already started.
    for (let i = 0; i < bots.length; i++) {
        if (bots[i].directory == botDirectory) {
            //This bot has already been started, so we return that as an error
            return 1;
        }
    }
    //Now we need to check if the bot is an actual bot
    let bot = null;
    if (fs.existsSync("./" + botDirectory + "/main.js")) {
        bot = require("./" + botDirectory + "/main.js");
    } else {
        // Directory is not a bot or doesn't exist
        return 2;
    }
    // And we check if the bot has a token
    let botToken = getToken(botDirectory);
    if (botToken === false) {
        // Bot does not have a token, so we return that error
        return 3;
    }
    //Set the bot's token
    bot.token = botToken;
    bot.directory = botDirectory;
    //Init the bot
    bot.init(initDataObject);
    //Add the bot to the list
    bots.push(bot);
    console.log("Started bot " + bot.name);
    return 0;
}

function getToken(botName) {
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].botName == botName) {
            return tokens[i].token;
        }
    }
    return false;
}
