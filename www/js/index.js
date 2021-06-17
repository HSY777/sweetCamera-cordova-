var app = {
    startCameraAbove: function(){
      CameraPreview.startCamera({x: 50, y: 50, width: 300, height: 500, toBack: true, previewDrag: false, tapPhoto: false});
    },
  
    stopCamera: function(){
      CameraPreview.stopCamera();
    },

    takePicture: function(){
      CameraPreview.takePicture(function(imgData){
        base64img = 'data:image/jpeg;base64,' + imgData //<img src="data:image/<이미지확장자>;base64,<data코드>")
        document.getElementById('originalPicture').src = base64img;
        console.log(base64img);

        function base64ToHex(str) {
          const raw = window.atob(str);
          console.log(raw);
        
          return raw;
        }
        
        console.log(base64ToHex(imgData));
        
      });
    },

    init: function(){
      document.getElementById('startCameraAboveButton').addEventListener('click', this.startCameraAbove, false);
      document.getElementById('stopCameraButton').addEventListener('click', this.stopCamera, false);
      document.getElementById('takePictureButton').addEventListener('click', this.takePicture, false);

      CameraPreview.startCamera({x: 50, y: 50, width: 300, height: 500, toBack: true, previewDrag: false, tapPhoto: false});
    }
  }; 
  
  document.addEventListener('deviceready', function(){	
    app.init();
  }, false);


  