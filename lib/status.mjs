'use strict';

import { readFile, writeFile } from 'node:fs/promises';
import { retrieve_template } from './utils.mjs';

// Migration file for current status.
const migration_file = './.migrations.json';

// Read the current migration status.
const read_migration_status = async () => {
  try {
    const migration_status_text = await readFile(migration_file, 'utf8');

    const migration_status = JSON.parse(migration_status_text);

    return migration_status;
  } catch (err) {
    if (err.code === 'ENOENT') {
      try {
        const file = await retrieve_template('migrations.json');

        return JSON.parse(file);
      } catch (err) {
        console.log(err);
        throw new Error('Unable to retrieve template migrations.json');
      }
    }

    throw err;
  }
};

// Write the current migration status.
const write_migration_status = async (migration_status) => {
  try {
    const migration_status_text = JSON.stringify(migration_status);

    await writeFile(migration_file, migration_status_text, 'utf8');
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export { read_migration_status, write_migration_status };
