import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../CommonService/expense.service';
import { Expense } from '../models/expense.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent implements OnInit {
  id:string;
  private sub:Subscription;
  isLoading:boolean;
  finalExpense:Expense[]=[];
  displayedColumns: string[] = ['name', 'to', 'amount'];
  constructor(private expenseService:ExpenseService,private route: ActivatedRoute) { }

  /**
     * @description When this component is called the route param will carry the id of the projects
     so on ngOnInit the id will be listened and once it got the id it'll call the getexpense method
     * @author Abdul Rahuman
     */



  ngOnInit() {
    this.isLoading=true;
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.expenseService.getExpense(this.id);
        }
      );

// This observable will listen to the  expense of the selected project

    this.sub =this.expenseService.getBillasObservable().
    subscribe((result)=>{
     this.isLoading=false;
     this.finalExpense=result.expense.filter(x=>{
       if(x.amount!=0){
         return x;
       }
     });
     });

  }

}
