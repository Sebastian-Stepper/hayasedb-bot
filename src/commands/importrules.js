const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Rules = require('../models/RulesEmbed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('importrules')
        .setDescription('Import an existing rules embed using its message ID.')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('The ID of the message containing the rules embed.')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to post the imported rules embed.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji for the reaction role.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to assign when reacting with the emoji.')
                .setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        const messageId = interaction.options.getString('messageid');
        const channel = interaction.options.getChannel('channel');
        const emoji = interaction.options.getString('emoji');
        const role = interaction.options.getRole('role');

        let originalMessage;

        try {
            originalMessage = await channel.messages.fetch(messageId);
        } catch (error) {
            console.error('Error fetching the message:', error);
            return interaction.reply({ content: 'Failed to find the message. Please check the ID and try again.', ephemeral: true });
        }

        const rulesEmbed = new EmbedBuilder()
            .setColor(originalMessage.embeds[0].color || '#FF0000')
            .setTitle(originalMessage.embeds[0].title)
            .setDescription(originalMessage.embeds[0].description)
            .addFields(originalMessage.embeds[0].fields)
            .setFooter({ text: originalMessage.embeds[0].footer.text.replace('{emoji}', emoji) });

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

        await interaction.reply(`Imported rules posted in ${channel} with the ${emoji} emoji for role assignment.`);
    },
};
