# opengrade

[![Release](https://img.shields.io/github/v/release/duribeiro/opengrade)](https://github.com/duribeiro/opengrade/releases)
[![CI](https://github.com/duribeiro/opengrade/actions/workflows/ci.yml/badge.svg)](https://github.com/duribeiro/opengrade/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/duribeiro/opengrade)](LICENSE)
[![Dependabot](https://img.shields.io/badge/dependabot-enabled-025e8c?logo=dependabot)](.github/dependabot.yml)
[![Conventional Commits](https://img.shields.io/badge/commits-conventional-fe5196)](https://www.conventionalcommits.org/pt-br/v1.0.0/)

Correcao de provas com IA a partir de foto do celular, em codigo aberto

## Como trabalhar neste projeto

- Regras do agente e do projeto: [AGENTS.md](AGENTS.md).
- Como uma mudança chega na `main`: [CONTRIBUTING.md](CONTRIBUTING.md).
- Onde o trabalho parou: [pipeline/STATE.md](pipeline/STATE.md).
- Decisões tomadas: [pipeline/decisions](pipeline/decisions/README.md).
- Histórico de versões: [CHANGELOG.md](CHANGELOG.md).

## O que faz (v0.1.0)

O professor fotografa a prova respondida (até 3 páginas). A IA lê cada questão, transcreve a resposta do aluno, sugere uma nota de 0 a 1 e marca com o selo **Revisar** o que estiver ilegível ou incerto. O professor ajusta qualquer nota e o total atualiza na hora. O gabarito é opcional.

Visão completa e roteiro: [docs/PRD.md](docs/PRD.md). Prova de exemplo para testar: [docs/exemplo-prova.jpg](docs/exemplo-prova.jpg).

## Como rodar

Precisa de Node 20 ou mais novo.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

## Use a sua própria chave de IA

O OpenGrade fala com qualquer provedor no formato da API da OpenAI. Preencha três variáveis no `.env.local` (ou nas variáveis de ambiente da hospedagem):

| Provedor | `LLM_BASE_URL` | `LLM_MODEL` |
|---|---|---|
| Ollama Cloud (padrão) | `https://ollama.com/v1` | `kimi-k2.6` |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai` | `gemini-3.5-flash` |
| OpenRouter | `https://openrouter.ai/api/v1` | `anthropic/claude-sonnet-5.5` |
| OpenAI | `https://api.openai.com/v1` | um modelo com visão |

`LLM_API_KEY` recebe a chave do provedor. O modelo precisa aceitar imagem e chamada de ferramenta. `LLM_REASONING_EFFORT=none` deixa a correção mais rápida; deixe vazio se o provedor não aceitar o campo.
