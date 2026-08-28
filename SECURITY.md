# Security

This plugin registers static color records with Paseo's official `plugin.addTheme()` API. It does not open ports, use CDP, inject CSS, access files, make network requests, or run subprocesses.

Paseo plugins are trusted unsandboxed code. Review `index.ts` before installing and pin a release tag or commit when cloning. Paseo's Git installer does not run package-manager install scripts.

Report security concerns through GitHub private vulnerability reporting after the repository is published.
