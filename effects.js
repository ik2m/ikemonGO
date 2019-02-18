//エフェクト関連

var proton_E,hitAnimE1,throwE,flash,shockWave;
//プロトンエンジン
function setEmitterPos(emitter,posVec3){
    emitter.p.x=posVec3.x;
    emitter.p.y=posVec3.y;
    emitter.p.z=posVec3.z;
}

function createSprite() {
    var map = new THREE.TextureLoader().load("./img/dot.png");
    var material = new THREE.SpriteMaterial({
        map: map,
        color: 0xff0000,
        blending: THREE.AdditiveBlending,
        fog: true,
        depthWrite:false
    });
    return new THREE.Sprite(material);
}
function createEmitter() {
    hitAnimE1 = new Proton.Emitter();//エミッター生成
    //Rate(numpan,timepan)hitAnimE1.rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(.1, .25));
    hitAnimE1.rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(.1));
    hitAnimE1.addInitialize(new Proton.Mass());
    hitAnimE1.addInitialize(new Proton.Radius(5));//100//半径
    hitAnimE1.addInitialize(new Proton.Life(0.5,1));//(2,4)
    hitAnimE1.addInitialize(new Proton.Body(createSprite()));
    hitAnimE1.addInitialize(new Proton.Position(new Proton.BoxZone(2)));//100
    hitAnimE1.addInitialize(new Proton.Velocity(20, new Proton.Vector3D(0, 1, 1), 180));
    // //hitAnimE1.addBehaviour(new Proton.RandomDrift(30, 30, 30, .05));
    hitAnimE1.addBehaviour(new Proton.Rotate("random", "random"));
    hitAnimE1.addBehaviour(new Proton.Scale(1, 0));
    hitAnimE1.addBehaviour(new Proton.Alpha(1, 0, Infinity, Proton.easeInQuart));
    //var zone2 = new Proton.BoxZone(400);
    //hitAnimE1.addBehaviour(new Proton.CrossZone(zone2, "bound"));
    //hitAnimE1.addBehaviour(new Proton.Collision(hitAnimE1,true));
    hitAnimE1.addBehaviour(new Proton.Color(0xff0000, 'random', Infinity, Proton.easeOutQuart));
    hitAnimE1.p.x = 0;
    hitAnimE1.p.y = 0;
    //hitAnimE1.emit();
    //hitAnimE1.stopEmit();エミッターを止めるときはこれ
    return hitAnimE1;
}
function createEmitter2() {
    throwE = new Proton.Emitter();//エミッター生成
    throwE.rate = new Proton.Rate(new Proton.Span(1, 5), new Proton.Span(.1));
    throwE.addInitialize(new Proton.Mass());
    throwE.addInitialize(new Proton.Radius(1));//100//半径
    throwE.addInitialize(new Proton.Life(1,2));//(2,4)
    throwE.addInitialize(new Proton.Body(createSprite()));
    throwE.addInitialize(new Proton.Position(new Proton.BoxZone(2)));//100
    //throwE.addInitialize(new Proton.Velocity(10, new Proton.Vector3D(0, 1,1 ), 180));
    throwE.addBehaviour(new Proton.RandomDrift(0.05,0.05,0.05, .05));
    throwE.addBehaviour(new Proton.Rotate("random", "random"));
    throwE.addBehaviour(new Proton.Scale(1, 0));
    throwE.addBehaviour(new Proton.Alpha(1, 0, Infinity, Proton.easeInQuart));
    throwE.addBehaviour(new Proton.Color(0xffffff, 0xffffff, Infinity, Proton.easeOutQuart));
    throwE.p.x = 0;
    throwE.p.y = 0;
    //throwE.emit();
    //throwE.stopEmit();エミッターを止めるときはこれ
    return throwE;
}

//汎用のオブジェクト出現エフェクト

function startAppearanceEffect(object){
    AppearanceEffectSrc.object=object;
    AppearanceTw.start();
    
}

function createAppearanceE(){
    AppearanceE = new Proton.Emitter();//エミッター生成
    AppearanceE.rate = new Proton.Rate(new Proton.Span(10, 10), new Proton.Span(.1));
    AppearanceE.addInitialize(new Proton.Mass());
    AppearanceE.addInitialize(new Proton.Radius(1.5));//100//半径
    AppearanceE.addInitialize(new Proton.Life(0.5,0.5));//(2,4)
    AppearanceE.addInitialize(new Proton.Body(createSprite()));
    AppearanceE.addInitialize(new Proton.Position(new Proton.BoxZone(3.5)));//100
    AppearanceE.addInitialize(new Proton.Velocity(10, new Proton.Vector3D(0, 0, 1), 180));
    AppearanceE.addBehaviour(new Proton.RandomDrift(1, 1, 1, .05));
    AppearanceE.addBehaviour(new Proton.Rotate("random", "random"));
    AppearanceE.addBehaviour(new Proton.Scale(1, 0));
    AppearanceE.addBehaviour(new Proton.Alpha(1, 0, Infinity, Proton.easeInQuart));
    AppearanceE.addBehaviour(new Proton.Color(0xffffff, 0xffffff, Infinity, Proton.easeOutQuart));
    AppearanceE.p.x = 0;
    AppearanceE.p.y = 0;
    //throwE.emit();
    //throwE.stopEmit();エミッターを止めるときはこれ
    return AppearanceE;
}
var AppearanceEffectSrc = { pos:0,object:new THREE.Object3D()};
AppearanceTw = new TWEEN.Tween(AppearanceEffectSrc).to({pos:1},200).easing(TWEEN.Easing.Circular.In);
AppearanceTw.onStart(function(){
    var object=this.object;
    setEmitterPos(AppearanceE,object.position);
    AppearanceE.emit();
})
AppearanceTw.onUpdate(function(){});
AppearanceTw.onComplete(function(){
    AppearanceE.stopEmit();
});

//ボールヒット時に出てくるフラッシュのスプライト
function addFlash(scene) {
    var map = new THREE.TextureLoader().load("./img/flash_b.png");
    var material = new THREE.SpriteMaterial({
        map: map,
        rotation:-Math.PI/2,
        color: 0xff2222,
        transparent: true,
        blending: THREE.AdditiveBlending,
        //fog: true,
        depthWrite:false
    });
    flash = new THREE.Sprite(material)
    flash.visible=false;
    scene.add(flash);
}
function addShockWave(scene){
    var plane =new THREE.PlaneGeometry( 1,1,1 );
    var map = new THREE.TextureLoader().load("./img/shockwave_b.png");
    var material = new THREE.MeshBasicMaterial({
        map: map,
        color: 0xffffff,
        transparent: true, 
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite:false
    });
    shockWave = new THREE.Mesh( plane, material );
    shockWave.visible=false;
    shockWave.rotateX(-Math.PI/4);
    scene.add(shockWave);
}