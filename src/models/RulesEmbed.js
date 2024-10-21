const mongoose = require('mongoose');

const rulesSchema = new mongoose.Schema({
    embedId: { type: String, required: true },
    channelId: { type: String, required: true },
    guildId: { type: String, required: true },
    reactions: [
        {
            emoji: { type: String, required: true },
            roleId: { type: String, required: true },
        },
    ],
});

const Rules = mongoose.model('RulesEmbed', rulesSchema);
module.exports = Rules;
