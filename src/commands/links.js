const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('links')
        .setDescription('Send an embed with various links to a specific channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the links embed')
                .setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        const linksPath = path.join(__dirname, '../utils/templates/links.json');
        let links;
        try {
            links = JSON.parse(fs.readFileSync(linksPath, 'utf-8'));
        } catch (error) {
            console.error('Error reading links JSON file:', error);
            return interaction.reply({ content: 'Failed to load links. Please try again later.', ephemeral: true });
        }

        const linkList = links.map(link => `• [${link.name}](${link.url})`).join('\n');

        const embed = {
            color: 0x0099ff,
            title: 'Useful Links',
            description: `Here are some useful links for our project.\n\n${linkList}\n`,
            timestamp: new Date(),
        };

        try {
            await channel.send({ embeds: [embed] });
            await interaction.reply(`Links embed has been sent to <#${channel.id}>.`);
        } catch (error) {
            console.error('Error sending links embed:', error);
            await interaction.reply({ content: 'Failed to send the links embed. Please try again later.', ephemeral: true });
        }
    },
};
