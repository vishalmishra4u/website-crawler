const ParsedUrls = require('../dao/crawlerDAO');
const util = require('util');

// Function to modify Url in the form to be saved in DB.
getUrlData =  (urlsArray,callback)=>{
   let urls_arrayObject = [];
      urlsArray.map(url=>{
        let splitUrl = url.split('?');//https://medium.com?source=test => ["https://medium.com","source=test"]
        let obj = {};
        obj.url = splitUrl[0]; //"https://medium.com"
        splitUrl.shift();
        obj.parameters = splitUrl.map(urlParams=>{  // looping through all the params and spliting on "=" extracting them e.g ["source","test"]
            return urlParams.split('=')[0];
        });
        urls_arrayObject.push(obj);  // trnasformed array object of Urls
    });
    callback(null,urls_arrayObject); // After all the Urls are processed callback function
}

const parseUrls = util.promisify(getUrlData);

// Database Operations

storeUrls = async (urlsArray)=>{
    parseUrls(urlsArray)
      .then(async modifiedUrlArray => {
        for (let i = 0; i < modifiedUrlArray.length; i++) {
            let data = modifiedUrlArray[i];

            let isFoundAndUpdated = await ParsedUrls.findOne({ url: data.url })

            if (!isFoundAndUpdated) {
                let newUrl = new ParsedUrls();
                newUrl.url = data.url;
                newUrl.referenceCount = 1;
                newUrl.parameters = data.parameters;
                await newUrl.save();
            } else {
                // If it has already been created then update the existing document and save to Database.
                isFoundAndUpdated.referenceCount++;
                for (let i = 0; i < data.parameters.length; i++) {
                    //Uniquely push parameters.
                    if (isFoundAndUpdated.parameters.indexOf(data.parameters[i]) == -1) isFoundAndUpdated.parameters.push(data.parameters[i]);
                }
                new ParsedUrls(isFoundAndUpdated);
                await isFoundAndUpdated.save();
            }
        }
    });
}


module.exports = {storeUrls};
