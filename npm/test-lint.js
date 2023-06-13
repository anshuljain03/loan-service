#!/usr/bin/env node
const { ESLint } = require('eslint');

const LINT_SOURCE_DIRS = [
    './test/**/*.js',
    './app.js',
    './**/*.js',
    './npm/**/*.js'
];

module.exports = async function (exit) {
    // banner line
    console.info('\nLinting files using eslint...');

    const eslint = new ESLint();
    const results = await eslint.lintFiles(LINT_SOURCE_DIRS);
    const errorReport = ESLint.getErrorResults(results);
    const formatter = await eslint.loadFormatter();

    // log the result to CLI
    console.info(formatter.format(results));

    (errorReport && !errorReport.length) && console.info('eslint ok!');

    exit(Number(errorReport && errorReport.length) || 0);
};

!module.parent && module.exports(process.exit);
