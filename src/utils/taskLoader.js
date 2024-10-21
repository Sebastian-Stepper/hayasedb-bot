const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const tasksPath = path.join(__dirname, '..', 'tasks');
    const taskFiles = fs.readdirSync(tasksPath).filter(file => file.endsWith('.js'));

    for (const file of taskFiles) {
        const task = require(path.join(tasksPath, file));
        if (task.runInterval) {
            setInterval(() => task.run(client), task.runInterval);
        }
    }
};
