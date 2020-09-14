import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule,FormArray, FormControl, FormGroup, Validators ,FormBuilder } from '@angular/forms';
import {  Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Project } from '../models/project.model';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ProjectService } from '../CommonService/projectapi.service';
import {MatPaginatorModule} from '@angular/material/paginator';
import { PageEvent } from "@angular/material";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  submit:boolean;
  userEmail:string;
  userId:string;
  users:string[]=[];
  projectForm: FormGroup;
  projectName:string;
  createdBy:string;
  createProject:boolean=false;
  activeProject:Project[]=[];
  PagenationProject:Project[]=[];
  private proSub:Subscription;
  isLoading:boolean=false;
  totalPosts = 0;
  postsPerPage = 3;
  pageSizeOptions = [3];

  constructor(private toastr: ToastrService,
    private projectServiceapi:ProjectService,private router: Router) {}

    /**
       * @description This method is for pagination of the project page the user can view only 3
       projects in a single page.
       * @author Abdul Rahuman
       */

   onChangedPage(pageData: PageEvent){
     this.isLoading=true;
     let startIndex:number=+pageData.pageIndex*3;
     let endIndex:number=+startIndex+3;
     let cloneProject=this.activeProject.slice();
     this.PagenationProject=cloneProject.splice(startIndex,endIndex);
      this.isLoading=false;
   }

   /**
      * @description OnInit proSub will start listening to the projects users belongs to
      and according the output the page will be rendered
      * @author Abdul Rahuman
      */


  ngOnInit() {
    this.submit=false;
    this.userEmail=localStorage.getItem('email').toLowerCase();
    this.userId=localStorage.getItem("userId");
    this.projectServiceapi.getProjectEmail();
     this.isLoading=true;
     this.proSub =this.projectServiceapi.getUpdatedProject().
     subscribe((result:{project:Project[]})=>{
      this.isLoading=false;
      this.activeProject=result.project;
      this.totalPosts=this.activeProject.length;
      let cloneProject=this.activeProject.slice();
      this.PagenationProject=cloneProject.splice(0,3);
      if(this.activeProject.length > 0){
        this.createProject=false;
      }
      else {
          this.createProject=true;
      }

      });
    this.projectForm = new FormGroup({
      'userData': new FormGroup({
        'projectName': new FormControl(null, [Validators.required]),
        'createdBy': new FormControl(null, [Validators.required])
      }),
      'users': new FormArray([])
    });

  }

  /**
     * @description When a new project is submitted this funtion will call the addProject method
     to add the project in the database.
     * @author Abdul Rahuman
     */

  onSubmit() {
    this.submit=false;
    let date=new Date();
    this.isLoading=true;
    if(this.projectForm.value.users==undefined){
      this.isLoading=false;
      return;
    }
    this.projectName=this.projectForm.value.userData.projectName;
    this.createdBy=this.projectForm.value.userData.createdBy;
    let userstemp=this.projectForm.value.users;
    userstemp.forEach(element => {
     (<FormArray>this.projectForm.get('users')).controls.pop();
     if (element) {
       this.users.push(element.toLowerCase());
     }
    });
    userstemp.splice(0,userstemp.length);
    if(!this.users.includes(this.userEmail))
    {
      this.users.push(this.userEmail);
    }
    let history={
      projectId:"na",
      action:"PROJECT CREATED",
      doneBy:this.userEmail,
      description:`${this.userEmail} Has Created the Expense Project on
       ${date}`
    }
    this.checkDuplicate(this.users,(unique)=>{
      if(unique){
        this.projectServiceapi.addProject(this.projectName,this.createdBy,this.users,history);
        this.projectForm.reset();
        this.createProject=false;
        this.users.splice(0,this.users.length);
      }
      else if(!unique){
      this.projectForm.reset();
      this.users.splice(0,this.users.length);
      this.toastr.error('The user has been entered twice','Duplicate user');
      this.isLoading=false;
      // this.router.navigate(['/home']);
    }
    });

  }

  /**
     * @description When a new project is submitted this funtion will be called and this will
     check for the duplicates in the project and will return false if it's having any duplicate
     * @author Abdul Rahuman
     */


  checkDuplicate(users:string[],cb){
    let temp='';
    let status=true;
    users.forEach(x => {
      if(x!=temp){
          temp=x;
      }
     else if(x===temp){
       status=false;
     }
    });
    cb(status);
  }

  /**
     * @description when user clicks on the AddUuser button this function will be called
     and form control for the next user will be added
     * @author Abdul Rahuman
     */


  onAddUser() {
    this.submit=true;
    const control = new FormControl(null,[Validators.required,Validators.email]);
    (<FormArray>this.projectForm.get('users')).push(control);
  }

  /**
     * @description when user clicks on the delete button after clicking on AddUser button
     this function will be called  and form control of the user will be deleted
     * @author Abdul Rahuman
     */


  onDelete(i){
    if(((<FormArray>this.projectForm.get('users')).controls.length==1)){
      this.submit=false;
    }
    (<FormArray>this.projectForm.get('users')).controls[i].disable();
    (<FormArray>this.projectForm.get('users')).controls.splice(parseInt(i),1);
      }

      /**
         * @description when user clicks on Createanotherproject button this function will be called
         and new projectform will be created
          * @author Abdul Rahuman
         */

 CreateNew(){
   this.projectForm = new FormGroup({
     'userData': new FormGroup({
       'projectName': new FormControl(null, [Validators.required]),
       'createdBy': new FormControl(null, [Validators.required])
     }),
     'users': new FormArray([])
   });
   this.createProject=true;
 }

 /**
    * @description when user clicks on DeleteProject button this function will be called
    and deleteproject method in the projectServiceapi will be called.
     * @author Abdul Rahuman
    */

 onDeleteProject(id:string,i:number){
   this.isLoading=true;
   const users=this.PagenationProject[i].users;
   const dP=this.PagenationProject[i].name;
   this.projectServiceapi.deleteProject(id,users,dP);
 }

 /**
    * @description when user clicks on cancel button while creating a project this function will be called
     * @author Abdul Rahuman
    */


 onCancel(){
   if((this.activeProject.length == 0))
   {
     this.createProject=true;
   }
    else {
      this.createProject=false;
    }
 }


}
