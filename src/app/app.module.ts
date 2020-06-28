import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DxColorBoxModule } from 'devextreme-angular';
import { DxChartModule, DxPieChartModule } from 'devextreme-angular';
import { DxCircularGaugeModule } from 'devextreme-angular'
import { DxLinearGaugeModule } from 'devextreme-angular'
import { DxBarGaugeModule } from 'devextreme-angular';

import { registerLocaleData } from '@angular/common';
import { HashLocationStrategy, LocationStrategy, CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs);

import 'hammerjs';
import 'rxjs';
import { HomeComponent } from './home/home.component';
import { InterceptorService } from './interceptor.service';
import { DialogoComponent } from './dialogo/dialogo.component';
import { OperacionesComponent } from './operaciones/operaciones.component';
import { FlujoComponent } from './flujo/flujo.component';
import { ReportesComponent } from './reportes/reportes.component';
import { SesionComponent } from './sesion/sesion.component';
import { BlankComponent } from './blank/blank.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { FiltroComponent } from './filtro/filtro.component';
import { FormatoComponent } from './formato/formato.component';
import { InactivarComponent } from './inactivar/inactivar.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/vacio', pathMatch: 'full', data:  { state: 'vacio' } },
  { path: 'vacio', component: BlankComponent, data:  { state: 'vacio', valor: '100' } },
  { path: 'home', component: HomeComponent, data:  { state: 'home', valor: '100' } },
  { path: 'operaciones', component: OperacionesComponent, data:  { state: 'operaciones' } },
  { path: 'flujo', component: FlujoComponent, data:  { state: 'flujo' } },
  { path: 'reportes', component: ReportesComponent, data:  { state: 'reportes' } },
  { path: 'configuracion', component: ConfiguracionComponent, data:  { state: 'configuracion' } },
  
];


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DialogoComponent,
    OperacionesComponent,
    FlujoComponent,
    ReportesComponent,
    SesionComponent,
    BlankComponent,
    ConfiguracionComponent,
    FiltroComponent,
    FormatoComponent,
    InactivarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    FormsModule,
    DragDropModule,
    DxChartModule,
    DxColorBoxModule,
    DxCircularGaugeModule,
    DxLinearGaugeModule,
    DxBarGaugeModule,
    CommonModule
  ],
  entryComponents: [ DialogoComponent, FlujoComponent, SesionComponent, FiltroComponent, FormatoComponent, InactivarComponent ],
  providers: [ {provide: LOCALE_ID, useValue: "es-MX" }, 
  DatePipe, 
  {provide: LocationStrategy, useClass: HashLocationStrategy},
  {provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
