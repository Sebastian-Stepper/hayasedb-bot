const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DISCORD_TOKEN } = require('./utils/config');
const loadEvents = require('./utils/eventLoader');
const loadCommands = require('./utils/loadCommands');
const loadTasks = require('./utils/taskLoader');
const registerCommands = require('./utils/registerCommands');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
const connectToMongoDB = require('./utils/db');
const {validateRulesEmbeds, validatePortainerStacksEmbeds} = require("./utils/cleanup");
client.commands = new Collection();

connectToMongoDB();


loadEvents(client);
loadTasks(client);
loadCommands(client);
registerCommands(client);

client.login(DISCORD_TOKEN)
    .then(async () => {
        await validateRulesEmbeds(client);
        await validatePortainerStacksEmbeds(client);
        console.log(`Logged in as ${client.user.tag}`);
    })
    .catch(err => {
        console.error('Failed to log in to Discord:', err);
    });
