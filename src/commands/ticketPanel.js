const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const Config = require('../models/Config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketpanel')
        .setDescription('Create a ticket panel')
        .addChannelOption(option => 
            option.setName('ticketcategory')
            .setDescription('Select the category for ticket channels')
            .addChannelTypes(4)
            .setRequired(true))
        .addChannelOption(option => 
            option.setName('closedcategory')
            .setDescription('Select the category for closed ticket channels')
            .addChannelTypes(4)
            .setRequired(true)),
    adminOnly: true,

    async execute(interaction) {
        const ticketCategory = interaction.options.getChannel('ticketcategory');
        const closedCategory = interaction.options.getChannel('closedcategory');

        const embed = new EmbedBuilder()
            .setTitle('Support Ticket System')
            .setDescription('Select a ticket type below to create a ticket.');

        const ticketTypeSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_type')
            .setPlaceholder('Select a ticket type')
            .addOptions([
                {
                    label: 'General Help',
                    value: 'general_help',
                },
                {
                    label: 'Development Help',
                    value: 'development_help',
                },
                {
                    label: 'Application',
                    value: 'application',
                },
                {
                    label: 'Other',
                    value: 'other',
                },
            ]);

        const row = new ActionRowBuilder()
            .addComponents(ticketTypeSelectMenu);

        await Config.findOneAndUpdate({ key: 'ticketCategoryId' }, { value: ticketCategory.id }, { upsert: true });
        await Config.findOneAndUpdate({ key: 'closedTicketsCategoryId' }, { value: closedCategory.id }, { upsert: true });

        await interaction.channel.send({ embeds: [embed], components: [row] });
        
        await interaction.reply({ content: 'Ticket panel has been created successfully!', ephemeral: true });
    },
};
