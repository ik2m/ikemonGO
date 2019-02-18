//デバグ用ツール

var debugGazo1,debugGazo2;
function addDebugtool(scene) {
    //テクスチャ読み込み
    const debugMat1 = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load("img/debug1.png"),
    });  
    debugGazo1 = new THREE.Sprite(debugMat1);
    scene.add(debugGazo1);

    const debugMat2 = new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load("img/debug2.png"),
    });  
    debugGazo2 = new THREE.Sprite(debugMat2);
    scene.add(debugGazo2);
}
function setDGazoPos (DGazo,Vec2d){
    DGazo.scale.set(0.01,0.01,0.01);
    DGazo.position.x=Vec2d.x;
    DGazo.position.y=Vec2d.y;
    DGazo.position.z=0;
    DGazo.position.unproject(camera_E);
}