import got from 'got';
import parse from '../dist/index';

async function run() {
  const resp = await got(
    'https://raw.githubusercontent.com/dkundel/about-me/master/README.md'
  );
  const text = resp.body;

  /* eslint-disable no-console */
  console.dir(parse(text), {
    depth: 10,
  });
}

run();
