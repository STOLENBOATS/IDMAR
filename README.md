# IDMAR — All-in-one GitHub setup (labels → milestones → issues)

Scripts para preparar o repositório com **labels**, **milestones** e **issues** do backlog, usando o **GitHub CLI (`gh`)**.

## Pré-requisitos
- `gh` instalado (https://cli.github.com/)
- `gh auth login` efetuado
- Permissões no repositório alvo

## Uso rápido
```bash
# 1) Entrar na pasta do kit
cd idmar_all_in_one_fixed2

# 2) Autenticar (se necessário)
gh auth login

# 3) Criar labels, milestones e issues (num só comando)
REPO=owner/nome-do-repo make all
# ou, sem make:
REPO=owner/nome-do-repo bash create_labels.sh
REPO=owner/nome-do-repo python3 create_github_issues.py
```

## Ficheiros
- `create_labels.sh` — cria/atualiza labels (Priority e Epics).
- `create_github_issues.py` — cria milestones e issues a partir de `IDMAR-backlog.csv`.
- `IDMAR-backlog.csv` — backlog inicial (épico, prioridade, estimativa, milestone).
- `Makefile` — atalho `make all` (labels → issues).

## Dica
- Testa em modo “dry-run” das issues:
```bash
DRY_RUN=1 REPO=owner/nome-do-repo python3 create_github_issues.py
```
