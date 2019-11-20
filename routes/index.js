var express = require('express');
var fs = require("fast-csv");
var router = express.Router();
var mongoose = require('mongoose');

const csv=require('csvtojson')


// Schema for csv files
const csvSchema = new mongoose.Schema({
  name: String,
  data: [],
});
// Model for csv mongo objs
const Csv = mongoose.model('Csv', csvSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('../public/index.html');
});

/* Get list of uploaded csvs*/
router.get('/csvs', function(req, res, next){
  Csv.find({}, function(err, csvs) {
    var csvNames = [];
    csvs.forEach(function(csv) {
      csvNames.push(csv.name);
    });
    res.send(csvNames);
  });
});

/* Get csv data by name*/
router.get('/csvs/:name', function(req, res, next){
  name = req.params.name;
  Csv.find({ name: name }, function(err, csvs) {
    console.log(csvs.length);
    console.log(csvs.length > 0);
    console.log(csvs);
    if (csvs.length > 0) {
      console.log("Yp");
      console.log(csvs[0].data);
      res.send(csvs[0].data);
    }
    else {
      console.log("Noe");
      res.send([]);
    }
  });
});

/* Upload csv file */
router.post('/upload', function(req, res, next) {
  console.log(req.body.file.toString());
  console.log(req.body.name);

  csv()
        .fromString(req.body.file.toString())
        .then( (json) => {
            console.log(json);
            csvObj = new Csv({name: req.body.name, data: json});
            csvObj.save(function (err) {
              if (err) {
                console.log(err);
              };
              // saved!
            });
        });


  res.json({ file: 'Uploaded file'});
});

module.exports = router;
