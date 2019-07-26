(function () {
  'use strict';

  angular
    .module('editImageModalModule')
    .controller('editImageModalController', editImageModalController);

    editImageModalController.$inject = [
    '$scope',
    'editImageModal'

  ];

  function editImageModalController(
    $scope,
    editImageModal
  ) {
    var vm = angular.extend(this, {
      showGenres: false,
    });
    var encodedImg=[];
    var scale = 8;
    var fnames = [
      "Apple",
      "Apricot",
      "Avocado",
      "Banana",
      "Blackberry",
      "Blueberry",
      "Boysenberry",
      "Breadfruit",
      "Elderberry",
      "Limeberry",
      "Cranberry",
      "Cantaloupe",
      "Cherry",
      "Citron",
      "Citrus",
      "Coconut",
      "Date",
      "Elderberry",
      "Fig",
      "Grape",
      "Grapefruit",
      "Jackfruit",
      "Guava",
      "Hawthorn",
      "Kiwi",
      "Lemon",
      "Lime",
      "Mango",
      "Melon",
      "Mulberry",
      "Nectarine",
      "Orange",
      "Papaya",
      "Passionfruit",
      "Peach",
      "Pear",
      "Pineapple",
      "Plum",
      "Prune",
      "Raisin",
      "Raspberry",
      "Tangerine",
      "Loquat",
      "Vanilla",
      "Dragon-Fruit"
    ];

    var lnames = [
      "Chutney",
      "Conserve",
      "Compote",
      "Confit",
      "Conserve",
      "Curd",
      "Fruit-Butter",
      "Fruit-Curd",
      "Fruit-Cheese",
      "Fruit-Spread",
      "Jam",
      "Jelly",
      "Marmalade",
      "Mincemeat",
      "Picle",
      "Preserve",
      "Relish"
    ];
    const canvas_size = 8;

    var canvas;
    var canvas_wh = [];
    var draw_colour = undefined;
    var pixel_colours = [
      { r: 1, g: 1, b: 1, a: 1, g: 1 },
      { r: 0, g: 0, b: 0, a: 1, g: 0 }
    ];

    var canvas_grid;
    var grid_colours = [
      'rgb(255,255,255);', 'rgba(128,128,192,50%)'
    ];

    $scope.editImageModal = editImageModal;
    async function init() {
      vm.params = editImageModal.getParams();
      console.log(vm.params);
      console.log("paramarams",vm.params);
      vm.avimg=vm.params[0].avatar_image;
      console.log("avimg",vm.avimg);
      loadEditor();
    }

    window.onload=init();

    function loadEditor(){
      console.log("runnung");
      setTimeout(function()  {
        
      
      getCanvasSize();
      console.log(document.getElementById("canvas_holder"));
      document.getElementById("canvas_holder").style.width  = String( canvas_wh[0] * 42 )+"px";
      document.getElementById("canvas_holder").style.height = String( canvas_wh[1] * 42 )+"px";
      
      //document.getElementById("img").style.width  = String( canvas_wh[0] * 3 )+"px";
      //document.getElementById("img").style.height = String( canvas_wh[1] * 3 )+"px";
      
      
    
      canvas = document.createElement('canvas');
      canvas.id = 'edit';
      canvas.width = canvas_wh[0];
      canvas.height = canvas_wh[1];
    
    
      canvas_grid = document.createElement('canvas');
      canvas_grid.id = 'canvas_grid';
      canvas_grid.width = document.getElementById('canvas_holder').offsetWidth;
      canvas_grid.height = document.getElementById('canvas_holder').offsetHeight;
      var canvas_grid_ctx = canvas_grid.getContext('2d');	
      canvas_grid_ctx.fillStyle = grid_colours[1];	
      
      for(var i=0; i<=canvas_wh[0]; i++) {
        canvas_grid_ctx.beginPath();
        canvas_grid_ctx.moveTo(canvas_grid.width/canvas_wh[0]*i, 0);
        canvas_grid_ctx.lineTo(canvas_grid.width/canvas_wh[0]*i, canvas_grid.height);		
        canvas_grid_ctx.stroke();
      }
      for(var i=0; i<=canvas_wh[1]; i++) {
        canvas_grid_ctx.beginPath();
        canvas_grid_ctx.moveTo(0,                 canvas_grid.height/canvas_wh[1]*i);
        canvas_grid_ctx.lineTo(canvas_grid.width, canvas_grid.height/canvas_wh[1]*i);		
        canvas_grid_ctx.stroke();
      }
      var canvas_holder = document.getElementById('canvas_holder');
      
      canvas_holder.appendChild(canvas);
      canvas_holder.appendChild(canvas_grid);
    
      canvas_grid.addEventListener('touchstart', clickDown, false);
      canvas_grid.addEventListener('mousedown', clickDown, false);
      canvas_grid.addEventListener('touchmove', clickMove, false);
      canvas_grid.addEventListener('mousemove', clickMove, false);
      canvas_grid.addEventListener('touchend', clickEnd, false);
      canvas_grid.addEventListener('mouseup', clickEnd, false); 
      
      var clear = document.getElementById('clear');
      var invert = document.getElementById('invert');
      clear.addEventListener('mouseup', handle_clear, false);
      invert.addEventListener('mouseup', handle_invert, false);	
    
      var body = document.getElementsByTagName('body')[0];
      body.addEventListener('touchmove', clickMove, false);
      body.addEventListener('mousemove', clickMove, false);
      
      var save = document.getElementById('save');
      save.addEventListener('mouseup', handle_save, false);
    
      window.onpopstate = function(event) {
        restoreHash();
      };	
      do_clear();
      restoreHash();
      console.log("finish");
      loadImg();

    }, 0);
    };


    var loadImg = function loadImg(imgArry) {
      var imgAsHash="";
      imgAsHash+=canvas_size+",";
      imgAsHash+=canvas_size+":";
      vm.avimg.forEach(function(rowdata) {
        console.log(rowdata);
        var temp=rowdata.toString(2);
        console.log("temp",temp);
        if (temp!=0) {
        if (temp.length<8) {
          var buffer="";
          for (let i = 0; i < 8-temp.length; i++) {
            buffer+="0";
            
          }
          temp=buffer+temp;
        }
        
        imgAsHash+=temp.split("").toString()+",";
        console.log("hash",imgAsHash);
        }else{
        imgAsHash+="0,0,0,0,0,0,0,0,"
        }

      });
      imgAsHash=imgAsHash.substring(0,imgAsHash.length-1);
        var data = imgAsHash.substr(1).split(':');
        var size = data[0].split(',');
        var pixels = data[1].split(',');
        var pixel_index = 0;
        for (var y = 0; y<parseInt(size[1]); y++) {
          for (var x = 0; x<parseInt(size[1]); x++) {
            setPixel(canvas, x, y , pixel_colours[ parseInt(pixels[pixel_index]) ]);
            pixel_index = pixel_index + 1;
          }
        }
        updateThumb();
    }
    
    var handle_save = function handle_save() {
        console.log("this is the save");
        console.log("Returning img in callback",encodedImg);
        editImageModal.callback(encodedImg);
        editImageModal.close();

        var save_canvas = document.createElement('canvas');
        save_canvas.id = 'save';
        save_canvas.width = canvas_wh[0] * 100;
        save_canvas.height = canvas_wh[1] * 100;
        render_canvas(canvas, save_canvas);
    
        var lnk = document.createElement('a'), e;
        lnk.href = save_canvas.toDataURL();
    
        if (document.createEvent) {
            e = document.createEvent("MouseEvents");
            e.initMouseEvent("click", true, true, window,
                             0, 0, 0, 0, 0, false, false, false,
                             false, 0, null);
            lnk.dispatchEvent(e);
        } else if (lnk.fireEvent) {
            lnk.fireEvent("onclick");
        }
    }
    
    var do_clear = function do_clear() {
      var ctx = canvas.getContext('2d');	
      ctx.fillStyle = 'rgba('+(pixel_colours[0].r*255)+','+
                              (pixel_colours[0].g*255)+','+
                              (pixel_colours[0].b*255)+','+
                              pixel_colours[0].a+')';
      
      ;
      ctx.fillRect(0, 0, canvas_wh[0], canvas_wh[1]); 	
    }
    
    var handle_clear = function handle_clear() {
      do_clear();
      updateThumb();
    };
    
    var saveHash = function saveHash() {
      var newHash = [];
      for (var y = 0; y<canvas_wh[1]; y++) {
        for (var x = 0; x<canvas_wh[0]; x++) {
          newHash.push( findMatchingColour(getPixelColour(canvas, x, y)) );
        }
      }
      window.location.hash = String(canvas_wh[0])+','+String(canvas_wh[1])+':'+newHash.join(",");
      encodedImg=[];
      var tempArray=[];
      var j=1;
      var fullImgArray=[];
      for (var i = 0; i < newHash.length; i++) {
        fullImgArray.push(parseInt(newHash[i]));
      }

      for (var i = 0; i < newHash.length; i++) {
        if (i<(j*8)-1) {
          tempArray.push(newHash[i]);
        }
        if (i==(j*8)-1) {
          tempArray.push(newHash[i]);
          encodedImg[j-1]=parseInt((tempArray.join('')),2);
          j++;
          tempArray=[];
        }
      }
      editImageModal.imgUpdate(encodedImg);
    }
    
    var render_canvas = function render_canvas( source, destination ) {
      for (var x = 0; x<canvas_wh[0]; x++) {
        for (var y = 0; y<canvas_wh[1]; y++) {
          var draw_colour = findMatchingColour(getPixelColour(canvas, x, y));
          setPixel(destination, x, y , pixel_colours[ draw_colour]);	
        }
      }
    }
    
    var getCanvasSize = function getCanvasSize(){
      canvas_wh = [canvas_size, canvas_size];
      if(window.location.hash.indexOf(':')>0) {
        var data = window.location.hash.substr(1).split(':');
        canvas_wh = data[0].split(",").map( function( val ){			
          val = parseInt( val );
          return( val >0 ? val : canvas_wh );
        } );
      }
    }
    
    var restoreHash = function restoreHash() {
      if(window.location.hash.indexOf(':')>0) {
        var data = window.location.hash.substr(1).split(':');
        var size = data[0].split(',');
        var pixels = data[1].split(',');
        var pixel_index = 0;
        for (var y = 0; y<parseInt(size[1]); y++) {
          for (var x = 0; x<parseInt(size[0]); x++) {
            setPixel(canvas, x, y , pixel_colours[ parseInt(pixels[pixel_index]) ]);
            pixel_index = pixel_index + 1;
          }
        }
        updateThumb();
      } 
    }
    
    var handle_invert = function handle_invert() {
      try	{
        var x = evt.targetTouches[0].pageX;
        return;
      } catch {	
        for (var x = 0; x<canvas_wh[0]; x++) {
          for (var y = 0; y<canvas_wh[1]; y++) {
            var draw_colour = (pixel_colours.length-1) - findMatchingColour(getPixelColour(canvas, x, y));
            setPixel(canvas, x, y , pixel_colours[draw_colour]);	
          }
        }
        updateThumb();
      }
    };
    
    var updateThumb = function updateThumb() {
      saveHash();
    };
    
    var clickDown = function clickDown(event) {
      if (event.target == canvas_grid) {
        event.preventDefault();
      }
      var p = getScaledPosition(canvas, event);
      draw_colour = (pixel_colours.length-1) - findMatchingColour(getPixelColour(canvas,p.x, p.y));	
      clickMove(event);
    };
    
    var clickMove = function clickMove(event) {
      if(event.target.id==="canvas_grid") {
        if(draw_colour!=undefined) {
          var p = getScaledPosition(canvas, event);
          setPixel(canvas, p.x, p.y, pixel_colours[draw_colour]);
          updateThumb();
        }
      } else {
        clickEnd(event);
      }
      if (event.target == canvas_grid) {
        event.preventDefault();
      }
    };
    
    var clickEnd = function clickEnd(event) {
      draw_colour = undefined;
      if (event.target == canvas_grid) {
        event.preventDefault();
      }
    };
    
    var getScaledPosition = function getScaledPosition(canvas, evt) {
      var rect = canvas.getBoundingClientRect();
      try {
        var bodyRect = document.body.getBoundingClientRect();
        return {
          x: Math.floor( (evt.targetTouches[0].pageX - rect.left + bodyRect.left) / rect.width * canvas.width ),
          y: Math.floor( (evt.targetTouches[0].pageY - rect.top + bodyRect.top) / rect.height * canvas.height )
        };
      } catch(error) {
        return {
          x: Math.floor( (evt.clientX - rect.left) / rect.width * canvas.width ),
          y: Math.floor( (evt.clientY - rect.top) / rect.height * canvas.height )
        };
      }
    };
    
    var getPixelColour = function getPixelColour(canvas, x, y) {
      var canvas_ctx = canvas.getContext('2d');
      var pixel = canvas_ctx.getImageData(x, y, 1, 1);
      return {
        r: pixel.data[0],
        g: pixel.data[1],
        b: pixel.data[2],
        a: pixel.data[3],
        g: (pixel.data[0]+pixel.data[1]+pixel.data[2])/3
      }
    };
    
    var findMatchingColour=function findMatchingColour(c) {
      for(var i in pixel_colours) {
        var g = (c.r+c.g+c.b)/3/255;
        if( g === pixel_colours[i].g ) {
          return i;
        }
      }
      return 1;
    };
    
    var setPixel = function setPixel(destination_canvas,x,y,rgb) {
      var canvas_ctx = destination_canvas.getContext('2d');
      canvas_ctx.imageSmoothingEnabled = false;
      canvas_ctx.fillStyle = 'rgba('+
        Math.floor(rgb.r*255)+','+
        Math.floor(rgb.g*255)+','+
        Math.floor(rgb.b*255)+','+
        rgb.a+')';
      canvas_ctx.fillRect(x * (destination_canvas.width / canvas_wh[0]), 
                          y * (destination_canvas.height / canvas_wh[1]), 
                          destination_canvas.width / canvas_wh[0], 
                          destination_canvas.height / canvas_wh[1]);	
    };
    

  }
})();