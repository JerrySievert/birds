# `migrations.json` File Format

JSON file format for the `migrations.json` file.

## Example

```
{
  "last_migration": 1667195599117,
  "migrations": {
		"1667578879582-foo.mjs": {
			"date": "2022-11-04T16:21:19.582Z",
			"filename": "1667578879582-foo.mjs",
			"migrated": false,
			"name": "foo",
			"timestamp": 1667578879582
		}
	}
}
```
