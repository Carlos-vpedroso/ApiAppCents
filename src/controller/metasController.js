const { metasViewModel } = require('../view/managerView');

// Criar nova meta
const Post = async (req, res) => {
    try {
        const meta = await metasViewModel.create(req.body);
        res.status(201).json(meta);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Buscar todas as metas
const GetAll = async (req, res) => {
    try {
        const metas = await metasViewModel.find().populate('usuario');
        res.json(metas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar meta por ID
const GetById = async (req, res) => {
    try {
        const meta = await metasViewModel.findById(req.params.id).populate('usuario');
        if (!meta) return res.status(404).json({ message: 'Meta não encontrada' });
        res.json(meta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar metas por ID do usuário
const GetByUsuarioId = async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;

        if (!usuarioId) {
            return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
        }

        // Busca as metas do usuário
        const metas = await metasViewModel.find({ usuario: usuarioId })
            .sort({ nome: 1 }); // ordena por nome (alfabético)

        if (!metas || metas.length === 0) {
            return res.status(404).json({ message: 'Nenhuma categoria encontrada para este usuário.' });
        }

        res.json(metas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Atualizar meta
const Put = async (req, res) => {
    try {
        const meta = await metasViewModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!meta) return res.status(404).json({ message: 'Meta não encontrada' });
        res.json(meta);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Excluir meta
const Delete = async (req, res) => {
    try {
        const meta = await metasViewModel.findByIdAndDelete(req.params.id);
        if (!meta) return res.status(404).json({ message: 'Meta não encontrada' });
        res.json({ message: 'Meta removida com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
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