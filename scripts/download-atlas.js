import fs from 'fs/promises'
import fetch from 'node-fetch';
globalThis.fetch = fetch;
import { json, buffer } from 'd3-fetch';

(async () => {
  // download updated atlas data
  // https://github.com/placeAtlas/atlas
  const file = await json('https://raw.githubusercontent.com/placeAtlas/atlas/master/web/atlas.json');
  await fs.writeFile('input-data/atlas.json', JSON.stringify(file, null, 2));

  // download final atlas image
  // this is the same used in the atlas site
  // we don't need to do this on every run: upstream likes to break urls from time to time
  // const img = await buffer('https://raw.githubusercontent.com/placeAtlas/atlas/master/web/_img/canvas/place30ex/final.png');
  // await fs.writeFile('input-data/final.png', Buffer.from(img));
})();