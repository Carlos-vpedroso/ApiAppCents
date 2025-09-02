const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cloudinary = require('../cloudinary/index')
const { userViewModel, categoriasViewModel, transacoesViewModel, metasViewModel } = require('../view/managerView');


const Get = async (req, res) => {
    try {
        const user = await userViewModel.find({});
        if (user.length === 0) {
            return res.json({ Success: false, Message: "There are no registered records." });
        };

        return res.json(user);
    } catch (erro) {
        return res.json({ Success: false, Error: erro.message });
    };
};

const GetById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ Success: false, Message: "ID do usuário é obrigatório." });
        }

        const user = await userViewModel.findById(id, 'nome email foto');

        if (!user) {
            return res.status(404).json({ Success: false, Message: "Usuário não encontrado." });
        }

        return res.json({ Success: true, Data: user });
    } catch (error) {
        return res.status(500).json({ Success: false, Error: error.message });
    }
};

const Post = async (req, res) => {
    try {
        const dados = req.body;

        if (!dados.email || dados.email.trim() === '') {
            return res.json({ Success: false, Message: "Campo de email não pode ser vazio." });
        }

        const useremailDatabase = await userViewModel.findOne({ email: dados.email });
        if (useremailDatabase) {
            return res.json({ Success: false, Message: "Email já cadastrado." });
        }

        const { nome, email, senha } = dados;

        // 🔑 Criptografar senha antes de salvar
        const hashedPassword = await bcrypt.hash(senha, 10);

        const newUser = new userViewModel({ nome, email, senha: hashedPassword });
        const savedUser = await newUser.save();

        // --- Criar categorias padrão ---
        const categoriasPadrao = [
            { nome: "Alimentação", tipo: "despesa", cor: "#FF5733", usuario: savedUser._id },
            { nome: "Transporte", tipo: "despesa", cor: "#33C3FF", usuario: savedUser._id },
            { nome: "Moradia", tipo: "despesa", cor: "#8E44AD", usuario: savedUser._id },
            { nome: "Saúde", tipo: "despesa", cor: "#E74C3C", usuario: savedUser._id },
            { nome: "Educação", tipo: "despesa", cor: "#3498DB", usuario: savedUser._id },
            { nome: "Lazer", tipo: "despesa", cor: "#F39C12", usuario: savedUser._id },
            { nome: "Compras", tipo: "despesa", cor: "#2ECC71", usuario: savedUser._id },
            { nome: "Impostos", tipo: "despesa", cor: "#95A5A6", usuario: savedUser._id },
            { nome: "Assinatura", tipo: "despesa", cor: "#1DA1F2", usuario: savedUser._id },
            { nome: "Salário", tipo: "receita", cor: "#28A745", usuario: savedUser._id },
            { nome: "Investimentos", tipo: "receita", cor: "#FFD700", usuario: savedUser._id },
            { nome: "Freelance", tipo: "receita", cor: "#20C997", usuario: savedUser._id },
            { nome: "Aluguel", tipo: "receita", cor: "#17A2B8", usuario: savedUser._id },
            { nome: "Prêmios", tipo: "receita", cor: "#FF9800", usuario: savedUser._id },
            { nome: "Vendas", tipo: "receita", cor: "#9C27B0", usuario: savedUser._id },
            { nome: "Reembolsos", tipo: "receita", cor: "#6C757D", usuario: savedUser._id },
            { nome: "Outros", tipo: "receita", cor: "#00BCD4", usuario: savedUser._id }
        ];

        await categoriasViewModel.insertMany(categoriasPadrao);

        return res.json({ Success: true, Data: savedUser });
    } catch (error) {
        return res.json({ Success: false, Error: error.message });
    }
};

const Put = async (req, res) => {
    try {
        const { id } = req.params;
        let { nome, email, senha } = req.body;

        // Se senha foi enviada, criptografa novamente
        if (senha) {
            senha = await bcrypt.hash(senha, 10);
        }

        const updatedUser = await userViewModel.findByIdAndUpdate(
            id,
            { nome, email, senha },
            { new: true }
        );

        if (!updatedUser) {
            return res.json({ Success: false, Message: "Usuário não encontrado." });
        }

        return res.json({ Success: true, Data: updatedUser });
    } catch (error) {
        return res.json({ Success: false, Error: error.message });
    }
};

const Delete = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userViewModel.findById(id);
        if (!user) {
            return res.json({ Success: false, Message: "Usuário não encontrado." });
        }

        await categoriasViewModel.deleteMany({ usuario: id });
        await transacoesViewModel.deleteMany({ usuario: id });
        await metasViewModel.deleteMany({ usuario: id });
        await userViewModel.findByIdAndDelete(id);

        return res.json({ Success: true, Message: "Usuário e registros vinculados excluídos com sucesso." });
    } catch (error) {
        return res.json({ Success: false, Error: error.message });
    }
};

const PostEmail = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ Success: false, Message: "Email e senha são obrigatórios." });
        }

        const user = await userViewModel.findOne({ email });
        if (!user) return res.status(404).json({ Success: false, Message: "Usuário não encontrado." });

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) return res.status(401).json({ Success: false, Message: "Senha incorreta." });

        // 🔑 Access token curto
        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" } // 15 minutos
        );

        // 🔑 Refresh token longo
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "30d" } // 30 dias
        );

        return res.json({
            Success: true,
            Message: "Login realizado com sucesso.",
            AccessToken: accessToken,
            RefreshToken: refreshToken,
            User: { id: user._id, email: user.email }
        });

    } catch (error) {
        return res.status(500).json({ Success: false, Error: error.message });
    }
};

const RefreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ Success: false, Message: "Refresh token não fornecido." });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const newAccessToken = jwt.sign(
            { id: decoded.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const newRefreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "30d" } // 30 dias
        );

        return res.json({
            Success: true,
            Message: "Access token renovado com sucesso.",
            AccessToken: newAccessToken,
            UserId: decoded.id,
            newRefreshToken
        });
    } catch (err) {
        return res.status(403).json({ Success: false, Message: "Refresh token inválido ou expirado." });
    }
};

const UploadFoto = async (req, res) => {
    try {
        const { id } = req.params;
        const { foto } = req.body;

        if (!foto) {
            return res.status(400).json({ Success: false, Message: "Nenhuma foto enviada." });
        }

        const result = await cloudinary.uploader.upload(foto, {
            folder: "usuarios",
            public_id: `user_${id}`,
            overwrite: true,
        });

        const user = await userViewModel.findByIdAndUpdate(
            id,
            { foto: result.secure_url },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ Success: false, Message: "Usuário não encontrado." });
        }

        res.json({
            Success: true,
            Message: "Foto atualizada com sucesso!",
            Data: user,
        });
    } catch (error) {
        console.error("Erro upload Cloudinary:", error);
        res.status(500).json({ Success: false, Error: error.message });
    }
};


module.exports = {
    Get,
    GetById,
    Post,
    Put,
    Delete,
    PostEmail,
    RefreshToken,
    UploadFoto,
};
