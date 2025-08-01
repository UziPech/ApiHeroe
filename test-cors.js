// Script de prueba para verificar CORS
import fetch from 'node-fetch';

const API_URL = 'https://apiheroe.vercel.app';

async function testCORS() {
  console.log('🧪 Probando configuración de CORS...\n');

  try {
    // Probar endpoint de login con OPTIONS (preflight)
    console.log('1. Probando preflight request (OPTIONS)...');
    const optionsResponse = await fetch(`${API_URL}/api/users/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://apiheroe-6c7dymssg-uziels-projects-fa4bbf7c.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });

    console.log('Status:', optionsResponse.status);
    console.log('CORS Headers:');
    console.log('- Access-Control-Allow-Origin:', optionsResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('- Access-Control-Allow-Methods:', optionsResponse.headers.get('Access-Control-Allow-Methods'));
    console.log('- Access-Control-Allow-Headers:', optionsResponse.headers.get('Access-Control-Allow-Headers'));
    console.log('- Access-Control-Allow-Credentials:', optionsResponse.headers.get('Access-Control-Allow-Credentials'));
    console.log('- Access-Control-Max-Age:', optionsResponse.headers.get('Access-Control-Max-Age'));

    // Probar endpoint de login con POST
    console.log('\n2. Probando POST request...');
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

    // Probar endpoint de héroes (GET)
    console.log('\n3. Probando GET request...');
    const getResponse = await fetch(`${API_URL}/api/heroes`, {
      method: 'GET',
      headers: {
        'Origin': 'https://apiheroe-6c7dymssg-uziels-projects-fa4bbf7c.vercel.app'
      }
    });

    console.log('Status:', getResponse.status);
    console.log('CORS Headers en GET:');
    console.log('- Access-Control-Allow-Origin:', getResponse.headers.get('Access-Control-Allow-Origin'));

    console.log('\n✅ Pruebas completadas. Si todos los headers de CORS están presentes, el problema puede estar en el frontend.');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
  }
}

testCORS(); 