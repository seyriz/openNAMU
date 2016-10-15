var express = require('express');
var router = express.Router();
var parseNamu = require('./module-internal/namumark')
var fs = require('fs');
var htmlencode = require('htmlencode');
var Diff = require('text-diff');
var sha3_512 = require('js-sha3').sha3_512;
var licen;
var name;
var FrontPage;
function rlicen(licen) {
	var exists = fs.existsSync('./setting/License.txt');
	if(exists) {
		licen = fs.readFileSync('./setting/License.txt', 'utf8');
	}
	else {
		licen = "CC ZERO";
	}
	return licen;
}
function rname(name) {
	var exists = fs.existsSync('./setting/WikiName.txt');
	if(exists) {
		name = fs.readFileSync('./setting/WikiName.txt', 'utf8');
	}
	else {
		name = "오픈나무";
	}
	return name;
}

function rFrontPage(FrontPage) {
	var exists = fs.existsSync('./setting/FrontPage.txt');
	
	if(exists) {
		FrontPage = fs.readFileSync('./setting/FrontPage.txt', 'utf8');
	}
	else {
		FrontPage = "FrontPage";
	}
	return FrontPage;
}
function getNow() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();
  var nn = today.getHours();
  var aa = today.getMinutes();
  var ee = today.getSeconds();
  if(dd<10) {
	  dd='0'+dd;
  }
  if(mm<10) {
	  mm='0'+mm;
  }
 if(aa<10) {
	  aa='0'+aa;
  }
  if(ee<10) {
	  ee='0'+ee;
  }
  if(nn/12>=1) {
	  if(nn<10) {
		  nn='0'+nn;
	  }
	  nn= 'PM ' + nn%12;						
  }
  else {
	  if(nn<10) {
		  nn='0'+nn;
	  }
	  nn= 'AM ' + nn;
  }
  return yyyy+'-' + mm+'-'+dd+' / '+nn+':'+aa+':'+ee;
}
function stop(ip) {
    var ipban;
    var vip = new RegExp(ip);
	var exists = fs.existsSync('./setting/IPban.txt');
	if(exists) {
		ipban = fs.readFileSync('./setting/IPban.txt', 'utf8');
	}
	else {
		ipban = "";
	}
	if(vip.exec(ipban)) {
		res.send('error');
	}
}
function admin(ip) {
    var ipban;
    var vip = new RegExp(ip);
	var exists = fs.existsSync('./setting/Admin.txt');
	if(exists) {
		ipban = fs.readFileSync('./setting/Admin.txt', 'utf8');
	}
	else {
		var exists = fs.existsSync('./localset/Admin.txt');
		if(exists) {
			ipban = fs.readFileSync('./localset/Admin.txt', 'utf8');
		}
		else {
			ipban = "";
		}
	}
	if(!vip.exec(ipban)) {
		res.send('error');
	}
}
function rplus() {
	var plusnumber = fs.readFileSync('./recent/RecentChanges-number.txt', 'utf8');
	if(plusnumber) {
		if(Number(plusnumber) === 50) {
			var plusnumber2 = fs.readFileSync('./recent/RecentChanges.txt', 'utf8');
			fs.writeFileSync('./recent/RecentChanges-2.txt', plusnumber2, 'utf8');
			fs.unlink('./recent/RecentChanges.txt', function (err) {
			});
			fs.open('./recent/RecentChanges.txt','w+',function(err,fd){
			});
			plusnumber = 0;
		}
		plusnumber = Number(plusnumber) + 1;
		fs.writeFileSync('./recent/RecentChanges-number.txt', Number(plusnumber), 'utf8');
	} else {
		plusnumber = 0;
		fs.writeFileSync('./recent/RecentChanges-number.txt', Number(plusnumber), 'utf8');
	}
}
function tplus() {
	var plusnumber = fs.readFileSync('./recent/RecentDiscuss-number.txt', 'utf8');
	if(plusnumber) {
		if(Number(plusnumber) === 50) {
			var plusnumber2 = fs.readFileSync('./recent/RecentDiscuss.txt', 'utf8');
			fs.writeFileSync('./recent/RecentDiscuss-2.txt', plusnumber2, 'utf8');
			fs.unlink('./recent/RecentDiscuss.txt', function (err) {
			});
			fs.open('./recent/RecentDiscuss.txt','w+',function(err,fd){
			});
			plusnumber = 0;
		}
		plusnumber = Number(plusnumber) + 1;
		fs.writeFileSync('./recent/RecentDiscuss-number.txt', Number(plusnumber), 'utf8');
	} else {
		plusnumber = 0;
		fs.writeFileSync('./recent/RecentDiscuss-number.txt', Number(plusnumber), 'utf8');
	}
}
// 회원 가입
router.get('/register', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	res.status(200).render('register', { wikiname: name, title: '회원가입' });
	res.end()
});
// 가입 하기
router.post('/register', function(req, res, next) {
	fs.writeFileSync('./user/' + encodeURIComponent(req.body.id) + '.txt', sha3_512(req.body.pw), 'utf8');
	res.redirect('/w/')
});
// 대문으로 이동합니다.
router.get('/', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	res.redirect('/w/'+encodeURIComponent(FrontPage))
});
// 파일 업로드
router.get('/Upload', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	res.status(200).render('upload', { title: '파일 업로드', wikiname: name });
	res.end()
});
// 생성
router.get('/setup', function(req, res, next) {
	fs.exists('./recent/RecentChanges.txt', function (exists) {
		if(!exists) {
			licen = 'CC ZERO';
			name = '오픈나무';
			FrontPage = 'FrontPage';
			
			res.status(200).render('ban', { title: 'Setup', content: "완료 되었습니다.", License: licen, wikiname: name});
			
			fs.mkdirSync('./history', 777);
			fs.mkdirSync('./data', 777);
			fs.mkdirSync('./topic', 777);
			fs.mkdirSync('./setting', 777);
			fs.mkdirSync('./images', 777);
			fs.mkdirSync('./recent', 777);
			fs.mkdirSync('./user', 777);
			
			fs.open('./recent/RecentChanges.txt','w+',function(err,fd){
			});
			fs.open('./recent/RecentChanges-2.txt','w+',function(err,fd){
			});
			fs.open('./recent/RecentChanges-number.txt','w+',function(err,fd){
			});
			fs.open('./recent/RecentDiscuss.txt','w+',function(err,fd){
			});
			fs.open('./recent/RecentDiscuss-2.txt','w+',function(err,fd){
			});
			fs.open('./recent/RecentDiscuss-number.txt','w+',function(err,fd){
			});
			
			fs.open('./setting/Admin.txt','w+', function (err,fd) {
				fs.writeFileSync('./setting/Admin.txt', '::1\n127.0.0.1', 'utf8');
			});
			fs.open('./setting/FrontPage.txt','w+', function (err,fd) {
				fs.writeFileSync('./setting/FrontPage.txt', FrontPage, 'utf8');
			});
			fs.open('./setting/IPban.txt','w+', function (err,fd) {
			});
			fs.open('./setting/License.txt','w+', function (err,fd) {
				fs.writeFileSync('./setting/License.txt', licen, 'utf8');
			});
			fs.open('./setting/WikiName.txt','w+', function (err,fd) {
				fs.writeFileSync('./setting/WikiName.txt', name, 'utf8');
			});
		}
		else {
			licen = rlicen(licen);
			name = rname(name);
			FrontPage = rFrontPage(FrontPage);
			res.status(200).render('ban', { title: 'Setup', content: "이미 파일이 있습니다.", License: licen, wikiname: name});
		}
	});
});
// 토론
router.get('/topic/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var title2 = encodeURIComponent(req.params.page);
  fs.readFile('./topic/'+ encodeURIComponent(req.params.page)+'.txt', 'utf8', function(err, data) {
	res.status(200).render('topic', { title: req.params.page, title2:title2, content: data, wikiname: name });
	res.end()
  })
});
// 토론 블라인드
router.get('/topic/:page/b:number', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var ip = req.headers['x-forwarded-for'] ||
 	  req.connection.remoteAddress ||
	  req.socket.remoteAddress ||
	  req.connection.socket.remoteAddress;
	  var love;
	  var live = /([^,]*),.*/;
	  if(love = live.exec(ip)) {
		ip = love[1];
	  }
    admin(ip);
    var today = getNow();
  
	var sfile = './topic/' + encodeURIComponent(req.params.page)+'-starter.txt';
	fs.exists(sfile, function (exists) {
		if(!exists) {
			res.status(404).render('ban', { title: req.params.page, title2: encodeURIComponent(req.params.page), content: "이 토론이 없습니다. <a href='/topic/"+encodeURIComponent(req.params.page)+"'>토론으로 가기</a>", License: licen, wikiname: name});
			res.end()
			return;
		}
		else {
			res.status(200).render('btopic', { title: req.params.page, title2: encodeURIComponent(req.params.page), wikiname: name, number: req.params.number});
			res.end()
		}
	});
});
router.post('/topic/:page/b:number', function(req, res) {
	var btopic = new RegExp('<td id="b'+req.params.number+'">([^>]*)</td>');
	var topic = fs.readFileSync('./topic/' + encodeURIComponent(req.params.page)+'.txt', 'utf8');
	topic = topic.replace(btopic, "<td style=\"background-color:gray;color:white;\">블라인드 되었습니다.</td>");
	fs.writeFileSync('./topic/' + encodeURIComponent(req.params.page)+'.txt', topic, 'utf8');
	res.redirect('/topic/'+ encodeURIComponent(req.params.page))
});
// post
router.post('/topic/:page', function(req, res) {
  var file = './topic/' + encodeURIComponent(req.params.page)+'.txt';
  var sfile = './topic/' + encodeURIComponent(req.params.page)+'-starter.txt';
  var nfile = './topic/' + encodeURIComponent(req.params.page)+'-number.txt';
  
  var ip = req.headers['x-forwarded-for'] ||
 	  req.connection.remoteAddress ||
	  req.socket.remoteAddress ||
	  req.connection.socket.remoteAddress;
	  var love;
	  var live = /([^,]*),.*/;
	  if(love = live.exec(ip)) {
		ip = love[1];
	  }
  stop(ip);
  var today = getNow();
  
  tplus()
  var plus = fs.readFileSync('./recent/RecentDiscuss.txt', 'utf8');
  fs.writeFileSync('./recent/RecentDiscuss.txt', '<table style="width: 100%;"><tbody><tr><td style="text-align: center;width:33.33%""><a href="/topic/'+encodeURIComponent(req.params.page)+'">'+req.params.page+'</a></td><td style="text-align: center;width:33.33%"">'+ip+'</td><td style="text-align: center;width:33.33%"">'+today+'</td></tr></tbody></table>'+plus, 'utf8');
  
  req.body.content = req.body.content.replace(/</g, "《");
  req.body.content = req.body.content.replace(/>/g, "》");
  req.body.content = req.body.content.replace(/(#[0-9]*)/g, "<a href=\"$1\">$1</a>");
  fs.exists(sfile, function (exists) {
		if(!exists) {
			fs.open(sfile,'w',function(err,fd){
				fs.writeFileSync(sfile, ip, 'utf8');
				fs.writeFileSync(nfile, 2, 'utf8');
				fs.writeFileSync(file,'<table style="width:100%;"><tbody><tr><td style="background-color: #B0D3AD;"><a id="1">#1</a> '+ ip + '<span style="float:right;">'+today+'</span></td></tr><tr><td id="b1">' + req.body.content + '</td></tr></tbody></table><br>');
			});
			res.redirect('/topic/'+ encodeURIComponent(req.params.page))
		}
		else {
			var starter = fs.readFileSync(sfile, 'utf8');
			var number = fs.readFileSync(nfile, 'utf8');
			number = Number(number);
			  var vip = new RegExp(ip);
				if(vip.exec(starter)) {
					fs.appendFile(file,'<table style="width:100%;"><tbody><tr><td style="background-color: #B0D3AD;"><a id="'+number+'">#'+number+'</a> '+ ip + '<span style="float:right;">'+today+'</span></td></tr><tr><td id="b'+number+'">' + req.body.content + '</td></tr></tbody></table><br>',function(err){
						number = number + 1
						fs.writeFileSync(nfile, number, 'utf8');
						res.redirect('/topic/'+ encodeURIComponent(req.params.page))
					});
				}
				else {
					fs.appendFile(file,'<table style="width:100%;"><tbody><tr><td style="background-color: #d5d5d5;"><a id="'+number+'">#'+number+'</a> '+ ip + '<span style="float:right;">'+today+'</span></td></tr><tr><td id="b'+number+'">' + req.body.content + '</td></tr></tbody></table><br>',function(err){
						number = number + 1
						fs.writeFileSync(nfile, number, 'utf8');
						res.redirect('/topic/'+ encodeURIComponent(req.params.page))
				});
			}
		}
  });
});
// 아이피 밴
router.get('/ban', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
  fs.exists('./setting/IPban.txt', function (exists) {
	  if(exists){
		fs.readFile('./setting/IPban.txt', 'utf8', function(err, data) {
			res.status(200).render('ban', { title: '아이피 밴 리스트', content: '<pre>' + data + '</pre>', wikiname: name });
			res.end()
		})
	  }
	  else {
		res.status(404).render('ban', { title: '아이피 밴 리스트', content: '<pre>없음</pre>', wikiname: name });
		res.end()
	  }
  });
});
// 아이피 밴 수정
router.get('/ban/edit', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var ip = req.headers['x-forwarded-for'] ||
 	  req.connection.remoteAddress ||
	  req.socket.remoteAddress ||
	  req.connection.socket.remoteAddress;
	  var love;
	  var live = /([^,]*),.*/;
	  if(love = live.exec(ip)) {
		ip = love[1];
	  }
    admin(ip);
    var today = getNow();
	
	fs.readFile('./setting/IPban.txt', 'utf8', function(err, data) {
		res.render('ipban', { title: req.params.page, content: data, wikiname: name });
		res.end()
	})
});
// 아아피 밴 저장
router.post('/ban/edit', function(req, res) {
	fs.open('./setting/IPban.txt','w+',function(err,fd){
		fs.writeFileSync('./setting/IPban.txt', req.body.content, 'utf8');
	});
	res.redirect('/ban')
});
// 리다이렉트.
router.get('/w/', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	res.redirect('/w/'+encodeURIComponent(FrontPage))
});
// ver
router.get('/ver', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
    res.render('ver', { title:'위키 버전', wikiname: name})
});
// 검색 결과를 보여줍니다.
router.post('/search', function(req, res) {
    fs.exists('./data/' + encodeURIComponent(req.body.name)+'.txt', function (exists) {
		if(exists) {
			res.redirect('/w/'+encodeURIComponent(req.body.name))
		}
		else {
			res.redirect('/edit/'+encodeURIComponent(req.body.name))
		}
	});
});
// diff
router.get('/diff/:page/:r/:rr', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var title2 = encodeURIComponent(req.params.page);
	fs.exists('./history/' + encodeURIComponent(req.params.page)+'/r1.txt', function (exists) {
		if(exists) {
			fs.exists('./history/' + encodeURIComponent(req.params.page)+'/'+req.params.r+'.txt', function (exists) {
				if(exists){
						fs.exists('./history/' + encodeURIComponent(req.params.page)+'/'+req.params.rr+'.txt', function (exists) {
							if(exists) {
								var sc = fs.readFileSync('./history/' + encodeURIComponent(req.params.page)+'/'+req.params.r+'.txt', 'utf8');
								var id = fs.readFileSync('./history/' + encodeURIComponent(req.params.page)+'/'+req.params.rr+'.txt', 'utf8');
 
								var diff = new Diff(); // options may be passed to constructor; see below 
								var textDiff = diff.main(sc, id); // produces diff array 
								
								
								res.status(200).render('diff', { title: req.params.page + ' (' + req.params.r + ' / ' + req.params.rr + ')', title2: title2, wikiname: name, License: licen, content: diff.prettyHtml(textDiff)});
								res.end()
							}
							else {
								res.status(404).render('diff', { title: req.params.page + ' (' + req.params.r + ' / ' + req.params.rr + ')', title2: title2, content: "이 문서의 "+req.params.rr+" 판이 없습니다. <a href='/w/"+encodeURIComponent(req.params.page)+"'>돌아가기</a>", License: licen, wikiname: name });
								res.end()
							}
						});
				}
				else {
					res.status(404).render('diff', { title: req.params.page + ' (' + req.params.r + ' / ' + req.params.rr + ')', title2: title2, content: "이 문서의 "+req.params.r+" 판이 없습니다. <a href='/w/"+encodeURIComponent(req.params.page)+"'>돌아가기</a>", License: licen, wikiname: name });
					res.end()
				}
			});
		}
		else {
			res.status(404).render('ban', { title: req.params.page, title2: title2, content: "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", License: licen, wikiname: name});
			res.end()
			return;
		}
	});
});
// 문서 삭제
router.get('/delete/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var ip = req.headers['x-forwarded-for'] ||
 	  req.connection.remoteAddress ||
	  req.socket.remoteAddress ||
	  req.connection.socket.remoteAddress;
	  var love;
	  var live = /([^,]*),.*/;
	  if(love = live.exec(ip)) {
		ip = love[1];
	  }
	stop(ip);
	var today = getNow();
	var title2 = encodeURIComponent(req.params.page);
  
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function (exists) {
		if(!exists) {
			res.status(404).render('ban', { title: req.params.page, title2: title2, content: "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", License: licen, wikiname: name});
			res.end()
			return;
		}
		else {
			res.status(200).render('delete', { title: req.params.page, title2: title2, wikiname: name});
			res.end()
		}
	})
});
// 문서 삭제 처리
router.post('/delete/:page', function(req, res) {
	var ip = req.headers['x-forwarded-for'] ||
 	  req.connection.remoteAddress ||
	  req.socket.remoteAddress ||
	  req.connection.socket.remoteAddress;
	  var love;
	  var live = /([^,]*),.*/;
	  if(love = live.exec(ip)) {
		ip = love[1];
	  }
	var today = getNow();
	
	rplus();
	var plus = fs.readFileSync('./recent/RecentChanges.txt', 'utf8');
	fs.writeFileSync('./recent/RecentChanges.txt', '<table style="width: 100%;"><tbody><tr><td style="text-align: center;width:33.33%""><a href="/w/'+encodeURIComponent(req.params.page)+'">'+req.params.page+'</a></td><td style="text-align: center;width:33.33%"">'+ip+'</td><td style="text-align: center;width:33.33%"">'+today+'</td></tr><tr><td colspan="3" style="text-align: center;">문서를 삭제함</td></tr></tbody></table>'+plus, 'utf8');
	var i = 0;
	while(true) {
		i = i + 1;
		var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
		if(!exists) {
			fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt','w',function(err,fd){
				fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt', req.body.content, 'utf8');
			});
			fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt','w',function(err,fd){
				fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', ip+'</td><td style="text-align: center;width:33.33%"">'+today+'</td></tr><tr><td colspan="3" style="text-align: center;">문서를 삭제함', 'utf8');
			});
			break;
		}
	}
	fs.unlink('./data/' + encodeURIComponent(req.params.page)+'.txt', function (err) {
	});
	res.redirect('/w/'+ encodeURIComponent(req.params.page))
});
// 문서 이동
router.get('/move/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var ip = req.headers['x-forwarded-for'] ||
 	  req.connection.remoteAddress ||
	  req.socket.remoteAddress ||
	  req.connection.socket.remoteAddress;
	  var love;
	  var live = /([^,]*),.*/;
	  if(love = live.exec(ip)) {
		ip = love[1];
	  }
    stop(ip);
    var today = getNow();
	var title2 = encodeURIComponent(req.params.page);
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function (exists) {
		if(!exists) {
			res.status(404).render('ban', { title: req.params.page, title2: title2, content: "이 문서가 없습니다. <a href='/edit/"+req.params.page+"'>편집</a>", License: licen , wikiname: name});
			res.end()
			return;
		}
		else {
			res.status(200).render('move', { title: req.params.page, title2: title2, wikiname: name});
			res.end()
		}
	})
});
router.post('/move/:page', function(req, res) {
	var ip = req.headers['x-forwarded-for'] ||
 	  req.connection.remoteAddress ||
	  req.socket.remoteAddress ||
	  req.connection.socket.remoteAddress;
	  var today = getNow();
	  
	  var love;
	  var live = /([^,]*),.*/;
	  if(love = live.exec(ip)) {
		ip = love[1];
	  }
	if(req.body.title === '')
	{
		res.send('<script type="text/javascript">alert("문서 이름 없음");</script>');
	}
	var exists = fs.existsSync('./history/' + encodeURIComponent(req.body.title) + '/r1.txt');
	if(exists)
	{
		res.send('<script type="text/javascript">alert("이미 해당 문서가 존재 합니다.");</script>');
	}
	else
	{
		rplus();
		var plus = fs.readFileSync('./recent/RecentChanges.txt', 'utf8');
		fs.writeFileSync('./recent/RecentChanges.txt', '<table style="width: 100%;"><tbody><tr><td style="text-align: center;width:33.33%""><a href="/w/'+encodeURIComponent(req.params.page)+'">'+req.params.page+'</a></td><td style="text-align: center;width:33.33%"">'+ip+'</td><td style="text-align: center;width:33.33%"">'+today+'</td></tr><tr><td colspan="3" style="text-align: center;"><a href="/w/'+encodeURIComponent(req.body.title)+'">'+req.body.title+'</a> 문서로 문서를 이동함</td></tr></tbody></table>'+plus, 'utf8');
		var i = 0;
		fs.mkdirSync('./history/' + encodeURIComponent(req.body.title), 777);
		while(true) {
			i=i+1
			var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
			if(exists) {
				fs.rename('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt','./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'.txt', function (err) {
				});
				fs.rename('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'-ip.txt','./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'-ip.txt', function (err) {
				});
			}
			else {
				break;
			}
		}
		
		var j = 0;
		while(true) {
			j = j + 1;
			var exists = fs.existsSync('./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'.txt');
			if(!exists) {
				fs.open('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '.txt','w',function(err,fd){
					fs.writeFileSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '.txt', req.body.content, 'utf8');
				});
				fs.open('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-ip.txt','w',function(err,fd){
					fs.writeFileSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-ip.txt', ip+'</td><td style="text-align: center;width:33.33%"">'+today+'</td></tr><tr><td colspan="3" style="text-align: center;"><a href="/w/'+encodeURIComponent(req.params.page)+'">'+req.params.page+'</a> 에서 <a href="/w/'+encodeURIComponent(req.params.page)+'">'+req.body.title+'</a> 문서로 문서를 이동함', 'utf8');
				});
				break;
			}
		}
		fs.rmdir('./history/' + encodeURIComponent(req.params.page), function(err) {
		});
			
		fs.rename('./data/' + encodeURIComponent(req.params.page)+'.txt','./data/' + encodeURIComponent(req.body.title)+'.txt', function (err) {
		});
	}
	
	res.redirect('/w/'+ encodeURIComponent(req.body.title))
});
// 항목을 보여줍니다.
router.get('/w/:page', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
  var testing = /\//;
  if(testing.exec(req.params.page)) {
	  var zenkaino = /(.*)\/.*/;
	  var lovelive;
	  var subtitle = zenkaino.exec(req.params.page);
	  if(subtitle[1] == '') {
		  lovelive = req.params.page;
		  var dis = 'none';
	  } else {
		  lovelive = subtitle[1];
	  }
  }
  else {
	  var dis = 'none';
	  lovelive = req.params.page;
	  console.log(dis)
  }
  var title2 = encodeURIComponent(req.params.page);
  fs.readFile('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8', function(err, data) {
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function (exists) {
		if(!exists) {
			res.status(404).render('ban', { title: req.params.page, title2: title2, subtitle: encodeURIComponent(lovelive), content: "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", License: licen, wikiname: name});
			res.end()
			return;
		}
		else {
			var redirect = /^#(?:넘겨주기|redirect) ([^\n]*)/g;
			var dtest;
			if(dtest = redirect.exec(data)) {
				data = data.replace(redirect, "<head><meta http-equiv=\"refresh\" content=\"0;url=/w/"+encodeURIComponent(dtest[1])+"/redirect/"+encodeURIComponent(req.params.page)+"\" /></head><li>리다이렉트 [[$1]]</li>");
				res.status(200).render('index', { title: req.params.page, dis: dis, title2: title2, subtitle: encodeURIComponent(lovelive), content: data, License: licen , wikiname: name});
				res.end()
			}
			else {
				parseNamu(data, function(cnt){
					res.status(200).render('index', { title: req.params.page, dis: dis, title2: title2, subtitle: encodeURIComponent(lovelive), content: cnt, License: licen , wikiname: name});
					res.end()
				})
			}
		}
	})
  })
});

router.get('/w/:page/redirect/:rdrc', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
  var testing = /\//;
  if(testing.exec(req.params.page)) {
	  var zenkaino = /(.*)\/.*/;
	  var lovelive;
	  var subtitle = zenkaino.exec(req.params.page);
	  if(subtitle[1] == '') {
		  lovelive = req.params.page;
		  var dis = 'none';
	  } else {
		  lovelive = subtitle[1];
	  }
  }
  else {
	  var dis = 'none';
	  lovelive = req.params.page;
	  console.log(dis)
  }
  var title2 = encodeURIComponent(req.params.page);
  fs.readFile('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8', function(err, data) {
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function (exists) {
		if(!exists) {
			res.status(404).render('ban', { title: req.params.page, title2: title2, subtitle: encodeURIComponent(lovelive), content: '<li><a href="/edit/' + req.params.rdrc + '">' + req.params.rdrc + '</a> 에서 넘어 왔습니다.</li><br>' + "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", License: licen, wikiname: name});
			res.end()
			return;
		}
		else {
			var redirect = /^#(?:넘겨주기|redirect) ([^\n]*)/g;
			if(redirect.exec(data)) {
				data = data.replace(redirect, "{{{#!html <li>리다이렉트 [[$1]]</li>}}}");
			}
			parseNamu(data, function(cnt){
				res.status(200).render('index', { title: req.params.page, title2: title2, dis:dis, subtitle: encodeURIComponent(lovelive), content: '<li><a href="/edit/' + req.params.rdrc + '">' + req.params.rdrc + '</a> 에서 넘어 왔습니다.</li><br>' + cnt, License: licen , wikiname: name});
				res.end()
			})
		}
	})
  })
});
// 최근 바뀜을 보여줍니다.
router.get('/RecentChanges', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
  fs.readFile('./recent/RecentChanges.txt', 'utf8', function(err, data) {
		res.status(200).render('re1', { title: '최근 변경내역', content: data, License: licen , wikiname: name});
		res.end()
  });
});
// 최근 바뀜 2를 보여줍니다.
router.get('/RecentChanges2', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
  fs.readFile('./recent/RecentChanges-2.txt', 'utf8', function(err, data) {
		res.status(200).render('re2', { title: '최근 변경내역 2', content: data, License: licen , wikiname: name});
		res.end()
  });
});
// 최근 토론을 보여줍니다.
router.get('/RecentDiscuss', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
  fs.readFile('./recent/RecentDiscuss.txt', 'utf8', function(err, data) {
		res.status(200).render('de1', { title: '최근 토론내역', content: data, License: licen , wikiname: name});
		res.end()
  });
});
// 최근 토론 2를 보여줍니다.
router.get('/RecentDiscuss2', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
  fs.readFile('./recent/RecentDiscuss-2.txt', 'utf8', function(err, data) {
		res.status(200).render('de2', { title: '최근 토론내역 2', content: data, License: licen , wikiname: name});
		res.end()
  });
});
// raw를 보여줍니다.
router.get('/raw/:page', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
  fs.readFile('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8', function(err, data) {
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function (exists) {
		if(!exists) {
			res.status(404).render('ban', { title: req.params.page, content: "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", License: licen ,wikiname: name});
			res.end()
			return;
		}
		else {
			res.status(200).render('ban', { title: req.params.page, content: '<pre>' + htmlencode.htmlEncode(data) + '</pre>', License: licen ,wikiname: name});
			res.end()
		}
	})
  })
});
// 보냅니다.
router.post('/history/:page', function(req, res, next) {
	res.redirect('/diff/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.body.r) + '/' + encodeURIComponent(req.body.rr));
});
// 편집 화면을 보여줍니다.
router.get('/edit/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var ip = req.headers['x-forwarded-for'] ||
 	  req.connection.remoteAddress ||
	  req.socket.remoteAddress ||
	  req.connection.socket.remoteAddress;
	  var love;
	  var live = /([^,]*),.*/;
	  if(love = live.exec(ip)) {
		ip = love[1];
	  }
    stop(ip);
    var today = getNow();
	
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function(exists) {
		if(!exists){
			res.render('edit', { title: req.params.page, title2: encodeURIComponent(req.params.page), content: "" , wikiname: name});
			res.end()
		}
		else{
			var data = fs.readFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8');
			res.render('edit', { title: req.params.page, title2: encodeURIComponent(req.params.page), content: data , wikiname: name});
			res.end()
		}
	})
});
// 미리보기
router.post('/preview/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var redirect = /^#(?:넘겨주기|redirect) ([^\n]*)/g;
	var data = req.body.content;
	data = data.replace(redirect, "{{{#!html <li>리다이렉트 [[$1]]</li>}}}");
	parseNamu(data, function(cnt){
		res.render('preview', { title: req.params.page,  title2: encodeURIComponent(req.params.page), data: data, content: cnt , wikiname: name});
		res.end()
	});
});
// 모든 문서
router.get('/TitleIndex', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var sun = fs.readdirSync('./data');
	var shine = 0;
	var ganba;
	var ruby = '<div>';
	var dayo = /(.*)\.txt/;
	var hehe;
	while(true) {
		if(sun[shine]) {
			hehe = decodeURIComponent(sun[shine]);
			ganba = dayo.exec(hehe);
			ruby = ruby + '<li>' + '<a href="/w/' + encodeURIComponent(ganba[1]) + '">' + ganba[1] + '</a></li>';
		}
		else {
			ruby = ruby + '</div>';
			break;
		}
		shine = shine + 1;
	}
	res.render('ban', { title: '모든 문서', content: ruby + '<br>' + shine + '개의 문서' , wikiname: name});
});
// 편집 결과를 적용하고 해당 문서로 이동합니다.
router.post('/edit/:page', function(req, res) {
	var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
	var today = getNow();
	var love;
	var live = /([^,]*),.*/;
	if(love = live.exec(ip)) {
		ip = love[1];
	}
	if(!req.body.send)
	{
		req.body.send = "<br>";
	}
	rplus();
	var plus = fs.readFileSync('./recent/RecentChanges.txt', 'utf8');
	fs.writeFileSync('./recent/RecentChanges.txt', '<table style="width: 100%;"><tbody><tr><td style="text-align: center;width:33.33%""><a href="/w/'+encodeURIComponent(req.params.page)+'">'+req.params.page+'</a></td><td style="text-align: center;width:33.33%"">'+ip+'</td><td style="text-align: center;width:33.33%"">'+today+'</td></tr><tr><td colspan="3" style="text-align: center;">'+req.body.send+'</td></tr></tbody></table>'+plus, 'utf8');
	fs.exists('./data/' + encodeURIComponent(req.params.page)+'.txt', function (exists) {
		if(!exists) {
			var file = './data/' + encodeURIComponent(req.params.page)+'.txt';
			fs.open(file,'w',function(err,fd){
				fs.writeFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', req.body.content, 'utf8');
			});
			fs.exists('./history/' + encodeURIComponent(req.params.page) + '/r1.txt', function (exists) {
				if(!exists) {
					fs.mkdir('./history/' + encodeURIComponent(req.params.page), 777, function(err) {
						fs.open('./history/' + encodeURIComponent(req.params.page) + '/r1.txt','w+',function(err,fd){
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1.txt', req.body.content, 'utf8');
						});
						fs.open('./history/' + encodeURIComponent(req.params.page) + '/r1-ip.txt','w+',function(err,fd){
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-ip.txt', ip+'</td><td style="text-align: center;width:33.33%"">'+today+'</td></tr><tr><td colspan="3" style="text-align: center;">'+req.body.send, 'utf8');
						});
					});
				}
				else {
					var i = 0;
					while(true) {
						i = i + 1;
						var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
						if(!exists) {
							fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt','w+',function(err,fd){
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt', req.body.content, 'utf8');
							});
							fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt','w+',function(err,fd){
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', ip+'</td><td style="text-align: center;width:33.33%"">'+today+'</td></tr><tr><td colspan="3" style="text-align: center;">'+req.body.send, 'utf8');
							});
							break;
						}
					}
				}
			});
		}
		else {
			fs.writeFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', req.body.content, 'utf8');
			fs.exists('./history/' + encodeURIComponent(req.params.page) + '/r1.txt', function (exists) {
				if(!exists) {
					fs.mkdir('./history/' + encodeURIComponent(req.params.page), 777, function(err) {
						fs.open('./history/' + encodeURIComponent(req.params.page) + '/r1.txt','w',function(err,fd){
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1.txt', req.body.content, 'utf8');
						});
						fs.open('./history/' + encodeURIComponent(req.params.page) + '/r1-ip.txt','w',function(err,fd){
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-ip.txt', ip+'</td><td style="text-align: center;width:33.33%"">'+today+'</td></tr><tr><td colspan="3" style="text-align: center;">'+req.body.send, 'utf8');
						});
					});
				}
				else {
					var i = 0;
					while(true) {
						i = i + 1;
						var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
						if(!exists) {
							fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt','w',function(err,fd){
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt', req.body.content, 'utf8');
							});
							fs.open('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt','w',function(err,fd){
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', ip+'</td><td style="text-align: center;width:33.33%"">'+today+'</td></tr><tr><td colspan="3" style="text-align: center;">'+req.body.send, 'utf8');
							});
							break;
						}
					}
				}
			});
		}
	});
	res.redirect('/w/'+ encodeURIComponent(req.params.page))
});
// 역사 2
router.get('/history/:page/:r', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var title3 = encodeURIComponent(req.params.page);
	fs.exists('./history/' + encodeURIComponent(req.params.page) + '/' + req.params.r + '.txt', function (hists) {
		if(hists) {
			var neob = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/' + req.params.r + '.txt', 'utf8');
			res.status(200).render('history', { title: req.params.page, title3: title3, title2: req.params.page + ' (' + req.params.r + ' 판)', content: '<pre>' + htmlencode.htmlEncode(neob) + '</pre>', wikiname: name , License: licen});
			res.end()
		}
		else {
			res.status(404).render('history', { title: req.params.page, title3: title3, content: "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>", License: licen ,wikiname: name});
			res.end()
			return;
		}
	});
});
// 역사
router.get('/history/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var title2 = encodeURIComponent(req.params.page);
	var i = 0;
	var neoa = '<div id="history">';
	while(true) {
		i = i + 1;
		var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
		if(exists) {
			var ip = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', 'utf8');
			neoa = '<table style="width: 100%;"><tbody><tr><td style="text-align: center;width:33.33%""><a href="/history/'+encodeURIComponent(req.params.page)+'/r'+i+'">r'+i+'</a></td><td style="text-align: center;width:33.33%"">'+ip+'</td></tr></tbody></table>' + neoa;
		}
		else {
			neoa = neoa + '</div>';
			res.status(200).render('history2', { title: req.params.page, title2:title2, content: neoa, License: licen ,wikiname: name});
			break;
			res.end()
			return;
		}
	}
});

module.exports = router;
