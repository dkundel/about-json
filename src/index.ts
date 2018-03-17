import { resolve, dirname } from 'path';
import { URL } from 'url';

import camelCase from 'lodash.camelcase';
import merge from 'lodash.merge';
import dotProp from 'dot-prop';
import { lexer, TokensList, Token } from 'marked';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

type HeaderPathEntry = { path: string; depth: number };
type ListMode = 'ordered' | 'unordered' | undefined;
export type StringToStringFn = (str: string) => string;
export type ParsingOptions = Partial<Options>;

export interface Options {
  asHtml: boolean;
  replaceFunctions: StringToStringFn[];
  updateRelativeLinks: StringToStringFn;
}

export const DefaultOptions: Options = {
  asHtml: false,
  replaceFunctions: [defaultReplaceFunction],
  updateRelativeLinks: (str: string) => str,
};

export function defaultReplaceFunction(text: string) {
  return text
    .replace(/<br>/g, '\n')
    .replace(/:octocat:/g, '🐙🐱')
    .replace(/&nbsp;/g, ' ');
}

export function parse(markdownString: string, opts?: ParsingOptions): void {
  const examples = lexer(markdownString);
  const options = { ...DefaultOptions, ...opts };

  let currentHeadingPath: HeaderPathEntry[] = [];
  let listMode: ListMode = undefined;
  const result = examples.reduce(function reduceTokensToJson(
    obj: any,
    current: Token,
    idx: number,
    array: Token[]
  ): any {
    if (current.type === 'html') {
      const path = toPath([...currentHeadingPath, { path: '_raw' }]);
      dotProp.set(obj, path, handleRawHtml(current.text));
    }
    if (current.type === 'heading') {
      const key = camelCase(current.text.replace(/[^\d\w\s]/g, ''));
      if (current.depth === 2) {
        currentHeadingPath = [{ path: key, depth: 2 }];
        obj[key] = { _heading: current.text };
      } else {
        while (
          currentHeadingPath[currentHeadingPath.length - 1].depth >=
          current.depth
        ) {
          currentHeadingPath.pop();
        }
        currentHeadingPath = [
          ...currentHeadingPath,
          { path: key, depth: current.depth },
        ];
        const path = toPath(currentHeadingPath);
        dotProp.set(obj, path, {
          _heading: current.text,
        });
      }
    }

    if (current.type === 'paragraph' || current.type === 'text') {
      const text = handleInlineText(current.text);
      let path = toPath(currentHeadingPath);
      if (listMode === undefined) {
        path += '._paragraphs';
      } else {
        path += `._${listMode === 'ordered' ? 'orderedList' : 'list'}`;
      }
      const currentParagraphs = dotProp.get(obj, path, []);
      dotProp.set(obj, path, [...currentParagraphs, text]);
    }
    if (current.type === 'table') {
      const headers = current.header.map(h => camelCase(h) || 'other');
      const entries = current.cells.map(cell => {
        return cell.reduce((obj: any, val: string, idx: number) => {
          const cellName = headers[idx];
          obj[cellName] = handleInlineText(val);
          return obj;
        }, {});
      });
      const path = toPath(currentHeadingPath) + '._entries';
      dotProp.set(obj, path, entries);
    }
    if (current.type === 'list_start') {
      listMode = current.ordered ? 'ordered' : 'unordered';
    }
    if (current.type === 'list_end') {
      listMode = undefined;
    }
    return obj;
  },
  {});

  return result;

  function handleInlineText(text: string): string {
    for (let fn of options.replaceFunctions) {
      text = fn(text);
    }

    const linkRegExp = /\!?\[.*?\]\((.*?)\)/g;
    text = applyReplace(text, linkRegExp, options.updateRelativeLinks);
    return options.asHtml ? md.renderInline(text) : text;
  }

  function handleRawHtml(html: string): string {
    const regExps = [/(?:href|src)=['"]?((?:\w|\/).*?)(?:["']|\s)/g];
    for (let reg of regExps) {
      html = applyReplace(html, reg, options.updateRelativeLinks);
    }
    return html;
  }
}

function toPath(headerPath: (HeaderPathEntry | { path: string })[]): string {
  return headerPath.map(x => x.path).join('.');
}

function applyReplace(
  str: string,
  regExp: RegExp,
  replaceFunction: StringToStringFn
): string {
  return str.replace(regExp, (matched: string, originalUrl: string) => {
    if (isWebContent(originalUrl) || originalUrl.length === 0) {
      return matched;
    }
    const newUrl = replaceFunction(originalUrl);
    return matched.replace(originalUrl, newUrl);
  });
}

export function isWebContent(input: string): boolean {
  return input.startsWith('http://') || input.startsWith('https://');
}

export function updateRelativeLinksFromBase(
  baseUrlStr: string,
  relativeUrl: string
): string {
  const url = new URL(baseUrlStr);
  url.pathname = resolve(dirname(url.pathname), relativeUrl);
  return url.href;
}

export default parse;
