const { SlashCommandBuilder } = require('discord.js');
const Config = require('../models/Config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setportainerchannel')
        .setDescription('Set the channel for Portainer status updates.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set for Portainer status updates')
                .setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        const channelId = interaction.options.getChannel('channel').id;

        try {
            await Config.findOneAndUpdate(
                { key: 'portainerStatusChannel' },
                { value: channelId },
                { upsert: true, new: true }
            );

            await interaction.reply(`Portainer status channel has been set to <#${channelId}>.`);
        } catch (error) {
            console.error('Error saving the Portainer status channel:', error);
            await interaction.reply({ content: 'Failed to set the Portainer status channel. Please try again later.', ephemeral: true });
        }
    },
};
