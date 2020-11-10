const cors = require("cors")
const express = require('express')
const app = express()
const { config } = require('./config')
const cost = require('./routes/cost.js');
const risk = require('./routes/risk.js');
const risk_test = require('./routes/risk_test');
const time = require('./routes/time');

const corsOpts = {
    origin: '*',
  
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE'
    ],
  
    allowedHeaders: [
      '*',
    ],
  };
  
  app.use(express.json())
  app.use(cors(corsOpts))
  
  cost(app);
  risk(app);
  risk_test(app);
  time(app);
  
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening http://localhost:${config.port}`)
  });