// ==UserScript==
// @name         New_Map_red
// @namespace    http://tampermonkey.net/
// @version      5
// @description  try to take over the world!
// @author       Artak
// @include        https://www.reddit.com/r/place/*
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

        setInterval(function(){
    var node = document.getElementsByClassName('layout')[0]
    console.log(node)


            ctx.clearRect(0, 0, canvas.width, canvas.height);
            layr3_ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.rect(0, 0, map_siz_x, map_siz_y);
            ctx.fillStyle = "rgba(100,100,100,0.5)";
            ctx.fill();

            if(krestik){
                var viewport = document.getElementsByClassName('viewport')[0]
                var viewport_ctx = viewport.getContext('2d');
                viewport_ctx.globalCompositeOperation = "source-over";
                viewport_ctx.beginPath();
                viewport_ctx.strokeStyle = "rgba(255,0,0,255)";
                viewport_ctx.lineWidth = "1";
                viewport_ctx.moveTo(document.getElementsByClassName('viewport')[0].width/2+20-1,document.getElementsByClassName('viewport')[0].height/2+10-1,);
                viewport_ctx.lineTo(document.getElementsByClassName('viewport')[0].width/2+20-1,document.getElementsByClassName('viewport')[0].height/2+30-1,);
                viewport_ctx.moveTo(document.getElementsByClassName('viewport')[0].width/2+10-1,document.getElementsByClassName('viewport')[0].height/2+20-1,);
                viewport_ctx.lineTo(document.getElementsByClassName('viewport')[0].width/2+30-1,document.getElementsByClassName('viewport')[0].height/2+20-1,);
                viewport_ctx.stroke();
            }




            //-_-_-_-_-_-_-_-_-_-_-_-<<  DRAW CENTER BOX >>_-_-_-_-_-_-_-_-_-_-_-_-_-\\



            layr2_ctx.beginPath();
            layr2_ctx.strokeStyle = ''+Cor_box_colors[Cor_box_color]+'';
            layr2_ctx.lineWidth = "2";
            layr2_ctx.rect(map_siz_x/2-(z/2),map_siz_y/2-(z/2), 3+z-2, 3+z-2);
            layr2_ctx.stroke();





            // _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-\\

            //__________________________  get cordinate  ____________________________\\


            var url = window.location.href.split('=')[1];
            var nxstring = url.split('&').join('');
            var nxstring2 = nxstring.split('c').join('');
            var numx = nxstring2.split('y').join('');

            url = window.location.href.split('=')[2];
            nxstring = url.split('&').join('');
            var numy = nxstring.split('px').join('');
            console.log(numx,numy)

            //_______________________________________________________________________\\

            for(let i =0;i<images.length;i+=1){


                drawImage_ActualSize(images[i+=0],numx,numy,images[i+=1],images[i+=1],images[i+=1],images[i+=1],images[i+=1],images[i+=1],); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                // console.log(loaded[1],pereklyuchatel)
            }








            




        },fps);


















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