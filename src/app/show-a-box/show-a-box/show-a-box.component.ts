import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import *  as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

@Component({
  selector: 'app-show-a-box',
  templateUrl: './show-a-box.component.html',
  styleUrls: ['./show-a-box.component.scss']
})
export class ShowABoxComponent implements OnInit {
  
  @ViewChild('renderer_canvas', {static:false})
  public renderer_canvas: ElementRef<HTMLCanvasElement>;

  constructor() { }

  ngOnInit() {
      this.showBox();
      
  }

  showBox() {
    var scene = new THREE.Scene();
			var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
      let controls = new OrbitControls(camera, this.renderer_canvas.nativeElement);
			var renderer = new THREE.WebGLRenderer({canvas: this.renderer_canvas.nativeElement});
      renderer.setSize(400, 400);
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

}
