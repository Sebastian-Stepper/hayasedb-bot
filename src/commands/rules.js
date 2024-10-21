const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const Rules = require('../models/RulesEmbed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('Post the server rules and set up reaction roles.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to post the rules embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji for the reaction role')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to assign when reacting with the emoji')
                .setRequired(true)),
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

        const rulesEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(rulesData.title)
            .setDescription(rulesData.description)
            .addFields(rulesData.fields)
            .setFooter({ text: rulesData.footer.replace('{emoji}', emoji) });

        const message = await channel.send({ embeds: [rulesEmbed] });
        await message.react(emoji);

        const rulesConfig = new Rules({
            embedId: message.id,
            channelId: channel.id,
            guildId: interaction.guild.id,
            reactions: [
                {
                    emoji: emoji,
                    roleId: role.id,
                },
            ],
        });

        await rulesConfig.save();

        await interaction.reply(`Rules posted in ${channel} with the ${emoji} emoji for role assignment.`);
    },
};
