import { visitAll } from '@angular/compiler';
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

  constructor() { }

  ngOnInit() {
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

				renderer.render( scene, camera );
			};

			animate();
  }

  showABox_v2() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
    camera.position.set( 0, 0, 100 );
    camera.lookAt( 0, 0, 0 );
    let controls = new OrbitControls(camera, this.renderer_canvas.nativeElement);
    var renderer = new THREE.WebGLRenderer({canvas: this.renderer_canvas.nativeElement});
    renderer.setSize(800, 800);

    this.addCube(scene);
    this.addVanishingLines(scene);

    scene.add(new THREE.AxesHelper(30));
    var animate = function () {
      requestAnimationFrame( animate );

      renderer.render( scene, camera );
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

  addVanishingLines(scene: THREE.Scene) {
    // array with the lines towards the vanishing points (Array of 3-> Array of 4 lines -> Array of points)
    let vanishingLines = [[[]], [[]], [[]]];
    let points = [
                new THREE.Vector3(   ), 
                new THREE.Vector3( 0, 10, 0 ), 
                new THREE.Vector3( 0, 0 , 10 ), 
                new THREE.Vector3( 0, 10, 10)];
    let closestPoint_thingy = [[0,0,0], [1,0,0], [1,1,0], [0,1,0], [0,0,1], [1,0,1], [1,1,1], [0,1,1]];
    let selectedPoint_thingy = 7;
    // add 4 lines for each point
    let offset = new Vector3(300,0,0);
    for (let j=0; j<=2; j++) {
      var lineMaterial = new THREE.LineBasicMaterial( { color: 0xff << j} );

      for (let i=0; i<=3; i++) {
        let orientedOffset = new Vector3().add(offset).multiplyScalar(Math.pow(-1, closestPoint_thingy[selectedPoint_thingy][j]));
        vanishingLines[j].push([points[0], new Vector3().addVectors(points[0], orientedOffset)]);
        vanishingLines[j].push([points[1], new Vector3().addVectors(points[1], orientedOffset)]);
        vanishingLines[j].push([points[2], new Vector3().addVectors(points[2], orientedOffset)])
        vanishingLines[j].push([points[3], new Vector3().addVectors(points[3], orientedOffset)]);
        for (let linePoints of vanishingLines[j]) {
          var geometry = new THREE.BufferGeometry().setFromPoints( linePoints );
          let line = new Line(geometry, lineMaterial);
          scene.add(line);
        }  
      }
      offset = this.shiftVector3(offset);
      console.log(offset);
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
      
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(5,5,5);
    scene.add( cube );
  }
}