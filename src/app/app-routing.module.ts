import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './modules/auth/auth/auth.component';
import { AgGridModule } from 'ag-grid-angular';


const routes: Routes = [
  { path: "", component: AuthComponent },
  {
    path: 'admin',
    loadChildren: () =>    
    import('./modules/admin/admin.module').then((m) => m.AdminModule)
  },
]

@NgModule({
  imports: [AgGridModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
