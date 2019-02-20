import { Component, OnInit ,ViewChild,ElementRef} from '@angular/core';
import { SocketService } from './../../socket.service';
import { AppService } from './../../app.service';

import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ChatMessage} from './chat';
import {CheckUser} from './../../CheckUser'

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css'],
  providers: [SocketService]
})
export class ChatboxComponent implements OnInit {

  @ViewChild('scrollMe',{read:ElementRef})

  public scrollMe:ElementRef;//check karna hai scroll ka

  public authToken: any;
  public userInfo: any;
  public userList: any = [];
  public onlineunSeenUserList:any =[];
  public unSeenUserList:any =[];
  public newUnseenMessageList=[];
  public seenFlag:boolean=false;
  public unseenFlag:boolean=false;
  public disconnectedSocket: boolean;

  public scrollTOChatTop:boolean=false;

  public receiverId: any;
  public receiverName: any;
  public previousChatList:any=[];
  public messageText:any;
  public messageList:any=[];
  public pageValue: number = 0;
  public pageValue1: number = 0;
  public loadingPreviousChat: boolean = false;
  public unSeenOnlineUserList: any =[];
  public unseenUserId;
  public unseenUserName;



  constructor(
    public AppService: AppService,
    public SocketService: SocketService,
    public router: Router,
    private toastr: ToastrManager,

  ) {

   



  }



  ngOnInit() {
    this.authToken = Cookie.get('authtoken');

   console.log(this.authToken);

    this.userInfo = this.AppService.getUserInfoFromLocalstorage();

    this.receiverId = Cookie.get("receiverId");

    this.receiverName =  Cookie.get('receiverName');
    console.log(this.receiverId,this.receiverName+"-------");
   console.log(this.userInfo.userId+"-------");

    if(this.receiverId!=null && this.receiverId!=undefined && this.receiverId!=''){
      this.userSelectedToChat(this.receiverId,this.receiverName)
    }

    //this.checkStatus();

    this.verifyUserConfirmation();



   
    this.getOnlineUserList()//dekhana hoga
    this.getMessageFromAUser()
    this.getUnseenChatOfUser();
    // this.getUnseenChatMessageofUser("Bv7yHlQvU");

    
  }
  /*public checkStatus: any = () => {

    if (Cookie.get('authtoken') === undefined || Cookie.get('authtoken') === '' || Cookie.get('authtoken') === null) {

      this.router.navigate(['/']);

      return false;

    } else {

      return true;

    }

  } // end checkStatus*/



  public verifyUserConfirmation: any = () => {

    this.SocketService.verifyUser()
      .subscribe((data) => {
       

        this.disconnectedSocket = false;

        this.SocketService.setUser(this.authToken);
        this.getOnlineUserList();
        //this.getUnseenChatOfUser();

      });
  }

  public getOnlineUserList: any = () => {

    this.SocketService.onlineUserList()
      .subscribe((userList) => {

        this.userList = [];

        for (let x in userList) {

          let temp = { 'userId': x, 'name': userList[x], 'unread': 0, 'chatting': false };

          this.userList.push(temp);

        }
        console.log(this.userList);

        

      }); // end online-user-list

  }

  public getPreviousChatWithAUser :any = ()=>{
    let previousData = (this.messageList.length > 0 ? this.messageList.slice() : []);
    
    this.SocketService.getChat(this.userInfo.userId, this.receiverId, this.pageValue * 10)
    .subscribe((apiResponse) => {

      console.log(apiResponse);

      if (apiResponse.status == 200) {

        this.messageList = apiResponse.data.concat(previousData);

      } else {

        this.messageList = previousData;
        this.toastr.warningToastr('No Messages available')

       

      }

      this.loadingPreviousChat = false;

    }, (err) => {

      this.toastr.errorToastr('some error occured')


    });

  }

  public loadEarlierPageOfChat: any = () => {

    this.loadingPreviousChat = true;

    this.pageValue++;
    this.scrollTOChatTop = true;

    this.getPreviousChatWithAUser() 

  } 

  public userSelectedToChat: any = (id, name) => {
    this.seenFlag=false;
    console.log("setting user as active") 

    // setting that user to chatting true   
    this.userList.map((user)=>{
        if(user.userId==id){
          user.chatting=true;
        }
        else{
          user.chatting = false;
        }
    })

    Cookie.set('receiverId', id);

    Cookie.set('receiverName', name);


    this.receiverName = name;

    this.receiverId = id;

    this.messageList = [];

    this.pageValue = 0;

    let chatDetails = {
      userId: this.userInfo.userId,
      senderId: id
    }


    this.SocketService.markChatAsSeen(chatDetails);

    this.getPreviousChatWithAUser();

  } // end userBtnClick function

  public sendMessageUsingKeypress: any = (event: any) => {

    if (event.keyCode === 13) { // 13 is keycode of enter.

      this.sendMessage();

    }

  } // end sendMessageUsingKeypress

  public sendMessage: any = () => {

    if(this.messageText){

      let chatMsgObject:ChatMessage= {
        senderName: this.userInfo.firstName + " " + this.userInfo.lastName,
        senderId: this.userInfo.userId,
        receiverName: Cookie.get('receiverName'),
        receiverId: Cookie.get('receiverId'),
        message: this.messageText,
        createdOn: new Date()
      } // end chatMsgObject
      console.log(chatMsgObject);
      this.SocketService.SendChatMessage(chatMsgObject)
      this.pushToChatWindow(chatMsgObject)
      

    }
    else{
      this.toastr.warningToastr('text message can not be empty')

    }

  } 

  public pushToChatWindow: any =(data)=>{

    this.messageText="";
    this.messageList.push(data);
    this.scrollTOChatTop = false;


  }

  
  public getMessageFromAUser :any =()=>{

    

    this.SocketService.chatByUserId(this.userInfo.userId)
    .subscribe((data)=>{
     

      (this.receiverId==data.senderId)?this.messageList.push(data):'';

      this.toastr.successToastr(`${data.senderName} says : ${data.message}`)

      this.scrollTOChatTop=false;

    });//end subscribe

}// end get message from a user 


public logout: any = () => {

  this.AppService.logout()
    .subscribe((apiResponse) => {

      if (apiResponse.status === 200) {
        console.log("logout called")
        Cookie.delete('authtoken');

        Cookie.delete('receiverId');

        Cookie.delete('receiverName');

        this.SocketService.exitSocket()

        this.router.navigate(['/']);

      } else {
        this.toastr.errorToastr(apiResponse.message)

      } // end condition

    }, (err) => {
      this.toastr.errorToastr('some error occured')


    });

} // end logout

// handle the output from a child component 

public showUserName =(name:string)=>{

  this.toastr.successToastr("You are chatting with "+name)

}


public getUnseenChatOfUser:any = () =>{

  this.SocketService.getUnseenChat(this.userInfo.userId )
  .subscribe((apiResponse) => {
  //console.log(this.userInfo.userId+'===============')
    //console.log(apiResponse.data[1].firstName +"....");
    //let x = apiResponse["data"];
    //let temp = x[0];
    //console.log(temp.firstName);
    this.unSeenUserList=[];
    this.unSeenOnlineUserList = [];
    
    for (let x in apiResponse.data){
      //let temp1 = apiResponse.data[x].firstName + " " +apiResponse.data[x].lastName
      let temp1 = {'userId':apiResponse.data[x].userId,'name':apiResponse.data[x].firstName + " " +apiResponse.data[x].lastName}
      console.log(temp1);

      
      this.unSeenUserList.push(temp1);
      
      
    }
    for( let y in this.userList){
      for(let x in this.unSeenUserList){
        
        if(this.unSeenUserList[x].userId == this.userList[y].userId){
          this.unSeenOnlineUserList.push(this.unSeenUserList[x]);
          this.unSeenUserList.splice(x,1)
           
        }
      }
    }
  

    console.log(this.unSeenUserList+'----------------');
    console.log(this.unSeenOnlineUserList);

    
    


    
    

    

    

  }, (err) => {

    this.toastr.errorToastr('some error occured')


  });

  
}

public getUnseenChatMessageofUser=(senderId,) =>{

  this.SocketService.getUnseenChatList(this.userInfo.userId,senderId,this.pageValue*10).subscribe((apiResonse)=>{
      this.newUnseenMessageList=[];
    if(apiResonse.status==200)
    {
      for(let x in apiResonse.data)
      {
          this.newUnseenMessageList.push(apiResonse.data[x]);
          this.unseenFlag=true;
          this.pageValue1=0;
          
      }
      console.log(this.newUnseenMessageList +"---------------------------------!!!!!!!!!!!!!!!-------------");
    }

  })

  

  



}


public unseenUserChatView=(senderId,senderName)=>
{ this.seenFlag=true;
  //this.unseenFlag=false;
  Cookie.set('unseenSenderId', senderId);
  Cookie.set('unseenSenderName', senderName);

  this.unseenUserId = Cookie.get("unseenSenderId");
  this.unseenUserName = Cookie.get("unseenSenderName");



  this.getUnseenChatMessageofUser(this.unseenUserId);

 

}

  public getPreviousChatWithAUserForUnseen:any = ()=>{
    
  let previousData = (this.newUnseenMessageList.length > 0 ? this.newUnseenMessageList.slice() : []);
  //this.newUnseenMessageList=[];
  console.log(this.newUnseenMessageList+'11111111111111111111111')
  console.log(this.newUnseenMessageList.length+'**************')
  this.SocketService.getChat(this.userInfo.userId, this.unseenUserId, this.pageValue1*10)
  .subscribe((apiResponse) => {

    console.log(apiResponse);

    if (apiResponse.status == 200) {
     
      
      if(this.unseenFlag==true){
      this.newUnseenMessageList = apiResponse.data;
      this.unseenFlag=false;
      }else
      {
        this.newUnseenMessageList = apiResponse.data.concat(previousData)
      }
      console.log(this.newUnseenMessageList+'222222222222222222222222')
      console.log(this.newUnseenMessageList.length+'***********!!!!')
    } else {

      //this.newUnseenMessageList = previousData;
      this.toastr.warningToastr('No Messages available')

     

    }
  
  
    //this.pageValue++;
    this.loadingPreviousChat = false;
    //this.unseenFlag=true;

  }, (err) => {

    this.toastr.errorToastr('some error occured')


  });

}

public loadUnseenEarlierPageOfChat: any = () => {

  this.loadingPreviousChat = true;

  console.log(this.pageValue1+'-------------------------------')
  this.scrollTOChatTop = true;

  this.getPreviousChatWithAUserForUnseen() 
  this.pageValue1++;

} 



}

