import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import *  as THREE from 'three';
import { Line, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

@Component({
  selector: 'app-show-a-box',
  templateUrl: './show-a-box.component.html',
  styleUrls: ['./show-a-box.component.scss']
})
export class ShowABoxComponent implements OnInit {
  
  @ViewChild('renderer_canvas', {static:true})
  public renderer_canvas: ElementRef<HTMLCanvasElement>;

  camera: THREE.PerspectiveCamera
  corners: Array<THREE.Vector3>;
  lines: Array<Array<THREE.Line>>; // 6 Arrays of 4 lines
  cube: THREE.Mesh;

  constructor() { }

  ngOnInit() {
      this.lines = new Array<Array<THREE.Line>>();
      this.generateCorners();
      this.showABox_v2();
  }

  showBox() {
      var scene = new THREE.Scene();
			var camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
      let controls = new OrbitControls(camera, this.renderer_canvas.nativeElement);
			var renderer = new THREE.WebGLRenderer({canvas: this.renderer_canvas.nativeElement});
      renderer.setSize(800, 800);
      var geometry = new THREE.BoxGeometry();
      
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var cube = new THREE.Mesh( geometry, material );
			scene.add( cube );

			camera.position.z = 5;

			var animate = function () {
				requestAnimationFrame( animate );

				cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        console.log(camera.position);

				renderer.render( scene, camera );
			};

			animate();
  }

  showABox_v2() {
    var scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
    this.camera.position.set( 0, 0, 100 );
    this.camera.lookAt( 0, 0, 0 );
    let controls = new OrbitControls(this.camera, this.renderer_canvas.nativeElement);
    var renderer = new THREE.WebGLRenderer({canvas: this.renderer_canvas.nativeElement});
    renderer.setSize(800, 800);

    this.addCube(scene);
    this.addVanishingLines(scene, 0);
    this.addVanishingLines(scene, 6);

    this.lines.forEach((lines)=>lines.forEach(line => scene.add(line)));
    
    // scene.add(new THREE.AxesHelper(30));
    let currentMin = -1;
    var animate = () => {
      requestAnimationFrame( animate );
      
      let minIndex = this.getClosestCornerToCamera();
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

  addPlane(scene: THREE.Scene) {
    var geometry = new THREE.PlaneBufferGeometry( 10, 10, 10 );
    var material = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    console.log(plane.position);
    plane.position.set(5,5,0);
    console.log(plane.position);
    scene.add( plane );
  }

  addVanishingLines(scene: THREE.Scene, selectedPoint_thingy: number) {
    // array with the lines towards the vanishing points (Array of 3-> Array of 4 lines -> Array of points)
    
    let points = [
                new THREE.Vector3(   ), 
                new THREE.Vector3( 0, 10, 0 ), 
                new THREE.Vector3( 0, 0 , 10 ), 
                new THREE.Vector3( 0, 10, 10)];
    let closestPoint_thingy = [[0,0,0], [0,0,1], [0,1,1], [0,1,0], [1,0,0], [1,0,1], [1,1,1], [1,1,0]];
    
    // add 4 lines for each point
    let offset = new Vector3(300,0,0);
    for (let j=0; j<=2; j++) {
      let sideLines: Array<THREE.Line> = new Array<THREE.Line>();
      var lineMaterial = new THREE.LineBasicMaterial( { color: 0xff << (j*8)} );

      let vanishingLines = [];
      let orientedOffset = new Vector3().add(offset).multiplyScalar(Math.pow(-1, closestPoint_thingy[selectedPoint_thingy][j]));
      vanishingLines.push([points[0], new Vector3().addVectors(points[0], orientedOffset)]);
      vanishingLines.push([points[1], new Vector3().addVectors(points[1], orientedOffset)]);
      vanishingLines.push([points[2], new Vector3().addVectors(points[2], orientedOffset)])
      vanishingLines.push([points[3], new Vector3().addVectors(points[3], orientedOffset)]);
      console.log(vanishingLines.length);
      for (let linePoints of vanishingLines) {
        var geometry = new THREE.BufferGeometry().setFromPoints( linePoints );
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

  shiftVector3(vec: Vector3) : Vector3 {
    vec.set(vec.y, vec.z, vec.x);
    console.log(vec);
    return vec;
  }

  addCube(scene: THREE.Scene) {
    var geometry = new THREE.BoxGeometry(10,10,10);
    // geometry.setFromPoints(this.corners);
      
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    this.cube = new THREE.Mesh( geometry, material );
    this.cube.position.set(5,5,5);

    scene.add( this.cube );
  }

  generateCorners() {
    this.corners = new Array<THREE.Vector3>(8);
    this.corners[0] = new THREE.Vector3(0,0,0);
    this.corners[1] = new THREE.Vector3(0,10,0);
    this.corners[2] = new THREE.Vector3(0,10,10);
    this.corners[3] = new THREE.Vector3(0,0,10);
    this.corners[4] = new THREE.Vector3(10,0,0);
    this.corners[5] = new THREE.Vector3(10,10,0);
    this.corners[6] = new THREE.Vector3(10,10,10);
    this.corners[7] = new THREE.Vector3(10,0,10);
  }

  getClosestCornerToCamera() : number {
    let cameraPosition = this.camera.position;
    let minDistance = Number.MAX_VALUE;
    let minDistanceIndex = -1;
    this.corners.forEach((corner, index) => {
      let distance = cameraPosition.distanceTo(corner);
      if (distance < minDistance) {
        minDistanceIndex = index;
        minDistance = distance;
      }
      // console.log(index, "->", distance);
    })
    // debugger;
    return minDistanceIndex;
  }

  hideLines(closestCorner: number) {
// 0, 3, 5, 6
    let closestPoint_thingy = [[0,0,0], [0,0,1], [0,1,1], [0,1,0], [1,0,0], [1,0,1], [1,1,1], [1,1,0]];

    closestPoint_thingy[closestCorner].forEach((val, index) => {
      this.lines[index].forEach(line => line.visible = val == 0);
      this.lines[index+3].forEach(line => line.visible = val == 1);
    })

  }
}