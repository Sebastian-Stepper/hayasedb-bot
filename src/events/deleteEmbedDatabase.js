const Embed = require('../models/Embed');
const Status = require('../models/Status');

module.exports = {
    name: 'MessageDelete',
    once: false,
    async execute(message) {
        
        if (!message.embeds.length) return;

        try {
            let embedRecord = await Embed.findOne({ embedId: message.id });
            if (embedRecord) {
                await Embed.deleteOne({ embedId: message.id });
                
                await Status.deleteOne({ embedId: message.id });
            } else {
                let statusRecord = await Status.findOne({ embedId: message.id });
                if (statusRecord) {
                    await Status.deleteOne({ embedId: message.id });
                }
            }
        } catch (error) {
        }
    },
};
