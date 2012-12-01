/*
 * jQuery.zip2addr
 *
 * Copyright 2010, Kotaro Kokubo a.k.a kotarok kotaro@nodot.jp
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * https://github.com/kotarok/jQuery.zip2addr
 *
 * Depends:
 *	jQuery 1.4 or above
 */

/*
 * jQuery.Zip2AddrByClick v0.1
 *
 * Copyright 2012, TAGAWA Takao dounokouno@gmail.com
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * https://github.com/dounokouno/jQuery.Zip2AddrByClick
 *
 */
$.fn.zip2addrbyclick = function(options){ 
	var c = $.extend({
		api: 'http://www.google.com/transliterate?langpair=ja-Hira|ja&jsonp=?',
		prefectureToken: '(東京都|道|府|県)',
		zipDelimiter: '-',
		zip: null,
		zip2: null,
		pref: null,
		addr: null
	}, options);
	
	var cache = $.fn.zip2addrbyclick.cache;
	
	var getAddr = function(zip, callback){
		if (location.protocol === 'https:') {
			c.api = c.api.replace(/http:/, 'https:');
		}
		$.getJSON(c.api, {'text':zip}, function(json){
			if (RegExp(c.prefectureToken).test(json[0][1][0])) {
				callback(json[0][1][0].replace(RegExp('(.*?'+c.prefectureToken+')(.+)'),function(a,b,c,d){
					return [b,d];
				}));
			}
		});
	};
	
	var fillAddr = (function(){
		if (c.pref) {
			return function(addr){
				var addrs = addr.split(',');
				if (addrs) {
					if (!RegExp(addrs[1]).test($(c.addr).val())) {
						$(c.pref).val(addrs[0]);
						$(c.addr).val(addrs[1]);
					}
				} else if (!RegExp(addrs[1]).test($(c.addr).val())) {
					$(c.pref).add(c.addr).val('');
				}
			};
		} else {
			return function(addr){
				var addrStr = addr.replace(',','');
				var addrField = c.addr;
				if (addrStr) {
					if (!RegExp(addrStr).test($(addrField).val())) {
						$(addrField).val(addrStr);
					}
				} else if (!RegExp(addrStr).test($(addrField).val())) {
					$(addrField).val('');
				}
			};
		}
	})();

	//From http://liosk.blog103.fc2.com/blog-entry-72.html
	var fascii2ascii = (function(){
		var pattern = /[\uFF01-\uFF5E]/g, replace = function(m) {
			return String.fromCharCode(m.charCodeAt() - 0xFEE0);
		};
		return function(s){return s.replace(pattern, replace);};
	})();

	var check = function(_val){
		var val = fascii2ascii(_val).replace(/\D/g,'');
		if (val.length === 7) {
			if (cache[val] === undefined) {
				getAddr(val.replace(/(\d\d\d)(\d\d\d\d)/,'$1-$2'),function(json){
					cache[val] = json;
					fillAddr(json);
				});
			} else {
				fillAddr(cache[val]);
			}
		}
	};
	
	this.each(function(){
		$(this).click(function(){
			if (c.zip && c.zip2) {
				check($(c.zip).val()+''+$(c.zip2).val());
			} else if (c.zip) {
				var $zip =  $(c.zip);
				check($zip.val());
				$zip.val(function(){
					return fascii2ascii($zip.val()).replace(/\D/g,'').replace(/(\d\d\d)(\d\d\d\d)/,'$1'+c.zipDelimiter+'$2');
				});
			}
		});
	});
	
	return this;
};

$.fn.zip2addrbyclick.cache = {};