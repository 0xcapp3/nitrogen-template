import Ajv2020, { type ValidateFunction } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import document from "../../contracts/platform-api/1.0.0/openapi.json";
import {
  int64Keyword,
  runtimeSchema,
} from "../../contracts/platform-api/1.0.0/transport";
import type { CurrentSchemas } from "./current-contract";

function references(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(references);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      key === "$ref" && typeof child === "string"
        ? child.replace("#/components/schemas/", "#/$defs/")
        : references(child),
    ]),
  );
}

const ajv = new Ajv2020({ strict: true, ownProperties: true });
addFormats(ajv);
ajv.addFormat("int32", {
  type: "number",
  validate: (value) =>
    Number.isInteger(value) && value >= -2147483648 && value <= 2147483647,
});
ajv.addKeyword(int64Keyword);
const id = "https://nitrogen.local/contracts/platform-api/1";
ajv.addSchema({
  $id: id,
  $defs: runtimeSchema(references(document.components.schemas)),
});
const validators = new Map<keyof CurrentSchemas, ValidateFunction>();

export function conformsCurrent<N extends keyof CurrentSchemas>(
  name: N,
  value: unknown,
): value is CurrentSchemas[N] {
  let validate = validators.get(name);
  if (!validate) {
    validate = ajv.compile({ $ref: `${id}#/$defs/${name}` });
    validators.set(name, validate);
  }
  return validate(value);
}
