const fs = require('fs');
const fetch = require('cross-fetch');
const mustache = require('mustache');

// https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
const TEMPLATE_FILE = process.env.TEMPLATE_FILE || 'README.mustache';
const README_FILE   = process.env.README_FILE   || 'README.md';
const LASTFM_USER   = process.env.LASTFM_USER   || process.env.GITHUB_REPOSITORY_OWNER;
const LASTFM_TOKEN  = process.env.LASTFM_TOKEN;
const GITHUB_REPO   = process.env.GITHUB_REPOSITORY;

async function fetchLastFMData () {
  let payload = new URLSearchParams();
  const params = {
    'api_key': LASTFM_TOKEN,
    'format': 'json',
    'method': 'user.getrecenttracks',
    'user': LASTFM_USER,
  };
  for (param in params)
    payload.append(param, params[param]);

  const data = await fetch('https://ws.audioscrobbler.com/2.0/', {
    method: 'POST',
    body: payload,
    headers: {
      'user-agent': GITHUB_REPO,
    }
  }).then((res) => res.json());

  const track = data.recenttracks.track[0];

  return {
    now_playing: track['@attr']?.nowplaying ?? false,
    track_eq_album: track.name === track.album['#text'],
    user: LASTFM_USER,
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
  fs.readFile(TEMPLATE_FILE, (err, data) => {
    if (err) throw err;

    const output = mustache.render(data.toString(), mustache_data);
    fs.writeFileSync(README_FILE, output);
  });
}

generateReadme();
