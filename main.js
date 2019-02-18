//全体の制御

Physijs.scripts.worker='./libs/physijs_worker.js';
Physijs.scripts.ammo='./ammo.js';

/*ゲームの状態管理用*/
var debugmode=false;
var stats;
var renderer,composer;
/*捕獲パート*/
const BG_COLOR=0x50DFFC;
const BALL_MASS=2;
const DEFAULT_BALL_POS=new THREE.Vector3(0,20,50);
const DEFAULT_TARGET_POS=new THREE.Vector3(0,5,0);
const DEFAULT_CAMERA_POS = new THREE.Vector3(0,30,60);
var throwObjects= [];
var throwed,bounced,isGotta=false;
var camera_E, scene, target ,ball;
const animClock  = new THREE.Clock();
var animMixser;//CGアセットのアニメーションミキサー


// キューオブジェクト
function Queue() {
	this.__a = new Array();
}
Queue.prototype.enqueue = function(o) {
	this.__a.push(o);
}
Queue.prototype.dequeue = function() {
	if( this.__a.length > 0 ) {
		return this.__a.shift();
	}
	return null;
}
Queue.prototype.size = function() {
	return this.__a.length;
} 
Queue.prototype.toString = function() {
	return '[' + this.__a.join(',') + ']';
}
Queue.prototype.clear = function() {
	this.__a.length = 0;
}




function init() {
  stats=initStats();
  //レンダラ
  renderer = new THREE.WebGLRenderer( );
  renderer.setClearColor(new THREE.Color(BG_COLOR));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  
  

  init_E();
  scene_A=target;
  var i=0;
  function render() {
    stats.update();
    document.getElementById("WebGL-output").appendChild(renderer.domElement);
    if(debugmode){
      debugGazo1.visible=true;
      debugGazo2.visible=true;
      target.material.visible=true;
    }else{
      debugGazo1.visible=false;
      debugGazo2.visible=false;
      target.material.visible=false;
    }

    if (animMixser) {
      animMixser.update(animClock.getDelta());
    }
    //console.log(animMixser);

    anim_E();
    TWEEN.update();
    requestAnimationFrame(render);
    
    proton.update();
    renderer.render(scene, camera_E);
    scene.simulate();
  }

  render();
}

function addPostProcessing(scene,camera){
  //ポストプロセッシング
  composer = new THREE.EffectComposer( renderer );
	var renderPass = new THREE.RenderPass( scene, camera );
	composer.addPass( renderPass );
	outlinePass = new THREE.OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
	composer.addPass( outlinePass );
}


function setDefaultBallPos(throwObject){//ボールの位置をデフォルトに設置
  throwObject.position.copy(DEFAULT_BALL_POS);
  throwObject.__dirtyPosition  =  true ;
  throwObject.mass=0;//重さを0に
  throwed=false;
  bounced=false;
  throwObjects.push(ball);
  startAppearanceEffect(ball);//エフェクトを出す
}

function setDefaultCameraPos(){//カメラの位置をデフォルトに設置
  camera_E.position.copy(DEFAULT_CAMERA_POS);
  camera_E.lookAt(scene.position);
}

function throwVector(camera,mouseMoveVec){//投げたときのベクトルを返す
  var moveVecY=(mouseMoveVec.y-1)*(mouseMoveVec.y-1)*(mouseMoveVec.y-1)+1;

  var moveVecX=mouseMoveVec.x;
  //console.log((mouseVector.x+moveVecX)*(camera.fov/2));
  return new THREE.Vector3((mouseVector.x+moveVecX)*(camera.fov/2), 30*moveVecY, -50*moveVecY);
  //console.log(mouseVectorP.x*(camera.fov/2));
}

function init_E(){
    //シーン
    scene = new Physijs.Scene({fixedTimeStep:1/60 });
    scene.setGravity(new THREE.Vector3(0,-100,0));//重力を指定
    scene.fog = new THREE.Fog(BG_COLOR,70,120);//フォグ
    //カメラ
    camera_E = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    setDefaultCameraPos();
    //地面
    var groundGeometry = new THREE.BoxGeometry(550, 2,550,11,1,11);
    var groundMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({color: 0x8BC34A}),/*摩擦*/0.5,/*反発*/0.7);

    var ground = new Physijs.BoxMesh(groundGeometry, groundMaterial,0);
    ground.position.set(0,-1,0);
    ground.receiveShadow = true;
    scene.add(ground);
    //捕獲ターゲット
    var cubeGeometry = new THREE.BoxGeometry(7, 6, 10);
    var cubeMaterial_N = Physijs.createMaterial(
      new THREE.MeshLambertMaterial({color:0x000000,wireframe: true}),/*摩擦*/0.0,/*反発*/1);
    cubeMaterial_N.visible=false;
    target = new Physijs.BoxMesh(cubeGeometry, cubeMaterial_N,0);
    target.position.copy(DEFAULT_TARGET_POS);
    target.rotation.y=-3/5;
    //arget.visible=false;
    scene.add(target);

    //キャラクターのローダー
    var loader = new THREE.GLTFLoader();
   
    //var sakanaMesh=new THREE.Object3D;
    loader.load(//GLTFローダーの設定
      // resource URL
      'models/sakana/sakana.gltf',
      // called when the resource is loaded
      function ( gltf ) {
        //sakanaMesh.add(gltf.scene);
        //sakanaMesh.copy(gltf.scene);
        gltf.scene.position.set(0,-4,-3);
        gltf.scene.scale.set(0.5,0.5,0.5);
        gltf.asset.castShadow = true;
        //console.log(sakanaMesh);
        console.log(gltf.scene);
        target.add( gltf.scene );

        if (gltf.animations && gltf.animations.length) {

          var i;
          
          animMixser = new THREE.AnimationMixer(gltf.scene);
          console.log(animMixser);

          for (i = 0; i < gltf.animations.length; i ++ ) {
      
            animMixser.clipAction( gltf.animations[ i ] ).play();
            console.log(gltf.animations[ i ]);
          }
      
        }
        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Scene
        gltf.scenes; // Array<THREE.Scene>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object
      },
      // called while loading is progressing
      function ( xhr ) {

        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

      },
      // called when loading has errors
      function ( error ) {

        console.log( 'An error happened' );
            console.log(error);
      }
    );

    //ボール
    var ballGeo=new THREE.SphereGeometry(1,16,16);
    var ballMat=Physijs.createMaterial(new THREE.MeshToonMaterial(),/*摩擦*/0.4,/*反発*/0.8);
    ballMat.color.set( '#69f' );
    ball=new Physijs.SphereMesh(ballGeo, ballMat,0);
    ball.castShadow = true;
    setDefaultBallPos(ball);
    scene.add(ball);

    //光源
    var hemiLight=new THREE.HemisphereLight(0xffffff); 
    hemiLight.intensity= 0.3;
    scene.add(hemiLight);
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-10, 70, 50);
    scene.add(spotLight);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.set(5000,5000);//影の細かさ
    
    //パーティクルエンジン
    proton = new Proton();
    proton.addEmitter(createEmitter());
    proton.addEmitter(createEmitter2());
    proton.addEmitter(createAppearanceE());
    proton.addRender(new Proton.SpriteRender(scene));
    
    //その他エフェクト
    addFlash(scene);
    addShockWave(scene);

    addDebugtool(scene);
    
    //ボールを投げた後のタイマー
    throwTimer=new THREE.Clock(false);
  
    //ボールヒット後のアニメーション
    var posSrc = { P1:0,P2:0,P3:0,P4:0,P5:0, };
    var hitPos = new THREE.Vector3(0,0,0);
    hitTw1 = new TWEEN.Tween(posSrc).to({P1:1},800).easing(TWEEN.Easing.Circular.Out);
    hitTw2 = new TWEEN.Tween(posSrc).to({P2:1},400).easing(TWEEN.Easing.Sinusoidal.Out);
    hitTw3 = new TWEEN.Tween(posSrc).to({P3:1},1000).easing(TWEEN.Easing.Bounce.Out);
    hitTw4 = new TWEEN.Tween(posSrc).to({P4:1},1000).repeat(2);
    hitTw5 = new TWEEN.Tween(posSrc).to({P5:1},1000);
    hitTw1.chain(hitTw2);
    hitTw2.chain(hitTw3);
    hitTw3.chain(hitTw4);
    hitTw4.chain(hitTw5);
    hitTw1.onStart(function(){flash.visible=true;})
    hitTw1.onUpdate( function(){//ぶつかった直後のアニメーション
      pos=this.P1;
      ball.position.set(hitPos.x+(5-hitPos.x)*pos,
                        hitPos.y+(15-hitPos.y)*pos,
                        hitPos.z+(0-hitPos.z)*pos);//ヒット位置から（5,10,0）へ移動
        if(pos>0.5){
        var progress=(pos-0.5)*2
        target.position.set(5*progress,15*progress,0*progress);
        var targetScale=1-progress;
        target.scale.set(targetScale,targetScale,targetScale);
      }
      target.__dirtyPosition=true;
      ball.__dirtyPosition  =  true ;
      flash.position.copy(ball.position);
      flash.scale.set(50*pos,50*pos,50*pos);
    });
    hitTw1.onComplete(function(){
      setEmitterPos(hitAnimE1,new THREE.Vector3(0,10,0));
      target.scale.set(1,1,1)
      hitAnimE1.emit();
      flash.visible=false;
    });
    hitTw2.onUpdate( function(){//硬直アニメーション
      pos=this.P2;//1~2を0~1に変更
      ball.position.set(0,10,0);
      ball.__dirtyPosition  =  true ;
      target.position.set(0,-10,0);
      target.__dirtyPosition=true;
      
      shockWave.visible=true;
      shockWave.position.copy(ball.position);
      var sWScale = 15*pos
      shockWave.scale.set(sWScale,sWScale,sWScale);
      shockWave.material.opacity=(1-pos*pos);

      camera_E.position.set(0,10,20);
      camera_E.__dirtyPosition  =  true ;
      camera_E.lookAt(ball.position);
    });
    hitTw2.onComplete(function(){
      shockWave.visible=false;
      hitAnimE1.stopEmit();
    });
    hitTw3.onUpdate(function(){//ボールが地面に落ちるアニメーション
      pos=this.P3;//1~2を0~1に変更
      ball.position.set(0,10-9*pos,0);
      ball.__dirtyPosition  =  true ;
  
      camera_E.position.set(0,10,20);
      camera_E.__dirtyPosition  =  true ;
      camera_E.lookAt(ball.position);
    });
    hitTw4.onUpdate(function(){//ボールが揺れるアニメーション
      pos=this.P4;
      if(pos>=0.75){
        ball.rotation.set(0,0,((pos-0.75)/0.25)*Math.PI);
        ball.position.set(Math.sin(2*Math.PI*((pos-0.75)/0.25))*0.5,1,0);
      }else{
        ball.position.set(0,1,0);
        ball.__dirtyPosition  =  true ;
      }
      camera_E.position.set(0,10,20);
      camera_E.lookAt(new THREE.Vector3(0,1,0));
    });
    hitTw5.onUpdate(function(){//最後の待機アニメーション
      pos=this.P5;
  
      camera_E.position.set(0,10,20);
      camera_E.lookAt(ball.position);
    });
    hitTw5.onComplete(function(){//アニメーション終了後
      if(isGotta){//ゲット成功かの判定

        setDefaultCameraPos();
        setDefaultBallPos(ball);
        target.position.copy(DEFAULT_TARGET_POS);//ターゲットの位置を元に戻す
        target.__dirtyPosition=true;
      }else{
        setDefaultCameraPos();
        setDefaultBallPos(ball);
        target.position.copy(DEFAULT_TARGET_POS);//ターゲットの位置を元に戻す
        target.__dirtyPosition=true;
      }
      hitTw4.repeat(2);
      posSrc.P1=0;posSrc.P2=0;posSrc.P3=0;posSrc.P4=0;posSrc.P5=0;
    })
    
    var throwObjectControl =new THREE.DragControls(throwObjects,camera_E,renderer.domElement);
    throwObjectControl.addEventListener('drag',function(){
      ball.__dirtyPosition=true ;
    })

    throwObjectControl.addEventListener('dragend',function(){
        //マウスの位置から動かしたベクトルを生成
        var mouseMoveVec=ratestMousePosP.clone();
        mouseMoveVec.addScaledVector(firstMousePosP,-1);
        if(throwed!==true){
          throwed=true;
          throwObjects.shift();//操作対象から外してボールのコントロールを効かなくかなくする
          ball.mass=BALL_MASS;
          ball.setLinearVelocity(throwVector(camera_E,mouseMoveVec));
          throwTimer.start();
        }
        mousePosQueue.clear();
        throwE.emit();
        if(debugmode===true){
          setDGazoPos(debugGazo1,firstMousePosP);
          setDGazoPos(debugGazo2,ratestMousePosP);
        }
    })

    ball.addEventListener( 'collision', function(hitObject) {
      if(hitObject===target && bounced!==true){
        ball.mass=0;
        //console.log("HIT!");
        hitPos=ball.position.clone();
        throwTimer.stop();
        hitTw1.start();
        throwE.stopEmit();
      }
      if(hitObject===ground){bounced=true;throwE.stopEmit();}//一度地面に当たるとバウンドボール判定になる
    });
}



var mousePosQueue = new Queue();//スクリーン上のボールの位置をキューで格納
var ratestMousePosP=new THREE.Vector2() , firstMousePosP=new THREE.Vector2();
function anim_E(){
  if(throwTimer.getElapsedTime()>2.5 && throwed === true){
    throwTimer.stop();
    setDefaultBallPos(ball);
  }

  //ボールの位置をキューに格納(８フレーム前の座標まで)
  if(mousePosQueue.size()===0){firstMousePosP.copy(mouseVectorP);}
  ratestMousePosP.copy(mouseVectorP);
  mousePosQueue.enqueue(ratestMousePosP.clone());
  if(mousePosQueue.size()>8){firstMousePosP.copy(mousePosQueue.dequeue());}
  
  setEmitterPos(throwE,ball.position);
}

function initStats(){//ステータス情報の表示
  stats = new Stats();
  stats.setMode(0);
  stats.domElement.style.position='absolute';
  stats.domElement.style.left='0px';
  stats.domElement.style.top='0px';
  document.getElementById("Stats-output").appendChild(stats.domElement);
  return stats;
}

//自動的にリサイズする
function onResize() {
  camera_E.aspect = window.innerWidth / window.innerHeight;
  camera_E.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


window.onload = init;
window.addEventListener('resize', onResize, false);

window.addEventListener( "mousemove", onMouseMove, false );
window.addEventListener( "mousedown", onClick, false );


//マウスオーバー時の処理
var selectedObject = null;
var changingObject = null;
function onMouseMove( event ) {
  event.preventDefault();
  if ( selectedObject ) {
    //selectedObject.material.color.set( '#69f' );
    selectedObject = null;
  }
  var intersects = getIntersects( event.layerX, event.layerY );
  if ( intersects.length > 0 ) {
    var res = intersects.filter( function ( res ) {
      return res && res.object;
    } )[ 0 ];
    if ( res && res.object ) {
      selectedObject = res.object;
      //selectedObject.material.color.set( '#f00' );
    }
  }
}

function onClick( event ) {
 event.preventDefault();
    
  if ( selectedObject ) {
    selectedObject = null;
  }
  var intersects = getIntersects( event.layerX, event.layerY );
  if ( intersects.length > 0 ) {
    var res = intersects.filter( function ( res ) {
      return res && res.object;
    } )[ 0 ];
    if ( res && res.object ) {
      selectedObject = res.object;
    }
  }
}
var mouseVector = new THREE.Vector3();
var mouseVectorP = new THREE.Vector2();
function getIntersects( x, y ) {
  x = ( x / window.innerWidth ) * 2 - 1;
  y = - ( y / window.innerHeight ) * 2 + 1;
  mouseVectorP.set(x,y);
  mouseVector.set( x, y, 1 );
    mouseVector.unproject(camera_E);
    var raycaster = new THREE.Raycaster(camera_E.position, mouseVector.sub(camera_E.position).normalize());
    return raycaster.intersectObjects( throwObjects, true );
}

