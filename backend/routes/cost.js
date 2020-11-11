const express = require('express');
const CostsService = require('../services/cost');

function costsApi(app) {
  const router = express.Router();
  app.use('/api/costs', router);

  const costsService = new CostsService();

  router.get('/', async function (req, res, next) {
    try {
      const costs = await costsService.getCosts();
      res.status(200).json({
        data: costs,
        message: 'costs listed',
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:typeNotice', async function (req, res, next) {
    const { typeNotice } = req.params;
    try {
      const costs = await costsService.getCost({ typeNotice });
      res.status(200).json({
        data: costs,
        message: 'costs retrieved',
      });
    } catch (err) {
      next(err);
    }
  });

  
}

module.exports = costsApi;