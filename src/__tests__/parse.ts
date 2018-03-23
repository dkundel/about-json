import { stripIndent } from 'common-tags';
import cloneDeep from 'lodash.clonedeep';
import dotProp from 'dot-prop';

import parse from '../index';

const exampleMarkdown = stripIndent`
  <div class="some-class">
    <h1>Hello</h1>
    <img src="some/path/picture.jpg" alt="yay"/>
  </div>

  ## Hello

  Some content

  ### Subsection :octocat:

  Hello :octocat:

  #### One more nested

  Hi hi

  ## A List

  * One Entry
  * Two Entries
  * Three Entries
  
  ## A ordered List

  1. Something
  2. Something else
  
  ## A Table

  | Name | Twitter |
  | --- | --- |
  | Dominik Kundel | @dkundel |
  | Twilio | @twilio |

  ## 🤷‍♂️ Another Entry
  We need a [link](https://dkundel.com)
  
  And a [relative link](docs/README.md)

  And a ![image](assets/image.jpg)
`;

const exampleOutput = {
  _raw: stripIndent`
  <div class="some-class">
    <h1>Hello</h1>
    <img src="some/path/picture.jpg" alt="yay"/>
  </div>`,
  hello: {
    _heading: 'Hello',
    _paragraphs: ['Some content'],
    subsection: {
      _heading: 'Subsection :octocat:',
      _paragraphs: ['Hello 🐙🐱'],
      oneMoreNested: {
        _heading: 'One more nested',
        _paragraphs: ['Hi hi'],
      },
    },
  },
  aList: {
    _heading: 'A List',
    _list: ['One Entry', 'Two Entries', 'Three Entries'],
  },
  aOrderedList: {
    _heading: 'A ordered List',
    _orderedList: ['Something', 'Something else'],
  },
  aTable: {
    _heading: 'A Table',
    _entries: [
      { name: 'Dominik Kundel', twitter: '@dkundel' },
      { name: 'Twilio', twitter: '@twilio' },
    ],
  },
  anotherEntry: {
    _heading: '🤷‍♂️ Another Entry',
    _paragraphs: [
      'We need a [link](https://dkundel.com)',
      'And a [relative link](docs/README.md)',
      'And a ![image](assets/image.jpg)',
    ],
  },
};

describe('test parse', () => {
  test('should parse with default settings', () => {
    const output = parse(exampleMarkdown);
    expect(output).toEqual(exampleOutput);
  });

  test('should handle HTML output', () => {
    const output = parse(exampleMarkdown, { asHtml: true });
    const expectedOutput = cloneDeep(exampleOutput);
    dotProp.set(expectedOutput, 'anotherEntry._paragraphs', [
      'We need a <a href="https://dkundel.com">link</a>',
      'And a <a href="docs/README.md">relative link</a>',
      'And a <img src="assets/image.jpg" alt="image">',
    ]);
    expect(output).toEqual(expectedOutput);
  });

  test('should update relative links properly in markdown', () => {
    function updateRelativeLinks(link: string) {
      return `foo/${link}`;
    }
    const output = parse(exampleMarkdown, { updateRelativeLinks });
    const expectedOutput = cloneDeep(exampleOutput);
    const htmlOutput = stripIndent`
      <div class="some-class">
        <h1>Hello</h1>
        <img src="foo/some/path/picture.jpg" alt="yay"/>
      </div>`;
    dotProp.set(expectedOutput, '_raw', htmlOutput);
    dotProp.set(expectedOutput, 'anotherEntry._paragraphs', [
      'We need a [link](https://dkundel.com)',
      'And a [relative link](foo/docs/README.md)',
      'And a ![image](foo/assets/image.jpg)',
    ]);
    expect(output).toEqual(expectedOutput);
  });

  test('should update relative links properly in html', () => {
    function updateRelativeLinks(link: string) {
      return `foo/${link}`;
    }
    const output = parse(exampleMarkdown, {
      updateRelativeLinks,
      asHtml: true,
    });
    const expectedOutput = cloneDeep(exampleOutput);
    const htmlOutput = stripIndent`
      <div class="some-class">
        <h1>Hello</h1>
        <img src="foo/some/path/picture.jpg" alt="yay"/>
      </div>`;
    dotProp.set(expectedOutput, '_raw', htmlOutput);
    dotProp.set(expectedOutput, 'anotherEntry._paragraphs', [
      'We need a <a href="https://dkundel.com">link</a>',
      'And a <a href="foo/docs/README.md">relative link</a>',
      'And a <img src="foo/assets/image.jpg" alt="image">',
    ]);
    expect(output).toEqual(expectedOutput);
  });
});
