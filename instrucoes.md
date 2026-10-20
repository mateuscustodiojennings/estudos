# PROJETO: SISTEMA WEB DE ACOMPANHAMENTO DE ESTUDOS

## 1. OBJETIVO PRINCIPAL

Desenvolva uma aplicação web completa, responsiva, leve e funcional para gerenciamento e acompanhamento dos meus estudos.

O sistema deverá utilizar como fonte de dados o PDF existente na pasta do projeto em que você está sendo executado.

Esse PDF contém as matérias, os módulos e os conteúdos que deverão ser utilizados para construir a estrutura do sistema.

Quero acompanhar minha evolução nos estudos de maneira organizada, visual e objetiva, podendo marcar matérias, módulos e conteúdos como concluídos, consultar meu progresso e identificar o que ainda preciso estudar.

O projeto deverá ser preparado para hospedagem na web, preferencialmente utilizando o Render para hospedar a aplicação e o MongoDB Atlas para armazenar os dados.

ATENÇÃO: NÃO comece a programar antes de analisar os arquivos existentes e identificar o conteúdo real do PDF.

Não invente informações em nenhuma etapa do desenvolvimento.

---

## 2. REGRA FUNDAMENTAL: NÃO INVENTAR INFORMAÇÕES

Esta é a regra mais importante de todo o projeto.

Antes de implementar a aplicação:

1. Examine os arquivos presentes na pasta do projeto.
2. Localize o PDF que contém a estrutura dos estudos.
3. Identifique o nome, a organização e o conteúdo do documento.
4. Extraia as informações relevantes do PDF.
5. Identifique todas as matérias, os módulos, os capítulos, os tópicos e as subdivisões que estiverem efetivamente presentes no documento.
6. Preserve a hierarquia e a ordem original das informações.
7. Utilize exclusivamente as informações que puder confirmar no documento para preencher a estrutura de estudos.

Não invente:
- Matérias.
- Módulos.
- Capítulos.
- Tópicos.
- Quantidades de aulas.
- Quantidades de exercícios.
- Cargas horárias.
- Prazos.
- Metas de estudo.
- Percentuais de conclusão previamente existentes.
- Descrições de conteúdos que não estejam presentes na fonte.
- Qualquer outra informação apresentada como se tivesse sido extraída do PDF.

Não presuma que uma matéria possui determinados módulos apenas porque isso é comum em cursos da mesma área.

Não complete lacunas do documento utilizando conhecimento próprio.

Se alguma informação estiver ilegível, ausente, ambígua ou impossível de extrair, não tente adivinhar.

Nesse caso:
- Registre o problema.
- Informe qual parte do documento não pôde ser interpretada.
- Preserve as informações que puderem ser confirmadas.
- Não apresente dados incertos como fatos.

Se o PDF não puder ser localizado, interrompa a etapa de importação e solicite minha intervenção. Não substitua o documento por uma estrutura genérica de estudos.

Caso existam vários PDFs, identifique-os e determine qual contém a estrutura de matérias e módulos. Se não for possível determinar isso com segurança, pergunte antes de prosseguir.

Crie um relatório de extração com as informações identificadas, para que a estrutura importada possa ser conferida posteriormente.

A implementação deve ser baseada nos dados efetivamente encontrados.

---

## 3. ANÁLISE INICIAL DO PROJETO

Antes de escrever ou modificar qualquer código:

1. Inspecione a estrutura atual da pasta.
2. Identifique os arquivos, dependências e configurações existentes.
3. Localize e analise o PDF.
4. Verifique se já existe algum código que possa ser aproveitado.
5. Defina uma arquitetura simples e adequada à hospedagem no Render.
6. Apresente um plano breve de implementação.

Não apague arquivos existentes sem necessidade.

Não substitua configurações funcionais sem compreender suas finalidades.

Evite instalar dependências desnecessárias.

Depois da análise, prossiga com a implementação, desde que as informações essenciais estejam disponíveis e não exista nenhuma ambiguidade que exija minha decisão.

---

## 4. TECNOLOGIAS

Utilize preferencialmente as seguintes tecnologias:

### Frontend
- Next.js.
- React.
- TypeScript.
- Bootstrap para estilização e componentes responsivos.
- CSS personalizado somente quando necessário.

### Backend
- Node.js.
- API implementada no próprio projeto Next.js, utilizando Route Handlers ou uma estrutura equivalente e organizada.
- Validação de dados nas operações recebidas pela API.
- Tratamento adequado de erros.

### Banco de dados
- MongoDB Atlas.
- Biblioteca oficial mongodb ou outra solução que demonstre uma vantagem concreta para este projeto.
- Persistência real dos dados no banco.

### Hospedagem
- Render para hospedar a aplicação.
- MongoDB Atlas para o banco de dados.

A prioridade é manter o projeto simples, leve, econômico e fácil de manter.

Não crie um backend separado se isso não trouxer uma vantagem concreta.

Não utilize microsserviços.

Não introduza Redis, filas, sistemas de cache externos ou outras infraestruturas sem necessidade comprovada.

Não utilize dados fictícios em produção.

Caso identifique uma limitação técnica relevante nessa arquitetura, explique-a e proponha a alternativa mais simples.

---

## 5. IDENTIDADE VISUAL

Crie uma interface minimalista, moderna e funcional.

A aparência deve transmitir organização, concentração e facilidade de acompanhamento.

Utilize principalmente:
- Branco.
- Cinza-claro.
- Cinza-escuro.
- Preto.
- Azul-bebê em pequenos detalhes.

O azul-bebê pode ser utilizado para destacar botões principais, indicadores de progresso, elementos selecionados e informações relevantes.

Evite:
- Cores excessivamente saturadas.
- Gradientes exagerados.
- Animações desnecessárias.
- Sombras pesadas.
- Muitos elementos decorativos.
- Interfaces visualmente poluídas.
- Excesso de cartões.
- Ícones sem finalidade.

Utilize uma tipografia legível, espaçamentos consistentes e uma hierarquia visual clara.

A interface deve permitir identificar rapidamente:
- O que já foi concluído.
- O que ainda está pendente.
- Em qual matéria estou estudando.
- Quanto do conteúdo foi concluído.
- Quais matérias precisam de mais atenção.

Priorize uma interface funcional em vez de uma interface cheia de efeitos visuais.

---

## 6. RESPONSIVIDADE E USABILIDADE

O site deverá funcionar adequadamente em:
- Computadores.
- Notebooks.
- Tablets.
- Smartphones.

No computador, aproveite o espaço disponível para apresentar as matérias e os indicadores de progresso.

No celular, reorganize os elementos verticalmente, evitando tabelas que exijam rolagem horizontal desnecessária.

Os botões e checkboxes devem ser fáceis de utilizar em telas sensíveis ao toque.

A navegação deverá ser intuitiva.

Não exija que o usuário abra várias páginas apenas para marcar um conteúdo como concluído.

Sempre que possível, permita realizar as ações principais diretamente na tela de acompanhamento.

Utilize componentes acessíveis, com rótulos apropriados, foco visível e contraste suficiente.

---

## 7. FUNCIONALIDADES PRINCIPAIS

### 7.1. Dashboard inicial

Crie uma página inicial com um resumo da evolução dos estudos.

Apresente informações como:

- Quantidade de matérias identificadas no PDF.
- Quantidade total de módulos identificados.
- Quantidade de módulos concluídos.
- Quantidade de módulos pendentes.
- Percentual geral de conclusão.
- Progresso individual de cada matéria.

Todos os indicadores devem ser calculados com base nos dados reais importados e no estado de conclusão armazenado no banco de dados.

Não utilize números estáticos ou percentuais inventados.

Se não houver dados importados, apresente um estado vazio explicando que a estrutura de estudos ainda precisa ser carregada.

### 7.2. Lista de matérias

Exiba todas as matérias identificadas no PDF.

Para cada matéria, mostre:
- Nome original.
- Quantidade de módulos identificados, quando essa informação puder ser calculada.
- Quantidade de módulos concluídos.
- Quantidade de módulos pendentes.
- Barra de progresso.
- Percentual de conclusão calculado automaticamente.

A ordem das matérias deve respeitar a organização do documento original.

Cada matéria deverá permitir expandir ou recolher seus módulos.

O usuário deverá conseguir visualizar sua evolução sem precisar abrir uma página separada para cada matéria.

### 7.3. Módulos e conteúdos

Cada matéria deverá conter os módulos identificados no PDF.

Preserve a hierarquia do documento.

Se o PDF apresentar a seguinte estrutura:

Matéria
  └── Módulo
       └── Capítulo
            └── Tópico

O sistema deverá preservar essa organização, desde que ela realmente exista no documento.

Não crie níveis hierárquicos artificiais.

Cada módulo deverá possuir um checkbox para indicar se foi concluído.

Quando um módulo possuir subdivisões identificadas no PDF, apresente-as de forma organizada e permita acompanhar sua conclusão individualmente, caso isso seja compatível com a estrutura real do documento.

Não transforme automaticamente todos os parágrafos do PDF em tarefas.

Identifique as unidades de estudo a partir dos títulos, seções, listas e demais elementos estruturais do documento.

### 7.4. Checkboxes de conclusão

Implemente checkboxes funcionais para marcar módulos e, quando aplicável, conteúdos subordinados como concluídos.

Ao marcar um módulo como concluído:
- Atualize imediatamente a interface.
- Persista a alteração no MongoDB.
- Atualize os indicadores de progresso.
- Atualize o percentual da matéria correspondente.
- Atualize o percentual geral.

Ao desmarcar um módulo:
- Recalcule os indicadores.
- Atualize o banco de dados.
- Reflita a alteração na interface.

O estado de conclusão deve continuar salvo após:
- Atualizar a página.
- Fechar o navegador.
- Acessar o site novamente.
- Utilizar outro dispositivo com acesso à mesma conta, quando houver autenticação.

Não utilize apenas localStorage como mecanismo principal de persistência.

O MongoDB deverá ser a fonte de verdade do estado de conclusão.

Implemente tratamento para falhas de comunicação com o backend, evitando apresentar como salva uma alteração que não foi persistida.

Caso uma operação falhe, informe o usuário e permita tentar novamente.

Evite que múltiplas atualizações simultâneas provoquem inconsistências nos indicadores.

### 7.5. Indicadores de progresso

Implemente o cálculo automático dos percentuais.

Para uma matéria com módulos identificados:

Percentual da matéria =
(módulos concluídos / total de módulos) × 100.

Para o progresso geral:

Percentual geral =
(total de módulos concluídos / total de módulos identificados) × 100.

Essas fórmulas devem ser aplicadas quando cada módulo possuir o mesmo peso.

Não atribua pesos diferentes aos módulos sem uma fonte que justifique essa decisão.

Se o PDF contiver hierarquias com diferentes níveis de subdivisão, escolha uma regra consistente para evitar contar o mesmo conteúdo mais de uma vez.

Explique essa regra na documentação.

Não considere módulos inexistentes, não identificados ou não importados como concluídos.

Se não houver módulos válidos, não divida por zero nem apresente um percentual enganoso.

### 7.6. Filtros e navegação

Implemente, se compatível com a estrutura do projeto:

- Visualização de todas as matérias.
- Visualização apenas das matérias com pendências.
- Visualização de módulos concluídos.
- Visualização de módulos pendentes.
- Campo de busca para localizar matérias e módulos.
- Opção de expandir ou recolher os módulos de uma matéria.

Os filtros devem funcionar sobre os dados reais.

Evite adicionar funcionalidades complexas que não contribuam diretamente para o acompanhamento dos estudos.

### 7.7. Organização da interface

A interface principal deverá possuir:

1. Cabeçalho com o nome do sistema.
2. Resumo geral do progresso.
3. Campo de busca.
4. Filtros de visualização.
5. Lista de matérias.
6. Módulos organizados hierarquicamente.
7. Checkboxes de conclusão.
8. Indicadores de progresso.

A navegação deverá permanecer simples.

O usuário deverá conseguir compreender o estado dos estudos em poucos segundos.

---

## 8. ESTRUTURA DOS DADOS

Planeje um modelo de dados adequado ao MongoDB.

Uma possibilidade é separar a estrutura curricular dos registros de progresso.

### Estrutura de estudos

Deverá armazenar:
- Identificador.
- Nome da matéria.
- Ordem original.
- Módulos.
- Identificadores dos módulos.
- Títulos originais.
- Hierarquia dos conteúdos, quando aplicável.
- Ordem dos elementos.
- Referência à origem dos dados.

### Estado de conclusão

Deverá armazenar:
- Identificador do módulo ou conteúdo.
- Estado de conclusão.
- Data da última alteração, se necessária.
- Identificador do usuário, caso exista autenticação.

A estrutura exata poderá ser ajustada conforme o PDF e as necessidades reais da aplicação.

Não duplique desnecessariamente grandes quantidades de informação.

Evite armazenar o conteúdo integral do PDF no banco se isso não for necessário.

O PDF deverá servir como fonte de importação e referência.

Os dados estruturados extraídos dele poderão ser armazenados de maneira eficiente no MongoDB.

Inclua identificadores estáveis para matérias, módulos e conteúdos.

Não utilize a posição do elemento em uma lista como seu único identificador.

---

## 9. IMPORTAÇÃO DO PDF

Crie um processo confiável para transformar o conteúdo do PDF em dados estruturados.

Esse processo poderá ser executado durante o desenvolvimento ou por um script de importação.

A importação deverá:

1. Ler o PDF existente.
2. Extrair os títulos e a hierarquia identificável.
3. Preservar a ordem original.
4. Gerar dados estruturados.
5. Permitir conferir os dados extraídos.
6. Registrar informações sobre a origem dos elementos.
7. Identificar possíveis problemas de extração.
8. Salvar os dados no MongoDB.

Não execute uma importação destrutiva automaticamente a cada inicialização do servidor.

A importação deverá ser controlada e idempotente quando apropriado.

Executar o processo novamente não poderá duplicar todas as matérias e os módulos.

Não apague o progresso existente durante uma atualização da estrutura de estudos, a menos que isso seja explicitamente necessário e autorizado.

Se o documento for alterado no futuro, disponibilize um procedimento seguro para atualizar a estrutura.

Não permita que uma nova importação sobrescreva silenciosamente os dados de conclusão.

Caso não seja possível extrair o PDF de maneira confiável, apresente o problema e solicite intervenção, em vez de preencher os dados por suposição.

---

## 10. BANCO DE DADOS E BACKEND

Implemente uma conexão segura com o MongoDB Atlas.

Utilize variáveis de ambiente para as configurações.

Nunca coloque credenciais diretamente no código.

Nunca envie credenciais ao frontend.

Crie uma camada de acesso ao banco de dados organizada e reutilizável.

Reutilize a conexão do MongoDB adequadamente, evitando criar conexões desnecessárias a cada requisição.

Implemente endpoints para as operações realmente necessárias, incluindo:

- Consultar a estrutura de matérias e módulos.
- Consultar o progresso.
- Marcar um módulo como concluído.
- Desmarcar um módulo.
- Consultar os indicadores gerais.

Se a arquitetura escolhida exigir outros endpoints, implemente-os somente quando necessários.

Valide os parâmetros recebidos pela API.

Trate erros de conexão, identificadores inválidos, recursos inexistentes e falhas de persistência.

Não exponha mensagens internas, credenciais ou detalhes sensíveis nos erros apresentados ao usuário.

Se houver autenticação, proteja as operações de acordo com o usuário autenticado.

Não permita que um usuário altere o progresso de outro.

---

## 11. AUTENTICAÇÃO E PRIVACIDADE

Avalie se a aplicação precisa de autenticação.

Como o sistema deverá preservar meu progresso e poderá ser acessado por diferentes dispositivos, recomendo implementar uma solução simples de autenticação se o escopo e o custo operacional permitirem.

Caso implemente autenticação:

- Utilize uma solução segura.
- Armazene senhas com hash adequado.
- Nunca armazene senhas em texto puro.
- Proteja as rotas privadas.
- Utilize cookies seguros quando apropriado.
- Implemente validação de sessão.
- Não exponha dados de outros usuários.
- Proteja os endpoints contra acessos não autorizados.

Não implemente um sistema de autenticação complexo sem necessidade.

Se decidir não implementar autenticação, explique claramente as consequências para a privacidade e para o acesso por múltiplos dispositivos.

Não apresente o sistema como privado ou seguro para múltiplos usuários se ele não possuir os controles necessários.

---

## 12. DESEMPENHO E ECONOMIA DE ARMAZENAMENTO

O sistema deverá ser leve.

Priorize:
- Dependências estritamente necessárias.
- Componentes reutilizáveis.
- Código organizado.
- Consultas eficientes ao MongoDB.
- Respostas de API enxutas.
- Ausência de bibliotecas pesadas sem justificativa.
- Ausência de arquivos duplicados.
- Ausência de imagens decorativas desnecessárias.
- Ausência de processamento do PDF em todas as requisições.
- Ausência de grandes arquivos estáticos que não sejam necessários.

Não armazene informações redundantes.

Não mantenha cópias desnecessárias do mesmo conteúdo.

Não adicione bibliotecas de gráficos pesadas se barras de progresso simples resolverem a necessidade.

Não implemente atualizações em tempo real se elas não forem necessárias.

O objetivo é obter um bom equilíbrio entre simplicidade, desempenho, manutenção e funcionalidade.

---

## 13. SEGURANÇA

Implemente medidas básicas de segurança:

- Variáveis de ambiente.
- Validação de entrada.
- Tratamento seguro de erros.
- Proteção de rotas privadas, caso existam.
- Controle de acesso ao banco de dados.
- Uso de HTTPS na hospedagem.
- Nenhuma credencial no repositório.
- Nenhuma credencial no frontend.
- Arquivo .gitignore adequado.
- Arquivo .env.example sem valores secretos.
- Verificação de dependências desnecessárias.

Não permita que o frontend determine arbitrariamente informações que deveriam ser validadas pelo backend.

O backend deverá validar as alterações de conclusão recebidas.

---

## 14. PREPARAÇÃO PARA O RENDER

Prepare o projeto para hospedagem no Render.

Inclua:
- Scripts corretos no package.json.
- Comando de build.
- Comando de inicialização.
- Configuração adequada para produção.
- Variáveis de ambiente documentadas.
- Instruções para conectar ao MongoDB Atlas.
- Instruções de deploy no Render.
- Configuração de saúde da aplicação, se apropriado.
- Orientações para verificar os logs em caso de falha.

A aplicação deverá utilizar a porta fornecida pelo ambiente de hospedagem quando necessário.

Não dependa de arquivos locais graváveis para persistir o progresso.

Não utilize SQLite ou arquivos JSON como banco principal de produção.

Não dependa de o PDF estar disponível em tempo de execução se ele só for necessário para a importação inicial.

Se o PDF precisar estar disponível durante o processo de build ou importação, documente essa exigência.

Considere as limitações do plano de hospedagem escolhido.

Não presuma que o serviço permanecerá sempre ativo ou que determinado recurso será gratuito.

A prioridade é manter a implantação simples, econômica e confiável.

---

## 15. EXPERIÊNCIA DE USO

Implemente estados visuais apropriados.

A aplicação deverá possuir:

- Indicador de carregamento.
- Mensagem quando não houver matérias importadas.
- Mensagem quando uma busca não encontrar resultados.
- Confirmação visual de alterações salvas.
- Mensagem de erro quando uma operação falhar.
- Feedback visual ao marcar um módulo.
- Barras de progresso atualizadas automaticamente.
- Navegação intuitiva entre matérias.
- Layout adaptado para dispositivos móveis.

Não utilize alertas intrusivos para todas as operações.

Prefira mensagens discretas e acessíveis.

Evite animações que prejudiquem a navegação.

---

## 16. TESTES E VALIDAÇÃO

Antes de considerar o projeto concluído, execute verificações reais.

Teste:

1. Inicialização da aplicação.
2. Build de produção.
3. Conexão com o MongoDB.
4. Carregamento das matérias.
5. Carregamento dos módulos.
6. Marcação de conclusão.
7. Remoção da conclusão.
8. Persistência após recarregar a página.
9. Cálculo do progresso individual.
10. Cálculo do progresso geral.
11. Filtros e busca.
12. Tratamento de erros.
13. Comportamento sem dados importados.
14. Layout em telas pequenas.
15. Ausência de credenciais expostas.

Verifique se os dados exibidos correspondem à estrutura extraída do PDF.

Não declare que um teste passou se ele não foi executado.

Não declare que a integração com o MongoDB funciona se não foi possível testá-la.

Se alguma etapa depender de credenciais ou configurações que eu ainda não forneci, deixe isso explícito e documente como concluir a configuração.

Corrija os problemas encontrados antes de finalizar.

---

## 17. ORGANIZAÇÃO DO CÓDIGO

Mantenha o código organizado, legível e fácil de modificar.

Separe responsabilidades entre:
- Componentes de interface.
- Páginas.
- Lógica de negócio.
- Acesso ao banco de dados.
- Endpoints da API.
- Validação de dados.
- Tipos e interfaces.
- Scripts de importação.
- Testes.

Evite criar arquivos excessivamente grandes.

Evite abstrações desnecessárias.

Não crie uma arquitetura complexa para um sistema pequeno.

Utilize nomes claros e consistentes.

Adicione comentários somente quando ajudarem a explicar decisões ou comportamentos não óbvios.

---

## 18. DOCUMENTAÇÃO

Crie um README.md completo em português.

O documento deverá explicar:

1. Objetivo do projeto.
2. Tecnologias utilizadas.
3. Estrutura das pastas.
4. Como instalar as dependências.
5. Como executar localmente.
6. Como configurar o MongoDB Atlas.
7. Quais variáveis de ambiente são necessárias.
8. Como importar os dados do PDF.
9. Como conferir a estrutura importada.
10. Como executar os testes.
11. Como gerar o build de produção.
12. Como publicar no Render.
13. Como verificar logs e diagnosticar erros.
14. Como atualizar os módulos no futuro sem perder o progresso.

Inclua um arquivo .env.example com os nomes das variáveis necessárias e valores demonstrativos que não sejam credenciais reais.

Não inclua senhas, tokens ou informações privadas na documentação.

---

## 19. CRITÉRIOS DE CONCLUSÃO

O projeto só deverá ser considerado concluído quando:

- O PDF tiver sido localizado e analisado.
- A estrutura de matérias e módulos tiver sido extraída sem invenções.
- Os dados importados puderem ser conferidos.
- A interface estiver funcional.
- Os checkboxes funcionarem corretamente.
- As alterações forem persistidas no MongoDB.
- Os indicadores forem calculados automaticamente.
- O site for responsivo.
- Os filtros e a busca funcionarem.
- O backend tratar os erros adequadamente.
- A aplicação estiver preparada para produção.
- A documentação estiver completa.
- Os testes executados tiverem seus resultados registrados.
- As limitações ou configurações pendentes estiverem claramente documentadas.

Não declare o projeto pronto apenas porque a página inicial está visualmente correta.

O funcionamento real é mais importante do que a aparência.

---

## 20. INSTRUÇÕES FINAIS DE EXECUÇÃO

Trabalhe de maneira autônoma, mas não invente requisitos nem informações.

Não se limite a apresentar exemplos de código: implemente o projeto nos arquivos da pasta atual.

Não deixe funcionalidades principais como pseudocódigo ou TODOs.

Não substitua a integração com o banco por dados simulados.

Não utilize mocks na aplicação de produção.

Mocks poderão ser utilizados exclusivamente em testes isolados, quando necessário.

Não adicione funcionalidades que desviem do objetivo principal.

Não faça perguntas sobre preferências que já foram especificadas neste documento.

Se houver decisões técnicas pequenas, escolha a alternativa mais simples e adequada.

Se encontrar uma ambiguidade que comprometa a fidelidade dos dados, a segurança ou o funcionamento do sistema, interrompa somente a etapa afetada e solicite minha decisão.

Ao terminar, apresente um relatório contendo:

1. Funcionalidades implementadas.
2. Tecnologias e arquitetura utilizadas.
3. Estrutura final das pastas.
4. Quantidade de matérias, módulos e conteúdos efetivamente importados, quando aplicável.
5. Caminho do relatório de extração do PDF.
6. Testes executados e resultados reais.
7. Variáveis de ambiente que preciso configurar.
8. Instruções para executar localmente.
9. Instruções para publicar no Render.
10. Pendências que dependem de mim.
11. Limitações conhecidas.

Se alguma funcionalidade não tiver sido concluída, informe isso explicitamente.

O resultado final deverá ser um sistema de acompanhamento de estudos funcional, leve, responsivo, seguro e preparado para hospedagem na web, utilizando os dados reais do PDF fornecido.