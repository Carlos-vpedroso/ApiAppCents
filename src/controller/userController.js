const { userViewModel, receitaViewModel, despesaViewModel } = require('../view/managerView')

module.exports =
{
    async Get(req, res) {
        try {
            const user = await userViewModel.find({});
            if (user.length === 0) {
                return res.json({ "sucesso": false, "mensagem": "There are no registered records." });
            };

            return res.json(user);
        } catch (erro) {
            return res.json({ "success": false, "erro": JSON.stringify(erro) });
        };
    },

    async GetEmail(req, res) {
        try {
            const { email } = req.params;

            if (!email) {
                return res.status(400).json({ sucesso: false, mensagem: 'Email não fornecido.' });
            }

            const user = await userViewModel.findOne({ email });

            if (!user) {
                return res.json({ sucesso: false, mensagem: 'Usuário não encontrado com este e-mail.' });
            }

            return res.json({ sucesso: true, usuario: user });
        } catch (erro) {
            return res.status(500).json({ sucesso: false, erro: erro.message });
        }
    },

    async Post(req, res) {
        try {
            const dados = req.body;

            if (!dados.email || dados.email.trim() === '') {
                return res.json({ Success: false, Message: "Campo de email não pode ser vazio." });
            }

            const useremailDatabase = await userViewModel.findOne({ email: dados.email });

            if (useremailDatabase) {
                return res.json({ Success: false, Message: "Email já cadastrado." });
            }

            const { email, senha } = dados;
            const newUser = new userViewModel({ email, senha });
            const savedUser = await newUser.save();

            return res.json({ Success: true, Data: savedUser });
        } catch (error) {
            return res.json({ "Success": false, "Error": JSON.stringify(erro) });
        };
    },

    async Put(req, res) {
        try {
            const { id } = req.params;
            const { email, senha } = req.body;

            const updatedUser = await userViewModel.findByIdAndUpdate(
                id,
                { email, senha },
                { new: true } // retorna o objeto atualizado
            );

            if (!updatedUser) {
                return res.json({ Success: false, Message: "Usuário não encontrado." });
            }

            return res.json({ Success: true, Data: updatedUser });
        } catch (error) {
            return res.json({ Success: false, Error: error.message });
        }
    },

    async Delete(req, res) {
        try {
            const { id } = req.params;

            // Verifica se o usuário existe
            const user = await userViewModel.findById(id);
            if (!user) {
                return res.json({ Success: false, Message: "Usuário não encontrado." });
            }

            // Deleta receitas vinculadas
            await receitaViewModel.deleteMany({ usuario: id });

            // Deleta despesas vinculadas
            await despesaViewModel.deleteMany({ usuario: id });

            // Deleta o usuário
            await userViewModel.findByIdAndDelete(id);

            return res.json({ Success: true, Message: "Usuário e registros vinculados excluídos com sucesso." });
        } catch (error) {
            return res.json({ Success: false, Error: error.message });
        }
    }


}