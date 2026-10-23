# Plano de Implementação — Sistema de Gestão do Ministério da Igreja

## 1. Objetivo do projeto

Desenvolver uma aplicação web simples, clara e responsiva para organizar as atividades do ministério da igreja, incluindo escalas, agenda, repertório musical, equipe, área técnica, comunicação e crescimento espiritual.

A primeira versão deve priorizar as funções essenciais para organizar cultos, ensaios e participantes. As funcionalidades complementares serão adicionadas em etapas, conforme a equipe começar a utilizar o sistema.

## 2. Princípios do projeto

- **Simplicidade:** telas objetivas, textos claros e poucas ações por página.
- **Responsividade:** boa experiência em celulares, tablets e computadores.
- **Facilidade de uso:** ícones acompanhados de rótulos e navegação consistente.
- **Permissões:** cada usuário acessa somente as funções permitidas para seu perfil.
- **Evolução gradual:** entregar uma versão funcional antes de ampliar o escopo.
- **Privacidade:** proteger dados pessoais, contatos, pedidos de oração e informações internas.
- **Manutenção:** manter o código organizado e documentar as principais decisões.

## 3. Perfis de usuário

### Administrador do sistema
- Gerenciar configurações gerais.
- Criar, editar, desativar e administrar usuários.
- Definir permissões e áreas de acesso.
- Consultar registros gerais do sistema.

### Liderança ministerial
- Cadastrar cultos, ensaios e eventos.
- Montar escalas e atribuir funções.
- Publicar comunicados e repertórios.
- Acompanhar confirmações e substituições.
- Consultar informações da equipe.

### Integrante
- Consultar sua agenda e suas escalas.
- Confirmar ou recusar participação.
- Solicitar substituição.
- Consultar repertório e materiais liberados.
- Ler comunicados e acessar conteúdos devocionais.

### Equipe técnica
- Consultar roteiros técnicos.
- Acessar mapas de canais, palco e checklists.
- Registrar problemas e observações técnicas.
- Consultar informações de som, mídia e transmissão.

> Um usuário pode acumular mais de uma função, conforme as permissões definidas pela liderança.

## 4. Estrutura de navegação

### Menu principal
1. **Início**
2. **Agenda**
3. **Músicas**
4. **Devocional**
5. **Mais**

### Opções dentro de “Mais”
- Equipe
- Área técnica
- Comunicação
- Escola de adoração
- Avaliação pós-culto
- Configurações, conforme as permissões do usuário

## 5. Etapas de implementação

## Fase 1 — Planejamento e definição do MVP

**Objetivo:** definir o que será desenvolvido na primeira versão.

### Atividades
- [ ] Confirmar os perfis de usuário e suas permissões.
- [ ] Definir os tipos de culto, ensaio e evento.
- [ ] Definir os campos obrigatórios de cada cadastro.
- [ ] Desenhar o fluxo de navegação.
- [ ] Definir identidade visual, cores, tipografia e ícones.
- [ ] Escolher a tecnologia e o ambiente de hospedagem.
- [ ] Definir regras de privacidade e acesso aos dados.

### Entregáveis
- Documento de requisitos.
- Mapa de navegação.
- Protótipos das telas principais.
- Escopo aprovado para a primeira versão.

## Fase 2 — Design das telas

**Objetivo:** criar uma interface consistente antes de implementar as funcionalidades.

### Telas
- [ ] Login.
- [ ] Painel inicial.
- [ ] Agenda mensal e lista de compromissos.
- [ ] Detalhes do culto ou ensaio.
- [ ] Escala e confirmação de presença.
- [ ] Repertório e detalhes da música.
- [ ] Lista de integrantes.
- [ ] Perfil do usuário.

### Diretrizes visuais
- Fundo branco ou cinza muito claro.
- Uma cor principal discreta, como azul ou verde.
- Cards simples com bordas suaves.
- Botões com nomes claros e ações previsíveis.
- Ícones acompanhados de texto.
- Menu inferior no celular e menu lateral no computador.
- Estados visuais para carregamento, ausência de dados, sucesso e erro.

### Critério de conclusão
As telas devem ser compreensíveis em celular e computador antes de iniciar a implementação completa.

## Fase 3 — Base técnica e autenticação

**Objetivo:** preparar a estrutura segura da aplicação.

### Atividades
- [ ] Criar o repositório e a estrutura do projeto.
- [ ] Configurar os ambientes de desenvolvimento e produção.
- [ ] Configurar banco de dados e migrações.
- [ ] Implementar login, logout e recuperação de acesso.
- [ ] Implementar perfis e permissões.
- [ ] Criar componentes visuais reutilizáveis.
- [ ] Configurar validação de formulários.
- [ ] Preparar logs e tratamento de erros.
- [ ] Configurar cópias de segurança do banco.

### Critério de conclusão
O usuário consegue entrar no sistema e visualizar somente as áreas autorizadas para seu perfil.

## Fase 4 — Painel inicial

**Objetivo:** apresentar as informações mais importantes logo após o login.

### Funcionalidades
- [ ] Exibir o próximo culto ou ensaio.
- [ ] Exibir a próxima escala do usuário.
- [ ] Mostrar pendências de confirmação.
- [ ] Exibir comunicados recentes.
- [ ] Mostrar atalhos para agenda, músicas e devocional.
- [ ] Exibir uma mensagem útil quando ainda não houver compromissos cadastrados.

### Critério de conclusão
O painel mostra informações relevantes para cada perfil, sem sobrecarregar a tela.

## Fase 5 — Agenda e escalas

**Objetivo:** organizar compromissos e distribuir responsabilidades.

### Agenda
- [ ] Criar, editar e cancelar cultos, ensaios e eventos.
- [ ] Informar título, tipo, data, horário, endereço e observações.
- [ ] Exibir calendário mensal e lista dos próximos eventos.
- [ ] Abrir uma página com os detalhes de cada compromisso.

### Escalas
- [ ] Cadastrar funções ministeriais.
- [ ] Atribuir integrantes a cada função.
- [ ] Criar escalas de vocal, instrumentistas, sonoplastia e mídia.
- [ ] Permitir confirmação ou recusa de participação.
- [ ] Permitir solicitação de substituição.
- [ ] Permitir que a liderança acompanhe as respostas.
- [ ] Destacar funções ainda sem responsável.

### Notificações
- [ ] Exibir alertas dentro do sistema.
- [ ] Preparar lembretes para compromissos próximos.
- [ ] Notificar mudanças de horário ou escala.

### Critério de conclusão
A liderança consegue montar uma escala completa, e os integrantes conseguem consultar e responder à convocação.

## Fase 6 — Repertório musical

**Objetivo:** centralizar as informações das músicas e dos repertórios de cada evento.

### Funcionalidades
- [ ] Cadastrar título, artista, tonalidade e BPM.
- [ ] Registrar tom original e tom escolhido para cada culto.
- [ ] Adicionar links de vídeos e guias vocais.
- [ ] Anexar cifras, partituras e arquivos autorizados.
- [ ] Registrar introdução, ordem das partes e finalização.
- [ ] Montar repertórios por culto ou evento.
- [ ] Consultar o histórico de músicas ministradas.
- [ ] Permitir busca por título, artista ou tonalidade.

### Critério de conclusão
A equipe consegue montar um repertório e consultar as referências das músicas em um só lugar.

## Fase 7 — Cadastro da equipe

**Objetivo:** manter os dados ministeriais organizados.

### Funcionalidades
- [ ] Cadastrar integrantes.
- [ ] Registrar função principal e funções secundárias.
- [ ] Registrar instrumentos e habilidades.
- [ ] Informar contatos e disponibilidade.
- [ ] Associar integrantes às escalas.
- [ ] Permitir atualização controlada do perfil.
- [ ] Restringir o acesso a informações pessoais.

### Critério de conclusão
A liderança consegue consultar a equipe e localizar pessoas aptas para cada função.

## Fase 8 — Área técnica de som e mídia

**Objetivo:** padronizar a preparação técnica dos cultos.

### Funcionalidades
- [ ] Criar roteiro técnico por evento.
- [ ] Registrar mapa de canais e configuração de palco.
- [ ] Listar microfones, instrumentos e equipamentos.
- [ ] Registrar referências e arquivos da mesa de som.
- [ ] Criar roteiro de transmissão, câmeras, letras e slides.
- [ ] Criar checklist de passagem de som.
- [ ] Registrar problemas técnicos e observações pós-culto.

### Critério de conclusão
A equipe técnica consegue consultar o roteiro e registrar verificações antes e depois do evento.

## Fase 9 — Comunicação e devocional

**Objetivo:** apoiar a comunicação da equipe e o crescimento espiritual.

### Comunicação
- [ ] Publicar avisos da liderança.
- [ ] Exibir alterações de última hora.
- [ ] Permitir comentários relacionados a uma escala, quando necessário.
- [ ] Disponibilizar pedidos de oração com acesso controlado.

### Devocional
- [ ] Publicar devocionais diários ou semanais.
- [ ] Disponibilizar planos de leitura bíblica.
- [ ] Publicar reflexões e estudos ministeriais.
- [ ] Permitir anotações pessoais privadas.
- [ ] Manter histórico de conteúdos publicados.

### Critério de conclusão
Os integrantes conseguem consultar conteúdos e comunicados, com privacidade adequada para anotações e pedidos pessoais.

## Fase 10 — Escola de adoração e avaliação pós-culto

**Objetivo:** adicionar recursos de formação e melhoria contínua.

### Escola de adoração
- [ ] Cadastrar cursos e trilhas de formação.
- [ ] Disponibilizar aulas gravadas e materiais.
- [ ] Organizar treinamentos vocais e instrumentais.
- [ ] Acompanhar conteúdos concluídos, se necessário.

### Avaliação pós-culto
- [ ] Registrar o que funcionou bem.
- [ ] Registrar pontos de melhoria.
- [ ] Anotar necessidades técnicas.
- [ ] Registrar aprendizados e ações para o próximo evento.
- [ ] Manter o foco no aprendizado coletivo, sem rankings de desempenho individual.

### Critério de conclusão
A liderança consegue registrar aprendizados e disponibilizar materiais de formação para a equipe.

## Fase 11 — Testes, segurança e publicação

**Objetivo:** validar o sistema antes de disponibilizá-lo para toda a igreja.

### Testes funcionais
- [ ] Login, logout e recuperação de acesso.
- [ ] Criação e edição de eventos.
- [ ] Montagem de escalas e confirmação de presença.
- [ ] Solicitação de substituição.
- [ ] Cadastro e pesquisa de músicas.
- [ ] Acesso conforme cada perfil.
- [ ] Funcionamento em celular, tablet e computador.
- [ ] Tratamento de erros e formulários incompletos.

### Segurança e confiabilidade
- [ ] Verificar permissões no servidor e no banco de dados.
- [ ] Impedir acesso indevido a dados de outros usuários.
- [ ] Validar arquivos enviados e limitar tipos e tamanhos.
- [ ] Proteger informações pessoais e pedidos de oração.
- [ ] Testar restauração de backup.
- [ ] Configurar HTTPS e variáveis de ambiente.
- [ ] Preparar procedimento para correções e incidentes.

### Publicação
- [ ] Criar ambiente de produção.
- [ ] Cadastrar os primeiros usuários.
- [ ] Orientar a liderança e os integrantes.
- [ ] Coletar feedback após os primeiros eventos.
- [ ] Corrigir os problemas prioritários.

## 6. Modelo inicial de dados

As tabelas abaixo são uma referência inicial. Os nomes podem ser ajustados durante a implementação.

- **usuarios:** nome, e-mail, perfil, status e dados de autenticação associados ao provedor.
- **integrantes:** usuário relacionado, contatos, habilidades e disponibilidade.
- **funcoes:** nome da função e área ministerial.
- **eventos:** título, tipo, data, horário, local e observações.
- **escalas:** evento, função, integrante, status da confirmação e observações.
- **substituicoes:** escala relacionada, solicitante, motivo, status e responsável pela aprovação.
- **musicas:** título, artista, tom original, BPM e referências.
- **repertorios:** evento, música, tonalidade escolhida e ordem de execução.
- **arquivos_musicais:** música relacionada, tipo de arquivo, localização e permissões.
- **roteiros_tecnicos:** evento, mapa de canais, palco, transmissão e checklist.
- **comunicados:** autor, título, conteúdo, data de publicação e público-alvo.
- **devocionais:** título, conteúdo, referência bíblica, autor e data de publicação.
- **anotacoes_privadas:** usuário, conteúdo e data, com acesso restrito ao autor.
- **avaliacoes_evento:** evento, observações, pontos de melhoria e ações futuras.
- **cursos:** título, descrição, materiais e trilha de formação.

### Regras de modelagem
- Usar identificadores únicos e relacionamentos consistentes.
- Registrar datas de criação e atualização.
- Separar autenticação dos dados complementares do integrante.
- Não armazenar senhas em texto puro.
- Aplicar permissões no servidor e no banco, não apenas ocultar botões.
- Guardar arquivos em armazenamento apropriado, com acesso controlado.
- Definir política de retenção e exclusão dos dados.

## 7. Cronograma sugerido

Estimativa para uma pessoa desenvolvendo em ritmo parcial. O prazo real depende da tecnologia, da experiência e do nível de acabamento.

| Etapa | Estimativa |
|---|---:|
| Planejamento e requisitos | 1 semana |
| Design das telas | 1 semana |
| Base técnica e autenticação | 1–2 semanas |
| Painel inicial | 1 semana |
| Agenda e escalas | 2 semanas |
| Repertório | 1–2 semanas |
| Cadastro da equipe | 1 semana |
| Área técnica | 1–2 semanas |
| Comunicação e devocional | 1–2 semanas |
| Escola de adoração e avaliação | 1–2 semanas |
| Testes, ajustes e publicação | 1–2 semanas |

As etapas podem se sobrepor. Uma primeira versão com login, painel, agenda, escalas e repertório pode ser publicada antes de concluir todos os módulos.

## 8. Critérios para considerar o MVP pronto

A primeira versão será considerada utilizável quando:

- [ ] A liderança conseguir cadastrar eventos.
- [ ] A liderança conseguir montar e publicar escalas.
- [ ] Os integrantes conseguirem consultar suas escalas.
- [ ] Os integrantes conseguirem confirmar ou recusar presença.
- [ ] A equipe conseguir consultar o repertório do evento.
- [ ] O sistema funcionar em celular e computador.
- [ ] As permissões impedirem acesso indevido.
- [ ] Existir backup e um procedimento testado de restauração.
- [ ] Um grupo piloto conseguir usar o sistema em um culto real e enviar feedback.

## 9. Itens que podem ficar para depois

Para não atrasar a primeira entrega, deixar para versões futuras:

- Integração com calendários externos.
- Envio de notificações por WhatsApp ou SMS.
- Aplicativo nativo para Android e iOS.
- Relatórios avançados.
- Trilhas de formação com acompanhamento detalhado.
- Automações complexas de escalas.
- Sincronização avançada de arquivos com mesas de som e sistemas de transmissão.

## 10. Próxima ação recomendada

1. Validar o escopo do MVP com a liderança.
2. Desenhar as telas de Login, Início, Agenda e Escalas.
3. Escolher a tecnologia e criar a estrutura do projeto.
4. Implementar autenticação e permissões.
5. Desenvolver Agenda e Escalas antes dos módulos complementares.
6. Testar com um grupo pequeno durante alguns cultos.
7. Ajustar com base no uso real e continuar a implementação por fases.
