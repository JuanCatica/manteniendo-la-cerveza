const express = require('express');
const TimeService = require('../services/time');

function timeApi(app) {
  const router = express.Router();
  app.use('/api/time', router);

  const timeService = new TimeService();

  router.get('/', async function (req, res, next) {
    try {
      const time = await timeService.getTimes();
      res.status(200).json({
        data: time,
        message: 'time listed',
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:typeNotice', async function (req, res, next) {
    const { typeNotice } = req.params;
    try {
      const times = await timeService.getTime({ typeNotice });
      res.status(200).json({
        data: times,
        message: 'times retrieved',
      });
    } catch (err) {
      next(err);
    }
  });

  
}

module.exports = timeApi;