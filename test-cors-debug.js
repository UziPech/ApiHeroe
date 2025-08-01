// Script de debug para identificar el problema de CORS
import fetch from 'node-fetch';

const API_URL = 'https://apiheroe.vercel.app';

async function testCORS() {
  console.log('🔍 Debug CORS en producción...\n');

  try {
    // Probar endpoint raíz (sin autenticación)
    console.log('1. Probando endpoint raíz (sin auth)...');
    const rootResponse = await fetch(`${API_URL}/`);
    console.log('Status:', rootResponse.status);
    console.log('CORS Headers:');
    console.log('- Access-Control-Allow-Origin:', rootResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('- Access-Control-Allow-Methods:', rootResponse.headers.get('Access-Control-Allow-Methods'));

    // Probar endpoint de héroes (sin autenticación)
    console.log('\n2. Probando /api/heroes (sin auth)...');
    const heroesResponse = await fetch(`${API_URL}/api/heroes`);
    console.log('Status:', heroesResponse.status);
    console.log('CORS Headers:');
    console.log('- Access-Control-Allow-Origin:', heroesResponse.headers.get('Access-Control-Allow-Origin'));

    // Probar OPTIONS en endpoint raíz
    console.log('\n3. Probando OPTIONS en endpoint raíz...');
    const optionsRootResponse = await fetch(`${API_URL}/`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://apiheroe-6c7dymssg-uziels-projects-fa4bbf7c.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log('Status:', optionsRootResponse.status);
    console.log('CORS Headers:');
    console.log('- Access-Control-Allow-Origin:', optionsRootResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('- Access-Control-Allow-Methods:', optionsRootResponse.headers.get('Access-Control-Allow-Methods'));

    // Probar OPTIONS en /api/heroes
    console.log('\n4. Probando OPTIONS en /api/heroes...');
    const optionsHeroesResponse = await fetch(`${API_URL}/api/heroes`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://apiheroe-6c7dymssg-uziels-projects-fa4bbf7c.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log('Status:', optionsHeroesResponse.status);
    console.log('CORS Headers:');
    console.log('- Access-Control-Allow-Origin:', optionsHeroesResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('- Access-Control-Allow-Methods:', optionsHeroesResponse.headers.get('Access-Control-Allow-Methods'));

    console.log('\n🔍 Análisis:');
    console.log('- Si los endpoints sin auth tienen CORS headers, el problema está en el middleware de auth');
    console.log('- Si ningún endpoint tiene CORS headers, el problema está en la configuración global');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCORS(); 