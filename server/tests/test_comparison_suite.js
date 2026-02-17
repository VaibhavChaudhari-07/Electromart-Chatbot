const { detectIntent } = require('../rag/intentDetector');
const adaptiveRoute = require('../rag/adaptiveRouter');

async function run() {
  const queries = [
    'HP Envy 13 10 vs HP Envy 13 28',
    'Dell Legion 5 1 vs Dell Legion 5 29',
    'Apple MacBook Pro 14 16 vs HP MacBook Pro 14 34',
    'HP Envy 13 10 vs Dell Envy 13 17',
    'Compare Legion 5 vs ROG Strix G15',
    'Compare top 5 gaming laptops',
    'Which is better Dell XPS 15 6 or Lenovo ThinkPad E14 39?'
  ];

  for (const q of queries) {
    console.log('\n' + '='.repeat(60));
    console.log('Query:', q);

    try {
      const intent = await detectIntent(q);
      console.log('  Detected Intent:', intent.intent, 'confidence:', intent.confidence);
      if (intent.productNames) console.log('  productNames:', intent.productNames);
      if (intent.productIds) console.log('  productIds:', intent.productIds);

      const ctx = await adaptiveRoute(q, intent, {});
      console.log('  Routed to:', ctx.route, 'retrievalType:', ctx.data.retrievalType);
      console.log('  products returned:', (ctx.data.products || []).length);
      (ctx.data.products || []).forEach((p, i) => console.log(`    ${i+1}. ${p.title || p.name} (${p._id || p.id})`));
    } catch (e) {
      console.error('  Error:', e.message);
    }
  }
}

run();
