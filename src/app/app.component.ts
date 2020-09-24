import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth/auth.service';
import { WebsocketsService } from './websockets.service'
import { ProjectService } from './CommonService/projectapi.service';
import { BillDetails } from './CommonService/billapi.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit ,OnDestroy{
   private emailSub:Subscription;

  constructor(private authService:AuthService,private websocketsService:WebsocketsService,
  private projectServiceapi:ProjectService,private billService:BillDetails) {}

  ngOnInit() {

    this.authService.autoAuthUser();
    this.emailSub=this.authService.getCurrentUserEmail().
    subscribe((email:{useremail:string})=>{
    console.log("SOCKET HANDSHAKE HAPPENED");
    this.projectServiceapi.getLiveProjects(email.useremail);
    this.projectServiceapi.getLiveDeleteProject(email.useremail);
    this.billService.getLiveBills(email.useremail);
    this.billService.getLiveUpdatedBills(email.useremail);
    this.billService.getLiveDeteleBills(email.useremail);

  });
   this.websocketsService.listen('test').subscribe(result=>{
   console.log(result);
   this.authService.getEmail();
         });
  }

  ngOnDestroy(){
      this.emailSub.unsubscribe();
      this.authService.logout();
  }
}
