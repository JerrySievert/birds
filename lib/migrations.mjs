'use strict';

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';

// Migrations folder.
const migrations_folder = './migrations/';

// Create the migrations folder.
const create_migrations_folder = async () => {
  try {
    await mkdir(migrations_folder);
  } catch (err) {
    throw new Error('Unable to create migrations folder');
  }
};

// Check migrations folder.
const check_migrations_folder = async () => {
  try {
    const stats = await stat(migrations_folder);

    if (stats.isDirectory()) {
      return true;
    }
  } catch (err) {}

  return false;
};

// Setup migrations folder.
const setup_migrations_folder = async () => {
  if (await check_migrations_folder()) {
    return;
  }

  await create_migrations_folder();
};

// Get the current list of migrations.
const get_migrations = async () => {
  try {
    const files = await readdir(migrations_folder);
    return files.filter((file) => {
      return file.match(/(\d+)\-(.+)\.mjs$/) ? true : false;
    });

    return results;
  } catch (err) {
    throw new Error(`Unable to read migrations: ${err}`);
  }
};

// Reconstitute a migration by its name into an object.
const reconstitute_migration_from_name = (name) => {
  const parts = name.match(/(\d+)\-(.+)\.mjs$/);

  if (!parts) {
    // If there are no matches, something bad has happened, best to error out.
    throw new Error(`Unable to parse filename ${name} into time and name.`);
  }

  return {
    date: new Date(Number(parts[1])),
    filename: parts[0],
    migrated: false,
    name: parts[2],
    timestamp: Number(parts[1])
  };
};

// Merge existing migrations with a new set of migrations.
const merge_migrations = (migration_status, migrations) => {
  const new_migrations = {};

  migrations.forEach((filename) => {
    const migration_object = reconstitute_migration_from_name(filename);
    new_migrations[migration_object.filename] = migration_object;
  });

  migration_status.migrations = {
    ...new_migrations,
    ...migration_status.migrations
  };

  validate_migrations(migration_status);
};

// Write a migration.
const write_migration = async (filename, template) => {
  await writeFile(`${migrations_folder}${filename}`, template, 'utf8');
};

// Validate migrations.
const validate_migrations = (migration_status) => {
  const values = Object.values(migration_status.migrations).sort((a, b) => {
    return a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestanp ? 1 : 0;
  });

  for (const value of values) {
    if (migration_status.last_migration === null) {
      if (value.migrated) {
        throw new Error(
          `File ${value.filename} has been migrated, but the status is confused.`
        );
      }
    } else {
      if (value.migrated && value.timestamp > migration_status.last_migration) {
        throw new Error(
          `File ${value.filename} has been migrated, but appears after last migration.`
        );
      } else if (
        !value.migrated &&
        value.timestamp < migration_status.last_migration
      ) {
        console.log(migration_status);
        throw new Error(
          `File ${value.filename} has not been migrated, but appears before last migration.`
        );
      }
    }
  }
};

// Import a migration, returning its `up` and `down` exports.
const import_migration = async (filename) => {
  try {
    const file = await readFile(`${migrations_folder}${filename}`, 'utf8');

    const encoded_js = encodeURIComponent(file);
    const data_uri = 'data:text/javascript;charset=utf-8,' + encoded_js;

    return await import(data_uri);
  } catch (err) {
    throw new Error(`Unable to import migration ${filename}: ${err}`);
  }
};

export {
  check_migrations_folder,
  get_migrations,
  import_migration,
  merge_migrations,
  setup_migrations_folder,
  validate_migrations,
  write_migration
};
