-- =====================================================================
-- MODELO FÍSICO DO BANCO DE DADOS
-- Gerado a partir do Modelo Lógico (US18-Modelo-Logico-banco.drawio)
-- SGBD: SQLite
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- Tabela: cliente
-- ---------------------------------------------------------------------
CREATE TABLE cliente (
    id_cliente      INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT NOT NULL,
    cpf             TEXT NOT NULL UNIQUE,
    email           TEXT NOT NULL UNIQUE,
    telefone        TEXT NOT NULL,
    senha           TEXT NOT NULL,
    data_cadastro   TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime'))
);

-- ---------------------------------------------------------------------
-- Tabela: endereco (1 cliente -> N enderecos)
-- ---------------------------------------------------------------------
CREATE TABLE endereco (
    id_endereco     INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente      INTEGER NOT NULL,
    cep             TEXT NOT NULL,
    logradouro      TEXT NOT NULL,
    numero          TEXT NOT NULL,
    complemento     TEXT,
    bairro          TEXT NOT NULL,
    cidade          TEXT NOT NULL,
    estado          TEXT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Tabela: categoria
-- ---------------------------------------------------------------------
CREATE TABLE categoria (
    id_categoria    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome            TEXT NOT NULL UNIQUE,
    descricao       TEXT
);

-- ---------------------------------------------------------------------
-- Tabela: produto (N produtos -> 1 categoria)
-- ---------------------------------------------------------------------
CREATE TABLE produto (
    id_produto      INTEGER PRIMARY KEY AUTOINCREMENT,
    id_categoria    INTEGER NOT NULL,
    nome            TEXT NOT NULL,
    descricao       TEXT NOT NULL,
    preco           INTEGER NOT NULL,
    imagem          TEXT,
    ativo           INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- Tabela: estoque (1 produto -> 1 estoque)
-- ---------------------------------------------------------------------
CREATE TABLE estoque (
    id_estoque      INTEGER PRIMARY KEY AUTOINCREMENT,
    id_produto      INTEGER NOT NULL UNIQUE,
    quantidade      INTEGER NOT NULL,
    FOREIGN KEY (id_produto) REFERENCES produto (id_produto)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Tabela: pedido (1 cliente -> N pedidos)
-- ---------------------------------------------------------------------
CREATE TABLE pedido (
    id_pedido       INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente      INTEGER NOT NULL,
    data_pedido     TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    valor_total     INTEGER NOT NULL,
    status          TEXT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente (id_cliente)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- Tabela: item_pedido (1 pedido -> N itens; N itens -> 1 produto)
-- ---------------------------------------------------------------------
CREATE TABLE item_pedido (
    id_item         INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido       INTEGER NOT NULL,
    id_produto      INTEGER NOT NULL,
    quantidade      INTEGER NOT NULL,
    preco_unitario  INTEGER NOT NULL,
    subtotal        INTEGER NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedido (id_pedido)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produto (id_produto)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- Tabela: pagamento (1 pedido -> 1 pagamento)
-- ---------------------------------------------------------------------
CREATE TABLE pagamento (
    id_pagamento            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido               INTEGER NOT NULL UNIQUE,
    metodo                  TEXT NOT NULL,
    status                  TEXT NOT NULL,
    valor                   INTEGER NOT NULL,
    indentificador_transacao TEXT UNIQUE,
    FOREIGN KEY (id_pedido) REFERENCES pedido (id_pedido)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Tabela: administrador
-- ---------------------------------------------------------------------
CREATE TABLE administrador (
    id_administrador    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome                TEXT NOT NULL,
    email               TEXT NOT NULL UNIQUE,
    senha               TEXT NOT NULL,
    data_cadastro       TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime'))
);

-- ---------------------------------------------------------------------
-- Tabela: log_administrativo (1 administrador -> N logs)
-- ---------------------------------------------------------------------
CREATE TABLE log_administrativo (
    id_log              INTEGER PRIMARY KEY AUTOINCREMENT,
    id_administrador    INTEGER NOT NULL,
    acao                TEXT NOT NULL,
    entidade            TEXT NOT NULL,
    id_registro         INTEGER,
    descricao           TEXT,
    data_hora           TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    FOREIGN KEY (id_administrador) REFERENCES administrador (id_administrador)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Índices auxiliares (para performance em buscas comuns)
-- ---------------------------------------------------------------------
CREATE INDEX idx_endereco_cliente ON endereco (id_cliente);
CREATE INDEX idx_produto_categoria ON produto (id_categoria);
CREATE INDEX idx_pedido_cliente ON pedido (id_cliente);
CREATE INDEX idx_item_pedido_pedido ON item_pedido (id_pedido);
CREATE INDEX idx_item_pedido_produto ON item_pedido (id_produto);
CREATE INDEX idx_log_administrador ON log_administrativo (id_administrador);