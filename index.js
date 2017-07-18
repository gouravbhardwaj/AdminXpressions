var express = require('express');
var app = express();
var cloudinary = require('cloudinary');
var pg = require('pg');
var port = process.env.PORT || 8080;
var bodyParser = require('body-parser');

pg.defaults.ssl = true;

cloudinary.config({ 
  cloud_name: 'hrmqah2hd', 
  api_key: '595616719544321', 
  api_secret: 'hxdXfpQSRcUlIechhkY944IAVBM' 
});


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));



// set the home page route
app.get('/', function(req, res) {
	// ejs render automatically looks in the views folder
    res.render('public/index');
});

// get products lists
app.get('/productList', function(req, res) {
	// ejs render automatically looks in the views folder
		products = getProductsList(req, res);
		
});

// get products lists
app.get('/categoriesList', function(req, res) {
	// ejs render automatically looks in the views folder
		categories = getCategoriesList(req, res);
		
});

// get category details and related products
app.post('/categoryDetails', function(req, res) {
	// ejs render automatically looks in the views folder
		getCategoryDetails(req, res);
		
});

// get category details
app.post('/productDetails', function(req, res) {
	// ejs render automatically looks in the views folder
		getProductDetails(req, res);
		
});


app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});

var getProductDetails = function(req,res){
	pg.connect('postgres://imqmgjnybedxon:5f95ca15ec9ac46554439ee8a888488c1d4d40b047fa5292eb5fe09865413ae0@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d3aucv4f9mnpes', function(err, client) {
	if (err) throw err;
	//console.log('Connected to postgres! Getting schemas...');
    var queryString = 'SELECT "ProductId","ProductDescription","SKU","UnitsInStock","CategoryId","ProductName","UnitPrice","Picture","Featured","Latest" FROM "Products" WHERE "CategoryId"='+req.body.catId+' LIMIT 50';
	
	//console.log('string : '+queryString);
	client.query(queryString,
	
	 function(err, result) {
		 console.log(result);
                if (err) {
                    console.log(err);
                } else {
                    ///console.log(result);
					var productsArray = {
						product:{},
						relatedProducts:[]
					}
					
					for(var i=0;i < result.rows.length; i++){
						result.rows[i].Picture = cloudinary.image(result.rows[i].Picture);
						
						if(result.rows[i].ProductId==req.body.pId){
							productsArray.product = result.rows[i];
						}else{
							productsArray.relatedProducts.push(result.rows[i]);
						}
					}
					
					res.send(productsArray);
                }

            });
	
	});//pg.connect
	
}

//DB Code - move to another class
var getCategoriesList = function(req,res){
	
	pg.connect('postgres://imqmgjnybedxon:5f95ca15ec9ac46554439ee8a888488c1d4d40b047fa5292eb5fe09865413ae0@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d3aucv4f9mnpes', function(err, client) {
	if (err) throw err;
	console.log('Connected to postgres! Getting schemas...');

	client.query('SELECT "CategoryName","CategoryId","Picture" FROM "Category" WHERE "Active"=true LIMIT 50',
	
	 function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    ///console.log(result);
					var categoryArray = new Array();
					for(var i=0;i < result.rows.length; i++){
						 result.rows[i].Picture = cloudinary.image(result.rows[i].Picture);
						 categoryArray.push(result.rows[i]);
					}
					
					res.send(categoryArray);
                }

            });
	
	});//pg.connect
	
}

var getCategoryDetails = function(req,res){
	console.log('### res body : '+req.body.catId);
	
	pg.connect('postgres://imqmgjnybedxon:5f95ca15ec9ac46554439ee8a888488c1d4d40b047fa5292eb5fe09865413ae0@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d3aucv4f9mnpes', function(err, client) {
	if (err) throw err;
	console.log('Connected to postgres! Getting schemas...');
    var pgQuery = 'SELECT "ProductId","CategoryId","ProductName","UnitPrice","Picture","Featured","Latest" FROM "Products" WHERE "CategoryId"='+req.body.catId+' LIMIT 50';
	client.query(pgQuery,
	
	 function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    ///console.log(result);
					var productArray = new Array();
					for(var i=0;i < result.rows.length; i++){
						 result.rows[i].Picture = cloudinary.image(result.rows[i].Picture);
						 productArray.push(result.rows[i]);
					}
					
					res.send(productArray);
                }

            });
	
	});//pg.connect
	
}

var getProductsList = function(req,res){
	
	pg.connect('postgres://imqmgjnybedxon:5f95ca15ec9ac46554439ee8a888488c1d4d40b047fa5292eb5fe09865413ae0@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d3aucv4f9mnpes', function(err, client) {
	if (err) throw err;
	console.log('Connected to postgres! Getting schemas...');

	client.query('SELECT "ProductId","CategoryId","ProductName","UnitPrice","Picture","Featured","Latest" FROM "Products" LIMIT 50',
	
	 function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    ///console.log(result);
					var productArray = new Array();
					for(var i=0;i < result.rows.length; i++){
						 result.rows[i].Picture = cloudinary.image(result.rows[i].Picture);
						 productArray.push(result.rows[i]);
					}
					
					res.send(productArray);
                }

            });
	
	});//pg.connect
}