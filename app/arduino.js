// Copyright (c) 2015 Christopher Pietsch

var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

module.exports = function Arduino (inport) {
  var self = function(){};
  self.arduino = null;
  self.status = "loading";
  self.search = function() {
    self.timer = setInterval(function() {
        //console.log("searching arduino");
        self.status = "searching arduino";

        serialport.list(function (err, ports) {
          ports.forEach(function(port) {
            if(port.manufacturer == "Arduino LLC") {
              var portName = port.comName.replace("cu", "tty");
              console.log("there is an arduino on", portName);
              if(inport == portName){
                clearInterval(self.timer);
                self.init(portName);
              }
              return true;
            }
          });
        });
      },2000);
  }
  self.init = function(portName){
    console.log("init arduino", portName);
    self.status = "arduino connected";
    self.arduino = new SerialPort(portName, {
      baudrate: 115200
    });

    self.arduino.on("close", function () {
      console.log("lost Arduino");
      self.arduino = null;
      self.search();
    });
  }
  self.lastTime = +new Date();
  self.filter = function(){
    if(+new Date()-self.lastTime>100){
      self.lastTime = +new Date();
      return true;
    }
    return false;

  }
  self.stop = function(){
    if(self.arduino){
      var payload = 0 + "," + 0 +"\n";
      self.arduino.write(payload, function(err, results) {
        if(err) console.log(err,results)
      });
    }
  }
  self.setFreq = function(binaural,alt) {
    if(self.arduino && self.filter()){
      console.log("set Freq",binaural,alt);

      var millis = parseInt(1000/(binaural*2)).toString();
      var payload = millis + "," + alt +"\n";

      self.arduino.write(payload, function(err, results) {
        if(err) console.log(err,results)
      });

    } else {
      //console.log("can not set Freq")
    }
  }

  self.setFreq2 = function(binaural,alt) {
    if(self.arduino && self.filter()){
      console.log("set Freq2",binaural,alt);

      //var millis = parseInt(1000/(binaural*2)).toString();
      var payload = binaural + "," + alt +"\n";

      self.arduino.write(payload, function(err, results) {
        if(err) console.log(err,results)
      });

    } else {
      //console.log("can not set Freq")
    }
  }

  self.search();

  return self;

}
