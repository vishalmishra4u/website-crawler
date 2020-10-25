"use strict";

const mongoose = require('mongoose');
const CrawlerUrl = require('../models/crawlerUrl');

module.exports = mongoose.model('CrawlerUrls', CrawlerUrl);
