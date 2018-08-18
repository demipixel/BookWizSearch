const express = require('express');
const fs = require('fs');
const Vision = require('@google-cloud/vision');
const fileUpload = require('express-fileupload');
const path = require('path');
const request = require('request');


const app = express();

const vision = new Vision.ImageAnnotatorClient();

// vision.textDetection({ })

app.set('views', __dirname + '/views');
app.use(fileUpload());
app.engine('html', require('ejs').renderFile);
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

const BOOK_SOURCES = [JSON.parse(fs.readFileSync('./bookwiz.json'))];



app.get('/', (req, res) => {
  res.render('index.ejs', {
    book_sources: BOOK_SOURCES
  });
});

app.post('/image', asyncMiddleware(async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).send('No image file uploaded.');
  }

  vision.textDetection({
    image: {
      content: req.files.image.data
    }
  }).then(resp => {
    // console.log(resp);
    // const annotations = resp[0].textAnnotations;
    // console.log(annotations);
    /*annotations.forEach(text_bit => {
      console.log(text_bit.description, text_bit.score, text_bit.locations);
    });*/
    let foundIsbn = null;
    resp[0].fullTextAnnotation.text.split('\n').forEach(line => {
      console.log(line, line.toLowerCase().startsWith('isbn'));
      if (line.toLowerCase().startsWith('isbn')) {
        foundIsbn = line.toLowerCase().replace('isbn-10', '').replace('isbn-13', '').replace(/[^0-9X]/g, '').toUpperCase();
      }
    });
    console.log(foundIsbn, resp[0].fullTextAnnotation);
    if (!foundIsbn) return res.send(resp[0].fullTextAnnotation.text);

    console.log('Found ISBN:', foundIsbn);

    request('https://www.abebooks.com/servlet/SearchResults?ds=1&isbn='+foundIsbn, (err, http, body) => {
      const match = body.match(/<meta itemprop="name" content="([^"]+)" \/>/);
      if (!match) res.status(400).send('No book found for that ISBN');
      else {
        console.log('Book name', match[1]);
        res.send(match[1]+'\n'+match[1].replace(/\([^)]+\)/g, '').trim());
      }
    });
  }).catch(err => {
    console.error(err);
    res.status(400).send('Error detecting text');
  })
}));

app.listen(3000, () => {
  console.log('Server live');
});