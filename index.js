var elasticsearch = require("elasticsearch")
var _ = require("lodash")
var express = require("express")

var promiseResponse = function(promiseInstance, req, res){
  promiseInstance.then(function(resp){
    res.send(resp)
  }, function(err){
    res.status(resp.status).send(err)
  })
}

var createSearchkitRouter = function(config) {
  var router = express.Router()
  config.queryProcessor = config.queryProcessor || _.identity
  var client = new elasticsearch.Client({
    host:config.host,
    log:'debug'
  });

  router.post("/_search", function(req, res){
    var queryBody = config.queryProcessor(req.body || {}, req, res)
    promiseResponse(client.search({
      index:config.index,
      body:queryBody
    }),req, res)
  });

  router.post("/_msearch", function(req, res){
    var queryBody = _.flatten(_.map(req.body, function(query){
        return [{}, config.queryProcessor(query, req, res)]
    }))
    promiseResponse(client.msearch({
      index:config.index,
      body:queryBody
    }), req, res)
  });

  return router
}

var searchkitExpress = function(config, expressApp){
  var router = createSearchkitRouter(config)
  expressApp.use("/", router)
}

searchkitExpress.createRouter = createSearchkitRouter

module.exports = searchkitExpress
