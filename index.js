var _ = require("lodash")
var express = require("express")
var debug = require("debug")("SearchkitExpress")
var request = require("request")

var createSearchkitRouter = function(config) {
  var router = express.Router()
  config.queryProcessor = config.queryProcessor || _.identity
  var requestClient = request.defaults({
    pool: {
      maxSockets: config.maxSockets || 1000
    }
  });

  var elasticRequest = function(url, body){
    var fullUrl = config.host+ "/" + config.index + url;
    debug("Start Elastic Request", fullUrl)
    if(_.isObject(body)){
      debug("Request body", body)
    }
    return requestClient.post({
      url:fullUrl,
      body:body,
      json:_.isObject(body),
      forever:true
    }).on("response", function(response){
      debug("Finished Elastic Request", fullUrl, response.statusCode)
    }).on("error", function(response){
      debug("Error Elastic Request", fullUrl,response.statusCode)
    })
  }
  router.post("/_search", function(req, res){
    var queryBody = config.queryProcessor(req.body || {}, req, res)
    elasticRequest("/_search?rest_total_hits_as_int=true", queryBody).pipe(res)
  });

  return router
}

var searchkitExpress = function(config, expressApp){
  var router = createSearchkitRouter(config)
  expressApp.use("/", router)
}

searchkitExpress.createRouter = createSearchkitRouter

module.exports = searchkitExpress
