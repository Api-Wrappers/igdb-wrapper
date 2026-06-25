const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const { pathToFileURL } = require("node:url");

async function main() {
	assert.equal(existsSync("dist/index.mjs"), true, "missing ESM build");
	assert.equal(existsSync("dist/index.cjs"), true, "missing CJS build");
	assert.equal(existsSync("dist/index.d.mts"), true, "missing declarations");

	const esm = await import(pathToFileURL(`${process.cwd()}/dist/index.mjs`));
	const cjs = require("../dist/index.cjs");

	for (const entry of [esm, cjs]) {
		assert.equal(typeof entry.IGDBClient, "function", "IGDBClient export");
		assert.equal(
			typeof entry.MultiQueryBuilder,
			"function",
			"MultiQueryBuilder export",
		);
		assert.equal(typeof entry.IGDB_ENDPOINTS.games, "string", "endpoint map");
	}

	const pack = spawnSync("npm", ["pack", "--dry-run", "--json"], {
		encoding: "utf8",
	});
	assert.equal(pack.status, 0, pack.stderr || pack.stdout);

	const [manifest] = JSON.parse(pack.stdout);
	const files = new Set(manifest.files.map((file) => file.path));
	for (const file of [
		"dist/index.mjs",
		"dist/index.cjs",
		"dist/index.d.mts",
		"README.md",
		"docs/querying.md",
	]) {
		assert.equal(files.has(file), true, `packed file missing: ${file}`);
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
