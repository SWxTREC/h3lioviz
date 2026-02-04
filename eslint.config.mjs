import { default as defaultRules } from "tslint-default/default-rules.mjs";
import { default as defaultAngularRules } from "tslint-default/default-angular-rules.mjs";

import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([".angular", "dist", "node_modules"]), {
    files: ["**/*.ts"],

    extends: [
        defaultAngularRules,
        defaultRules
    ],

    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: ["tsconfig.json", "e2e/tsconfig.e2e.json"],
            createDefaultProgram: true,
            sourceType: "module"
        },
    },

    rules: {
        "@angular-eslint/component-selector": ["error", {
            type: "element",
            prefix: ["swt", "lasp"],
            style: "kebab-case",
        }],

        "@angular-eslint/directive-selector": ["error", {
            type: "attribute",
            prefix: ["swt", "lasp"],
            style: "camelCase",
        }],
    },
}, {
    files: ["**/*.html"],

    extends: [
        defaultAngularRules,
        defaultRules
    ],
}]);