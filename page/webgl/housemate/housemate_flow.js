$(window).load(function(){
	layout = new layout_fit();
	layout.init(window);		
	new WebGL().initGl(layout.canvas[0]);
	$( this.window ).resize(function() {
		layout.init(window);		
	});
})