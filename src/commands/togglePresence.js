const { SlashCommandBuilder } = require('@discordjs/builders');
const Config = require('../models/Config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('togglepresence')
        .setDescription('Toggles the presence setting for the bot.'),
    async execute(interaction) {
        try {
            let config = await Config.findOne({ key: 'presenceSetter' });

            if (!config) {
                config = new Config({ key: 'presenceSetter', value: 'true' });
                await config.save();
            }

            const newValue = config.value === 'true' ? 'false' : 'true';

            await Config.updateOne({ key: 'presenceSetter' }, { value: newValue });

            return interaction.reply({ content: `Presence setting has been toggled to: ${newValue === 'true' ? 'enabled' : 'disabled'}.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'An error occurred while toggling the presence setting.', ephemeral: true });
        }
    },
};
