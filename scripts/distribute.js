/*
 * Goals
 * 1. Correctly modify any imports
 * 2. Provide an unminifed and a minified version (still need TODO)
 * 
 * Questions
 * 1. Do we start with the files in src or do we pull from
 *    the dist directory?
 */

import { readdirSync } from "fs";
import { resolve } from "path";
import esbuild from "esbuild";
import glob from "glob";
import rewritePaths from "./utilities/esbuild-plugins/rewrite-paths/index.js";

const entryPointFilesExcludes = [
  "pfe-sass",
];

const entryPoints = readdirSync(resolve("elements"), { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && !entryPointFilesExcludes.includes(dirent.name))
  .flatMap(dirent => glob.sync(`elements/${dirent.name}/dist/**.js`));

esbuild.build({
  entryPoints,
  entryNames: "[dir]/../built/[name]",
  outdir: "elements",
  minify: true,
  minifyWhitespace: true,
  allowOverwrite: true,
  plugins: [ rewritePaths ]
});