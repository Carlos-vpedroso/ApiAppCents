const express = require('express');
const routes = express.Router();


const userController = require('../controller/userController');
const receitaController = require('../controller/receitaController');
const despesaController = require('../controller/despesaController');

//#region ROTAS DAS REQUISICOES DOS USUARIOS

routes.get('/user', userController.Get);
routes.get('/user/:email', userController.GetEmail);
routes.post('/user', userController.Post);
routes.put('/user/:id', userController.Put);
routes.delete('/user/:id', userController.Delete);

//#endregion

//#region ROTAS DAS REQUISICOES DAS RECEITAS

routes.get('/receita', receitaController.Get);
routes.get('/receita/:usuario', receitaController.GetByUsuarioId);
routes.post('/receita/:usuarioId', receitaController.Post);
routes.put('/receita/:id', receitaController.Put);
routes.delete('/receita/:id', receitaController.Delete);

//#endregion

//#region ROTAS DAS REQUISICOES DAS DESPESAS

routes.get('/despesa', despesaController.Get);
routes.get('/despesa/:usuario', despesaController.GetByUsuarioId);
routes.post('/despesa/:usuarioId', despesaController.Post);
routes.put('/despesa/:id', despesaController.Put);
routes.delete('/despesa/:id', despesaController.Delete);

//#endregion

module.exports = routes;