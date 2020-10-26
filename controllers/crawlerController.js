const cheerio = require('cheerio'),
    request = require('request'),
    fs = require('fs');

let websites = ['https://medium.com'];

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

  checkUrlValidity(url) {
      const urlPattern = new RegExp('^(https?:\\/\\/)?' +
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})' +
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
          '(\\?[;&a-z\\d%_.~+=-]*)?' +
          '(\\#[-a-z\\d_]*)?$', 'i');
      return urlPattern.test(url);
  }

  checkMediumUrl(url) {
      let mediumUrl = 'medium.com';
      let pattern = new RegExp(url);
      return pattern.test(url);
  }

  removeDuplicateUrls(taskUrls, scrapedUrlsObject, callback) {
      return new Promise(async (resolve, reject) => {
          let updatedUrls = []
          updatedUrls = taskUrls.filter(url => {
              let u = url;
              if (scrapedUrlsObject[u] != true && this.checkIfUrlIsValid(url)) { return true; }
              return false;
          })
          resolve(updatedUrls);
      });
  }

  scrapeUrls(){
    while(this.runAnotherThread){
      let url = this.todoUrls.shift();

      if(!this.scrapedUrls[url] && this.checkUrlValidity(url) && this.checkMediumUrl(url)){
        // process.exit();
        this.scrapedUrls[url] = true;

        scrapeSite(url)
          .then((taskUrls) => {

            process.exit();
            if (taskUrls.length > 0) {
                this.removeDuplicateUrls(taskUrls, this.scrapedUrls).then(uniqueUrls => {
                    this.todo = [...this.todoUrls, ...uniqueUrls]
                    this.complete.push(this.running.shift());

                    // If schedule queue is empty or completed task has reached to 50 Save them to DB.
                    if (this.todo.length == 0 || this.complete.length == 50) {
                        storeUrlsToDB(this.complete)
                        this.complete.length = 0;
                    }
                    this.recursiveSolution(); //call recursive function for another url to crawl.
                }).catch(err => {
                    storeUrlsToDB(this.complete);
                })

            } else {
                this.todo = [...this.todo, ...taskUrls];
                this.complete.push(this.running.shift()); // Push to the complete array.

                if (this.todo.length == 0 || this.complete.length == 50) {
                    storeUrlsToDB(this.complete)
                    this.complete.length = 0;
                }
                this.recursiveSolution(); // Calling Resursive Function.
            }
          })
          .catch(err => {
            console.log("Error in scraping Url ::", err);

            this.scrapeUrls();

            storeUrlsToDB(this.complete);
          });

          this.running.push(url);
      }
    }
  }
}

var startCrawling = new concurrentWorker(websites, 1);

getParsedUrls = async (req,res)=>{
    try {
        let parsedUrls = await ParsedUrls.find({});
        if(parsedUrls && parsedUrls.length>0){
            res.send({
                success: true,
                NoOfUniqueUrls: parsedUrls.length || 0,
                parsedUrls: parsedUrls
            });
        }else{
            res.send({
                success: true,
                parsedUrls: 'No urls have been parsed Yet!!'
            });
        }

    } catch (error) {
        res.send({
            success:false,
            msg:error
        });
    }
}

// function to Save the parsed Urls to Database.
function storeUrlsToDB(urlsArray) {
  storeUrlsToDB.storeUrls(urlsArray);
}

function startCrawler(req, res) {
  console.log("API called");
    startCrawling.scrapeUrls();
    res.json({
        msg: 'Scraping initiated. To get the scraped URLs, try this route ::getParsedUrls'
    });
}

module.exports = {startCrawler, getParsedUrls};
