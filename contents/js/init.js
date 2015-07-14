function supportsImports() {
	return 'import' in document.createElement('link');
}

$(document).ready(function(){
	if (supportsImports()) {
		var link = document.querySelector('link[rel="import"]');
		var content = link.import;
		var el = content.querySelector('#common');
		document.body.appendChild(el.cloneNode(true));
	} else {
		alert("import를 지원하지 않습니다.");
		window.location.href = "../index.html";
	}	
})

