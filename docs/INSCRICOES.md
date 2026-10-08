# Semana da Tecnologia UNASP: inscrições

Prazo: hoje, 07/10/2026. Avaliação: 14/10/2026, Arlete Afonso.
Formato: 5 min de pitch + 4 min de perguntas. Vídeo obrigatório na inscrição (até 100 MB).

## Checklist

- [ ] Censo: gravar vídeo, preencher, enviar
- [ ] Agent Engineer: gravar vídeo, preencher, enviar
- [ ] OpenGrade: Claude Code construindo a v0.1.0, gravar vídeo, preencher, enviar

Campos iguais nos três:
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Integrantes:** Eduardo Ribeiro
- **Nome do grupo:** (definir, o mesmo nos três)

Gravar no Windows: `Win + Alt + R` inicia e para. Arquivo em Vídeos > Capturas.

---

## 1. Painel Interativo do Censo de Pessoas com Deficiência

**Resumo**
> Painel web interativo que transforma os dados do Censo 2010 do IBGE sobre pessoas com deficiência em gráficos e filtros fáceis de explorar. O projeto nasceu na aula de UX, quando a tabela original apresentada era difícil de ler. Permite comparar tipos de deficiência, regiões e faixas da população em poucos cliques. Construído com React, Vite e shadcn/ui, com código aberto sob licença MIT. Objetivo: tornar dados públicos sobre acessibilidade compreensíveis para estudantes, gestores e a comunidade.

**Estágio:** Projeto concluído
**Link:** https://github.com/duribeiro/censo-2010-deficiencia

**Roteiro (90 s)**
```
0:00  Tabela original do IBGE: "Na aula de UX vimos essa tabela. Ninguém conseguia ler."
0:20  Abre o painel: "Então construí isto."
0:30  Filtros e gráficos, 2 ou 3 descobertas.
1:10  "Código aberto, feito em React. Próximo passo: atualizar com o Censo 2022."
```

---

## 2. Agent Engineer: Esteira de Engenharia de Software com IA

**Resumo**
> Esteira que constrói aplicações com agentes de IA seguindo o processo de engenharia de software ensinado no curso: levantamento de requisitos, especificação, decisões de arquitetura, implementação, testes e entrega. Em vez de pedir um app em um prompt só, como ferramentas tipo Lovable, a esteira conduz cada etapa e registra as decisões. Como prova, foi usada para construir o subsfor.me, uma loja digital completa com React, Cloudflare Workers e Supabase. Objetivo: mostrar que IA gera software melhor quando segue método, não improviso.

**Estágio:** Protótipo funcional
**Link:** endereço do subsfor.me no ar, se publicado

**Roteiro (2 min)**
```
0:00  "Ferramentas de IA geram apps rápido, mas sem método. Apliquei o que aprendemos em engenharia de software."
0:20  Etapas da esteira e documentos gerados (requisitos, especificação, decisões).
1:00  subsfor.me funcionando: "Esta loja foi construída pela esteira."
1:40  "O diferencial é o processo, não a ferramenta."
```
Na banca: apresentar o subsfor.me como loja digital, sem entrar em revenda de acessos.

---

## 3. OpenGrade: Correção de Provas com IA, em Código Aberto

**Resumo**
> Sistema web de código aberto que corrige provas impressas a partir de uma foto do celular. A IA lê a letra do aluno, corrige questões objetivas e discursivas com ou sem gabarito, e devolve ao professor só as respostas em que tem dúvida. Na UNASP e entre professores consultados, a correção ainda é feita à mão. Diferenciais: código aberto com chave de API própria, aprendizado da letra de cada aluno sem treinar modelo, e roteiro até um agente no WhatsApp para planejamento e criação de provas alinhadas à BNCC, incluindo provas adaptadas para alunos autistas.

**Estágio:** Protótipo inicial (se a v0.1.0 estiver no ar no vídeo). Senão, Ideia.
**Link:** repositório do OpenGrade no GitHub

**Roteiro (2 min)**
```
0:00  "Professor passa horas corrigindo prova à mão. Aqui na UNASP, todo mundo ainda faz assim."
0:25  Demo: fotografa a prova, a IA corrige, aparece o selo Revisar.
0:55  "Já existem soluções pagas, o que prova a demanda. Nenhuma é aberta."
1:20  Roteiro: scanner, turmas, criação de prova adaptada, agente no WhatsApp.
1:50  "Professor revisa menos, ensina mais."
```

Detalhes técnicos e visão completa: `PRD.md`.
