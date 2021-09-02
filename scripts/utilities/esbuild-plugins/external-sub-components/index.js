/**
 * This plugin will target internal .js imports and will
 * add them to externals. This will prevent sub-components from
 * being bundled. This does NOT affect node_modules dependencies.
 */
const externalSubComponents = {
  name: "externalSubComponents",
  setup(build) {
		// look for .js imports
		build.onResolve({ filter: /.js$/ }, (args) => {
			// add all of them as 'external'
			return { external: true }
		})
  }
};

export default externalSubComponents;