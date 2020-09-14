import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HistoryService } from '../CommonService/history.service';
import { History } from '../models/history.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  isLoading:boolean;
  history:History[];
  id:string;
  historySub:Subscription;
  constructor(private historyService:HistoryService,
  private route: ActivatedRoute) { }

  /**
     * @description OnInit the project ID from the params will be listened and once after that the
     get historymethod is called and parallelly historySub will listen to the history of the particular project
     * @author Abdul Rahuman
     */


  ngOnInit(): void {
    this.isLoading=true;
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.historyService.getHistory(this.id);
        }
      );
      this.historySub=this.historyService.getHistoryasObservable().
      subscribe((result:{history:History[]})=>{
        this.history=result.history;
        this.isLoading=false;
      })
  }

}
