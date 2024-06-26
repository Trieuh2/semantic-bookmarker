import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

import {
  chromeExtension,
  simpleReloader,
} from "rollup-plugin-chrome-extension";
import { emptyDir } from "rollup-plugin-empty-dir";
import zip from "rollup-plugin-zip";
import replace from "@rollup/plugin-replace";
import postcss from "rollup-plugin-postcss";

const isProduction = process.env.NODE_ENV === "production";

export default {
  input: "src/manifest.json",
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    chunkFileNames: "[name]-[hash].js",
  },
  plugins: [
    replace({
      "process.env.NODE_ENV": isProduction
        ? JSON.stringify("production")
        : JSON.stringify("development"),
      preventAssignment: true,
    }),
    chromeExtension(),
    simpleReloader(),
    resolve(),
    commonjs(),
    typescript(),
    postcss(),
    emptyDir(),
    isProduction && zip({ dir: "releases" }),
  ],
};
