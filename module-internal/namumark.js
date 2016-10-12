module.exports = function(n, ba){
  var fs = require('fs');
  var six = n;
  var today = getNow();
  var parseNamu = require('./namumark')
  var plugin = require('./plugin/plugin.js')
  var d = require('debug')('openNAMU:parser');
  var htmlencode = require('htmlencode');
  
  function getNow() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();
  if(dd<10) {
      dd='0'+dd;
  }
  if(mm<10) {
      mm='0'+mm;
  }
  return yyyy+'/' + mm+'/'+dd;
  }
  six = plugin(six);
  six = six.replace(/<script>|<\/script>/g, "");
  six = six.replace(/<(.*) on(.*)="(.*)">/g, "");
  six = six.replace(/javascript:/g, "");
  
  six = six.replace(/\[yt\(([^)]*)\)\]/g, "[youtube($1)]");
  six = six.replace(/\[in\(([^)]*)\)\]/g, "[include($1)]");
  
  var ohhhh = /\n>\s?((?:[^\n]*)(?:(?:(?:(?:\n>\s?)(?:[^\n]*))+)?))/;
  var read;
  while(true)
  {
	  if(read = ohhhh.exec(six))
	  {
		read[1] = read[1].replace(/\n>\s?/g, "\n");
		six = six.replace(ohhhh, "\n<blockquote>" + read[1] + "</blockquote>");
	  }
	  else
	  {
		  break;
	  }
  }
  
  six = six.replace(/\{\{\{#!html(?:\s?(([^}}}]*)\n?(?:(?:(?:(?:(?:[^}}}]*)(?:\n)?)+)))))}}}/g, "$1");
  
  six = six.replace(/\{\{\{#!wiki ([^\n]*)\n(((((.*)(\n)?)+)))}}}/g, "<div $1>$2</div>");
  
  six = six.replace(/{{{\+([1-5])\s?((([^}}}]*)*(\n)?)+)}}}(?!})/g,'<span class="font-size-$1">$2</span>');
  six = six.replace(/{{{\-([1-5])\s?((([^}}}]*)*(\n)?)+)}}}(?!})/g,'<span class="font-size-small-$1">$2</span>');
  
  six = six.replace(/{{{(#[0-9a-f-A-F]{3}) +(.*?)}}}(?!})/g,'<span style="color:$1">$2</span>');
  six = six.replace(/{{{(#[0-9a-f-A-F]{6}) +(.*?)}}}(?!})/g,'<span style="color:$1">$2</span>');
  six = six.replace(/{{{#(\w+) +(.*?)}}}(?!})/g,'<span style="color:$1">$2</span>');
  
  var live = /\{\{\{((?:[^}]*)\n?(?:(?:(?:(?:(?:[^}]*)(?:\n)?)+))))}}}/;
  var sh;
  while(true)
  {
	if(sh = live.exec(six))
	{
		sh[1] = htmlencode.htmlEncode(sh[1]);
		six = six.replace(live, '{/{{'+encodeURIComponent(sh[1])+'}}/}');
	}
	else {
		break;
	}
  }
  
  six = six.replace(/##\s?([^\n]*)/g, "<div style='display:none;'>$1</div>");
  
  six = six.replace(/\[\[분류:([^\]\]]*)\]\]/g, "");
  
  var include = /\[include\(([^)]*)\)\]/;
  var under;
  while(true) {
	  if(under = include.exec(six)) {
		  if(fs.existsSync('./data/' + encodeURIComponent(under[1])+'.txt')) {
			var data = fs.readFileSync('./data/' + encodeURIComponent(under[1])+'.txt', 'utf8');
			parseNamu(data, function(cnt){
			six = six.replace(/\[include\(([^)]*)\)\]/g, cnt);
			})
		  }
		  else {
			  six = six.replace(/\[include\(([^)]*)\)\]/g, "<a class=\"not_thing\" href=\"/w/$1\">$1</a>");
		  }
	  }
	  else {
		  break;
	  }
  }
  
  var tong = /\[\[([^\]\]]*)\|([^\]\]]*)\]\]/;
  var tang = /\[\[([^\]\]]*)\]\]/;
  var match;
  var van;
  six = six.replace(/\[\[(https?:\/\/)([^\]\]]*)\|([^\]\]]*)\]\]/g, "<a class#is#\"out_link\" href#is#\"$1$2\"><span class#is#\"contect\">外</span>$3</a>");
  six = six.replace(/\[\[(https?:\/\/)([^\]\]]*)\]\]/g, "<a class#is#\"out_link\" href#is#\"$1$2\"><span class#is#\"contect\">外</span>$1$2</a>");
  
  while(true) {
	if(match = tong.exec(six)) {
		van = '';
		if(!fs.existsSync('./data/' + encodeURIComponent(match[1])+'.txt')) {
			van = van + 'class="not_thing"';
		}
		six = six.replace(/\[\[([^\]\]]*)\|([^\]\]]*)\]\]/, '<a '+van+' title#is#"'+htmlencode.htmlEncode(match[1])+'" href#is#"/w/'+encodeURIComponent(match[1])+'">'+match[2]+'</a>');
	}
	else {
		break;
	}
  }
  while(true) {
	if(match = tang.exec(six)) {
		van = '';
		if(!fs.existsSync('./data/' + encodeURIComponent(match[1])+'.txt')) {
			van = van + 'class#is#"not_thing"';
		}
		six = six.replace(/\[\[([^\]\]]*)\]\]/, '<a '+van+' title#is#"'+htmlencode.htmlEncode(match[1])+'" href#is#"/w/'+encodeURIComponent(match[1])+'">'+match[1]+'</a>');
	}
	else {
		break;
	}
  }
  
  var h = /(={1,6})\s?([^=]*)\s?(?:={1,6})\r\n/;
  var h0c = 0;
  var h1c = 0;
  var h2c = 0;
  var h3c = 0;
  var h4c = 0;
  var h5c = 0;
  var last = 0;
  var head;
  var toc;
  var wiki;
  var rtoc = '<div id="toc"><span id="toc-name">목차</span><br><br>';
  while(true) {
	  if(head = h.exec(six)) {
		  wiki = head[1].length;
		  if(last < wiki) {
			  last = wiki;
		  }
		  else {
			  last = wiki;
			  if(wiki === 1) {
				h1c = 0;
				h2c = 0;
				h3c = 0;
				h4c = 0;
				h5c = 0;
			  } else if(wiki === 2) {
				h2c = 0;
				h3c = 0;
				h4c = 0;
				h5c = 0;
			  } else if(wiki === 3) {
				h3c = 0;
				h4c = 0;
				h5c = 0;
			  } else if(wiki === 4) {
				h4c = 0;
				h5c = 0;
			  } else if(wiki === 5) {
				h4c = 0;
			  }
		  }
		  if(wiki === 1) {
				h0c = h0c + 1;
		  } else if(wiki === 2) {
		        h1c = h1c + 1;
		  } else if(wiki === 3) {
		        h2c = h2c + 1;
		  } else if(wiki === 4) {
		        h3c = h3c + 1;
		  } else if(wiki === 5) {
		        h4c = h4c + 1;
		  } else {
		        h5c = h5c + 1;
		  }
		  toc = h0c + '.' + h1c + '.' + h2c + '.' + h3c + '.' + h4c + '.' + h5c + '.';
	      toc = toc.replace(/0./g, '');
	      toc = toc.replace(/(.*)\./g, '$1');
		  rtoc = rtoc + '<a href="#s-' + toc + '">' + toc + '</a>. ' + head[2] + '<br>';
		  six = six.replace(h, '<h'+wiki+'><a href="#toc" id="s-' + toc + '">' + toc + '.</a> $2</h'+wiki+'>\n');
	  } else {
		  rtoc = rtoc + '</div>';
		  break;
	  }
  }

  six = six.replace(/#is#/g, '=');
  rtoc = rtoc.replace(/#is#/g, '=');

  six = six.replace(/\[목차\]/g, rtoc);
  
  six = six.replace(/'''(.+?)'''(?!')/g,'<strong>$1</strong>');
  six = six.replace(/''(.+?)''(?!')/g,'<i>$1</i>');
  six = six.replace(/~~(.+?)~~(?!~)/g,'<s>$1</s>');
  six = six.replace(/--(.+?)--(?!-)/g,'<s>$1</s>');
  six = six.replace(/__(.+?)__(?!_)/g,'<u>$1</u>');
  six = six.replace(/\^\^(.+?)\^\^(?!\^)/g,'<sup>$1</sup>');
  six = six.replace(/,,(.+?),,(?!,)/g,'<sub>$1</sub>');
  
  six = six.replace(/\[br\]/ig,'<br>');
  
  six = six.replace(/{{\|([^\|}}]*)\|}}/g, "<table><tbody><tr><td>$1</td></tr></tbody></table>");
  
  six = six.replace(/\[img\(([^,]*)(?:,\s?((?:width|height)=(?:[0-9]*)))?(?:,\s?((?:width|height)=(?:[0-9]*)))?\)\]/g, '<img src="$1" $2 $3>');
  
  six = six.replace(/\[youtube\(([^,]*)(?:,\s?((?:width|height)=(?:[0-9]*)))?(?:,\s?((?:width|height)=(?:[0-9]*)))?\)\]/g, '<iframe $2 $3 src="https://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>');
  
  six = six.replace(/\[date]/g, today);
  six = six.replace(/\[datetime]/g, today);
  
  six = six.replace(/\[anchor\(([^\[\]]*)\)\]/g, "<div id=\"$1\"></div>");
  
  six = six.replace(/\s\*\s([^\n]*)\n/g, "<li>$1</li><not_br></not_br>");
  six = six.replace(/\s\*\s([^\n]*)/g, "<li>$1</li>");
  
  six = six.replace(/-{4,11}/g, "<hr>");
  
  var a = 1;
  var b = /\[\*\s((?:[^\[\]]+)*)\]/;
  var tou = "<hr id='footnote'><div class='wiki-macro-footnote'><br>";
  
  while(true)
  {
	  match = b.exec(six);
	  if(match === null)
	  {
		  tou = tou + '</div>';
		  if(tou === "<hr id='footnote'><div class='wiki-macro-footnote'><br></div>")
		  {
			  tou = "<div class='wiki-macro-footnote'><br></div>";
		  }
		  break; 
	  }
	  else
	  {
		tou = tou + "<span class='footnote-list'><a href=\"#rfn-" + a + "\" id=\"fn-" + a + "\">[" + a + "]</a> " + match[1] + "</span><br>";
		six = six.replace(/\[\*\s((?:[^\[\]]+)*)\]/, "<sup><a href=\"#fn-" + a + "\" id=\"rfn-" + a + "\" title='"+htmlencode.htmlEncode(match[1])+"'>[" + a + "]</a></sup>");
		a = a + 1;
	  }
  }
  
  six = six.replace(/<math>(((?!<math>).)*)<\/math>/g, "<img src=\"https:\/\/latex.codecogs.com/gif.latex?$1\" title=\"$1\" />")
  
  six = six.replace(/\|\|(<table\s?((width|height)=([^>]*))>)?(<table\s?((width|height)=([^>]*))>)?((\s?)*(([^||]*)*(\|\|)*(\s?))*)\|\|((((\n\|\|)*((\s?)*(([^||]*)*(\|\|)*(\s?))*))+)\|\|)?/g, '<table $2 $6><tbody><tr><td>$9</td></tr></tbody></table>');
  six = six.replace(/\|\|\r\n\|\|/g, "</td></tr><not_br></not_br><tr><td>");
  six = six.replace(/\|\|/g, "</td><td>");
  six = six.replace(/<td>(<-([^>]*)>)?<:>/g, "<td style=\"text-align: center;\">$1");
  six = six.replace(/(<td\s?([^>]*)?)><-([0-9]*)>/g, "$1 colspan=\"$3\">");
  
  six = six.replace(/\n/g, "<br>");
  six = six.replace(/<not_br><\/not_br>/g, "\n");
  
  var live = /\{\/\{\{((?:[^}]*)\n?(?:(?:(?:(?:(?:[^}]*)(?:\n)?)+))))}}\/}/;
  var sh;
  while(true)
  {
	if(sh = live.exec(six))
	{
		six = six.replace(live, decodeURIComponent(sh[1]));
	}
	else {
		break;
	}
  }
  
  six = six.replace(/\[각주\](((<br>+)*(\s+)*(\n+))+)?$/g, "");
  six = six.replace(/\[각주\]/g, "<br>" + tou);
  six = six + tou;
  d('1: '+six)
  ba(six)
  
  // Thank for 2DU, LiteHell //
}
function doNothing(a) {}