const mongoose = require('mongoose');

const transacaoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuarios',
        required: true
    },
    tipo: {
        type: String,
        enum: ['receita', 'despesa'],
        required: true
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categorias',
        required: true
    },
    descricao: {
        type: String
    },
    valor: {
        type: Number,
        required: true
    },
    data: {
        type: Date,
        default: Date.now,
    }
}, {
    collection: 'transacoes',
    timestamps: true
});

module.exports = transacaoSchema;
