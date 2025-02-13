// ==UserScript==
// @name         Мини-карта для пиксельзон от команды 2x2 Pixel Battle Team Crew
// @namespace    http://tampermonkey.net/
// @version      2.1.11
// @description  Overlay-like tool for pixelzone.io
// @author       meatie, modified by Yoldaş Pisicik. URL adaptive by Edward Scorpio & MDOwlman
// @match        https://pixelzone.io/*
// @homepage     https://github.com/EdwardScorpio/pz-map/
// @updateURL    https://raw.githubusercontent.com/EdwardScorpio/pz-map/main/PBteam-map-2.0.user.js
// @downloadURL  https://raw.githubusercontent.com/EdwardScorpio/pz-map/main/PBteam-map-2.0.user.js
// @icon         https://i.ibb.co/C5S0R1bV/Square-Logo2x2.png
// @grant        GM_info
// @run-at       document-end
// ==/UserScript==

/* Based on https://github.com/Pinkfloydd/ArgentinaMap_PixelZone

Инструкции

Используйте плагин Tampermonkey, чтобы внедрить это в игру. Добавьте скрипт, вставьте код.

Путь к изображениям должен быть прямым, например: https://image.com/img.png.
Код для ссылок и координат находится на 450-ых строках.
Клавиши:
Пробел : Показать и скрыть карту. Это также перезагружает изображения шаблона после обновления.
QERTYUIOP и FGHJKLZ : выбрать цвет
+/- numpad: масштабирование миникарты (Так же можно масштабировать на клавиши "-" и "=" )
0: Включить\Выключить Автовыбор цвета
9: Проверить наличие обновлений (Так же, оно выполняется автоматически при загрузке страницы PixelZone, и в настройках)

Мини-карта стартует скрытой. Чтобы она заработала - откройте её.
*/
let vers = "=2X2 Мини-карта=";
let range = 6; //margin for showing the map window
let x, y, zoomlevel, zooming_out, zooming_in, zoom_time, x_window, y_window, coorDOM, gameWindow;
let toggle_show, toggle_follow, counter, image_list, needed_templates, mousemoved;
let minimap, minimap_board, minimap_cursor, minimap_box, minimap_text;
let ctx_minimap, ctx_minimap_board, ctx_minimap_cursor, setFactionTemplates, errorDetectionEnabled;

Number.prototype.between = function (a, b) {
    let min = Math.min.apply(Math, [a, b]);
    let max = Math.max.apply(Math, [a, b]);
    return this > min && this < max;
};

function startup() {
    document.addEventListener('keydown', function (e) {
        if (e.key === '9') {
            checkForUpdates(false);
        }
    });

    setTimeout(addUpdateCheckListener, 0);
    addUpdateCheckListener();

    function addUpdateCheckListener() {
        const checkUpdatesButton = document.getElementById("check-updates");
        if (checkUpdatesButton && !checkUpdatesButton.hasAttribute("data-listener-added")) {
            checkUpdatesButton.addEventListener("click", () => checkForUpdates(false));
            checkUpdatesButton.setAttribute("data-listener-added", "true");
        }
    }
    window.addEventListener('keydown', function (e) {
        if (e.key === '1') {
            errorDetectionEnabled = false;
            let diff = document.getElementById("diffCanvas");
            if (diff) diff.style.display = "none";
            console.log("Normal mode enabled (error detection disabled).")
                ;
        }

        else if (e.key === '2') {
            errorDetectionEnabled = true;
            setupErrorDetectionCanvases();
            console.log("Error detection mode enabled.");
        }
    });
    window.timerDiv = undefined;
    let i, t = getCookie("baseTemplateUrl");
    let leftContainer, usersDiv, coordDiv;

    console.log("Try: listTemplates() and keys space, QERTYUIOP FGHJKLZ");
    gameWindow = document.getElementsByTagName("canvas")[0];

    leftContainer = document.getElementsByClassName("_left_16o3w_27")[0];

    usersDiv = leftContainer.childNodes[0];
    coordDiv = leftContainer.childNodes[1];

    let pixelCounter = document.createElement('div');
    pixelCounter.className = '_flex_16o3w_1 _row_16o3w_8 _center_16o3w_14 _background_xd2n8_16 _padding_xd2n8_39 _margin_xd2n8_43 _fit-content_xd2n8_34 _note_9gyhg_1';
    pixelCounter.innerHTML = `<svg fill="none" stroke-width="2" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" height="1em" width="1em" style="width: 1.65em; height: 1.65em; overflow: visible; color: currentcolor; margin: 0; margin-block: 0; margin-left: 4px; margin-bottom: 4px;"><path xmlns="http://www.w3.org/2000/svg" d="M6.56 25.48c-0.32 0-0.64-0.2-0.76-0.52l-1.8-4.28-2.84 1.12c-0.24 0.12-0.56 0.080-0.8-0.080s-0.36-0.4-0.36-0.68v-13.68c0-0.32 0.2-0.64 0.52-0.76s0.68-0.040 0.92 0.2l9.68 9.68c0.2 0.2 0.28 0.48 0.24 0.76s-0.24 0.52-0.48 0.6l-2.8 1.2 1.76 4.28c0.16 0.44-0.040 0.92-0.44 1.080l-2.48 1.040c-0.16 0.040-0.24 0.040-0.36 0.040zM4.48 18.76c0.32 0 0.64 0.2 0.76 0.52l1.76 4.28 0.92-0.4-1.76-4.28c-0.16-0.44 0.040-0.92 0.44-1.080l2.44-1.040-7.36-7.36v10.44l2.48-1c0.080-0.040 0.2-0.080 0.32-0.080z"/></svg>
  <span id="pixelCounter" class="notranslate">0</span>`;
    leftContainer.appendChild(pixelCounter);

    //DOM element of the displayed X, Y
    coorDOM = coordDiv.childNodes[1];

    //coordinates of the middle of the window
    x_window = y_window = 0;

    //coordinates of cursor
    x = y = 0;

    //list of all available templates
    window.template_list = null;

    //minimap zoom level
    zoomlevel = 14;

    //toggle options
    toggle_show = false;
    toggle_follow = true; //if minimap is following window, x_window = x and y_window = y;
    zooming_in = zooming_out = false;
    zoom_time = 100;

    //array with all loaded template-images
    window.image_list = [];
    counter = 0;

    //templates which are needed in the current area
    needed_templates = [];

    //Cachebreaker to force image refresh. Set it to eg. 1
    window.cachebreaker = "";



    let div = document.createElement('div');
    div.setAttribute('class', 'post block bc2');

    div.innerHTML = `
<style>
#not_Used{display: none !important}

.switch {
      position: relative;
      display: inline-block;
      width: 42px;
      height: 18px;
    }

.switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

.slider {
      position: absolute;
      cursor: pointer;
      top:-2px;
      left: 4px;
      right: 0;
      bottom: 0;
      background-color: #2F4F4F;
      -webkit-transition: .2s;
      transition: .2s;
    }

.slider:before {
      position: absolute;
      content: "//";
      height: 20px;
      width: 16px;
      left: 0;
      background-color: Silver;
      -webkit-transition: .4s;
      transition: .4s;
    }

input:checked + .slider {
      background-color:Lime;
    }

input:focus + .slider {
      box-shadow: 0 0 0 #Lime;
    }

input:checked + .slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }

.slider.round {
      border-radius: 8px 8px 4px 4px;
    }

.slider.round:before {
      border-radius: 16%;
    }
  </style>

<div id="minimapbg" style="background-color:rgba(202,202,202,80%); border-radius:30px 30px 0 0px; position:absolute; right:6px; bottom:6px; z-index:1;">
    <div class="posy unselectable" id="posyt" style="background-size:100%; color:#fff; text-align:center; line-height:24px; vertical-align:middle; width:auto; height:auto; padding:6px 6px;">
      <div id="minimap-text" style="background:DimGray;padding-left:2px;padding-right:2px;border-radius:20px 20px 0 0 ;user-select:none;">=2x2 Мини-Карта=</div>
      <div id="minimap-title" style="line-height:16px;font-size:1em;background:Black;Border-radius:40px 40px 0 0;user-select:none;padding:4px;">${vers}</div>
      <div id="minimap-box" style="position: sticky;width:390px;height:280px">
        <canvas id="minimap" style="width: 100%; height: 100%;z-index:1;position:absolute;top:0;left:0;"></canvas>
        <canvas id="minimap-board" style="width: 100%; height: 100%;z-index:2;position:absolute;top:0;left:0;"></canvas>
        <canvas id="minimap-cursor" style="width: 100%; height: 100%;z-index:3;position:absolute;top:0;left:0;"></canvas>
      </div>
<div id="minimap-config" style="line-height:12px;"><br>
  <span id="hide-map" style="cursor:pointer;user-select:none;background:#1164B4;padding-left:2px;padding-right:2px;border-radius:12px 0 0 12px;margin-right:2px;">Скрыть</span>
  <span id="settings-map" style="cursor:pointer;user-select:none;background:Teal;padding-left:2px;padding-right:4px;border-radius:0 12px 12px 0;margin-right:2px;">Настройки</span>
  <span style='user-select: none;background:Purple;border-radius:6px;padding-left:4px;padding-right:4px'>Зум</span>
  <span id="zoom-plus" style="cursor:pointer;font-weight:bold;user-select:none;background:Crimson;padding-left:0;padding-right:0;border-radius:12px 12px 2px 2px;">&nbsp;+&nbsp;</span>
  <span id="zoom-minus" style="cursor:pointer;font-weight:bold;user-select:none;background:Blue;padding-left:0;padding-right:0;border-radius:4px 4px 12px 12px;">&nbsp;-&nbsp;</span>
  <span style='user-select: none;background:Green;margin-left:2px;padding-left:4px;padding-right:4px;border-radius:12px;'>Aвто-Цвет</span>
  <label class="switch" style="horizontal-align: middle;">
    <input id='autoColor' type="checkbox">
    <span class="slider round"></span>
  </label>
</div>
    </div>

<div id="minimap_settings" style="background-size:100%; width:auto; height:auto; text-align:center; display:none;">
      <div id="minimap-title" style="line-height:16px;font-size:1em;user-select:none;padding:4px;background:Teal;border-radius:20px 20px 0 0">Настройки</div>
  <span style='user-select: none; padding:2px;Background:DarkGrey;border-radius:8px'>Режим</span>
  <select id="factionSelect" style='outline:0;font-family:Nunito,sans-serif;border-radius:16px;'>
    <option value="PBteam">PBteam</option>
    <option value="NewFaction">NewFaction</option>
  </select>
      <br><br>
<span id="check-updates" style="cursor:pointer;user-select:none;background:#01796F;padding-left:4px;padding-right:4px;border-radius:8px;">Обновления</span>
<br>
<span id="script-version" style="font-size:0.9em;color:#0fffff;background:#01796F;padding-left:4px;padding-right:4px;border-radius:8px;"> Версия: </span>
<br><br>
      <span id="settings-map-2" style="cursor:pointer;user-select:none;text-align:center;background:#003153;padding-left:4px;padding-right:4px;border-radius:8px;">Вернуться</span><br><br>
    </div>
  </div>
`;

    document.body.appendChild(div);

    function setScriptVersion() {
        const versionSpan = document.getElementById('script-version');
        if (versionSpan) {
            versionSpan.textContent = 'Версия:2.1.11' + GM_info.script.version;
        }
    }

    document.body.appendChild(div);

    minimap = document.getElementById("minimap");
    minimap_board = document.getElementById("minimap-board");
    minimap_cursor = document.getElementById("minimap-cursor");
    minimap.width = minimap.offsetWidth;
    minimap_board.width = minimap_board.offsetWidth;
    minimap_cursor.width = minimap_cursor.offsetWidth;
    minimap.height = minimap.offsetHeight;
    minimap_board.height = minimap_board.offsetHeight;
    minimap_cursor.height = minimap_cursor.offsetHeight;
    ctx_minimap = minimap.getContext("2d");
    ctx_minimap_board = minimap_board.getContext("2d");
    ctx_minimap_cursor = minimap_cursor.getContext("2d");
    minimap_box = document.getElementById("minimap-box");
    minimap_text = document.getElementById("minimap-text");

    //No Antialiasing when scaling!
    ctx_minimap.mozImageSmoothingEnabled = false;
    ctx_minimap.webkitImageSmoothingEnabled = false;
    ctx_minimap.msImageSmoothingEnabled = false;
    ctx_minimap.imageSmoothingEnabled = false;

    //Bugfix really
    document.getElementsByClassName("_pointer-children_xd2n8_73")[0].style = "max-height:1px";

    toggleShow(toggle_show);

    drawBoard();
    drawCursor();

    document.getElementsByClassName("_ratio_1owdq_1")[0].parentElement.style = "position:absolute;left:158px;zoom:0.66";

    let pal = document.getElementsByClassName("_ratio_1owdq_1")[0].firstChild.firstChild;

    // Loop the color divs, add tooltips
    for (i = 0; i < 16; i++) {
        pal.childNodes[i].firstChild.title = "QERTYUIOPFGHJKLZ".substr(i, 1) + ":" + i;
    }

    document.getElementById("hide-map").onclick = function () {
        toggleShow(false);
    };

    minimap_text.onclick = function () {
        toggleShow(true);
    };

    document.getElementById("settings-map").onclick = function () {
        document.getElementById("minimap_settings").style.display = 'block';
        document.getElementById("posyt").style.display = 'none';
    };

    document.getElementById("settings-map-2").onclick = function () {
        document.getElementById("minimap_settings").style.display = 'none';
        document.getElementById("posyt").style.display = 'block';
    };

    document.getElementById("zoom-plus").addEventListener('mousedown', function (e) {
        e.preventDefault();
        zooming_in = true;
        zooming_out = false;
        zoomIn();
    }, false);

    document.getElementById("zoom-minus").addEventListener('mousedown', function (e) {
        e.preventDefault();
        zooming_out = true;
        zooming_in = false;
        zoomOut();
    }, false);

    document.getElementById("zoom-plus").addEventListener('mouseup', function (e) {
        zooming_in = false;
    }, false);

    document.getElementById("zoom-minus").addEventListener('mouseup', function (e) {
        zooming_out = false;
    }, false);

    gameWindow.addEventListener('mouseup', function (evt) {
        if (!toggle_show) return;
        if (!toggle_follow) setTimeout(getCenter, 1650);
    }, false);

    gameWindow.addEventListener('mousemove', mymousemove, false);

    setInterval(updateloop, 5e3);

    updateloop();

    setInterval(function () {
        if (mousemoved) {
            mousemoved = false;
            loadTemplates();
        }
    }, 20);

    setInterval(() => {
        try {
            fetch('https://pixelzone.io/users/profile/me').then(body => body.json().then(data => {
                document.getElementById('pixelCounter').innerText = data.pixels;
            }))

        } catch (err) { };
    }, 5000)
}

window.addEventListener('load', function () {
    let loadInt = setInterval(() => {
        window.timerDiv = document.getElementsByClassName("_center_16o3w_14 _top_16o3w_18 _fit-content_xd2n8_34")[0].attributes;

        if (window.timerDiv.length > 0) {
            clearInterval(loadInt)

            startup();
        }
    }, 100)
}, false);

function mymousemove(evt) {
    if (!toggle_show || !coorDOM) return;

    let coordsXY = coorDOM.innerHTML.split(/\s?[xy:]+/);

    let x_new = parseInt(coordsXY[1]);
    let y_new = parseInt(coordsXY[2]);

    if (x != x_new || y != y_new) {
        x = x_new;
        y = y_new;

        if (toggle_follow) {
            x_window = x;
            y_window = y;
        } else {
            drawCursor();
        }
        mousemoved = 1;
    }

    if (document.getElementById('autoColor').checked == false) return;

    let hoveringColor = window.board.getImageData(195, 140, 1, 1).data + '';

    if (hoveringColor[3] === 0) return;

    switch (hoveringColor) {
        case '38,38,38,255': clickColor(0); break;

        case '0,0,0,255': clickColor(1); break;

        case '128,128,128,255': clickColor(2); break;

        case '255,255,255,255': clickColor(3); break;

        case '153,98,61,255': clickColor(4); break;

        case '255,163,200,255': clickColor(5); break;

        case '207,115,230,255': clickColor(6); break;

        case '128,0,128,255': clickColor(7); break;

        case '229,0,0,255': clickColor(8); break;

        case '229,137,0,255': clickColor(9); break;

        case '229,229,0,255': clickColor(10); break;

        case '150,230,70,255': clickColor(11); break;

        case '0,190,0,255': clickColor(12); break;

        case '0,230,230,255': clickColor(13); break;

        case '0,136,204,255': clickColor(14); break;

        case '0,0,230,255': clickColor(15); break;
    }
}

window.listTemplates = function () {
    let ttlpx = 0;
    let mdstr = "";

    if (!template_list) {
        console.log("### No templates. Show the minimap first");
        return;
    }

    Object.keys(template_list).map(function (index, ele) {
        let eles = template_list[index];

        if (!eles.name) return;

        let z = eles.width > 300 ? 2 : eles.width > 100 ? 4 : 8;

        let n = eles.name + "";

        if (n.indexOf("//") < 0) n = baseTemplateUrl + n;

        mdstr += '\n#### ' + index + ' ' + eles.width + 'x' + eles.height + ' ' + n;
        mdstr += ' https://pixelzone.io/?p=' + Math.floor(eles.x + eles.width / 2) + ',' + Math.floor(eles.y + eles.height / 2) + ',' + z + '\n';

        if (!isNaN(eles.width) && !isNaN(eles.height)) ttlpx += eles.width * eles.height;
    });

    mdstr = '### Total pixel count: ' + ttlpx + '\n' + mdstr;
}

function updateloop() {
    if (!toggle_show) return;

    // Здесь мы напрямую определяем template_list, вместо загрузки из файла
    window.template_list = {
        "Map 1": {
            name: "https://i.ibb.co/8yYQ5d5/452cfb16aaca.png",
            x: -4096,
            y: -1473,
            width: 1571,
            height: 2392
        },
        "Mqwieqwe": {
            name: "",
            x: -4074,
            y: -484,
            width: 1075,
            height: 860
        },
        "new_art_3": {
            name: "https://i.ibb.co/XkrDHVQp/dithered-image-1.png",
            x: -4000,
            y: -4000,
            width: 800,
            height: 347
        },
        "new_art_4": {
            name: "",
            x: -4066,
            y: -1242,
            width: 250,
            height: 230
        },
        "new_art_5": {
            name: "",
            x: -4066,
            y: -1242,
            width: 250,
            height: 230
        }
    };

    if (!toggle_follow) getCenter();

    image_list = [];
    loadTemplates();
}

function toggleShow(newValue) {
    if (newValue === undefined) toggle_show = !toggle_show;
    else toggle_show = newValue;
    if (!minimap_box) return;
    if (toggle_show) {
        minimap_box.style.display = "block";
        minimap_text.style.display = "none";
        document.getElementById("minimap-config").style.display = "block";
        loadTemplates();
    } else {
        minimap_box.style.display = "none";
        minimap_text.innerHTML = "Открыть";
        minimap_text.style.display = "block";
        minimap_text.style.cursor = "pointer";
        document.getElementById("minimap-config").style.display = "none";
    }
    let g = document.getElementsByClassName("grecaptcha-badge");
    if (g[0]) g[0].style.display = "none";
}

function zoomIn() {
    if (!zooming_in) return;
    zoomlevel = zoomlevel * 1.2;
    if (zoomlevel > 45) {
        zoomlevel = 45;
        return;
    }
    drawBoard();
    drawCursor();
    loadTemplates();
    setTimeout(zoomIn, zoom_time);
}

function zoomOut() {
    if (!zooming_out) return;
    zoomlevel = zoomlevel / 1.2;
    if (zoomlevel < 1) {
        zoomlevel = 1;
        return;
    }
    drawBoard();
    drawCursor();
    loadTemplates();
    setTimeout(zoomOut, zoom_time);
}

function loadTemplates() {
    if (!toggle_show) return;

    if (window.template_list == null || !minimap_box) return;

    let keys = Object.keys(template_list);

    needed_templates = [];

    keys.forEach(item => {
        if (!template_list[item].width) return;

        let temp_x = template_list[item].x;
        let temp_y = template_list[item].y;
        let temp_xr = temp_x + template_list[item].width;
        let temp_yb = temp_y + template_list[item].height;

        if (!x_window.between(temp_x - range, temp_xr + range)) return;
        if (!y_window.between(temp_y - range, temp_yb + range)) return;

        needed_templates.push(item);
    })

    for (let i = 0; i < keys.length; i++) {
        let template = keys[i];

        if (!template_list[template].width) continue;

        let temp_x = template_list[template].x;
        let temp_y = template_list[template].y;
        let temp_xr = temp_x + template_list[template].width;
        let temp_yb = temp_y + template_list[template].height;

        if (!x_window.between(temp_x - range, temp_xr + range)) continue;
        if (!y_window.between(temp_y - range, temp_yb + range)) continue;

        needed_templates.push(template);
    }

    if (needed_templates.length == 0) {
        if (zooming_in == false && zooming_out == false) {
            minimap_box.style.display = "none";
            minimap_text.style.display = "block";
            minimap_text.innerHTML = "Пусто. Здесь трафаретов нет";
            minimap_text.style.cursor = "auto";
        }
    } else {
        minimap_box.style.display = "block";
        minimap_text.style.display = "none";
        counter = 0;
        for (i = 0; i < needed_templates.length; i++) {
            if (image_list[needed_templates[i]] == null) {
                loadImage(needed_templates[i]);
            } else {
                counter += 1;
                //if last needed image loaded, start drawing
                if (counter == needed_templates.length) drawTemplates();
            }
        }
    }
}

function loadImage(imagename) {
    console.log("    Load image " + imagename, cachebreaker);

    image_list[imagename] = new Image();

    let src = template_list[imagename].name;

    // Теперь src всегда полный URL

    if (cachebreaker) src += "?" + cachebreaker;

    image_list[imagename].crossOrigin = "Anonymous";
    image_list[imagename].src = src;

    image_list[imagename].onload = function () {
        counter += 1;

        if (counter == needed_templates.length) drawTemplates(); //if last needed image loaded, start drawing
    }
}

function drawTemplates() {
    ctx_minimap.clearRect(0, 0, minimap.width, minimap.height);
    let x_left = x_window - minimap.width / zoomlevel / 2;
    let y_top = y_window - minimap.height / zoomlevel / 2;
    for (let i = 0; i < needed_templates.length; i++) {
        let template = needed_templates[i];
        let xoff = (template_list[template].x * 1 - x_left * 1) * zoomlevel;
        let yoff = (template_list[template].y * 1 - y_top * 1) * zoomlevel;
        let newwidth = zoomlevel * image_list[template].width;
        let newheight = zoomlevel * image_list[template].height;
        ctx_minimap.drawImage(image_list[template], xoff, yoff, newwidth, newheight);
        //console.log("Drawn!");
    }
}

function drawBoard() {
    ctx_minimap_board.clearRect(0, 0, minimap_board.width, minimap_board.height);
    if (zoomlevel <= 4.6) return;
    ctx_minimap_board.beginPath();
    let bw = minimap_board.width + zoomlevel;
    let bh = minimap_board.height + zoomlevel;
    let xoff_m = (minimap.width / 2) % zoomlevel - zoomlevel;
    let yoff_m = (minimap.height / 2) % zoomlevel - zoomlevel;
    let z = 1 * zoomlevel;
    ctx_minimap_board.lineWidth = 0.2;
    for (let x = 0; x <= bw; x += z) {
        ctx_minimap_board.moveTo(x + xoff_m, yoff_m);
        ctx_minimap_board.lineTo(x + xoff_m, bh + yoff_m);
    }
    for (x = 0; x <= bh; x += z) {
        ctx_minimap_board.moveTo(xoff_m, x + yoff_m);
        ctx_minimap_board.lineTo(bw + xoff_m, x + yoff_m);
    }
    ctx_minimap_board.strokeStyle = "Gray";
    ctx_minimap_board.stroke();
}

function drawCursor() {
    let x_left = x_window * 1 - minimap.width / zoomlevel / 2;
    let x_right = x_window * 1 + minimap.width / zoomlevel / 2;
    let y_top = y_window * 1 - minimap.height / zoomlevel / 2;
    let y_bottom = y_window * 1 + minimap.height / zoomlevel / 2;

    ctx_minimap_cursor.clearRect(0, 0, minimap_cursor.width, minimap_cursor.height);

    if (x < x_left || x > x_right || y < y_top || y > y_bottom) return;

    let xoff_c = x - x_left;
    let yoff_c = y - y_top;

    ctx_minimap_cursor.beginPath();
    ctx_minimap_cursor.lineWidth = zoomlevel / 6;
    ctx_minimap_cursor.strokeStyle = "#ff1bfc";
    ctx_minimap_cursor.rect(zoomlevel * xoff_c, zoomlevel * yoff_c, zoomlevel, zoomlevel);
    ctx_minimap_cursor.stroke();

    window.board = ctx_minimap;
}

function getCenter() {
    let s = window.location.search.split(",");
    let cx = parseInt(s[0].split("=")[1]), cy = parseInt(s[1]);

    x_window = cx;
    y_window = cy;

    loadTemplates();
}

let refCanvas = document.getElementById("referenceCanvas");
refCanvas = document.createElement("canvas");
refCanvas.id = "referenceCanvas";
refCanvas.style.display = "none";
document.body.appendChild(refCanvas);
let referenceImg = new Image();
referenceImg.crossOrigin = "Anonymous";
referenceImg.src = 'https://i.ibb.co/8yYQ5d5/452cfb16aaca.png';
let refCtx = refCanvas.getContext("2d");


function setupErrorDetectionCanvases() {
    // Получаем размеры мини-карты (убедитесь, что мини-карта уже создана, иначе вызовите эту функцию после инициализации мини-карты)
    let mapWidth = minimap.offsetWidth;
    let mapHeight = minimap.offsetHeight;
    refCanvas.width = mapWidth;
    refCanvas.height = mapHeight;
    // Создаем или обновляем currentCanvas
    let currCanvas = document.getElementById("currentCanvas");
    if (!currCanvas) {
        currCanvas = document.createElement("canvas");
        currCanvas.id = "currentCanvas";
        currCanvas.style.display = "none";
        document.body.appendChild(currCanvas);
    }
    currCanvas.width = mapWidth;
    currCanvas.height = mapHeight;
    // Создаем или обновляем diffCanvas
    let diffCanvas = document.getElementById("diffCanvas");
    if (!diffCanvas) {
        diffCanvas = document.createElement("canvas");
        diffCanvas.id = "diffCanvas";
        diffCanvas.style.position = "absolute";
        diffCanvas.style.pointerEvents = "none";
        diffCanvas.style.zIndex = "4";
        diffCanvas.style.display = "none"; // по умолчанию скрыт
        let mBox = document.getElementById("minimap-box");
        if (mBox) {
            mBox.appendChild(diffCanvas);
        } else {
            document.body.appendChild(diffCanvas);
        }
    }
    diffCanvas.width = mapWidth;
    diffCanvas.height = mapHeight;
    // Загружаем эталонное изображение шаблона PBteam (этот URL используется как эталон)
    refCtx.drawImage(referenceImg, 0, 0, refCanvas.width, refCanvas.height);
}

// Функция, которая обновляет текущее изображение мини-карты и выполняет сравнение с эталоном
function processErrorDetection() {
    let zl = zoomlevel * zoomlevel;
    let x_left = x_window - minimap.width / zoomlevel / 2;
    let y_top = y_window - minimap.height / zoomlevel / 2;
    let xoff = (-4096 - x_left) * zoomlevel;
    let yoff = (-1473 - y_top) * zoomlevel;

    let newwidth = zoomlevel * 1571;
    let newheight = zoomlevel * 2392;

    console.log(x_left, y_top);

    refCtx.drawImage(referenceImg, xoff, yoff, newwidth, newheight);







    if (!errorDetectionEnabled) {
        return
    };
    // Устанавливаем размеры currentCanvas в соответствии с мини-картой
    let mapWidth = minimap.offsetWidth;
    let mapHeight = minimap.offsetHeight;
    let currCanvas = document.getElementById("currentCanvas");
    currCanvas.width = mapWidth;
    currCanvas.height = mapHeight;
    // Копируем изображение мини-карты в currentCanvas
    let currCtx = currCanvas.getContext("2d");
    currCtx.clearRect(0, 0, currCanvas.width, currCanvas.height);
    currCtx.drawImage(minimap, 0, 0, currCanvas.width, currCanvas.height);
    // Вызываем функцию сравнения изображений (diff)
    processImages();
    // Отображаем diffCanvas, чтобы видеть результат сравнения
    let diffCanvas = document.getElementById("diffCanvas");
    if (diffCanvas) diffCanvas.style.display = "block";
    requestAnimationFrame(processErrorDetection);
}

// Функция сравнения изображений, которая берёт динамические размеры canvas
function processImages() {
    let refCanvas = document.getElementById("referenceCanvas");
    let currCanvas = document.getElementById("currentCanvas");
    let diffCanvas = document.getElementById("diffCanvas");
    if (refCanvas && currCanvas && diffCanvas) {
        let refCtx = refCanvas.getContext("2d");
        let currCtx = currCanvas.getContext("2d");
        let diffCtx = diffCanvas.getContext("2d");
        let refData = refCtx.getImageData(0, 0, refCanvas.width, refCanvas.height);
        let currData = currCtx.getImageData(0, 0, currCanvas.width, currCanvas.height);
        let diffData = diffCtx.createImageData(diffCanvas.width, diffCanvas.height);
        let threshold = 50; // порог чувствительности
        for (let i = 0; i < refData.data.length; i += 4) {
            // let rDiff = 
            // let gDiff = 
            // let bDiff = 
            // let diff = (rDiff + gDiff + bDiff) / 3;
            if (

                refData.data[i] != currData.data[i] &&
                refData.data[i + 1] != currData.data[i + 1] &&
                refData.data[i + 2] != currData.data[i + 2]
            ) {
                // Подсвечиваем красным пиксели, где разница больше порога
                diffData.data[i] = 255;
                diffData.data[i + 1] = 0;
                diffData.data[i + 2] = 0;
                diffData.data[i + 3] = 255;
            } else {
                // Иначе оставляем пиксель без изменений (или можно наложить серую маску, если нужно)
                // Например, чтобы правильные пиксели отображались с серой маской:
                diffData.data[i] = currData.data[i];
                diffData.data[i + 1] = currData.data[i+1];
                diffData.data[i + 2] = currData.data[i+2];
                diffData.data[i + 3] = 125;
            }
        }
        diffCtx.putImageData(diffData, 0, 0);
    }
}

// Обработчик клавиш для переключения режима error detection
window.addEventListener('keydown', function (e) {
    if (e.key === '1') {
        // Нормальный режим: отключаем error detection
        errorDetectionEnabled = false;
        let diff = document.getElementById("diffCanvas");
        if (diff) diff.style.display = "none";



        setupErrorDetectionCanvases();

        console.log("Normal mode enabled (error detection disabled).");
    } else if (e.key === '2') {
        // Включаем режим error detection
        errorDetectionEnabled = true;
        requestAnimationFrame(processErrorDetection);

        setupErrorDetectionCanvases();
        console.log("Error detection mode enabled.");
    }
});

// Периодический вызов функции обновления diffCanvas (добавьте в конце функции startup)


window.addEventListener('keydown', function (e) {
    switch (e.keyCode) {
        case 32: //space
            toggleShow();

            if (toggle_show) {
                window.cachebreaker++;
                console.log("cachebreaker = ", cachebreaker);
                updateloop();
            }

            mymousemove();
            break;

        case 81: clickColor(0); break;
        case 69: clickColor(1); break;
        case 82: clickColor(2); break;
        case 84: clickColor(3); break;
        case 89: clickColor(4); break;
        case 85: clickColor(5); break;
        case 73: clickColor(6); break;
        case 79: clickColor(7); break;
        case 80: clickColor(8); break;
        case 70: clickColor(9); break;
        case 71: clickColor(10); break;
        case 72: clickColor(11); break;
        case 74: clickColor(12); break;
        case 75: clickColor(13); break;
        case 76: clickColor(14); break;
        case 192:
        case 90: clickColor(15); break;
        case 87: //WASD
        case 65:
        case 83:
        case 68:
            break;
        case 107: //numpad +
            zooming_in = true;
            zooming_out = false;
            zoomIn();
            zooming_in = false;
            break;
        case 109: //numpad -
            zooming_out = true;
            zooming_in = false;
            zoomOut();
            zooming_out = false;
            break;
        case 88: //x: hide more elements
            let UIDiv = document.getElementById("upperCanvas").nextElementSibling;
            let menu = UIDiv.childNodes[4];
            let playercount = UIDiv.childNodes[3].childNodes[0];
            let coords = playercount.nextElementSibling;
            if (menu.style.display != "none") {
                menu.style.display = "none";
            } else if (playercount.style.display != "none") { //hide counter
                playercount.style.display = "none";
            } else {
                coords.style.display = "none";
            }
            break;
        case 187: // клавиша "="
            zooming_in = true;
            zooming_out = false;
            zoomIn();
            zooming_in = false;
            break;
        case 189: // клавиша "-"
            zooming_out = true;
            zooming_in = false;
            zoomOut();
            zooming_out = false;
            break;
        case 48: // клавиша "0"
            document.getElementById('autoColor').checked = !document.getElementById('autoColor').checked;
            break;
        case 57: // клавиша "9"
            document.getElementById("check-updates").click();
            break;
        default:
            console.log("keydown", e.keyCode, e.key);
    }
});

function clickColor(c) {
    let pal = document.getElementsByClassName("_ratio_1owdq_1")[0].firstChild.firstChild;
    //https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
    let e = new MouseEvent("click", {
        clientX: 5, clientY: 5,
        bubbles: true
    });
    pal.childNodes[c].firstChild.dispatchEvent(e);
}

function setCookie(name, value) { //you can supply "minutes" as 3rd arg.
    let argv = setCookie.arguments;
    let argc = setCookie.arguments.length;
    let minutes = (argc > 2) ? argv[2] : 720 * 1440; //default 720 days
    let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    let expires = "";
    if (minutes > 0) expires = "; Expires=" + date.toGMTString();
    document.cookie = name + "=" + value + expires + "; SameSite=Lax; Path=/";
}
window.setCookie = setCookie;

function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

let isCheckingForUpdates = false;

function checkForUpdates(silent = false) {
    if (isCheckingForUpdates) return;
    isCheckingForUpdates = true;

    const updateURL = "https://raw.githubusercontent.com/EdwardScorpio/pz-map/main/PBteam-map-2.0.user.js";
    fetch(updateURL)
        .then(response => response.text())
        .then(data => {
            const remoteVersion = data.match(/@version\s+(\S+)/);
            const currentVersion = GM_info.script.version;
            if (remoteVersion && compareVersions(remoteVersion[1], currentVersion) > 0) {
                if (confirm("Доступна новая версия скрипта. Хотите обновить?")) {
                    window.open(updateURL, "_blank");
                }
            } else if (!silent) {
                alert("У вас установлена последняя версия скрипта. Обновлений нет. ДЕФ СОВЁНКА!");
            }
        })
        .catch(error => console.error('Ошибка при проверке обновлений:', error))
        .finally(() => {
            isCheckingForUpdates = false;
        });
}

function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;
        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }
    return 0;
}

function addUpdateCheckListener() {
    const checkUpdatesButton = document.getElementById('check-updates');
    if (checkUpdatesButton) {
        checkUpdatesButton.addEventListener('click', function () {
            checkForUpdates(false);
        });
    } else {
        console.error('Check Updates button not found');
    }
}

// Функция сравнения пикселей эталонного изображения и текущего изображения мини-карты.
// Если разница превышает порог (threshold), отличающийся пиксель в diffCanvas подсвечивается красным.
