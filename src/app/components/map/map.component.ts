import { Component, OnDestroy, OnInit } from '@angular/core';
import { provideRoutes } from '@angular/router';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [WebsocketService]
})

export class MapComponent implements OnInit, OnDestroy {

  dim_x = 100 // number of cells in the x axis
  dim_y = 50 // number of cells in the y axis
  x_idxs = Array.from(Array(this.dim_x).keys())//This is needed only for using angular directives in generating map
  y_idxs = Array.from(Array(this.dim_y).keys())//This is needed only for using angular directives in generating map


  constructor( public WebsocketService: WebsocketService ) {
      
  }
  

  ngOnInit(): void {
    this.WebsocketService.openWebSocket();
  }

  ngOnDestroy(): void {
    this.WebsocketService.closeWebSocket();
  }

}
