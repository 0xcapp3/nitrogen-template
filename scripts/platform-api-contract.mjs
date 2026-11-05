import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { format } from "prettier";
const directory = new URL("../contracts/platform-api/1.0.0/", import.meta.url);
const provenance = JSON.parse(
  readFileSync(new URL("provenance.json", directory), "utf8"),
);
for (const [name, artifact] of Object.entries(provenance.artifacts)) {
  const digest = createHash("sha256")
    .update(readFileSync(new URL(name, directory)))
    .digest("hex");
  if (digest !== artifact.sha256)
    throw new Error(`Current API artifact drift: ${name}`);
}
const document = JSON.parse(
  readFileSync(new URL("openapi.json", directory), "utf8"),
);
const schemas = document.components.schemas;
function type(schema) {
  if (schema.$ref) return schema.$ref.split("/").at(-1);
  if (schema.anyOf || schema.oneOf)
    return (schema.anyOf ?? schema.oneOf).map(type).join(" | ");
  if (schema.allOf) return schema.allOf.map(type).join(" & ");
  if (schema.enum)
    return schema.enum.map((item) => JSON.stringify(item)).join(" | ");
  if (Array.isArray(schema.type))
    return schema.type
      .map((kind) => type({ ...schema, type: kind }))
      .join(" | ");
  if (schema.type === "integer")
    return schema.format === "int64" ? "bigint" : "number";
  if (["number", "string", "boolean", "null"].includes(schema.type))
    return schema.type;
  if (schema.type === "array") return `Array<${type(schema.items)}>`;
  if (schema.type === "object") {
    if (!schema.properties) return `Record<string, ${schema.additionalProperties && typeof schema.additionalProperties === "object" ? type(schema.additionalProperties) : "unknown"}>`;
    return `{${Object.entries(schema.properties)
      .map(
        ([key, child]) =>
          `${JSON.stringify(key)}${schema.required?.includes(key) ? "" : "?"}: ${type(child)};`,
      )
      .join("\n")}}`;
  }
  if (Object.keys(schema).length === 0) return "unknown";
  throw new Error("Unsupported current API schema");
}
function int64Paths(schema, path = "", ancestors = []) {
  if (schema.$ref) {
    const name = schema.$ref.split("/").at(-1);
    if (ancestors.includes(name))
      throw new Error("Recursive API schema needs explicit codec support");
    return int64Paths(schemas[name], path, [...ancestors, name]);
  }
  if (schema.format === "int64") return [path];
  if (schema.anyOf || schema.oneOf || schema.allOf)
    return [
      ...new Set(
        (schema.anyOf ?? schema.oneOf ?? schema.allOf).flatMap((child) =>
          int64Paths(child, path, ancestors),
        ),
      ),
    ];
  if (schema.items) return int64Paths(schema.items, path + "/*", ancestors);
  return Object.entries(schema.properties ?? {}).flatMap(([key, child]) =>
    int64Paths(
      child,
      path + "/" + key.replace(/~/g, "~0").replace(/\//g, "~1"),
      ancestors,
    ),
  );
}
const names = Object.keys(schemas).sort();
const source = await format(
  `// Generated from Platform current API; yarn contract:generate.\n${names.map((name) => `export type ${name} = ${type(schemas[name])};`).join("\n")}\nexport interface CurrentSchemas {${names.map((name) => `${name}: ${name};`).join("\n")}}\nexport const int64Fields = ${JSON.stringify(Object.fromEntries(names.map((name) => [name, int64Paths(schemas[name])])))} as const;\n`,
  { parser: "typescript" },
);
const output = new URL("../app/platform/current-contract.ts", import.meta.url);
if (process.argv.includes("--check")) {
  if (readFileSync(output, "utf8") !== source)
    throw new Error("Current API generated types drift");
} else writeFileSync(output, source);
