var express = require('express');
var router = express.Router();

var  { Pool, Client }   = require('pg');

var cloudinary = require('cloudinary');


cloudinary.config({ 
  cloud_name: 'hrmqah2hd', 
  api_key: '595616719544321', 
  api_secret: 'hxdXfpQSRcUlIechhkY944IAVBM' 
});

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


var connectionString = process.env.DATABASE_URL || 'postgres://imqmgjnybedxon:5f95ca15ec9ac46554439ee8a888488c1d4d40b047fa5292eb5fe09865413ae0@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d3aucv4f9mnpes';

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
	console.log('Table Name : '+req.params.tableName);
	
	pool.connect((err, client, done) => {
	if (err) throw err
		client.query('SELECT * FROM information_schema.columns WHERE "table_schema" = \'public\' AND table_name   = \''+req.params.tableName+'\'', (err, res) => {
			done()
			

			if (err) {
			  console.log('Error : '+err.stack)
			  return serverRes.send({status:'fail',message:err});
			} else {

				if(res.rows.length>0){
					//console.log(res.rows[0])
					CreateTableStructure.init();
					CreateTableStructure.getCategories();
					CreateTableStructure.getTableHeader(res.rows);
					CreateTableStructure.getTableData(req.params.tableName,serverRes);
					
				}else{
					return serverRes.send({status:'fail',message:'No Data to Return'});
				}

			}
		})
	})//pool.connect

});


var CreateTableStructure = {
  tableHeaders:[],
  tableData:[],
  categories:[],
  init : function(){
  	this.tableHeaders=[];
  	this.tableData=[];
  },
  getCategories : function(){
		pool.connect((err, client, done) => {
		if (err) throw err
		client.query('SELECT "CategoryId","CategoryName" FROM "Category" Limit 100', (err, res) => {
		done()


		if (err) {
		  console.log('Error : '+err.stack)
		  
		} else {
			console.log(res);
			if(res.rows.length>0){
				//console.log(res.rows[0])
				
				CreateTableStructure.categories=res.rows;
				
				
			}

		}
		})
		})//pool.connect
  },
  getTableHeader: function(headerDetails){
  	 	console.log('Inside getTableHeader : ')
	  	headerDetails.forEach(function(value,index){
	  		console.log('###columns : '+value.column_name);
			//CreateTableStructure.tableHeaders.push({ "title":value.column_name}); t01
	  	});

	  	CreateTableStructure.tableHeaders.push({ "title":"Picture"});
	  	CreateTableStructure.tableHeaders.push({ "title":"ProductName"});
	  	CreateTableStructure.tableHeaders.push({ "title":"UnitsInStock"});
	  	CreateTableStructure.tableHeaders.push({ "title":"CostPrice"});
	  	CreateTableStructure.tableHeaders.push({ "title":"UnitPrice"});
	  	CreateTableStructure.tableHeaders.push({ "title":"Discount"});
	  	CreateTableStructure.tableHeaders.push({ "title":"UnitsOnOrder"});
	  	CreateTableStructure.tableHeaders.push({ "title":"CategoryName"});
	
  },

  getTableData: function(tableName,serverRes){
	console.log('Inside getTableData : ')

	pool.connect((err, client, done) => {
	if (err) throw err

		console.log(CreateTableStructure.tableHeaders);

		//client.query('SELECT * FROM "'+tableName+'"', (err, res) => { T01
			client.query('SELECT p."Picture",p."ProductName",p."UnitsInStock",p."CostPrice", p."UnitPrice", p."Discount",p."UnitsOnOrder",c."CategoryName" FROM "Products" p,"Category" c WHERE c."CategoryId" = p."CategoryId" ', (err, res) => {
			done()
			
			if (err) {
			  console.log('Error : '+err.stack)
			  return serverRes.send({status:'fail',message:err});
			} else {
			  
			  if(res.rows.length>0){
			  	var tableRow=[];

			  	console.log(res.rows[0]);

			  	res.rows.forEach(function(value){
			  	 tableRow=[];	
					for (var key in value) {
						// check if the property/key is defined in the object itself, not in parent


						if (value.hasOwnProperty(key)) { 

							if(key.indexOf('Image')>=0 || key.indexOf('Picture')>=0){

								console.log('image')
								tableRow.push(cloudinary.image(value[key])); 
							}else{
								tableRow.push(value[key]);   
							}

							console.log('key : '+key+' cell values : '+value[key]);
							      
							
						}
					}

					CreateTableStructure.tableData.push(tableRow);
			  	});

			  	
			  	return serverRes.send({status:'success',category:CreateTableStructure.categories ,columns: CreateTableStructure.tableHeaders,data:CreateTableStructure.tableData});

			  }else{
			  	return serverRes.send({status:'fail',message:'No Data to Return'});
			  }
			  
			}
		})
	})//pool.connect

  }

}

module.exports = router;
