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
  nodes = ["0xb1", "0xb2", "0xb8", "0xb9"] // Array containing the unicast address of the nodes
  sensor_values = ["", "", "", ""] // Array containing telemetry values, please insert an empty entry for each address in the nodes array 
  nodes_positions = ["[13, 4]", "[13, 19]", "[40, 4]", "[40, 4]"]// positions shown in the map, one for each entry in nodes array
  tracked_positions:any[] = [] //This array will contain the positions on the map for the tracked devices
  tracked_devices:any[] = [] //This array will contain tracked devices
  is_found = false

  last_node_msg_dates: number[] = []
  last_sensor_msg_dates: number[] = []
  last_overall:number = 0




  constructor( public WebsocketService: WebsocketService ) {
      
  }
  

  ngOnInit(): void {
    this.WebsocketService.openWebSocket();
    this.WebsocketService.received_emitter.subscribe(data => this.track_points())
    
  }

  ngOnDestroy(): void {
    this.WebsocketService.closeWebSocket();
  }

  // The following function calculates the position based on the received distances and on the positions of the nodes
  calculate_position(x_1: number, x_2: number, x_3: number, y_1:number, y_2:number, y_3:number, r_1:number, r_2:number, r_3:number ){

    var alpha = -2*x_1 + 2*x_2;
    var beta = -2*y_1 + 2*y_2;
    var gamma = r_1**2 - r_2**2 - x_1 **2 + x_2**2 - y_1**2 + y_2**2;
    var delta = -2*x_2 + 2*x_3;
    var epsilon = -2*y_2 + 2*y_3;
    var zeta = r_2**2 - r_3**2 - x_2 **2 + x_3**2 - y_2**2 + y_3**2;

    return [((gamma * epsilon) - (zeta * beta))/((epsilon * alpha) - (beta * delta)), ((gamma * delta) - (alpha * zeta))/((beta * delta) - (alpha * epsilon))];
  }

  //The following function will find the three nearest nodes
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

      //take the 3 nearest nodes
      best_nodes = best_nodes.slice(0, 3)

      for(let node of best_nodes){
        node.rssi = Math.ceil(node.rssi * 4)
      }
      if(best_nodes.length === 3){
        result.push([elem.address, best_nodes])
      }

    }
    return result
  }

  //After findindig three neares neighbors, let's convert their value to points in the map for the corresponding arrays
  track_points(){

    this.last_overall = Date.now()

    if(JSON.parse(this.WebsocketService.received[0].toString())[0].node !== undefined){
      this.last_sensor_msg_dates.unshift(Date.now())
      let nodes_list = JSON.parse(this.WebsocketService.received[0].toString())
      for(let elem of nodes_list){
        for(let elem1 of this.nodes){
          if(elem1 === elem.node){
            //this.sensor_values[this.nodes.indexOf(elem1)] = elem.value.toString();
            let temp = this.nodes_positions[this.nodes.indexOf(elem1)];
            console.log(temp)
            for (let place of this.nodes_positions){
              if(place === temp){
                this.sensor_values[this.nodes_positions.indexOf(place)] = elem.value.toString()
              }
            }
          }else{
            this.sensor_values[this.nodes.indexOf(elem1)] = "";
          }
        }
        
      }
      return
    }

    this.last_node_msg_dates.unshift(Date.now())
    console.log("tracking")
    var raw = this.find_nearest_nodes()
    console.log(raw)

    if(raw === undefined || raw.length === 0){
      return 0;
    }

    this.tracked_devices = []
    this.tracked_positions = []
    for(let elem of raw){
      this.tracked_devices.push(elem[0]);
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

  //average time function counter
  avgTimeCount(values: number[]): number{
    let accumulator = 0
    for(let i=0; i<(values.length-1); i++){
      accumulator += Math.floor((values[i] - values[i+1])/1000) //we are not interested in milliseconds
    }
    return (accumulator/(values.length-1))
  }


}
