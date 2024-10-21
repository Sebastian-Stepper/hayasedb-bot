const mongoose = require('mongoose');

const embedSchema = new mongoose.Schema({
    stackId: {
        type: String,
        required: true,
        unique: true,
    },
    messageId: {
        type: String,
        required: true,
    },
});

const Embed = mongoose.model('Embed', embedSchema);

module.exports = Embed;
