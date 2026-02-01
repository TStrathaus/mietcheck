// test-gemini-models.js
const apiKey = 'AIzaSyAzMUnb-EpWEC25L8yskJLR4u3gKmkWBX0';

async function listModels() {
  try {
    console.log('Fetching available models...\n');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', response.status, errorText);
      return;
    }

    const data = await response.json();
    
    console.log('Available Models:\n');
    
    if (data.models && data.models.length > 0) {
      data.models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });
    } else {
      console.log('No models found!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
