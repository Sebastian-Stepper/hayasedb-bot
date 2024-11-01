const mongoose = require('mongoose');

const embedSchema = new mongoose.Schema({
    channelId: { type: String, required: true, unique: true },
    lastSent: { type: Date, required: true },
    embedId: { type: String, required: true },
    jsonFileName: { type: String, required: true },
});

module.exports = mongoose.model('Embed', embedSchema);
