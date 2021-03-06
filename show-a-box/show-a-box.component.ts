import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import *  as THREE from 'three';
import { Line, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InfoDialogComponent } from '../info-dialog/info-dialog.component';
import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';

@Component({
  selector: 'app-show-a-box',
  templateUrl: './show-a-box.component.html',
  styleUrls: ['./show-a-box.component.scss']
})
export class ShowABoxComponent implements OnInit, OnDestroy {
  
  @ViewChild('renderer_canvas', {static:true})
  public renderer_canvas!: ElementRef<HTMLCanvasElement>;

  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );;
  lines: Array<Array<THREE.Line>> = new Array<Array<THREE.Line>>(); // 6 Arrays of 4 lines
  cube!: THREE.Mesh;
  reqId!: number;
  cubeSize: Vector3 = new Vector3(30,30,30);
  gui: GUI = new GUI();
  renderer!: THREE.WebGLRenderer;
  readonly params = {
    x: 30,
    y: 30,
    z: 30
  };
  scene: THREE.Scene = new THREE.Scene();
  controlsActive:boolean = false;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
      this.showABox();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.reqId);
    this.gui.destroy();
  }

  showABox() {
    this.scene.background = new THREE.Color( 0x809090 );
    // this.scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

    this.camera.position.set( -60, 100, -60 );
    // this.camera.lookAt( 0, 50, 0 );
    new OrbitControls(this.camera, this.renderer_canvas.nativeElement);
    this.renderer = new THREE.WebGLRenderer({canvas: this.renderer_canvas.nativeElement, antialias: true});
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.addCube();
    this.addVanishingLines();

    let ambientLight = new THREE.AmbientLight(0x808080);
    this.scene.add(ambientLight);
    
    let light = new THREE.DirectionalLight(0xF0F0F0);
    light.position.set(-200, 50, -100);
    this.scene.add(light);

    // GUI
    this.gui.close();
    this.gui.add( this.params, 'x' ).name( 'X scale' ).min(10).max(100).step(1).onChange(()=> this.onBoxResize());
    this.gui.add( this.params, 'y' ).name( 'Y scale' ).min(10).max(100).step(1).onChange(()=> this.onBoxResize());
    this.gui.add( this.params, 'z' ).name( 'Z scale' ).min(10).max(100).step(1).onChange(()=> this.onBoxResize());
    this.gui.hide();

    let currentMin = -1;
    var animate = () => {
      this.reqId = requestAnimationFrame( animate );     
      
      let minIndex = this.getCameraQuadrant();
      if (minIndex != currentMin) {
        currentMin = minIndex;
        this.hideLines(currentMin);
      }
      this.renderer.render( this.scene, this.camera );
    };

    animate();

    window.addEventListener( 'resize', () => this.onWindowResize() );
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
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

  openInfoDialog() {
    this.dialog.open(InfoDialogComponent, {
      width: '300px'
    });
  }

  openSettingsDialog() {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: '300px',
      data: {controls: this.controlsActive}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === undefined) return;
      this.controlsActive = result;
      if (this.controlsActive) {
        this.gui.show();
      }
      else {
        this.gui.hide();
      }
    });
  }
}