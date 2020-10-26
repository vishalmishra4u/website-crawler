# medium.com-crawler

A Node.js and express app to crawl medium.com,  harvest all
possible hyperlinks that belong to medium.com and store them in mongodb.

```
I have pushed config file also with my mongodb connection string uri at mlab.
```

## Installation

#### Step 1: Download the project from github.
#### Step 2: Npm install
#### Step 3: Node index.js

## APIs
```
localhost:8000/api/v1/startCrawling
```
Above API will start the crawling process when being run locally.

```
localhost:8000/api/v1/getParsedUrls
```
This API will give the parsed URLs

### Docker
Project can also be dockerized with the help of Dockerfile present.

P.S: I Havent still tested the docker script.
