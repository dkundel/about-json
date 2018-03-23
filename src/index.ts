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

/**
 * Converts a list of header entries into a '.' separated path to access the property
 * @param headerPath A list of header entries
 * @returns A path to access a property along all headers
 */
function toPath(headerPath: (HeaderPathEntry | { path: string })[]): string {
  return headerPath.map(x => x.path).join('.');
}

/**
 * Checks if a string is a URL by checking its prefix
 * @param input A string to check
 * @returns A boolean if this is a full URL
 */
export function isWebContent(input: string): boolean {
  return input.startsWith('http://') || input.startsWith('https://');
}

/**
 * Finds relative URLs by the given regular expression and
 * triggers the replaceFunction on relative links found
 * @param str A string of text or HTML
 * @param regExp A regular expression to find a URL
 * @param replaceFunction A replace function to transform a URL
 * @returns The input string with all found URLs replaced
 */
function applyUrlReplace(
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

/**
 * Updates relative URLs in inline markdown and renders it in HTML if necessary
 * @param text Inline markdown text
 * @param options The options passed to the parse function
 * @returns The rendered/updated markdown content
 */
function handleInlineText(text: string, options: Options): string {
  for (const fn of options.replaceFunctions) {
    text = fn(text);
  }

  const linkRegExp = /!?\[.*?\]\((.*?)\)/g;
  text = applyUrlReplace(text, linkRegExp, options.updateRelativeLinks);
  return options.asHtml ? md.renderInline(text) : text;
}

/**
 * Updates relative URLs in a raw HTML string
 * @param html A raw HTML string
 * @param options The options passed to the parse function
 * @returns The updated HTML string
 */
function handleRawHtml(html: string, options: Options): string {
  html = html.trim();
  const regExps = [/(?:href|src)=['"]?((?:\w|\/).*?)(?:["']|\s)/g];
  for (const reg of regExps) {
    html = applyUrlReplace(html, reg, options.updateRelativeLinks);
  }
  return html;
}

/**
 * Replaces in a given string:
 * - HTML line breaks with UNIX line breaks
 * - :octocat: with 🐙🐱
 * - &nbsp; with an actual space
 * Returns the result
 * @param text The text to replace from
 * @returns The updated string
 */
export function defaultReplaceFunction(text: string) {
  return text
    .replace(/<br>/g, '\n')
    .replace(/:octocat:/g, '🐙🐱')
    .replace(/&nbsp;/g, ' ');
}

export const DefaultOptions: Options = {
  asHtml: false,
  replaceFunctions: [defaultReplaceFunction],
  updateRelativeLinks: (str: string) => str,
};

/**
 * Returns a full URL given a baseUrl and a relative URL
 * @param baseUrlStr A base URL you want the relative URL to refer to
 * @param relativeUrl A relative path
 * @returns A full URL representing the resource
 */
export function updateRelativeLinksFromBase(
  baseUrlStr: string,
  relativeUrl: string
): string {
  const url = new URL(baseUrlStr);
  url.pathname = resolve(dirname(url.pathname), relativeUrl);
  return url.href;
}

/**
 * Turns a Markdown string into a structured JSON
 * @param markdownString A markdown string to parse
 * @param opts Options to modify parsing behavior
 * @returns An object representing the markdown file
 */
export function parse(markdownString: string, opts?: ParsingOptions): any {
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
      const path = toPath([
        ...currentHeadingPath,
        {
          path: '_raw',
        },
      ]);
      dotProp.set(obj, path, handleRawHtml(current.text, options));
    }
    if (current.type === 'heading') {
      const textEmojiRegEx = /:\w+:/g;
      const key = camelCase(
        current.text
          .replace(textEmojiRegEx, '')
          .replace(/[^\d\w\s(:\d+:)]/g, '')
      );
      if (current.depth === 2) {
        currentHeadingPath = [
          {
            path: key,
            depth: 2,
          },
        ];
        obj[key] = {
          _heading: current.text,
        };
      } else {
        while (
          currentHeadingPath[currentHeadingPath.length - 1].depth >=
          current.depth
        ) {
          currentHeadingPath.pop();
        }
        currentHeadingPath = [
          ...currentHeadingPath,
          {
            path: key,
            depth: current.depth,
          },
        ];
        const path = toPath(currentHeadingPath);
        dotProp.set(obj, path, {
          _heading: current.text,
        });
      }
    }

    if (current.type === 'paragraph' || current.type === 'text') {
      const text = handleInlineText(current.text, options);
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
          obj[cellName] = handleInlineText(val, options);
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
}

export default parse;
