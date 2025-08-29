const mongoose = require('mongoose');
const userModel = require('../models/user');
const transacoesModel = require('../models/transacoes');
const metasModel = require('../models/metas');
const categoriasModel = require('../models/categorias');

const userViewModel = mongoose.model('usuarios', userModel);
const transacoesViewModel = mongoose.model('transacoes', transacoesModel);
const metasViewModel = mongoose.model('metas', metasModel);
const categoriasViewModel = mongoose.model('categorias', categoriasModel);


module.exports = {
    userViewModel,
    transacoesViewModel,
    metasViewModel,
    categoriasViewModel
};