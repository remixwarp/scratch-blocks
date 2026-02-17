# Translation System Usage Guide

The translation system for this project has been migrated from Transifex to local JSON file management.

## File Structure

```
msg/
├── messages.js              # English source file (edited by developers)
├── scratch_msgs.js          # Generated multilingual file (auto-generated, do not edit)
└── json/
    ├── en.json             # English JSON (auto-generated)
    ├── zh-cn.json          # Simplified Chinese (manually created/edited)
    ├── zh-tw.json          # Traditional Chinese (manually created/edited)
    └── ...                # Other language files
```

## Workflow

### 1. Modify English Translations

Edit the English text in the `msg/messages.js` file.

**Important:**
- All message strings must use single quotes
- Use placeholders like `%1`, `%2`, etc.

### 2. Generate English JSON File

```bash
npm run translate
```

This will generate `msg/json/en.json` from `msg/messages.js`.

### 3. Add or Modify Translations

Create or edit language files in the `msg/json/` directory (e.g., `zh-cn.json`).

**Requirements:**
- Use lowercase filenames with hyphens (e.g., `zh-cn.json`)
- Must contain all the same keys as `en.json`
- Placeholder count and type must match English
- Must not contain newline characters

**Example:**
```json
{
    "CONTROL_FOREVER": "forever",
    "CONTROL_REPEAT": "repeat %1",
    "CONTROL_IF": "if %1 then"
}
```

### 4. Generate Final Translation File

```bash
npm run translate:build
```

This will read all JSON files in the `msg/json/` directory, validate them, and generate `msg/scratch_msgs.js`.

## Validate Translations

Run translation tests:

```bash
npm run test:messages
```

This will check:
- All language files have complete keys
- Placeholders match correctly
- No newline characters are present

## Language Codes

Use standard language code formats:
- `zh-cn` - Simplified Chinese
- `en` - English
- etc.

## Notes

1. **Do not directly edit `scratch_msgs.js`** as it is auto-generated
2. **Run `npm run translate:build` after modifying translations**
3. **Ensure all placeholders match** or validation will fail
4. **Use single quotes** for strings in `messages.js`

## Troubleshooting

### Validation Fails

If translation validation fails, check:
- Translation file contains all keys
- Placeholder count is correct
- No newline characters are present

### Translations Not Taking Effect

Ensure:
- Ran `npm run translate:build`
- Rebuilt the project
- Language code is correct