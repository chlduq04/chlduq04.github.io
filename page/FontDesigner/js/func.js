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
	inputText.change(function(){
		var findTarget = $(this).prev();
		if(findTarget.is(".none")){
			var value = $(this).val();
			div[findTarget.attr("target")]( ""+findTarget.text() , value + "px")
		}
	}).keydown(function(){
		var findTarget = $(this).prev();
		if(findTarget.is(".none")){
			var value = $(this).val();
			div[findTarget.attr("target")]( ""+findTarget.text() , value )
		}		
	}).keyup(function(){
		var findTarget = $(this).prev();
		if(findTarget.is(".none")){
			var value = $(this).val();
			div[findTarget.attr("target")]( ""+findTarget.text() , value )
		}		
	})
	
	$("#textareaInput").change(function(){
		div.text($(this).val());
	}).keydown(function(){
		div.text($(this).val());
	}).keyup(function(){
		div.text($(this).val());
	});
	return this;
}
