#!/usr/bin/env node

/**
 * @fileoverview
 * Local translation generation script - Generate scratch_msgs.js from local JSON files
 * This script replaces the functionality of pulling translations from Transifex
 * 
 * Usage:
 * 1. Create or modify translation files in msg/json/ directory (e.g., zh-cn.json)
 * 2. Run this script to generate scratch_msgs.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const assert = require('assert');

// Configuration
const PATH_INPUT = path.resolve(__dirname, '../msg/json/*.json');
const PATH_OUTPUT = path.resolve(__dirname, '../msg');

// Read English base file
let en = fs.readFileSync(path.resolve(__dirname, '../msg/json/en.json'));
en = JSON.parse(en);
const enKeys = Object.keys(en).sort().toString();

// Validate single translation entry
const validateEntry = function (entry) {
    const re = /(%\d)/g;
    const [key, translation] = entry;
    const enMatch = en[key].match(re);
    const tMatch = translation.match(re);
    const enCount = enMatch ? enMatch.length : 0;
    const tCount = tMatch ? tMatch.length : 0;
    assert.strictEqual(tCount, enCount, `${key}:${en[key]} - "${translation}" placeholder mismatch`);
    if (enCount > 0) {
      assert.notStrictEqual(tMatch, null, `${key} is missing a placeholder: ${translation}`);
      assert.strictEqual(
          tMatch.sort().toString(),
          enMatch.sort().toString(),
          `${key} is missing or has duplicate placeholders: ${translation}`
      );
    }
    assert.strictEqual(translation.match(/[\n]/), null, `${key} contains a newline character ${translation}`);
};

// Validate entire translation file
const validate = function (json, name) {
    try {
        assert.strictEqual(Object.keys(json).sort().toString(), enKeys, `${name}: Locale json keys do not match en.json`);
        Object.entries(json).forEach(validateEntry);
        return true;
    } catch (error) {
        console.warn(`Warning: ${name} validation failed: ${error.message}`);
        return false;
    }
};

// Generate file header
let file = `// This file was automatically generated from local JSON files.
// Do not modify directly. Edit the JSON files in msg/json/ instead.

'use strict';

goog.provide('Blockly.ScratchMsgs.allLocales');

goog.require('Blockly.ScratchMsgs');

`;

// Process all JSON files
let files = glob.sync(PATH_INPUT);
let processedCount = 0;
let skippedCount = 0;

console.log('Starting local translation file generation...\n');

files.forEach(function (uri) {
    const name = path.parse(uri).name;
    // Skip special files
    if (name === 'qqq' || name === 'synonyms') {
        skippedCount++;
        return;
    }
    
    try {
        let body = fs.readFileSync(uri, 'utf8');
        body = JSON.parse(body);
        
        // Validate translation
        if (validate(body, name)) {
            file += '\n';
            file += `Blockly.ScratchMsgs.locales["${name}"] =\n`;
            file += JSON.stringify(body, null, 4);
            file += ';\n';
            processedCount++;
            console.log(`✓ Processed: ${name}`);
        }
    } catch (error) {
        console.error(`✗ Processing failed: ${name} - ${error.message}`);
    }
});

// Write generated file
try {
    fs.writeFileSync(`${PATH_OUTPUT}/scratch_msgs.js`, file);
    console.log(`\n✓ Successfully generated scratch_msgs.js`);
    console.log(`  - Processed ${processedCount} language files`);
    console.log(`  - Skipped ${skippedCount} special files`);
} catch (error) {
    console.error(`\n✗ File generation failed: ${error.message}`);
    process.exit(1);
}