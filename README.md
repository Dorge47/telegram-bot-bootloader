# telegram-bot-bootloader
Will set up a server to handle multiple telegram bots by using a common interface

## Usage

Create a subfolder with a main.js file in it. This main.js is required to have the required functions and variables exported. If not, the sever will panic and exit. The server will also require configuration files to configure how the server will work. These files will be in the directory `/etc/tgbb/` and will all have the extension `.json`

### Required Functions

- `callback(data)`
    - This function will be used as a callback for the server. The data will be whatever data has been recieved from Telegram's servers
- `init(killFunc)`
    - Will allow the server to initalize whatever it needs to initialize before being made public.
    - `killFunc(token)`
        - killFunc is a function passed to the bot which it can use to kill itself. This function takes that bot's token as an argument as an identifier for the bot
- `onKill()`
    - This function will run when the server has killed that bot

### Required Variables

- `token`
    - Will contain the bot's token. This token will be used as the url for the bot to respond to. This will be set by the bootloader before `init()`

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
        "key": "filepath/to/key.pem",
        "cert": "filepath/to/cert.pem",
        "ca": "filepath/to/chain.pem"
    }
    ```

- `status.json`
    - This will be created by the server, but will need to be edited every once in a while. This file contains the status of each bot. The things kept track of are:
        - `isWebhookSet`
            - True if the webhook is set, false if not
