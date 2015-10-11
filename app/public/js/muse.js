function muse_manager(){
	var self = function() { };

	var muse = io.connect('http://localhost:3000');
	
	self.accRaw = function(){};
	self.accMapped = function(){};

	self.fftRaw = function(){};

	self.setBufferSize = function(size){
		muse.emit("setBufferSize", size);
	}


	muse.on('connect_error', function (data) {
		log("muse not found",data);
	});


	muse.on('raw_fft', function(d){
		//console.log(d.length);
		
		self.fftRaw(d);
	});


	muse.on('ok', function(d){
		d3.select("#ok").classed("on", d);
	});

	muse.on('connected', function(d){
		d3.select("#connected").classed("on", d);
	});

	muse.on('is_good', function(d){
		var c = d3.select("#is_good").selectAll("span").data(d);

		c.enter()
			.append("span")

		c.classed("on", function(d){ return d; })

		if(d[1] == true){
			sound.play();
		} else {
			sound.mute();
		}
	});

	muse.on('battery', function(d){
		d3.select("#battery").text("battery " + d + "%");
	});

	self.muse = muse;

	return self;
}