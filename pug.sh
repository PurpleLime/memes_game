#!/bin/sh
(pug -c -E js -n mainPageTemplate public/templates/mainPage/mainPage.pug)
(pug -c -E js -n lobbyTemplate public/templates/lobby/lobby.pug)
(pug -c -E js -n joinLobbyTemplate public/templates/joinLobby/joinLobby.pug)
(pug -c -E js -n ingameTemplate public/templates/ingame/ingame.pug)
(pug -c -E js -n ingameTemplate public/templates/ingame/ingameChoice.pug)