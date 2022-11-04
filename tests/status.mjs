'use strict';

import { readFile, rm, writeFile } from 'node:fs/promises';
import { assert, test } from 'st';

import {
  read_migration_status,
  write_migration_status
} from '../lib/status.mjs';

// Change into the sandbox directory for any file writes or creations.
process.chdir('./tests/sandbox');

await test('read_migration_status should return an empty migration if there is no file', async () => {
  const status = await read_migration_status();

  assert.eq(status.last_migration, null, 'The last_migration should be null');
  assert.eq(
    Object.keys(status.migrations).length,
    0,
    'There should be no migrations'
  );
});

await test('write_migration_status should create a .migrations.json file containing what is sent', async () => {
  await write_migration_status({ foo: 'bar' });

  const input = await readFile('./.migrations.json');

  assert.eq(input, '{"foo":"bar"}', 'should match');

  // Remove the migrations file.
  await rm('./.migrations.json');
});

await test('read_migration_status should be able to be rehydrated', async () => {
  const status = await read_migration_status();

  status.last_migration = +new Date();
  status.migrations[`${status.last_migration}-test.mjs`] = {
    timestamp: status.last_migration,
    name: 'test',
    date: new Date(status.last_migration),
    filename: `${status.last_migration}-test.mjs`,
    migrated: false
  };

  await write_migration_status(status);

  const new_status = await read_migration_status();

  assert.eq(
    new_status.last_migration,
    status.last_migration,
    'the last_migrations should match'
  );
  assert.eq(
    Object.keys(new_status.migrations).length,
    1,
    'there should be one migration'
  );
  assert.eq(
    new_status.migrations[`${status.last_migration}-test.mjs`].name,
    'test',
    'the name should match'
  );

  await rm('./.migrations.json');
});

process.chdir('..');
