require("dotenv").config();
const express = require("express");
const cors = require("cors");

const produtosRoutes = require("./src/routes/produtos.routes");
const clientesRoutes = require("./src/routes/clientes.routes");
const pedidosRoutes = require("./src/routes/pedidos.routes");
const categoriasRoutes = require("./src/routes/categorias.routes");
const administradoresRoutes = require("./src/routes/administradores.routes");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/produtos", produtosRoutes);
app.use("/clientes", clientesRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/categorias", categoriasRoutes);
app.use("/administradores", administradoresRoutes);

// health check simples
app.get("/", (req, res) => res.json({ status: "API Choco World no ar" }));

// IMPORTANTE: o error handler precisa ser o ULTIMO app.use()
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
