const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Rules = require('../models/RulesEmbed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editrules')
        .setDescription('Edit the existing rules embed with updated rules from rules.json')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel where the rules embed was posted')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji for the reaction role')
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to assign when reacting with the emoji')
                .setRequired(false)),
    adminOnly: true,
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const emoji = interaction.options.getString('emoji');
        const role = interaction.options.getRole('role');

        const rulesFilePath = path.join(__dirname, '..', 'utils', 'templates', 'rules.json');
        let rulesData;

        try {
            const rawData = fs.readFileSync(rulesFilePath, 'utf-8');
            rulesData = JSON.parse(rawData);
        } catch (error) {
            console.error('Error reading rules file:', error);
            return interaction.reply({ content: 'Failed to load rules. Please try again later.', ephemeral: true });
        }

        const existingRules = await Rules.findOne({ guildId: interaction.guild.id, channelId: channel.id });
        if (!existingRules) {
            return interaction.reply({ content: 'No existing rules embed found in this channel.', ephemeral: true });
        }

        const updatedRulesEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(rulesData.title)
            .setDescription(rulesData.description)
            .addFields(rulesData.fields)
            .setFooter({ text: rulesData.footer.replace('{emoji}', emoji || existingRules.reactions[0].emoji) });

        try {
            const message = await channel.messages.fetch(existingRules.embedId);
            await message.edit({ embeds: [updatedRulesEmbed] });

            if (emoji) {
                await message.reactions.removeAll();
                await message.react(emoji);
            }

            if (emoji || role) {
                existingRules.reactions[0].emoji = emoji || existingRules.reactions[0].emoji;
                existingRules.reactions[0].roleId = role ? role.id : existingRules.reactions[0].roleId;

                await existingRules.save();
            }

            await interaction.reply({ content: `Rules embed updated successfully in ${channel}.`, ephemeral: true });
        } catch (error) {
            console.error('Error editing rules message:', error);
            return interaction.reply({ content: 'Failed to edit the rules message. Please try again later.', ephemeral: true });
        }
    },
};
