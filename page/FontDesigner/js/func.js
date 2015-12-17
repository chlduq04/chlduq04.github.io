$(document).ready(function(){
	panel = new listener();
})

function module(option){
	this.targetDiv = $("#divPanel");
	this.use = {};
	this.use = option

}
module.prototype.changeValue = function(attr, value){
	if(this.use[attr]){this.targetDiv.css(attr, value)}
}

module.prototype.isUse = function(target, bool){
	if(arguments.length == 1){
		return this.use[target];
	}
	this.use[target] = bool;
}

function listener(){
	this.opener();
	this.ulUtil();
	this.valueChecking();
	this.useChecking();
	this.init();
}

listener.prototype.init = function(){
	var initial = {width:false, height:false};
	this.vc = new module(initial);
	for(var i in initial){
		$(".eachCssDiv[target='"+i+"']").find(".eachCssUse").click();
	}
	return this;
}

listener.prototype.opener = function(){
	$(".opener").click(function(){
		var target = $(this).attr("for");
		$("#"+target).removeClass("none")
		$(this).addClass("none");
		$(this).next().removeClass("none")
	})
	$(".closer").click(function(){
		var target = $(this).attr("for");
		$("#"+target).addClass("none")
		$(this).addClass("none");
		$(this).prev().removeClass("none")
	})

	return this;
}

listener.prototype.ulUtil = function(){
	var ul = $(".listul")
	var self = this;
	for(var i=0, length = ul.length ; i < length ; i++){
		(function(i){
			var target = $(ul[i]);
			var click = false;
			target.find("li").addClass("none")
			target.find("li").first().removeClass("none").addClass("checked")
			target.children().click(function(){
				if(click){
					target.children().addClass("none").removeClass("checked");
					$(this).removeClass("none").addClass("checked");
					target.removeClass("indexHigh")					

					var findTarget = target.parent(".eachCssDiv");
					var findUnit = $(this).text();
					var value = findTarget.find(".eachCssValue").val() || "";
					self.vc.changeValue( findTarget.attr("target") , value + findUnit)
				}else{
					target.children().removeClass("none");
					target.addClass("indexHigh")					
				}
				click = !click;
			})
		})(i)
	}
	return this;
}

listener.prototype.valueChecking = function(){
	var div = $("#divPanel");
	var divText = $("#divTextPanel")
	var self = this;
	$(".eachCssValue, .listul").change(function(){
		var findTarget = $(this).parent(".eachCssDiv");
		var findUnit = findTarget.find(".eachCssUnit").find(".checked").text();
		var value = $(this).val() || 0;
		self.vc.changeValue( findTarget.attr("target") , value + findUnit)
	})
	$(".eachCssValue[option='number']").keydown(function(e){
		switch(e.keyCode){
		case 38:
			$(this).val(parseInt($(this).val()) + 1)
			break;
		case 40:
			$(this).val(parseInt($(this).val()) - 1)
			break;
		default:
			break;
		}

		var findTarget = $(this).parent(".eachCssDiv");
		var findUnit = findTarget.find(".eachCssUnit").find(".checked").text();
		var value = $(this).val() || 0;
		self.vc.changeValue( findTarget.attr("target") , value + findUnit)

	}).keyup(function(){
		var findTarget = $(this).parent(".eachCssDiv");
		var findUnit = findTarget.find(".eachCssUnit").find(".checked").text();
		var value = $(this).val() || 0;
		self.vc.changeValue( findTarget.attr("target") , value + findUnit)
	})

	$("#textareaInput").change(function(){
		divText.text($(this).val());
	}).keydown(function(){
		divText.text($(this).val());
	}).keyup(function(){
		divText.text($(this).val());
	});
	return this;
}

listener.prototype.useChecking = function(){
	var self = this;
	$(".eachCssUse").click(function(){
		var css = $(this).parent(".eachCssDiv").attr("target");
		var input = $(this).parent(".eachCssDiv").find("input").val();
		var unit = $(this).parent(".eachCssDiv").find(".eachCssUnit").find(".checked").text();
		if(!input){
			input = $(this).parent(".eachCssDiv").find(".eachCssOption").find(".checked").text();
			unit = "";
		}
		var target = $(this).find(".eachUseCheck");
		if(self.vc.isUse(css)){
			self.vc.isUse(css, false);
			target.removeClass("eachUse");
			 $("#divPanel").css(css,"");
		}else{
			self.vc.isUse(css, true);
			target.addClass("eachUse");
			 $("#divPanel").css(css,input+unit);
		}
	})
}

