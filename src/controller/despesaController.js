const { despesaViewModel, userViewModel } = require('../view/managerView')

module.exports =
{
    async Get(req, res) {
        try {
            const despesa = await despesaViewModel.find({});
            if (despesa.length === 0) {
                return res.json({ "sucesso": false, "mensagem": "There are no registered records." });
            };

            return res.json(despesa);
        } catch (erro) {
            return res.json({ "success": false, "erro": JSON.stringify(erro) });
        };
    },

    async GetByUsuarioId(req, res) {
        try {
            const { usuario } = req.params;

            if (!usuario) {
                return res.status(400).json({ sucesso: false, mensagem: 'ID do usuário é obrigatório.' });
            }

            const despesas = await despesaViewModel.find({ usuario });

            if (despesas.length === 0) {
                return res.json({ sucesso: false, mensagem: 'Nenhuma despesa encontrada para este usuário.' });
            }

            return res.json({ sucesso: true, despesas });
        } catch (erro) {
            return res.status(500).json({ sucesso: false, erro: erro.message });
        }
    },

    async Post(req, res) {
        try {
            const usuarioId = req.params.usuarioId; // <- pega o ID da URL
            const { descricao, categoria, valor } = req.body;

            if (!usuarioId) {
                return res.status(400).json({ Success: false, Message: "ID do usuário não informado" });
            }

            const usuarioExiste = await userViewModel.findById(usuarioId);
            if (!usuarioExiste) {
                return res.status(404).json({ Success: false, Message: "Usuário não encontrado." });
            }

            const novaDespesa = new despesaViewModel({
                usuario: usuarioId, // usa o ID no schema
                descricao,
                categoria,
                valor
            });

            const saved = await novaDespesa.save();
            return res.status(201).json({ Success: true, Data: saved });

        } catch (error) {
            return res.status(500).json({ Success: false, Error: error.message });
        }
    },

    async Put(req, res) {
        try {
            const { id } = req.params;
            const { descricao, categoria, valor } = req.body;

            const updatedDespesa = await despesaViewModel.findByIdAndUpdate(
                id,
                { descricao, categoria, valor },
                { new: true } // retorna o objeto atualizado
            );

            if (!updatedDespesa) {
                return res.json({ Success: false, Message: "Usuário não encontrado." });
            }

            return res.json({ Success: true, Data: updatedDespesa });
        } catch (error) {
            return res.json({ Success: false, Error: error.message });
        }
    },

    async Delete(req, res) {
        try {
            const { id } = req.params;

            const deletedDespesa = await despesaViewModel.findByIdAndDelete(id);

            if (!deletedDespesa) {
                return res.json({ Success: false, Message: "Usuário não encontrado." });
            }

            return res.json({ Success: true, Message: "Usuário excluído com sucesso." });
        } catch (error) {
            return res.json({ Success: false, Error: error.message });
        }
    }
}