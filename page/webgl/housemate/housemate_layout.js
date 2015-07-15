function custom_css(options) {
	var options = options || {};
	this.display_none = (typeof options.display_none !== 'undefined') ? options.display_none : "display_none";
	this.visibility_hidden = (typeof options.visibility_hidden !== 'undefined') ? options.visibility_hidden : "visibility_hidden";
	var custom = "<style>";
	custom += "." + this.display_none + "{display:none;}." + this.visibility_hidden + "{visibility:hidden;}";
	custom += 'label{cursor:pointer;}label:hover{opacity:0.6}input[type="button"]{display:none;border:none;background-color:rgba(0,0,0,0);}input[type="text"]{padding:0px;padding-left:5px;border: 1px solid #bdc3c7;border-radius: 4px;height: calc(100% - 2px);}';
	custom += "</style>";
	$("head").append(custom);
	if($){this.jquery_extend()}
}
custom_css.prototype.jquery_extend = function () {
	var self = this;
	$.fn.extend({
		display : function (option) {
			return this.each(function () { (option != true) ? $(this).addClass(self.display_none) : $(this).removeClass(self.display_none); });
		},
		visible : function(){
			return this.each(function(){ (option != true) ? $(this).addClass(self.visibility_hidden) : $(this).removeClass(self.visibility_hidden); })
		}
	});
}
custom_css.prototype.display = function (target, option) {
	(option != true) ? target.addClass(this.display_none) : target.removeClass(this.display_none);
}
custom_css.prototype.visible = function (target, option) {
	(optoin != true) ? target.addClass(this.visibility_hidden) : target.removeClass(this.visibility_hidden);
}

function layout_fit() {
	this.options = {
		header_height : "50px",
		mobile_header_height : "50px"
	}
	this.width = null;
	this.height = null;
	this.canvas = null;
	this.canvas_width = null;
	this.canvas_height = null;
	this.canvas_padding = 3;
	this.CS = new custom_css();
	this.bind();
}

layout_fit.prototype.init = function (window) {
	this.width = $(window).width();
	this.height = $(window).height();

	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		
	} else {
		var height = "calc("+this.height+"px - "+this.options.header_height+")";
		$("header").css({height : this.options.header_height})
		
		var resize_small_width = this.width * (1 / 4);
		if (resize_small_width < 250) {
			$("#housemate_view_container").css({width : "100%",height : height});
			$("#housemate_ui_container").css({width : "100%", height : height}).display(false);
		} else {
			$("#housemate_view_container").css({ width : "75%", height : height, "float" : "left" });
			$("#housemate_ui_container").css({ width :"25%", height : height, "float" : "left" }).display(true);
		}

		this.canvas_width = $("#housemate_view_container").width() - this.canvas_padding*2, this.canvas_height = $("#housemate_view_container").height() - this.canvas_padding*2;
		this.canvas = $('<canvas class="housemate_view" id="housemate_view"></canvas>').attr({width:this.canvas_width, height:this.canvas_height}).css({margin : this.canvas_padding});
		$("#housemate_view_container").html(this.canvas);
	}

	if (!this.load()) {}

	if (!$(window).applicationCache) {} else {}
	return this;
}

layout_fit.prototype.bind = function(){
	$("#new_obj_bt").bind("click",function(){
		console.log("w");
	})
}

layout_fit.prototype.save = function () {}

layout_fit.prototype.load = function () {
	if (false) {
		//.../
		return true;
	}
	return false;
}