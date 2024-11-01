const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Embed = require('../models/Embed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendembed')
        .setDescription('Send an embed from a selected JSON file to a specified channel.')
        .addStringOption(option =>
            option.setName('jsonfile')
                .setDescription('The name of the JSON file to use.')
                .setRequired(true)
                .setAutocomplete(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the embed to.')
                .setRequired(true)),
    adminOnly: true,

    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const templatesPath = path.join(__dirname, '../utils/templates');
        
        try {
            const files = fs.readdirSync(templatesPath)
                .filter(file => file.endsWith('.json'))
                .map(file => file.replace('.json', ''));

            const filtered = files.filter(file => 
                file.toLowerCase().includes(focusedValue.toLowerCase()));

            await interaction.respond(
                filtered.slice(0, 25).map(file => ({
                    name: file,
                    value: file
                }))
            );
        } catch (error) {
            console.error('Error reading template directory:', error);
            await interaction.respond([]);
        }
    },

    async execute(interaction) {
        const jsonFileName = interaction.options.getString('jsonfile');
        const channel = interaction.options.getChannel('channel');

        const linksPath = path.join(__dirname, '../utils/templates', jsonFileName + '.json');
        let embedData;

        try {
            embedData = JSON.parse(fs.readFileSync(linksPath, 'utf-8'));
        } catch (error) {
            console.error('Error reading links JSON file:', error);
            return interaction.reply({ content: 'Failed to load the JSON file. Please check the file name.', ephemeral: true });
        }

        const embed = this.createEmbed(embedData);

        try {
            const message = await channel.send({ embeds: [embed] });
            
            await Embed.findOneAndUpdate(
                { channelId: channel.id, jsonFileName: jsonFileName },
                { lastSent: new Date(), embedId: message.id },
                { upsert: true }
            );

            await interaction.reply(`Embed sent to <#${channel.id}> from ${jsonFileName}.`);
        } catch (error) {
            console.error('Error sending embed:', error);
            await interaction.reply({ content: 'Failed to send the embed. Please try again later.', ephemeral: true });
        }
    },

    createEmbed(data) {
        const embed = {
            color: data.color ? parseInt(data.color.replace('#', '0x')) : 0x0099ff,
            title: data.title || 'Default Title',
            description: data.description || '',
            footer: data.footer ? {
                text: data.footer.text,
                icon_url: data.footer.icon_url
            } : undefined,
            image: data.image ? { url: data.image.url } : undefined,
            thumbnail: data.thumbnail ? { url: data.thumbnail.url } : undefined,
            fields: data.fields || []
        };
        return embed;
    }
};