const express = require('express');
const RisksService = require('../services/risk');

function risksApi(app) {
  const router = express.Router();
  app.use('/api/risks', router);

  const risksService = new RisksService();

  router.get('/', async function (req, res, next) {
    try {
      const risks = await risksService.getRisks();
      res.status(200).json({
        data: risks,
        message: 'risks listed',
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:machineId', async function (req, res, next) {
    const { machineId } = req.params;
    try {
      const risks = await risksService.getRisk({ machineId });
      res.status(200).json({
        data: risks,
        message: 'risks retrieved',
      });
    } catch (err) {
      next(err);
    }
  });

  
}

module.exports = risksApi;