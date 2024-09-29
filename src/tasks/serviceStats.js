const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { fetchStacks, fetchContainers } = require('../services/portainerService');
const { EMBED_COLORS, EMOJIS, STACK_STATUS } = require('../config');

const dataDirPath = path.join(__dirname, '../..', 'data');
const dataFilePath = path.join(dataDirPath, 'stackMessages.json');

function ensureDataDirExists() {
    if (!fs.existsSync(dataDirPath)) {
        fs.mkdirSync(dataDirPath, { recursive: true });
    }
}
ensureDataDirExists();

function loadStackMessages() {
    if (fs.existsSync(dataFilePath)) {
        const rawData = fs.readFileSync(dataFilePath);
        stackMessageMap = JSON.parse(rawData);
    }
}

function saveStackMessages() {
    fs.writeFileSync(dataFilePath, JSON.stringify(stackMessageMap, null, 2));
}
let stackMessageMap = {};

loadStackMessages();

async function sendStackUpdates(channel) {
    try {
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

            const stackStatus = determineStackStatus(totalContainers, runningContainers);
            const stackEmoji = EMOJIS[stackStatus];
            const embedColor = EMBED_COLORS[stackStatus];

            const embed = createStackEmbed(stack, stackStatus, runningContainers, totalContainers, stackContainers, stackEmoji, embedColor);

            if (stackMessageMap[stack.Id]) {
                const message = await channel.messages.fetch(stackMessageMap[stack.Id]);
                await message.edit({ embeds: [embed] });
            } else {
                const message = await channel.send({ embeds: [embed] });
                stackMessageMap[stack.Id] = message.id;
            }
        }

        saveStackMessages();
    } catch (err) {
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
        return STACK_STATUS.OFFLINE;
    } else if (runningContainers === totalContainers) {
        return STACK_STATUS.RUNNING;
    } else {
        return STACK_STATUS.PARTIALLY_RUNNING;
    }
}

function createStackEmbed(stack, stackStatus, runningContainers, totalContainers, stackContainers, stackEmoji, embedColor) {
    return new EmbedBuilder()
        .setTitle(`${stackEmoji} **${stack.Name || 'Unknown Stack'}**`)
        .setColor(embedColor)
        .setDescription(`**Status:** ${stackStatus}\n` +
            `**Containers:** ${runningContainers}/${totalContainers}`)
        .addFields({
            name: 'Services:',
            value: stackContainers.length > 0
                ? stackContainers.map(c => {
                    const containerEmoji = c.state === 'running' ? '🟢' : '🔴';
                    return `- ${containerEmoji} **${c.name}**`;
                }).join('\n')
                : 'No containers found.',
        })
        .setTimestamp();
}

module.exports = { sendStackUpdates };
