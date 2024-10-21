const { EmbedBuilder } = require('discord.js');
const Config = require('../models/Config');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        const config = await Config.findOne({ key: 'welcomeChannel' });
        const channelId = config ? config.value : null;
        const channel = channelId ? member.guild.channels.cache.get(channelId) : null;

        if (!channel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor('#b396e9')
            .setTitle('👋 Welcome to HayaseDB!')
            .setDescription(`Hey, ${member}!\nWe're excited to have you here.`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Enjoy your stay!' });

        await channel.send({ embeds: [welcomeEmbed] });
    },
};
