const { sendStackUpdates } = require('../services/portainerService');

module.exports = {
    runInterval: 30 * 1000,
    run(client) {
        const channel = client.channels.cache.get(process.env.PORTAINER_STATUS_CHANNEL_ID);

        if (channel) {
            sendStackUpdates(channel)
                .catch(() => {});

            setInterval(() => {
                sendStackUpdates(channel)
                    .catch(() => {});
            }, this.runInterval);
        }
    },
};
