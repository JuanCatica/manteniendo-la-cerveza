const express = require('express');
const RiskTestService = require('../services/riskTest');

function risksTestApi(app) {
  const router = express.Router();
  app.use('/api/risks_test', router);

  const risksTestService = new RiskTestService();

  router.get('/', async function (req, res, next) {
    try {
      const risks = await risksTestService.getRisksTest();
      res.status(200).json({
        data: risks,
        message: 'risks_tests listed',
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:machineId', async function (req, res, next) {
    const { machineId } = req.params;
    try {
      const risks = await risksService.getRiskTest({ machineId });
      res.status(200).json({
        data: risks,
        message: 'risks_test retrieved',
      });
    } catch (err) {
      next(err);
    }
  });

  
}

module.exports = risksTestApi;