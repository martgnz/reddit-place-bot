import fs from 'fs/promises';
import { scaleLinear } from 'd3-scale';
import { line, curveLinearClosed } from 'd3-shape';
import pkg from 'canvas';
const { createCanvas, loadImage } = pkg;

export default async (datum) => {
  // load r/place canvas
  // using the same final image than the r/place atlas
  // https://raw.githubusercontent.com/placeAtlas/atlas/master/web/_img/place/final.png
  const place = await loadImage('./input-data/final.png');
  
  // margin around the drawing, in pixels
  const margin = 2;
  
  // prepare d3 scales for drawing later
  const x = scaleLinear();
  const y = scaleLinear();
  
  // path generator to highlight the drawing
  // some paths for the drawings are left open
  // we pass a curveLinearClosed curve to close them
  const path = line()
    .x(d => x(d[0]))
    .y(d => y(d[1]))
    .curve(curveLinearClosed);

  // new data format with timestamp: {path: {'1-166, T': [coords]}}
  // we fetch the first element that includes the "166" timestamp
  // 166 being the snapshot of final canvas
  const key = Object.keys(datum.path).find(d => d.includes("166"));

  // get drawing limits
  // min and max for each path taking margins into account
  const imageX = [Math.min(...datum.path[key].map(d => d[0])) - margin, Math.max(...datum.path[key].map(d => d[0])) + margin];
  const imageY = [Math.min(...datum.path[key].map(d => d[1])) - margin, Math.max(...datum.path[key].map(d => d[1])) + margin];
  
  // get width and height of drawing by substracting the coordinates
  const drawingWidth = imageX.reduce((prev, curr) => curr - prev);
  const drawingHeight = imageY.reduce((prev, curr) => curr - prev);
  
  // get aspect ratio
  const aspectRatio = drawingHeight / drawingWidth;
  
  // resize to 4k
  let targetWidth = 4096;
  let targetHeight = Math.floor(targetWidth * aspectRatio);

  // for extremely tall images e.g. belgium flag (id: twtp8q)
  // twitter size limit is 8192x8192
  // TODO: smarter resizing
  if (targetHeight > 8192) {
    targetWidth = 640;
    targetHeight = Math.floor(targetWidth * aspectRatio);
  }

  // set d3 scales with image limits
  // domain are the canvas coordinates
  // range are our desired image size limits
  x.domain([imageX[0], imageX[1]]).range([0, targetWidth]);
  y.domain([imageY[1], imageY[0]]).range([targetHeight, 0]);
  
  // create canvas
  const canvas = createCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext('2d');
  
  // disable image smoothing, needed for pixel art look
  ctx.imageSmoothingEnabled = false;
  
  // place drawing into our canvas, using our bbox coordinates
  // source image, source x, source y, original width, original height, target x, target y, target width, target height
  ctx.drawImage(place, imageX[0], imageY[0], drawingWidth, drawingHeight, 0, 0, targetWidth, targetHeight);
  
  // draw dark background so the drawing is highlighted
  // ctx.beginPath();
  // ctx.fillStyle = 'rgba(0, 0, 0, .5)';
  // ctx.fillRect(0, 0, targetWidth, targetHeight);
  // ctx.closePath();
  
  // and draw a clipping mask over it
  // https://stackoverflow.com/questions/4821679/canvas-clip-reverse-action
  // path.context(ctx);
  // ctx.beginPath();
  // path(datum.path);
  // ctx.closePath();
  // ctx.clip();

  // redraw background in the clipped area
  // ctx.drawImage(place, imageX[0], imageY[0], drawingWidth, drawingHeight, 0, 0, targetWidth, targetHeight);
  
  // draw image to a buffer and write it
  const buffer = canvas.toBuffer('image/png');
  fs.writeFile(`./output-data/${datum.id}.png`, buffer);
};
