const axios = require('axios');
const config = require('../config');

async function fetchStacks() {
    try {
        const response = await axios.get(config.PORTAINER_URL, {
            headers: {
                'X-API-Key': config.PORTAINER_TOKEN,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching stacks:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function fetchContainers() {
    try {
        const response = await axios.get('https://dev.hayasedb.com/api/endpoints/2/docker/containers/json?all=true', {
            headers: {
                'X-API-Key': config.PORTAINER_TOKEN,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching containers:', error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = {
    fetchStacks,
    fetchContainers,
};
