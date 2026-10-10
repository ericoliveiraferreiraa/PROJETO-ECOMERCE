import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MinhaConta() {
const [cliente, setCliente] = useState(null);
const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState('');

useEffect(() => {
async function carregarCliente() {
try {
const dados = await api('/clientes/me', {
autenticado: true,
});


    setCliente(dados);
  } catch (error) {
    setErro(error.message || 'Não foi possível carregar seus dados.');
  } finally {
    setCarregando(false);
  }
}

carregarCliente();


}, []);

const dataCadastro = cliente?.data_cadastro
? new Date(cliente.data_cadastro).toLocaleDateString('pt-BR')
: 'Não informado';

return ( <div className="min-h-screen bg-choco-creme text-choco-marrom"> <Navbar />


  <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <p className="text-sm font-semibold uppercase tracking-wider text-choco-vinho">
      Minha conta
    </p>

    <h1 className="mt-2 text-3xl font-extrabold">
      Meus dados
    </h1>

    <p className="mt-2 text-neutral-600">
      Consulte os dados cadastrados na sua conta Choco World.
    </p>

    {carregando && (
      <p className="mt-8">Carregando seus dados...</p>
    )}

    {erro && (
      <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {erro}

        <p className="mt-2 text-sm">
          Confira se você está conectado à sua conta.
        </p>
      </div>
    )}

    {cliente && (
      <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
        <div className="flex items-center gap-4 border-b border-neutral-100 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-choco-vinho text-2xl font-bold text-white">
            {cliente.nome?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-bold">{cliente.nome}</h2>

            <p className="text-sm text-neutral-500">
              Cliente Choco World
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Campo label="Nome completo" valor={cliente.nome} />
          <Campo label="E-mail" valor={cliente.email} />
          <Campo label="CPF" valor={cliente.cpf} />
          <Campo label="Telefone" valor={cliente.telefone} />
          <Campo label="Data de cadastro" valor={dataCadastro} />
        </div>

        <a
          href="/meus-pedidos"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-choco-vinho px-5 py-3 font-bold text-white transition hover:bg-choco-vinho-claro"
        >
          Consultar meus pedidos
        </a>
      </section>
    )}
  </main>

  <Footer />
</div>


);
}

function Campo({ label, valor }) {
return ( <div> <p className="text-sm text-neutral-500">
{label} </p>


  <p className="mt-1 break-words font-semibold">
    {valor || 'Não informado'}
  </p>
</div>


);
}
