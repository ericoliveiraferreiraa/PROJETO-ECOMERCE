-- =====================================================================
-- CHOCO WORLD — TRIGGERS DE REGRA DE NEGÓCIO + SEED + CASOS DE TESTE
-- v2 — script limpo, rodar do zero logo após criar as tabelas
-- Execute cada PARTE em sequência (Ctrl+Enter em cada bloco,
-- ou selecione a PARTE inteira e rode de uma vez)
-- =====================================================================

PRAGMA foreign_keys = ON;

-- =====================================================================
-- PARTE 1 — TRIGGERS PARA REGRAS DE NEGÓCIO
-- =====================================================================

-- RN02: preço do produto deve ser maior que zero
CREATE TRIGGER trg_produto_preco_valido
BEFORE INSERT ON produto
WHEN NEW.preco <= 0
BEGIN
    SELECT RAISE(ABORT, 'RN02: o preço do produto deve ser maior que zero');
END;

-- RN03: quantidade em estoque não pode ser negativa
CREATE TRIGGER trg_estoque_nao_negativo_insert
BEFORE INSERT ON estoque
WHEN NEW.quantidade < 0
BEGIN
    SELECT RAISE(ABORT, 'RN03: a quantidade em estoque não pode ser negativa');
END;

CREATE TRIGGER trg_estoque_nao_negativo_update
BEFORE UPDATE ON estoque
WHEN NEW.quantidade < 0
BEGIN
    SELECT RAISE(ABORT, 'RN03: a quantidade em estoque não pode ser negativa');
END;

-- RN04 / RN08: não permitir vender quantidade maior que o estoque disponível
CREATE TRIGGER trg_item_pedido_estoque_suficiente
BEFORE INSERT ON item_pedido
WHEN (
    SELECT quantidade FROM estoque WHERE id_produto = NEW.id_produto
) < NEW.quantidade
BEGIN
    SELECT RAISE(ABORT, 'RN04/RN08: quantidade solicitada maior que o estoque disponível');
END;

-- RN07: baixa automática no estoque após o item do pedido ser registrado
CREATE TRIGGER trg_atualiza_estoque_apos_item
AFTER INSERT ON item_pedido
BEGIN
    UPDATE estoque
    SET quantidade = quantidade - NEW.quantidade
    WHERE id_produto = NEW.id_produto;
END;

-- Conferir se os 5 triggers foram criados:
-- SELECT name FROM sqlite_master WHERE type='trigger';

-- =====================================================================
-- PARTE 2 — SEED DE DADOS (massa de teste)
-- Rodar UMA ÚNICA VEZ. Com tabelas recém-criadas, os IDs saem assim:
--   categoria: 1=Nacionais, 2=Importados, 3=Snacks
--   produto:   1=Choc. ao Leite, 2=Choc. Amargo, 3=Choc. Belga
--   cliente:   1=Cliente Teste | administrador: 1=Admin Teste
-- =====================================================================

INSERT INTO categoria (nome, descricao) VALUES
    ('Chocolates Nacionais', 'Marcas brasileiras'),
    ('Chocolates Importados', 'Marcas internacionais'),
    ('Snacks', 'Salgadinhos e doces variados');

INSERT INTO produto (id_categoria, nome, descricao, preco, imagem, ativo) VALUES
    (1, 'Chocolate ao Leite 90g', 'Chocolate nacional ao leite', 800, NULL, 1),
    (1, 'Chocolate Amargo 70%', 'Chocolate nacional amargo', 1200, NULL, 1),
    (2, 'Chocolate Belga Trufado', 'Importado, caixa com 6 unidades', 4500, NULL, 1);

INSERT INTO estoque (id_produto, quantidade) VALUES
    (1, 50),
    (2, 30),
    (3, 10);

INSERT INTO cliente (nome, cpf, email, telefone, senha) VALUES
    ('Cliente Teste', '11122233344', 'teste@email.com', '11999990000', 'hash_fake_da_senha');

INSERT INTO endereco (id_cliente, cep, logradouro, numero, complemento, bairro, cidade, estado) VALUES
    (1, '01001000', 'Praça da Sé', '100', NULL, 'Sé', 'São Paulo', 'SP');

INSERT INTO administrador (nome, email, senha) VALUES
    ('Admin Teste', 'admin@chocoworld.com', 'hash_fake_admin');

-- Conferir se o seed entrou certo (esperado: 3,3,3,1,1,1):
 --SELECT 'categoria', COUNT(*) FROM categoria
 --UNION ALL SELECT 'produto', COUNT(*) FROM produto
 --UNION ALL SELECT 'estoque', COUNT(*) FROM estoque
 --UNION ALL SELECT 'cliente', COUNT(*) FROM cliente
 --UNION ALL SELECT 'endereco', COUNT(*) FROM endereco
 --UNION ALL SELECT 'administrador', COUNT(*) FROM administrador;

-- =====================================================================
-- PARTE 3 — CASOS DE TESTE
-- Rode UM bloco de cada vez. Os blocos comentados com "--" são os que
-- DEVEM dar erro — descomente, rode, confira a mensagem, comente de novo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- TESTE 1 — Cadastro de produto válido (RF25 / RN01 / RN02)
-- Esperado: INSERT com sucesso, vira produto id=4
-- ---------------------------------------------------------------------
INSERT INTO produto (id_categoria, nome, descricao, preco, ativo)
VALUES (3, 'Batata Doce Chips', 'Snack salgado', 1000, 1);
-- SELECT * FROM produto WHERE nome = 'Batata Doce Chips';

-- ---------------------------------------------------------------------
-- TESTE 2 — Cadastro de produto com preço inválido (RN02)
-- Esperado: ERRO "RN02: o preço do produto deve ser maior que zero"
-- ---------------------------------------------------------------------
-- INSERT INTO produto (id_categoria, nome, descricao, preco, ativo)
-- VALUES (3, 'Produto com erro', 'Teste de preço negativo', -5, 1);

-- ---------------------------------------------------------------------
-- TESTE 3 — Compra válida, dentro do estoque (RF07, RF16, RF17, RN05, RN07)
-- Esperado: pedido criado, item inserido, estoque do produto 1 cai de 50 para 48
-- ---------------------------------------------------------------------
INSERT INTO pedido (id_cliente, valor_total, status)
VALUES (1, 1600, 'aguardando_pagamento');

INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario, subtotal)
VALUES (last_insert_rowid(), 1, 2, 800, 1600);

-- Confirmar baixa automática no estoque:
-- SELECT * FROM estoque WHERE id_produto = 1;  -- esperado: quantidade = 48

-- ---------------------------------------------------------------------
-- TESTE 4 — Pagamento do pedido (RF18, RF19, RF20, RN06)
-- Esperado: pagamento vinculado ao pedido, status "aprovado"
-- ---------------------------------------------------------------------
INSERT INTO pagamento (id_pedido, metodo, status, valor, indentificador_transacao)
VALUES ((SELECT MAX(id_pedido) FROM pedido), 'mercado_pago', 'aprovado', 1600, 'MP-TESTE-0001');

UPDATE pedido
SET status = 'pago'
WHERE id_pedido = (SELECT MAX(id_pedido) FROM pedido);

-- ---------------------------------------------------------------------
-- TESTE 5 — Compra acima do estoque disponível (RN04 / RN08)
-- Esperado: ERRO "RN04/RN08: quantidade solicitada maior que o estoque disponível"
-- (produto 3 tem só 10 em estoque)
-- ---------------------------------------------------------------------
-- INSERT INTO pedido (id_cliente, valor_total, status) VALUES (1, 999999, 'aguardando_pagamento');
-- INSERT INTO item_pedido (id_pedido, id_produto, quantidade, preco_unitario, subtotal)
-- VALUES (last_insert_rowid(), 3, 999, 4500, 4495500);

-- ---------------------------------------------------------------------
-- TESTE 6 — Estoque não pode ficar negativo via UPDATE direto (RN03)
-- Esperado: ERRO "RN03: a quantidade em estoque não pode ser negativa"
-- ---------------------------------------------------------------------
-- UPDATE estoque SET quantidade = -1 WHERE id_produto = 2;

-- ---------------------------------------------------------------------
-- TESTE 7 — Consulta de pedidos do cliente (RF24)
-- Esperado: retorna o(s) pedido(s) feito(s) pelo cliente 1, com itens
-- ---------------------------------------------------------------------
SELECT p.id_pedido, p.data_pedido, p.status, p.valor_total,
       ip.id_produto, pr.nome AS produto, ip.quantidade, ip.subtotal
FROM pedido p
JOIN item_pedido ip ON ip.id_pedido = p.id_pedido
JOIN produto pr ON pr.id_produto = ip.id_produto
WHERE p.id_cliente = 1;

-- ---------------------------------------------------------------------
-- TESTE 8 — Impedir exclusão física de produto já vendido (RN10)
-- Esperado: a aplicação deve usar UPDATE ativo = 0 em vez de DELETE.
-- Este DELETE não tem bloqueio automático no banco — é regra que
-- precisa ser garantida na camada de aplicação/back-end.
-- ---------------------------------------------------------------------
-- DELETE FROM produto WHERE id_produto = 1; -- evitar: use UPDATE produto SET ativo = 0 ...



