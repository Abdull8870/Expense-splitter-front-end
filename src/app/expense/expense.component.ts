import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../CommonService/expense.service';
import { Expense } from '../models/expense.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css']
})
export class ExpenseComponent implements OnInit {
  id:string;
  private sub:Subscription;
  isLoading:boolean;
  initialExpense:Expense[]=[];
  finalExpense:Expense[]=[];
  displayedColumns: string[] = ['name', 'to', 'amount'];
  constructor(private expenseService:ExpenseService,
    private route: ActivatedRoute,private toastr: ToastrService) { }

  ngOnInit() {
    this.isLoading=true;
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.expenseService.getExpense(this.id);
        }
      );
    this.sub =this.expenseService.getBillasObservable().
    subscribe((result)=>{

     this.initialExpense=result.expense.filter(x=>{
       if(x.amount!=0){
         return x;
       }
     });
     this.finalCalculation(this.initialExpense);
     });

  }

  /**
 * @description Function used to calculate the final expense of the group
 * @author Abdul Rahuman
 */

  finalCalculation(expense:Expense[]){



    let temp:Expense[]=[...expense];
    let final:Expense[]=[];
    let sum=0;
    expense.forEach(element => {

      let x= temp.filter((y)=>{
     if (y.name===element.to && y.to===element.name){
       return y;
     }
      });

      if(x.length>0){
      if(x[0].amount>=element.amount){
       sum=x[0].amount-element.amount;

      let obj={
        _id:element._id,
        name:element.to,
        to:element.name,
        amount:sum
      };

      final.push(obj);
    }
  }
    else{
      let obj={
        _id:element._id,
        name:element.name,
        to:element.to,
        amount:element.amount
    };
      final.push(obj);
    }
    });
    this.finalExpense=final.filter(x=>{
      if(x.amount!=0){
        return x;
      }
    });
    this.isLoading=false;
  }



}
