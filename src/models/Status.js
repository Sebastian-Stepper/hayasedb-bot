const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
    channelId: { type: String, required: true },
    embedId: { type: String, required: true },
    data: { type: Array, required: true },
    lastSent: { type: Date, default: Date.now },
});

const Status = mongoose.model('Status', statusSchema);
module.exports = Status;
