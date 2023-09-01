import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin/admin.component';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard/dashboard.component';
import { SetpricesComponent } from './pages/setprices/setprices/setprices.component';
import { SettingsComponent } from './pages/settings/settings/settings.component';
import { HeaderComponent } from './layout/header/header/header.component';
import { LeftComponent } from './layout/left/left/left.component';
import { FooterComponent } from './layout/footer/footer/footer.component';
import { ControlSidebarComponent } from './layout/control-sidebar/control-sidebar/control-sidebar.component';
import { HttpClientModule } from '@angular/common/http';
import { SetpricesModule } from './pages/setprices/setprices.module';
import { AgGridModule } from 'ag-grid-angular';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { ModalsComponent } from './layout/modals/modals.component';
import { BolcommissionComponent } from './pages/bolcommission/bolcommission/bolcommission.component';
import { BolcommissionModule } from './pages/bolcommission/bolcommission.module'
import { BolminimumComponent } from './pages/bolminimum/bolminimum/bolminimum.component';
import { BolminimumModule } from './pages/bolminimum/bolminimum.module';

const gyzsroutes: Routes = [
  {
    path: "",
    component: AdminComponent,
    children: [
      { path: "dashboard", canActivate: [AuthGuard], component: DashboardComponent },
      { path: "setprices", canActivate: [AuthGuard], component: SetpricesComponent },
      { path: "bolcommission", canActivate: [AuthGuard], component: BolcommissionComponent },
      { path: "bolminimum", canActivate: [AuthGuard], component: BolminimumComponent },
      { path: "settings", canActivate: [AuthGuard], component: SettingsComponent },
      { path: '', redirectTo: '/admin/dashboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  declarations: [
    AdminComponent,
    HeaderComponent,
    LeftComponent,
    FooterComponent,
    ControlSidebarComponent,
    ModalsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    SetpricesModule,
    BolcommissionModule,
    BolminimumModule,
    AgGridModule,
    RouterModule.forChild(gyzsroutes)
  ]
})
export class AdminModule { }
