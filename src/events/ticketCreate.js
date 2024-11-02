const { Events, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Config = require('../models/Config');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.customId === 'close_ticket') {
            try {
                const channel = interaction.channel;
        
                if (channel.name.startsWith('ticket-')) {
                    await interaction.reply({ content: 'Closing the ticket...', ephemeral: true });
        
                    const config = await Config.findOne({ key: 'closedTicketsCategoryId' });
                    const closedTicketsCategoryId = config ? config.value : null;
        
                    await channel.permissionOverwrites.edit(interaction.user.id, {
                        ViewChannel: false,
                    });
        
                    if (closedTicketsCategoryId) {
                        const closedCategory = interaction.guild.channels.cache.get(closedTicketsCategoryId);
                        if (closedCategory) {
                            await channel.setParent(closedCategory.id, { lockPermissions: false });
        
                            const embed = new EmbedBuilder()
                                .setTitle('Ticket Closed')
                                .setDescription(`This ticket has been closed and moved to ${closedCategory.name}.`)
                                .setColor('#ff0000');
        
                            const deleteButton = new ButtonBuilder()
                                .setCustomId('delete_ticket')
                                .setLabel('Delete Ticket')
                                .setStyle(ButtonStyle.Danger);
        
                            const buttonRow = new ActionRowBuilder()
                                .addComponents(deleteButton);
        
                            await channel.send({ embeds: [embed], components: [buttonRow] });
        
                            await interaction.followUp({ content: 'Ticket closed successfully.', ephemeral: true });
                        } else {
                            await interaction.followUp({ content: 'Closed tickets category not found.', ephemeral: true });
                        }
                    } else {
                        await interaction.followUp({ content: 'Closed tickets category ID not found in configuration.', ephemeral: true });
                    }
                }
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error closing the ticket.', ephemeral: true });
            }
        }
        

        if (interaction.customId === 'delete_ticket') {
            try {
                const channel = interaction.channel;

                if (channel.name.startsWith('ticket-')) {
                    await interaction.reply({ content: 'Deleting the ticket...', ephemeral: true });

                    await channel.delete();

                } else {
                    await interaction.reply({ content: 'This command can only be used in ticket channels.', ephemeral: true });
                }
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error deleting the ticket.', ephemeral: true });
            }
        }

        if (interaction.customId === 'create_ticket') {
            try {
                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: 0,
                    topic: 'Support ticket for ' + interaction.user.username,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                });

                const ticketEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('🎟️ Ticket Created')
                    .setDescription(`Hello ${interaction.user.username}, this is your support ticket. Please describe your issue or question.`)
                    .setTimestamp()
                    .setFooter({ text: 'Click the button below to close this ticket.' });

                const closeButton = new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder().addComponents(closeButton);

                await ticketChannel.send({ embeds: [ticketEmbed], components: [row] });

                await interaction.reply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error creating the ticket channel.', ephemeral: true });
            }
        }

        if (interaction.customId === 'ticket_type') {
            const selectedType = interaction.values[0];
            if (selectedType === 'select_type') {
                await interaction.deferUpdate();
                return;
            }
            try {
                const config = await Config.findOne({ key: 'ticketCategoryId' });
                const ticketsCategoryId = config ? config.value : null;

                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}-${selectedType}`,
                    type: 0,
                    parent: ticketsCategoryId,
                    topic: `Support ticket for ${interaction.user.username} - Type: ${selectedType}`,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                });
        
                let embedDescription = `Hello ${interaction.user.username}, this is your support ticket for ${selectedType}. Please describe your issue or question.`;
                switch (selectedType) {
                    case 'general_help':
                        embedDescription = `Hello ${interaction.user.username}, this is your support ticket for General Help. Please describe your issue or question.`;
                        break;
                    case 'development_help':
                        embedDescription = `Hello ${interaction.user.username}, this is your support ticket for Development Help. Please specify the technical coding issue you are facing.`;
                        break;
                        case 'application':
                            embedDescription = `Hello ${interaction.user.username}, this is your support ticket for Applications. Please share your skills, experience, and answer the following questions:\n\n- What position are you applying for?\n- How did you find us?\n- What relevant experience do you have in this field?\n- Have you worked with any specific tools or technologies related to this position?\n- What challenges have you faced in past projects, and how did you overcome them?\n- Do you have any questions about the application process?`;
                            break;                        
                    case 'other':
                        embedDescription = `Hello ${interaction.user.username}, this is your support ticket for Other. Please specify the type of other issue you have (e.g., copyright claims, legal matters).`;
                        break;
                }
        
                const ticketEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('🎟️ Ticket Created')
                    .setDescription(embedDescription)
                    .setTimestamp()
                    .setFooter({ text: 'Click the button below to close this ticket.' });
        
                const closeButton = new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Danger);
        
                const row = new ActionRowBuilder().addComponents(closeButton);
        
                await ticketChannel.send({ embeds: [ticketEmbed], components: [row] });
        
                await interaction.reply({ content: `Ticket created for ${selectedType}: ${ticketChannel}`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error creating the ticket channel based on the selected type.', ephemeral: true });
            }
        }
        
    },
};
