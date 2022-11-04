'use strict';

import {
  get_migrations,
  import_migration,
  merge_migrations,
  write_migration
} from './migrations.mjs';
import { generate_migration_filename, retrieve_template } from './utils.mjs';

const create_command = async ({ migration_status, args, flags }) => {
  // Generate the filename.
  const filename = generate_migration_filename(args[0]);

  // Read the template.
  const template = await retrieve_template('migration.mjs');

  // Write the new migrations file.
  await write_migration(filename, template);

  // Generate the new migration status.
  const migrations = await get_migrations();

  // And merge them.
  merge_migrations(migration_status, migrations);

  return 0;
};

const up_command = async ({ migration_status, args, flags }) => {
  // Get the keys to figure out current migration status.
  const keys = Object.keys(migration_status.migrations).sort();

  for (const key of keys) {
    const migration = migration_status.migrations[key];
    if (migration_status.last_migration !== null) {
      if (
        migration.migrated === true &&
        migration.timestamp > migration_status.last_migration
      ) {
        console.log(migration.timestamp, migration_status.last_migration);
        throw new Error(`Bad migration status for ${key}.`);
      }

      if (migration.migrated) {
        console.log('already migrated, skipping', key);
        continue;
      }

      try {
        const { up } = await import_migration(key);

        console.log(`Migrating ${key}`);
        await up();
      } catch (err) {
        console.log(`Migration failed for ${key}:\n${err}`);
        return 1;
      }
    }

    migration.migrated = true;
    migration_status.last_migration = migration.timestamp;
  }

  return 0;
};

const down_command = async ({ migration_status, args, flags }) => {
  // Get the keys to figure out current migration status, reverse order.
  const keys = Object.keys(migration_status.migrations).sort().reverse();

  for (const key of keys) {
    const migration = migration_status.migrations[key];
    if (migration_status.last_migration !== null) {
      if (
        migration.migrated === true &&
        migration.timestamp > migration_status.last_migration
      ) {
        console.log(migration.timestamp, migration_status.last_migration);
        throw new Error(`Bad migration status for ${key}.`);
      }

      if (migration.migrated === false) {
        continue;
      }

      try {
        const { down } = await import_migration(key);

        console.log(`Migrating ${key}`);
        await down();
      } catch (err) {
        console.log(err);
        console.log(`Migration failed for ${key}:\n${err}`);
        return 1;
      }
    }

    migration.migrated = false;
    migration_status.last_migration = migration.timestamp;
  }

  return 0;
};

const status_command = async ({ migration_status, args, flags }) => {};

const help_command = async ({ migration_status, args, flags }) => {};

const validate = ({ command, args, flags }) => {
  switch (command) {
    case 'create':
      if (args.length !== 1) {
        throw new Error(`create can only have one argument`);
      }

      break;

    case 'down':
      if (args.length !== 0) {
        throw new Error(`down can not have any arguments`);
      }

      break;

    case 'up':
      if (args.length !== 0) {
        throw new Error(`up can not have any arguments`);
      }

      break;
  }
};

export {
  create_command,
  down_command,
  help_command,
  status_command,
  up_command,
  validate
};
