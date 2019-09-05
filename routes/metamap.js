const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path')

const data = fs.readFileSync(path.join(__dirname, '..', 'public/data/exampleData.csv'), 'utf8');
// console.log(path.join(__dirname, '..', 'public/data/exampleData.csv'))

/* GET home page. */
router.get('/', (req, res) => {
  res.render('metamap', {data: JSON.stringify(data)});
});

module.exports = router;
