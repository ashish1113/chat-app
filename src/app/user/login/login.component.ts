import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from './../../app.service';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public email: any;
  public password: any;

  constructor( public router: Router, public appService:AppService, public toastr: ToastrManager) { }

  ngOnInit() {
  }

  public goToSignUp: any = () =>{
    this.router.navigate(['/signup']);
  }

  public signinFunction: any = () =>{

    if (!this.email){
      this.toastr.warningToastr('enter email')
    }
    else if (!this.password){
      this.toastr.warningToastr('enter password')
    }
    else {
      let data = { 
        email: this.email,
        password:this.password,
      }
      console.log(data);

      this.appService.signinFunction(data).subscribe((apiResponse) =>{

        if (apiResponse.status === 200){
          console.log(apiResponse);

          Cookie.set('authtoken', apiResponse.data.authToken);

          Cookie.set('receiverId', apiResponse.data.userDetails.userId);

          Cookie.set('receiverName', apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName);

          this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails)
          this.router.navigate(['/chat']);
        }
        else {
          this.toastr.errorToastr(apiResponse.message)
        }
      },(err) => {
        this.toastr.errorToastr('some error occured')
      });
    }
  }

}
