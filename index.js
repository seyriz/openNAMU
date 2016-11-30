var express = require('express');
var router = express.Router();
var parseNamu = require('./module-internal/namumark')
var fs = require('fs');
var htmlencode = require('htmlencode');
var Diff = require('text-diff');
var Cokies = require( "js-cookie" )
var Cookies = require( "cookies" )
var utf8 = require('utf8');
var bcrypt = require('bcrypt');
var licen;
var name;
var FrontPage;
var lb;
var aya;


// 라이선스
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
// 위키 이름
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
// 대문
function rFrontPage(FrontPage) {
	var exists = fs.existsSync('./setting/FrontPage.txt');
	if(exists) {
		var test = /%0A$/;
		FrontPage = fs.readFileSync('./setting/FrontPage.txt', 'utf8');
		if(test.exec(FrontPage)) {
			FrontPage = FrontPage.replace(test, '');
		}
	}
	else {
		FrontPage = "FrontPage";
	}
	return FrontPage;
}
// 시간
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
// 아이피
function yourip(req, res) {
	var test = (req.headers['x-forwarded-for'] || '').split(',')[0]
        || req.connection.remoteAddress;

	var cookies = new Cookies( req, res )
	, AqoursGanbaRuby, WikiID

	if(cookies.get( "WikiID" ) && cookies.get( "AqoursGanbaRuby" )) {
		id = cookies.get( "WikiID" );
		pw = cookies.get( "AqoursGanbaRuby" );

		var exists = fs.existsSync('./user/' + id + '.txt');
		if(exists) {
			var pass = fs.readFileSync('./user/' + id + '.txt', 'utf8');
			var test = pw;

			if(pass === test) {
				test = decodeURIComponent(id);
			}
			else {
				cookies.set( "AqoursGanbaRuby", '' );
				cookies.set( "WikiID", '' );
			}
		}
		else {
			cookies.set( "AqoursGanbaRuby", '' );
			cookies.set( "WikiID", '' );
		}
	}
	return test;
}
// 로그인 부분 display
function loginy(req,res) {
	var cookies = new Cookies( req, res )
	, AqoursGanbaRuby, WikiID

	if(cookies.get( "WikiID" ) && cookies.get( "AqoursGanbaRuby" )) {
		var dis2 = 'none';
	}
	return dis2;
}

function loginny(req,res) {
	var cookies = new Cookies( req, res )
	, AqoursGanbaRuby, WikiID

	if(cookies.get( "WikiID" ) && cookies.get( "AqoursGanbaRuby" )) {
		var dis3 = 'inline-block';
	}
	return dis3;
}
// 밴
function stop(ip) {
    var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
	if(exists) {
		var day = fs.readFileSync('./user/' + encodeURIComponent(ip) + '-ban.txt', 'utf8');
		if(day === '') {
			return 'test';
		}
		else {
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
			var today = yyyy+'-' + mm+'-'+dd;
			today = today.replace(/-/g, '');
			var nowday = day.replace(/-/g, '');
			if(today === nowday) {
				fs.unlinkSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
			}
			else if(today > nowday) {
			    fs.unlinkSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
			}
			else {
			    return 'test';
			}
		}
	}
}
// acl
function editstop(ip, page) {
	var exists = fs.existsSync('./data/' + encodeURIComponent(page) + '-stop.txt');
	if(exists) {
		aya = admin(ip);
		if(aya) {
			return aya;
		}
	}
}
// 어드민
function admin(ip) {
	var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-admin.txt');
	if(!exists) {
		return 'test';
	}
}
// 소유자
function mine(ip) {
	var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-mine.txt');
	if(!exists) {
		res.send('<script type="text/javascript">alert("소유자가 아닙니다.");</script>')
	}
}
// 최근 바뀜 추가
function rplus(ip, today, name, rtitle, now, req, content) {
	var number = fs.readFileSync('./recent/RC-number.txt', 'utf8');
	fs.writeFileSync('./recent/RC-number.txt', Number(number)+1, 'utf8');
	fs.openSync('./recent/RC-' + number + '.txt','w+');
	fs.writeFileSync('./recent/RC-' + number + '.txt', name, 'utf8');
	fs.openSync('./recent/RC-' + number + '-title.txt','w+');
	fs.writeFileSync('./recent/RC-' + number + '-title.txt', rtitle, 'utf8');
	fs.openSync('./recent/RC-' + number + '-ip.txt','w+');
	fs.writeFileSync('./recent/RC-' + number + '-ip.txt', ip, 'utf8');
	fs.openSync('./recent/RC-' + number + '-today.txt','w+');
	fs.writeFileSync('./recent/RC-' + number + '-today.txt', today, 'utf8');
	if(content) {
		if(!now) {
			var leng = req.body.content.length;
			fs.openSync('./recent/RC-' + number + '-leng.txt','w+');
			leng = '+' + leng
			fs.writeFileSync('./recent/RC-' + number + '-leng.txt', leng, 'utf8');
			return leng;
		}
		else if(now.length > req.body.content.length) {
			var leng = now.length - req.body.content.length;
			fs.openSync('./recent/RC-' + number + '-leng.txt','w+');
			leng = '-' + leng
			fs.writeFileSync('./recent/RC-' + number + '-leng.txt', leng, 'utf8');
			return leng;
		}
		else if(now.length < req.body.content.length) {
			var leng = req.body.content.length - now.length;
			fs.openSync('./recent/RC-' + number + '-leng.txt','w+');
			leng = '+' + leng
			fs.writeFileSync('./recent/RC-' + number + '-leng.txt', leng, 'utf8');
			return leng;
		}
	}
}
// 최근 토론 추가
function tplus(ip, today, name, name2) {
	var number = fs.readFileSync('./recent/RD-number.txt', 'utf8');
	fs.writeFileSync('./recent/RD-number.txt', Number(number)+1, 'utf8');
	fs.openSync('./recent/RD-' + number + '.txt','w+');
	fs.writeFileSync('./recent/RD-' + number + '.txt', name, 'utf8');
	fs.openSync('./recent/RD-' + number + '-title.txt','w+');
	fs.writeFileSync('./recent/RD-' + number + '-title.txt', name2, 'utf8');
	fs.openSync('./recent/RD-' + number + '-ip.txt','w+');
	fs.writeFileSync('./recent/RD-' + number + '-ip.txt', ip, 'utf8');
	fs.openSync('./recent/RD-' + number + '-today.txt','w+');
	fs.writeFileSync('./recent/RD-' + number + '-today.txt', today, 'utf8');
}
// 회원 가입
router.get('/register', function(req, res) {
	name = rname(name);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	res.status(200).render('register', {
		wikiname: name,
		dis2: dis2,
		dis3: dis3,
		title: '회원가입'
	});
	res.end();
	return;
 });
// 가입 하기
router.post('/register', function(req, res) {
	var ip = yourip(req,res);
	var stopy;
    stopy = stop(ip);
    if(stopy) {
   	  res.redirect('/ban');
    }
	else {
		var nope = /\-/;
		var nnope = /\:/;
		var nnnope = /\./;
		var nnnnope = />/;
		var nnnnnope = /</;
		if(nope.exec(req.body.id)) {
			res.send('<script type="text/javascript">alert("닉네임에 - . : < >은 들어 갈 수 없습니다.");</script>')
		}
		else if(nnope.exec(req.body.id)) {
			res.send('<script type="text/javascript">alert("닉네임에 - . : < >은 들어 갈 수 없습니다.");</script>')
		}
		else if(nnnope.exec(req.body.id)) {
			res.send('<script type="text/javascript">alert("닉네임에 - . : < >은 들어 갈 수 없습니다.");</script>')
		}
		else if(nnnnope.exec(req.body.id)) {
			res.send('<script type="text/javascript">alert("닉네임에 - . : < >은 들어 갈 수 없습니다.");</script>')
		}
		else if(nnnnnope.exec(req.body.id)) {
			res.send('<script type="text/javascript">alert("닉네임에 - . : < >은 들어 갈 수 없습니다.");</script>')
		}
		else {
			if(!fs.existsSync('./user')){
				fs.mkdirSync('./user')
			}
			var exists = fs.existsSync('./user/' + encodeURIComponent(req.body.id) + '.txt');
			if(!exists) {
				fs.writeFileSync('./user/' + encodeURIComponent(bcrypt.hashSync(req.body.id, saltRounds)) + '.txt', hash, 'utf8');
				res.redirect('/login')
			}
			else {
				res.send('<script type="text/javascript">alert("이미 있는 계정 입니다.");</script>')
			}
		}
	}
 });
// 로그아웃
router.get('/logout', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	var cookies = new Cookies( req, res )
	, AqoursGanbaRuby, WikiID
	if(cookies.get( "WikiID" ) && cookies.get( "AqoursGanbaRuby" )) {
		cookies.set( "AqoursGanbaRuby", '' );
		cookies.set( "WikiID", '' );
		res.status(200).render('ban', {
			title: '로그아웃',
			content: "로그아웃 했습니다.",
			License: licen,
			wikiname: name
		});
		res.end();
		return;
	}
	else {
		res.redirect('/login');
	}
 });
// 로그인
router.get('/login', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	var cookies = new Cookies( req, res )
	, AqoursGanbaRuby, WikiID
	if(cookies.get( "WikiID" ) && cookies.get( "AqoursGanbaRuby" )) {
		res.status(200).render('ban', {
			title: '로그인',
			content: "이미 로그인 되어 있습니다.",
			License: licen,
			wikiname: name
		});
		res.end();
		return;
	}
	else {
		res.status(200).render('login', {
			wikiname: name,
			title: '로그인'
		});
		res.end();
		return;
	}
 });
// 로그인 하기
router.post('/login', function(req, res) {
	var ip = yourip(req,res);
	var stopy;
	stopy = stop(ip);
	if(stopy) {
		res.redirect('/ban');
	}
	else {
		var exists = fs.existsSync('./user/' + encodeURIComponent(req.body.id) + '.txt');
		if(exists) {
			var pass = fs.readFileSync('./user/' + encodeURIComponent(req.body.id) + '.txt', 'utf8');
			var test = '';

			if(bcrypt.compareSync(req.body.pw, pass)) {
				var cookies = new Cookies( req, res )
				, AqoursGanbaRuby, WikiID
				cookies.set( "AqoursGanbaRuby", test )
				cookies.set( "WikiID", encodeURIComponent(req.body.id) )
			}
			else {
				res.send('<script type="text/javascript">alert("암호가 틀렸습니다!");</script>')
			}

		}
		else {
			res.send('<script type="text/javascript">alert("계정이 없습니다!");</script>')
		}
		res.redirect('/w/');
	}
});

// 대문으로 이동합니다.
router.get('/', function(req, res) {
	FrontPage = rFrontPage(FrontPage);
	res.redirect('/w/'+encodeURIComponent(FrontPage));
});

// 파일 업로드
router.get('/Upload', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	res.status(200).render('upload', {
		title: '파일 업로드',
		dis2: dis2,
		dis3: dis3,
		wikiname: name
	});
	res.end();
	return;
});
// 사용자 문서
router.get('/user/:user', function(req, res) {
  licen = rlicen(licen);
  name = rname(name);
  var title2 = encodeURIComponent(req.params.user)
  var dis2 = loginy(req,res)
  var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt');
  if(!exists) {
	  res.status(200).render('user', {
		  title: '사용자:' + req.params.user,
		  dis: 'none',
		  dis2: dis2,
		  title2: title2,
		  content: '이 문서가 없습니다.',
		  License: licen,
		  wikiname: name
	  });
	  res.end();
	  return;
  }
  else {
	  var data = fs.readFileSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt');
	  var redirect = /^#(?:넘겨주기|redirect)\s([^\n]*)/ig;
	  if(redirect.exec(data)) {
		data = data.replace(redirect, " * 리다이렉트 [[$1]]");
	  }
	  parseNamu(req, data, function(cnt){
		    var leftbar = /<div id="toc">(((?!\/div>).)*)<\/div>/;
			var leftbarcontect;
			if(leftbarcontect = leftbar.exec(cnt)) {
				lb = 'block';
			}
			else {
				leftbarcontect = ['',''];
			}
			res.status(200).render('user', {
				lbc: leftbarcontect[1],
				lb: lb,
				title: '사용자:' + req.params.user,
				dis: 'none',
				dis2: dis2,
				title2: title2,
				content: cnt,
				License: licen,
				wikiname: name
			});
			res.end();
			return;
	  })
  }
});
// 사용자 편집
router.get('/edit/user/:user', function(req, res) {
    licen = rlicen(licen);
    name = rname(name);
    var ip = yourip(req,res);
    var title2 = encodeURIComponent(req.params.user);
    var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt');
	if(!exists) {
		res.status(200).render('user-edit', {
			title: '사용자:' + req.params.user,
			dis2: dis2,
			dis3: dis3,
			title2: title2,
			content: '',
			License: licen,
		    wikiname: name
		});
		res.end();
	    return;
	}
	else {
		var data = fs.readFileSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt');
		res.status(200).render('user-edit', {
			title: '사용자:' + req.params.user,
			dis2: dis2,
			dis3: dis3,
			title2: title2,
			content: data,
			License: licen,
			wikiname: name
	    });
	    res.end();
	    return;
	}
});
router.post('/edit/user/:user', function(req, res) {
    licen = rlicen(licen);
    name = rname(name);
    var title2 = encodeURIComponent(req.params.user);
    var ip = yourip(req,res);
    var stopy;
    stopy = stop(ip);
    if(stopy) {
	    res.redirect('/ban');
    }
    else {
		var cookies = new Cookies( req, res )
		, AqoursGanbaRuby, WikiID
		if(cookies.get( "WikiID" ) && cookies.get( "AqoursGanbaRuby" )) {
			id = cookies.get( "WikiID" );
			pw = cookies.get( "AqoursGanbaRuby" );
			var exists = fs.existsSync('./user/' + id + '.txt');
			if(exists) {
				var pass = fs.readFileSync('./user/' + id + '.txt', 'utf8');
				var test = pw;
				if(pass === test) {
					if(encodeURIComponent(req.params.user) === id) {
						var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt');
						if(exists) {
							fs.writeFileSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt', req.body.content, 'utf8');
						}
						else {
							fs.openSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt','w+');
							fs.writeFileSync('./user/' + encodeURIComponent(req.params.user) + '-page.txt', req.body.content, 'utf8');
						}
						res.redirect('/user/'+encodeURIComponent(req.params.user));
					}
					else {
						res.redirect('/user/' + encodeURIComponent(req.params.user));
					}
				}
				else {
					cookies.set( "AqoursGanbaRuby", '' );
					cookies.set( "WikiID", '' );
					res.redirect('/user/' + encodeURIComponent(req.params.user));
				}
			}
			else {
				cookies.set( "AqoursGanbaRuby", '' );
				cookies.set( "WikiID", '' );
				res.redirect('/user/' + encodeURIComponent(req.params.user));
			}
		}
		else {
			res.send('<script type="text/javascript">alert("본인 문서가 아닙니다.");</script>')
		}
    }
});
// 생성
router.get('/setup', function(req, res) {
	licen = 'CC ZERO';
	name = '오픈나무';
	FrontPage = 'FrontPage';
	var exists = fs.existsSync('./user/');
	if(!exists) {
		fs.mkdirSync('./user', 777);
	}
	var exists = fs.existsSync('./topic/');
	if(!exists) {
		fs.mkdirSync('./topic', 777);
	}
	var exists = fs.existsSync('./data/');
	if(!exists) {
		fs.mkdirSync('./data', 777);
	}
	var exists = fs.existsSync('./recent/');
	if(!exists) {
		fs.mkdirSync('./recent', 777);
	}
	var exists = fs.existsSync('./setting/');
	if(!exists) {
		fs.mkdirSync('./setting', 777);
	}
	var exists = fs.existsSync('./history/');
	if(!exists) {
		fs.mkdirSync('./history', 777);
	}
	var exists = fs.existsSync('./recent/RC-number.txt');
	if(!exists) {
		fs.openSync('./recent/RC-number.txt','w+');
		fs.writeFileSync('./recent/RC-number.txt', 1, 'utf8');
	}
	var exists = fs.existsSync('./recent/RD-number.txt');
	if(!exists) {
		fs.openSync('./recent/RD-number.txt','w+');
		fs.writeFileSync('./recent/RD-number.txt', 1, 'utf8');
	}
	var exists = fs.existsSync('./setting/FrontPage.txt');
	if(!exists) {
		fs.openSync('./setting/FrontPage.txt','w+');
		fs.writeFileSync('./setting/FrontPage.txt', FrontPage, 'utf8');
	}
	var exists = fs.existsSync('./setting/License.txt');
	if(!exists) {
		fs.openSync('./setting/License.txt','w+');
		fs.writeFileSync('./setting/License.txt', licen, 'utf8');
	}
	var exists = fs.existsSync('./setting/WikiName.txt');
	if(!exists) {
		fs.openSync('./setting/WikiName.txt','w+');
		fs.writeFileSync('./setting/WikiName.txt', name, 'utf8');
	}
	var exists = fs.existsSync('./setting/CapSec.txt');
	if(!exists) {
		fs.openSync('./setting/CapSec.txt','w+');
	}
	var exists = fs.existsSync('./setting/CapSec.txt');
	if(!exists) {
		fs.openSync('./setting/CapPub.txt.txt','w+');
	}
	var exists = fs.existsSync('./setting/Plugin.txt');
	if(!exists) {
		fs.openSync('./setting/Plugin.txt','w+');
		fs.writeFileSync('./setting/Plugin.txt', 'true', 'utf8');
	}
	res.status(200).render('ban', {
		title: 'Setup',
		content: "완료 되었습니다.",
		License: licen,
		wikiname: name
	});
	res.end();
	return;
 });
// 토론
router.get('/topic/:page', function(req, res) {
    licen = rlicen(licen);
    name = rname(name);
    var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
    var title2 = encodeURIComponent(req.params.page);
    var exists = fs.existsSync('./topic/' + encodeURIComponent(req.params.page) + '/');
    if(exists) {
		var topic = fs.readdirSync('./topic/' + encodeURIComponent(req.params.page) + '/');
		var i = 0;
		var add = '<div id="all_topic">';
		while(true) {
			j = i + 1;
			if(!topic[i]) {
				break;
			}
			else {
				add = add + '<h2><a href="/topic/' + encodeURIComponent(req.params.page) + '/' + topic[i] + '">' + j + '. ' + htmlencode.htmlEncode(decodeURIComponent(topic[i])) + '</a></h2>';

				var data = htmlencode.htmlEncode(fs.readFileSync('./topic/' + encodeURIComponent(req.params.page) + '/' + topic[i] + '/1.txt', 'utf8'));
				var ip = fs.readFileSync('./topic/' + encodeURIComponent(req.params.page) + '/' + topic[i] + '/1-ip.txt', 'utf8');
				var today = fs.readFileSync('./topic/' + encodeURIComponent(req.params.page) + '/' + topic[i] + '/1-today.txt', 'utf8');
				data = data.replace(/&lt;a href=&quot;(#[0-9]*)&quot;&gt;(?:#[0-9]*)&lt;\/a&gt;/g, '<a href="$1">$1</a>')
				var exists = fs.existsSync('./topic/' + encodeURIComponent(req.params.page) + '/' + topic[i] + '/1-stop.txt');
				if(exists) {
					data = '블라인드 되었습니다.';
				}
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-admin.txt');
				if(exists) {
					add = add + '<table id="toron"><tbody><tr><td id="toroncoloradmin"><a href="javascript:void(0);" id="1">#1</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
				}
				else {
					add = add + '<table id="toron"><tbody><tr><td id="toroncolorgreen"><a href="javascript:void(0);" id="1">#1</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
				}
				var exists = fs.existsSync('./topic/' + encodeURIComponent(req.params.page) + '/' + topic[i] + '/stop.txt');
				if(exists) {
					add = add + '<table id="toron"><tbody><tr><td id="toroncolorstop"><a href="javascript:void(0);" id="stop">#stop</a> 관리자</td></tr><tr><td>이 토론은 관리자에 의하여 지금 정지 되었습니다.</td></tr></tbody></table><br>'
				}
			}
			i = i + 1;
		}
	}
    else {
	  var add = '';
    }
    res.status(200).render('new-topic', {
		title: req.params.page,
		dis2: dis2,
		dis3: dis3,
		title2: title2,
		content: add,
		wikiname: name
    });
    res.end();
    return;
});

// 토론으로 보냄
router.post('/topic/:page', function(req, res) {
    res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.body.topic));
});

// 토론 블라인드
router.get('/topic/:page/:topic/b:number', function(req, res) {
	var ip = yourip(req,res);
    aya = admin(ip);
	if(aya) {
		res.redirect('/Access');
	}
	else {
		var file = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic);
		var sfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/starter.txt';
		var exists = fs.existsSync(sfile);
		if(!exists) {
			res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic));
		}
		else {
			var exists = fs.existsSync(file + '/' + req.params.number + '.txt');
			if(!exists) {
				res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic));
			}
			else {
				var exists = fs.existsSync(file + '/' + req.params.number + '-stop.txt');
				if(exists) {
					fs.unlinkSync(file + '/' + req.params.number + '-stop.txt');
				}
				else {
					fs.openSync(file + '/' + req.params.number + '-stop.txt','w');
				}
				res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic));
			}
		}
	}
});

// 토론 정지
router.get('/topic/:page/:topic/stop', function(req, res) {
	name = rname(name);
	var ip = yourip(req,res);
    aya = admin(ip);
	if(aya) {
		res.redirect('/Access');
	}
	else {
		var sfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/stop.txt';
		var exists = fs.existsSync(sfile);
		if(!exists) {
			fs.openSync(sfile,'w+');
		}
		else {
			fs.unlinkSync(sfile);
		}
		res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic))
	}
});
// 토론 명
router.get('/topic/:page/:topic', function(req, res) {
    licen = rlicen(licen);
    name = rname(name);
    var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
    var admin = yourip(req, res);
    var title2 = encodeURIComponent(req.params.page);
    var title3 = encodeURIComponent(req.params.topic);
    var file = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic);
    var sfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/starter.txt';
    var nfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/number.txt';
    var rfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/';
    var stfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/stop.txt';

    var exists = fs.existsSync(rfile);
    if(!exists) {
		if(encodeURIComponent(req.params.page).length > 255) {
			res.send('<script type="text/javascript">alert("문서 명이 너무 깁니다.");</script>')
		}
		else if(encodeURIComponent(req.params.topic) + '-10000-today'.length > 255) {
			res.send('<script type="text/javascript">alert("토론 명이 너무 깁니다.");</script>')
		}
		var toronstop = '';
		res.status(200).render('topic', {
			title: req.params.page,
			dis2: dis2,
			dis3: dis3,
			title2: title2,
			title3: req.params.topic,
			title4: title3,
			content: '',
			wikiname: name,
			toronstop: toronstop
		});
		res.end();
		return;
    }
	else {
		if(encodeURIComponent(req.params.page).length > 255) {
			res.send('<script type="text/javascript">alert("문서 명이 너무 깁니다.");</script>')
		}
		else if(encodeURIComponent(req.params.topic) + '-10000-today'.length > 255) {
			res.send('<script type="text/javascript">alert("토론 명이 너무 깁니다.");</script>')
		}
		var number = fs.readFileSync(nfile, 'utf8');
		number = Number(number);
		var starter = fs.readFileSync(sfile, 'utf8');
		var i = 0;
		var add = '<div id="new_game">';
		var exists = fs.existsSync('./user/' + admin + '-admin.txt');
		if(exists) {
			var exists = fs.existsSync(stfile);
			if(exists) {
				add = add + '<a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/stop">(토론 재개)</a><br><br>';
			}
			else {
				add = add + '<a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/stop">(토론 정지)</a><br><br>';
			}
		}
		while(true) {
			i = i + 1;

			if(number === i) {
				add = add + '</div>';
				break;
			}
			else {
				var data = htmlencode.htmlEncode(fs.readFileSync(file + '/' + i + '.txt', 'utf8'));
				var ip = fs.readFileSync(file + '/' + i + '-ip.txt', 'utf8');
				var today = fs.readFileSync(file + '/' + i + '-today.txt', 'utf8');
				data = data.replace(/&lt;a href=&quot;(#[0-9]*)&quot;&gt;(?:#[0-9]*)&lt;\/a&gt;/g, '<a href="$1">$1</a>')
				var bl = '블라인드';
				var exists = fs.existsSync('./user/' + ip + '-admin.txt');
				if(exists) {
					var exists = fs.existsSync('./user/' + admin + '-admin.txt');
					if(exists) {
						var exists = fs.existsSync(file + '/' + i + '-stop.txt');
						if(exists) {
							var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
							if(exists) {
								add = add + '<table style="border: 2px solid #F5C1C1;" id="toron"><tbody><tr><td id="toroncoloradmin"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(해제)</a> <a href="/ban/' + encodeURIComponent(ip) + '">(해제)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
							}
							else {
								add = add + '<table style="border: 2px solid #F5C1C1;" id="toron"><tbody><tr><td id="toroncoloradmin"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(해제)</a> <a href="/ban/' + encodeURIComponent(ip) + '">(차단)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
							}
						}
						else {
							var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
							if(exists) {
								add = add + '<table style="border: 2px solid #F5C1C1;" id="toron"><tbody><tr><td id="toroncoloradmin"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(' + bl + ')</a> <a href="/ban/' + encodeURIComponent(ip) + '">(해제)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
							}
							else {
								add = add + '<table style="border: 2px solid #F5C1C1;" id="toron"><tbody><tr><td id="toroncoloradmin"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(' + bl + ')</a> <a href="/ban/' + encodeURIComponent(ip) + '">(차단)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
							}
						}
					}
					else {
						var exists = fs.existsSync(file + '/' + i + '-stop.txt');
						if(exists) {
							add = add + '<table style="border: 2px solid #F5C1C1;" id="toron"><tbody><tr><td id="toroncoloradmin"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
						}
						else {
							add = add + '<table style="border: 2px solid #F5C1C1;" id="toron"><tbody><tr><td id="toroncoloradmin"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
						}
					}
				}
				else if(ip === starter) {
					var exists = fs.existsSync('./user/' + admin + '-admin.txt');
					if(exists) {
						var exists = fs.existsSync(file + '/' + i + '-stop.txt');
						if(exists) {
							var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
							if(exists) {
								add = add + '<table style="border: 2px solid #B0D3AD;" id="toron"><tbody><tr><td id="toroncolorgreen"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(해제)</a> <a href="/ban/' + encodeURIComponent(ip) + '">(해제)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
							}
							else {
								add = add + '<table style="border: 2px solid #B0D3AD;" id="toron"><tbody><tr><td id="toroncolorgreen"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(해제)</a> <a href="/ban/' + encodeURIComponent(ip) + '">(차단)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
							}
						}
						else {
							var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
							if(exists) {
								add = add + '<table style="border: 2px solid #B0D3AD;" id="toron"><tbody><tr><td id="toroncolorgreen"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(' + bl + ')</a> <a href="/ban/' + encodeURIComponent(ip) + '">(해제)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
							}
							else {
								add = add + '<table style="border: 2px solid #B0D3AD;" id="toron"><tbody><tr><td id="toroncolorgreen"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(' + bl + ')</a> <a href="/ban/' + encodeURIComponent(ip) + '">(차단)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
							}
						}
					}
					else {
						var exists = fs.existsSync(file + '/' + i + '-stop.txt');
						if(exists) {
							add = add + '<table style="border: 2px solid #B0D3AD;" id="toron"><tbody><tr><td id="toroncolorgreen"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
						}
						else {
							add = add + '<table style="border: 2px solid #B0D3AD;" id="toron"><tbody><tr><td id="toroncolorgreen"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
						}
					}
				}
				else {
					var exists = fs.existsSync('./user/' + admin + '-admin.txt');
					if(exists) {
						var exists = fs.existsSync(file + '/' + i + '-stop.txt');
						if(exists) {
							var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
							if(exists) {
								add = add + '<table style="border: 2px solid #D5D5D5;" id="toron"><tbody><tr><td id="toroncolor"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(해제)</a> <a href="/ban/' + encodeURIComponent(ip) + '">(해제)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
							}
							else {
								add = add + '<table style="border: 2px solid #D5D5D5;" id="toron"><tbody><tr><td id="toroncolor"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(해제)</a> <a href="/ban/' + encodeURIComponent(ip) + '">(차단)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
							}
						}
						else {
							var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
							if(exists) {
								add = add + '<table style="border: 2px solid #D5D5D5;" id="toron"><tbody><tr><td id="toroncolor"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(' + bl + ')</a> <a href="/ban/' + encodeURIComponent(ip) + '">(해제)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
							}
							else {
								add = add + '<table style="border: 2px solid #D5D5D5;" id="toron"><tbody><tr><td id="toroncolor"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + ' <a href="/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/b' + i + '">(' + bl + ')</a> <a href="/ban/' + encodeURIComponent(ip) + '">(차단)</a><span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
							}
						}
					}
					else {
						var exists = fs.existsSync(file + '/' + i + '-stop.txt');
						if(exists) {
							add = add + '<table style="border: 2px solid #D5D5D5;" id="toron"><tbody><tr><td id="toroncolor"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="bl">블라인드 되었습니다.</td></tr></tbody></table><br>';
						}
						else {
							add = add + '<table style="border: 2px solid #D5D5D5;" id="toron"><tbody><tr><td id="toroncolor"><a href="javascript:void(0);" id="' + i + '">#' + i + '</a> ' + ip + '<span style="float:right;">' + today + '</span></td></tr><tr><td id="b' + i + '">' + data + '</td></tr></tbody></table><br>';
						}
					}
				}
			}
		}
		var exists = fs.existsSync(stfile);
		if(exists) {
			var toronstop = 'none';

			add = add + '<table style="border: 2px solid #9dd5e1;" id="toron"><tbody><tr><td id="toroncolorstop"><a href="javascript:void(0);" id="stop">#stop</a> 관리자</td></tr><tr><td>이 토론은 관리자에 의하여 정지 되었습니다.</td></tr></tbody></table><br>'
		}
		res.status(200).render('topic', {
			title: req.params.page,
			dis2: dis2,
			dis3: dis3,
			title2: title2,
			title3: req.params.topic,
			title4: title3,
			content: add,
			wikiname: name,
			toronstop: toronstop
		});
		res.end();
		return;
    }
});

// post
router.post('/topic/:page/:topic', function(req, res) {
    var ip = yourip(req,res);
    var stopy;
    stopy = stop(ip);
    if(stopy) {
	    res.redirect('/ban');
    }
    else {
	    var exists = fs.existsSync('./topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/stop.txt');
	    if(exists) {
		    res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic));
	    }
	    else {
		    var file = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic);
		    var sfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/starter.txt';
		    var nfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/number.txt';
		    var rfile = './topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic) + '/';
		    var yfile = './topic/' + encodeURIComponent(req.params.page) + '/';
		    var exists = fs.existsSync(yfile);
		    if(!exists) {
			  fs.mkdirSync('./topic/' + encodeURIComponent(req.params.page), 777);
		    }
		    var exists = fs.existsSync(rfile);
		    if(!exists) {
		  	  fs.mkdirSync('./topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic), 777);
		    }
		    else {
			  var number = fs.readFileSync(nfile, 'utf8');
		    }
		    var page = req.params.page;
		    var today = getNow();
		    var name = req.params.page;
		    var name2 = req.params.topic;
		    tplus(ip, today, name, name2)
		    req.body.content = req.body.content.replace(/(#[0-9]*)/g, "<a href=\"$1\">$1</a>");
		    var exists = fs.existsSync(sfile);
			if(!exists) {
				fs.openSync(sfile,'w+');
				fs.writeFileSync(sfile, ip, 'utf8');
				var number = 1;
				fs.writeFileSync(nfile, number + 1, 'utf8');
				fs.writeFileSync(file + '/' + number + '-ip.txt', ip, 'utf8');
				fs.writeFileSync(file + '/' + number + '-today.txt', today, 'utf8');
				fs.writeFileSync(file + '/' + number + '.txt',req.body.content);
			}
			else {
				var number = fs.readFileSync(nfile, 'utf8');
				number = Number(number);
				fs.writeFileSync(nfile, number + 1, 'utf8');
				fs.writeFileSync(file + '/' + number + '-ip.txt', ip, 'utf8');
				fs.writeFileSync(file + '/' + number + '-today.txt', today, 'utf8');
				fs.writeFileSync(file + '/' + number + '.txt',req.body.content);
			}
			res.redirect('/topic/' + encodeURIComponent(req.params.page) + '/' + encodeURIComponent(req.params.topic));
	    }
    }
});

// 밴 겟
router.get('/ban/:ip', function(req, res) {
	name = rname(name);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.ip) + '-ban.txt');
	if(exists) {
		var nowthat = '차단 해제';
	}
	else {
		var nowthat = '차단';
	}
	res.status(200).render('ban-get', {
		enter: nowthat,
		title: req.params.ip,
		title2: encodeURIComponent(req.params.ip),
		dis2: dis2,
		dis3: dis3,
		wikiname: name
	});
	res.end();
	return;
});

// 밴 추가
router.post('/ban/:ip', function(req, res) {
	var ip = yourip(req,res);
    aya = admin(ip);
	if(aya) {
		res.redirect('/Access');
	}
	else {
		var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.ip) + '-ban.txt');
		if(!exists) {
			var day;
			var main = /^([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9])$/;
			if(day = main.exec(req.body.ip)) {
				var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.ip) + '-admin.txt');
				if(exists) {
					res.send('<script type="text/javascript">alert("관리자는 차단 할 수 없습니다.");</script>')
				}
				else {
					fs.openSync('./user/' + encodeURIComponent(req.params.ip) + '-ban.txt','w+');
					fs.writeFileSync('./user/' + encodeURIComponent(req.params.ip) + '-ban.txt', day[1], 'utf8');
				}
			}
			else {
				var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.ip) + '-admin.txt');
				if(exists) {
					res.send('<script type="text/javascript">alert("관리자는 차단 할 수 없습니다.");</script>')
				}
				else {
					fs.openSync('./user/' + encodeURIComponent(req.params.ip) + '-ban.txt','w');
				}
			}
		}
		else {
			fs.unlinkSync('./user/' + encodeURIComponent(req.params.ip) + '-ban.txt');
		}
		res.redirect('/w/');
	}
});

// 어드민 부여
router.get('/admin/:ip', function(req, res) {
	var ip = yourip(req,res);
	mine(ip);
	var exists = fs.existsSync('./user/' + encodeURIComponent(req.params.ip) + '-admin.txt');
	if(exists) {
		fs.unlinkSync('./user/' + encodeURIComponent(req.params.ip) + '-admin.txt');
	}
	else {
		fs.openSync('./user/' + encodeURIComponent(req.params.ip) + '-admin.txt','w+');
	}
	res.redirect('/w/');
});

// 밴 리스트
router.get('/ban', function(req, res) {
	name = rname(name);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	var sun = fs.readdirSync('./user');
	var shine = 0;
	var ganba;
	var ruby = '<div>';
	var dayo = /([^-]*)-ban\.txt/;
	var hehe;
	while(true) {
		if(sun[shine]) {
			hehe = decodeURIComponent(sun[shine]);
			if(ganba = dayo.exec(hehe)) {
				var day = fs.readFileSync('./user/' + sun[shine], 'utf8');
				if(day === '') {
					ruby = ruby + '<li>' + ganba[1] + '</li>';
				}
				else {
					ruby = ruby + '<li>' + ganba[1] + ' : ' + day + '</li>';
				}
			}
		}
		else {
			ruby = ruby + '</div><p><li>만약 기한이 지났는데 밴 목록에 있다면 그 사람이 그 이후로 편집등 행위를 하지 않았음을 의미 합니다. 해제 된 건 맞습니다.</li><li>만약 기한이 적혀 있지 않다면 무기 차단 입니다.</li><li>만약 편집등의 행위를 하려 했으나 여기로 온 경우라면 차단 목록에 자신이 있지 않나 확인 해 보세요.</li></p>';
			break;
		}
		shine = shine + 1;
	}
	res.status(200).render('ban', {
		title: '밴 목록',
		dis2: dis2,
		dis3: dis3,
		content: ruby,
		wikiname: name
	});
	res.end();
	return;
});

// ACL
router.get('/acl/:page', function(req, res) {
	var ip = yourip(req,res);
    aya = admin(ip);
	if(aya) {
		res.redirect('/Access');
	}
	else {
		var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page) + '-stop.txt');
		if(exists) {
			fs.unlinkSync('./data/' + encodeURIComponent(req.params.page) + '-stop.txt');
		}
		else {
			fs.openSync('./data/' + encodeURIComponent(req.params.page) + '-stop.txt','w+');
		}
		res.redirect('/w/'+encodeURIComponent(req.params.page));
	}
});

// 리다이렉트.
router.get('/w/', function(req, res) {
	FrontPage = rFrontPage(FrontPage);
	res.redirect('/w/'+encodeURIComponent(FrontPage));
});

// ver
router.get('/ver', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	var dis2 = loginy(req, res);
	var dis3 = loginny(req, res);
	var neob = fs.readFileSync('./ver.txt', 'utf8');
	res.status(200).render('ban', {
		title: '위키 버전',
		content: neob,
		dis2: dis2,
		dis3: dis3,
		wikiname: name,
		License: licen
	});
	res.end();
	return;
});


// 검색 결과를 보여줍니다.
router.post('/search', function(req, res) {
    var exists = fs.existsSync('./data/' + encodeURIComponent(req.body.name)+'.txt');
	if(exists) {
		res.redirect('/w/'+encodeURIComponent(req.body.name));
	}
	else {
		res.redirect('/edit/'+encodeURIComponent(req.body.name));
	}
});

// diff
router.get('/diff/:page/:r/:rr', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	var title2 = encodeURIComponent(req.params.page);
	var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page)+'/r1.txt');
	if(exists) {
		var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page)+'/'+req.params.r+'.txt');
		if(exists){
			var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page)+'/'+req.params.rr+'.txt');
			if(exists) {
				var sc = fs.readFileSync('./history/' + encodeURIComponent(req.params.page)+'/'+req.params.r+'.txt', 'utf8');
				var id = fs.readFileSync('./history/' + encodeURIComponent(req.params.page)+'/'+req.params.rr+'.txt', 'utf8');
 				var diff = new Diff();
				var textDiff = diff.main(sc, id);
				res.status(200).render('diff', {
					title: req.params.page,
					title2: title2,
					title3: '<span style="margin-left:5px"></span>(' + req.params.r + ' / ' + req.params.rr + ')',
					dis2: dis2,
					dis3: dis3,
					wikiname: name,
					License: licen,
					content: diff.prettyHtml(textDiff)
				});
				res.end();
				return;
			}
			else {
				res.redirect('/history/' + encodeURIComponent(req.params.page));
			}
		}
		else {
			res.redirect('/history/' + encodeURIComponent(req.params.page));
		}
	}
	else {
		res.redirect('/w/' + encodeURIComponent(req.params.page));
	}
});

// 되돌리기
router.get('/revert/:page/:r', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	var title2 = encodeURIComponent(req.params.page);
	var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/'+ req.params.r +'.txt');
	if(exists) {
		res.status(200).render('ok', {
			title2: title2,
			title: req.params.page,
			dis2: dis2,
			dis3: dis3,
			wikiname: name,
			title3: req.params.r
		});
		res.end();
		return;
	}
	else {
		res.redirect('/history/' + encodeURIComponent(req.params.page));
	}
});

// 되돌리기 2
router.post('/revert/:page/:r', function(req, res) {
	name = rname(name);
	var ip = yourip(req,res);
	var page = req.params.page;
	aya = editstop(ip, page);
	if(aya) {
		res.redirect('/Access');
	}
	else {
		var stopy;
		stopy = stop(ip);
		if(stopy) {
			res.redirect('/ban');
		}
		else {
			var today = getNow();
			var rtitle = req.params.r + ' 버전으로 되돌림';
			var name = req.params.page;
			rplus(ip, today, name, rtitle);
			var revert = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/'+ req.params.r +'.txt');
			fs.writeFileSync('./data/' + encodeURIComponent(req.params.page) + '.txt', revert, 'utf8');
			var i = 0;
			while(true) {
				i = i + 1;
				var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
				if(!exists) {
					fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt','w+');
					fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt', revert, 'utf8');
					fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt','w+');
					fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', ip, 'utf8');
					fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt','w+');
					fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt', today, 'utf8');
					fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt','w+');
					fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt', req.params.r + ' 버전으로 되돌림', 'utf8');
					fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-leng.txt','w');
					break;
				}
			}
			res.redirect('/w/'+ encodeURIComponent(req.params.page));
		}
	}
});

// 문서 삭제
router.get('/delete/:page', function(req, res) {
	name = rname(name);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	var today = getNow();
	var title2 = encodeURIComponent(req.params.page);
	var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page) + '.txt');
	if(!exists) {
		res.redirect('/w/' + encodeURIComponent(req.params.page));
	}
	else {
		res.status(200).render('delete', {
			title: req.params.page,
			title2: title2,
			dis2: dis2,
			dis3: dis3,
			wikiname: name
		});
		res.end();
		return;
	}
});

// 문서 삭제 처리
router.post('/delete/:page', function(req, res) {
	name = rname(name);
	var ip = yourip(req,res);
	var page = req.params.page;
	aya = editstop(ip, page);
	if(aya) {
		res.redirect('/Access');
	}
	else {
		var stopy;
		stopy = stop(ip);
		if(stopy) {
			res.redirect('/ban');
		}
		else {
			var today = getNow();
			var rtitle = '문서를 삭제함';
			var name = req.params.page;
			rplus(ip, today, name, rtitle);
			var i = 0;
			while(true) {
				var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page)+'.txt');
				if(exists) {
					i = i + 1;
					var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
					if(!exists) {
						fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt','w');
						fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt', req.body.content, 'utf8');
						fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt','w');
						fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', ip, 'utf8');
						fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt','w');
						fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt', today, 'utf8');
						fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt','w');
						fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt', '문서를 삭제함', 'utf8');
						fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-leng.txt','w');
						break;
					}
				}
				else {
					break;
				}
			}
			fs.unlinkSync('./data/' + encodeURIComponent(req.params.page)+'.txt');
			res.redirect('/w/'+ encodeURIComponent(req.params.page));
		}
	}
});

// 문서 이동
router.get('/move/:page', function(req, res) {
	name = rname(name);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	var title2 = encodeURIComponent(req.params.page);
	var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page)+'.txt');
	if(!exists) {
		res.redirect('/w/' + encodeURIComponent(req.params.page));
	}
	else {
		res.status(200).render('move', {
			title: req.params.page,
			dis2: dis2,
			dis3: dis3,
			title2: title2,
			wikiname: name
		});
		res.end();
		return;
	}
});

// post
router.post('/move/:page', function(req, res) {
	name = rname(name);
	var ip = yourip(req,res);
	var page = req.params.page;
	aya = editstop(ip, page);
	if(aya) {
		res.redirect('/Access');
	}
	else {
		var stopy;
		stopy = stop(ip);
		if(stopy) {
			res.redirect('/ban');
		}
		else {
			var today = getNow();
			if(req.body.title === '') {
				res.send('<script type="text/javascript">alert("문서 이름 없음");</script>');
			}
			else {
				var exists = fs.existsSync('./history/' + encodeURIComponent(req.body.title) + '/r1.txt');
				if(exists) {
					res.send('<script type="text/javascript">alert("이미 해당 문서가 존재 합니다.");</script>');
				}
				else {
					var rtitle = '<a href="/w/'+encodeURIComponent(req.body.title)+'">'+req.body.title+'</a> 문서로 문서를 이동함';
					var name = req.params.page;
					rplus(ip, today, name, rtitle);
					var i = 0;
					fs.mkdirSync('./history/' + encodeURIComponent(req.body.title), 777);
					while(true) {
						i = i + 1;
						var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
						if(exists) {
							fs.renameSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt','./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'.txt');
							fs.renameSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'-ip.txt','./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'-ip.txt');
							fs.renameSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'-today.txt','./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'-today.txt');
							fs.renameSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'-send.txt','./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'-send.txt');
							fs.renameSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'-leng.txt','./history/' + encodeURIComponent(req.body.title) + '/r'+ i +'-leng.txt');
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
							fs.openSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '.txt','w+');
							fs.writeFileSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '.txt', req.body.content, 'utf8');
							fs.openSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-ip.txt','w+');
							fs.writeFileSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-ip.txt', ip, 'utf8');
							fs.openSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-today.txt','w+');
							fs.writeFileSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-today.txt', today, 'utf8');
							fs.openSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-send.txt','w+');
							fs.writeFileSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-send.txt', '<a href="/w/'+encodeURIComponent(req.params.page)+'">'+req.params.page+'</a> 에서 <a href="/w/'+encodeURIComponent(req.params.page)+'">' + req.body.title + '</a> 문서로 문서를 이동함', 'utf8');
							fs.openSync('./history/' + encodeURIComponent(req.body.title) + '/r' + i + '-leng.txt','w+');
							break;
						}
					}
					fs.rmdirSync('./history/' + encodeURIComponent(req.params.page));
					fs.renameSync('./data/' + encodeURIComponent(req.params.page)+'.txt','./data/' + encodeURIComponent(req.body.title)+'.txt');
				}
				res.redirect('/w/'+ encodeURIComponent(req.body.title));
			}
		}
	}
});

// 항목을 보여줍니다.
router.get('/w/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
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
    }
    var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
    var title2 = encodeURIComponent(req.params.page);
	var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page)+'.txt');
	if(!exists) {
		res.status(404).render('index', {
			title: req.params.page,
			dis: dis,
			dis2: dis2,
			dis3: dis3,
			title2: title2,
			subtitle: encodeURIComponent(lovelive),
			content: "<br>이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>",
			License: licen,
			wikiname: name,
			acl: ''
		});
		res.end();
		return;
	}
	else {
		var data = fs.readFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8');
		var redirect = /^#(?:넘겨주기|redirect)\s([^\n]*)/ig;
		var dtest;
		if(dtest = redirect.exec(data)) {
			data = data.replace(redirect, "<head><meta http-equiv=\"refresh\" content=\"0;url=/w/"+encodeURIComponent(dtest[1])+"/redirect/"+encodeURIComponent(req.params.page)+"\" /></head><li>리다이렉트 <a href='$1'>$1</a></li>");
			res.status(200).render('index', {
				title: req.params.page,
				dis: dis,
				dis2: dis2,
				dis3: dis3,
				title2: title2,
				subtitle: encodeURIComponent(lovelive),
				content: '<br>' + data,
				License: licen,
				wikiname: name,
				acl: ''
			});
			res.end();
			return;
		}
		parseNamu(req, data, function(cnt){
			var leftbar = /<div id="toc">(((?!\/div>).)*)<\/div>/;
			var leftbarcontect;
			if(leftbarcontect = leftbar.exec(cnt)) {
				lb = 'block';
			}
			else {
				leftbarcontect = ['',''];
			}
			var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page) + '-stop.txt');
			if(exists) {
				var acl = '<span style="margin-left:5px"></span>(관리자)'
			}
			res.status(200).render('index', {
				acl: acl,
				lbc: leftbarcontect[1],
				lb: lb,
				title: req.params.page,
				dis: dis,
				dis2: dis2,
				dis3: dis3,
				title2: title2,
				subtitle: encodeURIComponent(lovelive),
				content: cnt,
				License: licen,
				wikiname: name
			});
			res.end();
			return;
		});
	}
});

// 리다이렉트 w
router.get('/w/:page/redirect/:rdrc', function(req, res) {
    licen = rlicen(licen);
    name = rname(name);
    var testing = /\//;
    if(testing.exec(req.params.page)) {
	    var zenkaino = /(.*)\/.*/;
	    var lovelive;
	    var subtitle = zenkaino.exec(req.params.page);
	    if(subtitle[1] == '') {
		    lovelive = req.params.page;
	        var dis = 'none';
	    }
	    else {
	  	    lovelive = subtitle[1];
	    }
    }
    else {
	    var dis = 'none';
	    lovelive = req.params.page;
    }
    var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
    var title2 = encodeURIComponent(req.params.page);
	var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page)+'.txt');
	if(!exists) {
		res.status(404).render('index', {
			title: req.params.page,
			dis2: dis2,
			dis3: dis3,
			dis: dis,
			title2: title2,
			subtitle: encodeURIComponent(lovelive),
			content: '<br><li><a href="/edit/' + req.params.rdrc + '">' + req.params.rdrc + '</a> 에서 넘어 왔습니다.</li><br>' + "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>",
			License: licen,
			wikiname: name,
			acl: ''
		});
		res.end();
		return;
	}
	else {
		var data = fs.readFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8');
		var redirect = /^#(?:넘겨주기|redirect)\s([^\n]*)/ig;
		if(redirect.exec(data)) {
			data = data.replace(redirect, " * 리다이렉트 [[$1]]");
		}
		parseNamu(req, data, function(cnt){
			var leftbar = /<div id="toc">(((?!\/div>).)*)<\/div>/;
			var leftbarcontect;
			if(leftbarcontect = leftbar.exec(cnt)) {
					lb = 'block';
			}
			else {
				leftbarcontect = ['',''];
			}
			var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page) + '-stop.txt');
			if(exists) {
				var acl = '<span style="margin-left:5px"></span>(관리자)'
			}
			res.status(200).render('index', {
				acl: acl,
				lbc: leftbarcontect[1],
				lb: lb,
				title: req.params.page,
				dis2: dis2,
				dis3: dis3,
				title2: title2,
				dis: dis,
				subtitle: encodeURIComponent(lovelive),
				content: '<li><a href="/edit/' + req.params.rdrc + '">' + req.params.rdrc + '</a> 에서 넘어 왔습니다.</li><br>' + cnt,
				License: licen,
				wikiname: name
			});
			res.end();
			return;
		});
	}
});

// 미리보기
router.post('/preview/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	var redirect = /^#(?:넘겨주기|redirect)\s([^\n]*)/ig;
	var data = req.body.content;
	data = data.replace(redirect, " * 리다이렉트 [[$1]]");
	parseNamu(req, data, function(cnt){
		var leftbar = /<div id="toc">(((?!\/div>).)*)<\/div>/;
		var leftbarcontect;
		if(leftbarcontect = leftbar.exec(cnt)) {
			lb = 'block';
		}
		else {
			leftbarcontect = ['',''];
		}
		res.render('preview', {
			lbc: leftbarcontect[1],
			lb: lb,
			title: req.params.page,
			dis2: dis2,
			dis3: dis3,
			title2: encodeURIComponent(req.params.page),
			data: data,
			data2: req.body.content,
			content: cnt,
			wikiname: name
		});
		res.end();
		return;
	});
});

// 최근 바뀜을 보여줍니다.
router.get('/RecentChanges', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	var admin = yourip(req, res);
	var number = fs.readFileSync('./recent/RC-number.txt', 'utf8');
	var i = 0;
	var data = '';
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	while(true) {
		if(Number(number) < 51) {
			i = i + 1;
			var exists = fs.existsSync('./recent/RC-' + i + '.txt');
			if(exists) {
				var ip = fs.readFileSync('./recent/RC-' + i + '-ip.txt', 'utf8');
				var today = fs.readFileSync('./recent/RC-' + i + '-today.txt', 'utf8');
				var title = fs.readFileSync('./recent/RC-' + i + '-title.txt', 'utf8');
				var page = fs.readFileSync('./recent/RC-' + i + '.txt', 'utf8');
				var exists = fs.existsSync('./recent/RC-' + i + '-leng.txt');
				if(exists) {
					var plus = /\+/g;
					var leng = fs.readFileSync('./recent/RC-' + i + '-leng.txt', 'utf8');
					if(plus.exec(leng)) {
						var pageplus = htmlencode.htmlEncode(page) + '</a> <span style="color:green;">(' + leng + ')</span>';
					}
					else {
						var pageplus = htmlencode.htmlEncode(page) + '</a> <span style="color:red;">(' + leng + ')</span>';
					}
				}
				else {
					var pageplus = htmlencode.htmlEncode(page) + '</a>';
				}
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
				if(exists) {
					var ban = '풀기';
				}
				else {
					var ban = '차단';
				}
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-page.txt');
				if(exists) {
					var exists = fs.existsSync('./user/' + admin + '-admin.txt');
					if(exists) {
						ip = '<a href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>' + ' <a href="/ban/' + ip + '">(' + ban + ')';
					}
					else {
						ip = '<a href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>';
					}
				}
				else {
					var exists = fs.existsSync('./user/' + admin + '-admin.txt');
					if(exists) {
						var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '.txt');
						if(exists) {
							ip = '<a class="not_thing" href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>' + ' <a href="/ban/' + ip + '">(' + ban + ')';
						}
						else {
							ip = ip + ' <a href="/ban/' + ip + '">(' + ban + ')';
						}
					}
					else {
						var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '.txt');
						if(exists) {
							ip = '<a class="not_thing" href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>';
						}
					}
				}
				if(title === '<br>') {}
				else {
					title = htmlencode.htmlEncode(title);
					title = title.replace(/&lt;a href=&quot;\/w\/(?:(?:(?!&quot;).)*)&quot;&gt;((?:(?!&lt;).)*)&lt;\/a&gt;/g, '<a href="/w/$1">$1</a>');
				}

				data = '<table id="toron"><tbody><tr><td id="yosolo"><a href="/w/'+encodeURIComponent(page)+'">'+pageplus+' <a href="/history/'+encodeURIComponent(page)+'">(역사)</a></td><td id="yosolo">'+ip+'</td><td id="yosolo">'+today+'</td></tr><tr><td colspan="3" id="yosolo">'+title+'</td></tr></tbody></table>' + data;
			}
			else {
				break;
			}
		}
		else {
			if (i === 0) {
				i = Number(number) - 50;
			}
			else if (i === Number(number)) {
				break;
			}
			else {
				var exists = fs.existsSync('./recent/RC-' + ( i - 1 ) + '.txt');
				if(exists) {
					j = Number(number) - 51;
					while(true) {
						var exists = fs.existsSync('./recent/RC-' + j + '.txt');
						if(exists) {
							fs.unlinkSync('./recent/RC-' + j + '.txt');
						}
						var exists = fs.existsSync('./recent/RC-' + j + '-ip.txt');
						if(exists) {
							fs.unlinkSync('./recent/RC-' + j + '-ip.txt');
						}
						var exists = fs.existsSync('./recent/RC-' + j + '-today.txt');
						if(exists) {
							fs.unlinkSync('./recent/RC-' + j + '-today.txt');
						}
						var exists = fs.existsSync('./recent/RC-' + j + '-title.txt');
						if(exists) {
							fs.unlinkSync('./recent/RC-' + j + '-title.txt');
						}
						var exists = fs.existsSync('./recent/RC-' + j + '-leng.txt');
						if(exists) {
							fs.unlinkSync('./recent/RC-' + j + '-leng.txt');
						}
						var exists = fs.existsSync('./recent/RC-' + ( j - 1 ) + '.txt');
						if(exists) {
							j = j - 1;
						}
						else {
							break;
						}
					}
				}
				var ip = fs.readFileSync('./recent/RC-' + i + '-ip.txt', 'utf8');
				var today = fs.readFileSync('./recent/RC-' + i + '-today.txt', 'utf8');
				var title = fs.readFileSync('./recent/RC-' + i + '-title.txt', 'utf8');
				var page = fs.readFileSync('./recent/RC-' + i + '.txt', 'utf8');
				var exists = fs.existsSync('./recent/RC-' + i + '-leng.txt');
				if(exists) {
					var plus = /\+/g;
					var leng = fs.readFileSync('./recent/RC-' + i + '-leng.txt', 'utf8');
					if(plus.exec(leng)) {
						var pageplus = htmlencode.htmlEncode(page) + '</a> <span style="color:green;">(' + leng + ')</span>';
					}
					else {
						var pageplus = htmlencode.htmlEncode(page) + '</a> <span style="color:red;">(' + leng + ')</span>';
					}
				}
				else {
					var pageplus = htmlencode.htmlEncode(page) + '</a>';
				}
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
				if(exists) {
					var ban = '풀기';
				}
				else {
					var ban = '차단';
				}
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-page.txt');
				if(exists) {
					var exists = fs.existsSync('./user/' + admin + '-admin.txt');
					if(exists) {
						ip = '<a href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>' + ' <a href="/ban/' + ip + '">(' + ban + ')';
					}
					else {
						ip = '<a href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>';
					}
				}
				else {
					var exists = fs.existsSync('./user/' + admin + '-admin.txt');
					if(exists) {
						var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '.txt');
						if(exists) {
							ip = '<a class="not_thing" href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>' + ' <a href="/ban/' + ip + '">(' + ban + ')';
						}
						else {
							ip = ip + ' <a href="/ban/' + ip + '">(' + ban + ')';
						}
					}
					else {
						var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '.txt');
						if(exists) {
							ip = '<a class="not_thing" href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>';
						}
					}
				}
				if(title === '<br>') {}
				else {
					title = htmlencode.htmlEncode(title);
					title = title.replace(/&lt;a href=&quot;\/w\/(?:(?:(?!&quot;).)*)&quot;&gt;((?:(?!&lt;).)*)&lt;\/a&gt;/g, '<a href="/w/$1">$1</a>');
				}
				data = '<table id="toron"><tbody><tr><td id="yosolo"><a href="/w/'+encodeURIComponent(page)+'">'+pageplus+' <a href="/history/'+encodeURIComponent(page)+'">(역사)</a></td><td id="yosolo">'+ip+'</td><td id="yosolo">'+today+'</td></tr><tr><td colspan="3" id="yosolo">'+title+'</td></tr></tbody></table>' + data;
			}
			i = i + 1;
		}
	}
  	res.status(200).render('re1', {
		title: '최근 변경내역',
		dis2: dis2,
		dis3: dis3,
		content: data,
		License: licen,
		wikiname: name
	});
	res.end();
	return;
});

// 최근 토론을 보여줍니다.
router.get('/RecentDiscuss', function(req, res, next) {
	licen = rlicen(licen);
	name = rname(name);
	var admin = yourip(req, res);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	var number = fs.readFileSync('./recent/RD-number.txt', 'utf8');
	var i = 0;
	var data = '';
	while(true) {
		if(Number(number) < 51) {
			i = i + 1;
			var exists = fs.existsSync('./recent/RD-' + i + '.txt');
			if(exists) {
				var ip = fs.readFileSync('./recent/RD-' + i + '-ip.txt', 'utf8');
				var today = fs.readFileSync('./recent/RD-' + i + '-today.txt', 'utf8');
				var title = fs.readFileSync('./recent/RD-' + i + '-title.txt', 'utf8');
				var page = fs.readFileSync('./recent/RD-' + i + '.txt', 'utf8');
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
				if(exists) {
					var ban = '풀기';
				}
				else {
					var ban = '차단';
				}
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-page.txt');
				if(exists) {
					var exists = fs.existsSync('./user/' + admin + '-admin.txt');
					if(exists) {
						ip = '<a href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>' + ' <a href="/ban/' + ip + '">(' + ban + ')';
					}
					else {
						ip = '<a href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>';
					}
				}
				else {
					var exists = fs.existsSync('./user/' + admin + '-admin.txt');
					if(exists) {
						var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '.txt');
						if(exists) {
							ip = '<a class="not_thing" href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>' + ' <a href="/ban/' + ip + '">(' + ban + ')';
						}
						else {
							ip = ip + ' <a href="/ban/' + ip + '">(' + ban + ')';
						}
					}
					else {
						var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '.txt');
						if(exists) {
							ip = '<a class="not_thing" href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>';
						}
					}
				}
				data = '<table id="toron"><tbody><tr><td id="yosolo"><a href="/topic/'+encodeURIComponent(page)+'/'+encodeURIComponent(title)+'">'+htmlencode.htmlEncode(page)+' ('+htmlencode.htmlEncode(title)+')</a></td><td id="yosolo">'+ip+'</td><td id="yosolo">'+today+'</td></tr></tbody></table>' + data;
			}
			else {
				break;
			}
		}
		else {
			if (i === 0) {
				i = Number(number) - 50;
			}
			else if (i === Number(number)) {
				break;
			}
			else {
				var exists = fs.existsSync('./recent/RD-' + ( i - 1 ) + '.txt');
				if(exists) {
					j = Number(number) - 51;
					while(true) {
						var exists = fs.existsSync('./recent/RD-' + j + '.txt');
						if(exists) {
							fs.unlinkSync('./recent/RD-' + j + '.txt');
						}
						var exists = fs.existsSync('./recent/RD-' + j + '-ip.txt');
						if(exists) {
							fs.unlinkSync('./recent/RD-' + j + '-ip.txt');
						}
						var exists = fs.existsSync('./recent/RD-' + j + '-today.txt');
						if(exists) {
							fs.unlinkSync('./recent/RD-' + j + '-today.txt');
						}
						var exists = fs.existsSync('./recent/RD-' + j + '-title.txt');
						if(exists) {
							fs.unlinkSync('./recent/RD-' + j + '-title.txt');
						}
						var exists = fs.existsSync('./recent/RD-' + ( j - 1 ) + '.txt');
						if(exists) {
							j = j - 1;
						}
						else {
							break;
						}
					}
				}
				var ip = fs.readFileSync('./recent/RD-' + i + '-ip.txt', 'utf8');
				var today = fs.readFileSync('./recent/RD-' + i + '-today.txt', 'utf8');
				var title = fs.readFileSync('./recent/RD-' + i + '-title.txt', 'utf8');
				var page = fs.readFileSync('./recent/RD-' + i + '.txt', 'utf8');
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
				if(exists) {
					var ban = '풀기';
				}
				else {
					var ban = '차단';
				}
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-page.txt');
				if(exists) {
					var exists = fs.existsSync('./user/' + admin + '-admin.txt');
					if(exists) {
						ip = '<a href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>' + ' <a href="/ban/' + ip + '">(' + ban + ')';
					}
					else {
						ip = '<a href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>';
					}
				}
				else {
					var exists = fs.existsSync('./user/' + admin + '-admin.txt');
					if(exists) {
						var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '.txt');
						if(exists) {
							ip = '<a class="not_thing" href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>' + ' <a href="/ban/' + ip + '">(' + ban + ')';
						}
						else {
							ip = ip + ' <a href="/ban/' + ip + '">(' + ban + ')';
						}
					}
					else {
						var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '.txt');
						if(exists) {
							ip = '<a class="not_thing" href="/user/' + encodeURIComponent(ip) + '">' + ip + '</a>';
						}
					}
				}
				data = '<table id="toron"><tbody><tr><td id="yosolo"><a href="/topic/'+encodeURIComponent(page)+'/'+encodeURIComponent(title)+'">'+htmlencode.htmlEncode(page)+' ('+htmlencode.htmlEncode(title)+')</a></td><td id="yosolo">'+ip+'</td><td id="yosolo">'+today+'</td></tr></tbody></table>' + data;
			}
			i = i + 1;
		}
	}
  	res.status(200).render('de1', {
		title: '최근 토론내역',
		dis2: dis2,
		dis3: dis3,
		content: data,
		License: licen,
		wikiname: name
	});
	res.end();
	return;
});

// raw를 보여줍니다.
router.get('/raw/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	FrontPage = rFrontPage(FrontPage);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
    var data = fs.readFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8');
	var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page)+'.txt');
	if(!exists) {
		res.redirect('/w/' + encodeURIComponent(req.params.page));
	}
	else {
		data = data.replace(/<br>/g, '[br]')
		data = data.replace(/\n/g, '<br>')
		var raw = htmlencode.htmlEncode(data);
		raw = raw.replace(/;&lt;br&gt;/g, '<br>');
		res.status(200).render('ban', {
			title: req.params.page,
			dis2: dis2,
			dis3: dis3,
			content: raw,
			License: licen,
			wikiname: name
		});
		res.end();
		return;
	}
});

// diff로 보냅니다.
router.post('/history/:page', function(req, res) {
	res.redirect('/diff/' + encodeURIComponent(req.params.page) + '/r' + encodeURIComponent(req.body.r) + '/r' + encodeURIComponent(req.body.rr));
});

// 역링크
router.get('/xref/:page', function(req, res) {
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	name = rname(name);
	var shine = 0;
	var ganba;
	var ruby = '<div>';
	var dayo = /(.*)\.txt$/;
	var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page) + '-back/');
	if(exists) {
		var sun = fs.readdirSync('./data/' + encodeURIComponent(req.params.page) + '-back/');
		while(true) {
			if(sun[shine]) {
				var exists = fs.existsSync('./data/' + sun[shine]);
				if(exists) {
					var data = fs.readFileSync('./data/' + sun[shine], 'utf8');
					var itis = new RegExp('\\[\\[' + req.params.page + '\\]\\]');
					var itisnt = new RegExp('\\[\\[' + req.params.page + '\\|([^\\]]*)\\]\\]');
					if(itisnt.exec(data)) {
						ganba = dayo.exec(sun[shine]);
						ruby = ruby + '<li>' + '<a href="/w/' + ganba[1] + '">' + decodeURIComponent(ganba[1]) + '</a></li>';
					}
					else if(itis.exec(data)) {
						ganba = dayo.exec(sun[shine]);
						ruby = ruby + '<li>' + '<a href="/w/' + ganba[1] + '">' + decodeURIComponent(ganba[1]) + '</a></li>';
					}
					else {
						fs.unlinkSync('./data/' + encodeURIComponent(req.params.page) + '-back/' + sun[shine]);
					}
				}
				else {
					fs.unlinkSync('./data/' + encodeURIComponent(req.params.page) + '-back/' + sun[shine]);
				}
			}
			else {
				ruby = ruby + '</div>';
				break;
			}
			shine = shine + 1;
		}
	}
	else {
		ruby = ruby + '</div>';
	}
	res.render('ban', {
		title: req.params.page,
		title2: '<span style="margin-left:5px"></span>(역링크)',
		dis2: dis2,
		dis3: dis3,
		content: ruby,
		wikiname: name
	});
	res.end();
	return;
});

// 모든 문서
router.get('/TitleIndex', function(req, res) {
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	name = rname(name);
	var sun = fs.readdirSync('./data');
	var shine = 0;
	var ganba;
	var ruby = '<div>';
	var dayo = /(.*)\.txt$/;
	var test = /-back$/;
	var haha = /-stop$/;
	var hehe;
	var re = 0;
	while(true) {
		if(sun[shine]) {
			if(test.exec(sun[shine])) {
			}
			else {
				re = re + 1;
				hehe = decodeURIComponent(sun[shine]);
				ganba = dayo.exec(hehe);
				if(haha.exec(ganba[1])) {

				} else {
					ruby = ruby + '<li>' + '<a href="/w/' + encodeURIComponent(ganba[1]) + '">' + ganba[1] + '</a></li>';
				}
			}
		}
		else {
			ruby = ruby + '</div>';
			break;
		}
		shine = shine + 1;
	}
	res.render('ban', {
		title: '모든 문서',
		dis2: dis2,
		dis3: dis3,
		content: ruby + '<br>' + re + '개의 문서',
		wikiname: name
	});
	res.end();
	return;
});

// 랜덤
router.get('/random', function(req, res) {
	var sun = fs.readdirSync('./data');
	var shine = 0;
	var ganba;
	var dayo = /(.*)\.txt/;
	var haha = /-stop$/;
	var back = /-back$/;
	var hehe;
	while(true) {
		if(sun[shine]) {
			shine = shine + 1;
		}
		else {
			break;
		}
	}
	var random = Math.floor(Math.random() * (shine - 0)) + 0;
	if(back.exec(sun[random])) {
		res.redirect('/random');
	}
	else {
		var test = dayo.exec(sun[random])
		if(haha.exec(test[1])) {
			res.redirect('/random');
		}
		else {
			res.redirect('/w/' + test[1]);
		}
	}
 });
// 편집 화면을 보여줍니다.
router.get('/edit/:page', function(req, res) {
	name = rname(name);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	if(encodeURIComponent(req.params.page).length > 255) {
		res.send('<script type="text/javascript">alert("문서 명이 너무 깁니다.");</script>')
	}

	var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page)+'.txt');
	if(!exists){
		res.render('edit', {
			dis2: dis2,
			dis3: dis3,
			title: req.params.page,
			title2: encodeURIComponent(req.params.page),
			content: "" ,
			wikiname: name
		});
		res.end();
		return;
	}
	else{
		var data = fs.readFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8');
		res.render('edit', {
			dis2: dis2,
			dis3: dis3,
			title: req.params.page,
			title2: encodeURIComponent(req.params.page),
			content: data ,
			wikiname: name
		});
		res.end();
		return;
	}
});

// 문단 편집
/* 이걸 언제 완성 하나...
router.get('/edit/:page/:number', function(req, res) {
	name = rname(name);

	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);

	if(encodeURIComponent(req.params.page).length > 255) {
		res.send('<script type="text/javascript">alert("문서 명이 너무 깁니다.");</script>');
	}
	else {
		var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page)+'.txt');
		if(!exists){
			res.redirect('/edit/' + encodeURIComponent(req.params.page));
		}
		else{
			var data = fs.readFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', 'utf8');
			var databack = data;
			data = data + '\r\n';
			var toc = /(?:={1,6})\s?(?:[^=]*)\s?(?:={1,6})\r\n/;
			var test;
			var is = /((?:={1,6})\s?(?:[^=]*)\s?(?:={1,6})\r\n(?:(?:(?:(?:(?!(?:={1,6})\s?(?:[^=]*)\s?(?:={1,6})\r\n).)*)(?:\r\n?))+))/;
			var i = 0;
			var j = 0;
			while(true) {
				if(toc.exec(data)) {
					j = j + 1;
					data = data.replace(toc, '');
				}
				else {
					break;
				}
			}
			if(j < Number(req.params.number)) {
				res.redirect('/edit/' + encodeURIComponent(req.params.page));
			}
			else {
				while(true) {
					if(toc.exec(data)) {
						i = i + 1;
						if(Number(req.params.number) === i) {
							test = is.exec(data);
							console.log(test);
							test[1] = test[1].replace(/\r\n$/, '');
							break;
						}
						else {
							data = data.replace(toc, '');
						}
					}
					else {
						break;
					}
				}
				res.render('sedit', {
					dis2: dis2,
					dis3: dis3,
					title: req.params.page,
					title2: encodeURIComponent(req.params.page),
					content: test[1],
					content2: test[1],
					wikiname: name
				});
				res.end();
				return;
			}
		}
	}
});
*/

// 편집 결과를 적용하고 해당 문서로 이동합니다.
router.post('/edit/:page', function(req, res) {
	name = rname(name);
	var today = getNow();
	var ip = yourip(req,res);
	var page = req.params.page;
    var stopy;
	stopy = stop(ip);
	if(stopy) {
		res.redirect('/ban');
	}
	else {
		aya = editstop(ip, page);
		if(aya) {
			res.redirect('/Access');
		}
		else {
			var file = './data/' + encodeURIComponent(req.params.page)+'.txt';
			if(!req.body.send) {
				req.body.send = "<br>";
			}
			content = req.body.content;
			var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page)+'.txt');
			if(exists) {
				var now = fs.readFileSync('./data/' + encodeURIComponent(req.params.page) + '.txt', 'utf8');
			}
			var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page)+'.txt');
			if(!exists) {
				var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r1.txt');
				if(!exists) {
					if(req.body.send === '<br>') {
						req.body.send = '(새 문서)';
					}
					else {
						req.body.send = req.body.send + ' (새 문서)';
					}
				}
			}
			var rtitle = req.body.send;
			var name = req.params.page;
			var leng = rplus(ip, today, name, rtitle, now, req, content);
			fs.exists(file, function (exists) {
				if(!exists) {
					fs.openSync(file,'w');
					fs.writeFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', req.body.content, 'utf8');
					var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r1.txt');
					if(!exists) {
						fs.mkdirSync('./history/' + encodeURIComponent(req.params.page), 777);
						fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r1.txt','w+');
						fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1.txt', req.body.content, 'utf8');
						fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r1-ip.txt','w+');
						fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-ip.txt', ip, 'utf8');
						fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r1-today.txt','w+');
						fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-today.txt', today, 'utf8');
						fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r1-send.txt','w+');
						fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-send.txt', req.body.send, 'utf8');
						fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r1-leng.txt','w+');
						fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-leng.txt', leng, 'utf8');
					}
					else {
						var i = 0;
						while(true) {
							i = i + 1;
							var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
							if(!exists) {
								fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt','w+');
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt', req.body.content, 'utf8');
								fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt','w+');
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', ip, 'utf8');
								fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt','w+');
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt', today, 'utf8');
								fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt','w+');
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt', req.body.send, 'utf8');
								fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-leng.txt','w+');
								fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-leng.txt', leng, 'utf8');
								break;
							}
						}
					}
				}
				else {
					var ndata = fs.readFileSync(file, 'utf8');
					if(req.body.content === ndata) {

					}
					else {
						fs.writeFileSync('./data/' + encodeURIComponent(req.params.page)+'.txt', req.body.content, 'utf8');
						var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r1.txt');
						if(!exists) {
							fs.mkdirSync('./history/' + encodeURIComponent(req.params.page), 777);
							fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r1.txt','w+');
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1.txt', req.body.content, 'utf8');
							fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r1-ip.txt','w+');
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-ip.txt', ip, 'utf8');
							fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r1-today.txt','w+');
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-today.txt', today, 'utf8');
							fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r1-send.txt','w+');
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-send.txt', req.body.send, 'utf8');
							fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r1-leng.txt','w+');
							fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r1-leng.txt', leng, 'utf8');
						}
						else {
							var i = 0;
							while(true) {
								i = i + 1;
								var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
								if(!exists) {
									fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt','w+');
									fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '.txt', req.body.content, 'utf8');
									fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt','w+');
									fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', ip, 'utf8');
									fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt','w+');
									fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt', today, 'utf8');
									fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt','w+');
									fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt', req.body.send, 'utf8');
									fs.openSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-leng.txt','w+');
									fs.writeFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-leng.txt', leng, 'utf8');
									break;
								}
							}
						}
					}
				}
			});
			res.redirect('/w/'+ encodeURIComponent(req.params.page));
		}
	}
});

// 역사 3
router.get('/history/w/:page/:r', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	var title3 = encodeURIComponent(req.params.page);
	var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/' + req.params.r + '.txt');
	if(exists) {
		var neob = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/' + req.params.r + '.txt', 'utf8');
		var redirect = /^#(?:넘겨주기|redirect)\s([^\n]*)/ig;
		if(redirect.exec(neob)) {
			data = data.replace(redirect, " * 리다이렉트 [[$1]]");
		}
		parseNamu(req, neob, function(cnt){
			var leftbar = /<div id="toc">(((?!\/div>).)*)<\/div>/;
			var leftbarcontect;
			if(leftbarcontect = leftbar.exec(cnt)) {
				lb = 'block';
			}
			else {
				leftbarcontect = ['',''];
			}
			res.status(200).render('history', {
				lbc: leftbarcontect[1],
				lb: lb,
				title: req.params.page,
				title3: title3,
				title2: '<span style="margin-left:5px"></span>(' + req.params.r + ')',
				content: cnt,
				dis2: dis2,
				dis3: dis3,
				wikiname: name,
				License: licen
			});
			res.end();
			return;
		});
	}
	else {
		res.status(404).render('history', {
			title: req.params.page,
			title2: '<span style="margin-left:5px"></span>(' + req.params.r + ')',
			title3: title3,
			dis2: dis2,
			dis3: dis3,
			content: "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>",
			License: licen,
			wikiname: name
		});
		res.end();
		return;
	}
});

// 역사 2
router.get('/history/:page/:r', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	var title3 = encodeURIComponent(req.params.page);
	var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/' + req.params.r + '.txt');
	if(exists) {
		var neob = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/' + req.params.r + '.txt', 'utf8');
		neob = neob.replace(/<br>/g, '[br]')
		neob = neob.replace(/\n/g, '<br>')
		var raw = htmlencode.htmlEncode(neob);
		raw = raw.replace(/;&lt;br&gt;/g, '<br>');
		res.status(200).render('history', {
			title: req.params.page,
			title3: title3,
			title2: '<span style="margin-left:5px"></span>(' + req.params.r + ')',
			content: raw,
			dis2: dis2,
			dis3: dis3,
			wikiname: name,
			License: licen
		});
		res.end();
		return;
	}
	else {
		res.status(404).render('history', {
			title: req.params.page,
			title2: '<span style="margin-left:5px"></span>(' + req.params.r + ')',
			title3: title3,
			dis2: dis2,
			dis3: dis3,
			content: "이 문서가 없습니다. <a href='/edit/"+encodeURIComponent(req.params.page)+"'>편집</a>",
			License: licen,
			wikiname: name
		});
		res.end();
		return;
	}
});

// 역사
router.get('/history/:page', function(req, res) {
	licen = rlicen(licen);
	name = rname(name);
	var admin = yourip(req, res);
	var dis2 = loginy(req,res);
	var dis3 = loginny(req,res);
	var title2 = encodeURIComponent(req.params.page);
	var i = 0;
	var neoa = '<div id="history">';
	while(true) {
		i = i + 1;
		var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r'+ i +'.txt');
		if(exists) {
			var ip = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-ip.txt', 'utf8');
			var today = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-today.txt', 'utf8');
			var send = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-send.txt', 'utf8');
			var exists = fs.existsSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-leng.txt');
			if(exists) {
				var leng = fs.readFileSync('./history/' + encodeURIComponent(req.params.page) + '/r' + i + '-leng.txt', 'utf8');
				var plus = /\+/g;
				var or = /\-/g;
				if(plus.exec(leng)) {
					var pageplus = '</a> <span style="color:green;">(' + leng + ')</span>';
				}
				else if(or.exec(leng)) {
					var pageplus = '</a> <span style="color:red;">(' + leng + ')</span>';
				}
				else {
					var pageplus = '</a>';
				}
			}
			else {
				var pageplus = '</a>';
			}
			if(send === '<br>') {}
			else {
				send = htmlencode.htmlEncode(send);
				send = send.replace(/&lt;a href=&quot;\/w\/(?:(?:(?!&quot;).)*)&quot;&gt;((?:(?!&lt;).)*)&lt;\/a&gt;/g, '<a href="/w/$1">$1</a>');
			}
			var exists = fs.existsSync('./user/' + admin + '-admin.txt');
			if(exists) {
				var exists = fs.existsSync('./user/' + encodeURIComponent(ip) + '-ban.txt');
				if(exists) {
					var ban = '풀기';
				}
				else {
					var ban = '차단';
				}
				neoa = '<table id="toron"><tbody><tr><td id="yosolo">r' + i + ' <a href="/history/' + encodeURIComponent(req.params.page) + '/r' + i + '">(raw)</a> <a href="/history/w/' + encodeURIComponent(req.params.page) + '/r' + i + '">(w)</a> <a href="/revert/' + encodeURIComponent(req.params.page) + '/r' + i + '">(revert)' + pageplus + '</td><td id="yosolo">' + ip + ' <a href="/ban/' + ip + '">(' + ban + ')</a></td><td id="yosolo">' + today +'</td></tr><tr><td colspan="3" id="yosolo">' + send + '</td></tr></tbody></table>' + neoa;
			}
			else {
				neoa = '<table id="toron"><tbody><tr><td id="yosolo">r' + i + ' <a href="/history/' + encodeURIComponent(req.params.page) + '/r' + i + '">(raw)</a> <a href="/history/w/' + encodeURIComponent(req.params.page) + '/r' + i + '">(w)</a> <a href="/revert/' + encodeURIComponent(req.params.page) + '/r' + i + '">(revert)' + pageplus + '</td><td id="yosolo">' + ip + '</td><td id="yosolo">' + today +'</td></tr><tr><td colspan="3" id="yosolo">' + send + '</td></tr></tbody></table>' + neoa;
			}
		}
		else {
			neoa = neoa + '</div>';
			var exists = fs.existsSync('./data/' + encodeURIComponent(req.params.page) + '-stop.txt');
			if(exists) {
				neoa = '<table id="toron"><tbody><td id="yosolo">관리자만 편집 가능한 문서 입니다.</td></tr></tbody></table>' + neoa;
			}
			res.status(200).render('history2', {
				title: req.params.page,
				dis2: dis2,
				dis3: dis3,
				title2:title2,
				content: neoa,
				License: licen,
				wikiname: name
			});
			res.end()
			return;
			break;
		}
	}
});

// 액세스 방지
router.get('/Access', function(req, res) {
	var dis2 = loginy(req, res);
	var dis3 = loginny(req, res);
	name = rname(name);
	res.status(404).render('ban', {
		title: '권한 오류',
		dis2: dis2,
		dis3: dis3,
		content: '어드민이 아닙니다.',
		wikiname: name
	});
	res.end();
	return;
});

// 기타 도움 문서
router.get('/other', function(req, res) {
	var dis2 = loginy(req, res);
	var dis3 = loginny(req, res);
	name = rname(name);
	res.status(404).render('ban', {
		title: '기타 메뉴',
		dis2: dis2,
		dis3: dis3,
		content: '<li><a href="/ver">위키 버전</a></li><li><a href="/titleindex">모든 문서</a></li>',
		wikiname: name
	});
	res.end();
	return;
});

module.exports = router;
