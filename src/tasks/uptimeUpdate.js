const fs = require('fs');
const path = require('path');
const Status = require('../models/Status');
const Embed = require('../models/Embed');
const { fetchUptimeKumaMetrics } = require('../services/uptimeKuma');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    runInterval: 10000,
    async run(client) {
        const statuses = await Status.find();

        for (const status of statuses) {
            const data = await fetchUptimeKumaMetrics();
            const updatedEmbed = this.createEmbed(data);

            const channel = client.channels.cache.get(status.channelId);
            if (!channel) {
                continue;
            }

            try {
                const message = await channel.messages.fetch(status.embedId);
                await message.edit({ embeds: [updatedEmbed] });
                status.lastSent = new Date();
                await status.save();
            } catch (error) {
                if (error.code === 10008) {
                    await Status.deleteOne({ _id: status._id });

                    await Embed.deleteOne({ embedId: status.embedId });
                }
            }
        }
    },

    createEmbed(data) {
        const groupsData = data.filter(item => item.monitor_type === 'group');
        
        const description = groupsData.map(item => {
            let statusEmoji = '';
            switch (item.status) {
                case 0: statusEmoji = '🔴'; break; // Offline
                case 1: statusEmoji = '🟢'; break; // Online
                case 2: statusEmoji = '🟡'; break; // Warning
                case 3: statusEmoji = '🔵'; break; // Maintenance
                default: statusEmoji = '❓'; // Unknown
            }
            return `${statusEmoji} | ${item.monitor_name}`;
        }).join('\n');
        
        const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('HayaseDB Status')
        .setDescription(description || 'No data available')
        .addFields({ name: 'View Detailed Status', value: '[Click Here](https://status.hayasedb.com)', inline: false })
        .setTimestamp();

    return embed;
        
    },
};
