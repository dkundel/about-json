[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)
[![Code of Conduct](https://img.shields.io/badge/%F0%9F%92%96-Code%20of%20Conduct-ff69b4.svg?style=flat-square)](code-of-conduct.md)
[![about-json downloads](https://img.shields.io/npm/dt/about-json.svg)](https://npm.im/about-json)
[![about-json version](https://img.shields.io/npm/v/about-json.svg)](https://npm.im/about-json)
[![Travis](https://img.shields.io/travis/dkundel/about-json.svg)](https://travis-ci.org/dkundel/about-json)

# `about-json`

This is an opinionated Markdown to JSON converter. It was designed to turn `about-me` markdown files [like this one](https://github.com/dkundel/about-me) into a JSON structure for more flexible rendering.

It can read files locally or load them from the web.

## Setup

```bash
npx about-json -i https://raw.githubusercontent.com/dkundel/about-me/master/README.md --pretty

# OR

npm i -g about-json
about-json -i https://raw.githubusercontent.com/dkundel/about-me/master/README.md --pretty
```

## Usage

```bash
Turns a markdown file into a JSON. Opinionated based on the about-me file
format.
Usage: about-json -i <filePathOrUrl>

Options:
  --input, -i   File path or URL to load markdown            [string] [required]
  --output, -o  File path to write output. Will write to stdout otherwise.
                                                                        [string]
  --html        Output inline content (such as links) as HTML rather than
                Markdown                              [boolean] [default: false]
  --pretty      Prints the resulting JSON in an indented way instead of
                condensed                             [boolean] [default: false]
  --fixUrl, -u  If the content is fetched from the web, it will update the
                relative links to absolute URLs        [boolean] [default: true]
  --help        Show help                                              [boolean]
  --version     Show version number                                    [boolean]
```

## Contributing

Please note that this project is released with a [Contributor Code of Conduct](code-of-conduct.md). By participating in this project you agree to abide by its terms.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
| [<img src="https://avatars3.githubusercontent.com/u/1505101?v=4" width="100px;"/><br /><sub><b>Dominik Kundel</b></sub>](https://moin.world)<br />[💻](https://github.com/dkundel/about-json/commits?author=dkundel "Code") |
| :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## License

MIT
