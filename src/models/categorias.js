const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuarios', // cada usuário pode ter suas próprias categorias
        required: true
    },
    nome: {
        type: String,
        required: true,
        trim: true
    },
    tipo: {
        type: String,
        enum: ['receita', 'despesa'], // categorias podem ser de receita ou despesa
        required: true
    },
    cor: {
        type: String, // opcional, pode ser usado para UI (ex: #FF5733)
        default: '#000000',
        match: /^#([0-9A-F]{3}){1,2}$/i
    }
}, {
    collection: 'categorias',
    timestamps: true
});

module.exports = categoriaSchema;
