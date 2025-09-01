const { transacoesViewModel, categoriasViewModel } = require('../view/managerView')
const mongoose = require('mongoose');

// Criar nova transação
const Post = async (req, res) => {
    try {
        const { usuario, tipo, categoria, descricao, valor, data } = req.body;

        // Validação básica
        if (!usuario || !tipo || !categoria || !valor) {
            return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
        }

        // Verifica se categoria existe e pertence ao usuário
        const categoriaExistente = await categoriasViewModel.findById(categoria);
        if (!categoriaExistente) {
            return res.status(400).json({ message: 'Categoria inválida.' });
        }
        if (categoriaExistente.tipo !== tipo) {
            return res.status(400).json({ message: 'Tipo da transação não corresponde à categoria.' });
        }

        const transacao = await transacoesViewModel.create({
            usuario,
            tipo,
            categoria,
            descricao,
            valor,
            data: data || Date.now()
        });

        res.status(201).json(transacao);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar todas as transações
const GetAll = async (req, res) => {
    try {
        const transacoes = await transacoesViewModel.find()
            .populate('usuario')
            .populate('categoria')
            .sort({ data: -1 }); // ordenar da mais recente para a mais antiga
        res.json(transacoes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar transação por ID
const GetById = async (req, res) => {
    try {
        const transacao = await transacoesViewModel.findById(req.params.id)
            .populate('usuario')
            .populate('categoria');
        if (!transacao) {
            return res.status(404).json({ message: 'Transação não encontrada.' });
        }
        res.json(transacao);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar transações por ID do usuário
const GetByUsuarioId = async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;

        // Verifica se o ID foi fornecido
        if (!usuarioId) {
            return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
        }

        // Busca as transações do usuário
        const transacoes = await transacoesViewModel.find({ usuario: usuarioId })
            .populate('usuario', 'email') // só traz o campo email do usuário
            .populate('categoria', 'nome tipo cor') // só campos essenciais da categoria
            .sort({ data: -1 }); // ordena da mais recente para a mais antiga

        if (!transacoes || transacoes.length === 0) {
            return res.status(404).json({ message: 'Nenhuma transação encontrada para este usuário.' });
        }

        res.json(transacoes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar as 4 transações mais recentes por ID do usuário
const GetUltimasTransacoes = async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;

        // Verifica se o ID foi fornecido
        if (!usuarioId) {
            return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
        }

        // Busca apenas as 4 mais recentes
        const transacoes = await transacoesViewModel.find({ usuario: usuarioId })
            .populate('usuario', 'email')
            .populate('categoria', 'nome tipo cor')
            .sort({ data: -1 })
            .limit(4);

        if (!transacoes || transacoes.length === 0) {
            return res.status(404).json({ message: 'Nenhuma transação encontrada para este usuário.' });
        }

        res.json(transacoes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const GetResumoMesAtual = async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;
        if (!usuarioId) {
            return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
        }

        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1); // 1º dia do mês às 00:00
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999); // último dia do mês às 23:59

        const resumo = await transacoesViewModel.aggregate([
            {
                $match: {
                    usuario: new mongoose.Types.ObjectId(usuarioId),
                    data: { $gte: inicioMes, $lte: fimMes }
                }
            },
            {
                $group: {
                    _id: "$tipo",
                    total: { $sum: "$valor" }
                }
            },
            {
                $project: {
                    _id: 0,
                    tipo: "$_id",
                    total: 1
                }
            }
        ]);

        const resultado = { receita: 0, despesa: 0 };
        resumo.forEach(r => {
            if (r.tipo === "receita") resultado.receita = r.total;
            if (r.tipo === "despesa") resultado.despesa = r.total;
        });

        res.json(resultado);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const GetResumo6Meses = async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;

        if (!usuarioId) {
            return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
        }

        const hoje = new Date();
        const meses = [];

        // Cria array com os últimos 6 meses (ano + mês)
        for (let i = 5; i >= 0; i--) {
            const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            meses.push({ ano: data.getFullYear(), mes: data.getMonth() + 1 });
        }

        const seisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);

        const agregados = await transacoesViewModel.aggregate([
            {
                $match: {
                    usuario: new mongoose.Types.ObjectId(usuarioId),
                    data: { $gte: seisMesesAtras }
                }
            },
            {
                $addFields: {
                    mes: { $month: "$data" },
                    ano: { $year: "$data" }
                }
            },
            {
                $group: {
                    _id: { ano: "$ano", mes: "$mes", tipo: "$tipo" },
                    total: { $sum: "$valor" }
                }
            },
            {
                $group: {
                    _id: { ano: "$_id.ano", mes: "$_id.mes" },
                    valores: {
                        $push: { tipo: "$_id.tipo", total: "$total" }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    ano: "$_id.ano",
                    mes: "$_id.mes",
                    receita: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: { input: "$valores", as: "v", cond: { $eq: ["$$v.tipo", "receita"] } }
                                },
                                as: "r",
                                in: "$$r.total"
                            }
                        }
                    },
                    despesa: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: { input: "$valores", as: "v", cond: { $eq: ["$$v.tipo", "despesa"] } }
                                },
                                as: "d",
                                in: "$$d.total"
                            }
                        }
                    }
                }
            },
            { $sort: { ano: 1, mes: 1 } }
        ]);

        // Preencher meses sem transações
        const resumoCompleto = meses.map(m => {
            const registro = agregados.find(a => a.ano === m.ano && a.mes === m.mes);
            return {
                ano: m.ano,
                mes: m.mes,
                receita: registro ? registro.receita : 0,
                despesa: registro ? registro.despesa : 0
            };
        });

        res.json(resumoCompleto);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const GetDespesasPorCategoria = async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;

        if (!usuarioId) {
            return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
        }

        const despesas = await transacoesViewModel.aggregate([
            {
                $match: {
                    usuario: new mongoose.Types.ObjectId(usuarioId),
                    tipo: "despesa"
                }
            },
            {
                $lookup: {
                    from: "categorias", // nome da collection de categorias
                    localField: "categoria",
                    foreignField: "_id",
                    as: "categoria"
                }
            },
            { $unwind: "$categoria" },
            {
                $group: {
                    _id: "$categoria.nome",
                    total: { $sum: "$valor" }
                }
            },
            {
                $project: {
                    _id: 0,
                    categoria: "$_id",
                    total: 1
                }
            }
        ]);

        // Transformar em objeto no formato { "alimentação": 300, "transporte": 500 }
        const resultado = despesas.reduce((acc, item) => {
            acc[item.categoria] = item.total;
            return acc;
        }, {});

        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const GetAssinaturas = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;

    if (!usuarioId) {
      return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
    }

    // Busca todas as despesas do tipo "Assinatura"
    const assinaturas = await transacoesViewModel.find({
      usuario: new mongoose.Types.ObjectId(usuarioId),
      tipo: "despesa"
    })
      .populate('categoria', 'nome')
      .sort({ data: -1 });

    // Filtrar somente categoria Assinatura
    const resultado = assinaturas
      .filter(item => item.categoria?.nome.toLowerCase() === "assinatura")
      .map(item => ({
        name: item.descricao,   // nome da assinatura (Netflix, Spotify...)
        valor: item.valor,      // preço
        data: new Date(item.data).toLocaleDateString("pt-BR") // data formatada
      }));

    if (resultado.length === 0) {
      return res.status(404).json({ message: 'Nenhuma assinatura encontrada para este usuário.' });
    }

    res.json(resultado);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Atualizar transação
const Put = async (req, res) => {
    try {
        const { tipo, categoria } = req.body;

        // Se houver atualização de categoria ou tipo, validar
        if (categoria || tipo) {
            const categoriaExistente = await categoriasViewModel.findById(categoria);
            if (!categoriaExistente) {
                return res.status(400).json({ message: 'Categoria inválida.' });
            }
            if (tipo && categoriaExistente.tipo !== tipo) {
                return res.status(400).json({ message: 'Tipo da transação não corresponde à categoria.' });
            }
        }

        const transacao = await transacoesViewModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('usuario').populate('categoria');

        if (!transacao) {
            return res.status(404).json({ message: 'Transação não encontrada.' });
        }

        res.json(transacao);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Excluir transação
const Delete = async (req, res) => {
    try {
        const transacao = await transacoesViewModel.findByIdAndDelete(req.params.id);
        if (!transacao) {
            return res.status(404).json({ message: 'Transação não encontrada.' });
        }
        res.json({ message: 'Transação removida com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    Post,
    GetAll,
    GetById,
    GetByUsuarioId,
    GetUltimasTransacoes,
    GetResumoMesAtual,
    GetResumo6Meses,
    GetDespesasPorCategoria,
    GetAssinaturas,
    Put,
    Delete,
};