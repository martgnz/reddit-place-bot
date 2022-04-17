# r/place-bot

A Twitter bot that tweets a drawing from Reddit's [r/place](https://www.reddit.com/r/place/) every hour.

## Data

The data comes from the [r/placeatlas](https://github.com/placeAtlas/atlas), a database that catalogues all the drawings from the 2022 Reddit place event.

## Getting started

To send a tweet you'll need to request [elevated access](https://developer.twitter.com/en/portal/products/elevated) for the Twitter API. After getting access, create a new project, get the API key, API secret, access token and access secret and paste them in a new file called `.env` following the structure of `.env.example`.

After sorting out the credentials you can install the dependencies ([install Node](https://nodejs.org/en/download/) if you don't have it already):

```
$ npm install
```

Now you can generate a random drawing and tweet it. The bot will choose randomly from the all entries in the database, discarding the drawings that have been already tweeted:

```
$ npm start
```

## Scheduling

This bot uses GitHub actions to schedule a tweet every hour. A simple cron job is used. You can run it more frequently (or less) [adjusting the values](https://github.com/martgnz/r-place-bot/blob/main/.github/workflows/tweet.yml) in the actions file.
