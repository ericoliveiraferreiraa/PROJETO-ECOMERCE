# 🍫 Choco World

E-commerce de chocolates, doces e snacks nacionais e internacionais, desenvolvido como projeto acadêmico na área de Tecnologia da Informação.

O projeto tem como objetivo desenvolver uma plataforma completa de comércio eletrônico, contemplando **Front-end, Back-end, Banco de Dados, APIs externas, controle de versão e gerenciamento de projeto**.

---

## 📌 Sobre o projeto

A **Choco World** é uma loja virtual voltada para crianças e adultos, aproximadamente de 5 a 45 anos, oferecendo uma variedade de chocolates, doces e snacks.

Além da experiência de compra, o projeto possui uma proposta de **filantropia**, buscando associar a marca a iniciativas sociais.

### 🎯 Objetivo

Desenvolver um e-commerce que permita ao cliente:

- Navegar pelo catálogo de produtos;

- Pesquisar e filtrar produtos;

- Visualizar detalhes dos produtos;

- Adicionar e remover produtos do carrinho;

- Alterar quantidades;

- Calcular automaticamente os valores da compra;

- Cadastrar seus dados;

- Consultar endereço através de CEP;

- Finalizar pedidos;

- Realizar pagamentos através do Mercado Pago;

- Consultar seus pedidos.

---

## 👥 Público-alvo

- Crianças;

- Adolescentes;

- Adultos;

- Homens e mulheres;

- Faixa etária aproximada: **5 a 45 anos**;

- Pessoas interessadas em chocolates, doces e snacks nacionais e internacionais.

---

## 🛍️ Principais funcionalidades

### Cliente

- [ ] Página inicial

- [ ] Catálogo de produtos

- [ ] Pesquisa de produtos

- [ ] Filtro por categoria

- [ ] Página de detalhes do produto

- [ ] Carrinho de compras

- [ ] Alteração da quantidade de produtos

- [ ] Remoção de produtos

- [ ] Cálculo automático do subtotal

- [ ] Cálculo do valor total

- [ ] Cadastro de cliente

- [ ] Consulta de endereço por CEP

- [ ] Checkout

- [ ] Pagamento via Mercado Pago

- [ ] Confirmação do pedido


### Administração

- [ ] Cadastro de produtos

- [ ] Alteração de produtos

- [ ] Inativação de produtos

- [ ] Controle de estoque

- [ ] Cadastro de categorias

- [ ] Gerenciamento de pedidos

- [ ] Gerenciamento de clientes

---

# 🎨 Identidade visual

A identidade visual foi baseada no layout desenvolvido no **Figma**, utilizando a regra **60-30-10**.

### 60% — Cor predominante

**Creme / bege claro**

Utilizada principalmente em:

- Fundos;

- Áreas de conteúdo;

- Seções principais.

### 30% — Cor secundária

**Vermelho**

Utilizado em:

- Cabeçalho;

- Rodapé;

- Banners;

- Áreas de destaque.

### 10% — Cores de destaque

Cores variadas são utilizadas em:

- Cards;

- Produtos;

- Categorias;

- Promoções;

- Elementos de destaque.

A utilização das cores busca criar uma identidade visual relacionada ao universo de chocolates e doces, mantendo os produtos como elementos de destaque.

---

# 🖥️ Prototipação

O protótipo da aplicação será desenvolvido utilizando **Figma**.

### Telas planejadas

1. **Home**

2. **Catálogo de produtos**

3. **Detalhes do produto**

4. **Carrinho**

5. **Checkout**

6. **Pagamento**

7. **Pedido concluído**

8. **Área administrativa**

---

# ⚙️ Tecnologias

## Front-end

- React

- Tailwind CSS

- JavaScript

- HTML

- CSS

## Back-end

- Node.js

- Express

- JavaScript

- API REST

## Banco de dados

O projeto contará com:

- Modelo conceitual;

- Modelo lógico;

- Modelo físico;

- Implementação do banco de dados.

## APIs

- API de consulta de CEP;

- Mercado Pago para processamento de pagamentos.

## Ferramentas

- Figma — prototipação;

- Git — controle de versão;

- GitHub — hospedagem do código;

- Trello — gerenciamento das tarefas;

- Google Meet — reuniões e comunicação da equipe.

---

# 🏗️ Arquitetura

```text

                    CHOCO WORLD

                         │

                         ▼

                 ┌──────────────┐

                 │   FRONT-END  │

                 │    React     │

                 │ Tailwind CSS │

                 └──────┬───────┘

                        │

                     HTTP/REST

                        │

                        ▼

                 ┌──────────────┐

                 │   BACK-END   │

                 │    Node.js   │

                 │    Express   │

                 │    Routes    │

                 └──────┬───────┘

                        │

              ┌─────────┴──────────┐

              │                    │

              ▼                    ▼

       ┌──────────────┐     ┌──────────────┐

       │   BANCO DE   │     │ APIs EXTERNAS│

       │    DADOS     │     │              │

       │              │     │    CEP       │

       │ Cliente      │     │ Mercado Pago │

       │ Produto      │     │              │

       │ Pedido       │     └──────────────┘

       │ Pagamento    │

       │ Estoque      │

       └──────────────┘

```

---

# 🛒 Fluxo de compra

```text

Cliente

   ↓

Página inicial

   ↓

Catálogo

   ↓

Produto

   ↓

Adicionar ao carrinho

   ↓

Carrinho

   ↓

Checkout

   ↓

Informação do CEP

   ↓

API de CEP

   ↓

Endereço preenchido

   ↓

Mercado Pago

   ↓

Pagamento

   ↓

Confirmação

   ↓

Pedido registrado

   ↓

Estoque atualizado

```

---

# 🗄️ Banco de dados

As principais entidades previstas são:

```text

CLIENTE

   │

   │ 1:N

   ▼

PEDIDO

   │

   │ 1:N

   ▼

ITEM_PEDIDO

   │

   │ N:1

   ▼

PRODUTO

   │

   │ N:1

   ▼

CATEGORIA

```

Entidades complementares:

```text

CLIENTE

   │

   └── ENDERECO

PEDIDO

   │

   └── PAGAMENTO

PRODUTO

   │

   └── ESTOQUE

```

### Entidades principais

**CLIENTE**

- id_cliente

- nome

- CPF

- e-mail

- telefone

- senha

**ENDERECO**

- id_endereco

- id_cliente

- CEP

- logradouro

- número

- complemento

- bairro

- cidade

- estado

**CATEGORIA**

- id_categoria

- nome

- descrição

**PRODUTO**

- id_produto

- id_categoria

- nome

- descrição

- preço

- imagem

- estoque

- ativo

**PEDIDO**

- id_pedido

- id_cliente

- data_pedido

- valor_total

- status

**ITEM_PEDIDO**

- id_item

- id_pedido

- id_produto

- quantidade

- preço_unitário

- subtotal

**PAGAMENTO**

- id_pagamento

- id_pedido

- método

- status

- valor

- identificador_transação

---

# 🔌 API REST

Exemplos de rotas planejadas:

## Produtos

```http

GET    /api/produtos

GET    /api/produtos/:id

POST   /api/produtos

PUT    /api/produtos/:id

DELETE /api/produtos/:id

```

## Clientes

```http

POST   /api/clientes

GET    /api/clientes/:id

PUT    /api/clientes/:id

```

## Pedidos

```http

POST   /api/pedidos

GET    /api/pedidos/:id

GET    /api/clientes/:id/pedidos

```

## Pagamentos

```http

POST   /api/pagamentos

GET    /api/pagamentos/:id

```

---

# 📦 Carrinho de compras

O carrinho deverá permitir:

- Adicionar produtos;

- Remover produtos;

- Aumentar quantidade;

- Diminuir quantidade;

- Visualizar preço unitário;

- Visualizar subtotal;

- Visualizar valor total.

Exemplo:

```text

Chocolate A

2 × R$ 8,00 = R$ 16,00

Chocolate B

1 × R$ 25,00 = R$ 25,00

-------------------------

TOTAL: R$ 41,00

```

---

# 💳 Mercado Pago

O Mercado Pago será utilizado para o processamento dos pagamentos.

Fluxo:

```text

Carrinho

   ↓

Checkout

   ↓

Back-end Choco World

   ↓

Mercado Pago

   ↓

Processamento do pagamento

   ↓

Retorno do status

   ↓

Atualização do pedido

```

As credenciais privadas da integração deverão permanecer protegidas no **Back-end**, não sendo expostas no Front-end.

---

# 📍 API de CEP

A API de CEP será utilizada para facilitar o preenchimento do endereço no checkout.

Fluxo:

```text

Cliente informa CEP

        ↓

Front-end envia CEP

        ↓

API de CEP

        ↓

Retorno dos dados

        ↓

Campos de endereço preenchidos

        ↓

Cliente confirma/complementa

```

---

# 📋 Requisitos funcionais

| Código | Requisito |

|---|---|

| RF01 | O sistema deve permitir visualizar a página inicial. |

| RF02 | O sistema deve permitir visualizar o catálogo de produtos. |

| RF03 | O sistema deve permitir pesquisar produtos pelo nome. |

| RF04 | O sistema deve permitir filtrar produtos por categoria. |

| RF05 | O sistema deve permitir visualizar detalhes de um produto. |

| RF06 | O sistema deve apresentar informações do produto, como nome, imagem, descrição, preço e disponibilidade. |

| RF07 | O sistema deve permitir adicionar produtos ao carrinho. |

| RF08 | O sistema deve permitir remover produtos do carrinho. |

| RF09 | O sistema deve permitir alterar a quantidade de produtos. |

| RF10 | O sistema deve calcular o subtotal dos produtos. |

| RF11 | O sistema deve calcular o valor total da compra. |

| RF12 | O sistema deve permitir cadastrar clientes. |

| RF13 | O sistema deve permitir informar o CEP. |

| RF14 | O sistema deve consultar o endereço através de uma API de CEP. |

| RF15 | O sistema deve preencher os dados de endereço retornados pela API. |

| RF16 | O sistema deve permitir finalizar uma compra. |

| RF17 | O sistema deve registrar o pedido no banco de dados. |

| RF18 | O sistema deve permitir selecionar uma forma de pagamento. |

| RF19 | O sistema deve integrar o pagamento ao Mercado Pago. |

| RF20 | O sistema deve receber o status do pagamento. |

| RF21 | O sistema deve atualizar o status do pedido. |

| RF22 | O sistema deve atualizar o estoque após a confirmação da compra. |

| RF23 | O sistema deve impedir a compra de quantidade superior ao estoque disponível. |

| RF24 | O sistema deve permitir consultar pedidos anteriores. |

| RF25 | O sistema deve permitir o gerenciamento administrativo de produtos e estoque. |

---

# 🔒 Requisitos não funcionais

| Código | Requisito |

|---|---|

| RNF01 | O Front-end deverá ser desenvolvido utilizando React. |

| RNF02 | A interface deverá utilizar Tailwind CSS. |

| RNF03 | O Back-end deverá utilizar Node.js e Express. |

| RNF04 | A comunicação entre Front-end e Back-end deverá utilizar API REST. |

| RNF05 | O sistema deverá utilizar banco de dados relacional. |

| RNF06 | O projeto deverá possuir modelos conceitual, lógico e físico do banco de dados. |

| RNF07 | O sistema deverá ser responsivo. |

| RNF08 | A interface deverá seguir o protótipo desenvolvido no Figma. |

| RNF09 | O sistema deverá seguir a identidade visual definida pela regra 60-30-10. |

| RNF10 | O sistema deverá validar os dados inseridos pelo usuário. |

| RNF11 | O sistema deverá apresentar mensagens de erro compreensíveis. |

| RNF12 | As credenciais privadas das APIs não deverão ser expostas no Front-end. |

| RNF13 | O sistema deverá utilizar HTTPS em produção. |

| RNF14 | O código deverá ser organizado de forma modular. |

| RNF15 | O sistema deverá tratar falhas das APIs externas. |

| RNF16 | O projeto deverá utilizar Git para controle de versão. |

| RNF17 | O projeto deverá utilizar branches para organização do desenvolvimento. |

| RNF18 | O código deverá ser armazenado em um repositório GitHub. |

---

# 📏 Regras de negócio

- **RN01:** Todo produto deverá possuir nome, descrição, preço, categoria e estoque.

- **RN02:** O preço do produto deverá ser maior que zero.

- **RN03:** A quantidade em estoque não poderá ser negativa.

- **RN04:** O cliente não poderá comprar quantidade superior ao estoque disponível.

- **RN05:** Um pedido deverá possuir pelo menos um produto.

- **RN06:** O pedido somente será considerado pago após confirmação do processamento do pagamento.

- **RN07:** O estoque deverá ser atualizado após a confirmação da compra.

- **RN08:** Produtos sem estoque não deverão permitir novas compras.

- **RN09:** O CEP deverá ser validado antes da consulta à API.

- **RN10:** Produtos que já tenham participado de pedidos não deverão ser excluídos fisicamente, podendo ser inativados.

---

# 👥 Stakeholders

| Stakeholder | Responsabilidade/Interesse |

|---|---|

| Administrador | Gerenciar produtos, estoque, clientes e sistema. |

| Gerente | Acompanhar vendas, pedidos e estoque. |

| Funcionário | Auxiliar nas operações da loja e gerenciamento de pedidos. |

| Cliente | Navegar, comprar produtos e acompanhar pedidos. |

| Fornecedor | Fornecer produtos para a empresa. |

| Equipe de desenvolvimento | Desenvolver, testar e manter o sistema. |

---

# 🏪 Pesquisa de mercado

Durante o levantamento de mercado serão analisadas empresas e marcas do segmento de chocolates, como:

- Diamante Negro / Lacta;

- Feastables;

- KitKat;

- Nestlé.

A análise deverá considerar:

- Identidade visual;

- Catálogo;

- Variedade de produtos;

- Navegação;

- Experiência de compra;

- Carrinho;

- Checkout;

- Formas de pagamento;

- Promoções;

- Responsividade;

- Diferenciais da marca;

- Ações sociais e filantrópicas.

A pesquisa servirá como referência para identificar práticas utilizadas no mercado e definir características da Choco World.

---

# 🌱 Filantropia

A Choco World possui como proposta de negócio associar a marca a ações de impacto social.

### Conceito

> **"Chocolate que transforma."**

A proposta é destinar parte das iniciativas da empresa para projetos sociais voltados ao desenvolvimento e bem-estar de crianças.

---

# 🌿 Git e GitHub

O projeto utilizará Git para controle de versão e GitHub para hospedagem do código.

### Estratégia de branches

```text

main

  │

  └── develop

       │

       ├── feature/frontend

       ├── feature/backend

       ├── feature/database

       ├── feature/carrinho

       ├── feature/checkout

       └── feature/pagamento

```

O desenvolvimento será realizado em branches específicas e, após testes e validações, as alterações serão integradas por meio de **merge**.

### Padrão de commits

Exemplos:

```text

feat: cria estrutura inicial do frontend

feat: adiciona catálogo de produtos

feat: implementa carrinho de compras

feat: cria rota de produtos

feat: adiciona integração com API de CEP

feat: adiciona integração com Mercado Pago

fix: corrige cálculo do carrinho

fix: corrige validação do checkout

docs: adiciona documentação do projeto

```

---

# 📊 Gerenciamento do projeto

O projeto utilizará **Trello** com metodologia Kanban para organização das atividades.

### Fluxo

```text

BACKLOG

   ↓

A FAZER

   ↓

EM DESENVOLVIMENTO

   ↓

EM TESTE

   ↓

CONCLUÍDO

```

As tarefas serão divididas entre Front-end, Back-end, Banco de Dados, documentação, testes e integrações.

---

# 🤝 Comunicação

O **Google Meet** será utilizado para reuniões e comunicação da equipe.

As reuniões terão como objetivo:

- Acompanhar o andamento do projeto;

- Distribuir tarefas;

- Discutir problemas;

- Revisar funcionalidades;

- Definir próximas etapas;

- Apresentar resultados.

---

# 📁 Estrutura prevista do projeto

```text

choco-world/

│

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   ├── pages/

│   │   ├── services/

│   │   ├── contexts/

│   │   └── App.jsx

│   └── package.json

│

├── backend/

│   ├── src/

│   │   ├── controllers/

│   │   ├── routes/

│   │   ├── services/

│   │   ├── models/

│   │   ├── middlewares/

│   │   └── database/

│   ├── .env

│   ├── server.js

│   └── package.json

│

├── database/

│   ├── conceitual/

│   ├── logico/

│   └── fisico/

│

├── docs/

│   ├── requisitos/

│   ├── figma/

│   └── diagramas/

│

└── README.md

```

---

**