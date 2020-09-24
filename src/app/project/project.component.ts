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
export class ProjectComponent implements OnInit{
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

   onChangedPage(pageData: PageEvent){
     this.isLoading=true;
     let startIndex:number=+pageData.pageIndex*3;
     let endIndex:number=+startIndex+3;
     let cloneProject=this.activeProject.slice();
     this.PagenationProject=cloneProject.splice(startIndex,endIndex);
      this.isLoading=false;
   }

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
 * @description When group creation form is being submitted the function is user to store
 it in the database.
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
      action:"GROUP CREATED",
      doneBy:this.userEmail,
      description:`${this.userEmail} Has Created the Expense GROUP on
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
 * @description Checking for any duplication in the entered user emails
 * @author Abdul Rahuman
 */

  checkDuplicate(users:string[],cb){
    let temp:string[]=users;
    let status=true;
    if(users.length > 1) {
      users.forEach((x,i) => {
         for (let index =i+1 ; index < temp.length; index++) {
          if(x===temp[index]){
            status=false;
          }
             }
      });

    }
    cb(status);
  }

  /**
 * @description When user clicks on Adduser button in the form this function will
 add form control to the input
 * @author Abdul Rahuman
 */

  onAddUser() {
    this.submit=true;
    const control = new FormControl(null,[Validators.required,Validators.email]);
    (<FormArray>this.projectForm.get('users')).push(control);
  }

  /**
 * @description When user clicks on delete button in the form this function will
 remove the form control of the input
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
     * @description When user wants to create one new project the function is used to
     initiate the form
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
      * @description When user deletes the gorup the function executes and
      the data in the database is been is removed
       * @author Abdul Rahuman
     */



 onDeleteProject(id:string,i:number){
   this.isLoading=true;
   const users=this.PagenationProject[i].users;
   const dP=this.PagenationProject[i].name;
   this.projectServiceapi.deleteProject(id,users,dP);
 }

 /**
  * @description When user clicks on cancel button in the form this function will
  reset the form
   * @author Abdul Rahuman
 */


 onCancel(){

   if((this.activeProject.length == 0))
   {
     this.createProject=true;
   }
    else {
      this.submit=false;
      this.createProject=false;
      let userstemp=this.projectForm.value.users;
      userstemp.forEach(element => {
       (<FormArray>this.projectForm.get('users')).controls.pop();
      });
      this.projectForm.reset();
    }
 }


}
