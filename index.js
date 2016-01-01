var elasticsearch = require("elasticsearch")
var _ = require("lodash")
var express = require("express")
var debug = require("debug")("SearchkitExpress")
var request = require("request")

var createSearchkitRouter = function(config) {
  var router = express.Router()
  config.queryProcessor = config.queryProcessor || _.identity
  var elasticRequest = function(url, body){
    var fullUrl = config.host+ "/" + config.index + url;
    debug("Start Elastic Request", fullUrl)
    if(_.isObject(body)){
      debug("Request body", body)
    }
    return request.post({
      url:fullUrl,
      body:body,
      json:_.isObject(body)
    }).on("response", function(response){
      debug("Finished Elastic Request", fullUrl, response.statusCode)
    }).on("error", function(response){
      debug("Error Elastic Request", fullUrl,response.statusCode)
    })
  }
  router.post("/_search", function(req, res){
    var queryBody = config.queryProcessor(req.body || {}, req, res)
    elasticRequest("/_search", queryBody).pipe(res)
  });

  router.post("/_msearch", function(req, res){
    var queryBody = _.flatten(_.map(req.body, function(query){
        return ['{}', JSON.stringify(config.queryProcessor(query, req, res))]
    })).join("\n")
    elasticRequest("/_msearch", queryBody).pipe(res)
  });

  return router
}

var searchkitExpress = function(config, expressApp){
  var router = createSearchkitRouter(config)
  expressApp.use("/", router)
}

searchkitExpress.createRouter = createSearchkitRouter

module.exports = searchkitExpress
