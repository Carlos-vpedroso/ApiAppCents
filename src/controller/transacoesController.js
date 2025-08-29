const { transacoesViewModel, categoriasViewModel } = require('../view/managerView')

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

        const transacaoPopulada = await transacao.populate('usuario').populate('categoria');

        res.status(201).json(transacaoPopulada);
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
    Put,
    Delete
};