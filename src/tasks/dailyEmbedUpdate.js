const fs = require('fs');
const path = require('path');
const Embed = require('../models/Embed');

module.exports = {
    runInterval: 10000,
    async run(client) {
        const embeds = await Embed.find();

        for (const embed of embeds) {
            const linksPath = path.join(__dirname, '../utils/templates', embed.jsonFileName + '.json');
            let embedData;

            try {
                embedData = JSON.parse(fs.readFileSync(linksPath, 'utf-8'));
            } catch (error) {
                continue;
            }

            const channel = client.channels.cache.get(embed.channelId);
            if (!channel) {
                continue;
            }

            try {
                const message = await channel.messages.fetch(embed.embedId);
                const embedToUpdate = this.createEmbed(embedData);
                await message.edit({ embeds: [embedToUpdate] });
                embed.lastSent = new Date();
                await embed.save();
            } catch (error) {
                if (error.code === 10008) {
                    await Embed.deleteOne({ _id: embed._id });
                }
            }
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
