var wiki = require('../wiki');
module.exports = function(n, ba){
  var d = doNothing
  if(wiki.verbose) d = console.log
  var six = n

  // XSS 방지
  six = six.replace(/<script>|<\/script>/g, "")
  six = six.replace(/<(.*) on(.*)="(.*)">/g, "")
  d('1: '+six)

  // 개행 담당
  six = six.replace(/<br>/g, "")
  six = six.replace(/\n\n|\r\n\r\n/g, "<br>")
  six = six.replace(/\[br\]/g, "<br>")
  d('2: '+six)

  // 앞 태그
  six = six.replace(/>\s([^\n]*)/g, "<blockquote>$1</blockquote>")
  six = six.replace(/##([^#\n]*)/g, "")
  six = six.replace(/#redirect\s(.*)/g, "<div class=\"flash\">[[$1]] 문서를 찾고 계신가요?</div>")
  d('3: '+six)

  // 감싸는 태그
  six = six.replace(/-{4,11}/g, "<hr>") // 수평선
  six = six.replace(/\'\'\'([^\']*)\'\'\'/g, "<strong>$1</strong>") // 강조, 굵게
  six = six.replace(/\'\'([^\']*)\'\'/g, "<em>$1</em>") // 이텔릭
  six = six.replace(/__([^_]*)__/g, "<u>$1</u>") // 밑줄
  six = six.replace(/--([^-]*)--|~~([^~]*)~~/g, "<del>$1</del>") // '''취소선'''
  six = six.replace(/\^\^([^\^]*)\^\^/g, "<sup>$1</sup>") // 위첨자
  six = six.replace(/\,\,([^\,]*)\,\,/g, "<sub>$1</sub>") // 아래첨자
  d('4: '+six)

  // 제목들
  six = six.replace(/======\s?([^=]*)\s?======/g, "<h6>$1</h6>")
  six = six.replace(/=====\s?([^=]*)\s?=====/g, "<h5>$1</h5>")
  six = six.replace(/====\s?([^=]*)\s?====/g, "<h4>$1</h4>")
  six = six.replace(/===\s?([^=]*)\s?===/g, "<h3>$1</h3>")
  six = six.replace(/==\s?([^=]*)\s?==/g, "<h2>$1</h2>")
  d('5: '+six)

  // 고급 태그
  six = six.replace(/\[\[(https?:\/\/[^\n가-힣ㄱ-ㅎ]*[^\n]*[^\[\]]*)\|([^\[\]]*)]]/g, "<a href=\"$1\">$2</a>") // 커스텀 이름의 다른 곳 링크
  six = six.replace(/\[\[(https?:\/\/[^\n가-힣ㄱ-ㅎ]*[^\n]*[^[\[\]]*)]]/g, "<a href=\"$1\">$1</a>") // 다른 곳 링크
  six = six.replace(/\[\[([^\[\]]*)\|([^\[\]]*)]]/g, "<a href=\"/w/$1\">$2</a>") // 커스텀 이름의 링크
  six = six.replace(/\[\[([^[\[\]]*)]]/g, "<a href=\"/w/$1\">$1</a>") // 링크
  six = six.replace(/([^\n]*\.(jpeg|jpg|gif|png))/g, "<img src=\"$1\">") // 이미지
  six = six.replace(/\{{{\|\s?([^\{\}\|]*)\s?\|}}}/g, "<table class=\"wiki-closure\"><tbody><tr><td><div class=\"wiki-indent border\">$1<\/div><\/td><\/tr><\/tbody><\/table>")

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

  six = six.replace(/\{{{(((?!{{{).)*)}}}/g, "<code>$1</code>") // 코드로 바꾸기만 지원
  six = six.replace(/<math>(((?!<math>).)*)<\/math>/g, "<img src=\"https:\/\/latex.codecogs.com/gif.latex?$1\" title=\"$1\" />")
  d('6: '+six)

  // 리스트
  six = six.replace(/\s\*\s?([^\n]*)/g, "<li>$1</li>")

  six = six.replace(/(([1-9]\.\s?(.*)\n?)+)/g, "<ol>$1<ol>")
  six = six.replace(/(([1-9]\.\s?(.*)\n?)+)/g, "<li>$1<li>")
  d('7: '+six)

  // 매크로
  six = six.replace(/\[include\((.*)\)]/g, wiki.include["$1"]) // 틀

  six = six.replace(/\[youtube\((.*)\)]/g, "<iframe src=\"https://www.youtube.com/embed/$1\" frameborder=\"0\" allowfullscreen></iframe>")
  six = six.replace(/\[youtube\(([^,]*),\s?width=(.*)\)]/g, "<iframe width=\"$2\" src=\"https:\/\/www.youtube.com\/embed\/$1\" frameborder=\"0\" allowfullscreen><\/iframe>")
  six = six.replace(/\[youtube\(([^,]*),\s?width=(.*),\s?height=(.*)\)]/g, "<iframe width=\"$2\" height=\"$3\" src=\"https:\/\/www.youtube.com\/embed\/$1\" frameborder=\"0\" allowfullscreen><\/iframe>")
  six = six.replace(/\[youtube\(([^,]*),\s?height=(.*),\s?width=(.*)\)]/g, "<iframe width=\"$3\" height=\"$2\" src=\"https:\/\/www.youtube.com\/embed\/$1\" frameborder=\"0\" allowfullscreen><\/iframe>")
  six = six.replace(/\[youtube\(([^,]*),\s?height=(.*)\)]/g, "<iframe height=\"$3\" src=\"https:\/\/www.youtube.com\/embed\/$1\" frameborder=\"0\" allowfullscreen><\/iframe>")

  six = six.replace(/\[anchor\(([^\[\]]*)\)\]/g, "<div id=\"$1\"></div>")
  d('8: '+six)


  ba(six) // My name
}
function doNothing(a) {}
