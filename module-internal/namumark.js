var wiki = require('../wiki')
module.exports = function(n, ba){
  var six = n
  var today = getNow()
  var d = require('debug')('openNAMU:parser')
  var docnames = Object.keys(wiki.doc);

  function getNow() {
  var today = new Date()
  var dd = today.getDate();
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();
  if(dd<10) {
      dd='0'+dd
  }
  if(mm<10) {
      mm='0'+mm
  }
  return yyyy+'/' + mm+'/'+dd;
  }
  
  six = six.replace(/<script>|<\/script>/g, "")
  six = six.replace(/<(.*) on(.*)="(.*)">/g, "")
  six = six.replace(/javascript:/g, "")
  
  six = six.replace(/^#redirect ([^\n]*)/g, "<head><meta http-equiv=\"refresh\" content=\"3;url=/w/$1\" /></head><li>3초 후 [[$1]] 문서로 리다이렉트 합니다.</li>")
  six = six.replace(/^#넘겨주기 ([^\n]*)/g, "<head><meta http-equiv=\"refresh\" content=\"3;url=/w/$1\" /></head><li>3초 후 [[$1]] 문서로 리다이렉트 합니다.</li>")
  
  six = six.replace(/\n>\s?([^\n]*)/g, "<blockquote>$1</blockquote><not_br></not_br>")
  
  six = six.replace(/##\s?([^\n]*)/g, "<!--$1-->")
  
  six = six.replace(/\[\[분류:([^\]\]]*)\]\]/g, "")
  six = six.replace(/\[각주\]/g, "")
  six = six.replace(/\[목차\]/g, "")
  
  var docLinkPattern_Labeled = /\[\[([^\]\]]*)\|([^\]\]]*)\]\]/g,
    docLinkPattern = /\[\[([^\]\]]*)\]\]/g;
  six = six.replace(/\[\[(https?:\/\/)([^\]\]]*)\|([^\]\]]*)\]\]/g, "<a class=\"out_link\" href=\"$1$2\"><span class=\"contect\">外</span>$3</a>")
  six = six.replace(/\[\[(https?:\/\/)([^\]\]]*)\]\]/g, "<a class=\"out_link\" href=\"$1$2\"><span class=\"contect\">外</span>$1$2</a>")
  while(true) {
    var match = docLinkPattern_Labeled.exec(six);
    if(match == null)
        break;
    if(docnames.indexOf(match[1]) != -1) {
        // 존재하는 문서
        six = six.replace(match[0], '<a href="/w/' + match[1] + '">' + match[2] + '</a>');
    } else {
        // 안 존재하는 문서
        six = six.replace(match[0], '<a class="not_thing" href="/w/' + match[1] + '">' + match[2] + '</a>');
    }
  }
  while(true) {
    var match = docLinkPattern.exec(six);
    if(match == null)
        break;
    if(docnames.indexOf(match[1]) != -1) {
        // 존재하는 문서
        six = six.replace(match[0], '<a href="/w/' + match[1] + '">' + match[1] + '</a>');
    } else {
        // 안 존재하는 문서
        six = six.replace(match[0], '<a class="not_thing" href="/w/' + match[1] + '">' + match[1] + '</a>');
    }
  }

  six = six.replace(/======\s(.*)\s======[ ]*/g, "<h6>$1</h6>")
  six = six.replace(/=====\s(.*)\s=====[ ]*/g, "<h5>$1</h5>")
  six = six.replace(/====\s(.*)\s====[ ]*/g, "<h4>$1</h4>")
  six = six.replace(/===\s(.*)\s===[ ]*/g, "<h3>$1</h3>")
  six = six.replace(/==\s(.*)\s==[ ]*/g, "<h2>$1</h2>")
  six = six.replace(/=\s(.*)\s=[ ]*/g, "<h1>$1</h1>")
  
  six = six.replace(/<!--\s?([^--]*)\s?-->/g, "<not_del>$1</not_del>")
  
  six = six.replace(/'''(.+?)'''(?!')/g,'<strong>$1</strong>')
  six = six.replace(/''(.+?)''(?!')/g,'<i>$1</i>')
  six = six.replace(/~~(.+?)~~(?!~)/g,'<s>$1</s>')
  six = six.replace(/--(.+?)--(?!-)/g,'<s>$1</s>')
  six = six.replace(/__(.+?)__(?!_)/g,'<u>$1</u>')
  six = six.replace(/\^\^(.+?)\^\^(?!\^)/g,'<sup>$1</sup>')
  six = six.replace(/,,(.+?),,(?!,)/g,'<sub>$1</sub>')
  
  six = six.replace(/{{{\+([1-5]) +(.*?)}}}(?!})/g,'<span class="font-size-$1">$2</span>')
  six = six.replace(/{{{\-([1-5]) +(.*?)}}}(?!})/g,'<span class="font-size-small-$1">$2</span>')
  
  six = six.replace(/{{{(#[0-9a-f-A-F]{3}) +(.*?)}}}(?!})/g,'<span style="color:$1">$2</span>')
  six = six.replace(/{{{(#[0-9a-f-A-F]{6}) +(.*?)}}}(?!})/g,'<span style="color:$1">$2</span>')
  six = six.replace(/{{{#(\w+) +(.*?)}}}(?!})/g,'<span style="color:$1">$2</span>')
  
  six = six.replace(/\[br\]/ig,'<br>')
  
  six = six.replace(/\|\|([^\|\|]*)\|\|/g, "<table><tbody><tr><td>$1</td></tr></tbody></table>")
  six = six.replace(/{{\|([^\|}}]*)\|}}/g, "<table><tbody><tr><td>$1</td></tr></tbody></table>")
  
  six = six.replace(/([^\n]*\.(jpeg|jpg|gif|png))\?width=([^\n]*)&height=([^\n]*)/g, "<img src=\"$1\" width=\"$3\"  height=\"$4\">")
  six = six.replace(/([^\n]*\.(jpeg|jpg|gif|png))\?height=([^\n]*)&width=([^\n]*)/g, "<img src=\"$1\" width=\"$3\" height=\"$4\">")
  six = six.replace(/([^\n]*\.(jpeg|jpg|gif|png))\?height=([^\n]*)/g, "<img src=\"$1\" height=\"$3\">")
  six = six.replace(/([^\n]*\.(jpeg|jpg|gif|png))\?width=([^\n]*)/g, "<img src=\"$1\" width=\"$3\">")
  six = six.replace(/([^\n]*\.(jpeg|jpg|gif|png))/g, "<img src=\"$1\">")
  six = six.replace(/<img src="<img src="([^\n]*\.(jpeg|jpg|gif|png))">" width="([^\n]*)" height="([^\n]*)">/g, "<img src=\"$1\" width=\"$3\" height=\"$4\">")
  six = six.replace(/<img src="<img src="([^\n]*\.(jpeg|jpg|gif|png))">" width="([^\n]*)">/g, "<img src=\"$1\" width=\"$3\">")
  six = six.replace(/<img src="<img src="([^\n]*\.(jpeg|jpg|gif|png))">" height="([^\n]*)">/g, "<img src=\"$1\" height=\"$3\">")
  
  six = six.replace(/\[youtube\(([^,]*),\s?width=(.*),\s?height=(.*)\)]/g, "<iframe width=\"$2\" height=\"$3\" src=\"https:\/\/www.youtube.com\/embed\/$1\" frameborder=\"0\" allowfullscreen><\/iframe>")
  six = six.replace(/\[youtube\(([^,]*),\s?height=(.*),\s?width=(.*)\)]/g, "<iframe width=\"$3\" height=\"$2\" src=\"https:\/\/www.youtube.com\/embed\/$1\" frameborder=\"0\" allowfullscreen><\/iframe>")
  six = six.replace(/\[youtube\(([^,]*),\s?width=(.*)\)]/g, "<iframe width=\"$2\" src=\"https:\/\/www.youtube.com\/embed\/$1\" frameborder=\"0\" allowfullscreen><\/iframe>")
  six = six.replace(/\[youtube\(([^,]*),\s?height=(.*)\)]/g, "<iframe height=\"$3\" src=\"https:\/\/www.youtube.com\/embed\/$1\" frameborder=\"0\" allowfullscreen><\/iframe>")
  six = six.replace(/\[youtube\((.*)\)]/g, "<iframe width=\"640px\" height=\"360px\" src=\"https://www.youtube.com/embed/$1\" frameborder=\"0\" allowfullscreen></iframe>")
  
  six = six.replace(/\[date]/g, today)
  six = six.replace(/\[datetime]/g, today)
  
  six = six.replace(/\[anchor\(([^\[\]]*)\)\]/g, "<div id=\"$1\"></div>")
  
  six = six.replace(/\s\*\s([^\n]*)\n/g, "<li>$1</li><not_br></not_br>")
  six = six.replace(/\s\*\s([^\n]*)/g, "<li>$1</li>")
  
  six = six.replace(/-{4,11}/g, "<hr>")
  
  var a = 1;
  var b = /\[\*\s((?:[^\[\]]+)*)\]/;
  
  while(true)
  {
	  match = b.exec(six);
	  if(match == null)
	  {
		  break;
	  }
	  else
	  {
		six = six.replace(/\[\*\s((?:[^\[\]]+)*)\]/, "<ref><a>[" + a + "]</a> $1</ref>");
		a = a + 1;
	  }
  }
  
  six = six.replace(/{{{#!html/g, "")
  six = six.replace(/}}}/g, "")
  
  six = six.replace(/\n/g, "<br>")
  d('1: '+six)

  ba(six)
  // 새 파서 테스트중 Beta 0.4 버전 //
  // Thank for 2DU, LiteHell //
}
function doNothing(a) {}
