// ==UserScript==
// @name         New_Map_red
// @namespace    http://tampermonkey.net/
// @version      5
// @description  try to take over the world!
// @author       Artak
// @include      https://www.reddit.com/r/place/*
// @icon         https://www.google.com/s2/favicons?domain=fwww.reddit.com
// @grant        none
// ==/UserScript==

(function() {



    var date = new Date();


    //---------------------optimizacia-------------------------\\
    //   optimizacia
    var errors = false

    var fps =1000/10; // fps 1000=1sec
    var render_distance = 460;//px render distance


    var selceted_fractions =1;

    var map_siz_x =443;
    var map_siz_y =243;
    var MAP_oreantio='right'
    var auto_zoom = false;
    var Auto_color = false;
    var sectors = false
    var krestik =false
    var Cor_box_color=0

    var z = 2; // z zoom

    //---------------------------------------------------------\\
    var zoom_lv= 18


    var Cor_box_colors=['rgba(255,0,255,255)','rgba(255,0,0,255)','rgba(0,0,255,255)','rgba(0,255,0,255)',]

    var loaded=[];

    var image = new Image;
    var image2 = new Image;
    var image3 = new Image;
    var image4 = new Image;
    var image5 = new Image;
    var image6 = new Image;
    var image7 = new Image;
    var image8 = new Image;
    var pereklyuchatel=0;


    var fractions =['https://raw.githubusercontent.com/Autumn-Blaze/Autumn-Blaze.github.io/master/PP/images/','https://raw.githubusercontent.com/snowyaaaa/map/main/images/','https://fuckyouarkeros.fun/chunks/0/51/'];

    var images =["S_2-7.png",-24576,-4096,4096,4096,0,false,"S_3-7.png",-20480,-4096,4096,4096,0,true,"S_4-7.png",-16384,-4096,4096,4096,0,false,"S_2-6.png",-24576,-8192,4096,4096,0,false,"S_3-6.png",-20480,-8192,4096,4096,0,false,"S_3-8.png",-20480,0,4096,4096,0,true,'ppfunconvert%202.png',23030,27100,1280,910,1,false,'123.bmp',0,0,300,300,2,false,'dr.png',267,395,51,51,1,false,]; // images
    var sector_images=[]
    let r=0,g=0,b=0,color;

    var ikonki=['https://raw.githubusercontent.com/snowyaaaa/map/main/images/pixil-frame-0 (3).png','https://raw.githubusercontent.com/snowyaaaa/map/main/images/pixil-frame-0 (4).png'] , ikonki_NUM=0;
    var ikonki_2=['https://raw.githubusercontent.com/snowyaaaa/map/main/images/pixil-frame-0%20(5).png','https://raw.githubusercontent.com/snowyaaaa/map/main/images/pixil-frame-0 (6).png'] , ikonki_NUM_2=0;
    var ikonki_3=['https://raw.githubusercontent.com/snowyaaaa/map/main/images/pixil-frame-0%20(8).png','https://raw.githubusercontent.com/snowyaaaa/map/main/images/pixil-frame-0 (9).png'] , ikonki_NUM_3=0;
    var ikon_cord =(map_siz_y/2)-25*3




    if (getCookie('auto_zoom')==='true'){auto_zoom=true;ikonki_NUM=1}else{auto_zoom=false;ikonki_NUM=0};
    if (getCookie('Auto_color')==='true'){Auto_color=true;ikonki_NUM_2=1}else{Auto_color=false;ikonki_NUM_2=0};
    if (getCookie('sectors')==='true'){sectors=true;ikonki_NUM_3=1}else{sectors=false;ikonki_NUM_3=0};



    window.addEventListener('load', function () {
        var div = document.createElement('div');
        div.innerHTML =
            '<img class="ikonka_zoom"; id="ikonka_zoom"; src="'+ikonki[ikonki_NUM]+'"; alt="AUTO_ZOOM_OFF/ON"; style="image-rendering: pixelated; position: absolute; '+MAP_oreantio+': '+[map_siz_x+1]+'px; top: '+ikon_cord+'px; z-index: 20; width=""; height="";">'+
            '<img class="ikonka_Auto_color"; id="ikonka_Auto_color"; src="'+ikonki_2[ikonki_NUM_2]+'"; alt="ikonka_Auto_color_OFF/ON"; style="image-rendering: pixelated; position: absolute; '+MAP_oreantio+': '+[map_siz_x+1]+'px; top: '+[ikon_cord+50]+'px; z-index: 20; width=""; height="";">'+
            '<img class="ikonka_sector"; id="ikonka_sector"; src="'+ikonki_3[ikonki_NUM_3]+'"; alt="ikonka_sector_OFF/ON"; style="image-rendering: pixelated; position: absolute; '+MAP_oreantio+': '+[map_siz_x+1]+'px; top: '+[ikon_cord+100]+'px; z-index: 20; width=""; height="";">'+
            '<canvas id="canvas" width="'+map_siz_x+'px" height="'+map_siz_y+'px" style="border: solid black 1px;position: absolute; '+MAP_oreantio+': 0; top: 30px; z-index: 20;image-rendering: pixelated;" ></canvas>'+
            '<canvas id="canvas_lr3" width="'+map_siz_x+'px" height="'+map_siz_y+'px" style="border: solid black 1px;position: absolute; '+MAP_oreantio+': 0; top: 30px; z-index: 20 ;image-rendering: pixelated" ></canvas>'+
            '<canvas id="canvas_lr2" width="'+map_siz_x+'px" height="'+map_siz_y+'px" style="border: solid black 1px;position: absolute; '+MAP_oreantio+': 0; top: 30px; z-index: 20 ;image-rendering: pixelated" ></canvas>'+
            '<span id="zoomin" role="button" style="cursor:pointer;font-weight:bold;position: absolute; right: '+[map_siz_x/2+20]+'px; top: 320px;z-index: 20">+</span>'+
            '<span id="zoomout" role="button" style="cursor:pointer;font-weight:bold;position: absolute; right: '+[map_siz_x/2-20]+'px; top: 320px;z-index: 20">-</span>'+

            document.body.appendChild(div);


        var url = window.location.href.split(',')[3];




        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var layr2 = document.getElementById('canvas_lr2');
        var layr2_ctx = layr2.getContext('2d');
        var layr3 = document.getElementById('canvas_lr3');
        var layr3_ctx = layr3.getContext('2d');

        ctx.imageSmoothingEnabled = false;
        layr2_ctx.imageSmoothingEnabled = false;
        layr3_ctx.imageSmoothingEnabled = false;
        layr3_ctx.globalAlpha = 0.5;


        //  function toDataURL(url, callback) {
        //      var xhr = new XMLHttpRequest();
        //      xhr.onload = function() {
        //          var reader = new FileReader();
        //          reader.onloadend = function() {
        //              callback(reader.result);
        //          }
        //          reader.readAsDataURL(xhr.response);
        //      };
        //      xhr.open('GET', url);
        //      xhr.responseType = 'blob';
        //      xhr.send();
        //  }

        //  toDataURL('https://fuckyouarkeros.fun/chunks/0/49/115.bmp', function(dataUrl) {
        //      console.log('RESULT:', dataUrl)
        //      var image10 = new Image();
        //      image10.src = dataUrl

        //          console.log(image10.width)

        //  })

        var _0x887a=["\x6C\x61\x79\x6F\x75\x74","\x67\x65\x74\x45\x6C\x65\x6D\x65\x6E\x74\x73\x42\x79\x43\x6C\x61\x73\x73\x4E\x61\x6D\x65","\x6C\x6F\x67","\x77\x69\x64\x74\x68","\x68\x65\x69\x67\x68\x74","\x63\x6C\x65\x61\x72\x52\x65\x63\x74","\x62\x65\x67\x69\x6E\x50\x61\x74\x68","\x72\x65\x63\x74","\x66\x69\x6C\x6C\x53\x74\x79\x6C\x65","\x72\x67\x62\x61\x28\x31\x30\x30\x2C\x31\x30\x30\x2C\x31\x30\x30\x2C\x30\x2E\x35\x29","\x66\x69\x6C\x6C","\x76\x69\x65\x77\x70\x6F\x72\x74","\x32\x64","\x67\x65\x74\x43\x6F\x6E\x74\x65\x78\x74","\x67\x6C\x6F\x62\x61\x6C\x43\x6F\x6D\x70\x6F\x73\x69\x74\x65\x4F\x70\x65\x72\x61\x74\x69\x6F\x6E","\x73\x6F\x75\x72\x63\x65\x2D\x6F\x76\x65\x72","\x73\x74\x72\x6F\x6B\x65\x53\x74\x79\x6C\x65","\x72\x67\x62\x61\x28\x32\x35\x35\x2C\x30\x2C\x30\x2C\x32\x35\x35\x29","\x6C\x69\x6E\x65\x57\x69\x64\x74\x68","\x31","\x6D\x6F\x76\x65\x54\x6F","\x6C\x69\x6E\x65\x54\x6F","\x73\x74\x72\x6F\x6B\x65","\x3D","\x73\x70\x6C\x69\x74","\x68\x72\x65\x66","\x6C\x6F\x63\x61\x74\x69\x6F\x6E","","\x32","\x6A\x6F\x69\x6E","\x26","\x63","\x79","\x70\x78","\x6C\x65\x6E\x67\x74\x68"];setInterval(function(){var _0x4e67x1=document[_0x887a[1]](_0x887a[0])[0];console[_0x887a[2]](_0x4e67x1);ctx[_0x887a[5]](0,0,canvas[_0x887a[3]],canvas[_0x887a[4]]);layr3_ctx[_0x887a[5]](0,0,canvas[_0x887a[3]],canvas[_0x887a[4]]);ctx[_0x887a[6]]();ctx[_0x887a[7]](0,0,map_siz_x,map_siz_y);ctx[_0x887a[8]]= _0x887a[9];ctx[_0x887a[10]]();if(krestik){var _0x4e67x2=document[_0x887a[1]](_0x887a[11])[0];var _0x4e67x3=_0x4e67x2[_0x887a[13]](_0x887a[12]);_0x4e67x3[_0x887a[14]]= _0x887a[15];_0x4e67x3[_0x887a[6]]();_0x4e67x3[_0x887a[16]]= _0x887a[17];_0x4e67x3[_0x887a[18]]= _0x887a[19];_0x4e67x3[_0x887a[20]](document[_0x887a[1]](_0x887a[11])[0][_0x887a[3]]/ 2+ 20- 1,document[_0x887a[1]](_0x887a[11])[0][_0x887a[4]]/ 2+ 10- 1);_0x4e67x3[_0x887a[21]](document[_0x887a[1]](_0x887a[11])[0][_0x887a[3]]/ 2+ 20- 1,document[_0x887a[1]](_0x887a[11])[0][_0x887a[4]]/ 2+ 30- 1);_0x4e67x3[_0x887a[20]](document[_0x887a[1]](_0x887a[11])[0][_0x887a[3]]/ 2+ 10- 1,document[_0x887a[1]](_0x887a[11])[0][_0x887a[4]]/ 2+ 20- 1);_0x4e67x3[_0x887a[21]](document[_0x887a[1]](_0x887a[11])[0][_0x887a[3]]/ 2+ 30- 1,document[_0x887a[1]](_0x887a[11])[0][_0x887a[4]]/ 2+ 20- 1);_0x4e67x3[_0x887a[22]]()};if(auto_zoom){_0x4e67x4= window[_0x887a[26]][_0x887a[25]][_0x887a[24]](_0x887a[23])[3];if(_0x4e67x4< 183){z= Number(zoom_lv- (_0x4e67x4/ 10));layr2_ctx[_0x887a[5]](0,0,layr2[_0x887a[3]],layr2[_0x887a[4]])}else {if(_0x4e67x4> 190){layr2_ctx[_0x887a[5]](0,0,layr2[_0x887a[3]],layr2[_0x887a[4]]);z= 1}else {z= 5;layr2_ctx[_0x887a[5]](0,0,layr2[_0x887a[3]],layr2[_0x887a[4]])}}};layr2_ctx[_0x887a[6]]();layr2_ctx[_0x887a[16]]= _0x887a[27]+ Cor_box_colors[Cor_box_color]+ _0x887a[27];layr2_ctx[_0x887a[18]]= _0x887a[28];layr2_ctx[_0x887a[7]](map_siz_x/ 2- (z/ 2),map_siz_y/ 2- (z/ 2),3+ z- 2,3+ z- 2);layr2_ctx[_0x887a[22]]();var _0x4e67x4=window[_0x887a[26]][_0x887a[25]][_0x887a[24]](_0x887a[23])[1];var _0x4e67x5=_0x4e67x4[_0x887a[24]](_0x887a[30])[_0x887a[29]](_0x887a[27]);var _0x4e67x6=_0x4e67x5[_0x887a[24]](_0x887a[31])[_0x887a[29]](_0x887a[27]);var _0x4e67x7=_0x4e67x6[_0x887a[24]](_0x887a[32])[_0x887a[29]](_0x887a[27]);_0x4e67x4= window[_0x887a[26]][_0x887a[25]][_0x887a[24]](_0x887a[23])[2];_0x4e67x5= _0x4e67x4[_0x887a[24]](_0x887a[30])[_0x887a[29]](_0x887a[27]);var _0x4e67x8=_0x4e67x5[_0x887a[24]](_0x887a[33])[_0x887a[29]](_0x887a[27]);console[_0x887a[2]](_0x4e67x7,_0x4e67x8);for(let _0x4e67x9=0;_0x4e67x9< images[_0x887a[34]];_0x4e67x9+= 1){drawImage_ActualSize(images[_0x4e67x9+= 0],_0x4e67x7,_0x4e67x8,images[_0x4e67x9+= 1],images[_0x4e67x9+= 1],images[_0x4e67x9+= 1],images[_0x4e67x9+= 1],images[_0x4e67x9+= 1],images[_0x4e67x9+= 1])}},fps)


















        function drawImage_ActualSize(name,x,y,X,Y,endX,endY,F_NUM,GRID){

            if((x/z)>X-render_distance && (x/z)<X+endX+render_distance && (y/z)>Y-render_distance && (y/z)<Y+render_distance+endY && F_NUM == selceted_fractions ){//  render dictance
                switch(pereklyuchatel){
                    case 0:

                        if(loaded[0]!=name){
                            image = new Image;
                            image.src = ''+fractions[F_NUM]+''+name+'';//    loading image
                            image.crossOrigin = "Anonymous";
                            loaded[0]=name

                            //console.log('1111111111')
                        }



                        ctx.drawImage(image, x*z-(x*z*2)+(map_siz_x/2+z/2)+(X*z) , y*z-(y*z*2)+(map_siz_y/2+z/2)+(Y*z) , image.width*z, image.height*z);// draw image


                        if(sectors&&GRID){
                            if(loaded[4]!=''+fractions[F_NUM]+''+name.split('.')[0]+'_GRID.png'){
                                image5 = new Image;
                                image5.src = ''+fractions[F_NUM]+''+name.split('.')[0]+'_GRID.png';
                                image5.crossOrigin = "Anonymous";
                                loaded[4]=''+fractions[F_NUM]+''+name.split('.')[0]+'_GRID.png';
                            }

                            layr3_ctx.drawImage(image5, X*z-x-(z/2)+map_siz_x/2+0.5, Y*z-y-(z/2)+map_siz_y/2+0.5, image5.width*z, image5.height*z); }// draw sector
                        pereklyuchatel++
                        return
                    case 1:
                        if(loaded[1]!=name){
                            image2 = new Image;
                            image2.src = ''+fractions[F_NUM]+''+name+'';//    loading image2
                            image2.crossOrigin = "Anonymous";
                            loaded[1]=name


                            //console.log('22222222222')
                        }

                        ctx.drawImage(image2, x*z-(x*z*2)+(map_siz_x/2+z/2)+(X*z) , y*z-(y*z*2)+(map_siz_y/2+z/2)+(Y*z) , image2.width*z, image2.height*z);// draw image
                        if(sectors&&GRID){
                            if(loaded[5]!=''+fractions[F_NUM]+''+name.split('.')[0]+'_GRID.png'){

                                image6 = new Image;
                                image6.src = ''+fractions[F_NUM]+''+name.split('.')[0]+'_GRID.png';
                                image6.crossOrigin = "Anonymous";
                                loaded[5]=''+fractions[F_NUM]+''+name.split('.')[0]+'_GRID.png';
                            }

                            layr3_ctx.drawImage(image6, X*z-x-(z/2)+map_siz_x/2+0.5, Y*z-y-(z/2)+map_siz_y/2+0.5, image6.width*z, image6.height*z); }// draw sector
                        pereklyuchatel++
                        return
                    case 2:

                        if(loaded[2]!=name){
                            image3 = new Image;
                            image3.src = ''+fractions[F_NUM]+''+name+'';//    loading image3
                            image3.crossOrigin = "Anonymous";
                            loaded[2]=name
                            //console.log('333333333333')
                        }

                        ctx.drawImage(image3, x*z-(x*z*2)+(map_siz_x/2+z/2)+(X*z) , y*z-(y*z*2)+(map_siz_y/2+z/2)+(Y*z) , image3.width*z, image3.height*z);// draw image
                        if(sectors&&GRID){
                            if(loaded[6]!=''+fractions[F_NUM]+''+name.split('.')[0]+'_GRID.png'){

                                image7 = new Image;
                                image7.src = ''+fractions[F_NUM]+''+name.split('.')[0]+'_GRID.png';
                                image7.crossOrigin = "Anonymous";
                                loaded[6]=''+fractions[F_NUM]+''+name.split('.')[0]+'_GRID.png';
                            }

                            layr3_ctx.drawImage(image7, X*z-x-(z/2)+map_siz_x/2+0.5, Y*z-y-(z/2)+map_siz_y/2+0.5, image7.width*z, image7.height*z); }// draw sector
                        pereklyuchatel++
                        return
                        ;
                    case 3:


                        if(loaded[3]!=name){
                            image4 = new Image;
                            image4.src = ''+fractions[F_NUM]+''+name+'';//    loading image4
                            image4.crossOrigin = "Anonymous";
                            loaded[3]=name


                            //console.log('4444444444')
                        }

                        ctx.drawImage(image4, x*z-(x*z*2)+(map_siz_x/2+z/2)+(X*z) , y*z-(y*z*2)+(map_siz_y/2+z/2)+(Y*z) , image4.width*z, image4.height*z);// draw image
                        if(sectors&&GRID){
                            if(loaded[7]!=''+fractions[F_NUM]+''+name.split('.')[0]+'_GRID.png'){

                                image8 = new Image;
                                image8.src = ''+fractions[F_NUM]+''+name.split('.')[0]+'_GRID.png';
                                image8.crossOrigin = "Anonymous";
                                loaded[7]=''+fractions[F_NUM]+''+name.split('.')[0]+'_GRID.png';
                            }

                            layr3_ctx.drawImage(image8, X*z-x-(z/2)+map_siz_x/2+0.5, Y*z-y-(z/2)+map_siz_y/2+0.5, image8.width*z, image8.height*z); }// draw sector
                        pereklyuchatel=0
                        return
                        ;
                }
            }

            //+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-____ZOOM____+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-\\

            document.getElementById('zoomin').onclick = function(){
                if(z<53){
                    z+=z/3
                    layr2_ctx.clearRect(0, 0, layr2.width, layr2.height);
                    console.log(z)

                }}

            document.getElementById('zoomout').onclick = function(){
                if(z>1){
                    z-=z/3
                    layr2_ctx.clearRect(0, 0, layr2.width, layr2.height);

                }}

            //+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-\\


            document.getElementsByClassName('ikonka_zoom')[0].onclick = function(){
                if(ikonki_NUM<1){
                    document.cookie = 'auto_zoom=true; path=/; expires=Tue, '+date.getDate()+' '+date.getMonth()+' '+date.getFullYear()+' 03:14:07 GMT+0400'
                    ikonki_NUM=1
                    document.getElementsByClassName('ikonka_zoom')[0].src=ikonki[ikonki_NUM];
                    auto_zoom=true

                }
                else{
                    document.cookie = 'auto_zoom=false; path=/; expires=Tue, '+date.getDate()+' '+date.getMonth()+' '+date.getFullYear()+' 03:14:07 GMT+0400'
                    ikonki_NUM=0
                    document.getElementsByClassName('ikonka_zoom')[0].src=ikonki[ikonki_NUM];
                    auto_zoom=false

                }
            }

            document.getElementsByClassName('ikonka_Auto_color')[0].onclick = function(){
                if(ikonki_NUM_2<1){
                    document.cookie = 'Auto_color=true; path=/; expires=Tue, '+date.getDate()+' '+date.getMonth()+' '+date.getFullYear()+' 03:14:07 GMT+0400'
                    ikonki_NUM_2=1
                    document.getElementsByClassName('ikonka_Auto_color')[0].src=ikonki_2[ikonki_NUM_2];
                    Auto_color=true

                }
                else{
                    document.cookie = 'Auto_color=false; path=/; expires=Tue, '+date.getDate()+' '+date.getMonth()+' '+date.getFullYear()+' 03:14:07 GMT+0400'
                    ikonki_NUM_2=0
                    document.getElementsByClassName('ikonka_Auto_color')[0].src=ikonki_2[ikonki_NUM_2];
                    Auto_color=false

                }
            }

            document.getElementsByClassName('ikonka_sector')[0].onclick = function(){
                if(ikonki_NUM_3<1){
                    ikonki_NUM_3=1
                    document.getElementsByClassName('ikonka_sector')[0].src=ikonki_3[ikonki_NUM_3];
                    sectors=true
                    document.cookie = 'sectors=true; path=/; expires=True, '+date.getDate()+' '+date.getMonth()+' '+date.getFullYear()+' 03:14:07 GMT+0400'

                }
                else{
                    document.cookie = 'sectors=false; path=/; expires=True, '+date.getDate()+' '+date.getMonth()+' '+date.getFullYear()+' 03:14:07 GMT+0400'
                    ikonki_NUM_3=0
                    document.getElementsByClassName('ikonka_sector')[0].src=ikonki_3[ikonki_NUM_3];
                    sectors=false

                }
            }




        }


    })

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }


})
();