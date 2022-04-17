import { TwitterApi, EUploadMimeType } from 'twitter-api-v2';
import 'dotenv/config';

// remove extra whitespace and line breaks
const cleanString = (str) => str.trim().replace(/(\r\n|\n|\r)/gm, '');

// return tweet text
const getCleanTweet = async({ id, name, description }) => {
  const isNameRepeated = description.toLowerCase().includes(name.toLowerCase());

  const nameLength = name.length;
  const descriptionLength = description.length;

  // return description if tweet is not over character limit
  // count two characters for colon and space format
  if ((nameLength + descriptionLength) <= 278) {
    // if description is filled, include it
    // else just add the name
    if (descriptionLength === 0) return name;

    // only add drawing name if it's not repeated at the beginning of the description
    // needed to avoid tweets that repeat the name
    if (isNameRepeated) {
      return description;
    }

    return `${name}: ${description}`;
  }

  // if the tweet is too long ellide description so it fits the 280 character limit
  // counting colon, spaces, ellipsis and url to the specific drawing
  // https://developer.twitter.com/en/docs/counting-characters
  const url = `https://place-atlas.stefanocoding.me/#${id}`;

  // an url counts as 23 characters, plus colon, ellipsis and spaces
  const padding = 20;

  const descriptionLimit = 257 - nameLength - padding;
  const shortDescription = description.slice(0, descriptionLimit);

  // only tweet description
  if (isNameRepeated) {
    return `${shortDescription}… ${url}`;
  }

  return `${name}: ${shortDescription}… ${url}`;
}

const sendTweet = async({ text, datum }) => {
  // https://developer.twitter.com/en/docs/tutorials/how-to-create-a-twitter-bot-with-twitter-api-v2
  // https://developer.twitter.com/en/docs/authentication/oauth-1-0a/pin-based-oauth
  // https://github.com/PLhery/node-twitter-api-v2/blob/master/doc/auth.md
  const client = new TwitterApi({
    appKey: process.env.API_KEY,
    appSecret: process.env.API_KEY_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_SECRET,
  });

  const image = await client.v1.uploadMedia(`./output-data/${datum.id}.png`, {
    mimeType: EUploadMimeType.Png
  });
  const tweet = await client.v1.tweet(text, { media_ids: image });

  if (tweet && tweet.id_str) {
    console.log(`tweet sent: https://twitter.com/rplacebot/status/${tweet.id_str}`);
  }
}

export default async(datum) => {
  const cleanTweet = await getCleanTweet({
    id: datum.id,
    name: cleanString(datum.name),
    description: cleanString(datum.description),
  });

  // TODO: retry logic
  await sendTweet({text: cleanTweet, datum});
}