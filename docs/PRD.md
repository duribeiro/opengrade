# PRD: OpenGrade (ProvaLivre)

Sistema de correção de provas com IA para professores. Código aberto. O professor fotografa a prova respondida e a IA corrige, devolvendo para revisão só o que ficou em dúvida.

Este documento tem duas partes:
1. **Visão completa**: o produto que queremos alcançar. É o que vai na apresentação.
2. **Roteiro por versão**: o caminho até lá. Cada versão vira uma tag no repositório (`v0.1.0`, `v0.2.0`...) e uma entrada no `CHANGELOG.md`.

---

# Parte 1. Visão completa

## Problema
Professores corrigem provas à mão, uma por uma, fora do horário de aula. Prova discursiva é a mais lenta, porque exige ler letra de aluno e julgar a resposta.

## Tese de mercado
- **A demanda existe.** Há várias soluções pagas no Brasil (ProvaCorrigida, Grades.ia, Educa AI, Prognose). Concorrência prova que o mercado paga por isso.
- **A solução não chegou aqui.** Na UNASP e entre os professores consultados, todo mundo ainda corrige manualmente.
- **Ninguém é aberto.** Todos os concorrentes são serviços fechados com assinatura. O ProvaLivre é código aberto.

## Usuário
Professor de ensino fundamental, médio ou superior que aplica prova impressa e corrige à mão. Validação inicial com professora da rede.

## Diferenciais
1. **Código aberto com chave própria (BYOK, "traga sua própria chave").** Qualquer escola ou professor técnico hospeda o sistema e usa a própria chave de API. O dado dos alunos fica com a escola.
2. **Agente no WhatsApp.** O professor conversa com o sistema por um número oficial, sem instalar nada.
3. **Corrige sem cadastro prévio.** Abre, aponta a câmera e corrige. As perguntas são lidas da própria folha.
4. **Autoaprimoramento por aluno.** O sistema aprende a letra de cada aluno a partir das correções do professor, sem treinar modelo.

## Funcionalidades da visão completa

### Correção (carro-chefe)
- **Escaneamento estilo scanner** pela câmera do navegador: detecção automática de bordas, correção de perspectiva, filtro "xerox". Bibliotecas: OpenCV.js ou jscanify.
- **Corrigir sem cadastro:** na primeira folha a IA extrai as questões e sugere as respostas. O professor confere em uma tela e segue. As próximas folhas são reconhecidas como a mesma prova.
- **Gabarito opcional:** o professor pode informar o gabarito. Sem gabarito, a IA avalia pela própria base de conhecimento.
- **Múltipla escolha e discursiva**, impressa ou manuscrita.
- **Modo pilha:** captura automática quando a folha estabiliza, vibração, próxima folha. Sem apertar botão.
- **Identificação do aluno:** leitura do nome no cabeçalho, ou QR code por página quando a prova foi criada no sistema (resolve prova de várias páginas).
- **Processamento em segundo plano** enquanto o professor continua escaneando.
- **Fila de revisão por questão:** só aparece o que tem baixa confiança. O professor vê o recorte da resposta, a nota proposta e o motivo, e aprova com um toque ou ajusta.

### Pipeline de IA em duas camadas
```
Foto da prova
   ↓
Modelo de visão (Claude, Gemini)
   lê a imagem, transcreve a resposta, marca "ilegível"
   ↓ (transcrição em texto)
Jev (modelo de decisão tipada)
   compara com a resposta esperada, decide a nota com probabilidade
   ↓ (probabilidade abaixo do limite, ou ilegível)
Fila de revisão do professor
```
- A confiança na **leitura da letra** vem da camada de visão.
- A confiança na **nota** vem do Jev.
- Jev está em acesso antecipado. Plano B: biblioteca adaptadora que simula o schema tipado sobre outros modelos.

### Autoaprimoramento por aluno
1. Quando o professor corrige uma transcrição, o sistema salva o recorte da letra e o texto correto.
2. Na próxima prova daquele aluno, esses recortes vão no prompt como exemplos.
3. O erro de leitura cai com o tempo, sem fine-tuning.

Recurso opcional, ligado por escola, com exclusão fácil (dado de menor de idade, LGPD).

### Turmas e diagnóstico
- Cadastro de turmas e alunos, histórico de notas.
- Diagnóstico da turma: questões com mais erro, conteúdos a revisar. (Os concorrentes já têm. Aqui é paridade, não diferencial.)

### Criação de prova
- Gerar prova por tema, série e habilidade da BNCC (Base Nacional Comum Curricular).
- **Prova adaptada para alunos autistas**: criação e correção. Possível diferencial forte.

### Planejamento
- Planejamento de aula, semanal e anual alinhado à BNCC.

### Agente no WhatsApp
- **Número oficial do produto** pela WhatsApp Cloud API da Meta. Todos os professores falam com o mesmo número. O sistema identifica o professor pelo telefone vinculado à conta.
- O professor conversa, pede pesquisa, discute ideias de prova e manda o agente executar ("cria uma prova de frações para o 6º ano").
- O agente (Hermes, OpenClaw ou similar) chama o sistema pela API pública ou por MCP (protocolo padrão para agentes de IA usarem ferramentas).
- Quem hospeda sozinho traz o próprio número e credenciais da Meta.

### Arquitetura orientada a API
O sistema web, o agente do WhatsApp e qualquer outro cliente usam o mesmo backend.
```
Backend (API de correção, turmas, provas, planejamento)
   ├── Aplicação web (PWA, abre a câmera pelo navegador)
   ├── Agente WhatsApp (via API ou MCP)
   └── Servidor MCP (outros agentes de IA)
```

## Modelo de negócio
- **Gratuito e aberto:** quem é técnico hospeda e usa a própria chave.
- **Assinatura mensal:** o professor comum usa a versão hospedada, sem configurar nada. Mesmo modelo de WordPress, Supabase e n8n.
- O custo de API por correção define o preço mínimo da assinatura.

## Riscos e respostas
| Risco | Resposta |
|---|---|
| IA erra a nota | O professor sempre revisa. A IA marca o que não entendeu. |
| Letra de criança | Fila de revisão + memória de letra por aluno. |
| LGPD, dado de menor | Memória de letra opcional. No modo aberto, o dado fica com a escola. |
| Custo de API | Imagem comprimida, modelo barato na decisão (Jev). Custo entra no preço. |
| WhatsApp | API oficial da Meta. Bibliotecas não oficiais (Evolution, Baileys) só para demo, risco de bloqueio. |
| Jev em acesso antecipado | Adaptador sobre outros modelos. |
| Foto ruim | Scanner com correção de perspectiva + selo Revisar. |

---

# Parte 2. Roteiro por versão

| Versão | Entrega | Status |
|---|---|---|
| **v0.1.0** | Protótipo: foto → correção → revisão (escopo abaixo) | Semana Tecnológica |
| v0.2.0 | Scanner com detecção de bordas, modo pilha, várias provas por sessão | |
| v0.3.0 | Contas, turmas, alunos, banco de dados, histórico | |
| v0.4.0 | Fila de revisão por questão com recorte da resposta, corrigir sem cadastro com reconhecimento de prova | |
| v0.5.0 | Pipeline em duas camadas com Jev, memória de letra por aluno | |
| v0.6.0 | Diagnóstico da turma | |
| v0.7.0 | Criação de prova BNCC e prova adaptada para autistas | |
| v0.8.0 | Planejamento de aula, semanal e anual | |
| v0.9.0 | API pública documentada e servidor MCP | |
| **v1.0.0** | Agente no WhatsApp e assinatura paga | |

Regra: cada versão termina com tag no git, entrada no `CHANGELOG.md` e status atualizado nesta tabela.

---

## v0.1.0: escopo do protótipo (2 horas)

### Objetivo
O professor fotografa uma prova respondida pelo celular e recebe cada questão transcrita, corrigida e marcada quando a IA não tem certeza.

### Escopo (só isto)
1. Tela inicial: campo de gabarito (opcional, texto livre) e botão "Fotografar prova". No celular abre a câmera, no computador abre seletor de imagem.
2. Envio de 1 a 3 imagens por prova. O navegador reduz cada imagem para no máximo 1600 px de lado antes de enviar.
3. O servidor chama o modelo de visão e devolve JSON.
4. Tela de resultado, uma linha por questão: enunciado lido, resposta do aluno transcrita, nota sugerida (0 a 1), justificativa em uma frase, selo "Revisar" quando ilegível ou incerto.
5. O professor edita a nota de qualquer questão e a nota total atualiza na hora.
6. Sem gabarito: a justificativa diz "sem gabarito, nota sugerida".

### Fora de escopo
Login, banco de dados, WhatsApp, BNCC, prova adaptada, memória de letra, scanner com bordas, Jev, pagamento, pilha de provas.

### Stack
Next.js (App Router, TypeScript), Tailwind, rota `/api/corrigir`, SDK da Anthropic com `claude-sonnet-5-5`, validação com zod. Deploy na Vercel. Chave na variável de ambiente `ANTHROPIC_API_KEY`.

### Contrato da API
Entrada: imagens (multipart) e gabarito (texto, opcional).
Saída: JSON com `questoes` e `notaTotal`. Cada questão: `numero`, `enunciado`, `respostaAluno`, `ilegivel` (booleano), `notaSugerida` (0 a 1), `justificativa`, `revisar` (booleano).
Regra do prompt: texto ilegível gera `ilegivel = true` e `respostaAluno` vazia. Nunca inventar texto. `revisar = true` quando ilegível ou quando o modelo declara incerteza.

### Critérios de aceite
1. Foto de prova real com 3 a 5 questões gera resultado em menos de 30 segundos.
2. Questão ilegível aparece com o selo Revisar.
3. Editar nota atualiza o total.
4. Funciona no celular (Chrome Android ou Safari iPhone) pela URL pública.
5. README: como rodar e como colocar a própria chave.

### Marcos
- M1 (15 min): projeto no ar com a tela de envio.
- M2 (30 min): API corrigindo, JSON validado.
- M3 (20 min): tela de resultado e edição de nota.
- M4 (10 min): deploy e teste com 2 fotos reais.

---

## Apresentação (14 de outubro de 2026, Arlete Afonso)

### Inscrição
- Prazo: hoje. Vídeo obrigatório, até 100 MB.
- Estágio: "protótipo inicial" se a v0.1.0 estiver no ar no vídeo. Senão, "Ideia".
- Curso: Análise e Desenvolvimento de Sistemas.

### Pitch (5 minutos)
```
0:00  A dor: professor corrige prova à mão (na UNASP todos fazem assim)
1:00  A solução: fotografa, a IA corrige, o professor revisa só o duvidoso
2:00  Demo ao vivo: uma prova real corrigida
4:00  Diferencial e visão: código aberto, roteiro até o agente no WhatsApp
```

### Perguntas prováveis (4 minutos)
- **Já existe ProvaCorrigida, por que o seu?** Código aberto, e ninguém aqui usa nada hoje.
- **E se a IA errar?** O professor sempre revisa, a IA marca o que não entendeu.
- **Letra de criança?** Memória por aluno, sem treinar modelo.
- **Dados dos alunos?** Opcional, e quem hospeda fica com o dado.
- **Como ganha dinheiro?** Assinatura para quem não quer configurar.
