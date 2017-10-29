var express = require('express');
var router = express.Router();

var  { Pool, Client }   = require('pg');

// Get a Postgres client from the connection pool
var pool = new Pool({
	//connectionString: connectionString
	user: "imqmgjnybedxon",
	password: "5f95ca15ec9ac46554439ee8a888488c1d4d40b047fa5292eb5fe09865413ae0",
	database: "d3aucv4f9mnpes",
	port: 5432,
	host: "ec2-107-20-255-96.compute-1.amazonaws.com",
	ssl: true
	
});

//var connectionString = process.env.DATABASE_URL || 'postgres://imqmgjnybedxon:5f95ca15ec9ac46554439ee8a888488c1d4d40b047fa5292eb5fe09865413ae0@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d3aucv4f9mnpes';

var Products = require('../Models/Products');

/* GET home page. */
router.get('/', function(req, serverRes, next) {

	//Getting Tables Name
	pool.connect((err, client, done) => {
				if (err) throw err
			//T01 client.query('SELECT "table_name" FROM information_schema.tables WHERE "table_schema"=\'public\' AND "table_type"=\'BASE TABLE\'', (err, res) => {
				client.query('SELECT "table_name" FROM information_schema.tables WHERE "table_schema"=\'public\' AND "table_type"=\'BASE TABLE\' AND "table_name"=\'Products\'', (err, res) => {
				done();

				if (err) {
				  	console.log(err.stack);
				} else {
				  	console.log(res.rows[0]);
					console.log(err, res.rows[0].table_name);
					serverRes.render('index', { title: 'Xpressions Admin',tablesSection : true,dataSection : false,tables:res.rows });
				}
			})
		});
	


 	//res.render('index', { title: 'Xpressions Admin' });
});

//Get Selected Table Data
router.get('/tableData/:tableName', function(req, serverRes, next) {
	
	console.log(Products);
	Products.init();
	//Products.getCategories();
	Products.getTableHeader();
	Products.getAllProducts(serverRes);
			

});

//Adding Products
router.post('/addProducts', function(req, serverRes, next) {

	Products.insertProduct(req);


});



//Update Products
router.post('/editProduct', function(req, serverRes, next) {

	Products.updateProduct(req,function(){
			
			Products.init();
			Products.getTableHeader();
			Products.getAllProducts(serverRes);
	});

});

//Adding Products Ends
router.post('/getProductData', function(req, serverRes, next) {
	
   Products.getSelectedProduct(req,serverRes);

});


module.exports = router;
