
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { EMBED_COLORS, EMOJIS, STACK_STATUS, PORTAINER_TOKEN, PORTAINER_URL } = require('../utils/config');
const Embed = require('../models/PortainerStacks');


async function fetchStacks() {
    try {
        const response = await axios.get(PORTAINER_URL, {
            headers: {
                'X-API-Key': PORTAINER_TOKEN,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

async function fetchContainers() {
    try {
        const response = await axios.get('https://dev.hayasedb.com/api/endpoints/2/docker/containers/json?all=true', {
            headers: {
                'X-API-Key': PORTAINER_TOKEN,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}


async function sendStackUpdates(channel) {
    try {
        await cleanUpUnknownEmbeds(channel);

        const stacks = await fetchStacks();
        const containers = await fetchContainers();

        if (!stacks || stacks.length === 0) {
            return;
        }

        const containerMap = createContainerMap(containers);

        for (const stack of stacks) {
            const stackContainers = containerMap[stack.Name] || [];
            const runningContainers = stackContainers.filter(c => c.state === 'running').length;
            const totalContainers = stackContainers.length;

            const [stackStatus, stackStatusCode] = determineStackStatus(totalContainers, runningContainers);
            const stackEmoji = EMOJIS[stackStatusCode];
            const embedColor = EMBED_COLORS[stackStatusCode];

            const embed = createStackEmbed(stack, stackStatus, runningContainers, totalContainers, stackContainers, stackEmoji, embedColor);

            let existingEmbed = await Embed.findOne({ stackId: stack.Id });

            if (existingEmbed) {
                try {
                    const message = await channel.messages.fetch(existingEmbed.messageId);
                    await message.edit({ embeds: [embed] });
                } catch (error) {
                    if (error.code === 10008) {
                        await Embed.deleteOne({ stackId: stack.Id });

                        const newMessage = await channel.send({ embeds: [embed] });
                        const newEmbed = new Embed({
                            stackId: stack.Id,
                            messageId: newMessage.id,
                            channelId: channel.id,
                            guildId: channel.guild.id,
                        });
                        await newEmbed.save();
                    }
                }
            } else {
                const newMessage = await channel.send({ embeds: [embed] });
                const newEmbed = new Embed({
                    stackId: stack.Id,
                    messageId: newMessage.id,
                    channelId: channel.id,
                    guildId: channel.guild.id,
                });
                await newEmbed.save();
            }
        }
    } catch (err) {
        console.error('Error sending stack updates:', err);
    }
}


async function cleanUpUnknownEmbeds(channel) {
    try {
        const messages = await channel.messages.fetch({ limit: 100 });

        for (const message of messages.values()) {
            if (message.author.id === channel.client.user.id) {
                if (message.embeds.length === 0) {
                    await message.delete();
                    console.log(`Deleted unknown message from bot: ${message.id}`);
                } else {
                    const embedEntry = await Embed.findOne({ messageId: message.id });

                    if (!embedEntry) {
                        await message.delete();
                        console.log(`Deleted unknown embed message from bot: ${message.id}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error cleaning up unknown embeds:', error);
    }
}


function createContainerMap(containers) {
    return containers.reduce((map, container) => {
        const projectName = container.Labels['com.docker.compose.project'] || 'Unknown Project';
        if (!map[projectName]) map[projectName] = [];
        map[projectName].push({
            name: container.Names[0].replace('/', ''),
            state: container.State,
        });
        return map;
    }, {});
}

function determineStackStatus(totalContainers, runningContainers) {
    if (totalContainers === 0) {
        return [STACK_STATUS.OFFLINE, 'OFFLINE'];
    } else if (runningContainers === totalContainers) {
        return [STACK_STATUS.RUNNING, 'RUNNING'];
    } else {
        return [STACK_STATUS.PARTIALLY_RUNNING, 'PARTIALLY_RUNNING'];
    }
}

function createStackEmbed(stack, stackStatus, runningContainers, totalContainers, stackContainers, stackEmoji, embedColor) {

    const generalInfo = `**Status:** ${stackStatus}\n` +
        `**Containers:** ${runningContainers}/${totalContainers}`;

    const containerInfo = stackContainers.length > 0
        ? stackContainers.map(c => {
            const containerEmoji = c.state === 'running' ? '🟢' : '🔴';
            return `- ${containerEmoji} **${c.name}**`;
        }).join('\n')
        : 'No containers found.';

    return new EmbedBuilder()
        .setTitle(`${stackEmoji} **${stack.Name || 'Unknown Stack'}**`)
        .setColor(embedColor)
        .addFields(
            {
                name: 'General Information',
                value: generalInfo,
                inline: true
            },
            {
                name: 'Containers',
                value: containerInfo,
                inline: true
            }
        )
        .setTimestamp();
}

module.exports = { sendStackUpdates };
