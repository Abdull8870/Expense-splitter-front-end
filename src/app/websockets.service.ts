import { Injectable } from '@angular/core';
import * as io from "socket.io-client";
import { Observable } from "rxjs"

@Injectable({
  providedIn: 'root'
})
export class WebsocketsService {
  socket:any;
  BACKEND_URL:string="http://expensesplitterbackend-env.eba-vpaafhyz.us-east-2.elasticbeanstalk.com/";

  constructor() {
    this.socket=io(this.BACKEND_URL);
  }

  /**
    * @description Socket to make sure the socket handshake is happened
    * @author Abdul Rahuman
  */



  listen(eventName:string){
    return new Observable((subscriber)=>{
      this.socket.on(eventName,(data)=>{
        subscriber.next(data);
      })

    });
  }

  emit(eventName:string,data:any){

     this.socket.emit(eventName,data);
  }

  /**
    * @description Sockets listening to live creation of project(Groups)
    * @author Abdul Rahuman
  */

  listenLiveProjects(){

    return new Observable((subscriber)=>{
      this.socket.on('createProject',(data)=>{
        subscriber.next(data);
      })

    });
  }

  /**
    * @description Sockets listening to live deletion of project(Groups)
    * @author Abdul Rahuman
  */

  listenLiveDeleteProject(){

    return new Observable((subscriber)=>{
      this.socket.on('deleteProject',(data)=>{
        subscriber.next(data);
      })

    });
  }

  /**
    * @description Sockets listening to live creation of bills
    * @author Abdul Rahuman
  */


  listenLiveBills(){
    return new Observable((subscriber)=>{
      this.socket.on('billCreate',(data)=>{
        subscriber.next(data);
      })

    });
  }

  /**
    * @description Sockets listening to live updation of bills
    * @author Abdul Rahuman
  */

  listenLiveUpdateBills(){
    return new Observable((subscriber)=>{
      this.socket.on('billUpdate',(data)=>{
        subscriber.next(data);
      })

    });
  }

  /**
    * @description Sockets listening to live deletion of bills
    * @author Abdul Rahuman
  */

  listentoDeleteBill(){
    return new Observable((subscriber)=>{
      this.socket.on('billDelete',(data)=>{
        subscriber.next(data);
      })

    });
  }
}
