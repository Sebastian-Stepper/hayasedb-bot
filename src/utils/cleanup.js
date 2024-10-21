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
                            console.log(`Removed invalid rules entry with embedId: ${embedId}`);
                        }
                    }
                } else {
                    await Rules.deleteOne({ _id: entry._id });
                    console.log(`Removed invalid rules entry with embedId: ${embedId} due to missing channel.`);
                }
            } else {
                await Rules.deleteOne({ _id: entry._id });
                console.log(`Removed invalid rules entry with embedId: ${embedId} due to missing guild.`);
            }
        }

        console.log('Validation of rules embeds completed.');
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
                            console.log(`Removed invalid portainer stack entry with messageId: ${messageId}`);
                        }
                    }
                } else {
                    await PortainerStacks.deleteOne({ _id: entry._id });
                    console.log(`Removed invalid portainer stack entry with messageId: ${messageId} due to missing channel.`);
                }
            } else {
                await PortainerStacks.deleteOne({ _id: entry._id });
                console.log(`Removed invalid portainer stack entry with messageId: ${messageId} due to missing guild.`);
            }
        }

        console.log('Validation of portainer stacks embeds completed.');
    } catch (error) {
        console.error('Error validating portainer stacks embeds:', error);
    }
}


module.exports = {validateRulesEmbeds, validatePortainerStacksEmbeds};
