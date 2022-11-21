'use strict';

import { assert, test } from 'st';

import { dirname } from 'path';
import {
  generate_migration_filename,
  parse_arguments,
  retrieve_template
} from '../lib/utils.mjs';

import { fileURLToPath } from 'url';
import { readFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test('a generated filename is correct', () => {
  const comparison_time = new Date();

  const migration_name = generate_migration_filename('test');

  const parts = migration_name.match(/^(\d+)-(.+)\.mjs$/);

  assert.ne(parts, null, 'there should be a match');

  assert.gte(
    Number(parts[1]),
    +comparison_time,
    'the timestamp should be newer or equal'
  );
  assert.eq(parts[2], 'test', 'the file should contain the original name');
});

test('arguments can be parsed correctly', () => {
  const args = ['one', '-two', 'three', '-four'];

  const parsed = parse_arguments(args);

  assert.eq(parsed.args.length, 2, 'there should be two arguments');
  assert.eq(parsed.flags.length, 2, 'there should be two flags');
  assert.eq(parsed.args[0], 'one', 'the first parsed arg should be correct');
  assert.eq(parsed.args[1], 'three', 'the second parsed arg should be correct');
  assert.eq(parsed.flags[0], '-two', 'the first parsed flag should be correct');
  assert.eq(
    parsed.flags[1],
    '-four',
    'the second parsed flag should be correct'
  );
});

await test('retrieve_template should return the current template', async () => {
  const expected_template = await readFile(
    `${__dirname}/../templates/migration.mjs`,
    'utf8'
  );

  const template = await retrieve_template('migration.mjs');

  assert.eq(template, expected_template, 'the template is read correctly');
});
