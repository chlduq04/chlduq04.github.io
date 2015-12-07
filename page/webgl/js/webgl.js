function getE(id) {
	return document.getElementById(id);
}

window.onload = function () {
	var webgl3 = new WebGL();
	webgl3.initGl();
};

var WebGL = function () {

	// 캔버스
	this.canvas = null, this.gl = null;

	// 프로그램
	this.glProgram = null;

	// 셰이더
	this.fragmentShader = null, this.vertexShader = null;

	// 정점을 그리기 위한 var
	this.vertexPositionAttribute = null, this.trianglesVerticeBuffer = null;

	// 색지정을 위한 var
	this.vertexColorAttribute = null, this.trianglesColorBuffer = null;
	this.triangleVerticesIndexBuffer = null;

	// 모델 뷰와 투영 매트릭스를 위한 두 번수
	this.mvMatrix = mat4.create(), this.pMatrix = mat4.create();

	// 회전각
	this.angle = 0.01;
}

WebGL.prototype.initGl = function () {
	try {
		this.canvas = getE("webgl_z");
		this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
	} catch (e) {
		alert("gl을 지원하지 않습니다.")
	}

	if (this.gl != null) {

		// 셰이더 초기화
		this.initShaders();

		// 버퍼 초기화, 위치와 회전 등 다양한 효과를 여기서 주며 만약 애니메이션시 바뀌어야 한다면 
		// animation loop에서 buffer를 수정해서 불러줘야한다.
		// 지금은 color는 바뀌지 않아서 color는 이곳에서 해주고 position은 바뀌기 때문에 animation() 함수 안에서 한다.		
		this.setupColorBuffers();
		
		// 매트릭스의 uniform 얻기
		this.getMatrixUniforms();
		
		// 애니메이션 시작
		this.animation();
	}
}

WebGL.prototype.getMatrixUniforms = function () {
	this.glProgram.pMatrixUniform = this.gl.getUniformLocation(this.glProgram, "uPMatrix");
	this.glProgram.mvMatrixUniform = this.gl.getUniformLocation(this.glProgram, "uMVMatrix");
}

WebGL.prototype.setMatrixUniforms = function () {
	this.gl.uniformMatrix4fv(this.glProgram.pMatrixUniform, false, this.pMatrix);
	this.gl.uniformMatrix4fv(this.glProgram.mvMatrixUniform, false, this.mvMatrix);
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

WebGL.prototype.setupColorBuffers = function () {

	// 버텍스 추가  webgl에서 그리는 방법은 점과 선을 이용해야 한다.
	var triangleVerticeColors = [
		1.0, 0.0, 0.0,
		1.0, 1.0, 1.0,
		1.0, 0.0, 0.0,

		0.0, 0.0, 0.0,
		1.0, 1.0, 1.0,
		0.0, 0.0, 0.0, ];
	// 색을 위한 버퍼 생성
	this.trianglesColorBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesColorBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(triangleVerticeColors), this.gl.STATIC_DRAW);
}

WebGL.prototype.setupDynamicBuffers = function () {
	
	var x_translation = Math.sin(this.angle) / 2.0;
	var triangleVertices = [
		//left triangle
		-0.5 + x_translation, 0.5, -0.5,
		0.0 + x_translation, 0.0, -0.5,
		-0.5 + x_translation, -0.5, -0.5,
		//right triangle
		0.5 + x_translation, 0.5, 0.5,
		0.0 + x_translation, 0.0, 0.5,
		0.5 + x_translation, -0.5, 0.5
	];

	this.angle += 0.01;

	// 버퍼를 만들어서
	this.trianglesVerticeBuffer = this.gl.createBuffer();

	// 버퍼에 우리가 만든 정점을 추가한다.
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesVerticeBuffer);

	// 그리고 STATIC_DRAW, DYNAMIC_DRAW, STREAM_DRAW의 세가지 방법으로 버퍼에 사용법을 명시해주는데
	// (변경을 하지 않음 , 그릴때마다 재설정 , STATIC과 유사하나 자주 사용하지 않음)이라는 특징을 가지고 있다.
	// 그리고 위에서와 달리 dinamic으로 위치가 변하는 것을 적용한다.
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(triangleVertices), this.gl.DYNAMIC_DRAW);
}

WebGL.prototype.drawScene = function () {

	// glProgram에서 aVertexPosition의 값을 얻어온다
	this.vertexPositionAttribute = this.gl.getAttribLocation(this.glProgram, "aVertexPosition");
	this.gl.enableVertexAttribArray(this.vertexPositionAttribute);

	//그리고 버퍼에 바인드 시킨다.
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesVerticeBuffer);
	this.gl.vertexAttribPointer(this.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

	// vertex color를 얻어온다.
	this.vertexColorAttribute = this.gl.getAttribLocation(this.glProgram, "aVertexColor");
	this.gl.enableVertexAttribArray(this.vertexColorAttribute);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.trianglesColorBuffer);
	this.gl.vertexAttribPointer(this.vertexColorAttribute, 3, this.gl.FLOAT, false, 0, 0);

	//gl에 그린다.
	this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
	//gl.LINES, gl.POINTS, gl.TRIANGLES
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
	this.gl.clearColor(0.5, 0.5, 0.5, 1.0);
	// 배경 색 적용
	this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	//시야, 종횡비, 전방, 후방
	mat4.perspective(45, this.canvas.width / this.canvas.height, 0.1, 100.0, this.pMatrix);
	// mv matrix를 x = 0, y = 0, z = 0, r = 0으로 초기화 시킨다.
	// [1, 0, 0, 0,
	//  0, 1, 0, 0,
	//  0, 0, 1, 0,
	//  0, 0, 0, 1]
	mat4.identity(this.mvMatrix);
	// matrix의 이동
	mat4.translate(this.mvMatrix, [0, 0, -2.0]);
}

WebGL.prototype.animation = function () {
	this.setupWebGL();
	this.setupDynamicBuffers();
	this.setMatrixUniforms();
	this.drawScene();
	requestAnimationFrame(this.animation.bind(this), this.canvas);
	// 여기서 쓰인 bind함수는 나중에 불려지는 animLoop에서 this에 접근할 수 있게 한다. 단 JavaScript 1.8 가 지원되는 브라우져만 가능하다.
	// 이를 사용하지 않는다면 다른 방법으로 코드를 만들어야 한다.
}
