import {
  container,
  color,
  modifier,
  pad,
  AnsiColor,
  AnsiModifier,
  ifElse,
} from 'ansi-fragments';
import { CodeError } from './errors';
import { Priority } from './android/constants';
import { Entry } from './types';

export function formatError(error: CodeError | Error): string {
  return container(
    color('red', '✖︎ Ups, something went wrong'),
    pad(2, '\n'),
    color('red', modifier('bold', 'CODE'), ' ▶︎ '),
    'code' in error ? error.code : 'ERR_UNKNOWN',
    pad(1, '\n'),
    color('red', modifier('bold', 'MESSAGE'), ' ▶︎ '),
    error.message
  ).build();
}

export function formatEntry(entry: Entry): string {
  let priorityColor: AnsiColor = 'none';
  let priorityModifier: AnsiModifier = 'none';
  let messageColor: AnsiColor = 'none';

  if (entry.priority === Priority.FATAL || entry.priority === Priority.ERROR) {
    priorityColor = 'red';
    messageColor = 'red';
  } else if (entry.priority === Priority.WARN) {
    priorityColor = 'yellow';
    messageColor = 'yellow';
  } else if (entry.priority === Priority.VERBOSE) {
    priorityModifier = 'dim';
  }

  const output = container(
    modifier('dim', parseDate(entry.date)),
    pad(1),
    color(
      priorityColor,
      modifier(priorityModifier, `${Priority.toLetter(entry.priority)} |`)
    ),
    pad(1),
    modifier(
      'bold',
      color(priorityColor, modifier(priorityModifier, entry.tag))
    ),
    pad(1),
    color(priorityColor, modifier(priorityModifier, '▶︎')),
    pad(1),
    color(priorityColor, modifier(priorityModifier, entry.messages[0])),
    ifElse(
      entry.messages.length > 1,
      container(
        ...entry.messages
          .slice(1)
          .map((line: string, index: number, arr: string[]) =>
            container(
              pad(1, '\n'),
              pad(entry.tag.length + 16),
              color(
                priorityColor,
                modifier(
                  priorityColor === 'none' ? 'dim' : 'none',
                  `${index === arr.length - 1 ? '└' : '│'} `
                )
              ),
              color(priorityColor, modifier(priorityModifier, line))
            )
          )
      ),
      ''
    )
  ).build();

  return `${output}\n`;
}

function parseDate(value: Date): string {
  const hour =
    value.getUTCHours() < 10
      ? `0${value.getUTCHours()}`
      : value.getUTCHours().toString();
  const minutes =
    value.getUTCMinutes() < 10
      ? `0${value.getUTCMinutes()}`
      : value.getUTCMinutes().toString();
  const seconds =
    value.getUTCSeconds() < 10
      ? `0${value.getUTCSeconds()}`
      : value.getUTCSeconds().toString();
  return `[${hour}:${minutes}:${seconds}]`;
}
