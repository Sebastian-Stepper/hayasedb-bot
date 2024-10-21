const { Client, GatewayIntentBits } = require('discord.js');
const { sendStackUpdates } = require('./tasks/serviceStats');
const { DISCORD_TOKEN, GUILD_ID, PORTAINER_STATUS_CHANNEL_ID } = require('./config');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.login(DISCORD_TOKEN).then(() => {
    console.log(`Logged in as ${client.user.tag}`);

    client.guilds.fetch(GUILD_ID)
        .then(async (guild) => {
            try {
                const channel = await guild.channels.fetch(PORTAINER_STATUS_CHANNEL_ID);

                if (channel) {
                    setInterval(() => sendStackUpdates(channel), 5 * 1000);
                } else {
                    console.error('Channel not found in the guild.');
                }
            } catch (err) {
                console.error('Error fetching channel:', err);
            }
        })
        .catch(err => {
            console.error('Failed to fetch guild:', err);
        });
}).catch(err => {
    console.error('Failed to log in to Discord:', err);
});
