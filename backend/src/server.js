require('dotenv').config();
const express = require('express');
const cors = require('cors');

const produtosRoutes = require('./routes/produtos.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/produtos', produtosRoutes);

// health check simples
app.get('/', (req, res) => res.json({ status: 'API Choco World no ar' }));

// IMPORTANTE: o error handler precisa ser o ULTIMO app.use()
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
