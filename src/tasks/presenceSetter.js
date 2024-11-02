const { ActivityType } = require('discord.js');
const Config = require('../models/Config');

const statuses = [
    { name: 'your tickets!', type: ActivityType.Watching },
    { name: 'HayaseDB status!', type: ActivityType.Listening },
    { name: 'the fun!', type: ActivityType.Watching },
    { name: 'the uptime closely!', type: ActivityType.Watching },
    { name: 'HayaseDB metrics!', type: ActivityType.Listening },
    { name: 'the uptime tracking!', type: ActivityType.Watching },
    { name: 'your queries!', type: ActivityType.Watching },
    { name: 'our API on GitHub!', type: ActivityType.Watching },
    { name: 'our open source project!', type: ActivityType.Watching },
    { name: 'our free code!', type: ActivityType.Watching },
    { name: 'your questions!', type: ActivityType.Listening },
    { name: 'anime tracking become fun!', type: ActivityType.Watching },
    { name: 'your feedback!', type: ActivityType.Listening },
    { name: 'in the HayaseDB community!', type: ActivityType.Playing },
    { name: 'HayaseDB community!', type: ActivityType.Watching },
    { name: 'anime database grow!', type: ActivityType.Watching },
    { name: 'how your input shapes HayaseDB!', type: ActivityType.Watching },
    { name: 'our open source code on GitHub!', type: ActivityType.Watching },
    { name: 'anime data at web.hayasedb.com!', type: ActivityType.Watching },
    { name: 'ad free anime exploration!', type: ActivityType.Watching },
    { name: 'your anime database!', type: ActivityType.Watching },
    { name: 'for your next anime obsession!', type: ActivityType.Watching },
    { name: 'I’m open source too!', type: ActivityType.Watching },
    { name: 'empowering anime enthusiasts!', type: ActivityType.Watching },
    { name: 'embracing the open-source spirit!', type: ActivityType.Watching },
    { name: 'your ultimate anime database!', type: ActivityType.Watching },
];

module.exports = {
    runInterval: 10000,
    async run(client) {
        const config = await Config.findOne({ key: 'presenceSetter' });

        const enableStatusUpdate = config && config.value === 'true';

        if (!enableStatusUpdate) {
            client.user.setPresence({
                activities: [],
                status: 'online',
            });
            return;
        }

        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        console.log(`Setting status: ${randomStatus.name} - Type: ${randomStatus.type}`);

        client.user.setPresence({
            activities: [{ name: randomStatus.name, type: randomStatus.type }],
            status: 'online',
        });
    },
};
