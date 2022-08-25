// ==UserScript==
// @name         New_Map_beta
// @namespace    http://tampermonkey.net/
// @version      1.13
// @description  try to take over the world!
// @author       Artak and Endless Night
// @include      *://pixelplanet.fun/*
// @include      *://fuckyouarkeros.fun/*
// @icon         https://www.google.com/s2/favicons?domain=fuckyouarkeros.fun
// @grant        none
// ==/UserScript==

(function() {
    const pathToScript = {
        'pixelplanet.fun' : 'https://raw.githubusercontent.com/snowyaaaa/map/main/New_Map_beta_shifr.js',
        'fuckyouarkeros.fun' : 'https://raw.githubusercontent.com/snowyaaaa/map/main/New_Map_beta_shifr.js',

    }[window.location.host];

    if(pathToScript !== void 0){
        fetch(pathToScript)
            .then(res => res.text())
            .then(code => {
            const e = document.createElement('script');
            e.innerHTML = code;
            document.body.appendChild(e);

        });
    }
    // Your code here...
})();
