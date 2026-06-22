import { getLiveTenders } from './app/scraper';

async function run() {
  console.log('Prepopulating cache with all tenders sequentially...');
  try {
    const tenders = await getLiveTenders();
    console.log(`Cache successfully prepopulated with ${tenders.length} total tenders!`);
  } catch (err) {
    console.error('Failed to prepopulate:', err);
  }
}

run();
