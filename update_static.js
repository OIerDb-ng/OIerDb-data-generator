#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

let output = {};

fs.readdirSync('static')
    .filter((fn) => fn.endsWith('.json'))
    .map((fn) => {
        let name = path.basename(fn);
        let content = fs.readFileSync(`static/${fn}`, 'utf8');
        output[name] = {
            enumerable: true,
            value: JSON.parse(content),
            writable: true,
        };
    });

output.schools = {
    enumerable: true,
    value: JSON.parse(fs.readFileSync('dist/school.json', 'utf8')),
    writable: true,
};

fs.writeFileSync('dist/static.js', `Object.defineProperties(OIerDb,${JSON.stringify(output)});\n`);
fs.unlinkSync('dist/school.json');
