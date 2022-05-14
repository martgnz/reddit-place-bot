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
    .filter(d => Object.keys(d.path).length > 0)
    .filter(d => {
      // r/place atlas changed the data format
      // now paths have a timestamp
      // it seems that including "166" means that it appeared on the final canvas
      // https://github.com/placeAtlas/atlas/issues/1314#issuecomment-1101461573
      return Object.keys(d.path).find(d => d.includes("166"));
    })
    .filter(d => !outputFiles.includes(d.id));

  // choose random drawing
  const randomIdx = Math.floor(Math.random() * data.length);
  const datum = data[randomIdx];
  // const datum = data.find(d => d.id === 'tx3696');

  console.log('processing id:', datum.id);

  // cut canvas to the chosen drawing and write the file
  await getDrawing(datum);

  // send tweet
  await sendTweet(datum);
})();