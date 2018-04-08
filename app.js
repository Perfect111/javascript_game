var Utils;
(function (Utils) {
    var AssetLoader = (function () {
        function AssetLoader(_lang, _aFileData, _ctx, _canvasWidth, _canvasHeight, _showBar) {
            if (typeof _showBar === "undefined") { _showBar = true; }
            this.oAssetData = {
            };
            this.assetsLoaded = 0;
            this.textData = {
            };
            this.totalAssets = _aFileData.length;
            this.ctx = _ctx;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
            this.showBar = _showBar;
            this.topLeftX = this.canvasWidth / 2 - _canvasWidth / 4;
            this.topLeftY = 650;
            if(this.showBar) {
                ctx.strokeStyle = "#222D6F";
                ctx.lineWidth = 2;
                ctx.moveTo(this.topLeftX, this.topLeftY);
                ctx.lineTo(this.topLeftX + _canvasWidth / 2, this.topLeftY + 0);
                ctx.lineTo(this.topLeftX + _canvasWidth / 2, this.topLeftY + 40);
                ctx.lineTo(this.topLeftX + 0, this.topLeftY + 40);
                ctx.lineTo(this.topLeftX + 0, this.topLeftY + 0);
                ctx.stroke();
            }
            for(var i = 0; i < _aFileData.length; i++) {
                if(_aFileData[i].file.indexOf(".json") != -1) {
                    this.loadJSON(_aFileData[i]);
                } else {
                    this.loadImage(_aFileData[i]);
                }
            }
        }
        AssetLoader.prototype.loadExtraAssets = function (_callback, _aFileData) {
            this.showBar = false;
            this.totalAssets = _aFileData.length;
            this.assetsLoaded = 0;
            this.loadedCallback = _callback;
            for(var i = 0; i < _aFileData.length; i++) {
                if(_aFileData[i].file.indexOf(".json") != -1) {
                    this.loadJSON(_aFileData[i]);
                } else {
                    this.loadImage(_aFileData[i]);
                }
            }
        };
        AssetLoader.prototype.displayNumbers = function () {
            ctx.fillStyle = "#F68D00";
            ctx.beginPath();
            ctx.rect(canvas.width / 2 - 75, this.topLeftY + 50, 150, 42);
            ctx.closePath();
            ctx.fill();
            ctx.textAlign = "center";
            ctx.font = "bold 40px arial";
            ctx.fillStyle = "#222D6F";
            ctx.fillText(Math.round((this.assetsLoaded / this.totalAssets) * 100) + "%", canvas.width / 2, this.topLeftY + 85);
        };
        AssetLoader.prototype.loadJSON = function (_oData) {
            var _this = this;
            var xobj = new XMLHttpRequest();
            xobj.open('GET', _oData.file, true);
            xobj.onreadystatechange = function () {
                if(xobj.readyState == 4 && xobj.status == 200) {
                    _this.textData[_oData.id] = JSON.parse(xobj.responseText);
                    ++_this.assetsLoaded;
                    if(_this.showBar) {
                        ctx.fillStyle = "#FFFFFF";
                        ctx.fillRect(_this.topLeftX + 2, _this.topLeftY + 2, ((_this.canvasWidth / 2 - 4) / _this.totalAssets) * _this.assetsLoaded, 36);
                        _this.displayNumbers();
                    }
                    _this.checkLoadComplete();
                }
            };
            xobj.send(null);
        };
        AssetLoader.prototype.loadImage = function (_oData) {
            var _this = this;
            var img = new Image();
            img.onload = function () {
                _this.oAssetData[_oData.id] = {
                };
                _this.oAssetData[_oData.id].img = img;
                _this.oAssetData[_oData.id].oData = {
                };
                var aSpriteSize = _this.getSpriteSize(_oData.file);
                if(aSpriteSize[0] != 0) {
                    _this.oAssetData[_oData.id].oData.spriteWidth = aSpriteSize[0];
                    _this.oAssetData[_oData.id].oData.spriteHeight = aSpriteSize[1];
                } else {
                    _this.oAssetData[_oData.id].oData.spriteWidth = _this.oAssetData[_oData.id].img.width;
                    _this.oAssetData[_oData.id].oData.spriteHeight = _this.oAssetData[_oData.id].img.height;
                }
                if(_oData.oAnims) {
                    _this.oAssetData[_oData.id].oData.oAnims = _oData.oAnims;
                }
                if(_oData.oAtlasData) {
                    _this.oAssetData[_oData.id].oData.oAtlasData = _oData.oAtlasData;
                } else {
                    _this.oAssetData[_oData.id].oData.oAtlasData = {
                        none: {
                            x: 0,
                            y: 0,
                            width: _this.oAssetData[_oData.id].oData.spriteWidth,
                            height: _this.oAssetData[_oData.id].oData.spriteHeight
                        }
                    };
                }
                ++_this.assetsLoaded;
                if(_this.showBar) {
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(_this.topLeftX + 2, _this.topLeftY + 2, ((_this.canvasWidth / 2 - 4) / _this.totalAssets) * _this.assetsLoaded, 36);
                    _this.displayNumbers();
                }
                _this.checkLoadComplete();
            };
            img.src = _oData.file;
        };
        AssetLoader.prototype.getSpriteSize = function (_file) {
            var aNew = new Array();
            var sizeY = "";
            var sizeX = "";
            var stage = 0;
            var inc = _file.lastIndexOf(".");
            var canCont = true;
            while(canCont) {
                inc--;
                if(stage == 0 && this.isNumber(_file.charAt(inc))) {
                    sizeY = _file.charAt(inc) + sizeY;
                } else if(stage == 0 && sizeY.length > 0 && _file.charAt(inc) == "x") {
                    inc--;
                    stage = 1;
                    sizeX = _file.charAt(inc) + sizeX;
                } else if(stage == 1 && this.isNumber(_file.charAt(inc))) {
                    sizeX = _file.charAt(inc) + sizeX;
                } else if(stage == 1 && sizeX.length > 0 && _file.charAt(inc) == "_") {
                    canCont = false;
                    aNew = [
                        parseInt(sizeX), 
                        parseInt(sizeY)
                    ];
                } else {
                    canCont = false;
                    aNew = [
                        0, 
                        0
                    ];
                }
            }
            return aNew;
        };
        AssetLoader.prototype.isNumber = function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        AssetLoader.prototype.checkLoadComplete = function () {
            if(this.assetsLoaded == this.totalAssets) {
                this.loadedCallback();
            }
        };
        AssetLoader.prototype.onReady = function (_func) {
            this.loadedCallback = _func;
        };
        AssetLoader.prototype.getImg = function (_id) {
            return this.oAssetData[_id].img;
        };
        AssetLoader.prototype.getData = function (_id) {
            return this.oAssetData[_id];
        };
        return AssetLoader;
    })();
    Utils.AssetLoader = AssetLoader;    
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var AnimSprite = (function () {
        function AnimSprite(_oImgData, _fps, _radius, _animId) {
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.radius = 10;
            this.removeMe = false;
            this.frameInc = 0;
            this.animType = "loop";
            this.offsetX = 0;
            this.offsetY = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.alpha = 1;
            this.oImgData = _oImgData;
            this.oAnims = this.oImgData.oData.oAnims;
            this.fps = _fps;
            this.radius = _radius;
            this.animId = _animId;
            this.centreX = Math.round(this.oImgData.oData.spriteWidth / 2);
            this.centreY = Math.round(this.oImgData.oData.spriteHeight / 2);
        }
        AnimSprite.prototype.updateAnimation = function (_delta) {
            this.frameInc += this.fps * _delta;
        };
        AnimSprite.prototype.changeImgData = function (_newImgData, _animId) {
            this.oImgData = _newImgData;
            this.oAnims = this.oImgData.oData.oAnims;
            this.animId = _animId;
            this.centreX = Math.round(this.oImgData.oData.spriteWidth / 2);
            this.centreY = Math.round(this.oImgData.oData.spriteHeight / 2);
            this.resetAnim();
        };
        AnimSprite.prototype.resetAnim = function () {
            this.frameInc = 0;
        };
        AnimSprite.prototype.setFrame = function (_frameNum) {
            this.fixedFrame = _frameNum;
        };
        AnimSprite.prototype.setAnimType = function (_type, _animId, _reset) {
            if (typeof _reset === "undefined") { _reset = true; }
            this.animId = _animId;
            this.animType = _type;
            if(_reset) {
                this.resetAnim();
            }
            switch(_type) {
                case "loop":
                    break;
                case "once":
                    this.maxIdx = this.oAnims[this.animId].length - 1;
                    break;
            }
        };
        AnimSprite.prototype.render = function (_ctx) {
            _ctx.save();
            _ctx.translate(this.x, this.y);
            _ctx.rotate(this.rotation);
            _ctx.scale(this.scaleX, this.scaleY);
            _ctx.globalAlpha = this.alpha;
            if(this.animId != null) {
                var max = this.oAnims[this.animId].length;
                var idx = Math.floor(this.frameInc);
                this.curFrame = this.oAnims[this.animId][idx % max];
                var imgX = (this.curFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.curFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                if(this.animType == "once") {
                    if(idx > this.maxIdx) {
                        this.fixedFrame = this.oAnims[this.animId][max - 1];
                        this.animId = null;
                        if(this.animEndedFunc != null) {
                            this.animEndedFunc();
                        }
                        var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                        var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                    }
                }
            } else {
                var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
            }
            _ctx.drawImage(this.oImgData.img, imgX, imgY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight, -this.centreX + this.offsetX, -this.centreY + this.offsetY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight);
            _ctx.restore();
        };
        AnimSprite.prototype.renderSimple = function (_ctx) {
            if(this.animId != null) {
                var max = this.oAnims[this.animId].length;
                var idx = Math.floor(this.frameInc);
                this.curFrame = this.oAnims[this.animId][idx % max];
                var imgX = (this.curFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.curFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                if(this.animType == "once") {
                    if(idx > this.maxIdx) {
                        this.fixedFrame = this.oAnims[this.animId][max - 1];
                        this.animId = null;
                        if(this.animEndedFunc != null) {
                            this.animEndedFunc();
                        }
                        var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                        var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
                    }
                }
            } else {
                var imgX = (this.fixedFrame * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
                var imgY = Math.floor(this.fixedFrame / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
            }
            _ctx.drawImage(this.oImgData.img, imgX, imgY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight, this.x - (this.centreX - this.offsetX) * this.scaleX, this.y - (this.centreY - this.offsetY) * this.scaleY, this.oImgData.oData.spriteWidth * this.scaleX, this.oImgData.oData.spriteHeight * this.scaleY);
        };
        return AnimSprite;
    })();
    Utils.AnimSprite = AnimSprite;    
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var BasicSprite = (function () {
        function BasicSprite(_oImgData, _radius, _frame) {
            if (typeof _frame === "undefined") { _frame = 0; }
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.radius = 10;
            this.removeMe = false;
            this.offsetX = 0;
            this.offsetY = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.oImgData = _oImgData;
            this.radius = _radius;
            this.setFrame(_frame);
        }
        BasicSprite.prototype.setFrame = function (_frameNum) {
            this.frameNum = _frameNum;
        };
        BasicSprite.prototype.render = function (_ctx) {
            _ctx.save();
            _ctx.translate(this.x, this.y);
            _ctx.rotate(this.rotation);
            _ctx.scale(this.scaleX, this.scaleY);
            var imgX = (this.frameNum * this.oImgData.oData.spriteWidth) % this.oImgData.img.width;
            var imgY = Math.floor(this.frameNum / (this.oImgData.img.width / this.oImgData.oData.spriteWidth)) * this.oImgData.oData.spriteHeight;
            _ctx.drawImage(this.oImgData.img, imgX, imgY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight, -this.oImgData.oData.spriteWidth / 2 + this.offsetX, -this.oImgData.oData.spriteHeight / 2 + this.offsetY, this.oImgData.oData.spriteWidth, this.oImgData.oData.spriteHeight);
            _ctx.restore();
        };
        return BasicSprite;
    })();
    Utils.BasicSprite = BasicSprite;    
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var UserInput = (function () {
        function UserInput(_canvas, _isBugBrowser) {
            var _this = this;
            this.canvasX = 0;
            this.canvasY = 0;
            this.canvasScaleX = 1;
            this.canvasScaleY = 1;
            this.prevHitTime = 0;
            this.pauseIsOn = false;
            this.isDown = false;
            this.isBugBrowser = _isBugBrowser;
            this.keyDownEvtFunc = function (e) {
                _this.keyDown(e);
            };
            this.keyUpEvtFunc = function (e) {
                _this.keyUp(e);
            };
            _canvas.addEventListener("touchstart", function (e) {
                for(var i = 0; i < e.changedTouches.length; i++) {
                    _this.hitDown(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier);
                }
            }, false);
            _canvas.addEventListener("touchend", function (e) {
                for(var i = 0; i < e.changedTouches.length; i++) {
                    _this.hitUp(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier);
                }
            }, false);
            _canvas.addEventListener("touchmove", function (e) {
                for(var i = 0; i < e.changedTouches.length; i++) {
                    _this.move(e, e.changedTouches[i].pageX, e.changedTouches[i].pageY, e.changedTouches[i].identifier, true);
                }
            }, false);
            _canvas.addEventListener("mousedown", function (e) {
                _this.isDown = true;
                _this.hitDown(e, e.pageX, e.pageY, 1);
            }, false);
            _canvas.addEventListener("mouseup", function (e) {
                _this.isDown = false;
                _this.hitUp(e, e.pageX, e.pageY, 1);
            }, false);
            _canvas.addEventListener("mousemove", function (e) {
                _this.move(e, e.pageX, e.pageY, 1, _this.isDown);
            }, false);
            this.aHitAreas = new Array();
            this.aKeys = new Array();
        }
        UserInput.prototype.setCanvas = function (_canvasX, _canvasY, _canvasScaleX, _canvasScaleY) {
            this.canvasX = _canvasX;
            this.canvasY = _canvasY;
            this.canvasScaleX = _canvasScaleX;
            this.canvasScaleY = _canvasScaleY;
        };
        UserInput.prototype.hitDown = function (e, _posX, _posY, _identifer) {
            e.preventDefault();
            e.stopPropagation();
            if(this.pauseIsOn) {
                return;
            }
            var curHitTime = new Date().getTime();
            _posX = (_posX - this.canvasX) * this.canvasScaleX;
            _posY = (_posY - this.canvasY) * this.canvasScaleY;
            for(var i = 0; i < this.aHitAreas.length; i++) {
                if(this.aHitAreas[i].rect) {
                    if(_posX > this.aHitAreas[i].area[0] && _posY > this.aHitAreas[i].area[1] && _posX < this.aHitAreas[i].area[2] && _posY < this.aHitAreas[i].area[3]) {
                        this.aHitAreas[i].aTouchIdentifiers.push(_identifer);
                        this.aHitAreas[i].oData.hasLeft = false;
                        if(!this.aHitAreas[i].oData.isDown) {
                            this.aHitAreas[i].oData.isDown = true;
                            this.aHitAreas[i].oData.x = _posX;
                            this.aHitAreas[i].oData.y = _posY;
                            if((curHitTime - this.prevHitTime < 500 && (gameState != "game" || this.aHitAreas[i].id == "pause")) && isBugBrowser) {
                                return;
                            }
                            this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                        }
                        break;
                    }
                } else {
                }
            }
            this.prevHitTime = curHitTime;
        };
        UserInput.prototype.hitUp = function (e, _posX, _posY, _identifer) {
            if(!ios9FirstTouch) {
                playSound("silence");
                ios9FirstTouch = true;
            }
            if(this.pauseIsOn) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            _posX = (_posX - this.canvasX) * this.canvasScaleX;
            _posY = (_posY - this.canvasY) * this.canvasScaleY;
            for(var i = 0; i < this.aHitAreas.length; i++) {
                if(this.aHitAreas[i].rect) {
                    if(_posX > this.aHitAreas[i].area[0] && _posY > this.aHitAreas[i].area[1] && _posX < this.aHitAreas[i].area[2] && _posY < this.aHitAreas[i].area[3]) {
                        for(var j = 0; j < this.aHitAreas[i].aTouchIdentifiers.length; j++) {
                            if(this.aHitAreas[i].aTouchIdentifiers[j] == _identifer) {
                                this.aHitAreas[i].aTouchIdentifiers.splice(j, 1);
                                j -= 1;
                            }
                        }
                        if(this.aHitAreas[i].aTouchIdentifiers.length == 0) {
                            this.aHitAreas[i].oData.isDown = false;
                            if(this.aHitAreas[i].oData.multiTouch) {
                                this.aHitAreas[i].oData.x = _posX;
                                this.aHitAreas[i].oData.y = _posY;
                                this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                            }
                        }
                        break;
                    }
                } else {
                }
            }
        };
        UserInput.prototype.move = function (e, _posX, _posY, _identifer, _isDown) {
            if(this.pauseIsOn) {
                return;
            }
            if(_isDown) {
                _posX = (_posX - this.canvasX) * this.canvasScaleX;
                _posY = (_posY - this.canvasY) * this.canvasScaleY;
                for(var i = 0; i < this.aHitAreas.length; i++) {
                    if(this.aHitAreas[i].rect) {
                        if(_posX > this.aHitAreas[i].area[0] && _posY > this.aHitAreas[i].area[1] && _posX < this.aHitAreas[i].area[2] && _posY < this.aHitAreas[i].area[3]) {
                            this.aHitAreas[i].oData.hasLeft = false;
                            if(!this.aHitAreas[i].oData.isDown) {
                                this.aHitAreas[i].oData.isDown = true;
                                this.aHitAreas[i].oData.x = _posX;
                                this.aHitAreas[i].oData.y = _posY;
                                this.aHitAreas[i].aTouchIdentifiers.push(_identifer);
                                if(this.aHitAreas[i].oData.multiTouch) {
                                    this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                                }
                            }
                            if(this.aHitAreas[i] && this.aHitAreas[i].oData.isDraggable) {
                                this.aHitAreas[i].oData.isBeingDragged = true;
                                this.aHitAreas[i].oData.x = _posX;
                                this.aHitAreas[i].oData.y = _posY;
                                this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                                this.aHitAreas[i].oData.isBeingDragged = false;
                            }
                        } else if(this.aHitAreas[i].oData.isDown && !this.aHitAreas[i].oData.hasLeft) {
                            for(var j = 0; j < this.aHitAreas[i].aTouchIdentifiers.length; j++) {
                                if(this.aHitAreas[i].aTouchIdentifiers[j] == _identifer) {
                                    this.aHitAreas[i].aTouchIdentifiers.splice(j, 1);
                                    j -= 1;
                                }
                            }
                            if(this.aHitAreas[i].aTouchIdentifiers.length == 0) {
                                this.aHitAreas[i].oData.hasLeft = true;
                                if(!this.aHitAreas[i].oData.isBeingDragged) {
                                    this.aHitAreas[i].oData.isDown = false;
                                }
                                if(this.aHitAreas[i].oData.multiTouch) {
                                    this.aHitAreas[i].callback(this.aHitAreas[i].id, this.aHitAreas[i].oData);
                                }
                            }
                        }
                    }
                }
            }
        };
        UserInput.prototype.keyDown = function (e) {
            for(var i = 0; i < this.aKeys.length; i++) {
                if(e.keyCode == this.aKeys[i].keyCode) {
                    e.preventDefault();
                    this.aKeys[i].oData.isDown = true;
                    this.aKeys[i].callback(this.aKeys[i].id, this.aKeys[i].oData);
                }
            }
        };
        UserInput.prototype.keyUp = function (e) {
            for(var i = 0; i < this.aKeys.length; i++) {
                if(e.keyCode == this.aKeys[i].keyCode) {
                    e.preventDefault();
                    this.aKeys[i].oData.isDown = false;
                    this.aKeys[i].callback(this.aKeys[i].id, this.aKeys[i].oData);
                }
            }
        };
        UserInput.prototype.checkKeyFocus = function () {
            window.focus();
            if(this.aKeys.length > 0) {
                window.removeEventListener('keydown', this.keyDownEvtFunc, false);
                window.removeEventListener('keyup', this.keyUpEvtFunc, false);
                window.addEventListener('keydown', this.keyDownEvtFunc, false);
                window.addEventListener('keyup', this.keyUpEvtFunc, false);
            }
        };
        UserInput.prototype.addKey = function (_id, _callback, _oCallbackData, _keyCode) {
            if(_oCallbackData == null) {
                _oCallbackData = new Object();
            }
            this.aKeys.push({
                id: _id,
                callback: _callback,
                oData: _oCallbackData,
                keyCode: _keyCode
            });
            this.checkKeyFocus();
        };
        UserInput.prototype.removeKey = function (_id) {
            for(var i = 0; i < this.aKeys.length; i++) {
                if(this.aKeys[i].id == _id) {
                    this.aKeys.splice(i, 1);
                    i -= 1;
                }
            }
        };
        UserInput.prototype.addHitArea = function (_id, _callback, _oCallbackData, _type, _oAreaData, _isUnique) {
            if (typeof _isUnique === "undefined") { _isUnique = false; }
            if(_oCallbackData == null) {
                _oCallbackData = new Object();
            }
            if(_isUnique) {
                this.removeHitArea(_id);
            }
            if(!_oAreaData.scale) {
                _oAreaData.scale = 1;
            }
            var aTouchIdentifiers = new Array();
            switch(_type) {
                case "image":
                    var aRect;
                    aRect = new Array(_oAreaData.aPos[0] - (_oAreaData.oImgData.oData.oAtlasData[_oAreaData.id].width / 2) * _oAreaData.scale, _oAreaData.aPos[1] - (_oAreaData.oImgData.oData.oAtlasData[_oAreaData.id].height / 2) * _oAreaData.scale, _oAreaData.aPos[0] + (_oAreaData.oImgData.oData.oAtlasData[_oAreaData.id].width / 2) * _oAreaData.scale, _oAreaData.aPos[1] + (_oAreaData.oImgData.oData.oAtlasData[_oAreaData.id].height / 2) * _oAreaData.scale);
                    this.aHitAreas.push({
                        id: _id,
                        aTouchIdentifiers: aTouchIdentifiers,
                        callback: _callback,
                        oData: _oCallbackData,
                        rect: true,
                        area: aRect
                    });
                    break;
                case "rect":
                    this.aHitAreas.push({
                        id: _id,
                        aTouchIdentifiers: aTouchIdentifiers,
                        callback: _callback,
                        oData: _oCallbackData,
                        rect: true,
                        area: _oAreaData.aRect
                    });
                    break;
            }
        };
        UserInput.prototype.removeHitArea = function (_id) {
            for(var i = 0; i < this.aHitAreas.length; i++) {
                if(this.aHitAreas[i].id == _id) {
                    this.aHitAreas.splice(i, 1);
                    i -= 1;
                }
            }
        };
        UserInput.prototype.resetAll = function () {
            for(var i = 0; i < this.aHitAreas.length; i++) {
                this.aHitAreas[i].oData.isDown = false;
                this.aHitAreas[i].oData.isBeingDragged = false;
                this.aHitAreas[i].aTouchIdentifiers = new Array();
            }
            this.isDown = false;
        };
        return UserInput;
    })();
    Utils.UserInput = UserInput;    
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var FpsMeter = (function () {
        function FpsMeter(_canvasHeight) {
            this.updateFreq = 10;
            this.updateInc = 0;
            this.frameAverage = 0;
            this.display = 1;
            this.log = "";
            this.render = function (_ctx) {
                this.frameAverage += this.delta / this.updateFreq;
                if(++this.updateInc >= this.updateFreq) {
                    this.updateInc = 0;
                    this.display = this.frameAverage;
                    this.frameAverage = 0;
                }
                _ctx.textAlign = "left";
                ctx.font = "10px Helvetica";
                _ctx.fillStyle = "#333333";
                _ctx.beginPath();
                _ctx.rect(0, this.canvasHeight - 15, 40, 15);
                _ctx.closePath();
                _ctx.fill();
                _ctx.fillStyle = "#ffffff";
                _ctx.fillText(Math.round(1000 / (this.display * 1000)) + " fps " + this.log, 5, this.canvasHeight - 5);
            };
            this.canvasHeight = _canvasHeight;
        }
        FpsMeter.prototype.update = function (_delta) {
            this.delta = _delta;
        };
        return FpsMeter;
    })();
    Utils.FpsMeter = FpsMeter;    
})(Utils || (Utils = {}));
var Elements;
(function (Elements) {
    var Background = (function () {
        function Background() {
            this.x = 0;
            this.y = 0;
            this.targY = 0;
            this.incY = 0;
            this.renderState = null;
            this.oImgData = assetLib.getData("background");
        }
        Background.prototype.update = function (_delta) {
            switch(this.renderState) {
                case "menuScroll":
                    this.incY += 5 * _delta;
                    this.x = (this.x - (Math.sin(this.incY / 10) * 50) * _delta);
                    this.y = (this.y - 50 * _delta);
                    break;
            }
        };
        Background.prototype.render = function () {
            switch(this.renderState) {
                case "menuScroll":
                    this.x = this.x % canvas.width;
                    this.y = this.y % canvas.height;
                    if(this.x < 0) {
                        this.x += canvas.width;
                    }
                    if(this.y < 0) {
                        this.y += canvas.height;
                    }
                    ctx.drawImage(this.oImgData.img, this.x, this.y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                    break;
                case "none":
                    ctx.drawImage(this.oImgData.img, 0, 0);
                    break;
            }
        };
        return Background;
    })();
    Elements.Background = Background;    
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Splash = (function () {
        function Splash(_oSplashScreenImgData, _canvasWidth, _canvasHeight) {
            this.inc = 0;
            this.oSplashScreenImgData = _oSplashScreenImgData;
            this.canvasWidth = _canvasWidth;
            this.canvasHeight = _canvasHeight;
            this.posY = -this.canvasHeight;
            TweenLite.to(this, .5, {
                posY: 0
            });
        }
        Splash.prototype.render = function () {
            this.inc += 5 * delta;
            ctx.drawImage(this.oSplashScreenImgData.img, 0, 0 - this.posY);
        };
        return Splash;
    })();
    Elements.Splash = Splash;    
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Panel = (function () {
        function Panel(_panelType, _aButs) {
            this.timer = .3;
            this.endTime = 0;
            this.posY = 0;
            this.numberSpace = 28;
            this.endNumberSpace = 38;
            this.incY = 0;
            this.oMainBg1ImgData = assetLib.getData("mainBg1");
            this.oTitleBgImgData = assetLib.getData("titleBg");
            this.oBlankBgImgData = assetLib.getData("blankBg");
            this.oNumbersImgData = assetLib.getData("numbers");
            this.oUiElementsImgData = assetLib.getData("uiElements");
            this.oUiButsImgData = assetLib.getData("uiElements");
            this.oEndNumbersImgData = assetLib.getData("endNumbers");
            this.oPauseBgImgData = assetLib.getData("pauseBg");
            this.panelType = _panelType;
            this.aButs = _aButs;
        }
        Panel.prototype.update = function () {
            this.incY += 10 * delta;
        };
        Panel.prototype.startTween1 = function () {
            this.posY = 550;
            TweenLite.to(this, .8, {
                posY: 0,
                ease: "Back.easeOut"
            });
        };
        Panel.prototype.startTween2 = function () {
            this.posY = 550;
            TweenLite.to(this, .3, {
                posY: 0,
                ease: "Quad.easeOut"
            });
        };
        Panel.prototype.render = function (_butsOnTop) {
            if (typeof _butsOnTop === "undefined") { _butsOnTop = true; }
            if(!_butsOnTop) {
                this.addButs(ctx);
            }
            switch(this.panelType) {
                case "start":
                    ctx.drawImage(this.oTitleBgImgData.img, 0, 0, this.oTitleBgImgData.oData.spriteWidth, this.oTitleBgImgData.oData.spriteHeight, 0, 0, this.oTitleBgImgData.oData.spriteWidth, this.oTitleBgImgData.oData.spriteHeight);
                    break;
                case "game":
                    ctx.drawImage(this.oMainBg1ImgData.img, 0, 0, this.oMainBg1ImgData.oData.spriteWidth, this.oMainBg1ImgData.oData.spriteHeight, 0, 0, this.oMainBg1ImgData.oData.spriteWidth, this.oMainBg1ImgData.oData.spriteHeight);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.clock].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.clock].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.clock].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.clock].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, 135 - bWidth / 2, 82 - bHeight / 2, bWidth, bHeight);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.questionBg].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.questionBg].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.questionBg].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.questionBg].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 350 - bHeight / 2, bWidth, bHeight);
                    var num = gameLength - Math.round(gameTime);
                    var numScale = .8;
                    if(num.toString().length < 3) {
                        numScale = 1.1;
                    }
                    for(var i = 0; i < num.toString().length; i++) {
                        var id = parseFloat(num.toString().charAt(i));
                        var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                        var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                        ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, 132 + i * (this.numberSpace * numScale) - ((this.numberSpace * num.toString().length) / 2) * numScale, 78, this.oNumbersImgData.oData.spriteWidth * numScale, this.oNumbersImgData.oData.spriteHeight * numScale);
                    }
                    var oQImgData = assetLib.getData("question" + aQuestions[qNum]);
                    var bX = oQImgData.oData.oAtlasData[oImageIds.question].x;
                    var bY = oQImgData.oData.oAtlasData[oImageIds.question].y;
                    var bWidth = oQImgData.oData.oAtlasData[oImageIds.question].width;
                    var bHeight = oQImgData.oData.oAtlasData[oImageIds.question].height;
                    ctx.drawImage(oQImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 - 20, 350 - bHeight / 2 - this.posY -10, bWidth * 1.1, bHeight * 1.1);
                    break;
                case "levelUp":
                    ctx.drawImage(this.oMainBg1ImgData.img, 0, 0, this.oMainBg1ImgData.oData.spriteWidth, this.oMainBg1ImgData.oData.spriteHeight, 0, 0, this.oMainBg1ImgData.oData.spriteWidth, this.oMainBg1ImgData.oData.spriteHeight);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.levelUpCongrats].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.levelUpCongrats].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.levelUpCongrats].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.levelUpCongrats].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 83 - bHeight / 2 - this.posY, bWidth, bHeight);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["levelCompleteMessage" + levelNum]].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["levelCompleteMessage" + levelNum]].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["levelCompleteMessage" + levelNum]].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["levelCompleteMessage" + levelNum]].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 580 - bHeight / 2 - this.posY, bWidth, bHeight);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["prof" + levelNum]].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["prof" + levelNum]].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["prof" + levelNum]].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["prof" + levelNum]].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2 - this.posY, 465 - bHeight, bWidth, bHeight);
                    break;
                case "gameEndFail":
                    ctx.drawImage(this.oBlankBgImgData.img, 0, 0, this.oBlankBgImgData.oData.spriteWidth, this.oBlankBgImgData.oData.spriteHeight, 0, 0, this.oBlankBgImgData.oData.spriteWidth, this.oBlankBgImgData.oData.spriteHeight);
                    break;
                case "gameComplete":
                    ctx.drawImage(this.oMainBg1ImgData.img, 0, 0, this.oMainBg1ImgData.oData.spriteWidth, this.oMainBg1ImgData.oData.spriteHeight, 0, 0, this.oMainBg1ImgData.oData.spriteWidth, this.oMainBg1ImgData.oData.spriteHeight);
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.endPanel].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.endPanel].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.endPanel].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.endPanel].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - bWidth / 2, 473 + this.posY, bWidth, bHeight);
                    for(var i = 0; i < qCorrect.toString().length; i++) {
                        var id = parseFloat(qCorrect.toString().charAt(i));
                        var imgX = (id * this.oEndNumbersImgData.oData.spriteWidth) % this.oEndNumbersImgData.img.width;
                        var imgY = Math.floor(id / (this.oEndNumbersImgData.img.width / this.oEndNumbersImgData.oData.spriteWidth)) * this.oEndNumbersImgData.oData.spriteHeight;
                        ctx.drawImage(this.oEndNumbersImgData.img, imgX, imgY, this.oEndNumbersImgData.oData.spriteWidth, this.oEndNumbersImgData.oData.spriteHeight, 258 + i * (this.endNumberSpace) - (this.endNumberSpace * qCorrect.toString().length), 583 + this.posY, this.oEndNumbersImgData.oData.spriteWidth, this.oEndNumbersImgData.oData.spriteHeight);
                    }
                    var tempScale = 1.5;
                    if(qCorrect >= aGameData["@scoreToGetCongrats"]) {
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.goodEnd].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.goodEnd].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.goodEnd].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.goodEnd].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale - this.posY, 70, bWidth * tempScale, bHeight * tempScale);
                    } else {
                        var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds.badEnd].x;
                        var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds.badEnd].y;
                        var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds.badEnd].width;
                        var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds.badEnd].height;
                        ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, canvas.width / 2 - (bWidth / 2) * tempScale - this.posY, 70, bWidth * tempScale, bHeight * tempScale);
                    }
                    break;
                case "pause":
                    ctx.drawImage(this.oPauseBgImgData.img, 0, 0, this.oPauseBgImgData.oData.spriteWidth, this.oPauseBgImgData.oData.spriteHeight, 0, 0, this.oPauseBgImgData.oData.spriteWidth, this.oPauseBgImgData.oData.spriteHeight);
                    break;
            }
            if(_butsOnTop) {
                this.addButs(ctx);
            }
        };
        Panel.prototype.addButs = function (ctx) {
            for(var i = 0; i < this.aButs.length; i++) {
                var offsetPosY = this.posY;
                var floatY = 0;
                if(this.incY != 0 && !this.aButs[i].noMove) {
                    floatY = Math.sin(this.incY + i * 45) * 3;
                }
                if(i % 2 == 0) {
                }
                if(this.aButs[i].noScroll) {
                    offsetPosY = 0;
                }
                if(!this.aButs[i].scale) {
                    this.aButs[i].scale = 1;
                }
                var gameButYOffset = 0;
                if(this.aButs[i].gameQ) {
                    var bX = this.oUiElementsImgData.oData.oAtlasData[oImageIds["butBg" + this.aButs[i].butBgId]].x;
                    var bY = this.oUiElementsImgData.oData.oAtlasData[oImageIds["butBg" + this.aButs[i].butBgId]].y;
                    var bWidth = this.oUiElementsImgData.oData.oAtlasData[oImageIds["butBg" + this.aButs[i].butBgId]].width;
                    var bHeight = this.oUiElementsImgData.oData.oAtlasData[oImageIds["butBg" + this.aButs[i].butBgId]].height;
                    ctx.drawImage(this.oUiElementsImgData.img, bX, bY, bWidth, bHeight, this.aButs[i].aPos[0] - (bWidth / 2) + offsetPosY, this.aButs[i].aPos[1] - (bHeight / 2), bWidth, bHeight);
                    gameButYOffset = -10;
                }
                var bX = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].x;
                var bY = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].y;
                var bWidth = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].width;
                var bHeight = this.aButs[i].oImgData.oData.oAtlasData[this.aButs[i].id].height;
                ctx.drawImage(this.aButs[i].oImgData.img, bX, bY, bWidth, bHeight, this.aButs[i].aPos[0] - (bWidth / 2) * (this.aButs[i].scale) + offsetPosY - floatY / 2, this.aButs[i].aPos[1] - (bHeight / 2) * (this.aButs[i].scale) + floatY / 2 + gameButYOffset, bWidth * (this.aButs[i].scale) + floatY, bHeight * (this.aButs[i].scale) - floatY);
                if(this.aButs[i].text) {
                    var oTextDisplayData = {
                        text: this.aButs[i].text,
                        x: this.aButs[i].aPos[0] + offsetPosY,
                        y: this.aButs[i].aPos[1],
                        alignX: "centre",
                        alignY: "centre",
                        maxWidth: bWidth - 8
                    };
                    textDisplay.renderText(oTextDisplayData);
                }
            }
        };
        return Panel;
    })();
    Elements.Panel = Panel;    
})(Elements || (Elements = {}));
var Elements;
(function (Elements) {
    var Hud = (function () {
        function Hud() {
            this.bonusScore = 0;
            this.letterSpace = 20;
            this.oHudImgData = assetLib.getData("hud");
            this.oNumbersImgData = assetLib.getData("bigNumbers");
        }
        Hud.prototype.render = function () {
            ctx.drawImage(this.oHudImgData.img, 0, 0);
            for(var i = 0; i < totalScore.toString().length; i++) {
                var id = parseFloat(totalScore.toString().charAt(i));
                var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, (canvas.width / 2) + i * this.letterSpace - (this.letterSpace * totalScore.toString().length) / 2, 2, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight);
            }
            for(var i = 0; i < this.bonusScore.toString().length; i++) {
                var id = parseFloat(this.bonusScore.toString().charAt(i));
                var imgX = (id * this.oNumbersImgData.oData.spriteWidth) % this.oNumbersImgData.img.width;
                var imgY = Math.floor(id / (this.oNumbersImgData.img.width / this.oNumbersImgData.oData.spriteWidth)) * this.oNumbersImgData.oData.spriteHeight;
                ctx.drawImage(this.oNumbersImgData.img, imgX, imgY, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight, 51 + i * this.letterSpace, 40, this.oNumbersImgData.oData.spriteWidth, this.oNumbersImgData.oData.spriteHeight);
            }
        };
        return Hud;
    })();
    Elements.Hud = Hud;    
})(Elements || (Elements = {}));
var Utils;
(function (Utils) {
    var TextDisplay = (function () {
        function TextDisplay() {
            this.oTextData = {
            };
            this.inc = 0;
            this.createTextObjects();
        }
        TextDisplay.prototype.createTextObjects = function () {
            var cnt = 0;
            for(var i in assetLib.textData.langText.text[curLang]) {
                this.oTextData[i] = {
                };
                this.oTextData[i].aLineData = this.getCharData(assetLib.textData.langText.text[curLang][i]["@text"], assetLib.textData.langText.text[curLang][i]["@fontId"]);
                this.oTextData[i].aLineWidths = this.getLineWidths(this.oTextData[i].aLineData);
                this.oTextData[i].blockWidth = this.getBlockWidth(this.oTextData[i].aLineData);
                this.oTextData[i].blockHeight = this.getBlockHeight(this.oTextData[i].aLineData, assetLib.textData.langText.text[curLang][i]["@fontId"]);
                this.oTextData[i].lineHeight = parseInt(assetLib.textData["fontData" + assetLib.textData.langText.text[curLang][i]["@fontId"]].text.common["@lineHeight"]);
                this.oTextData[i].oFontImgData = assetLib.getData("font" + assetLib.textData.langText.text[curLang][i]["@fontId"]);
            }
        };
        TextDisplay.prototype.getLineWidths = function (_aCharData) {
            var lineLength;
            var aLineWidths = new Array();
            for(var i = 0; i < _aCharData.length; i++) {
                lineLength = 0;
                for(var j = 0; j < _aCharData[i].length; j++) {
                    lineLength += parseInt(_aCharData[i][j]["@xadvance"]);
                    if(j == 0) {
                        lineLength -= parseInt(_aCharData[i][j]["@xoffset"]);
                    } else if(j == _aCharData[i].length - 1) {
                        lineLength += parseInt(_aCharData[i][j]["@xoffset"]);
                    }
                }
                aLineWidths.push(lineLength);
            }
            return aLineWidths;
        };
        TextDisplay.prototype.getBlockWidth = function (_aCharData) {
            var lineLength;
            var longestLineLength = 0;
            for(var i = 0; i < _aCharData.length; i++) {
                lineLength = 0;
                for(var j = 0; j < _aCharData[i].length; j++) {
                    lineLength += parseInt(_aCharData[i][j]["@xadvance"]);
                    if(j == 0) {
                        lineLength -= parseInt(_aCharData[i][j]["@xoffset"]);
                    } else if(j == _aCharData[i].length - 1) {
                        lineLength += parseInt(_aCharData[i][j]["@xoffset"]);
                    }
                }
                if(lineLength > longestLineLength) {
                    longestLineLength = lineLength;
                }
            }
            return longestLineLength;
        };
        TextDisplay.prototype.getBlockHeight = function (_aCharData, _fontId) {
            return _aCharData.length * parseInt(assetLib.textData["fontData" + _fontId].text.common["@lineHeight"]);
        };
        TextDisplay.prototype.getCharData = function (_aLines, _fontId) {
            var aCharData = new Array();
            for(var k = 0; k < _aLines.length; k++) {
                aCharData[k] = new Array();
                for(var i = 0; i < _aLines[k].length; i++) {
                    for(var j = 0; j < assetLib.textData["fontData" + _fontId].text.chars.char.length; j++) {
                        if(_aLines[k][i].charCodeAt() == assetLib.textData["fontData" + _fontId].text.chars.char[j]["@id"]) {
                            aCharData[k].push(assetLib.textData["fontData" + _fontId].text.chars.char[j]);
                        }
                    }
                }
            }
            return aCharData;
        };
        TextDisplay.prototype.renderText = function (_oTextDisplayData) {
            var aLinesToRender = this.oTextData[_oTextDisplayData.text].aLineData;
            var oFontImgData = this.oTextData[_oTextDisplayData.text].oFontImgData;
            var shiftX;
            var offsetX = 0;
            var offsetY = 0;
            var lineOffsetY = 0;
            var manualScale = 1;
            var animY = 0;
            if(_oTextDisplayData.lineOffsetY) {
                lineOffsetY = _oTextDisplayData.lineOffsetY;
            }
            if(_oTextDisplayData.scale) {
                manualScale = _oTextDisplayData.scale;
            }
            var textScale = 1 * manualScale;
            if(_oTextDisplayData.maxWidth && this.oTextData[_oTextDisplayData.text].blockWidth * manualScale > _oTextDisplayData.maxWidth) {
                textScale = _oTextDisplayData.maxWidth / this.oTextData[_oTextDisplayData.text].blockWidth;
            }
            if(_oTextDisplayData.anim) {
                this.inc += delta * 7;
            }
            for(var i = 0; i < aLinesToRender.length; i++) {
                shiftX = 0;
                if(_oTextDisplayData.alignX == "centre") {
                    offsetX = this.oTextData[_oTextDisplayData.text].aLineWidths[i] / 2;
                }
                if(_oTextDisplayData.alignY == "centre") {
                    offsetY = this.oTextData[_oTextDisplayData.text].blockHeight / 2 + (lineOffsetY * (aLinesToRender.length - 1)) / 2;
                }
                for(var j = 0; j < aLinesToRender[i].length; j++) {
                    var bX = aLinesToRender[i][j]["@x"];
                    var bY = aLinesToRender[i][j]["@y"];
                    var bWidth = aLinesToRender[i][j]["@width"];
                    var bHeight = aLinesToRender[i][j]["@height"];
                    if(_oTextDisplayData.anim) {
                        animY = Math.sin(this.inc + j / 2) * ((bHeight / 15) * textScale);
                    }
                    ctx.drawImage(oFontImgData.img, bX, bY, bWidth, bHeight, _oTextDisplayData.x + (shiftX + parseInt(aLinesToRender[i][j]["@xoffset"]) - offsetX) * textScale, _oTextDisplayData.y + (parseInt(aLinesToRender[i][j]["@yoffset"]) + (i * this.oTextData[_oTextDisplayData.text].lineHeight) + (i * lineOffsetY) - offsetY) * textScale + animY, bWidth * textScale, bHeight * textScale);
                    shiftX += parseInt(aLinesToRender[i][j]["@xadvance"]);
                }
            }
        };
        return TextDisplay;
    })();
    Utils.TextDisplay = TextDisplay;    
})(Utils || (Utils = {}));
var Utils;
(function (Utils) {
    var SaveDataHandler = (function () {
        function SaveDataHandler(_saveDataId) {
            this.dataGroupNum = 2;
            this.saveDataId = _saveDataId;
            var testKey = 'test', storage = window.sessionStorage;
            try  {
                storage.setItem(testKey, '1');
                storage.removeItem(testKey);
                this.canStore = true;
            } catch (error) {
                this.canStore = false;
            }
            this.clearData();
            this.setInitialData();
        }
        SaveDataHandler.prototype.clearData = function () {
            this.aLevelStore = new Array();
            this.aLevelStore.push(0);
            this.aLevelStore.push(0);
            this.aLevelStore.push(0);
            this.aLevelStore.push(0);
            this.aLevelStore.push(0);
            this.aLevelStore.push(0);
        };
        SaveDataHandler.prototype.resetData = function () {
            this.aLevelStore = new Array();
            this.aLevelStore.push(0);
            this.aLevelStore.push(0);
            this.aLevelStore.push(0);
            this.aLevelStore.push(0);
            this.aLevelStore.push(0);
            this.aLevelStore.push(0);
            this.saveData();
        };
        SaveDataHandler.prototype.setInitialData = function () {
            if(this.canStore && typeof (Storage) !== "undefined") {
                if(localStorage.getItem(this.saveDataId) != null && localStorage.getItem(this.saveDataId) != "") {
                    this.aLevelStore = localStorage.getItem(this.saveDataId).split(",");
                    for(var a in this.aLevelStore) {
                        this.aLevelStore[a] = parseInt(this.aLevelStore[a]);
                    }
                } else {
                    this.saveData();
                }
            }
        };
        SaveDataHandler.prototype.setData = function (_levelNum, _aData) {
            for(var i = 0; i < _aData.length; i++) {
                if(this.aLevelStore.length == 0 || this.aLevelStore.length <= _levelNum * this.dataGroupNum + i) {
                    for(var j = 0; j < ((_levelNum * this.dataGroupNum) + i) - this.aLevelStore.length - 1; j++) {
                        this.aLevelStore.push(0);
                    }
                    this.aLevelStore.push(_aData[i]);
                } else {
                    this.aLevelStore[_levelNum * this.dataGroupNum + i] = _aData[i];
                }
            }
        };
        SaveDataHandler.prototype.getData = function (_levelNum, _id) {
            return this.aLevelStore[_levelNum * this.dataGroupNum + _id];
        };
        SaveDataHandler.prototype.saveData = function () {
            if(this.canStore && typeof (Storage) !== "undefined") {
                var str = "";
                for(var i = 0; i < this.aLevelStore.length; i++) {
                    str += this.aLevelStore[i];
                    if(i < this.aLevelStore.length - 1) {
                        str += ",";
                    }
                }
                localStorage.setItem(this.saveDataId, str);
            }
        };
        return SaveDataHandler;
    })();
    Utils.SaveDataHandler = SaveDataHandler;    
})(Utils || (Utils = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Elements;
(function (Elements) {
    var Firework = (function (_super) {
        __extends(Firework, _super);
        function Firework() {
                _super.call(this, assetLib.getData("firework"), 25, 30, "explode");
            this.vy = 0;
            this.setAnimType("once", "explode");
            this.animEndedFunc = function () {
                this.removeMe = true;
            };
            TweenLite.to(this, .5, {
                scaleX: 4,
                scaleY: 4,
                ease: "Quad.easeOut"
            });
        }
        Firework.prototype.update = function () {
            _super.prototype.updateAnimation.call(this, delta);
        };
        Firework.prototype.render = function () {
            _super.prototype.renderSimple.call(this, ctx);
        };
        return Firework;
    })(Utils.AnimSprite);
    Elements.Firework = Firework;    
})(Elements || (Elements = {}));
var requestAnimFrame = (function () {
    return window.requestAnimationFrame || (window).webkitRequestAnimationFrame || (window).mozRequestAnimationFrame || (window).oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60, new Date().getTime());
    };
})();
var previousTime;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 900;
var canvasX;
var canvasY;
var canvasScaleX;
var canvasScaleY;
var div = document.getElementById('canvas-wrapper');
var sound;
var music;
var audioType = 0;
var muted = false;
var splash;
var splashTimer = 0;
var assetLib;
var preAssetLib;
var rotatePause = false;
var manualPause = false;
var isMobile = false;
var gameState = "loading";
var aLangs = new Array("EN");
var curLang = "";
var isBugBrowser = false;
var isIE10 = false;
var delta;
var radian = Math.PI / 180;
var ios9FirstTouch = false;
var textDisplay;
if(navigator.userAgent.match(/MSIE\s([\d]+)/)) {
    isIE10 = true;
}
var deviceAgent = navigator.userAgent.toLowerCase();
if(deviceAgent.match(/(iphone|ipod|ipad)/) || deviceAgent.match(/(android)/) || deviceAgent.match(/(iemobile)/) || deviceAgent.match(/iphone/i) || deviceAgent.match(/ipad/i) || deviceAgent.match(/ipod/i) || deviceAgent.match(/blackberry/i) || deviceAgent.match(/bada/i)) {
    isMobile = true;
    if(deviceAgent.match(/(android)/) && !/Chrome/.test(navigator.userAgent)) {
        isBugBrowser = true;
    }
}
var userInput = new Utils.UserInput(canvas, isBugBrowser);
resizeCanvas();
window.onresize = function () {
    setTimeout(function () {
        resizeCanvas();
    }, 1);
};
function visibleResume() {
    if(!muted && !manualPause) {
        Howler.unmute();
    }
}
function visiblePause() {
    Howler.mute();
}
window.addEventListener("load", function () {
    setTimeout(function () {
        resizeCanvas();
    }, 0);
    window.addEventListener("orientationchange", function () {
        setTimeout(function () {
            resizeCanvas();
        }, 500);
        setTimeout(function () {
            resizeCanvas();
        }, 2000);
    }, false);
});
function isStock() {
    var matches = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
    return matches && parseFloat(matches[1]) < 537;
}
var ua = navigator.userAgent;
var isSharpStock = ((/SHL24|SH-01F/i).test(ua)) && isStock();
var isXperiaAStock = ((/SO-04E/i).test(ua)) && isStock();
var isFujitsuStock = ((/F-01F/i).test(ua)) && isStock();
var panel;
var hud;
var totalScore = 0;
var levelScore = 0;
var levelNum = 0;
var musicTween;
var oImageIds = {
};
var aQuestions = new Array();
var gameTime;
var qNum = 0;
var aAnswers;
var aAnswerPos = new Array([
    157, 
    631
], [
    457, 
    631
], [
    157, 
    804
], [
    457, 
    804
]);
var qState;
var canTapAnswers;
var totalQNum = 0;
var qCorrect;
var gameLength;
var answerTween;
var aGameData;
var aEffects;
var fireworkCnt = 0;
var qsAnswered;
loadPreAssets();
function initSplash() {
    gameState = "splash";
    resizeCanvas();
    toggleMute();
    IkemuStatsAPI.init();
    aGameData = assetLib.textData.gameData.text;
    gameLength = aGameData["@gameTime"];
    initStartScreen();
}
function initStartScreen() {
    gameState = "start";
    userInput.removeHitArea("moreGames");
    var oPlayBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            canvas.width / 2, 
            760
        ],
        id: oImageIds.playBut
    };
    userInput.addHitArea("playFromStart", butEventHandler, null, "image", oPlayBut);
    var aButs = new Array(oPlayBut);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween1();
    previousTime = new Date().getTime();
    updateStartScreenEvent();
}
function initGame() {
    if(audioType == 1) {
    }
    IkemuStatsAPI.gameStart();
    aQuestions = new Array();
    for(var i = 0; i < totalQNum; i++) {
        aQuestions.push(i);
    }
    aQuestions = randomise(aQuestions);
    levelScore = 0;
    totalScore = 0;
    levelNum = 0;
    gameTime = 0;
    qCorrect = 0;
    qsAnswered = 0;
    initQuestion();
}
function initQuestion() {
    gameState = "game";
    aEffects = new Array();
    aAnswers = new Array();
    for(var i = 0; i < 4; i++) {
        aAnswers.push(i);
    }
    aAnswers = randomise(aAnswers);
    qState = {
        answered: false,
        result: null,
        id: null,
        symbolY: null,
        correctId: null
    };
    var oPauseBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            45, 
            60
        ],
        id: oImageIds.pauseBut,
        noScroll: true
    };
    userInput.addHitArea("pause", butEventHandler, null, "image", oPauseBut);
    var aButs = new Array(oPauseBut);
    var correctId;
    for(var i = 0; i < aAnswers.length; i++) {
        if(aAnswers[i] == 0) {
            correctId = i;
        }
    }
    for(var i = 0; i < aAnswers.length; i++) {
        var oAnswerBut = {
            oImgData: assetLib.getData("question" + aQuestions[qNum]),
            aPos: [
                aAnswerPos[i][0], 
                aAnswerPos[i][1]
            ],
            id: oImageIds["answer" + aAnswers[i]],
            gameQ: true,
            butBgId: 0
        };
        userInput.addHitArea("answer", butEventHandler, {
            id: i,
            correctId: correctId
        }, "image", oAnswerBut);
        aButs.push(oAnswerBut);
    }
    canTapAnswers = false;
    setTimeout(function () {
        canTapAnswers = true;
    }, 500);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween2();
    console.log("question", aQuestions[qNum]);
    previousTime = new Date().getTime();
    updateGameEvent();
}
function initLevelUp() {
    gameState = "levelUp";
    aEffects = new Array();
    playSound("levelUp");
    IkemuStatsAPI.gameLevelComplete(qCorrect * 8);
    var oContinueBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            canvas.width / 2, 
            773
        ],
        id: oImageIds.continueBut
    };
    userInput.addHitArea("continue", butEventHandler, null, "image", oContinueBut);
    var aButs = new Array(oContinueBut);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween1();
    previousTime = new Date().getTime();
    updateLevelUpEvent();
}
function butEventHandler(_id, _oData) {
    console.log(_id);
    switch(_id) {
        case "playFromStart":
            playSound("click");
            userInput.removeHitArea("playFromStart");
            initGame();
            break;
        case "startGame":
            playSound("click");
            userInput.removeHitArea("startGame");
            initGame();
            break;
        case "answer":
            if(!canTapAnswers) {
                return;
            }
            qsAnswered++;
            var oPauseBut = {
                oImgData: assetLib.getData("uiButs"),
                aPos: [
                    45, 
                    60
                ],
                id: oImageIds.pauseBut,
                noScroll: true
            };
            userInput.addHitArea("pause", butEventHandler, null, "image", oPauseBut);
            var aButs = new Array(oPauseBut);
            var correctId;
            for(var i = 0; i < aAnswers.length; i++) {
                if(aAnswers[i] == 0) {
                    correctId = i;
                }
            }
            for(var i = 0; i < aAnswers.length; i++) {
                var butBgId = 0;
                if(aAnswers[_oData.id] == 0 && correctId == i) {
                    butBgId = 1;
                } else if(_oData.id == i) {
                    butBgId = 2;
                }
                var oAnswerBut = {
                    oImgData: assetLib.getData("question" + aQuestions[qNum]),
                    aPos: [
                        aAnswerPos[i][0], 
                        aAnswerPos[i][1]
                    ],
                    id: oImageIds["answer" + aAnswers[i]],
                    gameQ: true,
                    butBgId: butBgId
                };
                userInput.addHitArea("answer", butEventHandler, {
                    id: i,
                    correctId: correctId
                }, "image", oAnswerBut);
                aButs.push(oAnswerBut);
            }
            panel = new Elements.Panel(gameState, aButs);
            userInput.removeHitArea("answer");
            if(aAnswers[_oData.id] == 0) {
                qState = {
                    answered: true,
                    result: 1,
                    id: _oData.id,
                    correctId: _oData.correctId
                };
                qCorrect++;
                playSound("correct");
                addFirework(_oData.x, _oData.y);
            } else {
                qState = {
                    answered: true,
                    result: 0,
                    id: _oData.id,
                    correctId: _oData.correctId
                };
                playSound("incorrect");
            }
            qState.symbolY = aAnswerPos[qState.correctId][1] - 50;
            if(answerTween) {
                answerTween.kill();
            }
            answerTween = TweenLite.to(qState, 1.5, {
                symbolY: aAnswerPos[qState.correctId][1],
                ease: "Elastic.easeOut",
                onComplete: function () {
                    if(aAnswers[_oData.id] == 0) {
                        aQuestions.splice(qNum, 1);
                        qNum--;
                    }
                    nextQuestion();
                }
            });
            break;
        case "continue":
            playSound("click");
            userInput.removeHitArea("continue");
            IkemuStatsAPI.gameLevelUp(qCorrect * 8);
            nextQuestion();
            break;
        case "restartFromGameEndFail":
            //playSound("click");
            userInput.removeHitArea("exitFromGameEndFail");
            userInput.removeHitArea("restartFromGameEndFail");
            initGame();
            break;
        case "linkFromGameComplete":
            dataLayer.push({
                'event': 'UAevent',
                'category': 'entertainment_quiz',
                'action': 'click',
                'label': 'もっと楽しむ'
            });
            var url = aGameData["@linkURL"];
            parent.location.href = url;
            //playSound("click");
            
            //var open = window.open(url);
            //if(open == null || typeof (open) == 'undefined') {
            //    location.href = url;
            //}
            break;
        case "restartFromGameComplete":
            //playSound("click");
            dataLayer.push({
                'event': 'UAevent',
                'category': 'entertainment_quiz',
                'action': 'click',
                'label': '再挑戦する'
            });
            userInput.removeHitArea("linkFromGameComplete");
            userInput.removeHitArea("restartFromGameComplete");
            userInput.removeHitArea("facebookHit");
            userInput.removeHitArea("twitterHit");
            IkemuStatsAPI.gameRestart();
            initGame();
            break;
        case "facebookHit":
            //playSound("click");
            dataLayer.push({
                'event': 'UAevent',
                'category': 'entertainment_quiz',
                'action': 'click',
                'label': 'Facebook'
            });
            var url = aGameData["@facebookURL"];
            parent.location.href = url;
            //if(open == null || typeof (open) == 'undefined') {
            //    location.href = url;
            //}
            break;
        case "twitterHit":
            //playSound("click");
            dataLayer.push({
                'event': 'UAevent',
                'category': 'entertainment_quiz',
                'action': 'click',
                'label': 'Twitter'
            });
            var url = aGameData["@twitterURL"];
            parent.location.href = url;
            //if(open == null || typeof (open) == 'undefined') {
            //    location.href = url;
            //}
            break;
        case "mute":
            if(!manualPause) {
                playSound("click");
                toggleMute();
            }
            break;
        case "pause":
        case "resumeFromPause":
            playSound("click");
            toggleManualPause();
            break;
        case "exitFromPause":
            playSound("click");
            toggleManualPause();
            userInput.removeHitArea("pause");
            userInput.removeKey("answer");
            userInput.removeHitArea("exitFromPause");
            userInput.removeHitArea("resumeFromPause");
            initStartScreen();
            break;
    }
}
function nextQuestion() {
    if(++qNum >= aQuestions.length) {
        qNum = 0;
    }
    if(qsAnswered >= aGameData["@questionsToComplete"]) {
        initGameComplete();
    } else {
        initQuestion();
    }
}
function addFirework(_x, _y) {
    if(aGameData["@fireworks"]) {
        var firework = new Elements.Firework();
        firework.x = _x;
        firework.y = _y;
        firework.scaleX = firework.scaleY = 1;
        aEffects.push(firework);
    }
}
function updateScore(_inc) {
    levelScore += _inc;
}
function initGameComplete() {
    gameState = "gameComplete";
    aEffects = new Array();
    playSound("gameComplete");
    if(answerTween) {
        answerTween.kill();
    }
    userInput.removeHitArea("pause");
    userInput.removeHitArea("answer");
    var oRestartBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            canvas.width / 2 - 130, 
            380
        ],
        scale: 1.2,
        id: oImageIds.restartBut
    };
    var oLinkBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            canvas.width / 2 + 130, 
            380
        ],
        scale: 1.2,
        id: oImageIds.linkBut
    };
    var oFacebookBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            canvas.width / 2 - 70, 
            770
        ],
        scale: 1.2,
        id: oImageIds.facebookBut,
        noMove: true
    };
    var oTwitterBut = {
        oImgData: assetLib.getData("uiButs"),
        aPos: [
            canvas.width / 2 + 70, 
            770
        ],
        scale: 1.2,
        id: oImageIds.twitterBut,
        noMove: true
    };
    userInput.addHitArea("linkFromGameComplete", butEventHandler, null, "image", oLinkBut);
    userInput.addHitArea("restartFromGameComplete", butEventHandler, null, "image", oRestartBut);
    userInput.addHitArea("facebookHit", butEventHandler, null, "image", oFacebookBut);
    userInput.addHitArea("twitterHit", butEventHandler, null, "image", oTwitterBut);
    var aButs = new Array(oLinkBut, oRestartBut, oFacebookBut, oTwitterBut);
    panel = new Elements.Panel(gameState, aButs);
    panel.startTween2();
    var totScore = qCorrect * 8 + Math.round(gameLength - gameTime) * 2;
    panel.oScoreData = {
        totalScore: totScore
    };
    IkemuStatsAPI.gameLevelComplete(totScore);
    IkemuStatsAPI.gameComplete(totScore);
    previousTime = new Date().getTime();
    updateGameComplete();
}
function initGameEndFail() {
    gameState = "gameEndFail";
    if(answerTween) {
        answerTween.kill();
    }
    playSound("timeUp");
    userInput.removeHitArea("pause");
    userInput.removeHitArea("answer");
    var aButs = new Array();
    panel = new Elements.Panel(gameState, aButs);
    panel.oScoreData = {
        totalScore: qCorrect * 8
    };
    IkemuStatsAPI.gameLevelComplete(qCorrect * 8);
    IkemuStatsAPI.gameComplete(qCorrect * 8);
    panel.startTween1();
    previousTime = new Date().getTime();
    updateGameEndFail();
}
function randomise(_aTemp) {
    for(var i = _aTemp.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = _aTemp[i];
        _aTemp[i] = _aTemp[j];
        _aTemp[j] = temp;
    }
    return _aTemp;
}
function updateGameEvent() {
    if(manualPause || rotatePause || gameState != "game") {
        return;
    }
    delta = getDelta();
    gameTime += delta;
    if(gameTime >= gameLength) {
        initGameComplete();
    }
    panel.render();
    if(qState.answered && qState.correctId != qState.id) {
        var bX = panel.oUiElementsImgData.oData.oAtlasData[oImageIds["resultSymbol1"]].x;
        var bY = panel.oUiElementsImgData.oData.oAtlasData[oImageIds["resultSymbol1"]].y;
        var bWidth = panel.oUiElementsImgData.oData.oAtlasData[oImageIds["resultSymbol1"]].width;
        var bHeight = panel.oUiElementsImgData.oData.oAtlasData[oImageIds["resultSymbol1"]].height;
        ctx.drawImage(panel.oUiElementsImgData.img, bX, bY, bWidth, bHeight, aAnswerPos[qState.correctId][0] - bWidth / 2, qState.symbolY - bHeight / 2, bWidth, bHeight);
    }
    for(var i = 0; i < aEffects.length; i++) {
        aEffects[i].update();
        aEffects[i].render();
        if(aEffects[i].removeMe) {
            aEffects.splice(i, 1);
            i -= 1;
        }
    }
    renderMuteBut();
    requestAnimFrame(updateGameEvent);
}
function updateGameComplete() {
    if(rotatePause || gameState != "gameComplete") {
        return;
    }
    delta = getDelta();
    panel.update();
    panel.render();
    if(qCorrect >= aGameData["@scoreToGetCongrats"]) {
        fireworkCnt += delta;
        if(fireworkCnt > .3) {
            addFirework(Math.random() * (canvas.width - 100) + 50, Math.random() * (canvas.height - 100) + 50);
            fireworkCnt = 0;
        }
        for(var i = 0; i < aEffects.length; i++) {
            aEffects[i].update();
            aEffects[i].render();
            if(aEffects[i].removeMe) {
                aEffects.splice(i, 1);
                i -= 1;
            }
        }
    }
    renderMuteBut();
    requestAnimFrame(updateGameComplete);
}
function updateGameEndFail() {
    if(rotatePause || gameState != "gameEndFail") {
        return;
    }
    delta = getDelta();
    panel.update();
    panel.render();
    renderMuteBut();
    requestAnimFrame(updateGameEndFail);
}
function updateLevelUpEvent() {
    if(rotatePause || gameState != "levelUp") {
        return;
    }
    delta = getDelta();
    panel.update();
    panel.render();
    fireworkCnt += delta;
    if(fireworkCnt > .3) {
        addFirework(Math.random() * (canvas.width - 100) + 50, Math.random() * (canvas.height - 100) + 50);
        fireworkCnt = 0;
    }
    for(var i = 0; i < aEffects.length; i++) {
        aEffects[i].update();
        aEffects[i].render();
        if(aEffects[i].removeMe) {
            aEffects.splice(i, 1);
            i -= 1;
        }
    }
    renderMuteBut();
    requestAnimFrame(updateLevelUpEvent);
}
function updateStartScreenEvent() {
    if(rotatePause || gameState != "start") {
        return;
    }
    delta = getDelta();
    panel.update();
    panel.render();
    renderMuteBut();
    requestAnimFrame(updateStartScreenEvent);
}
function getDelta() {
    var currentTime = new Date().getTime();
    var deltaTemp = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    if(deltaTemp > .5) {
        deltaTemp = 0;
    }
    return deltaTemp;
}
function checkSpriteCollision(_s1, _s2) {
    var s1XOffset = _s1.x;
    var s1YOffset = _s1.y;
    var s2XOffset = _s2.x;
    var s2YOffset = _s2.y;
    var distance_squared = (((s1XOffset - s2XOffset) * (s1XOffset - s2XOffset)) + ((s1YOffset - s2YOffset) * (s1YOffset - s2YOffset)));
    var radii_squared = (_s1.radius) * (_s2.radius);
    if(distance_squared < radii_squared) {
        return true;
    } else {
        return false;
    }
}
function getScaleImageToMax(_oImgData, _aLimit) {
    var newScale;
    if(_oImgData.isSpriteSheet) {
        if(_aLimit[0] / _oImgData.oData.spriteWidth < _aLimit[1] / _oImgData.oData.spriteHeight) {
            newScale = Math.min(_aLimit[0] / _oImgData.oData.spriteWidth, 1);
        } else {
            newScale = Math.min(_aLimit[1] / _oImgData.oData.spriteHeight, 1);
        }
    } else {
        if(_aLimit[0] / _oImgData.img.width < _aLimit[1] / _oImgData.img.height) {
            newScale = Math.min(_aLimit[0] / _oImgData.img.width, 1);
        } else {
            newScale = Math.min(_aLimit[1] / _oImgData.img.height, 1);
        }
    }
    return newScale;
}
function getCentreFromTopLeft(_aTopLeft, _oImgData, _imgScale) {
    var aCentre = new Array();
    aCentre.push(_aTopLeft[0] + (_oImgData.oData.spriteWidth / 2) * _imgScale);
    aCentre.push(_aTopLeft[1] + (_oImgData.oData.spriteHeight / 2) * _imgScale);
    return aCentre;
}
function loadPreAssets() {
    if(aLangs.length > 1) {
        var aLangLoadData = new Array();
        for(var i = 0; i < aLangs.length; i++) {
            aLangLoadData.push({
                id: "lang" + aLangs[i],
                file: "images/lang" + aLangs[i] + ".png"
            });
        }
        preAssetLib = new Utils.AssetLoader(curLang, aLangLoadData, ctx, canvas.width, canvas.height, false);
        preAssetLib.onReady(initLangSelect);
    } else {
        curLang = aLangs[0];
        preAssetLib = new Utils.AssetLoader(curLang, [
            {
                id: "preloadImage",
                file: "images/preloadBg.jpg"
            }, 
            {
                id: "gameData",
                file: "json/gameData.json"
            }
        ], ctx, canvas.width, canvas.height, false);
        preAssetLib.onReady(initLoadAssets);
    }
}
function initLangSelect() {
    var oImgData;
    var j;
    var k;
    var gap = 10;
    var tileWidthNum = 0;
    var tileHeightNum = 0;
    var butScale = 1;
    for(var i = 0; i < aLangs.length; i++) {
        oImgData = preAssetLib.getData("lang" + aLangs[i]);
        if((i + 1) * (oImgData.img.width * butScale) + (i + 2) * gap < canvas.width) {
            tileWidthNum++;
        } else {
            break;
        }
    }
    tileHeightNum = Math.ceil(aLangs.length / tileWidthNum);
    for(var i = 0; i < aLangs.length; i++) {
        oImgData = preAssetLib.getData("lang" + aLangs[i]);
        j = canvas.width / 2 - (tileWidthNum / 2) * (oImgData.img.width * butScale) - ((tileWidthNum - 1) / 2) * gap;
        j += (i % tileWidthNum) * ((oImgData.img.width * butScale) + gap);
        k = canvas.height / 2 - (tileHeightNum / 2) * (oImgData.img.height * butScale) - ((tileHeightNum - 1) / 2) * gap;
        k += (Math.floor(i / tileWidthNum) % tileHeightNum) * ((oImgData.img.height * butScale) + gap);
        ctx.drawImage(oImgData.img, 0, 0, oImgData.img.width, oImgData.img.height, j, k, (oImgData.img.width * butScale), (oImgData.img.height * butScale));
        var oBut = {
            oImgData: oImgData,
            aPos: [
                j + (oImgData.img.width * butScale) / 2, 
                k + (oImgData.img.height * butScale) / 2
            ],
            scale: butScale,
            id: "none",
            noMove: true
        };
        userInput.addHitArea("langSelect", butEventHandler, {
            lang: aLangs[i]
        }, "image", oBut);
    }
}
function initLoadAssets() {
    var oImgData = preAssetLib.getData("preloadImage");
    ctx.drawImage(oImgData.img, 0, 0);
    aGameData = preAssetLib.textData.gameData.text;
    totalQNum = aGameData["@totalQuestions"];
    loadAssets();
}
function loadAssets() {
    var aImageData = new Array({
        id: "uiButs",
        file: "images/uiButs.png",
        oAtlasData: {
            id0: {
                x: 308,
                y: 357,
                width: 50,
                height: 54
            },
            id1: {
                x: 256,
                y: 357,
                width: 50,
                height: 54
            },
            id2: {
                x: 204,
                y: 357,
                width: 50,
                height: 54
            },
            id3: {
                x: 0,
                y: 132,
                width: 411,
                height: 130
            },
            id4: {
                x: 0,
                y: 0,
                width: 411,
                height: 130
            },
            id5: {
                x: 0,
                y: 339,
                width: 202,
                height: 73
            },
            id6: {
                x: 0,
                y: 264,
                width: 202,
                height: 73
            },
            id7: {
                x: 297,
                y: 264,
                width: 91,
                height: 91
            },
            id8: {
                x: 204,
                y: 264,
                width: 91,
                height: 91
            }
        }
    }, {
        id: "uiElements",
        file: "images/uiElements.png",
        oAtlasData: {
            id0: {
                x: 516,
                y: 430,
                width: 308,
                height: 156
            },
            id1: {
                x: 602,
                y: 318,
                width: 92,
                height: 109
            },
            id10: {
                x: 0,
                y: 0,
                width: 600,
                height: 428
            },
            id2: {
                x: 602,
                y: 142,
                width: 188,
                height: 174
            },
            id3: {
                x: 782,
                y: 588,
                width: 163,
                height: 153
            },
            id4: {
                x: 602,
                y: 0,
                width: 264,
                height: 140
            },
            id5: {
                x: 516,
                y: 730,
                width: 264,
                height: 140
            },
            id6: {
                x: 516,
                y: 588,
                width: 264,
                height: 140
            },
            id7: {
                x: 0,
                y: 811,
                width: 297,
                height: 80
            },
            id8: {
                x: 299,
                y: 872,
                width: 247,
                height: 72
            },
            id9: {
                x: 0,
                y: 430,
                width: 514,
                height: 379
            }
        }
    }, {
        id: "numbers",
        file: "images/numbers_30x20.png"
    }, {
        id: "endNumbers",
        file: "images/endNumbers_41x46.png"
    }, {
        id: "mainBg1",
        file: "images/mainBg1.jpg"
    }, {
        id: "titleBg",
        file: "images/titleBg.jpg"
    }, {
        id: "blankBg",
        file: "images/blankBg.jpg"
    }, {
        id: "pauseBg",
        file: "images/pauseBg.jpg"
    }, {
        id: "gameData",
        file: "json/gameData.json"
    }, {
        id: "rotateDeviceMessage",
        file: "images/rotateDeviceMessage.jpg"
    }, {
        id: "firework",
        file: "images/stars_149x149.png",
        oAnims: {
            explode: [
                0, 
                1, 
                2, 
                3, 
                4, 
                5, 
                6, 
                7, 
                8, 
                9, 
                10, 
                11, 
                12, 
                13, 
                14, 
                15, 
                16, 
                17, 
                18, 
                19
            ]
        }
    });
    for(var i = 0; i < totalQNum; i++) {
        var numText = (i + 1).toString();
        if(numText.length < 2) {
            numText = "0" + numText;
        }
        aImageData.push({
            id: "question" + i,
            file: "images/questions/KIRIN_BEER_QUESTION_10-" + numText + ".png",
            oAtlasData: {
                id0: {
                    x: 0,
                    y: 0,
                    width: 400,
                    height: 200
                },
                id1: {
                    x: 245,
                    y: 193,
                    width: 243,
                    height: 114
                },
                id2: {
                    x: 245,
                    y: 309,
                    width: 243,
                    height: 114
                },
                id3: {
                    x: 0,
                    y: 309,
                    width: 243,
                    height: 114
                },
                id4: {
                    x: 0,
                    y: 193,
                    width: 243,
                    height: 114
                }
            }
        });
    }
    assetLib = new Utils.AssetLoader(curLang, aImageData, ctx, canvas.width, canvas.height);
    oImageIds.question = "id0";
    oImageIds.answer0 = "id1";
    oImageIds.answer1 = "id2";
    oImageIds.answer2 = "id3";
    oImageIds.answer3 = "id4";
    oImageIds.muteBut1 = "id0";
    oImageIds.muteBut0 = "id1";
    oImageIds.pauseBut = "id2";
    oImageIds.playBut = "id3";
    oImageIds.continueBut = "id4";
    oImageIds.restartBut = "id5";
    oImageIds.linkBut = "id6";
    oImageIds.facebookBut = "id7";
    oImageIds.twitterBut = "id8";
    oImageIds.title = "id0";
    oImageIds.clock = "id1";
    oImageIds.resultSymbol1 = "id2";
    oImageIds.resultSymbol0 = "id3";
    oImageIds.butBg1 = "id4";
    oImageIds.butBg0 = "id5";
    oImageIds.butBg2 = "id6";
    oImageIds.goodEnd = "id7";
    oImageIds.badEnd = "id8";
    oImageIds.questionBg = "id9";
    oImageIds.endPanel = "id10";
    assetLib.onReady(initSplash);
}
function resizeCanvas() {
    var a = window.innerWidth, b = window.innerHeight;
    var w = canvas.width, h = canvas.height;
    if(a > 480) {
        (a -= 1 , b -= 1);
    }
    if(a > b && isMobile && ("loading" != gameState)) {
        rotatePauseOff();
    } else if(rotatePause && isMobile) {
        rotatePauseOff();
    }
    if(a / b < canvas.width / canvas.height) {
        canvas.style.width = a + "px";
        canvas.style.height = (a * h / w) + "px";
        canvasX = 0;
        canvasY = (b - a * h / w) / 2;
        canvasScaleX = canvasScaleY = w / a;
    } else {
        canvas.style.width = b / h * w + "px";
        canvas.style.height = b + "px";
        canvasX = (a - b / h * w) / 2;
        canvasY = 0;
        canvasScaleX = canvasScaleY = h / b;
    }
    canvas.style.marginTop = canvasY + "px";
    canvas.style.marginLeft = canvasX + "px";
    userInput.setCanvas(canvasX, canvasY, canvasScaleX, canvasScaleY);
}
function playSound(_id) {
    if(audioType == 1) {
    }
}
function toggleMute() {
    muted = !muted;
    renderMuteBut();
}
function renderMuteBut() {
}
function toggleManualPause() {
    if(!manualPause) {
        manualPause = true;
        pauseCoreOn();
        var oResumeBut = {
            oImgData: assetLib.getData("uiButs"),
            aPos: [
                canvas.width / 2, 
                760
            ],
            id: oImageIds.continueBut,
            noMove: true
        };
        var aButs = new Array();
        aButs.push(oResumeBut);
        userInput.addHitArea("resumeFromPause", butEventHandler, null, "image", oResumeBut);
        panel = new Elements.Panel("pause", aButs);
        panel.render();
    } else {
        manualPause = false;
        userInput.removeHitArea("exitFromPause");
        userInput.removeHitArea("resumeFromPause");
        pauseCoreOff();
    }
}
function rotatePauseOn() {
    rotatePause = true;
    ctx.drawImage(assetLib.getImg("rotateDeviceMessage"), 0, 0);
    userInput.pauseIsOn = true;
    pauseCoreOn();
}
function rotatePauseOff() {
    rotatePause = false;
    userInput.removeHitArea("exitFromPause");
    userInput.removeHitArea("resumeFromPause");
    pauseCoreOff();
}
function pauseCoreOn() {
    switch(gameState) {
        case "start":
            break;
        case "game":
            userInput.removeHitArea("pause");
            userInput.removeHitArea("answer");
            break;
        case "levelUp":
            userInput.removeHitArea("continue");
            break;
        case "gameOver":
            break;
        case "gameEndFail":
            break;
    }
}
function pauseCoreOff() {
    previousTime = new Date().getTime();
    userInput.pauseIsOn = false;
    switch(gameState) {
        case "start":
            initStartScreen();
            break;
        case "game":
            if(!manualPause) {
                var oPauseBut = {
                    oImgData: assetLib.getData("uiButs"),
                    aPos: [
                        45, 
                        60
                    ],
                    id: oImageIds.pauseBut,
                    noScroll: true
                };
                userInput.addHitArea("pause", butEventHandler, null, "image", oPauseBut);
                var aButs = new Array(oPauseBut);
                var correctId;
                for(var i = 0; i < aAnswers.length; i++) {
                    if(aAnswers[i] == 0) {
                        correctId = i;
                    }
                }
                for(var i = 0; i < aAnswers.length; i++) {
                    var oAnswerBut = {
                        oImgData: assetLib.getData("question" + aQuestions[qNum]),
                        aPos: [
                            aAnswerPos[i][0], 
                            aAnswerPos[i][1]
                        ],
                        id: oImageIds["answer" + aAnswers[i]],
                        gameQ: true,
                        butBgId: 0
                    };
                    userInput.addHitArea("answer", butEventHandler, {
                        id: i,
                        correctId: correctId
                    }, "image", oAnswerBut);
                    aButs.push(oAnswerBut);
                }
                panel = new Elements.Panel(gameState, aButs);
                updateGameEvent();
            } else {
                manualPause = false;
                updateGameEvent();
                toggleManualPause();
            }
            break;
        case "levelUp":
            initLevelUp();
            break;
        case "gameOver":
            initGameComplete();
            break;
        case "gameEndFail":
            initGameEndFail();
            break;
    }
}
