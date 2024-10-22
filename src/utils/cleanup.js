const { Client } = require('discord.js');
const Rules = require('../models/RulesEmbed');
async function validateRulesEmbeds(client) {
    try {
        const rulesEntries = await Rules.find();

        for (const entry of rulesEntries) {
            const { embedId, channelId, guildId } = entry;

            const guild = await client.guilds.fetch(guildId);
            if (guild) {
                const channel = await guild.channels.fetch(channelId);
                if (channel) {
                    try {
                        const message = await channel.messages.fetch(embedId);
                    } catch (error) {
                        if (error.code === 10008) {
                            await Rules.deleteOne({ _id: entry._id });
                        }
                    }
                } else {
                    await Rules.deleteOne({ _id: entry._id });
                }
            } else {
                await Rules.deleteOne({ _id: entry._id });
            }
        }

    } catch (error) {
        console.error('Error validating rules embeds:', error);
    }
}


const PortainerStacks = require('../models/PortainerStacks');
async function validatePortainerStacksEmbeds(client) {
    try {
        const stacksEntries = await PortainerStacks.find();

        for (const entry of stacksEntries) {
            const { messageId, channelId, guildId } = entry;

            const guild = await client.guilds.fetch(guildId);
            if (guild) {
                const channel = await guild.channels.fetch(channelId);
                if (channel) {
                    try {
                        const message = await channel.messages.fetch(messageId);
                    } catch (error) {
                        if (error.code === 10008) {
                            await PortainerStacks.deleteOne({ _id: entry._id });
                        }
                    }
                } else {
                    await PortainerStacks.deleteOne({ _id: entry._id });
                }
            } else {
                await PortainerStacks.deleteOne({ _id: entry._id });
            }
        }

    } catch (error) {
    }
}


module.exports = {validateRulesEmbeds, validatePortainerStacksEmbeds};
