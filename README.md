# telegram-bot-bootloader
Will set up a server to handle multiple telegram bots by using a common interface

## Usage

Create a subfolder with a main.js file in it. This main.js is required to have the required functions and variables exported. If not, the sever will panic and exit. The server will also require configuration files to configure how the server will work. These files will be in the directory `/etc/tgbb/` and will all have the extension `.json`

### Required Functions

- `callback(data)`
    - This function will be used as a callback for the server. The data will be whatever data has been recieved from Telegram's servers
- `init()`
    - Will allow the server to initalize whatever it needs to initialize before being made public

### Required Variables

- `token`
    - Will contain the bot's token. This token will be used as the url for the bot to respond to

### Required Configuration Files

- `tokens.json`
    - This file will contain the tokens of each bot in the files. It will be in this structure:
    ```json
    [
    { "bot_name": "Subfolder name", "token": "Telegram token" },
    { "bot_name": "Subfolder name", "token": "Bot token" }
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
