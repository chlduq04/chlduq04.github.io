function getE(id) {
	return document.getElementById(id);
}
var webgl3;
window.onload = function () {
	webgl3 = new WebGL();
	webgl3.initGl();
};

var WebGL = function () {
	// 캔버스
	this.canvas = getE("webgl_z");
	this.gl = null;

	// 프로그램
	this.glProgram = null;

	// 셰이더
	this.fragmentShader = null, this.vertexShader = null;

	// 정점을 그리기 위한 var
	this.vertexPositionAttribute = null, this.trianglesVerticeBuffers = [];

	// 색을 위한 var, 텍스쳐를 사용하지 않았을 경우에만 사용
	this.vertexColorAttribute  = null, this.trianglesColorBuffers = [];
	
	// 광원을 위한 normal
	this.vertexNormalAttribute = null,  this.trianglesNormalBuffers = [];

	// 텍스쳐 좌표 어트리뷰트
	this.vertexTexCoordAttribute = null, this.trianglesTexCoordBuffers = [];

	this.vertexIndexBuffers = [];
	
	// 모델 뷰와 투영 매트릭스를 위한 두 변수
	this.mvMatrix = mat4.create(), this.pMatrix = mat4.create(), this.normalMatrix = mat3.create();

	// 텍스처 개체 로드
	this.STONE_TEXTURE = 0, this.WEBGL_LOGO_TEXTURE = 1, this.texture = [], this.textureImage = [];
	
	// 회전각
	this.angle = 0.01;

	this.toggle = {
		paused : false,
		useTexture : false,
		useLighting : false
	}
}

WebGL.prototype.initGl = function () {
	try {
		this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
		this.gl = WebGLDebugUtils.makeDebugContext(this.gl)
	} catch (e) {
		alert("gl을 지원하지 않습니다.")
	}

	if (this.gl) {
		// 키 입력
		this.setKeyDown();
		// 셰이더 초기화
		this.initShaders();
		// 예제 물체 만들기
		setupSphereMesh(0, { "translation": [-1.0, -0.75, 0.0], "color": [1.0, 0.0, 0.0, 1.0], "divisions": 20, "smooth_shading": false }, this);
		setupSphereMesh(1, { "translation": [1.0, -0.75, 0.0], "color": [1.0, 0.0, 0.0, 1.0], "divisions": 20, "smooth_shading": false }, this);
		// 매트릭스의 uniform 얻기
		this.getMatrixUniforms();
		// 애니메이션 시작
		// 세 값들을 변경할 수 있게 불러오고
		this.vertexPositionAttribute = this.gl.getAttribLocation(this.glProgram, "aVertexPosition");
		this.vertexColorAttribute = this.gl.getAttribLocation(this.glProgram, "aVertexColor");
		this.vertexNormalAttribute = this.gl.getAttribLocation(this.glProgram, "aVertexNormal");
		
		// 이 값들을 변경할 것을 선언하고
		this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
		this.gl.enableVertexAttribArray(this.vertexColorAttribute);
		this.gl.enableVertexAttribArray(this.vertexNormalAttribute);
    			    
		// view를 설정
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		mat4.perspective(45, this.canvas.width / this.canvas.height, 0.1, 100.0, this.pMatrix);
		this.gl.uniformMatrix4fv(this.glProgram.pMatrixUniform, false, this.pMatrix);
		
		// 현재는 view가 고정이기 때문에 pMatrix를 한번만 넘겨주면 된다.
		this.animation();
	}
}

WebGL.prototype.setKeyDown = function () {
	var self = this;
	document.addEventListener("keydown", function(e){
		var keyCode = e.keyCode;
		if (keyCode == 80) { //p
			self.toggle.paused  = !self.toggle.paused;
		}
	}, false);
}

WebGL.prototype.getMatrixUniforms = function () {
	// 셰이더에서 uPMatrix와 uMVMatrix의 값을 불러온다. 셰이더 코드에 명시되어 있어야 한다.
	this.glProgram.pMatrixUniform = this.gl.getUniformLocation(this.glProgram, "uPMatrix");
	this.glProgram.mvMatrixUniform = this.gl.getUniformLocation(this.glProgram, "uMVMatrix");  
	this.glProgram.normalMatrixUniform = this.gl.getUniformLocation(this.glProgram, "uNormalMatrix");          
}

WebGL.prototype.setMatrixUniforms = function () {
	// 
	this.gl.uniformMatrix4fv(this.glProgram.mvMatrixUniform, false, this.mvMatrix);
	this.gl.uniformMatrix3fv(this.glProgram.normalMatrixUniform, false, this.normalMatrix);
}

WebGL.prototype.initShaders = function () {
	// 프로그램 생성
	this.glProgram = this.gl.createProgram();
	// 각 버텍스 셰이더와 픽셸 세이더를 만드는 API호출
	var vertexShader = this.makeShader(getE("shader-vs-z").innerHTML.trim(), this.gl.VERTEX_SHADER);
	var pixelShader = this.makeShader(getE("shader-fs-z").innerHTML.trim(), this.gl.FRAGMENT_SHADER);
	//셰이더를 붙이고
	this.gl.attachShader(this.glProgram, vertexShader);
	this.gl.attachShader(this.glProgram, pixelShader);
	//셰이더를 gl이 사용할 수 있도록 link한 후
	this.gl.linkProgram(this.glProgram);

	if (!this.gl.getProgramParameter(this.glProgram, this.gl.LINK_STATUS)) {
		alert("program 실패");
	}
	//사용
	this.gl.useProgram(this.glProgram);
}

WebGL.prototype.drawScene = function () {
	// glProgram에서 aVertexPosition의 값을 얻어온다
	//그리고 버퍼에 바인드 시킨다.
	mat4.identity(this.mvMatrix);
	mat4.translate(this.mvMatrix, [0.0, 0.4, -6.5]);              
	mat4.rotate(this.mvMatrix, -0.3, [-0.3, 0.0, 0.2]);              
	//mat4.rotate(this.mvMatrix, 90, [0.0, 1.0, 0.0]);              
	mat4.rotate(this.mvMatrix, this.angle, [0.0, 1.0, 0.0]);            
	mat4.toInverseMat3(this.mvMatrix, this.normalMatrix);
	mat3.transpose(this.normalMatrix);
	this.angle += 0.005;
	this.setMatrixUniforms();
	
	for(var i=0; i < this.vertexIndexBuffers.length; ++i){
		// 이곳에서 불러온 셰이더 값들에 데이터를 넘겨 수정해준다.
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesVerticeBuffers[i]);
		this.gl.vertexAttribPointer(this.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesColorBuffers[i]);
		this.gl.vertexAttribPointer(this.vertexColorAttribute, 4, this.gl.FLOAT, false, 0, 0);
					
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesNormalBuffers[i]);
		this.gl.vertexAttribPointer(this.vertexNormalAttribute, 3, this.gl.FLOAT, false, 0, 0);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesTexCoordBuffers[i]);
		if(i==3){
			this.gl.drawElements(this.gl.TRIANGLES, this.vertexIndexBuffers[i].numItems, this.gl.UNSIGNED_SHORT, 0);
		}else{
			this.gl.drawArrays(this.gl.TRIANGLES, 0, this.trianglesVerticeBuffers[i].numItems);
		}
	}
	//gl에 그린다.
}

WebGL.prototype.makeShader = function (src, type) {
	var shader = this.gl.createShader(type);
	// 셰이더에 소스 붙이기
	this.gl.shaderSource(shader, src);
	// 컴파일
	this.gl.compileShader(shader);
	if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
		alert("shader 실패");
	}
	return shader;
}

WebGL.prototype.setupWebGL = function () {
	this.gl.clearColor(0.1, 0.5, 0.1, 1.0); 	
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); 	
	this.gl.enable(this.gl.DEPTH_TEST);
}

WebGL.prototype.animation = function () {
	if(!this.toggle.paused){
		this.setupWebGL();
		this.drawScene();		
	}
	requestAnimationFrame(this.animation.bind(this), this.canvas);
	// 여기서 쓰인 bind함수는 나중에 불려지는 animLoop에서 this에 접근할 수 있게 한다. 단 JavaScript 1.8 가 지원되는 브라우져만 가능하다.
	// 이를 사용하지 않는다면 다른 방법으로 코드를 만들어야 한다.
}
