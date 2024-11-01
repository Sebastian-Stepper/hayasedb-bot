const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchUptimeKumaMetrics } = require('../services/uptimeKuma');
const Status = require('../models/Status');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check the status from the Uptime Kuma API and send an embed with the stats.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Channel to send the status embed')
                .setRequired(true)),
    adminOnly: true,

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        try {
            const data = await fetchUptimeKumaMetrics();
            const embed = this.createEmbed(data);

            const message = await channel.send({ embeds: [embed] });

            const statusEntry = new Status({
                channelId: channel.id,
                embedId: message.id,
                data: data,
                lastSent: new Date(),
            });
            await statusEntry.save();

            await interaction.reply({ content: `Status embed sent to ${channel}!`, ephemeral: true });

        } catch (error) {
            console.error('Error fetching data from Uptime Kuma:', error);
            await interaction.reply({ content: 'There was an error trying to fetch the Uptime Kuma status. Please try again later.', ephemeral: true });
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
