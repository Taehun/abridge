# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Abridge is a fast, lightweight Zola theme using semantic HTML and class-light CSS. It achieves perfect Lighthouse scores and focuses on performance and accessibility. The theme can be used directly or as a submodule.

## Development Commands

### Building and Running

```bash
# Serve site locally (dev server with live reload at http://127.0.0.1:1111)
zola serve

# Build site for production
zola build

# Build with custom base URL
zola build --base-url https://example.com
```

### JavaScript Bundling and Minification

The theme uses a Node.js script (`package_abridge.js`) to handle JavaScript bundling, minification, and PWA cache management:

```bash
# Run build with default search library
npm run abridge

# Build with specific search library
npm run offline        # Offline elasticlunr with JavaScript index
npm run elasticlunr    # Elasticlunr with JSON index (default)
npm run elasticlunrjava # Elasticlunr with JavaScript index
npm run pagefind       # Pagefind (WASM-based)
npm run tinysearch     # Tinysearch (WASM-based)
```

The `npm run abridge` script performs:
1. Runs `zola build` to generate initial files
2. Updates PWA service worker cache file lists
3. Generates search index (if pagefind/tinysearch)
4. Minifies JavaScript files based on config.toml settings
5. Bundles JavaScript based on enabled features
6. Runs `zola build` again to update integrity hashes

## Architecture

### Directory Structure

```
abridge/
├── config.toml           # Main configuration
├── content/              # Markdown content files
├── templates/            # Tera template files
│   ├── base.html        # Base template with header/footer
│   ├── index.html       # Homepage template
│   ├── page.html        # Single page template
│   ├── archive.html     # Archive page template
│   ├── macros/          # Reusable template macros
│   ├── partials/        # Template partials (head, social, etc.)
│   └── shortcodes/      # Content shortcodes
├── sass/                 # Theme SCSS files (DO NOT EDIT directly)
│   ├── abridge.scss     # Main theme stylesheet
│   ├── _functions.scss  # SCSS functions and mixins
│   ├── _colors.scss     # Color definitions
│   └── _colors-syntax.scss # Syntax highlighting colors
├── COPY-TO-ROOT-SASS/   # User customization files (copy to project root)
│   ├── abridge.scss     # Override theme variables here
│   └── _extra.scss      # Custom styles
├── static/               # Static assets
│   ├── js/              # JavaScript files
│   ├── sw.js            # Service worker for PWA
│   └── manifest.json    # PWA manifest
├── i18n/                 # Internationalization files
└── package_abridge.js   # Build script for JS/PWA
```

### Configuration System

**config.toml** is the central configuration file with extensive options:

- **[search]**: Search index format (elasticlunr_json, elasticlunr_javascript, fuse_json)
- **[markdown]**: Syntax highlighting, external link behavior
- **[languages.*]**: Multi-language support (fr, es, pt by default)
- **[extra]**: Theme-specific settings:
  - `search_library`: Search implementation ("elasticlunr", "pagefind", "tinysearch", "offline")
  - `js_bundle`: Bundle JS files (true/false)
  - `js_*`: Enable/disable individual JS features (switcher, copycode, email_encode, etc.)
  - `pwa`: Enable Progressive Web App features
  - `menu` / `menu_footer`: Navigation configuration
  - Icon settings, colors, fonts, security headers

### Template System

Templates use Zola's Tera engine with custom macros:

- **base.html**: Defines site structure with blocks for header, content, footer
- **components/components.html**: Reusable template components (metadata display, pagination, `translate`, etc.). Tera 2 components replace Tera 1 macros: define with `{% component name(args) %}...{% endcomponent name %}` and call with `{{<name arg={expr} str="text" />}}`. Components are hygienic (only explicit params are visible), so pass `page`/`config`/`i18n` explicitly.
- **components/seo.html**, **components/jsonld.html**: SEO meta tags and JSON-LD structured data
- **partials/**: Head, JavaScript loading, social links
- **components/*.html** (img, image, imgswap, video, youtube, vimeo, audio, gif, katex, showdata, streamable): Content embeds, formerly shortcodes. In markdown call them as `{{<img src="/images/x.svg" alt="..." w={880} h={460} caption="<i>...</i>" />}}` (numbers/booleans/expressions in braces, strings quoted).
- Markdown content is processed as a Tera template in Zola 0.23+: literal `{{`, `{%` or `{#` in content (Helm/Ansible/Jinja snippets) must be wrapped in `{% raw %}...{% endraw %}` (wrap the whole fenced code block).
- Syntax highlighting (giallo, `[markdown] highlighting = {theme = "github-dark", style = "class"}`) emits numbered color-slot classes (`.z-1`..`.z-12`); their colors are mapped to the abridge palette in `sass/abridge.scss` (`@if $syntax` block). Zola writes the theme's `giallo.css` into the output dir but the site does not link it.

### SCSS Customization

**DO NOT edit files in `sass/` directory** - these are theme files. Instead:

1. Copy `COPY-TO-ROOT-SASS/abridge.scss` to your project's `sass/` directory
2. Override SCSS variables using `@use '../themes/abridge/sass/abridge' with (...)` syntax
3. Customize colors, fonts, icons, and layout options
4. Use `sass/_extra.scss` for additional custom styles

Key customization points:
- `$abridgeMode`: Theme mode (switcher, auto, dark, light)
- `$color`: Color template (orange, blue, blueshade)
- Font variables: `$findFont-Main`, `$fontExt-Main`
- Icon toggles: `$icon-*` variables
- Color overrides: `$f1d`, `$c1d`, `$a1d` (dark) and `$f1`, `$c1`, `$a1` (light)

### JavaScript Architecture

JavaScript is modular and optional - all features work without JS except search:

- **theme.js / theme_light.js**: Theme switcher logic
- **search.js**: Elasticlunr search implementation
- **pagefind_search.js**: Pagefind search implementation
- **tinysearch.js**: Tinysearch implementation
- **codecopy.js**: Copy button for code blocks
- **email.js**: Email obfuscation
- **prestyle.js**: Preload external resources (fonts, etc.)
- **sw_load.js**: Service worker loader for PWA

Bundle files are generated by `package_abridge.js` based on `config.toml` settings.

### Search System

Four search implementations available:

1. **elasticlunr** (default): Client-side, JSON index, ~100KB for medium sites
2. **elasticlunrjava**: Client-side, JavaScript index, faster initial load
3. **pagefind**: WASM-based, scales better for large sites
4. **tinysearch**: WASM-based, smallest index size
5. **offline**: elasticlunrjava with relative paths for offline use

Search index format in config.toml must match library:
- elasticlunr → elasticlunr_json
- elasticlunrjava/offline → elasticlunr_javascript
- pagefind/tinysearch → fuse_json

### PWA (Progressive Web App)

PWA features controlled by `config.toml [extra]` section:

- **pwa = true**: Enable service worker
- **pwa_VER**: Cache version (increment to force cache invalidation)
- **pwa_NORM_TTL / pwa_LONG_TTL**: Cache durations (0 = network first)
- **pwa_cache_all**: Cache entire site or just essential files
- **pwa_TTL_EXEMPT**: File extensions cached indefinitely (js, css, fonts)

The `package_abridge.js` script generates the cache file list automatically.

## Development Workflow

### Testing Changes

1. Make changes to templates, content, or SASS
2. Run `zola serve` to test with live reload
3. Press Ctrl+F5 to force refresh (bypass PWA cache)
4. Or set `pwa = false` in config.toml during development

### Modifying JavaScript

1. Edit source files in `static/js/` (non-minified)
2. Run `npm run abridge` to bundle and minify
3. Second build updates integrity hashes

### Customizing Styles

1. Edit `sass/abridge.scss` (copied from COPY-TO-ROOT-SASS)
2. Override variables using `with (...)` syntax
3. Add custom CSS to `sass/_extra.scss`
4. Zola auto-compiles SCSS when `compile_sass = true`

### Adding Fonts

Option 1 - External (via config.toml):
```toml
fonts = [ {url = "https://fonts.googleapis.com/css?family=Roboto:400,700"} ]
```

Option 2 - Local:
1. Add woff2 files to `static/fonts/`
2. Create SCSS in `sass/fonts/_FontName.scss`
3. Import in `sass/abridge.scss`: `@use "fonts/FontName";`
4. Override font variables in `sass/abridge.scss` with clause

### Working with Submodule Mode

When using Abridge as a theme (submodule):

1. Theme files are in `themes/abridge/`
2. Override files by copying to project root:
   - `config.toml` - Main configuration
   - `sass/abridge.scss` - Style overrides
   - `content/` - Your content
   - `static/` - Your assets
3. `package_abridge.js` automatically syncs changes from submodule
4. Update theme: `git submodule update --remote --merge`

## Common Patterns

### Adding a New Template

1. Create template in `templates/` (or a component in `templates/components/`)
2. Use existing templates as reference; components are global (no imports)
3. i18n data is loaded in `base.html`: `{%- set i18n = load_data(...) -%}` and is visible in child blocks
4. Use `{{<translate key="..." default="..." i18n={i18n} />}}` for strings (capture into a variable with `{% set x %}...{% endset %}` when you need to filter the result)
5. Handle `uglyurls` mode with conditional `.html` suffix

### Multi-language Support

1. Add language to config.toml `[languages.xx]` section
2. Create `i18n/xx.toml` with translated strings
3. Create content with `.xx.md` suffix (e.g., `post.es.md`)
4. Use `{{ macros::translate() }}` in templates

### Adding Social Icons

1. Enable icon in `sass/abridge.scss`: `$icon-platform: true`
2. Add platform config to `config.toml [extra]` section
3. Icons defined in `sass/_functions.scss` as SVG
4. Displayed via `templates/partials/social.html`

## Important Notes

- **Integrity hashes**: Automatically generated by Zola for JS/CSS when `integrity = true`
- **Cachebust**: Hashes in filenames prevent stale cache (handled by Zola)
- **Uglify URLs**: Setting `uglyurls = true` generates explicit `.html` links for offline use
- **Security headers**: Can be set via `netlify.toml` or as meta tags in config.toml
- **Syntax highlighting**: Uses Zola's built-in highlighting with `highlight_theme = "css"`
- **Testing offline**: Build with `npm run offline` then open `public/index.html` directly

## Dependencies

- **Zola** ≥ 0.23.6 (static site generator, Tera 2). 템플릿은 Tera 2 문법(components)으로 작성되어 있어 0.22 이하에서는 빌드되지 않는다.
- **Node.js** (for build script)
  - fast-toml
  - jsonminify
  - pagefind (if using pagefind search)
  - replace-in-file
  - uglify-js

Install Node dependencies: `npm install`
