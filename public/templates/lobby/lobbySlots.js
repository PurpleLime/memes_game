function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function lobbySlotsTemplate(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug":"#user1.user-game-avatar\n    .user-game-avatar__name-container.none\n        | Имя\n#user2.user-game-avatar\n    .user-game-avatar__name-container.none\n        | Имя\n#user3.user-game-avatar\n    .user-game-avatar__name-container.none\n        | Имя\n#user4.user-game-avatar\n    .user-game-avatar__name-container.none\n        | Имя\n#user5.user-game-avatar\n    .user-game-avatar__name-container.none\n        | Имя\n#user6.user-game-avatar\n    .user-game-avatar__name-container.none\n        | Имя\n#user7.user-game-avatar\n    .user-game-avatar__name-container.none\n        | Имя\n#user8.user-game-avatar\n    .user-game-avatar__name-container.none\n        | Имя"};
;pug_debug_line = 1;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar\" id=\"user1\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar__name-container none\"\u003E";
;pug_debug_line = 3;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "Имя\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 4;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar\" id=\"user2\"\u003E";
;pug_debug_line = 5;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar__name-container none\"\u003E";
;pug_debug_line = 6;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "Имя\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 7;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar\" id=\"user3\"\u003E";
;pug_debug_line = 8;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar__name-container none\"\u003E";
;pug_debug_line = 9;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "Имя\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 10;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar\" id=\"user4\"\u003E";
;pug_debug_line = 11;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar__name-container none\"\u003E";
;pug_debug_line = 12;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "Имя\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 13;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar\" id=\"user5\"\u003E";
;pug_debug_line = 14;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar__name-container none\"\u003E";
;pug_debug_line = 15;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "Имя\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 16;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar\" id=\"user6\"\u003E";
;pug_debug_line = 17;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar__name-container none\"\u003E";
;pug_debug_line = 18;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "Имя\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 19;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar\" id=\"user7\"\u003E";
;pug_debug_line = 20;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar__name-container none\"\u003E";
;pug_debug_line = 21;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "Имя\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 22;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar\" id=\"user8\"\u003E";
;pug_debug_line = 23;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "\u003Cdiv class=\"user-game-avatar__name-container none\"\u003E";
;pug_debug_line = 24;pug_debug_filename = "public\u002Ftemplates\u002Flobby\u002FlobbySlots.pug";
pug_html = pug_html + "Имя\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;}