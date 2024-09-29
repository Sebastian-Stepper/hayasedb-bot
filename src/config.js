const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

const PORTAINER_URL = process.env.PORTAINER_URL;
const PORTAINER_TOKEN = process.env.PORTAINER_TOKEN;

const EMBED_COLORS = {
    RUNNING: '#43B581',
    PARTIALLY_RUNNING: '#F47C7C',
    OFFLINE: '#F47C7C',
};

const EMOJIS = {
    RUNNING: '🟢',
    PARTIALLY_RUNNING: '⚠️',
    OFFLINE: '🚫',
};

const STACK_STATUS = {
    RUNNING: 'RUNNING',
    PARTIALLY_RUNNING: 'PARTIALLY_RUNNING',
    OFFLINE: 'OFFLINE',
};

module.exports = {
    DISCORD_TOKEN,
    GUILD_ID,
    CHANNEL_ID,
    PORTAINER_URL,
    PORTAINER_TOKEN,
    EMBED_COLORS,
    EMOJIS,
    STACK_STATUS,
};
