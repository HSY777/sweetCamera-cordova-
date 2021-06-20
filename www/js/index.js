var photoArea_width = 360;
var photoArea_height = 426;

var loadCanvasImage = (imgPath) => {
  var canvas = document.getElementById("canvasPicture");
  if(canvas.getContext){
    var draw = canvas.getContext("2d");
    
    var img = new Image();
    img.src = imgPath;
    img.onload = function(){
      draw.drawImage(img, 0, 0, photoArea_width, photoArea_height);
    }
  }
}

document.addEventListener('deviceready', function(){

  $(document).ready(() => {    

    CameraPreview.startCamera({x: 0, y: 69, width: photoArea_width, height: photoArea_height, toBack: true, previewDrag: true, tapPhoto: false});
    $('button#printButton').hide();
    $('#canvasPicture').hide();

    $('button#takePictureButton').click(() =>{
      // $('button#takePictureButton').attr("disabled", "disabled");
      $('button#takePictureButton').hide();
      setTimeout(() => {
        console.log(3);
        $("#originalPicture").attr("src", "./img/count3.png");
        setTimeout(() => {
          console.log(2);
          $("#originalPicture").attr("src", "./img/count2.png");
          setTimeout(() => {
            console.log(1);
            $("#originalPicture").attr("src", "./img/count1.png");
            setTimeout(() => {
              console.log('찰칵');

              CameraPreview.takePicture(function(imgData){
                captureImage = 'data:image/jpeg;base64,' + imgData;
                $("#originalPicture").attr("src", captureImage);
                CameraPreview.stopCamera();

                // console.log(captureImage);
                // function base64ToHex(str) {
                //   const raw = window.atob(str);
                //   console.log(raw);
                //   return raw;
                // }
                // console.log(base64ToHex(imgData));

              });

              $('button#printButton').show();
            }, 1000)
          }, 1000)      
        }, 1000)
      }, 1000)
    });

    $('button#printButton').click(() => {
      $('button#printButton').hide();
      $('#originalPicture').hide();
      $('#canvasPicture').show();

      setTimeout(() => {
        loadCanvasImage(captureImage);
        setTimeout(() => {
          let imgElement = document.getElementById('canvasPicture');

          let mat = cv.imread(imgElement);
          let gray = new cv.Mat();
          cv.cvtColor(mat, gray, cv.COLOR_RGB2GRAY, 0);
          cv.imshow('canvasPicture', gray);
          mat.delete();
  
          var canvas = document.getElementById("canvasPicture");
          bRes = Canvas2Image.saveAsBMP(canvas, true);
          console.log(bRes.src);
        }, 10)
      }, 10)
    })


  });

}, false);

