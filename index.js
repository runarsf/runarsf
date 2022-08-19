const fs = require('fs');
const fetch = require('cross-fetch');
const mustache = require('mustache');

async function fetchLastFMData () {
  const params = {
    'api_key': process.env.LASTFM_TOKEN,
    'format': 'json',
    'method': 'user.getrecenttracks',
    'user': 'runarsf'
  };

  let payload = new URLSearchParams();
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

  let status = [];

  if ('@attr' in track)
    status.push('Now Playing:');
  else
    status.push('Last Played:');

  status.push(`${track.artist['#text']} —`);
  status.push(track.name);

  const album = track.album['#text'];
  if (album !== track.name)
    status.push(`(${album})`);

  return status.join(' ');
}

async function generateMustacheData () {
  const lastfm_data = await fetchLastFMData();
  return mustache_data = {
    music: lastfm_data,
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
