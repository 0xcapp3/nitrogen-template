#!/usr/bin/env node
/**
 * Security watch for the dependencies this repo pins by hand.
 *
 * Background: `.github/dependabot.yml` holds the React Router family at 7.18.2
 * with `ignore` rules, and those rules suppress security updates as well as
 * version updates. So the one class of advisory we are structurally blind to is
 * exactly the one on the pinned packages.
 *
 * A blanket `yarn npm audit` gate does not solve this. The tree carries dozens
 * of transitive advisories in build-only tooling (brace-expansion via minimatch,
 * browserslist via babel, postcss via vite, tar via node-gyp) that nobody is
 * going to action, and a job that is permanently red is a job nobody reads.
 *
 * So: report everything, but fail only on the pinned packages.
 *
 * Exit codes: 0 = no advisory on a pinned package, 1 = at least one,
 * 2 = the audit itself could not be run.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

/** Packages held back in package.json, and therefore invisible to Dependabot. */
const PINNED = [
  "react-router",
  "@react-router/dev",
  "@react-router/fs-routes",
  "@react-router/node",
  "@react-router/serve",
];

const run = promisify(execFile);

async function audit() {
  try {
    const { stdout } = await run(
      "yarn",
      ["npm", "audit", "--all", "--recursive", "--json"],
      { maxBuffer: 32 * 1024 * 1024 },
    );
    return stdout;
  } catch (error) {
    // `yarn npm audit` exits non-zero when it finds anything, which is the
    // normal case here. Only a missing stdout means it genuinely failed.
    if (error.stdout) return error.stdout;
    console.error("Could not run `yarn npm audit`:", error.message);
    process.exit(2);
  }
}

const rows = (await audit())
  .trim()
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  // Yarn reports deprecation notices through the same channel as advisories.
  // They are not vulnerabilities.
  .filter((row) => !String(row.children.ID).includes("deprecation"));

const bySeverity = rows.reduce((acc, row) => {
  acc[row.children.Severity] = (acc[row.children.Severity] ?? 0) + 1;
  return acc;
}, {});

const packages = [...new Set(rows.map((row) => row.value))].sort();

console.log(`Advisories in the dependency tree: ${rows.length}`);
console.log(
  Object.entries(bySeverity)
    .map(([severity, count]) => `  ${severity}: ${count}`)
    .join("\n") || "  none",
);
console.log(`\nAffected packages (${packages.length}):`);
console.log(packages.map((name) => `  ${name}`).join("\n") || "  none");

const onPinned = rows.filter((row) => PINNED.includes(row.value));

if (onPinned.length === 0) {
  console.log(
    `\nNo advisory on the pinned packages (${PINNED.join(", ")}). Nothing to action here.`,
  );
  process.exit(0);
}

console.error(
  `\nADVISORY ON A PINNED PACKAGE — Dependabot will not open a PR for this.\n`,
);
for (const row of onPinned) {
  console.error(`  ${row.value}: ${row.children.Issue}`);
  console.error(`    severity: ${row.children.Severity}`);
  console.error(`    vulnerable: ${row.children["Vulnerable Versions"]}`);
  console.error(`    installed:  ${row.children["Tree Versions"].join(", ")}`);
  if (row.children.URL) console.error(`    ${row.children.URL}`);
}
console.error(
  `\nThe pin exists because react-router 7.18.3 breaks action POSTs behind a\n` +
    `TLS-terminating proxy. See the comment in .github/dependabot.yml. Lifting\n` +
    `the pin means adopting \`allowedActionOrigins\`; assess that against the\n` +
    `advisory above.`,
);
process.exit(1);
