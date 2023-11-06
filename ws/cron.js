const cron = require('node-cron');
const { deleteClient, clients } = require('./ws');

const startWSConnectionCheckCronJob = () => {
  cron.schedule('*/5 * * * * *', () => {
    const now = new Date();
    [...clients].forEach((c) => {
      if (!c.isActive && (now - c.createdAt) / 1000 > 30) {
        console.log(`[Iridium WS - Cron Job] Deleting inactive client ${c.id}`);
        deleteClient(c.id);
      }
    });
  });
  console.log('[Iridium WS - Cron Job] WS connection check cron job started');
};

module.exports = {
  startWSConnectionCheckCronJob,
};
