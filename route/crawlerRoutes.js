var CrawlerController = require('../controllers/crawlerController');

module.exports = function(router) {
  router.get('/startCrawling',CrawlerController.startCrawler);
  router.get('/getParsedUrls', CrawlerController.getParsedUrls);
}
