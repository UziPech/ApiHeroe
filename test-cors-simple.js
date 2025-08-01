// Script de prueba simple para CORS
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000'; // Probar localmente primero

async function testCORS() {
  console.log('🧪 Probando CORS localmente...\n');

  try {
    // Probar endpoint raíz
    console.log('1. Probando endpoint raíz...');
    const rootResponse = await fetch(`${API_URL}/`);
    console.log('Status:', rootResponse.status);
    console.log('CORS Headers:');
    console.log('- Access-Control-Allow-Origin:', rootResponse.headers.get('Access-Control-Allow-Origin'));

    // Probar OPTIONS en /api/users/login
    console.log('\n2. Probando OPTIONS en /api/users/login...');
    const optionsResponse = await fetch(`${API_URL}/api/users/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log('Status:', optionsResponse.status);
    console.log('CORS Headers:');
    console.log('- Access-Control-Allow-Origin:', optionsResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('- Access-Control-Allow-Methods:', optionsResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('- Access-Control-Allow-Headers:', optionsResponse.headers.get('Access-Control-Allow-Headers'));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCORS(); 