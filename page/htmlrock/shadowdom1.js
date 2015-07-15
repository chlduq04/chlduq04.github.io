$(window).load(function(){
	if (supportsImports()) {
		var link = document.querySelector('link[rel="import"]');
		var el = link.import.querySelector('template');
		document.body.appendChild(el.cloneNode(true));
		var shadow = document.querySelector('#nameTag').createShadowRoot();
		var template = document.querySelector('#nameTagTemplate');
		var clone = document.importNode(template.content, true);
		shadow.appendChild(clone);	
	} else {
		alert("import를 지원하지 않습니다.");
	}	
	
})
