const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resolved: {
        type: Boolean,
        default: false,
    },
    messages: [{
        type: String,
    }]
});

module.exports = mongoose.model('Ticket', ticketSchema);
