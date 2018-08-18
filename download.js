const request = require('request');
const fs = require('fs');

function LINK(start=0) {
  return `https://www.scholastic.com/bin/scholastic/teachers/tchsearch?isBookWizard=true&pagePath=%2Fteachers%2Fbookwizard%2F&prefilter=books&rows=10000&start=${start}`;
}

const BOOKS = [];

function run(i=0) {
  console.log(`Downloading from ${i*10000}`);
  if (i*10000 > 65305) return done();
  request(LINK(i*10000), (err, http, body) => {
    const data = JSON.parse(body);
    data.solrDocumentList.forEach(book => {
      BOOKS.push({
        name: book.workTitle_s || book.title_s,
        image: book.imageLinks_ss && book.imageLinks_ss[1],
        level: book.English_Guided_Reading_Level_s
      });
    });
    run(i+1);
  });
}

function done() {
  fs.writeFileSync('./bookwiz.json', JSON.stringify(BOOKS));
  console.log('Done!');
}

run();