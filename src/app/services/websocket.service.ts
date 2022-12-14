import { EventEmitter, Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class WebsocketService{
    webSocket: WebSocket;
    received: String[] = [];
    received_emitter: EventEmitter<any> = new EventEmitter()

    constructor(){}

    public openWebSocket(){
        this.webSocket = new WebSocket("ws://raspberrypi:7777");

        this.webSocket.onopen = (event) => {
            console.log('open: ', event);
        };

        this.webSocket.onmessage = (event) => {
            this.received.unshift(event.data);
            this.received_emitter.emit();
        };
        
        this.webSocket.onclose = (event) => {
            console.log('close: ', event);
        }
    }

    public closeWebSocket(){
        this.webSocket.close();
    }

}