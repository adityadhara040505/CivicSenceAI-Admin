const cron = require('node-cron');
const { runFullScrape, getStatus } = require('./scraper');

let scheduledJob = null;

/**
 * Initialize the scheduled scraping cron job
 * Runs daily at 2:00 AM IST (20:30 UTC previous day)
 */
function initScheduledScraping() {
    // Run every day at 2:00 AM IST
    scheduledJob = cron.schedule('0 2 * * *', async () => {
        console.log('\n⏰ [CRON] Scheduled scraping triggered at', new Date().toISOString());

        const status = getStatus();
        if (status.isRunning) {
            console.log('⏰ [CRON] Scraping already in progress, skipping scheduled run');
            return;
        }

        try {
            const result = await runFullScrape();
            console.log('⏰ [CRON] Scheduled scraping completed:', JSON.stringify(result.summary, null, 2));
        } catch (error) {
            console.error('⏰ [CRON] Scheduled scraping failed:', error.message);
        }
    }, {
        scheduled: true,
        timezone: 'Asia/Kolkata'
    });

    console.log('⏰ Scheduled scraping initialized - runs daily at 2:00 AM IST');
}

/**
 * Stop the scheduled scraping
 */
function stopScheduledScraping() {
    if (scheduledJob) {
        scheduledJob.stop();
        console.log('⏰ Scheduled scraping stopped');
    }
}

module.exports = { initScheduledScraping, stopScheduledScraping };
