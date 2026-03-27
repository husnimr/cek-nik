const fs = require('fs');
const idnArea = require('idn-area-data');

async function buildWilayah() {
  try {
    console.log('Fetching regional data...');
    const wilayah = { provinsi: {}, kabkot: {}, kecamatan: {} };
    
    const provs = await idnArea.getProvinces();
    provs.forEach(p => wilayah.provinsi[p.code.replace(/\./g, '')] = p.name);

    const kabs = await idnArea.getRegencies();
    kabs.forEach(k => wilayah.kabkot[k.code.replace(/\./g, '')] = k.name);

    const kecs = await idnArea.getDistricts();
    kecs.forEach(k => wilayah.kecamatan[k.code.replace(/\./g, '')] = k.name);

    fs.writeFileSync('wilayah.js', 'const wilayah = ' + JSON.stringify(wilayah, null, 2) + ';');
    console.log('Successfully written to wilayah.js');
  } catch (err) {
    console.error('Error:', err);
  }
}

buildWilayah();
