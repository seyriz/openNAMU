ovar wiki = require('../wiki');
function getNow() {
  var today = new Date()
  var dd = today.getDate();
  var mm = today.getMonth()+1; //1월이 0월이 되는 마아-법!
  var yyyy = today.getFullYear();
  if(dd<10) {
      dd='0'+dd
  }
  if(mm<10) {
      mm='0'+mm
  }
  return yyyy+'/' + mm+'/'+dd;
}
module.exports = function(n, ba){
  var d = require('debug')('openNAMU:parser')
  var six = n
  var today = getNow()

  // XSS 방지와 바보패치
  six = six.replace(/<script>|<\/script>/g, "")
  six = six.replace(/<(.*) on(.*)="(.*)">/g, "")
  six = six.replace(/javascript:/g, "")
  six = six.replace(/\{\{\{#![hH][tT][mM][lL] ([^]*)\}\}\}/g, "$1")

  d('1: '+six)

  // 앞 태그
  six = six.replace(/\n>\s([^\n]*)/g, "<blockquote style=\"padding: 1em calc(2em + 25px) 1em 1em;background: #eeeeee;border: 2px dashed #ccc;border-left: 5px solid #71BC6D;\">$1</blockquote>")
  six = six.replace(/##([^#\n]*)/g, "<!-- $1 -->")
  six = six.replace(/#redirect\s(.*)/g, "<div class=\"flash\">[[$1]] 문서를 찾고 계신가요?</div>")
  d('2: '+six)

  // 감싸는 태그
  six = six.replace(/-{4,11}/g, "<hr>") // 수평선
  six = six.replace(/\'\'\'([^\']*)\'\'\'/g, "<strong>$1</strong>") // 강조, 굵게
  six = six.replace(/\'\'([^\']*)\'\'/g, "<em>$1</em>") // 이텔릭
  six = six.replace(/__([^_]*)__/g, "<u>$1</u>") // 밑줄
  six = six.replace(/--([^-]*)--|~~([^~]*)~~/g, "<del>$1</del>") // '''취소선'''
  six = six.replace(/\^\^([^\^]*)\^\^/g, "<sup>$1</sup>") // 위첨자
  six = six.replace(/\,\,([^\,]*)\,\,/g, "<sub>$1</sub>") // 아래첨자
  d('3: '+six)

  // 제목들
  six = six.replace(/======\s?([^=]*)\s?======/g, "<h6>$1</h6>")
  six = six.replace(/=====\s?([^=]*)\s?=====/g, "<h5>$1</h5>")
  six = six.replace(/====\s?([^=]*)\s?====/g, "<h4>$1</h4>")
  six = six.replace(/===\s?([^=]*)\s?===/g, "<h3>$1</h3>")
  six = six.replace(/==\s?([^=]*)\s?==/g, "<h2>$1</h2>")
  d('4: '+six)

  // 고급 태그
  six = six.replace(/\[\[(https?:\/\/[^\n가-힣ㄱ-ㅎ]*[^\n]*[^\[\]]*)\|([^\[\]]*)]]/g, "<a id=\"outdoor\" style=\"color:green;\" href=\"$1\">$2</a>") // 커스텀 이름의 다른 곳 링크
  six = six.replace(/\[\[(https?:\/\/[^\n가-힣ㄱ-ㅎ]*[^\n]*[^[\[\]]*)]]/g, "<a id=\"outdoor\" style=\"color:green;\" href=\"$1\">$1</a>") // 다른 곳 링크
  six = six.replace(/\[\[(((?!\[\[).)*)\|(((?!\[\[).)*)]]/g, "<a href=\"/w/$1\">$3</a>") // 커스텀 이름의 링크
  six = six.replace(/\[\[(#((?!\[\[).)*)\|(((?!\[\[).)*)]]/g, "<a href=\"$1\">$3</a>") // 앵커에 커스텀 이름의 링크
  six = six.replace(/\[\[(#((?!\[\[).)*)\]\]/g, "<a href=\"$1\">$1</a>") // 앵커에 링크
  six = six.replace(/\[\[(((?!\[\[).)*)\]\]/g, "<a href=\"/w/$1\">$1</a>") // 링크

  six = six.replace(/([^\n]*\.(jpeg|jpg|gif|png))\?width=([^\n]*)&height=([^\n]*)/g, "<img src=\"$1\" width=\"$3\"  height=\"$4\">")
  six = six.replace(/([^\n]*\.(jpeg|jpg|gif|png))\?height=([^\n]*)&width=([^\n]*)/g, "<img src=\"$1\" width=\"$3\" height=\"$4\">")
  six = six.replace(/([^\n]*\.(jpeg|jpg|gif|png))\?height=([^\n]*)/g, "<img src=\"$1\" height=\"$3\">")
  six = six.replace(/([^\n]*\.(jpeg|jpg|gif|png))\?width=([^\n]*)/g, "<img src=\"$1\" width=\"$3\">")
  six = six.replace(/([^\n]*\.(jpeg|jpg|gif|png))/g, "<img src=\"$1\">")
  six = six.replace(/<img src="<img src="([^\n]*\.(jpeg|jpg|gif|png))">" width="([^\n]*)" height="([^\n]*)">/g, "<img src=\"$1\" width=\"$3\" height=\"$4\">") // 이미지
  six = six.replace(/<img src="<img src="([^\n]*\.(jpeg|jpg|gif|png))">" width="([^\n]*)">/g, "<img src=\"$1\" width=\"$3\">") // 이미지
  six = six.replace(/<img src="<img src="([^\n]*\.(jpeg|jpg|gif|png))">" height="([^\n]*)">/g, "<img src=\"$1\" height=\"$3\">") // 이미지

  six = six.replace(/\{{\|\s?([^\{\}\|]*)\s?\|}}/g, "<table style=\"border: 1px solid;\"><tbody><tr><td><div class=\"wiki-indent border\">$1<\/div><\/td><\/tr><\/tbody><\/table>") //글상자

  six = six.replace(/\{\{\{\+1\s?(((?!{{{).)*)\}\}\}/g, "<big>$1</big>")
  six = six.replace(/\{\{\{\+2\s?(((?!{{{).)*)\}\}\}/g, "<big><big>$1</big></big>")
  six = six.replace(/\{\{\{\+3\s?(((?!{{{).)*)\}\}\}/g, "<big><big><big>$1</big></big></big>")
  six = six.replace(/\{\{\{\+4\s?(((?!{{{).)*)\}\}\}/g, "<big><big><big><big>$1</big></big></big></big>")
  six = six.replace(/\{\{\{\+5\s?(((?!{{{).)*)\}\}\}/g, "<big><big><big><big><big>$1</big></big></big></big></big>")

  six = six.replace(/\{\{\{\-1\s?(((?!{{{).)*)\}\}\}/g, "<small>$1</small>")
  six = six.replace(/\{\{\{\-2\s?(((?!{{{).)*)\}\}\}/g, "<small><small>$1</small></small>")
  six = six.replace(/\{\{\{\-3\s?(((?!{{{).)*)\}\}\}/g, "<small><small><small>$1</small></small></small>")
  six = six.replace(/\{\{\{\-4\s?(((?!{{{).)*)\}\}\}/g, "<small><small><small><small>$1</small></small></small></small>")
  six = six.replace(/\{\{\{\-5\s?(((?!{{{).)*)\}\}\}/g, "<small><small><small><small><small>$1</small></small></small></small></small>")
  six = six.replace(/\[\* ([^\[]*)\]/g, "<span class=\"tooltipped tooltipped-n\" aria-label=\"$1\"><sup>[각주]</sup></span>") // 이름 없는 각주
  six = six.replace(/\[\*([^\[]+) ([^\[]*)\]/g, "<span class=\"tooltipped tooltipped-n\" aria-label=\"$2\"><sup>[$1]</sup></span>")

  six = six.replace(/\{{{(((?!{{{).)*)}}}/g, "<code>$1</code>") // 코드로 바꾸기만 지원
  six = six.replace(/<math>(((?!<math>).)*)<\/math>/g, "<img src=\"https:\/\/latex.codecogs.com/gif.latex?$1\" title=\"$1\" />") //수학 식
  d('5: '+six)

  // 리스트
  six = six.replace(/\s\*\s?([^\n]*)/g, "<li>$1</li>")

  six = six.replace(/(([1-9]\.\s(.*)\n?)+)/g, "<ol>$1<ol>")
  six = six.replace(/(([1-9]\.\s(.*)\n?)+)/g, "<li>$1<li>")
  d('6: '+six)

  // 매크로
  six = six.replace(/\[include\((.*)\)]/g, wiki.include["$1"]) // 틀

  six = six.replace(/\[youtube\(([^,]*),\s?width=(.*),\s?height=(.*)\)]/g, "<iframe width=\"$2\" height=\"$3\" src=\"https:\/\/www.youtube.com\/embed\/$1\" frameborder=\"0\" allowfullscreen><\/iframe>")
  six = six.replace(/\[youtube\(([^,]*),\s?height=(.*),\s?width=(.*)\)]/g, "<iframe width=\"$3\" height=\"$2\" src=\"https:\/\/www.youtube.com\/embed\/$1\" frameborder=\"0\" allowfullscreen><\/iframe>")
  six = six.replace(/\[youtube\(([^,]*),\s?width=(.*)\)]/g, "<iframe width=\"$2\" src=\"https:\/\/www.youtube.com\/embed\/$1\" frameborder=\"0\" allowfullscreen><\/iframe>")
  six = six.replace(/\[youtube\(([^,]*),\s?height=(.*)\)]/g, "<iframe height=\"$3\" src=\"https:\/\/www.youtube.com\/embed\/$1\" frameborder=\"0\" allowfullscreen><\/iframe>")
  six = six.replace(/\[youtube\((.*)\)]/g, "<iframe src=\"https://www.youtube.com/embed/$1\" frameborder=\"0\" allowfullscreen></iframe>")
  six = six.replace(/\[date]/g, today)
  six = six.replace(/\[datetime]/g, today)
  six = six.replace(/\[anchor\(([^\[\]]*)\)\]/g, "<div id=\"$1\"></div>")
  d('7: '+six)

  // 개행 담당
  six = six.replace(/<br>/g, "")
  six = six.replace(/\[br\]/g, "<br>")
  d('8: '+six)

  var six = nl2br(six);
  function nl2br(str){
    return str.replace(/\n/g, "<br />");
  }
  // 2DU님의 기여 사항을 일부..아니 많이 적용했습니다. 감사합니다! //
}
function doNothing(a) {}
