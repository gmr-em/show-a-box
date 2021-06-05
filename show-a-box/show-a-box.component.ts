import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import *  as THREE from 'three';
import { Line, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

@Component({
  selector: 'app-show-a-box',
  templateUrl: './show-a-box.component.html',
  styleUrls: ['./show-a-box.component.scss']
})
export class ShowABoxComponent implements OnInit, OnDestroy {
  
  @ViewChild('renderer_canvas', {static:true})
  public renderer_canvas: ElementRef<HTMLCanvasElement>;

  camera: THREE.PerspectiveCamera
  corners: Array<THREE.Vector3>;
  lines: Array<Array<THREE.Line>>; // 6 Arrays of 4 lines
  cube: THREE.Mesh;
  reqId: number;
  cubeSize: Vector3 = new Vector3(30,30,30);
  stats: Stats;
  gui;
  readonly params = {
    x: 30,
    y: 30,
    z: 30
  };
  scene: THREE.Scene = new THREE.Scene();
  constructor() { }

  ngOnInit() {
      this.lines = new Array<Array<THREE.Line>>();
      this.showABox();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.reqId);
    this.gui.destroy();
  }

  showABox() {
    this.scene.background = new THREE.Color( 0x809090 );
    // this.scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

    this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
    this.camera.position.set( -40, -40, -40 );
    this.camera.lookAt( 0, 0, 0 );
    let controls = new OrbitControls(this.camera, this.renderer_canvas.nativeElement);
    var renderer = new THREE.WebGLRenderer({canvas: this.renderer_canvas.nativeElement, antialias: true});
    renderer.setSize(800, 800);

    this.addCube();
    this.addVanishingLines();

    let ambientLight = new THREE.AmbientLight(0x808080);
    this.scene.add(ambientLight);
    
    let light = new THREE.DirectionalLight(0xF0F0F0);
    light.position.set(50, 200, 100);
    this.scene.add(light);

    // this.scene.add(new THREE.AxesHelper(30));

    // performance monitor
    this.stats = Stats();
    this.renderer_canvas.nativeElement.parentElement.appendChild( this.stats.dom );

    // GUI
    this.gui = new GUI();
    this.gui.add( this.params, 'x' ).name( 'X scale' ).min(10).max(100).step(1).onChange(()=> this.onBoxResize());
    this.gui.add( this.params, 'y' ).name( 'Y scale' ).min(10).max(100).step(1).onChange(()=> this.onBoxResize());
    this.gui.add( this.params, 'z' ).name( 'z scale' ).min(10).max(100).step(1).onChange(()=> this.onBoxResize());

    let currentMin = -1;
    var animate = () => {
      this.reqId = requestAnimationFrame( animate );     
      
      let minIndex = this.getCameraQuadrant();
      if (minIndex != currentMin) {
        console.log(this.camera.position);
        console.log(`CHANGED TO ${minIndex}`);

        currentMin = minIndex;
        this.hideLines(currentMin);
      }
      this.stats.update();
      renderer.render( this.scene, this.camera );
    };

    animate();
  }

  onBoxResize() {
    this.cubeSize = new Vector3(this.params.x, this.params.y, this.params.z);
    this.recreateScene();
  }
  
  recreateScene() {
    this.scene.remove(this.cube);
    this.lines.forEach((lines)=>lines.forEach(line => this.scene.remove(line)));
    this.lines = [];
    this.addCube();
    this.addVanishingLines();
    this.hideLines(this.getCameraQuadrant());
  }

  addVanishingLines() {
    // array with the lines towards the vanishing points (Array of 3-> Array of 4 lines -> Array of points)
    let size = this.cubeSize.clone();

    // add 4 lines for each point
    let offset = new Vector3(300,0,0);
    let pointsTemplates = [
      new THREE.Vector3( 1, 0, 0 ), 
      new THREE.Vector3( 1, 1, 0),
      new THREE.Vector3( 1, 0, 1),
      new THREE.Vector3( 1, 1, 1)];
    for (let i=0; i<=1; i++) {
      for (let j=0; j<=2; j++) {
        let points = [];
        for (let l=0; l<=3; l++) {
          points.push(pointsTemplates[l].clone().multiply(size));
        }
        let sideLines: Array<THREE.Line> = new Array<THREE.Line>();
        let color = j == 0 ? 0xff0000 : j == 1 ? 0xff : 0xff00;
        var lineMaterial = new THREE.LineBasicMaterial( { color: color} );
        
        let orientedOffset = new Vector3().add(offset).multiplyScalar(Math.pow(-1, i));
        for (let point of points) {
          var geometry = new THREE.BufferGeometry().setFromPoints( [point, new Vector3().addVectors(point, orientedOffset)] );
          sideLines.push(new Line(geometry, lineMaterial));
        }

        offset = this.shiftVector3(offset);
        this.lines.push(sideLines);
        // shift template
        pointsTemplates.map(val => {
          this.shiftVector3(val);
        });
      }
      pointsTemplates.map(val => {
        val.x = 0;
      });
    }
    this.lines.forEach((lines)=>lines.forEach(line => this.scene.add(line)));
  }

  shiftVector3(vec: Vector3) : Vector3 {
    vec.set(vec.y, vec.z, vec.x);
    return vec;
  }

  addCube() {
    var geometry = new THREE.BoxGeometry(this.cubeSize.x, this.cubeSize.y, this.cubeSize.z);

    var material = new THREE.MeshLambertMaterial( { color: 0x606060 } );
    this.cube = new THREE.Mesh( geometry, material );
    this.cube.position.copy(this.cubeSize).divideScalar(2);

    this.scene.add( this.cube );
  }

  hideLines(closestCorner: number) {
    // 0 means line is going towards the positive end of the axis; 1 towards the negative
    let closestPoint_thingy = [[0,0,0], [0,1,0], [1,0,0], [1,1,0], [0,0,1], [0,1,1], [1,0,1], [1,1,1]];

    closestPoint_thingy[closestCorner].forEach((val, index) => {
      this.lines[index].forEach(line => line.visible = val == 0);
      this.lines[index+3].forEach(line => line.visible = val == 1);
    })
  }

  // camera pos is used to know which corner is closest to it
  // 0 - x, y, z < 0
  // 1 - x, y    < 0   z       > 0
  // 2 - y, z    < 0   x       > 0
  // 3 - y       < 0   x, z    > 0
  // 4 - x, z    < 0   y       > 0
  // 5 - x       < 0   y, z    > 0
  // 6 -               x, y, z > 0
  // 7 - y       < 0   x, z    > 0

  getCameraQuadrant() {
    let cameraPos = this.camera.position;
    let sx = cameraPos.x > 0 ? 1 : 0; 
    let sy = cameraPos.y > 0 ? 1 : 0;
    let sz = cameraPos.z > 0 ? 1 : 0;
    
    let index = 4 * sy + 2 * sx + sz;
    return index
  }
}