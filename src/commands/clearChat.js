const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cc')
        .setDescription('Clear messages in a channel.')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(false))
        .addUserOption(option => 
            option.setName('user')
                .setDescription('Specific user to delete messages from')
                .setRequired(false))
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Channel to clear messages from')
                .setRequired(false)),
    adminOnly: true,
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const user = interaction.options.getUser('user');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        if (!channel.isTextBased()) {
            return interaction.reply({ content: 'Please specify a text-based channel.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            if (amount) {
                const messages = await channel.messages.fetch({ limit: amount });
                const messagesToDelete = user ? messages.filter(msg => msg.author.id === user.id) : messages;
                await channel.bulkDelete(messagesToDelete, true);
                interaction.editReply({ content: `Cleared ${messagesToDelete.size} messages${user ? ` from ${user.tag}` : ''} in ${channel}.` });
            } else {
                let totalDeleted = 0;
                let fetched;

                do {
                    fetched = await channel.messages.fetch({ limit: 100 });
                    const messagesToDelete = user ? fetched.filter(msg => msg.author.id === user.id) : fetched;
                    await channel.bulkDelete(messagesToDelete, true);
                    totalDeleted += messagesToDelete.size;
                } while (fetched.size >= 2);

                interaction.editReply({ content: `Cleared ${totalDeleted} messages${user ? ` from ${user.tag}` : ''} in ${channel}.` });
            }
        } catch (error) {
            console.error(error);
            interaction.editReply({ content: 'There was an error clearing the messages.' });
        }
    }
};
