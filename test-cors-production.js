// Script de prueba para CORS en producción
import fetch from 'node-fetch';

const API_URL = 'https://apiheroe.vercel.app';

async function testCORS() {
  console.log('🧪 Probando CORS en producción...\n');

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
        'Origin': 'https://apiheroe-6c7dymssg-uziels-projects-fa4bbf7c.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log('Status:', optionsResponse.status);
    console.log('CORS Headers:');
    console.log('- Access-Control-Allow-Origin:', optionsResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('- Access-Control-Allow-Methods:', optionsResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('- Access-Control-Allow-Headers:', optionsResponse.headers.get('Access-Control-Allow-Headers'));

    // Probar POST en /api/users/login
    console.log('\n3. Probando POST en /api/users/login...');
    const postResponse = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://apiheroe-6c7dymssg-uziels-projects-fa4bbf7c.vercel.app'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'testpassword123'
      })
    });

    console.log('Status:', postResponse.status);
    console.log('CORS Headers en POST:');
    console.log('- Access-Control-Allow-Origin:', postResponse.headers.get('Access-Control-Allow-Origin'));

    console.log('\n✅ Pruebas completadas. Si los headers de CORS están presentes, el problema está resuelto.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCORS(); 