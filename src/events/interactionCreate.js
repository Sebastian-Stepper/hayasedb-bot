const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        if (interaction.user.id === client.user.id) return;

        try {
            if (interaction.isAutocomplete()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return;
                }

                if (command.adminOnly && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    await interaction.respond([]);
                    return;
                }

                if (!command.autocomplete) {
                    console.error(`No autocomplete function for ${interaction.commandName}`);
                    await interaction.respond([]);
                    return;
                }

                try {
                    await command.autocomplete(interaction);
                } catch (error) {
                    console.error(`Error executing autocomplete for ${interaction.commandName}:`, error);
                    await interaction.respond([]);
                }
                return;
            }

            if (interaction.isCommand()) {
                const command = client.commands.get(interaction.commandName);

                if (!command) {
                    console.error(`No command matching ${interaction.commandName} was found.`);
                    return;
                }

                if (command.adminOnly && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                }

                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(`Error executing command ${interaction.commandName}:`, error);
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } catch (error) {
            console.error('Error in interaction handler:', error);
        }
    },
};