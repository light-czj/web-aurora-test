<template>
    <div>
      <canvas width="600" height="600" id='jeeFaceFilterCanvas'></canvas>
    </div>
</template>

<script>
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

export default {
  data () {
    return {
      THREECAMERA: null
    }
  },
  mounted () {
    setTimeout(() => {
      this.main()
    }, 3000)
  },
  methods: {
    detect_callback (isDetected) {
      if (isDetected) {
        console.log('INFO in detect_callback(): DETECTED')
      } else {
        console.log('INFO in detect_callback(): LOST')
      }
    },
    init_threeScene (spec) {
      const threeStuffs = window.JeelizThreeHelper.init(spec, this.detect_callback)

      // const loader = new THREE.BufferGeometryLoader();
      // loader.load(
      //   'models/luffys_hat.json',
      //   function (geometry, materials) {
      //     // we create our Hat mesh
      //     const mat = new THREE.MeshBasicMaterial({
      //       map: new THREE.TextureLoader().load("models/Texture.jpg")
      //     });
      //     const hatMesh = new THREE.Mesh(geometry, mat);

      //     hatMesh.scale.multiplyScalar(1.2);
      //     hatMesh.rotation.set(0, -40, 0);
      //     hatMesh.position.set(0.0, 0.6, 0.0);
      //     hatMesh.frustumCulled = false;
      //     hatMesh.side = THREE.DoubleSide;

      //     threeStuffs.faceObject.add(hatMesh);
      //   }
      // )

      const modelUrl = 'https://uc.shareuc.com/app/model/Mask03_08_01_jh_00.fbx'
      const loader = new FBXLoader()
      loader.load(modelUrl, function (object) {
        threeStuffs.faceObject.add(object)
      })

      // CREATE LIGHT
      const ambientLight = new THREE.AmbientLight(0XFFFFFF, 0.8)
      threeStuffs.scene.add(ambientLight)

      this.THREECAMERA = window.JeelizThreeHelper.create_camera()
    },

    main () {
      console.log('main')
      window.JeelizResizer.size_canvas({
        canvasId: 'jeeFaceFilterCanvas',
        callback: (isError, bestVideoSettings) => {
          this.init_faceFilter(bestVideoSettings)
        }
      })
    },

    init_faceFilter (videoSettings) {
      window.JEELIZFACEFILTER.init({
        canvasId: 'jeeFaceFilterCanvas',
        NNCPath: './neuralNets/', // path of NN_DEFAULT.json file
        videoSettings: videoSettings,
        callbackReady: (errCode, spec) => {
          if (errCode) {
            console.log('AN ERROR HAPPENED. SORRY BRO :( . ERR =', errCode)
            return
          }

          console.log('INFO: JEELIZFACEFILTER IS READY')
          this.init_threeScene(spec)
        },

        // called at each render iteration (drawing loop)
        callbackTrack: (detectState) => {
          window.JeelizThreeHelper.render(detectState, this.THREECAMERA)
        }
      }) // end JEELIZFACEFILTER.init call
    }
  }
}
</script>

<style scoped lang="less">

</style>
