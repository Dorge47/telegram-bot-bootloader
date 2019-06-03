const CONFIG_FOLDER = '/etc/tgbb/';

// Load up the filesystem module
const fs = require('fs');
//And the https module
const https = require('https');

// This will store all the bots which we will use
var bots = [];

var server = null;

//First we need to load our configuration files.
var tokens = JSON.parse(fs.readFileSync(CONFIG_FOLDER + 'tokens.json'));
var certs  = JSON.parse(fs.readFileSync(CONFIG_FOLDER + 'certs.json' ));
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
    startBot(dirs[i].name);
}

// This function will kill whatever bot called it
function killFunc(token) {
    let botIndex = bots.findIndex(bot => bot.token == token);
    // Move bot to a temporary variable so that we can destroy it
    let bot = bots[i];
    // Remove the bot at this index
    bots.removeAt(botIndex);
    // Let the bot know it's been killed
    bot.onKill();
}

//botDirectory: String
//  Takes a string which is the name of the directory the bot is currently in.
function startBot(botDirectory) {
    //If it is a valid bot, we will start it, otherwise, we will
    //ignore it
    let bot = null;
    if (fs.existsSync(botDirectory + "/main.js")) {
        //Add it to our bots
        bot = require(botDirectory + "/main.js");
    } else {
        //Ignore it
        return;
    }
    //We need to init the bot. We will first set its token. If we don't have its
    //token, we panic and exit
    let botToken = getToken(botDirectory);
    if (botToken === false) {
        console.error("Bot does not have a token in the tokens.json file!");
        console.error("Server panic! Exiting");
        process.exit(1);
    }
    //Set the bot's token
    bot.token = botToken;
    //Init the bot
    bot.init(killFunc);
    //And we will set the urls up of the bot once all bots are initalized
}

function getToken(botName) {
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].botName == botName) {
            return tokens[i].token;
        }
    }
    return false;
}
