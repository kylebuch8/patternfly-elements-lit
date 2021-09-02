import build from "../../scripts/build.js";

build({
  entryPoints: ["src/pfe-progress-steps.ts", "src/pfe-progress-steps-item.ts"],
  outdir: "dist",
});