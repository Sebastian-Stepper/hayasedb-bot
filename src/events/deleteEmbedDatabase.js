const Embed = require('../models/Embed');

module.exports = {
    name: 'MessageDelete',
    once: false,
    async execute(message) {
        if (!message.embeds.length) return;

        try {
            const embedRecord = await Embed.findOne({ embedId: message.id });
            if (embedRecord) {
                await Embed.deleteOne({ embedId: message.id });
                console.log(`Deleted embed record for message ID: ${message.id}`);
            }
        } catch (error) {
            console.error('Error deleting embed record:', error);
        }
    },
};
