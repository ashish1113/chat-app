import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';

import { Observable } from 'rxjs';
import {Cookie} from 'ng2-cookies/ng2-cookies';


//import {catchError} from 'rxjs/operators';
//import {tap} from 'rxjs/operators';
import 'rxjs/add/operator/toPromise';
//import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';

import {HttpClient ,HttpHeaders} from '@angular/common/http';

import {HttpErrorResponse ,HttpParams} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private url = "https://chatapi.edwisor.com";
  private socket;

  constructor( public http:HttpClient) {

    //connection is created
    //handshake is done
    this.socket =io(this.url);
   }

   //event to be listened

   public verifyUser =() => {

     return Observable.create((observer) => {
       this.socket.on('verifyUser',(data) =>{
        console.log(data);
         observer.next(data);
       });//end socket
     });//end obserable

   }//end verifyUser

   public onlineUserList =() => {

    return Observable.create((observer) => {
      this.socket.on('online-user-list',(userList) =>{
        observer.next(userList);
      });//end socket
    });//end obserable

  }//end uselistfunc

  public disconnectedSocket =() => {

    return Observable.create((observer) => {
      this.socket.on('disonnect',() =>{
        observer.next();
      });//end socket
    });//end obserable
     }

  public setUser = (authToken) => {
    this.socket.emit("set-user",authToken);
  }

  public markChatAsSeen = (userDetails) => {

    this.socket.emit('mark-chat-as-seen', userDetails);

  } // end markChatAsSeen

   getChat(senderId, receiverId, skip): Observable<any> {

    return this.http.get(`${this.url}/api/v1/chat/get/for/user?senderId=${senderId}&receiverId=${receiverId}&skip=${skip}&authToken=${Cookie.get('authtoken')}`)
      .do(data => console.log('Data Receipublicved'))
      .catch(this.handleError);

  } // end  function

  public chatByUserId = (userId) => {

    return Observable.create((observer) => {
      
      this.socket.on(userId, (data) => {

        observer.next(data);

      }); // end Socket

    }); // end Observable

  } // end chatByUserId

  public SendChatMessage = (chatMsgObject) => {

    this.socket.emit('chat-msg', chatMsgObject);

  } // end getChatMessage


  public exitSocket = () =>{


    this.socket.disconnect();


  }

  public getUnseenChat(userId): Observable<any>{
    return this.http.get(`${this.url}/api/v1/chat/unseen/user/list?userId=${userId}&authToken=${Cookie.get('authtoken')}`)
    .do(data => console.log('Data received for unseen chat'))
      .catch(this.handleError);
  }

  getUnseenChatList(userId,senderId, skip): Observable<any> {

    return this.http.get(`${this.url}/api/v1/chat/find/unseen?userId=${userId}&senderId=${senderId}&skip=${skip}&authToken=${Cookie.get('authtoken')}`)
      .do(data => console.log('Data Receipublicved'))
      .catch(this.handleError);

  } // end  functio


  

  


  private handleError(err:HttpErrorResponse)
  {
    let errorMessage = '';
    if (err.error instanceof Error){
      errorMessage= `an error ocured :${err.error.message}`

    } else {
      errorMessage = `server returned code: ${err.status},error message is:${err.error.message}`
    }
    console.error (errorMessage);
    return Observable.throw (errorMessage); 
  }


}
