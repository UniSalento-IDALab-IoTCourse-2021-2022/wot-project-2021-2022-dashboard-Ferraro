import { Component, OnDestroy, OnInit } from '@angular/core';
import { provideRoutes } from '@angular/router';
import { elementAt } from 'rxjs';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [WebsocketService]
})

export class MapComponent implements OnInit, OnDestroy {

  //rememnber 1 square on the map, 25 centimeters.

  dim_x = 100 // number of cells in the x axis
  dim_y = 50 // number of cells in the y axis
  x_idxs = Array.from(Array(this.dim_x).keys())//This is needed only for using angular directives in generating map
  y_idxs = Array.from(Array(this.dim_y).keys())//This is needed only for using angular directives in generating map
  nodes = ["0xb1", "0xb2", "0xb0"]
  nodes_positions = ["[13, 4]", "[13, 19]", "[40, 4]"]
  tracked_positions:any[] = [] //This array will contain the positions on the map for the tracked devices
  tracked_devices:any[] = [] //This array will contain tracked devices
  is_found = false




  constructor( public WebsocketService: WebsocketService ) {
      
  }
  

  ngOnInit(): void {
    this.WebsocketService.openWebSocket();
    this.WebsocketService.received_emitter.subscribe(data => this.track_points())
    
  }

  ngOnDestroy(): void {
    this.WebsocketService.closeWebSocket();
  }

  calculate_position(x_1: number, x_2: number, x_3: number, y_1:number, y_2:number, y_3:number, r_1:number, r_2:number, r_3:number ){

    var alpha = -2*x_1 + 2*x_2;
    var beta = -2*y_1 + 2*y_2;
    var gamma = r_1**2 - r_2**2 - x_1 **2 + x_2**2 - y_1**2 + y_2**2;
    var delta = -2*x_2 + 2*x_3;
    var epsilon = -2*y_2 + 2*y_3;
    var zeta = r_2**2 - r_3**2 - x_2 **2 + x_3**2 - y_2**2 + y_3**2;

    return [((gamma * epsilon) - (zeta * beta))/((epsilon * alpha) - (beta * delta)), ((gamma * delta) - (alpha * zeta))/((beta * delta) - (alpha * epsilon))];
  }

  find_nearest_nodes(){

    var result: any[]= [];

    if(this.WebsocketService.received.length === 0){
      return result
    }

    var message = JSON.parse(this.WebsocketService.received[0].toString());


    for (var elem of message){

      //order by distance value
      var best_nodes = elem.values.sort((obj1:any, obj2:any) => {
        if(obj1.rssi > obj2.rssi){
          return 1;
        }

        if (obj1.rssi < obj2.rssi){
          return -1;
        }

        return 0;
      })

      if(best_nodes.lenght < 3){
        continue
      }
      //take the 3 nearest nodes
      best_nodes = best_nodes.slice(0, 3)

      for(let node of best_nodes){
        node.rssi = Math.ceil(node.rssi * 4)
      }

      result.push([elem.address, best_nodes])

    }
    return result
  }

  //After findindig three neares neighbors, let's convert their value to points in the map for the corresponding arrays
  track_points(){
    console.log("tracking")
    var raw = this.find_nearest_nodes()

    if(raw === undefined){
      return 0;
    }

    this.tracked_devices = []
    this.tracked_positions = []
    for(let elem of raw){
      this.tracked_devices.push(elem.address);
      var position = this.calculate_position(JSON.parse(this.nodes_positions[this.nodes.indexOf(elem[1][0].node)])[0],
      JSON.parse(this.nodes_positions[this.nodes.indexOf(elem[1][1].node)])[0],
      JSON.parse(this.nodes_positions[this.nodes.indexOf(elem[1][2].node)])[0],
      JSON.parse(this.nodes_positions[this.nodes.indexOf(elem[1][0].node)])[1],
      JSON.parse(this.nodes_positions[this.nodes.indexOf(elem[1][1].node)])[1],
      JSON.parse(this.nodes_positions[this.nodes.indexOf(elem[1][2].node)])[1],
      elem[1][0].rssi,
      elem[1][1].rssi,
      elem[1][2].rssi
      );

      this.tracked_devices.push(elem.address);
      if(position[0] < 0 ){
        position[0] = 0
      }

      if (position[1] < 0){
        position[1] = 0
      }

      this.tracked_positions.push("[" + Math.ceil(position[0]).toString() + ", " + Math.ceil(position[1]).toString() + "]")

    }

    return 1
  }


}
