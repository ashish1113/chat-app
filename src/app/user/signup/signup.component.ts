import { Component, OnInit } from '@angular/core';
import { AppService } from './../../app.service';
import { Router } from '@angular/router';
import { ToastrManager }  from 'ng6-toastr-notifications';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public firstName: any;
  public lastName: any;
  public mobile: any;
  public email: any;
  public password: any;
  public apiKey: any;

  constructor( public appService: AppService, public router: Router, private toastr: ToastrManager ) { }

  ngOnInit() {
  }

  public goTOSignIn: any = () =>{
    this.router.navigate(['/']);
  } // end of goToSignIn function.

  public signupFunction: any = () =>{

    if (!this.firstName){
      this.toastr.warningToastr('enter first name')
    }
    else if (!this.lastName){
      this.toastr.warningToastr('enter last name')
    }
    else if (!this.mobile){
      this.toastr.warningToastr('enter mobile')
    }
    else if (!this.email){
      this.toastr.warningToastr('enter email')
    }
    else if (!this.password){
      this.toastr.warningToastr('enter password')
    }
    else if (!this.apiKey){
      this.toastr.warningToastr('enter apiKey')
    }
    else{
      let data ={
        firstName: this.firstName,
        lastName: this.lastName,
        mobile: this.mobile,
        email: this.email,
        password: this.password,
        apiKey: this.apiKey
      }

      console.log(data);

      this.appService.signupFunction(data).subscribe((apiResponse) => {

        console.log(apiResponse);

        if (apiResponse.status === 200){
          this.toastr.successToastr('Signup successful');
          setTimeout(() => {
            this.goTOSignIn();
          }, 2000);
        }
        else {
          this.toastr.errorToastr(apiResponse.message);
        }
      }, (err) => {
        this.toastr.errorToastr('some error occured');
      });
    }

  }

}
