const mongoose = require('mongoose');

const PortainerStacksSchema = new mongoose.Schema({
    stackId: {
        type: String,
        unique: true,
    },
    messageId: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
});

const PortainerStacks = mongoose.model('PortainerStacks', PortainerStacksSchema);

module.exports = PortainerStacks;
