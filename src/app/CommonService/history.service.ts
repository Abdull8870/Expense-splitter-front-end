import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { History } from '../models/history.model';
import { ToastrService } from 'ngx-toastr';
import { Router } from "@angular/router";

const BACKEND_URL = environment.apiUrl + "/history/";

@Injectable({ providedIn: "root" })
export class HistoryService {

  private updatedHistory = new Subject<{history:History[]}>();
  private history:History[];
  constructor(private http: HttpClient,
  private toastr: ToastrService, private router: Router) {}

  /**
   * @description Sending the updated subject -> UpdatedHistory as as Observable to the componenent
   from where its been called and subscribed to result.
   * @author Abdul Rahuman
   */

  getHistoryasObservable(){
    return this.updatedHistory.asObservable();
  }


  /**
   * @description Requests server to get the History of the project in the database with the help of project_ID
   * @author Abdul Rahuman
   * @returns {Object} { message: string; history: History[]}
   */


  getHistory(id:string) {

    const queryParams =`?projectId=${id}`;
    this.http.get<{ message: string; history: History[]}>(
        BACKEND_URL + queryParams)
      .subscribe(responseData => {
        this.history=responseData.history;
        this.updatedHistory.next({history:[...this.history]});

      },error=>{
        this.toastr.error(`${error.error.message}`, 'AN ERROR OCCURED', {
        timeOut: 3000,
        });
        this.router.navigate(["/"]);

      });
  }

  /**
   * @description Requests server to get the History of the project in the database with the help of project_ID
   * @author Abdul Rahuman
   * @returns {Object} { message: string}
   */


  deleteHistory(projectId:string){

   return this.http.delete<{ message: string}>(BACKEND_URL+projectId)
        }


}
