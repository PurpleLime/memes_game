function pug_rethrow(n,e,r,t){if(!(n instanceof Error))throw n;if(!("undefined"==typeof window&&e||t))throw n.message+=" on line "+r,n;try{t=t||require("fs").readFileSync(e,"utf8")}catch(e){pug_rethrow(n,null,r)}var i=3,a=t.split("\n"),o=Math.max(r-i,0),h=Math.min(a.length,r+i),i=a.slice(o,h).map(function(n,e){var t=e+o+1;return(t==r?"  > ":"    ")+t+"| "+n}).join("\n");throw n.path=e,n.message=(e||"Pug")+":"+r+"\n"+i+"\n\n"+n.message,n}function ingameTemplate(locals) {var pug_html = "", pug_mixins = {}, pug_interp;var pug_debug_filename, pug_debug_line;try {var pug_debug_sources = {"public\u002Ftemplates\u002Fingame\u002Fingame.pug":"#container.container\n    #extraSituationCard.situation-card-deck.situation-card-deck_extra\n    .standart-button.standart-button_size_l.ingame-menu-button\n        .menu-icon\n    .standart-button.standart-button_size_m.ingame-pull-out-mode-button\n        .pull-out-mode-icon\n    #selfJudgeEmblem.self_judge_emblem.self_judge_emblem_none.standart-button_size_l\n    #confirmButton.standart-button.standart-button_size_m.ingame-confirm-button\n        .confirm-icon\n    .ingame-page-upper-cap\n    #playersCircle.players-circle\n        #playersContainer.players-circle__container\n    #situationCardDeck.situation-card-deck.situation-card_backside\n    #memeCardDeck.meme-card-deck\n    #playerHand.player-hand\n    #selfScore.self-score-block\n        .self-star-icon\n        .self-score-block__score-amount\n            | 0\n"};
;pug_debug_line = 1;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"container\" id=\"container\"\u003E";
;pug_debug_line = 2;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"situation-card-deck situation-card-deck_extra\" id=\"extraSituationCard\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 3;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"standart-button standart-button_size_l ingame-menu-button\"\u003E";
;pug_debug_line = 4;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"menu-icon\"\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 5;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"standart-button standart-button_size_m ingame-pull-out-mode-button\"\u003E";
;pug_debug_line = 6;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"pull-out-mode-icon\"\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 7;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"self_judge_emblem self_judge_emblem_none standart-button_size_l\" id=\"selfJudgeEmblem\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 8;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"standart-button standart-button_size_m ingame-confirm-button\" id=\"confirmButton\"\u003E";
;pug_debug_line = 9;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"confirm-icon\"\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 10;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"ingame-page-upper-cap\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 11;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"players-circle\" id=\"playersCircle\"\u003E";
;pug_debug_line = 12;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"players-circle__container\" id=\"playersContainer\"\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 13;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"situation-card-deck situation-card_backside\" id=\"situationCardDeck\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 14;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"meme-card-deck\" id=\"memeCardDeck\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 15;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"player-hand\" id=\"playerHand\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 16;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"self-score-block\" id=\"selfScore\"\u003E";
;pug_debug_line = 17;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"self-star-icon\"\u003E\u003C\u002Fdiv\u003E";
;pug_debug_line = 18;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "\u003Cdiv class=\"self-score-block__score-amount\"\u003E";
;pug_debug_line = 19;pug_debug_filename = "public\u002Ftemplates\u002Fingame\u002Fingame.pug";
pug_html = pug_html + "0\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E\u003C\u002Fdiv\u003E";} catch (err) {pug_rethrow(err, pug_debug_filename, pug_debug_line, pug_debug_sources[pug_debug_filename]);};return pug_html;}