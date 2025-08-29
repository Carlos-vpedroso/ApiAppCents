const { categoriasViewModel } = require('../view/managerView');

// Criar nova categoria
const Post = async (req, res) => {
    try {
        const categoria = await categoriasViewModel.create(req.body);
        res.status(201).json(categoria);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Buscar todas as categorias
const GetAll = async (req, res) => {
    try {
        const categorias = await categoriasViewModel.find().populate('usuario');
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar categorias por ID do usuário
const GetByUsuarioId = async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId;

        if (!usuarioId) {
            return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
        }

        // Busca as categorias do usuário
        const categorias = await categoriasViewModel.find({ usuario: usuarioId })
            .sort({ nome: 1 }); // ordena por nome (alfabético)

        if (!categorias || categorias.length === 0) {
            return res.status(404).json({ message: 'Nenhuma categoria encontrada para este usuário.' });
        }

        res.json(categorias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Buscar categoria por ID
const GetById = async (req, res) => {
    try {
        const categoria = await categoriasViewModel.findById(req.params.id).populate('usuario');
        if (!categoria) return res.status(404).json({ message: 'Categoria não encontrada' });
        res.json(categoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar categoria
const Put = async (req, res) => {
    try {
        const categoria = await categoriasViewModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!categoria) return res.status(404).json({ message: 'Categoria não encontrada' });
        res.json(categoria);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Excluir categoria
const Delete = async (req, res) => {
    try {
        const categoria = await categoriasViewModel.findByIdAndDelete(req.params.id);
        if (!categoria) return res.status(404).json({ message: 'Categoria não encontrada' });
        res.json({ message: 'Categoria removida com sucesso' });
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
}