var express = require('express');
var router = express.Router();

var  { Pool, Client }   = require('pg');

var cloudinary = require('cloudinary');
var Products = require('../javascript/Products');



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

//Adding Products
router.post('/addProducts', function(req, serverRes, next) {

pool.connect((err, client, done) => {
if (err) throw err
	
	client.query('INSERT into "Products" ("Picture", "ProductName", "UnitsInStock", "CostPrice","UnitPrice","Discount","CategoryId","ProductAvailable","DiscountAvailable","Featured","Latest","Material") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING "ProductId"', 
	[req.body.productImage,
	req.body.productName,
	Number(req.body.unitsInStock),
	Number(req.body.costPrice),
	Number(req.body.unitPrice),
	Number(req.body.discount),
	req.body.category,
	(req.body.productAvailable == 'on')?true:false,
	(req.body.discountAvailable == 'on')?true:false,
	(req.body.featured == 'on')?true:false,
	(req.body.latest == 'on')?true:false,
	req.body.material], 


	function(err, result) {
		    if (err) {
		        console.log(err);
		    } else {
		        console.log('row inserted with id: ' + result.rows[0].ProductId);
		    }

		  done();
	});//client.query 
	
});


});

var dataSanity = function(data,dataType){
		switch(dataType){
           case 'integer':
           		console.log(data);
				return Number( (data == undefined || data == '') ? 0 : data );
           break;

           case 'boolean':
	           	console.log(data);
	           	return (data=='off' || data==undefined || data=='') ? false : true;
           break;

            case 'string':
	           	console.log(data);
	           	return ( data==undefined || data=='') ? '' : data;
           break;

		}
}

//Update Products
router.post('/editProduct', function(req, serverRes, next) {

pool.connect((err, client, done) => {
if (err) throw err



client.query(
'UPDATE "Products" SET "Picture" =($1) , "ProductName"=($2) ,"UnitsInStock" =($3) , "CostPrice"=($4) ,"UnitPrice"=($5) ,"Discount"=($6),"CategoryId"=($7) ,"ProductAvailable"=($8) ,"DiscountAvailable"=($9) ,"Featured"=($10)' 
+',"Latest"=($11) ,"Material"=($12) WHERE "ProductId"=\''+req.body.productId+'\'',
 [
  dataSanity(req.body.productImage,'string')
 ,dataSanity(req.body.productName,'string')
 ,dataSanity(req.body.unitsInStock,'integer')
 ,dataSanity(req.body.costPrice,'integer')
 ,dataSanity(req.body.unitPrice,'integer')
 ,dataSanity(req.body.discount,'integer')
 ,dataSanity(req.body.category,'string')
 ,dataSanity(req.body.productAvailable,'boolean')
 ,dataSanity(req.body.discountAvailable,'boolean')
 ,dataSanity(req.body.featured,'boolean')
 ,dataSanity(req.body.latest,'boolean')
 ,dataSanity(req.body.material,'string')

 ]
, 


	function(err, result) {
		    if (err) {
		        console.log(err);
		    } else {
		        console.log('edited inserted with id: ' + result);
		    }

		  done();
	});//client.query 
	
});


});

//Adding Products Ends
router.post('/getProductData', function(req, serverRes, next) {
	console.log(req.body.productId);

	pool.connect((err, client, done) => {
	if (err) throw err
		
		client.query('SELECT "ProductId","Picture","ProductName", "UnitsInStock", "CostPrice","UnitPrice","Discount","CategoryId","ProductAvailable","DiscountAvailable","Featured","Latest","Material" from "Products" WHERE "ProductId"=\''+req.body.productId+'\' Limit 1', 
		
		function(err, result) {
			    if (err) {
			        console.log(err);
			    } else {
			        console.log(result);

			        serverRes.send({status:'success',product:result.rows[0]});
			    }

			  done();
		});//client.query 
		
	});


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

	  	CreateTableStructure.tableHeaders.push({ "title":""});//For Edit and Delete Button
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
			client.query('SELECT p."ProductId",p."Picture",p."ProductName",p."UnitsInStock",p."CostPrice", p."UnitPrice", p."Discount",p."UnitsOnOrder",c."CategoryName" FROM "Products" p,"Category" c WHERE c."CategoryId" = p."CategoryId" ', (err, res) => {
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
			  	 //tableRow.push('Edit/Delete');
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
