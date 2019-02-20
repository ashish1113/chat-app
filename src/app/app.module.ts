import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';

import { ToastrModule } from 'ng6-toastr-notifications';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppService } from './app.service';

import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { SharedModule } from './shared/shared.module';
import { LoginComponent } from './user/login/login.component';
//import { SignupComponent } from './user/signup/signup.component';
//import { ChatboxComponent } from './chat/chatbox/chatbox.component';

@NgModule({
  declarations: [
    AppComponent,
    //LoginComponent,
    //ChatboxComponent
  ],
  imports: [
    BrowserModule,
    ChatModule,
    SharedModule,
    UserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent, pathMatch: 'full'},
      { path: '', redirectTo: 'login', pathMatch: 'full'},
      { path: '*', component: LoginComponent},
      { path: '**', component: LoginComponent},
    ])
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
