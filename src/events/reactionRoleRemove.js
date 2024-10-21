const { Events } = require('discord.js');
const Rules = require('../models/RulesEmbed');

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction, user) {
        if (user.bot) return;

        const rulesConfig = await Rules.findOne({ embedId: reaction.message.id });
        if (!rulesConfig) return;

        const reactionData = rulesConfig.reactions.find(r => r.emoji === reaction.emoji.name);
        if (reactionData) {
            const member = await reaction.message.guild.members.fetch(user.id);
            const role = reaction.message.guild.roles.cache.get(reactionData.roleId);
            if (role) {
                await member.roles.remove(role);
            }
        }
    },
};
