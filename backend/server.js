require("dotenv").config();
const express = require("express");
const cors = require("cors");

const produtosRoutes = require("./routes/produtos.routes");
const clientesRoutes = require("./routes/clientes.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/produtos", produtosRoutes);
app.use("/clientes", clientesRoutes);

// health check simples
app.get("/", (req, res) => res.json({ status: "API Choco World no ar" }));

// IMPORTANTE: o error handler precisa ser o ULTIMO app.use()
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
