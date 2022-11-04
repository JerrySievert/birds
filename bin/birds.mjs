#!/usr/bin/env node

import {
  create_command,
  get_migrations,
  merge_migrations,
  parse_arguments,
  read_migration_status,
  setup_migrations_folder,
  up_command,
  down_command,
  status_command,
  help_command,
  validate,
  write_migration_status
} from '../index.mjs';

const run = async (args) => {
  // Split and parse the arguments.
  const [interpreter, source, command, ...command_args] = args;
  const parsed_arguments = parse_arguments(command_args);

  // Verify the configuration.
  const migration_status = await read_migration_status();

  // Check the migrations, warn if anything is out of place.
  await setup_migrations_folder();

  // Get the current list of migrations and merge it.
  const migrations = await get_migrations();

  // Merge the current list of migrations with what existed before.
  merge_migrations(migration_status, migrations);

  let result;

  try {
    validate({ command, ...parsed_arguments });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }

  try {
    switch (command) {
      case 'create':
        result = await create_command({
          migration_status,
          ...parsed_arguments
        });
        break;

      case 'up':
        result = await up_command({ migration_status, ...parsed_arguments });
        break;

      case 'down':
        await down_command({ migration_status, ...parsed_arguments });
        break;

      case 'status':
        status_command({ migration_status, ...parsed_arguments });
        break;

      case 'help':
        help_command({ migration_status, ...parsed_arguments });
        break;

      default:
        console.log(`unknown command: ${command}`);
    }
  } catch (err) {
    console.log('error', err);
  }

  // Write the new configuration.
  await write_migration_status(migration_status);

  process.exit(0);
};

await run(process.argv);
