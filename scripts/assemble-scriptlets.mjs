import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [source, output, revision] = process.argv.slice(2);
if (!source || !output) {
    throw new Error('Usage: node scripts/assemble-scriptlets.mjs <uBlock checkout> <output directory> [revision]');
}

const resources = path.resolve(source, 'src/js/resources');
await import(pathToFileURL(path.join(resources, 'scriptlets.js')));
const { registeredScriptlets } = await import(pathToFileURL(path.join(resources, 'base.js')));

const assembled = registeredScriptlets.map(item => ({
    name: item.name,
    aliases: item.aliases ?? [],
    kind: { mime: item.name.endsWith('.fn') ? 'fn/javascript' : 'application/javascript' },
    content: Buffer.from(item.fn.toString()).toString('base64'),
    dependencies: item.dependencies ?? [],
    permission: item.requiresTrust ? 1 : 0,
}));

// A silent drop in coverage is worse than a failed build: the app keeps its
// previous copy when this asset is missing, but not when it is merely thinner.
if (assembled.length < 100) {
    throw new Error(`Only ${assembled.length} scriptlets were registered; upstream layout probably changed`);
}
const names = new Set(assembled.map(item => item.name));
for (const resource of assembled) {
    for (const dependency of resource.dependencies) {
        if (!names.has(dependency)) throw new Error(`Missing dependency: ${dependency}`);
    }
}

fs.mkdirSync(output, { recursive: true });
const serialized = JSON.stringify(assembled);
fs.writeFileSync(path.join(output, 'scriptlets.json'), serialized);
fs.writeFileSync(path.join(output, 'scriptlets.manifest.json'), JSON.stringify({
    schema: 1,
    generated: new Date().toISOString(),
    upstream: 'https://github.com/gorhill/uBlock',
    revision: revision ?? null,
    count: assembled.length,
    bytes: Buffer.byteLength(serialized),
}, null, 2) + '\n');
console.log(`Assembled ${assembled.length} upstream scriptlet resources`);
