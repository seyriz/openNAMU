var MongoClient = require('mongodb').MongoClient
MongoClient.connect(require('../wiki').mongoUrl, function(err, db) {
  console.log("Connected correctly to server");
  if(!db.system.namespaces.find( { name: 'documents' } )){
    db.createCollections("documents")
  }
  var collection = db.collection('documents');
  module.exports.docs = collection;
  module.exports.db = db
})