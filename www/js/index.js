var app = {
    startCameraAbove: function(){
      CameraPreview.startCamera({x: 0, y: 69, width: 360, height: 426, toBack: true, previewDrag: true, tapPhoto: false});
    },
  
    stopCamera: function(){
      CameraPreview.stopCamera();
    },

    takePicture: function(){
        document.getElementById('takePictureButton').innerHTML = '<button id="takePictureButton" disabled="disabled">찍기</button>';
        setTimeout(() => {
          console.log(3);
          document.getElementById('originalPicture').src = "./img/count3.png";
          setTimeout(() => {
            console.log(2);
            document.getElementById('originalPicture').src = "./img/count2.png";
            setTimeout(() => {
              console.log(1);
              document.getElementById('originalPicture').src = "./img/count1.png";
              setTimeout(() => {
                console.log('찰칵');
                  CameraPreview.takePicture(function(imgData){
                  base64img = 'data:image/jpeg;base64,' + imgData //<img src="data:image/<이미지확장자>;base64,<data코드>")
                  document.getElementById('originalPicture').src = base64img;
                  CameraPreview.stopCamera();
                  var x = document.getElementsByClassName("block");
                  console.log(x);
                  //document.getElementById('takePictureButton').innerHTML = '<button id="takePictureButton">끄기</button>';

                                                                  
                  
                  // console.log(base64img);
                  // function base64ToHex(str) {
                  //   const raw = window.atob(str);
                  //   console.log(raw);
                  //   return raw;
                  // }
                  // console.log(base64ToHex(imgData));
                  
                });
              }, 1000)
            }, 1000)      
          }, 1000)
        }, 1000)
    },

    init: function(){
      // document.getElementById('startCameraAboveButton').addEventListener('click', this.startCameraAbove, false);
      // document.getElementById('stopCameraButton').addEventListener('click', this.stopCamera, false);
      document.getElementById('takePictureButton').addEventListener('click', this.takePicture, false);

      CameraPreview.startCamera({x: 0, y: 69, width: 360, height: 426, toBack: true, previewDrag: true, tapPhoto: false});
    }
  }; 
  
  document.addEventListener('deviceready', function(){	
    app.init();
  }, false);


  