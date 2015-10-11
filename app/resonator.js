var CBuffer = require('CBuffer');
var ss = require('simple-statistics');
var d3 = require('d3');

module.exports = function(arduino, io){

  var self = {};

  var dataClass = function(io){
    var o = {};
    o.museConfig = null;
    o.museConnected = 0;
    o.skipTimer = 0;
    o.ok = 0;
    o.eyeBlinkedTreshold = 1;
    o.musePolling = +new Date()-5000;
    o.is_good = [0,0,0,0];
    o.packet = {};

    o.isAlive = function () {
      return (+new Date()-o.musePolling)/1000 < 1;
    };

    o.timer = setInterval(function () {
      o.museConnected = o.isAlive();

      io.emit('ok', o.ok);
      io.emit('connected', o.museConnected);
      io.emit('is_good', o.is_good);

      if(o.museConnected){
        o.ok = o.eyeBlinked();
        //o.ok = 1;

        if(o.ok){
          o.packet = calculateFFT();
          io.emit('raw_fft', { fft: o.packet, binaural: parseInt(o.arduinoFreq) });
        }
        

      } else {
        o.ok = 0;
      }

      o.arduino();

    //  console.log(o.museConnected,o.ok, o.blink, o.jaw_clench, o.is_good);
      
    },100);

    o.arduinoFreq = 0;
    o.arduinoField = "z_scoreAvgStaticSmooth";
    o.arduinoFactor = 0.15;
    o.arduino = function(){
      if(o.ok){
        var freqs = o.packet.slice(1,25).sort(function(a,b){
            return b[o.arduinoField] - a[o.arduinoField];
        });
        var freq = freqs[0].freq;
        o.arduinoFreq = o.arduinoFreq + o.arduinoFactor * (freq-o.arduinoFreq);

        arduino.setFreq2(parseInt(o.arduinoFreq),1);
      } else {
        arduino.setFreq2(parseInt(o.arduinoFreq),0);
      }
      
    }

    o.keepAlive = function(){
      o.musePolling = +new Date();
    };

    o.eyeBlinked = function(){
      // if(o.skipTimer==1){
      //   // console.log("skipEnd");
      //   // io.emit('skipEnd');
      // }
      // if(o.skipTimer>0){
      //   o.skipTimer--;
      // }
      //if(o.blink==1 || o.is_good[1]==0 || o.is_good[2]==0 || !o.museConnected){
      if(o.is_good[1]==0 || o.is_good[2]==0 || !o.museConnected){
        o.skipTimer++;
        // console.log("skip");
        // io.emit('skip');
      } else {
        o.skipTimer = 0;
      }
      if(o.skipTimer<o.eyeBlinkedTreshold){
        return 1;
      } else {
        return 0;
      }
    }

    o.accFilter = [
      CBuffer(10),
      CBuffer(10),
      CBuffer(10)
    ];

    o.fftBufferSize = 20;
    o.fftBufferSizeStatic = 1000;
    o.zSize = 30;
    o.setFFTBufferSizeStatic = function(size){
      if(o.fftBufferSizeStatic != size){
        o.fftBufferSizeStatic = size;
        o.fftBuffer1.forEach(function (d,i) {
          d.rawStatic = CBuffer(o.fftBufferSizeStatic);
        });
      }
    }
    o.setFFTBufferSize = function(size){
      if(o.fftBufferSize != size){
        o.fftBufferSize = size;
        o.fftBuffer1.forEach(function (d,i) {
          d.raw = CBuffer(o.fftBufferSize);
        });
      }
    }
    o.setFFTzSize = function(size){
      if(o.zSize != size){
        o.zSize = size;
        o.fftBuffer1.forEach(function (d,i) {
          d.zStatic = CBuffer(o.zSize);
        });
      }
    }
    o.fftBuffer1 = d3.range(100).map(function (d,i) {
      return {
        freq: i,
        raw: CBuffer(o.fftBufferSize),
        rawStatic: CBuffer(o.fftBufferSizeStatic),
        zMoving: CBuffer(o.zSize),
        zStatic: CBuffer(o.zSize)
      };
    });

    return o;
  }

  var data = new dataClass(io);
  self.data = data;

  function calculateFFT(){


    var both = data.msg_raw_fft1.map(function(d,i){
      return (100+d.value + data.msg_raw_fft2[i].value)/2;
    });

    var stats =  data.fftBuffer1.map(function(d,i){
      var x = both[i];
      // var x = data.msg_raw_fft1[i].value;

      d.raw.push(x);
      
      if(!d.rawStatic.done) {
        d.rawStatic.push(x);
        //console.log("push");
      }
      if(d.rawStatic.end == d.rawStatic.length-1) {
        //d.rawStatic.done = true;
      }


      var stats = {};
      stats.freq = i;
      stats.raw = x;
      stats.raw1 = data.msg_raw_fft1[i].value;
      stats.raw2 = data.msg_raw_fft2[i].value;
      stats.standard_deviation = ss.standard_deviation(d.raw.toArray());
      // stats.standard_deviationStatic = ss.standard_deviation(d.rawStatic.toArray());
      stats.standard_deviationStatic = ss.standard_deviation(d.rawStatic.toArray());
      stats.mean = ss.mean(d.raw.toArray());
      stats.meanStatic = ss.mean(d.rawStatic.toArray());
      // stats.z_scoreNowMoving = ss.z_score(stats.meanStatic, stats.mean, stats.standard_deviation) || 0;
      stats.z_scoreNowStatic = ss.z_score(stats.mean, stats.meanStatic, stats.standard_deviationStatic) || 0;

      // d.zMoving.push(stats.z_scoreNowMoving);
      d.zStatic.push(stats.z_scoreNowStatic);
      // stats.z_scoreAvgMoving = ss.mean(d.zMoving.toArray()) || 0;
      stats.z_scoreAvgStatic = ss.mean(d.zStatic.toArray()) || 0;

      stats.min = ss.min(d.rawStatic.toArray());
      stats.max = ss.max(d.rawStatic.toArray());
      stats.range = stats.max-stats.min;
      stats.abs_score = 1- ((stats.max-stats.mean) / stats.range);

      var rawStaticMean = d.rawStatic.toArray();
      var rawMean = d.raw.toArray();

      // stats.madStatic = ss.median_absolute_deviation(stats.rawStaticMean) || 0;
      // stats.madNow = ss.median_absolute_deviation(stats.rawMean) || 0;
      // stats.madDif = stats.madStatic - stats.madNow;
      // console.log(stats.madNow, stats.madStatic)

      return stats;
    });

    stats.forEach(function(d,i){
      d.z_scoreNowStaticSmooth = smooth(stats, "z_scoreNowStatic", i);
      d.z_scoreAvgStaticSmooth = smooth(stats, "z_scoreAvgStatic", i);
      d.abs_scoreSmooth  = smooth(stats, "abs_score", i);
    })

    stats.forEach(function(d,i){
      d.z_scoreNowStaticSmooth2 = smooth(stats, "z_scoreNowStaticSmooth", i);
      d.abs_scoreSmooth2  = smooth(stats, "abs_scoreSmooth", i);
    })

    return stats;
    
  }

  function smooth(a, field, i){
    var left = a[i-1] ? a[i-1][field] : a[i][field];
    var middle = a[i][field];
    var right = a[i+1] ? a[i+1][field] : a[i][field];

    return (left+middle+right)/3;
  }


  self.parseMusePacket = function(msg){

    // console.log(msg)

    

    if(msg.address=="/muse/elements/raw_fft1" || msg.address=="/muse/dsp/elements/raw_fft1") {


      data.msg_raw_fft1 = msg.args;
      data.keepAlive();
    
    }
    if(msg.address=="/muse/elements/raw_fft2" || msg.address=="/muse/dsp/elements/raw_fft2") {


      data.msg_raw_fft2 = msg.args;

    
    }
    if(msg.address=="/muse/config") {
      data.museConfig = JSON.parse(msg.args[0].value);
      data.museConfig.eeg_channel_layout = data.museConfig.eeg_channel_layout.trim().split(" ");

      io.emit('battery', data.museConfig.battery_percent_remaining);
      io.emit('config', data.museConfig);

      //console.log(data.museConfig)
    }
    if(msg.address=="/muse/elements/horseshoe" || msg.address=="/muse/dsp/elements/horseshoe") {
      if(data.museConfig){
        io.emit('status', msg.args.map(function(d,i) {
          return {
            name: data.museConfig.eeg_channel_layout[i],
            value: d.value
          };
        }));
      }
    }
    if(msg.address=="/muse/elements/blink" || msg.address=="/muse/dsp/blink") {
      data.blink =  msg.args[0].value;
    }

    if(msg.address=="/muse/dsp/elements/jaw_clench" || msg.address=="/muse/dsp/jaw_clench") {
      data.jaw_clench =  msg.args[0].value;
    }

    if(msg.address=="/muse/elements/is_good" || msg.address=="/muse/dsp/elements/is_good") {
      data.is_good =  msg.args.map(function(d,i){ return d.value; });


      if(data.museConfig){
        io.emit('good', msg.args.map(function(d,i) {
          return {
            name: data.museConfig.eeg_channel_layout[i],
            value: d.value
          };
        }));
        //console.log(msg.args[1])
      }
      
    }
    if(msg.address=="/muse/dsp/elements/touching_forehead") {
      //io.emit('online', msg.args.map(function(d) { return d.value; }));
    }



    //console.log(msg.address)
  }


  return self;
}










