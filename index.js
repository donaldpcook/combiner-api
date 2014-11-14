var express = require('express'),
    gm = require('gm'),
    bodyParser = require('body-parser'),
    AWS = require('aws-sdk');

var app = express();

//cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function(req, res) {

  var combineImages = function(gm) {
    req.query.images.forEach(function(image) {
      gm.geometry(100, 100).append(image);
    }, this);

    return gm;
  };

  var image = gm();

  combineImages(image)
    .toBuffer('jpg', function(err, buffer) {
      if (!err) {
        var s3 = new AWS.S3();
        var imageName = Math.floor(Math.random() * 999999) + '.jpg';

        s3.putObject({
          Bucket: 'dc-magick',
          Key: imageName,
          Body: buffer,
          ACL: 'public-read',
          ContentType: 'image/jpeg'
        }, function(err) {
          if (!err) {
            res.send('https://s3.amazonaws.com/dc-magick/' + imageName);
          }
        });
      }
      console.log(err);
    });
});

app.listen(3001);
