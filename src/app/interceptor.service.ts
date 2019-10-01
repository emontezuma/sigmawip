import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpParams, HttpErrorResponse, HttpHeaders, HttpRequest, HttpHandler, HttpUrlEncodingCodec, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ServicioService } from './servicio/servicio.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor
    (
      private router: Router,
      private servicio: ServicioService,
    ) 
    {

   }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> 
  {

    let parametros = new HttpParams().append('page', '2');
    let cabeceras = new HttpHeaders({ 'token-usuario': 'ELVIS'});

    let requestClone = request.clone(
      {
        //headers: cabeceras, params: parametros
      }
    );
    this.servicio.aHuboError(false);
    this.servicio.sinConexion.emit(false);
    return next.handle( requestClone ).pipe(
      catchError(err => {
          this.servicio.aHuboError  (true);
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "Ocurrió un error en el servidor (" + err.message + ")";
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
          if (err.error.text)
          {
            this.servicio.mensajeError.emit("1;" + err.error.text); 
          }
          this.servicio.sinConexion.emit(true);
          return throwError(err);
        }
      ));
       
  }

}
