var photoArea_width = 360;
var photoArea_height = 426;

var CUSTOM_SERVICE = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
var CUSTOM_READ = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E';
var CUSTOM_WRITE = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E';


var connectStateBLE = false;
var saveDevice;

var tracker = createDeviceTracker();

// Connected device.
var mDevice = null
var mPollingTimer = null
var testCount = 0
var connectErrorCount = 0

function initiateTestSequence()
{
	testCount = 0

	console.log('Initiate test sequence')
	runTestSequence()
}

function runTestSequence()
{
	if (testCount < 10)
	{
		++testCount

		console.log('Running test sequence')
		console.log('testCount: ' + testCount)
		console.log('connectErrorCount: ' + connectErrorCount)

		findDevice()
		setTimeout(disconnectDevice, 20000)
		setTimeout(runTestSequence, 30000)
	}
	else
	{
		console.log('Test sequence done')
		console.log('testCount: ' + testCount)
		console.log('connectErrorCount: ' + connectErrorCount)

	}
}
// End of code used for testing.

function findDevice()
{
	disconnectDevice()

	// Used for debugging/testing.
	//scanForDevice()
	//return

	searchForBondedDevice({
		name: 'UART_Service',
		serviceUUIDs: [CUSTOM_SERVICE],
		onFound: connectToDevice,
		onNotFound: scanForDevice,
		})
}

function disconnectDevice()
{
	evothings.ble.stopScan()
	clearInterval(mPollingTimer)
	if (mDevice) { evothings.ble.close(mDevice) }
	mDevice = null
	showMessage('Disconnected')
}

/**
 * Search for bonded device with a given name.
 * Useful if the address is not known.
 */
function searchForBondedDevice(params)
{
	console.log('Searching for bonded device')
	evothings.ble.getBondedDevices(
		// Success function.
		function(devices)
		{
			for (var i in devices)
			{
				var device = devices[i]
				if (device.name == params.name)
				{
					console.log('Found bonded device: ' + device.name)
					params.onFound(device)
					return // bonded device found
				}
			}
			params.onNotFound()
		},
		// Error function.
		function(error)
		{
			params.onNotFound()
		},
		{ serviceUUIDs: params.serviceUUIDs })
}

function scanForDevice()
{
	showMessage('Scanning for HexiWear')

	// Start scanning. Two callback functions are specified.
	evothings.ble.startScan(
		onDeviceFound,
		onScanError)

	// This function is called when a device is detected, here
	// we check if we found the device we are looking for.
	function onDeviceFound(device)
	{
		console.log('Found device: ' + device.name)

		if (device.advertisementData.kCBAdvDataLocalName == 'UART_Service')
		{
			showMessage('Found UART_Service Sensor Tag')

			// Stop scanning.
			evothings.ble.stopScan()

			// Connect directly.
			// Used for debugging/testing.
			//connectToDevice(device)
			//return

			// Bond and connect.
			evothings.ble.bond(
				device,
				function(state)
				{
					// Android returns 'bonded' when bonding is complete.
					// iOS will return 'unknown' and show paring dialog
					// when connecting.
					if (state == 'bonded' || state == 'unknown')
					{
						connectToDevice(device)
					}
					else if (state == 'bonding')
					{
						showMessage('Bonding in progress')
					}
					else if (state == 'unbonded')
					{
						showMessage('Bonding aborted')
					}
				},
				function(error)
				{
					showMessage('Bond error: ' + error)
				})
		}
	}

	// Function called when a scan error occurs.
	function onScanError(error)
	{
		showMessage('Scan error: ' + error)
	}
}

function connectToDevice(device)
{
	showMessage('Connecting to device...')

	// Save device.
	mDevice = device

	// Android connect error 133 might be prevented by waiting a
	// little before connect (to make sure previous BLE operation
	// has completed).
	setTimeout(
		function()
		{
			evothings.ble.connectToDevice(
				device,
				onConnected,
				onDisconnected,
				onConnectError)
		},
	    500)

	function onConnected(device)
	{
    tracker.addDevice(device);

		showMessage('Connected')
    connectStateBLE = true;
    saveDevice = device;

    service = evothings.ble.getService(device, CUSTOM_SERVICE);
    readCharacteristic1 = evothings.ble.getCharacteristic(service, CUSTOM_READ);
    writeCharacteristic1 = evothings.ble.getCharacteristic(service, CUSTOM_WRITE);

    //enableLuxometerNotifications(device, readCharacteristic1);
		//testIfBonded()
	}

	function onDisconnected(device)
	{
		showMessage('Device disconnected')
	}

	// Function called when a connect error or disconnect occurs.
	function onConnectError(error)
	{
		++connectErrorCount
		showMessage('Connect error: ' + error)

		// If we get Android connect error 133, we wait and try to connect again.
		// This can resolve connect problems on Android when error 133 is seen.
		// In a production app you may want to have a function for aborting or
		// maximising the number of connect attempts. Note that attempting reconnect
		// does not block the app however, so you can still do other tasks and
		// update the UI of the app.
		if (133 == error)
		{
			showMessage('Reconnecting...')
			setTimeout(function() { connectToDevice(device) }, 1000)
		}
	}
}

function testIfBonded()
{
	console.log('test if bonded')

	// Read encrypted characteristic to test if device is bonded.
	// This will fail (on iOS) if not bonded.
	var service = evothings.ble.getService(mDevice, WEATHER_SERVICE)
	var characteristic = evothings.ble.getCharacteristic(service, WEATHER_TEMPERATURE)
	evothings.ble.readCharacteristic(
		mDevice,
		characteristic,
		function(data)
		{
		console.log('bonded')
			// We are bonded. Continue to read device data.
			readDevice()
		},
		function(errorCode)
		{
			// Not bonded, try again.
			console.log('not bonded')
			showMessage('Device not bonded. Please Connect again.')
		})
}

function readDevice()
{
	showMessage('Reading device data')

	// Read static device data.
	readCharacteristic(
		mDevice,
		INFO_SERVICE,
		INFO_MANUFACTURER,
		'device-manufacturer',
		dataToAscii)

	readCharacteristic(
		mDevice,
		INFO_SERVICE,
		INFO_FIRMWARE,
		'device-firmware',
		dataToAscii)

	// Periodically read accelerometer.
	clearInterval(mPollingTimer)
	mPollingTimer = setInterval(
		function()
		{
			readAccelerometer()
			readTemperature()
		},
		1000)
}

function readCharacteristic(device, serviceUUID, characteristicUUID, elementId, dataConversionFunction)
{
	var service = evothings.ble.getService(device, serviceUUID)
	var characteristic = evothings.ble.getCharacteristic(service, characteristicUUID)
	evothings.ble.readCharacteristic(
		device,
		characteristic,
		function(data)
		{
			document.getElementById(elementId).innerHTML =
				dataConversionFunction(data)
		},
		function(errorCode)
		{
			showMessage('readCharacteristic error: ' + errorCode)
		})
}

function readAccelerometer()
{
	readCharacteristic(
		mDevice,
		MOTION_SERVICE,
		MOTION_ACCELEROMETER,
		'device-accelerometer',
		convert3x16bitDataToString)
}

function readTemperature()
{
	readCharacteristic(
		mDevice,
		WEATHER_SERVICE,
		WEATHER_TEMPERATURE,
		'device-temperature',
		convertTemperatureDataToString)
}

function dataToAscii(data)
{
	return String.fromCharCode.apply(null, new Uint8Array(data))
}

function convert3x16bitDataToString(data)
{
	var array = new Int16Array(data)
	return array[0] + ' ' + array[1] + ' ' + array[2]
}

function convertTemperatureDataToString(data)
{
	return (new Int16Array(data)[0]) / 100.0
}

function showMessage(text)
{
	//document.querySelector('#message').innerHTML = text
	console.log(text)
}

function writeandreaddata(sendData){
  if(connectStateBLE === true)
  {
      console.log('send Data = ' + sendData);
      console.log('>>>>>>>>>>>>>>>>>>  ' + sendData.length);
      var uint1=new Uint8Array(sendData.length);
      console.log('uint1 length: ' + uint1.length);

      for(var i=0,j=sendData.length;i<j;++i){
        uint1[i]=sendData.charCodeAt(i);
      }
      evothings.ble.writeCharacteristic(saveDevice, writeCharacteristic1, uint1, writeAndReadDataSuccess, writeAndReadDataError)

      function writeAndReadDataSuccess()
      {
        console.log('success');
        //evothings.ble.enableNotification(saveDevice, writeCharacteristic1, ReadNotification, ReadNotificationError)
      }

      function ReadNotification(readDataArray)
      {
        //console.log('ReadNotification Data = ' + evothings.ble.fromUtf8(readDataArray));
        var readData = evothings.ble.fromUtf8(readDataArray);

        //----------------------------------------------------------------------------
    }

      function ReadNotificationError(error)
      {
        console.log('Read Notification Error: ' + error)

      }

      function writeAndReadDataError(error)
      {
        console.log('Write and Read Data error: ' + error)

      }
  }
}

function createDeviceTracker()
{
  var tracker = {}

  var connectedDevices = {}

  tracker.addDevice = function(device)
  {
    connectedDevices[device.address] = device
  }

  tracker.closeAllDevices = function()
  {
    for (var address in connectedDevices)
    {
      var device = connectedDevices[address]
      evothings.ble.close(device)
    }
    connectedDevices = {}
  }

  return tracker
}

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
    findDevice();

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

          setTimeout(() => {
            if(connectStateBLE === true)
            {
              var base64photo = bRes.src;
              //console.log('btnRelayOn = '+ base64photo);
              var length = base64photo.length;
              // var dataBuffer;

              writeandreaddata(base64photo);

              // for(var i = 0; i < length; i++){
              //   if (i % 1000 == 0){
              //     dataBuffer += ' ';
              //   }
              //   dataBuffer += base64photo.charAt(i);
              // }

              // var divisionData = dataBuffer.split(" ");
              // console.log(divisionData);
              
              
              // for(var i = 0; i < divisionData.length; i++){
              //   console.log('BLE transmit start: ' + i);
              //  writeandreaddata(divisionData[i]);
              // }
              
            }
            else {
              console.log("BLE is not connected");
            }
          }, 10)
        }, 10)
      }, 10)
    })


  });

}, false);

