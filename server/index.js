//https://github.com/brianc/node-postgres
var csv = require('csv-stream');
var request = require('request');
var fs = require('fs');

var pg = require('pg');
pg.defaults.ssl = true;

// All of these arguments are optional.
var options = {
delimiter : '\t', // default is ,
endLine : '\n', // default is \n,
// by default read the first line and use values found as columns 
// columns : ['Settlement Ref No.', 'Order Type','Fulfilment Type','Seller SKU','wsn'],
escapeChar : '"', // default is an empty string
enclosedChar : '"' // default is an empty string
}

var csvStream = csv.createStream(options);
fs.createReadStream('C:\\Users\\User\\Downloads\\Product.csv').pipe(csvStream)
.on('error',function(err){
	console.error(err);
})
.on('data',function(data){
	// outputs an object containing a set of key/value pair representing a line found in the csv file.
   // console.log(data);
})
.on('column',function(key,value){
	// outputs the column name associated with the value found
  // console.log('#' + key + ' = ' + value);
	//console.log('# '   + value.split(','));
	
	var array = value.split(',');
	console.log(array[5]);
	createRecordsInPG(array[0],array[1],array[2],array[3],array[4],array[5],array[6],array[7],array[8],array[9]);

});

var createRecordsInPG = function(SKU, ProductName, UnitPrice, Size,Picture,SupplierId,CategoryId,CostPrice,Featured,Latest){
	
	pg.connect('postgres://imqmgjnybedxon:5f95ca15ec9ac46554439ee8a888488c1d4d40b047fa5292eb5fe09865413ae0@ec2-107-20-255-96.compute-1.amazonaws.com:5432/d3aucv4f9mnpes', function(err, client) {
	if (err) throw err;
	console.log('Connected to postgres! Getting schemas...');

	client.query('INSERT into "Products" ("SKU", "ProductName", "UnitPrice", "Size","Picture","SupplierId","CategoryId","CostPrice","Featured","Latest") VALUES($1, $2, $3,$4,$5,$6,$7,$8,$9,$10) RETURNING "ProductId"',
	 [SKU, ProductName,Number(UnitPrice), Size,Picture,SupplierId,CategoryId,Number(CostPrice),Featured,Latest],
	 function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('row inserted with id: ' + result.rows[0].ProductId);
                }

            });
	
	});//pg.connect
}

