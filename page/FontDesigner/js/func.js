$(document).ready(function(){
	var panel = new listener();
})

function listener(){
	this.opener().ulUtil().valueChecking();
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
	var ul = $(".selectUl, .eachCssUnit")
	for(var i=0, length = ul.length ; i < length ; i++){
		(function(i){
			var target = $(ul[i]);
			target.find("li").addClass("none")
			target.find("li").first().removeClass("none")
		})(i)
	}
	return this;
}


listener.prototype.valueChecking = function(){
	var inputText = $(".eachCssValue");
	var div = $("#divPanel");
	var divText = $("#divTextPanel")
	
	inputText.change(function(){
		var findTarget = $(this).prev();
		if(findTarget.is(".none")){
			var value = $(this).val();
			div[findTarget.attr("target")]( ""+findTarget.text() , value + "px")
		}
	}).keydown(function(e){
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
		var findTarget = $(this).prev();
		if(findTarget.is(".none")){
			var value = $(this).val();
			div[findTarget.attr("target")]( ""+findTarget.text() , value + "px");
		}		

		
	}).keyup(function(){
		var findTarget = $(this).prev();
		if(findTarget.is(".none")){
			var value = $(this).val();
			div[findTarget.attr("target")]( ""+findTarget.text() , value + "px");
		}		
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
	$(".eachCssDiv")
}
