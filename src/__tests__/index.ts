import {
  defaultReplaceFunction,
  isWebContent,
  updateRelativeLinksFromBase,
} from '../index';

describe('test defaultReplaceFunction', () => {
  test('Should leave no octocat behind', () => {
    const input = `I love :octocat: so much. You can't believe how much I love :octocat:`;
    const output = `I love 🐙🐱 so much. You can't believe how much I love 🐙🐱`;
    expect(defaultReplaceFunction(input)).toBe(output);
  });

  test('Should handle line breaks', () => {
    const input = 'Some <br> Line<br>Break';
    const output = 'Some \n Line\nBreak';
    expect(defaultReplaceFunction(input)).toBe(output);
  });

  test('Should transform &nbsp; to normal space', () => {
    const input = 'Some&nbsp;text with &nbsp;spaces';
    const output = 'Some text with  spaces';
    expect(defaultReplaceFunction(input)).toBe(output);
  });

  test('Should leave normal text untouched', () => {
    const input = 'Some normal text <a href="hello.html">With some HTML</a>';
    expect(defaultReplaceFunction(input)).toBe(input);
  });
});

describe('test isWebContent', () => {
  test('handles HTTPS url', () => {
    expect(isWebContent('https://dkundel.com/')).toBeTruthy();
  });

  test('handles HTTP url', () => {
    expect(isWebContent('http://dkundel.com')).toBeTruthy();
  });

  test('detects wrong protocol', () => {
    expect(isWebContent('mailto:dominik.kundel@gmail.com')).toBeFalsy();
  });

  test('handles relative urls', () => {
    expect(isWebContent('some/path/index.html')).toBeFalsy();
  });
});

describe('test updateRelativeLinksFromBase', () => {
  const baseUrl = 'https://github.com/dkundel/about-json';
  test('handles relative links with ..', () => {
    const relativeUrl = '../../webpack/webpack';
    expect(updateRelativeLinksFromBase(baseUrl, relativeUrl)).toBe(
      'https://github.com/webpack/webpack'
    );
  });

  test('handles relative links', () => {
    const relativeUrl = 'about-json/blob/master/package.json';
    expect(updateRelativeLinksFromBase(baseUrl, relativeUrl)).toBe(
      'https://github.com/dkundel/about-json/blob/master/package.json'
    );
  });

  test('handles links starting with a /', () => {
    const relativeUrl = '/help';
    expect(updateRelativeLinksFromBase(baseUrl, relativeUrl)).toBe(
      'https://github.com/help'
    );
  });
});
