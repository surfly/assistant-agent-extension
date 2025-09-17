<a href="https://github.com/surfly/agent-extension-blueprint"><img src="./static/hero.png" height="72"></a>

# Webfuse Assistant Agent

<a href="https://webfuse.com"><img src="https://img.shields.io/badge/Webfuse-Extension-3b82f6"></a>

This is a Webfuse AI web agent extension providing a browsing assistant for arbitrary web pages.

## Setup

1. Copy template repository.
2. Clone repository to local machine.
3. Change working directory to repository directory.
4. Create `.env` file in root directory and provide credentials (compare `.env.example`).
5. Run `npm install`.

## Workflow

1. Run `npm run bundle:debug`.
2. Open preview URL in browser.

> The extension is built with the [Labs](https://www.webfuse.com/labs) framework.

## Deploy

1. Run `npm run bundle`.
2. Upload `dist` directory to Webfuse Space (via Session UI).

> Production bundles do not copy environmental variables, but require manual provision via Session UI.

## 

<img src="./.github/recording.gif">