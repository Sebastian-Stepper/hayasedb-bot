const axios = require('axios');
const { UPTIME_KUMA_API_URL, UPTIME_KUMA_API_KEY } = require('../utils/config')


async function fetchUptimeKumaMetrics() {
    try {
        const response = await axios.get(UPTIME_KUMA_API_URL, {
            auth: {
                username: '',
                password: UPTIME_KUMA_API_KEY,
            },
        });

        if (response.status === 200) {
            return parseMetrics(response.data);
        } else {
            throw new Error(`Failed to fetch data. HTTP Status Code: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching Uptime Kuma data:', error);
        throw error;
    }
}

function parseMetrics(responseData) {
    const regexStatus = /monitor_status\{(.*?)\} (\d+)/g;
    const regexResponseTime = /monitor_response_time\{(.*?)\} (\d+)/g;
    const data = [];

    const statuses = {};
    const responseTimes = {};

    let match;
    while ((match = regexStatus.exec(responseData)) !== null) {
        const labels = {};
        const parts = match[1].split(',');

        parts.forEach(part => {
            const [key, value] = part.split('=').map(p => p.trim());
            labels[key] = value.replace(/"/g, '');
        });

        statuses[labels['monitor_name']] = {
            ...labels,
            status: parseInt(match[2], 10),
        };
    }

    while ((match = regexResponseTime.exec(responseData)) !== null) {
        const labels = {};
        const parts = match[1].split(',');

        parts.forEach(part => {
            const [key, value] = part.split('=').map(p => p.trim());
            labels[key] = value.replace(/"/g, '');
        });

        responseTimes[labels['monitor_name']] = {
            ...labels,
            responseTime: parseFloat(match[2]),
        };
    }

    Object.keys(statuses).forEach(monitorName => {
        const statusData = statuses[monitorName];
        const responseTimeData = responseTimes[monitorName];

        data.push({
            monitor_name: statusData.monitor_name,
            monitor_type: statusData.monitor_type,
            monitor_url: statusData.monitor_url,
            monitor_hostname: statusData.monitor_hostname,
            monitor_port: statusData.monitor_port,
            status: statusData.status,
            responseTime: responseTimeData ? responseTimeData.responseTime : -1,
        });
    });

    return data;
}

module.exports = {
    fetchUptimeKumaMetrics,
};
