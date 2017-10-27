
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

var cloudinary = require('cloudinary');


cloudinary.config({ 
  cloud_name: 'hrmqah2hd', 
  api_key: '595616719544321', 
  api_secret: 'hxdXfpQSRcUlIechhkY944IAVBM' 
});


var Products = {
	tableHeaders : [],
	productCategories : [],
	tableData : [],
	init : function(){
		console.log('initialised');
		this.tableHeaders=[];
		this.tableData=[];
	},
	getAllProducts : function(serverRes){

		//console.log('Inside getAllProducts : ');

		Products.getCategories(function(){
					pool.connect((err, client, done) => {
				if (err) throw err

					//console.log(Products.tableHeaders);

					//client.query('SELECT * FROM "'+tableName+'"', (err, res) => { T01
						client.query('SELECT p."ProductId",p."Picture",p."ProductName",p."UnitsInStock",p."CostPrice", p."UnitPrice", p."Discount",p."UnitsOnOrder",c."CategoryName" FROM "Products" p,"Category" c WHERE c."CategoryId" = p."CategoryId" ', (err, res) => {
						done()
						
						if (err) {
						  console.log('Error : '+err.stack)
						  serverRes.send({status:'fail',message:err});
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

										//	console.log('image')
											tableRow.push(cloudinary.image(value[key])); 
										}else{
											tableRow.push(value[key]);   
										}

										//console.log('key : '+key+' cell values : '+value[key]);
										      
										
									}
								}

								Products.tableData.push(tableRow);
						  	});

						  	
						  	serverRes.send({status:'success',
						  			category:Products.productCategories,
						  			columns: Products.tableHeaders,
						  			data:Products.tableData});

						  }else{
						  	serverRes.send({status:'fail',message:'No Data to Return'});
						  }
						  
						}
					})
				})//pool.connect

			});

		

	},
	getSelectedProduct : function(req,serverRes){
		//console.log(req.body.productId);

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


	},
	insertProduct : function(req){

			pool.connect((err, client, done) => {
				if (err) throw err

				client.query('INSERT into "Products" ("Picture", "ProductName", "UnitsInStock", "CostPrice","UnitPrice","Discount","CategoryId","ProductAvailable","DiscountAvailable","Featured","Latest","Material","SupplierId") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING "ProductId"', 
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
				req.body.material,
				Number(1)], 


				function(err, result) {
				    if (err) {
				        console.log(err);
				    } else {
				        console.log('row inserted with id: ' + result.rows[0].ProductId);
				    }

				  done();
				});//client.query 

			});

	},
	updateProduct : function(req){
			pool.connect((err, client, done) => {
				if (err) throw err

console.log('returned  '+dataSanity(req.body.productImage,'string'));
console.log('returned  '+dataSanity(req.body.productName,'string'));
console.log('returned  '+dataSanity(req.body.unitsInStock,'integer'));
console.log('returned  '+dataSanity(req.body.costPrice,'integer'));
console.log('returned  '+dataSanity(req.body.unitPrice,'integer'));
console.log('returned  '+dataSanity(req.body.discount,'integer'));
console.log('returned  '+dataSanity(req.body.category,'integer'));
console.log('returned  '+dataSanity(req.body.productAvailable,'boolean'));
console.log('returned  '+dataSanity(req.body.discountAvailable,'boolean'));
console.log('returned  '+dataSanity(req.body.featured,'boolean'));
console.log('returned  '+dataSanity(req.body.material,'string'));


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
					,dataSanity(req.body.category,'integer')
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

			});//pool

	},
	deleteSelectedProduct : function(){

	},
	getCategories : function(callBack){
		console.log('inside getCategories');

		
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
					
					Products.productCategories=res.rows;

					
					callBack();
				}

			}
			})//client.query
		})//pool.connect
	},

	getTableHeader : function(){
		console.log('inside getTableHeader');
		Products.tableHeaders.push({ "title":""});//For Edit and Delete Button
	  	Products.tableHeaders.push({ "title":"Picture"});
	  	Products.tableHeaders.push({ "title":"ProductName"});
	  	Products.tableHeaders.push({ "title":"UnitsInStock"});
	  	Products.tableHeaders.push({ "title":"CostPrice"});
	  	Products.tableHeaders.push({ "title":"UnitPrice"});
	  	Products.tableHeaders.push({ "title":"Discount"});
	  	Products.tableHeaders.push({ "title":"UnitsOnOrder"});
	  	Products.tableHeaders.push({ "title":"CategoryName"});
	}

};


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


module.exports = Products;