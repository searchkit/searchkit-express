### Searchkit Express
A thin library to create an express to elasticsearch proxy to support the searchkit ui framework

```sh
npm install searchkit-express --save
```

```js
SearchkitExpress = require("searchkit-express")
```

#### Add _search, _msearch endpoints to root url
if you just want to create a proxy to the root express url then use the `SearchkitExpress` function directly like this
```js
var app = express()
//...

SearchkitExpress({
  host:process.env.ELASTIC_URL || "http://localhost:9200",  
  index:'movies',
  queryProcessor:function(query, req, res){
    //do neccessery permissions, prefilters to query object
    //then return it
    return query
  }
 }, app)

```
then in your Clientside UI code
```js
const searchkit = new SearchkitManager("/")
```


#### Alternative express router
If you wish to get hold of an `express.Router` instance so you can configure the suburl and add specific express middleware; use as follows

```js
var app = express()

//...

var searchkitRouter = SearchkitExpress.createRouter({
  host:process.env.ELASTIC_URL || "http://localhost:9200",  
  index:'movies',
  queryProcessor:function(query, req, res){
    console.log(query)    
    return query
  }
 })
app.use("/movie-search", searchkitRouter)
```
then in your Clientside UI code
```js
const searchkit = new SearchkitManager("/movies-search")
```

#### Debugging
To enable debugging, enable debugging by setting environment variable when starting your server.
```sh
DEBUG=SearchkitExpress node server.js
```
