const { detectIntent } = require('./rag/intentDetector');
(async ()=>{
  try{
    const res = await detectIntent('HP Envy 13 10 vs HP Envy 13 28');
    console.log(JSON.stringify(res, null, 2));
  }catch(e){console.error(e)}
})();
