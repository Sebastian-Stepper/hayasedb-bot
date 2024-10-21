const { Client, GatewayIntentBits } = require('discord.js');
const { DISCORD_TOKEN } = require('./utils/config');
const loadEvents = require('./utils/eventLoader');
const loadTasks = require('./utils/taskLoader');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
const connectToMongoDB = require('./utils/db');

connectToMongoDB();
loadEvents(client);

loadTasks(client);

client.login(DISCORD_TOKEN)
    .then(() => {
        console.log(`Logged in as ${client.user.tag}`);
    })
    .catch(err => {
        console.error('Failed to log in to Discord:', err);
    });
