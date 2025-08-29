const express = require('express');
const routes = express.Router();


const userController = require('../controller/userController');
const transacoesController = require('../controller/transacoesController');
const categoriasController = require('../controller/categoriasController');
const metasController = require('../controller/metasController');

//#region ROTAS DAS REQUISICOES DOS USUARIOS
routes.get('/usuario', userController.Get);
routes.post('/usuario/login', userController.PostEmail);
routes.post('/usuario/registrar', userController.Post);
routes.put('/usuario/:id', userController.Put);
routes.delete('/usuario/:id', userController.Delete);
//#endregion

//#region ROTAS DAS REQUISICOES DAS TRANSAÇÕES
routes.get('/transacao', transacoesController.GetAll);
routes.get('/transacao/usuario/:usuarioId', transacoesController.GetByUsuarioId);
routes.post('/transacao/cadastrar', transacoesController.Post);
//#endregion

//#region ROTAS DAS REQUISICOES DAS CATEGORIAS
routes.get('/categorias', categoriasController.GetAll);
routes.get('/categorias/usuario/:usuarioId', categoriasController.GetByUsuarioId);
routes.post('/categorias/cadastrar', categoriasController.Post);
//#endregion

//#region ROTAS DAS REQUISICOES DAS METAS
routes.get('/metas', metasController.GetAll);
routes.get('/metas/usuario/:usuarioId', metasController.GetByUsuarioId);
routes.post('/metas/cadastrar', metasController.Post);
//#endregion


module.exports = routes;