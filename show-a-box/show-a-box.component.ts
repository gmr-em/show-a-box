import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import *  as THREE from 'three';
import { Line, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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

  constructor() { }

  ngOnInit() {
      this.lines = new Array<Array<THREE.Line>>();
      this.showABox();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.reqId);
  }

  showABox() {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x809090 );
    // scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

    this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
    this.camera.position.set( 40, 40, 40 );
    this.camera.lookAt( 0, 0, 0 );
    let controls = new OrbitControls(this.camera, this.renderer_canvas.nativeElement);
    var renderer = new THREE.WebGLRenderer({canvas: this.renderer_canvas.nativeElement, antialias: true});
    renderer.setSize(800, 800);

    this.addCube(scene);
    this.addVanishingLines(scene);

    let ambientLight = new THREE.AmbientLight(0x808080);
    scene.add(ambientLight);
    
    let light = new THREE.DirectionalLight(0xF0F0F0);
    light.position.set(50, 200, 100);
    scene.add(light);

    scene.add(new THREE.AxesHelper(30));
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
      renderer.render( scene, this.camera );
    };

    animate();
  }

  addVanishingLines(scene: THREE.Scene) {
    // array with the lines towards the vanishing points (Array of 3-> Array of 4 lines -> Array of points)
    let cubeOffset = 10;
    let points = [
                new THREE.Vector3(   ), 
                new THREE.Vector3( 0, 10, 0  ),
                new THREE.Vector3( 0, 0 , 10),
                new THREE.Vector3( 0, 10, 10)];
    
    // add 4 lines for each point
    let offset = new Vector3(300,0,0);
    for (let i=0; i<=1; i++) {
      for (let j=0; j<=2; j++) {
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
        // shift points 
        points.map(val => {
          this.shiftVector3(val);
        });
      }
    }
    this.lines.forEach((lines)=>lines.forEach(line => scene.add(line)));
  }

  shiftVector3(vec: Vector3) : Vector3 {
    vec.set(vec.y, vec.z, vec.x);
    return vec;
  }

  addCube(scene: THREE.Scene) {
    var geometry = new THREE.BoxGeometry(10,10,10);
    // geometry.setFromPoints(this.corners);

    var material = new THREE.MeshLambertMaterial( { color: 0x606060 } );
    this.cube = new THREE.Mesh( geometry, material );
    this.cube.position.set(5,5,5);

    scene.add( this.cube );
  }

  hideLines(closestCorner: number) {
    // 0, 3, 5, 6
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
    let sx = cameraPos.x > 5 ? 1 : 0 
    let sy = cameraPos.y > 5 ? 1 : 0
    let sz = cameraPos.z > 5 ? 1 : 0
    
    let index = 4 * sy + 2 * sx + sz
    return index
  }
}