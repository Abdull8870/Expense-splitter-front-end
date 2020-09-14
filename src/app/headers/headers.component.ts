import { Component, OnInit,ViewChild,TemplateRef } from '@angular/core';
import { Subscription } from "rxjs";
import { AuthService } from '../auth/auth.service';
import { ReactiveFormsModule,FormArray, FormControl, FormGroup, Validators ,FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA,MatDialogConfig } from '@angular/material/dialog';
import { ProjectService } from '../CommonService/projectapi.service';
import { Project } from '../models/project.model';
import { Router } from "@angular/router";

@Component({
  selector: 'app-headers',
  templateUrl: './headers.component.html',
  styleUrls: ['./headers.component.css']
})
export class HeadersComponent implements OnInit {
  projects:string[]=[];
  private proSub:Subscription;
  activeProject:Project[]=undefined;
  userIsAuthenticated = false;
  private authListenerSubs: Subscription;
  selectProjectForm:FormGroup;
  @ViewChild('callAPIDialog') callAPIDialog: TemplateRef<any>;
  @ViewChild('noProject') noProject: TemplateRef<any>;


  constructor(private authService:AuthService,private fb:FormBuilder,
  public dialog:MatDialog,private projectServiceapi:ProjectService,private router: Router) { }

  /**
     * @description OnInit the authListenerSubs will subscribe to the auth status of the user like
     * @author Abdul Rahuman
     */

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });

     }

     onLogout() {
    this.authService.logout();
    }


    /**
       * @description When user clicks the bill tab this function runs and gives the no of project available
       for the user
       * @author Abdul Rahuman
       */


    onUserClick(){
     this.activeProject=this.projectServiceapi.getProjectId();
     if(this.activeProject.length>0){
     this.activeProject.forEach(element => {
       this.projects.push(element.name);
       });

      this.selectProjectForm=this.fb.group({
      projectName:new FormControl(this.projects[0], [Validators.required]),
      });
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      let dialogRef = this.dialog.open(this.callAPIDialog,dialogConfig);
       }
       else{
         const dialogConfig = new MatDialogConfig();
         dialogConfig.disableClose = true;
         let dialogRef = this.dialog.open(this.noProject,dialogConfig);
       }
      }

      onClick(){
         this.projects=[];
         this.activeProject=undefined;
      }


      /**
         * @description When user selects the project he wanted to see the bill the router will navigate to
           to /Users/:id with id of selected project ID
         * @author Abdul Rahuman
         */


    onSubmit(){
     const index=this.selectProjectForm.value.projectName;
     const project=this.activeProject[index];
     this.projects=[];
     this.activeProject=undefined;
     this.router.navigate(["/Users",project._id]);
     }


     /**
        * @description When there is no project available for the user the user will be prompted with
        dialog box to navigate to the project component to create a project
        * @author Abdul Rahuman
        */

     onCreateProject(){
       this.router.navigate(["/project"]);
     }

}
