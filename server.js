const express = require('express');
const router = require('./routes/index');

const app = express();

app.listen(process.env.PORT || 5000, () => {
  console.log('Listening');
});

app.use(express.json());

app.use('/', router);
