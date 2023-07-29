const { Client, GatewayIntentBits, Partials, EmbedBuilder, Colors, Embed, PermissionFlagsBits } = require("discord.js")
const client = new Client({ intents: [Object.values(GatewayIntentBits)], partials: [Object.values(Partials)] })
const handlers = require("handler-manager")
const { token, id} = require("./config.js")
const db = require("croxydb")
const fs = require('fs');

handlers.slashcommandhandler("commands", token, id)

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.login(token)