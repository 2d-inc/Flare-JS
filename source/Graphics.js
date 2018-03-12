import {mat4} from "gl-matrix";

export default class Graphics
{
	constructor(glOrCanvas)
	{
		let contextOptions = {
			premultipliedAlpha: false,
			preserveDrawingBuffer: true
		};


		let _GL = glOrCanvas instanceof WebGLRenderingContext ? glOrCanvas : glOrCanvas.getContext("webgl", contextOptions) || glOrCanvas.getContext("experimental-webgl", contextOptions);
		let canvas = glOrCanvas instanceof WebGLRenderingContext ? null : glOrCanvas;

		let _AnisotropyExtension = _GL.getExtension("EXT_texture_filter_anisotropic");
		let _MaxAnisotropy;
		if(_AnisotropyExtension)
		{
			_MaxAnisotropy = _GL.getParameter(_AnisotropyExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
		}

		let _Projection = mat4.create();
		let _Transform = mat4.create();
		let _ViewTransform = mat4.create();
		let _ColorBuffer = new Float32Array(4);
		let _ViewportWidth = 0;
		let _ViewportHeight = 0;
		let _BlendMode = null;
		let _HoldBlendMode = false;
		let _ViewDirty = true;
		let _MaxAttributes = _GL.getParameter(_GL.MAX_VERTEX_ATTRIBS);
		let _EnabledAttributes = new Uint8Array(_MaxAttributes);
		let _WantedAttributes = new Uint8Array(_MaxAttributes);
		let _CurrentShaderGroup = null;
		let _SecondTexture = null;

		function _SetSize(width, height)
		{
			// Check if the canvas is not the same size.
			if (_ViewportWidth != width || _ViewportHeight != height)
			{
				// Make the canvas the same size
				if(canvas)
				{
					canvas.width = width;
					canvas.height = height;
				}

				_ViewportWidth = width;
				_ViewportHeight = height;
				mat4.ortho(_Projection, 0, _ViewportWidth, 0, _ViewportHeight, 0, 1);
				_GL.viewport(0, 0, _ViewportWidth, _ViewportHeight);
				_ViewDirty = true;
				return true;
			}
			return false;
		}

		function _Clear(color)
		{
			//_GL.clearColor(0.0, 0.0, 0.0, 0.0);
			if(color)
			{
				_GL.clearColor(color[0], color[1], color[2], color[3]);	
			}
			else
			{
				_GL.clearColor(0.3628, 0.3628, 0.3628, 1.0);
			}
			
			_GL.clear(_GL.COLOR_BUFFER_BIT);
		}

		function _DeleteTexture(tex)
		{
			_GL.deleteTexture(tex);
		}

		function _LoadTexture(blob)
		{
			let tex = _GL.createTexture();
			tex.ready = false;

			_GL.bindTexture(_GL.TEXTURE_2D, tex);
			_GL.texImage2D(_GL.TEXTURE_2D, 0, _GL.RGBA, 1, 1, 0, _GL.RGBA, _GL.UNSIGNED_BYTE, null);
			_GL.texParameteri(_GL.TEXTURE_2D, _GL.TEXTURE_MAG_FILTER, _GL.LINEAR);
			_GL.texParameteri(_GL.TEXTURE_2D, _GL.TEXTURE_MIN_FILTER, _GL.LINEAR);
			_GL.texParameteri(_GL.TEXTURE_2D, _GL.TEXTURE_WRAP_S, _GL.CLAMP_TO_EDGE);
			_GL.texParameteri(_GL.TEXTURE_2D, _GL.TEXTURE_WRAP_T, _GL.CLAMP_TO_EDGE);
			_GL.bindTexture(_GL.TEXTURE_2D, null);
			_GL.pixelStorei(_GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
			_GL.pixelStorei(_GL.UNPACK_FLIP_Y_WEBGL, false);
			if(blob.constructor !== Blob)
			{
				_GL.bindTexture(_GL.TEXTURE_2D, tex);
				_GL.texImage2D(_GL.TEXTURE_2D, 0, _GL.RGBA, _GL.RGBA, _GL.UNSIGNED_BYTE, blob.img);
				_GL.texParameteri(_GL.TEXTURE_2D, _GL.TEXTURE_MAG_FILTER, _GL.LINEAR);
				_GL.texParameteri(_GL.TEXTURE_2D, _GL.TEXTURE_MIN_FILTER, _GL.LINEAR_MIPMAP_LINEAR);
				_GL.texParameteri(_GL.TEXTURE_2D, _GL.TEXTURE_WRAP_S, _GL.CLAMP_TO_EDGE);
				_GL.texParameteri(_GL.TEXTURE_2D, _GL.TEXTURE_WRAP_T, _GL.CLAMP_TO_EDGE);
				if(_AnisotropyExtension)
				{
					_GL.texParameterf(_GL.TEXTURE_2D, _AnisotropyExtension.TEXTURE_MAX_ANISOTROPY_EXT, _MaxAnisotropy);
				}
				_GL.generateMipmap(_GL.TEXTURE_2D);
				_GL.bindTexture(_GL.TEXTURE_2D, null);

				tex.ready = true;
			}
			else
			{
				let reader = new FileReader();
				reader.onload = function(e)
				{
					let img = new Image();
					img.src = e.target.result;
					img.onload = function()
					{
						_GL.bindTexture(_GL.TEXTURE_2D, tex);
						_GL.texImage2D(_GL.TEXTURE_2D, 0, _GL.RGBA, _GL.RGBA, _GL.UNSIGNED_BYTE, this);
						_GL.texParameteri(_GL.TEXTURE_2D, _GL.TEXTURE_MAG_FILTER, _GL.LINEAR);
						_GL.texParameteri(_GL.TEXTURE_2D, _GL.TEXTURE_MIN_FILTER, _GL.LINEAR_MIPMAP_LINEAR);
						_GL.texParameteri(_GL.TEXTURE_2D, _GL.TEXTURE_WRAP_S, _GL.CLAMP_TO_EDGE);
						_GL.texParameteri(_GL.TEXTURE_2D, _GL.TEXTURE_WRAP_T, _GL.CLAMP_TO_EDGE);
						if(_AnisotropyExtension)
						{
							_GL.texParameterf(_GL.TEXTURE_2D, _AnisotropyExtension.TEXTURE_MAX_ANISOTROPY_EXT, _MaxAnisotropy);
						}
						_GL.generateMipmap(_GL.TEXTURE_2D);
						_GL.bindTexture(_GL.TEXTURE_2D, null);

						tex.ready = true;
					};
				};
				reader.readAsDataURL(blob);
			}

			return tex;
		}

		function _DisableBlending()
		{
			if (_HoldBlendMode || _BlendMode === 0)
			{
				return;
			}
			_BlendMode = 0;
			_GL.disable(_GL.BLEND);
		}

		function _EnableBlending()
		{
			if (_HoldBlendMode || _BlendMode === 1)
			{
				return;
			}
			_BlendMode = 1;
			_GL.enable(_GL.BLEND);
			//_GL.blendFuncSeparate(_GL.SRC_ALPHA, _GL.ONE_MINUS_SRC_ALPHA, _GL.ONE, _GL.ONE_MINUS_SRC_ALPHA);
			_GL.blendFunc(_GL.ONE, _GL.ONE_MINUS_SRC_ALPHA);
		}

		function _EnableScreenBlending()
		{
			if (_HoldBlendMode || _BlendMode === 2)
			{
				return;
			}
			_BlendMode = 2;
			_GL.enable(_GL.BLEND);
			_GL.blendFuncSeparate(_GL.ONE, _GL.ONE_MINUS_SRC_COLOR, _GL.ONE, _GL.ONE_MINUS_SRC_ALPHA);
		}

		function _EnableMultiplyBlending()
		{
			if (_BlendMode === 3)
			{
				return;
			}
			_BlendMode = 3;
			_GL.enable(_GL.BLEND);
			_GL.blendFuncSeparate(_GL.DST_COLOR, _GL.ONE_MINUS_SRC_ALPHA, _GL.DST_ALPHA, _GL.ONE_MINUS_SRC_ALPHA);
		}

		function _EnablePremultipliedBlending()
		{
			if (_HoldBlendMode || _BlendMode === 4)
			{
				return;
			}
			_BlendMode = 4;
			_GL.enable(_GL.BLEND);
			_GL.blendFuncSeparate(_GL.ONE, _GL.ONE_MINUS_SRC_ALPHA, _GL.ONE, _GL.ONE_MINUS_SRC_ALPHA);
		}

		function _EnableAdditiveBlending()
		{
			if (_HoldBlendMode || _BlendMode === 5)
			{
				return;
			}
			_BlendMode = 5;
			_GL.enable(_GL.BLEND);
			_GL.blendFuncSeparate(_GL.ONE, _GL.ONE, _GL.ONE, _GL.ONE);
		}

		function _EnableMod2xBlending()
		{
			if (_HoldBlendMode || _BlendMode === 6)
			{
				return;
			}
			_BlendMode = 6;
			_GL.enable(_GL.BLEND);
			//_GL.blendFuncSeparate(_GL.DST_COLOR, _GL.SRC_COLOR, _GL.DST_ALPHA, _GL.ONE_MINUS_SRC_ALPHA);
			_GL.blendFunc(_GL.DST_COLOR, _GL.SRC_COLOR);
		}

		function _SetHoldBlendMode()
		{
			_HoldBlendMode = true;
		}

		function _SetReleaseBlendMode()
		{
			_HoldBlendMode = false;
		}

		function VertexBuffer(id)
		{
			let _Size = 0;
			this.update = function(data)
			{
				_GL.bindBuffer(_GL.ARRAY_BUFFER, id);
				_GL.bufferData(_GL.ARRAY_BUFFER, data instanceof Float32Array ? data : new Float32Array(data), _GL.DYNAMIC_DRAW);

				_Size = data.length;
			};

			this.__defineGetter__("id", function()
			{
				return id;
			});

			this.__defineGetter__("size", function()
			{
				return _Size;
			});

			this.dispose = function()
			{
				_GL.deleteBuffer(id);
			};
		}

		function _MakeVertexBuffer(data)
		{
			let buffer = _GL.createBuffer();
			let vtxBuffer = new VertexBuffer(buffer);
			if (data)
			{
				vtxBuffer.update(data);
			}

			return vtxBuffer;
		}

		function IndexBuffer(id)
		{
			let _Size = 0;

			this.update = function(data)
			{
				_GL.bindBuffer(_GL.ELEMENT_ARRAY_BUFFER, id);
				_GL.bufferData(_GL.ELEMENT_ARRAY_BUFFER, data instanceof Uint16Array ? data : new Uint16Array(data), _GL.DYNAMIC_DRAW);

				_Size = data.length;
			};

			this.__defineGetter__("id", function()
			{
				return id;
			});

			this.__defineGetter__("size", function()
			{
				return _Size;
			});

			this.dispose = function()
			{
				_GL.deleteBuffer(id);
			};
		}

		function _MakeIndexBuffer(data)
		{
			let buffer = _GL.createBuffer();
			let indexBuffer = new IndexBuffer(buffer);
			if (data)
			{
				indexBuffer.update(data);
			}

			return indexBuffer;
		}

		function _EnableAttribute(index)
		{
			_WantedAttributes[index] = 1;
			if(_EnabledAttributes[index] === 0)
			{
				_EnabledAttributes[index] = 1;
				_GL.enableVertexAttribArray(index);	
			}
		}

		function _DisableAttribute(index)
		{
			if(!_EnabledAttributes[index])
			{
				_EnabledAttributes[index] = 0;
				_GL.disableVertexAttribArray(index);	
			}
		}

		function _InitializeShader(s)
		{
			if (!(s.fragment = _GetShader(s.fragment)))
			{
				return null;
			}
			if (!(s.vertex = _GetShader(s.vertex)))
			{
				return null;
			}
			s.program = _GL.createProgram();

			_GL.attachShader(s.program, s.vertex);
			_GL.attachShader(s.program, s.fragment);
			_GL.linkProgram(s.program);

			if (!_GL.getProgramParameter(s.program, _GL.LINK_STATUS))
			{
				console.warn("Could not link shader", s.name, _GL.getProgramInfoLog(s.program));
			}
			else
			{
				_GL.useProgram(s.program);

				for (let a in s.attributes)
				{
					let name = s.attributes[a];
					let index = _GL.getAttribLocation(s.program, name);
					s.attributes[a] = index;
					if (index === -1)
					{
						console.warn("Could not find attribute", s.attributes[a].name, "for shader", s.name);
					}
				}
				for (let u in s.uniforms)
				{
					let name = s.uniforms[u];
					if ((s.uniforms[u] = _GL.getUniformLocation(s.program, name)) === null)
					{
						if(name === "SecondTextureSampler")
						{
							// Don't warn of an optional sampler (might want to make this more robust in the future).
							continue;
						}
						console.warn("Could not find uniform", name, "for shader", s.name);
					}
				}

				// We always use texture unit 0 for our sampler. Set it once.
				_GL.uniform1i(s.uniforms.TextureSampler, 0);
				if(s.uniforms.SecondTextureSampler)
				{
					_GL.uniform1i(s.uniforms.SecondTextureSampler, 1);
				}
			}

			return s;
		}

		function _GetShader(id)
		{
			let s = _CompiledShaders.get(id);
			if (s)
			{
				return s;
			}

			let shader = null;

			let shaderScript = _ShaderSources[id];
			if (shaderScript)
			{
				if (id.indexOf(".fs") == id.length - 3)
				{
					shader = _GL.createShader(_GL.FRAGMENT_SHADER);
				}
				else if (id.indexOf(".vs") == id.length - 3)
				{
					shader = _GL.createShader(_GL.VERTEX_SHADER);
				}

				_GL.shaderSource(shader, shaderScript);
				_GL.compileShader(shader);

				if (!_GL.getShaderParameter(shader, _GL.COMPILE_STATUS))
				{
					console.error("Failed to compile", id);
					return null;
				}
				_CompiledShaders.set(id, shader);
			}
			return shader;
		}

		let _CompiledShaders = new Map();
		let _ShaderSources = {
			"Regular.vs": "attribute vec2 VertexPosition; attribute vec2 VertexTexCoord; uniform mat4 ProjectionMatrix; uniform mat4 WorldMatrix; uniform mat4 ViewMatrix; varying vec2 TexCoord; varying vec2 ScreenCoord; void main(void) {TexCoord = VertexTexCoord; vec4 pos = ProjectionMatrix * ViewMatrix * WorldMatrix * vec4(VertexPosition.x, VertexPosition.y, 0.0, 1.0); ScreenCoord = pos.xy/pos.w; gl_Position = pos; }",
			"Textured.fs": "#ifdef GL_ES \nprecision highp float;\n #endif\n uniform vec4 Color; uniform sampler2D TextureSampler; varying vec2 TexCoord; void main(void) {vec4 color = texture2D(TextureSampler, TexCoord) * Color; gl_FragColor = color; }",
			"Deforming.vs": "attribute vec2 VertexPosition; attribute vec2 VertexTexCoord; attribute vec4 VertexBoneIndices; attribute vec4 VertexWeights; uniform mat4 ProjectionMatrix; uniform mat4 WorldMatrix; uniform mat4 ViewMatrix; uniform vec3 BoneMatrices[82]; varying vec2 TexCoord; void main(void) {TexCoord = VertexTexCoord; vec2 position = vec2(0.0, 0.0); vec4 p = WorldMatrix * vec4(VertexPosition.x, VertexPosition.y, 0.0, 1.0); float x = p[0]; float y = p[1]; for(int i = 0; i < 4; i++) {float weight = VertexWeights[i]; int matrixIndex = int(VertexBoneIndices[i])*2; vec3 m = BoneMatrices[matrixIndex]; vec3 n = BoneMatrices[matrixIndex+1]; position[0] += (m[0] * x + m[2] * y + n[1]) * weight; position[1] += (m[1] * x + n[0] * y + n[2]) * weight; } vec4 pos = ViewMatrix * vec4(position.x, position.y, 0.0, 1.0); gl_Position = ProjectionMatrix * vec4(pos.xyz, 1.0); }"
		};
		let _DefaultShaders = _MakeCustomShader();
		_CurrentShaderGroup = _DefaultShaders;

		function _UseCustomShader(shaderGroup)
		{
			_CurrentShaderGroup = shaderGroup || _DefaultShaders;
		}

		function _UseSecondTexture(tex)
		{
			if(_SecondTexture !== tex)
			{
				_GL.activeTexture(_GL.TEXTURE1);
				_GL.bindTexture(_GL.TEXTURE_2D, tex);
				_SecondTexture = tex;
			}
		}

		function _MakeCustomShader(name, fragment)
		{
			if(fragment)
			{
				name += ".fs";
				_ShaderSources[name] = fragment;
			}
			let _RegularShader = _InitializeShader(
			{
				name: name || "Textured",
				vertex: "Regular.vs",
				fragment: name || "Textured.fs",

				attributes:
				{
					VertexPosition:"VertexPosition",
					VertexTexCoord:"VertexTexCoord"
				},

				uniforms:
				{
					ProjectionMatrix: "ProjectionMatrix",
					ViewMatrix: "ViewMatrix",
					WorldMatrix: "WorldMatrix",
					TextureSampler: "TextureSampler",
					SecondTextureSampler: "SecondTextureSampler",
					Color: "Color"
				}
			});

			let _DeformingShader = _InitializeShader(
			{
				name: name || "Deforming",
				vertex: "Deforming.vs",
				fragment: name || "Textured.fs",

				attributes:
				{
					VertexPosition:"VertexPosition",
					VertexTexCoord:"VertexTexCoord",
					VertexBoneIndices:"VertexBoneIndices",
					VertexWeights:"VertexWeights"
				},

				uniforms:
				{
					ProjectionMatrix: "ProjectionMatrix",
					ViewMatrix: "ViewMatrix",
					WorldMatrix: "WorldMatrix",
					TextureSampler: "TextureSampler",
					SecondTextureSampler: "SecondTextureSampler",
					Color: "Color",
					BoneMatrices: "BoneMatrices"
				}
			});

			return {
				regular:_RegularShader,
				deforming:_DeformingShader
			};
		}

		_GL.useProgram(null);

		function _SetView(view)
		{
			if(_ViewTransform[0] === view[0] &&
				_ViewTransform[1] === view[1] && 
				_ViewTransform[4] === view[2] &&
				_ViewTransform[5] === view[3] &&
				_ViewTransform[12] === view[4] &&
				_ViewTransform[13] === view[5])
			{
				return;
			}

			_ViewDirty = true;
			_ViewTransform[0] = view[0];
			_ViewTransform[1] = view[1];
			_ViewTransform[4] = view[2];
			_ViewTransform[5] = view[3];
			_ViewTransform[12] = view[4];
			_ViewTransform[13] = view[5];
		}

		//let _LastBufferState = 
		let _LastBaseBuffer = null;
		let _LastPositionBuffer = null;
		let _LastUVBuffer = null;
		let _LastUVOffset = null;
		let _LastTexture = null;
		let _LastShader = null;

		function _InvalidateCache()
		{
			_LastBaseBuffer = null;
			_LastPositionBuffer = null;
			_LastUVBuffer = null;
			_LastUVOffset = null;
			_LastTexture = null;
			_LastShader = null;
		}

		function _Prep(tex, color, opacity, world, base, bones, position, uv, uvOffset)
		{
			let shader = bones ? _CurrentShaderGroup.deforming : _CurrentShaderGroup.regular;
			let atts = shader.attributes;

			let changedShader;
			if(shader.program !== _LastShader)
			{
				changedShader = true;
				_GL.useProgram(shader.program);
				_LastShader = shader.program;
			}
			else
			{
				changedShader = false;
			}

			// If any buffer changed, rebind attributes.
			if(changedShader || _LastBaseBuffer !== base || _LastPositionBuffer !== position || _LastUVBuffer !== uv)
			{
				_LastBaseBuffer = base;
				_LastPositionBuffer = position;
				_LastUVBuffer = uv;
				_LastUVOffset = uvOffset;
				
				// We use the base buffer if: 
				//	* We're deforming with bones
				// 		- base buffer contains the Bone Indices and Weights so it's necessary no matter what
				// 	* There's no custom position buffer
				//		- means we're not doing an animated vertex deform (user manually moved vertices).
				// 	* There's no custom uv buffer
				// 		- means we're not animating texture coordinates (usually done by the image sequencer)
				let useBaseBuffer = bones || !position || !uv;
				if(useBaseBuffer)
				{
					_GL.bindBuffer(_GL.ARRAY_BUFFER, base.id);
					let bufferStride = bones ? 48 : 16;
					if(!position)
					{
						// position comes from base buffer.
						let index = atts.VertexPosition;
						_EnableAttribute(index);
						_GL.vertexAttribPointer(index, 2, _GL.FLOAT, false, bufferStride, 0);
					}
					if(!uv)
					{
						// uv comes from base buffer.
						let index = atts.VertexTexCoord;
						_EnableAttribute(index);
						_GL.vertexAttribPointer(index, 2, _GL.FLOAT, false, bufferStride, 8);
					}
					if(bones)
					{
						let index = atts.VertexBoneIndices;
						_EnableAttribute(index);
						_GL.vertexAttribPointer(index, 4, _GL.FLOAT, false, 48, 16);

						index = atts.VertexWeights;
						_EnableAttribute(index);
						_GL.vertexAttribPointer(index, 4, _GL.FLOAT, false, 48, 32);
					}
				}

				if(position)
				{
					// Using a custom position buffer.
					_GL.bindBuffer(_GL.ARRAY_BUFFER, position.id);
					let index = atts.VertexPosition;
					_EnableAttribute(index);
					_GL.vertexAttribPointer(index, 2, _GL.FLOAT, false, 8, 0);
				}

				if(uv)
				{
					// Using a custom uv buffer.
					_GL.bindBuffer(_GL.ARRAY_BUFFER, uv.id);
					let index = atts.VertexTexCoord;
					_EnableAttribute(index);
					_GL.vertexAttribPointer(index, 2, _GL.FLOAT, false, 8, uvOffset);
				}

				// Disable unwanted attributes.
				for(let i = 0; i < _MaxAttributes; i++)
				{
					if(_WantedAttributes[i] !== _EnabledAttributes[i])
					{
						_GL.disableVertexAttribArray(i);
						_EnabledAttributes[i] = 0;
					}
					_WantedAttributes[i] = 0;
				}
			}
			else if(uv && _LastUVOffset !== uvOffset)
			{
				// Buffer didn't change but uvOffset did.
				_LastUVOffset = uvOffset;
				_GL.bindBuffer(_GL.ARRAY_BUFFER, uv.id);
				_GL.vertexAttribPointer(atts.VertexTexCoord, 2, _GL.FLOAT, false, 8, uvOffset);
			}

			// Ok buffers are good, do uniforms.
			let uniforms = shader.uniforms;
			if(changedShader || _ViewDirty)
			{
				_GL.uniformMatrix4fv(uniforms.ViewMatrix, false, _ViewTransform);
				_GL.uniformMatrix4fv(uniforms.ProjectionMatrix, false, _Projection);
				_ViewDirty = false;
			}

			_ColorBuffer[0] = color[0] * opacity;
			_ColorBuffer[1] = color[1] * opacity;
			_ColorBuffer[2] = color[2] * opacity;
			_ColorBuffer[3] = color[3] * opacity;
			_GL.uniform4fv(uniforms.Color, _ColorBuffer);

			_Transform[0] = world[0];
			_Transform[1] = world[1];
			_Transform[4] = world[2];
			_Transform[5] = world[3];
			_Transform[12] = world[4];
			_Transform[13] = world[5];
			_GL.uniformMatrix4fv(uniforms.WorldMatrix, false, _Transform);

			if(bones)
			{
				_GL.uniform3fv(uniforms.BoneMatrices, bones);
			}

			if(_LastTexture !== tex)
			{
				_GL.activeTexture(_GL.TEXTURE0);
				_GL.bindTexture(_GL.TEXTURE_2D, tex);
				_LastTexture = tex;
			}
		}

		function _Draw(indexBuffer)
		{
			let boundBuffer = _GL.getParameter(_GL.ELEMENT_ARRAY_BUFFER_BINDING);
			if(boundBuffer !== indexBuffer.id)
			{
				_GL.bindBuffer(_GL.ELEMENT_ARRAY_BUFFER, indexBuffer.id);
			}
			_GL.drawElements(_GL.TRIANGLES, indexBuffer.size, _GL.UNSIGNED_SHORT, 0);
		}

		function _Dispose()
		{
			_GL.deleteProgram(_DefaultShaders.regular.program);
			_GL.deleteProgram(_DefaultShaders.deforming.program);

			for(let [key, shader] of _CompiledShaders)
			{
				_GL.deleteShader(shader);
			}
		}

		this.loadTexture = _LoadTexture;
		this.deleteTexture = _DeleteTexture;
		this.setSize = _SetSize;
		this.disableBlending = _DisableBlending;
		this.enableBlending = _EnableBlending;
		this.enablePremultipliedBlending = _EnablePremultipliedBlending;
		this.enableAdditiveBlending = _EnableAdditiveBlending;
		this.enableScreenBlending = _EnableScreenBlending;
		this.enableMultiplyBlending = _EnableMultiplyBlending;
		this.enableMod2xBlending = _EnableMod2xBlending;
		this.clear = _Clear;
		this.makeVertexBuffer = _MakeVertexBuffer;
		this.makeIndexBuffer = _MakeIndexBuffer;
		this.setView = _SetView;
		this.dispose = _Dispose;
		this.prep = _Prep;
		this.draw = _Draw;
		this.makeCustomShader = _MakeCustomShader;
		this.useCustomShader = _UseCustomShader;
		this.holdBlendMode = _SetHoldBlendMode;
		this.releaseBlendMode = _SetReleaseBlendMode;
		this.useSecondTexture = _UseSecondTexture;

		this.overrideProjection = function(projection)
		{
			_Projection = projection;
			_ViewDirty = true;
		};

		this.invalidateCache = _InvalidateCache;
		
		this.overrideView = function(view)
		{
			_ViewTransform = view;
			_ViewDirty = true;
		};

		this.__defineGetter__("projection", function()
		{
			return _Projection;
		});

		this.__defineGetter__("viewportWidth", function()
		{
			return _ViewportWidth;
		});

		this.__defineGetter__("viewportHeight", function()
		{
			return _ViewportHeight;
		});
	}
}