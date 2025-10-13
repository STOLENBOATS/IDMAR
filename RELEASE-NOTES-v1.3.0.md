# IDMAR Vs 1.3.0 — Tema claro + Ribbons v5 + Footer institucional

**Data:** 2025-09-25

## Resumo
- UI **mais clara e legível** (tema soft-light).
- Navegação com **ribbons v5** (melhor foco/hover e responsivo).
- Cabeçalho com **branding consistente**.
- **Login** sem navegação.
- **Footer institucional**: “IDMAR · Identificação Marítima — Cascos & Motores”.

## Destaques técnicos
- Normalização da **ordem de includes** para estabilidade do header e i18n.
- **Cache-busting** por filename (v4/v5) para evitar versões antigas no Pages/CDN.
- Footer controlado por `IDMAR_FOOTER_TEXT` (fallback para etiqueta com versão+data).

## Conteúdo recomendado nos Assets
- `IDMAR-v1.3-release.zip`
  - `login.html`, `validador.html`, `historico_win.html`, `historico_motor.html`, `forense.html`
  - `css/theme-soft-light.v1.css`, `css/nav-ribbon.v5.css`
  - `js/idmar-config.v4.js`, `js/header-override.v4.js`, `js/idmar-version.v5.js`

## Como aplicar
1. Substituir as páginas no root do repositório.
2. Adicionar/atualizar os assets indicados.
3. Publicar (GitHub Pages) e forçar **Ctrl+F5**.

## Comandos para taggar
```bash
git tag -a v1.3.0 -m "IDMAR Vs 1.3.0 — Tema claro, Ribbons v5, Footer institucional"
git push origin v1.3.0
```

## Ligações úteis
- Ver alterações detalhadas: `CHANGELOG.md`
