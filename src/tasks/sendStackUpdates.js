const { sendStackUpdates } = require('../services/portainerService');
const Config = require('../models/Config');

module.exports = {
    runInterval: 30 * 1000,
    async run(client) {
        const config = await Config.findOne({ key: 'portainerStatusChannel' });
        const channelId = config ? config.value : null;

        if (channelId) {
            const channel = client.channels.cache.get(channelId);

            if (channel) {
                sendStackUpdates(channel)
                    .catch(() => {});

                setInterval(() => {
                    sendStackUpdates(channel)
                        .catch(() => {});
                }, this.runInterval);
            }
        }
    },
};
