const fs = require('fs');
const fetch = require('cross-fetch');
const mustache = require('mustache');

async function fetchLastFMData () {
  let payload = new URLSearchParams();
  const params = {
    'api_key': process.env.LASTFM_TOKEN,
    'format': 'json',
    'method': 'user.getrecenttracks',
    'user': 'runarsf'
  };
  for (param in params)
    payload.append(param, params[param]);

  const data = await fetch('https://ws.audioscrobbler.com/2.0/', {
    method: 'POST',
    body: payload,
    headers: {
      'user-agent': 'runarsf/runarsf'
    }
  }).then((res) => res.json());

  const track = data.recenttracks.track[0];

  return {
    now_playing: track['@attr']?.nowplaying ?? false,
    track_eq_album: track.name === track.album['#text'],
    track: track.name,
    artist: track.artist['#text'],
    album: track.album['#text'],
    url: track.url,
    cover: [
      track.image[0]['#text'],
      track.image[1]['#text'],
      track.image[2]['#text'],
      track.image[3]['#text'],
    ],
  };
}

async function generateMustacheData () {
  const lastfm_data = await fetchLastFMData();
  return mustache_data = {
    ...lastfm_data,
  };
}

async function generateReadme () {
  const mustache_data = await generateMustacheData();
  fs.readFile('README.mustache', (err, data) => {
    if (err) throw err;

    const output = mustache.render(data.toString(), mustache_data);
    fs.writeFileSync('README.md', output);
  });
}

generateReadme();
