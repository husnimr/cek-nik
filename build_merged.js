const https = require('https');
const fs = require('fs');
const idnArea = require('idn-area-data');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}, status: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function merge() {
  const wilayah = { provinsi: {}, kabkot: {}, kecamatan: {} };
  
  try {
    const oldKecURL = 'https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/master/data/list_of_area/kecamatan.json';
    const oldKec = await fetchJson(oldKecURL);
    oldKec.forEach(d => wilayah.kecamatan[d.id] = d.name);
    console.log(`Loaded ${oldKec.length} old districts.`);
    
    const oldKabURL = 'https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/master/data/list_of_area/kabupaten-kota.json';
    const oldKab = await fetchJson(oldKabURL);
    oldKab.forEach(d => wilayah.kabkot[d.id] = d.name);
    console.log(`Loaded ${oldKab.length} old regencies.`);
    
    const oldProvURL = 'https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/master/data/list_of_area/provinsi.json';
    const oldProv = await fetchJson(oldProvURL);
    oldProv.forEach(d => wilayah.provinsi[d.id] = d.name);
    console.log(`Loaded ${oldProv.length} old provinces.`);
  } catch(e) {
    console.error('Warning: could not load old data', e);
  }

  // Load new data over old data
  const provs = await idnArea.getProvinces();
  provs.forEach(p => wilayah.provinsi[p.code.replace(/\./g, '')] = p.name);

  const kabs = await idnArea.getRegencies();
  kabs.forEach(k => wilayah.kabkot[k.code.replace(/\./g, '')] = k.name);

  const kecs = await idnArea.getDistricts();
  kecs.forEach(k => wilayah.kecamatan[k.code.replace(/\./g, '')] = k.name);
  console.log(`Total merged: ${Object.keys(wilayah.provinsi).length} prov, ${Object.keys(wilayah.kabkot).length} kab, ${Object.keys(wilayah.kecamatan).length} kec.`);

  fs.writeFileSync('wilayah.js', 'const wilayah = ' + JSON.stringify(wilayah, null, 2) + ';');
  console.log('Merged successfully into wilayah.js.');
}

merge();
