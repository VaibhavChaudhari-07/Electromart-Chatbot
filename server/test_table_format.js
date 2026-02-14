const axios = require('axios');

const API_URL = 'http://localhost:5000/api/chatbot/response';

async function testTableFormat() {
  try {
    console.log('🧪 TESTING COMPARISON TABLE FORMAT\n');
    console.log('================================================================================\n');

    const testQueries = [
      'Compare iPhone 15 vs Samsung S24',
      'Dell vs HP laptops',
      'MacBook Air vs Dell XPS 13 vs HP Spectre x360'
    ];

    for (const query of testQueries) {
      console.log(`\n📝 Query: "${query}"`);
      console.log('--------------------------------------------------------------------------------');

      try {
        const response = await axios.post(API_URL, { query });
        const { response: chatbotResponse } = response.data;
        
        if (chatbotResponse && chatbotResponse.includes('| Feature |')) {
          console.log('\n📊 FULL TABLE OUTPUT:\n');
          // Extract the table from the response
          const lines = chatbotResponse.split('\n');
          let inTable = false;
          let tableLines = [];
          
          for (const line of lines) {
            if (line.includes('| Feature |')) {
              inTable = true;
            }
            if (inTable) {
              tableLines.push(line);
              if (line.includes('| **Best For** |')) {
                break; // Stop after Best For row
              }
            }
          }
          
          tableLines.forEach(line => console.log(line));
          
          // Check for required fields
          console.log('\n✅ FIELD VALIDATION:');
          const requiredFields = ['Price', 'Rating', 'Processor', 'RAM', 'Storage', 'Display', 'Battery', 'GPU', 'Best For'];
          requiredFields.forEach(field => {
            const present = tableLines.some(line => line.includes(`**${field}**`));
            console.log(`  ${present ? '✅' : '❌'} ${field}`);
          });

          // Check for analysis section
          console.log('\n📋 ANALYSIS SECTION:');
          const analysisStart = chatbotResponse.indexOf('### 💡 **Analysis');
          if (analysisStart > -1) {
            const analysisEnd = chatbotResponse.indexOf('\n\n', analysisStart + 50);
            const analysisSection = chatbotResponse.substring(analysisStart, analysisEnd).split('\n');
            analysisSection.slice(0, 8).forEach(line => console.log(line));
          }
        } else {
          console.log('❌ Response does not contain a comparison table');
          console.log('Response:', chatbotResponse.substring(0, 200));
        }
      } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
      }
      
      console.log('\n================================================================================');
    }
  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

// Give server time to start if needed
setTimeout(testTableFormat, 1000);
