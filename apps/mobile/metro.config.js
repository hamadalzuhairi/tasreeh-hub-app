const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo support for pnpm's default (symlinked, isolated) node_modules layout: watch the
// workspace root so Metro picks up @tasreeh/shared, and follow pnpm's symlinks. Hierarchical
// lookup must stay on so Metro can still find each package's own nested dependency tree
// inside the pnpm virtual store (.pnpm/*/node_modules/...).
config.watchFolders = [workspaceRoot];
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
