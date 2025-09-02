const mongoose = require('mongoose');

const metaSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuarios', 
        required: true
    },
    titulo: {
        type: String,
        required: true
    },
    valorObjetivo: {
        type: Number,
        required: true
    },
    valorAtual: {
        type: Number,
        default: 0
    },
    dataLimite: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['em_andamento', 'atingida', 'nao_atingida'],
        default: 'em_andamento'
    }
}, {
    collection: 'metas',
    timestamps: true
});

module.exports = metaSchema;
