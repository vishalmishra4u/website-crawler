const cheerio = require('cheerio'),
    request = require('request'),
    fs = require('fs');

let website = ['https://medium.com'];

function scrapeSite(url) {
    return new Promise((resolve, reject) => {
        let urls = [];
        request(url, (err, res, body) => {
            if (err) {
              resolve([]);
            }
            if (body) {
                $ = cheerio.load(body);
                links = $('a');
                $(links).each(function (i, link) {
                    urls.push($(link).attr('href'));
                }, resolve(urls));
            } else {
                resolve(urls);
            }
        });
    });
}

class concurrentWorker{

  constructor(urls = [], concurrentCounter = 5){
    this.concurrent = concurrentCounter - 1;
    this.running = [];
    this.todoUrls = urls;
    this.complete = [];
    this.scrapedUrls = {};
  }

  get runAnotherThread(){
    return (this.running.length < this.concurrent && this.todoUrls);
  }

  function checkUrlValidity(url) {
      const urlPattern = new RegExp('^(https?:\\/\\/)?' +
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})' +
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
          '(\\?[;&a-z\\d%_.~+=-]*)?' +
          '(\\#[-a-z\\d_]*)?$', 'i');
      return urlPattern.test(url);
  }

  function checkMediumUrl(url) {
      let mediumUrl = 'medium.com';
      pattern = new RegExp(url);
      return pattern.test(url);
  }

  function scrapeUrls(){
    while(this.runAnotherThread){
      let url = this.todoUrls.shift();

      if(!this.completedUrls && this.checkUrlValidity(url) && this.checkMediumUrl(url)){
        this.completedUrls[url] = true;

        scrapeSite(url)
          .then(() => {

          })
          .catch(err => {
            console.log("Error in scraping Url ::", err);

            this.scrapeUrls();

            storeUrlsToDB(this.complete);
          });
      }


    }
  }

}

// function to Save the parsed Urls to Database.
function storeUrlsToDB(urlsArray) {

}
