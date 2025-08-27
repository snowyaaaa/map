// ==UserScript==
// @name         Panel Adjust FOR MLPP
// @namespace    http://tampermonkey.net/
// @version      1.1
// @icon data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA7UlEQVR4nO2YTQ6CMBBGuYV01dbTQLiO1otIzyU9AnABgb2GxJ9YFqTNOCX6vWS2k+8lbTPTLAMAgE2yO7kqN64Xxt1CKj+6LjdN6ffb19dK10Ov7XgLKWWHTtpp0W+VOUho+JeEaVq/3xwkNLx+Syz6rRIb/ll+v9jw+lEQEBAYIRAEBH7tGZV2KmMklB1aeZ6K5ALsCAgkRkDgu9MtuwD1dMsuwH4kBQQ+gUAo1JeOX8A0ZYzEHD4/XIrkAtRAIDUQCIX6J41dQBGvgOwCmngJh0AoEPCAwN8JKOJnlH2llMQ/adTTLQAAZJvgDjMIzITsihWCAAAAAElFTkSuQmCC
// @description  Перемещает панель в угол и уменьшает кнопки
// @author       Artak
// @match      *://wplace.live/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // набор требуемых классов
    const targetClasses = ['btn','btn-primary','btn-lg','sm:btn-xl','relative','z-30'];

    function emptyHandler(){
        setTimeout(()=>{
            (function(){
                const STYLE_ID = 'custom-palette-style';
                document.getElementById(STYLE_ID)?.remove();

                const css = `
                    .custom-palette-move {
                        position: fixed !important;
                        left: 5vw !important;
                        bottom: -8px !important;
                        right: auto !important;
                        top: auto !important;
                        transform: none !important;
                        width: auto !important;
                        max-width: none !important;
                        padding: 6px !important;
                        z-index: 2147483647 !important;
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 8px !important;
                        background: transparent !important;
                        align-items: flex-start !important;
                    }
                    .custom-palette-move > * { width: auto !important; max-width: none !important; }
                    .custom-palette-move .grid,
                    .custom-palette-move .grid.grid {
                        display: grid !important;
                        grid-template-columns: repeat(auto-fill, 28px) !important;
                        grid-auto-rows: 28px !important;
                        gap: 6px !important;
                        align-items: center !important;
                        justify-content: start !important;
                        width: auto !important;
                    }
                    .custom-palette-move [id^="color-"] {
                        width: 28px !important;
                        height: 28px !important;
                        min-width: 28px !important;
                        padding: 0 !important;
                        box-sizing: border-box !important;
                        border-radius: 6px !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        font-size: 0.75rem !important;
                        overflow: hidden !important;
                    }
                    .custom-palette-move .w-full { width: auto !important; }
                    .custom-palette-move .aspect-square { width: 28px !important; height: 28px !important; }
                    .custom-palette-move .btn-lg,
                    .custom-palette-move .btn-xl {
                        padding: 6px !important;
                        height: 50px !important;
                        min-width: 36px !important;
                        font-size: 0px !important;
                        line-height: 1 !important;
                        transform: none !important;
                    }
                    .custom-palette-move canvas {
                        width: auto !important;
                        height: 12px !important;
                        max-height: 12px !important;
                        image-rendering: pixelated !important;
                    }
                    .custom-palette-move button { flex: none !important; }
                `;

                const style = document.createElement('style');
                style.id = STYLE_ID;
                style.textContent = css;
                document.head.appendChild(style);

                const candidates = [
                    'div.absolute.bottom-0.left-0.z-50.w-full',
                    'div.z-50.w-full',
                    'div[role="toolbar"]',
                    'div[aria-label="palette"]',
                    'div[class*="bottom-0"][class*="left-0"]',
                    'div'
                ];

                let root = null;
                for (const s of candidates) {
                    const el = document.querySelector(s);
                    if (el) { root = el; break; }
                }

                if (!root) { console.warn('Панель не найдена.'); return; }

                root.classList.add('custom-palette-move');
                root.style.transform = 'none';
                root.style.position = 'fixed';
                root.style.left = '12px';
                root.style.top = '12px';
                root.style.bottom = 'auto';
                root.style.right = 'auto';
                root.style.width = 'auto';

                const innerGrid = root.querySelector('.grid');
                if (innerGrid) {
                    innerGrid.style.gridTemplateColumns = 'repeat(auto-fill, 28px)';
                    innerGrid.style.gridAutoRows = '28px';
                    innerGrid.style.gap = '6px';
                    innerGrid.style.width = 'auto';
                }

              //  console.log('Панель перемещена в угол и кнопки уменьшены.');
            })();
        }, 100);
    }

    // делегированный обработчик
    document.addEventListener('click', (e) => {
        const el = e.target.closest('button, [role="button"], .btn');
        if (!el) return;

        const matches = targetClasses.every(cls => el.classList.contains(cls));
        if (!matches) return;

        emptyHandler();
    }, true);

})();
