var express = require('express'),
    gm = require('gm'),
    imageMagick = gm.subClass({ imageMagick: true }),
    bodyParser = require('body-parser'),
    AWS = require('aws-sdk');

var app = express();

var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET;

//cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function(req, res) {

  var combineImages = function(gm) {
    if (!req.query.images) { return gm; }
    console.log('here:' + req.query.images);
    req.query.images.forEach(function(image) {
      gm.geometry(100, 100).append(image);
    }, this);

    return gm;
  };

  var image = imageMagick();

  combineImages(image)
    .toBuffer('jpg', function(err, buffer) {
      if (!err) {
        aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
        var s3 = new AWS.S3();
        var imageName = Math.floor(Math.random() * 999999) + '.jpg';

        s3.putObject({
          Bucket: S3_BUCKET,
          Key: imageName,
          Body: buffer,
          ACL: 'public-read',
          ContentType: 'image/jpeg'
        }, function(err) {
          if (!err) {
            res.send('https://s3.amazonaws.com/' + S3_BUCKET + '/' + imageName);
          } else {
            console.log(err);
          }
        });
      }
    });
});

app.listen(process.env.PORT || 5000);
