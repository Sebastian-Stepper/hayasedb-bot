const { SlashCommandBuilder } = require('discord.js');
const Config = require('../models/Config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwelcomechannel')
        .setDescription('Set the welcome channel for the server.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set as the welcome channel')
                .setRequired(true)),
    async execute(interaction) {
        const channelId = interaction.options.getChannel('channel').id;

        try {
            await Config.findOneAndUpdate(
                { key: 'welcomeChannel' },
                { value: channelId },
                { upsert: true, new: true }
            );

            await interaction.reply(`Welcome channel has been set to <#${channelId}>.`);
        } catch (error) {
            console.error('Error saving the welcome channel:', error);
            await interaction.reply({ content: 'Failed to set the welcome channel. Please try again later.', ephemeral: true });
        }
    },
};
