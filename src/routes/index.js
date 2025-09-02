const express = require('express');
const routes = express.Router();


const userController = require('../controller/userController');
const transacoesController = require('../controller/transacoesController');
const categoriasController = require('../controller/categoriasController');
const metasController = require('../controller/metasController');

//#region ROTAS DAS REQUISICOES DOS USUARIOS
routes.get('/usuario', userController.Get);
routes.get('/usuario/:id', userController.GetById);
routes.post('/usuario/login', userController.PostEmail);
routes.post('/usuario/registrar', userController.Post);
routes.post('/usuario/refreshToken', userController.RefreshToken);
routes.put('/usuario/:id', userController.Put);
routes.put('/usuario/addfoto/:id', userController.UploadFoto);
routes.delete('/usuario/:id', userController.Delete);
//#endregion

//#region ROTAS DAS REQUISICOES DAS TRANSAÇÕES
routes.get('/transacao', transacoesController.GetAll);
routes.get('/transacao/usuario/:usuarioId', transacoesController.GetByUsuarioId);
routes.get('/transacao/recentes/:usuarioId', transacoesController.GetUltimasTransacoes);
routes.get('/transacao/receitas/despesas/:usuarioId', transacoesController.GetResumoMesAtual);
routes.get('/transacao/despesas/categoria/:usuarioId', transacoesController.GetDespesasPorCategoria);
routes.get('/transacao/despesas/assinatura/:usuarioId', transacoesController.GetAssinaturas);
routes.get('/transacao/6meses/:usuarioId', transacoesController.GetResumo6Meses);
routes.post('/transacao/cadastrar', transacoesController.Post);
routes.put('/transacao/editar/:id', transacoesController.Put);
routes.delete('/transacao/deletar/:id', transacoesController.Delete);

//#endregion

//#region ROTAS DAS REQUISICOES DAS CATEGORIAS
routes.get('/categorias', categoriasController.GetAll);
routes.get('/categorias/usuario/:usuarioId', categoriasController.GetByUsuarioId);
routes.post('/categorias/cadastrar', categoriasController.Post);
routes.put('/categorias/editar/:id', categoriasController.Put);
routes.delete('/categorias/deletar/:id', categoriasController.Delete);
//#endregion

//#region ROTAS DAS REQUISICOES DAS METAS
routes.get('/metas', metasController.GetAll);
routes.get('/metas/usuario/:usuarioId', metasController.GetByUsuarioId);
routes.post('/metas/cadastrar', metasController.Post);
routes.put('/metas/editar/:id', metasController.Put);
routes.delete('/metas/deletar/:id', metasController.Delete);
//#endregion


module.exports = routes;