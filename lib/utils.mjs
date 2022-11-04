'use strict';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate filename for a migration.
const generate_migration_filename = (name) => {
  const now = new Date();

  return `${+now}-${name}.mjs`;
};

// Retrieve a template by name.
const retrieve_template = async (name) => {
  try {
    const file = await readFile(`${__dirname}/../templates/${name}`, 'utf8');

    return file;
  } catch (err) {
    throw new Error(
      `Unable to retrieve template ${__dirname}/../templates/${name}`
    );
  }
};

// Really dumb parsing, but the commands are simple.
const parse_arguments = (args) => {
  const results = {
    args: [],
    flags: []
  };

  args.forEach((arg) => {
    if (arg.startsWith('-')) {
      results.flags.push(arg);
    } else {
      results.args.push(arg);
    }
  });

  return results;
};

export { generate_migration_filename, parse_arguments, retrieve_template };
