



module.exports = function(six){

var list = './plugin.json'
var obj = require(list);

var length = obj['pluginsrc'].length;

for (i=0; i < length; i++){

console.log(i+'st loop : data : '+obj['pluginsrc'][i]);
var pluginsrc = require('./'+obj['pluginsrc'][i]+'/plugin');
six = pluginsrc(six);

}
console.log(length);
return six;
}

