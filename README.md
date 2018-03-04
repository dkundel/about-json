[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)
[![Code of Conduct](https://img.shields.io/badge/%F0%9F%92%96-Code%20of%20Conduct-ff69b4.svg?style=flat-square)](code-of-conduct.md)

# Project Templates

This project contains a collection of different project setups. The project has two purposes. The [`package.json`](package.json) contains the dependencies for the template but it also defines the setup script that is published to [`npm`](https://npm.im/@dkundel/setup) to set up the project.

The templates are defined in the separate branches of this project. Currently there are the following templates:

* [`master`](/tree/master) - The _default_ value. It sets up a basic Node.js project without any special features except linting

## Setup

```bash
npx @dkundel/setup project-name template-branch-name
cd project-name
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
