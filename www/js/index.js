document.addEventListener('deviceready', function(){	
  $(document).ready(() => {
    CameraPreview.startCamera({x: 0, y: 69, width: 360, height: 426, toBack: true, previewDrag: true, tapPhoto: false});
    $('button#stopCameraButton').hide();

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
                base64img = 'data:image/jpeg;base64,' + imgData //<img src="data:image/<이미지확장자>;base64,<data코드>")
                document.getElementById('originalPicture').src = base64img;
                CameraPreview.stopCamera();

                // console.log(base64img);
                // function base64ToHex(str) {
                //   const raw = window.atob(str);
                //   console.log(raw);
                //   return raw;
                // }
                // console.log(base64ToHex(imgData));

              });

              $('button#stopCameraButton').show();

            }, 1000)
          }, 1000)      
        }, 1000)
      }, 1000)
    });

    $('button#stopCameraButton').click(() => {
      $('button#stopCameraButton').hide();
    })

  });

}, false);

