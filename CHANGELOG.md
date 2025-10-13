# Changelog

Toda a alteração relevante deste projeto é registada aqui. O formato segue o
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) e o versionamento é [SemVer](https://semver.org/).

## [1.3.0] - 2025-09-25
### Added
- **Ribbon buttons v5** nas navegações (pill, gradiente suave, diamante, foco acessível).
- **Tema claro (soft-light)** para Validador, Históricos e Forense (fundo claro, painéis brancos, tabelas legíveis).
- **Rodapé configurável** via `IDMAR_FOOTER_TEXT` (valor atual: “IDMAR · Identificação Marítima — Cascos & Motores”).
- **Centralização de branding** (`idmar-config.v4.js`): Nome “IDMAR” + subtítulo único.
- **Realce da página ativa** na navegação; labels consistentes (Validador / Histórico WIN / Histórico Motor / Forense / Sair).

### Changed
- **Ordem de includes** normalizada (config → i18n → header → overrides → version) para evitar “app.name/app.subtitle”.
- **Login** sem navegação (links ocultos via `IDMAR_HIDE_NAV=true`).
- **Cache-busting robusto** (nomes de ficheiro `v4`/`v5` e `?v=` quando aplicável).

### Fixed
- Páginas que não refletiam alterações recentes devido a **cache** e a **faltas/ordem** de `script`/`link`.
- Inconsistências de texto/labels em alguns cabeçalhos.

### Notes
- Páginas alvo atualizadas: `login.html`, `validador.html`, `historico_win.html`, `historico_motor.html`, `forense.html`.
- Novos assets: `css/theme-soft-light.v1.css`, `css/nav-ribbon.v5.css`, `js/idmar-config.v4.js`, `js/header-override.v4.js`, `js/idmar-version.v5.js`.

## [1.2.x] - 2025-09-xx
- Iterações anteriores (NAV/MIEC → IDMAR), limpeza inicial de cabeçalho e navegação.

