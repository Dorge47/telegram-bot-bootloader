# telegram-bot-bootloader
Will set up a server to handle multiple telegram bots by using a common interface

## Usage

Create a subfolder with a main.js file in it. This main.js is required to have the required functions and variables exported. If not, the sever will panic and exit. The server will also require configuration files to configure how the server will work. These files will be in the directory `/etc/tgbb/` and will all have the extension `.json`

### Required Functions

- `callback(data)`
    - This function will be used as a callback for the server. The data will be whatever data has been recieved from Telegram's servers
- `init(initDataObject)`
    - Will allow the server to initalize whatever it needs to initialize before being made public.
    - `initDataObject` - Contains the following data
        - `killFunc`
            - Is a function passed to the bot which it can use to kill itself. This function takes the bot's token as an argument
        - `startFunc`
            - Is a function used to start bots. This is not recommended for use by anything except for a management bot. This function takes the subdirectory of the bot to be started. Will return an error code if this fails.
            -Error codes:
                - 0: Success
                - 1: Bot already started
                - 2: Directory given is not a bot or does not exist
                - 3: Bot does not have a token entry
        - `initBotFunc`
            - Is a function used in the process of starting a bot. This will check the bots URL and other information required to start the bot and set all that up. This takes the directory of the bot.
- `onKill()`
    - This function will run when the server has killed that bot

### Required Variables

- `token`
    - Will contain the bot's token. This token will be used as the url for the bot to respond to. This will be set by the bootloader before `init()`
- `name`
    - Will contain the bot's name. This is set by the bot in the init() function or whenever.
- `directory`
    - Will contain the bot's directory name. This is used internally by the server

### Required Configuration Files

- `tokens.json`
    - This file will contain the tokens of each bot in the files. It will be in this structure:
    ```json
    [
        { "botName": "Subfolder name", "token": "Telegram token" },
        { "botName": "Subfolder name", "token": "Bot token" }
    ]
    ```

- `certs.json`
    - This file will contain the file paths for the server's certificates and will be structured as such:
    ```json
    {
        "key": "filepath/to/privkey.pem",
        "cert": "filepath/to/cert.pem",
        "ca": "filepath/to/chain.pem"
    }
    ```
- `server.json`
    - This file contains other basic server configuration options. These include:
        - `serverUrl`
            - This is the actual URL of the server

- `status.json`
    - This will be created by the server, but will need to be edited every once in a while. This file contains the status of each bot. It is done by token The things kept track of are:
        - `isWebhookSet`
            - True if the webhook is set, false if not
