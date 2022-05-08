import fs from 'fs/promises';
import getDrawing from './get-drawing.js';
import sendTweet from './send-tweet.js';

const getFilesInFolder = async(folder) => {
  // read output folder
  const rawOutputFiles = await fs.readdir(folder);
  
  // remove file extension
  // we assume ids don't have dots
  return rawOutputFiles.map(d => d.split('.')[0]);
}

(async () => {
  // load json data from atlas
  // https://place-atlas.stefanocoding.me/
  const raw = await fs.readFile('./input-data/atlas.json', {
    encoding: 'utf8',
  });

  const rawData = await JSON.parse(raw);

  // get drawings that have been posted already
  const outputFiles = await getFilesInFolder('./output-data');

  // clean drawings without path data
  // clean drawings that have been already posted
  const data = rawData
    .filter(d => d.path.length > 0)
    .filter(d => !outputFiles.includes(d.id));

  // choose random drawing
  const randomIdx = Math.floor(Math.random() * data.length);
  const datum = data[randomIdx];
  // const datum = data.find(d => d.id === 'u0m3up');

  console.log('processing id:', datum.id);

  // cut canvas to the chosen drawing and write the file
  await getDrawing(datum);

  // send tweet
  await sendTweet(datum);
})();