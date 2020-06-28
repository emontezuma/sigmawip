import { Injectable, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common'
import { Observable, throwError, pipe } from 'rxjs';  
import { HttpClient,  HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  URL_BASE = "http://localhost:8081/sigma/apisigma2/index.php?";
  
  URL_MMCALL = "http://localhost:8081/locations/integration/simulate/";

  //URL_BASE = "/sigma/api/index.php?";
  //URL_MMCALL = "/locations/integration/simulate/"
  private anchoSN: number = 300;
  private usuarioActual: any = {id: 1, nombre: "ADMINISTRADOR DEL SISTEMA", referencia: "", rol: 0, politica: 0, admin: "", tecnico: "", vista_resumida_fallas: false, upantalla: 0, operacion: "N", programacion: "N", inventario: "N"};
  private colores: any = {colorLetrasBox: "#000000", colorSN: "#000000", colorFondo: "#000000", colorLetrasPanel: "#000000", colorBarraSuperior: "#000000", colorLetrasTitulo: "#000000"};
  private pantalla: {alto: 0, ancho: 0};
  private autenticar: boolean = true;
  private escanear: boolean = false;
  private huboError: boolean = false;
  private operacion: any = {id: 0, nombre: "", desde: "N/A", hasta: "N/A", };
  private miVista: number = 0;
  private consulta: number = 0;
  
  private cadenaEscaneada: string = "";
  

  constructor(public datepipe: DatePipe,
              private http: HttpClient,
            ) 
            {}

  activarSpinner = new EventEmitter<boolean>();
  teclaBuscar = new EventEmitter<boolean>();
  configurando = new EventEmitter<boolean>();
  teclaEscape = new EventEmitter<boolean>();
  teclaResumen = new EventEmitter<boolean>();
  teclaProceso = new EventEmitter<boolean>();
  sinConexion = new EventEmitter<boolean>();
  mensajeSuperior = new EventEmitter<string>();
  mensajeInferior = new EventEmitter<string>();
  mensajeError = new EventEmitter<string>();
  esMovil = new EventEmitter<boolean>();
  cambioRouter = new EventEmitter<boolean>();
  mensajeToast = new EventEmitter<object>();
  teclaCambiar = new EventEmitter<boolean>();
  refrescarVista = new EventEmitter<boolean>();
  cambioPantalla = new EventEmitter<boolean>();
  quitarBarra = new EventEmitter<boolean>();
  vista = new EventEmitter<number>();
  vista_2 = new EventEmitter<number>();
  vista_3 = new EventEmitter<number>();
  vista_4 = new EventEmitter<number>();
  vista_5 = new EventEmitter<number>();
  cadaSegundo = new EventEmitter<boolean>();
  escaneado = new EventEmitter<string>();
  listoEscanear = new EventEmitter<boolean>();

  aEscanear(yaEscanear: boolean) {
    if (!this.escanear && yaEscanear)
    {
      this.cadenaEscaneada = "";
    }
    this.escanear = yaEscanear;
    this.listoEscanear.emit(yaEscanear);
    if (!yaEscanear)
    {
      this.cadenaEscaneada = "";
    }
  }
  rEscanear() {
    return this.escanear ;
  }


  aAnchoSN(ancho: number) {
    this.anchoSN = ancho;
  }
  rAnchoSN() {
    return this.anchoSN ;
  }


  aConsulta(numero: number) {
    this.consulta = numero;
  }
  rConsulta() {
    return this.consulta ;
  }


  aHuboError(siError: boolean) {
    this.huboError = siError;
  }
  rHuboError() {
    return this.huboError ;
  }

  aUsuario(valor: any) {
    this.usuarioActual = valor;
  }
  rUsuario() {
    return this.usuarioActual ;
  }


  aColores(valor: any) {
    this.colores = valor;
  }
  rColores() {
    return this.colores ;
  }


  aPantalla(valor: any) {
    this.pantalla = valor;
  }
  rPantalla() {
    return this.pantalla ;
  }


  aVista(vista: number) {
    this.miVista = vista;
  }
  rVista() {
    return this.miVista ;
  }


  aOperacion(valor: any) {
    this.operacion = valor;
  }
  rOperacion() {
    return this.operacion ;
  }

  
  fecha(tipo: number, miFecha: string, formato: string): string 
  {
    if (tipo == 1) 
    {
      return this.datepipe.transform(new Date(), formato);
    }
    else if (tipo == 2) 
    {
      if (!miFecha)
      {
        return "";  
      }
      else
      {
        return this.datepipe.transform(new Date(miFecha), formato);
      }
    }
  }

  consultasBD(campos: any): Observable<any> 
  {      
    
    if (campos.accion == 100) 
    {

      return this.http.post<any>(this.URL_BASE + "accion=consultar", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }

    if (campos.accion == 150) 
    {
      console.log(this.URL_BASE + "accion=consultar_archivo");
      console.log(JSON.stringify(campos));
      return this.http.post<any>(this.URL_BASE + "accion=consultar_archivo", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }

    else if (campos.accion == 200) 
    {

      return this.http.post<any>(this.URL_BASE + "accion=actualizar", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }

    else if (campos.accion == 300) 
    {
      return this.http.post<any>(this.URL_BASE + "accion=agregar", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }
    else if (campos.accion == 1000) 
    {

      return this.http.post<any>(this.URL_BASE + "accion=actualizar_planta", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }

    else if (campos.accion == 1100) 
    {

      return this.http.post<any>(this.URL_BASE + "accion=actualizar_proceso", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }

    else if (campos.accion == 1200) 
    {

      return this.http.post<any>(this.URL_BASE + "accion=actualizar_ruta_cabecera", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }
    else if (campos.accion == 1300) 
    {
      
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_ruta_detalle", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }
    else if (campos.accion == 1400) 
    {
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_secuencia_ruta", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }
    
    else if (campos.accion == 1500) 
    {
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_proceso_detalle", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    
      }
    else if (campos.accion == 1600) 
      {
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_secuencia_ruta2", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }
    else if (campos.accion == 1700) 
    {
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_parte", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }

    else if (campos.accion == 1800) 
    {
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_recipiente", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }
    else if (campos.accion == 1900) 
    {
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_alertas", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }
    else if (campos.accion == 2000) 
    {
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_situaciones", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }
    else if (campos.accion == 2100) 
    {
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_horarios", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }

    else if (campos.accion == 2200) 
    {
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_usuario", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }
    else if (campos.accion == 3000) 
    {
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_programacion", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }
    else if (campos.accion == 3050) 
    {
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_carga", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }
    else if (campos.accion == 3100) 
    {
      return this.http.post<any>(this.URL_BASE + "accion=actualizar_prioridad", JSON.stringify(campos)
      //, { params: parametros, headers: cabeceras }
      )
      .pipe(
        map( resp => 
          { 
            return resp;
          }),  
        );
    }
  }  
  


  llamadaMMCall(campos: any): Observable<any> 
  {
    if (campos.accion == 100) {
      return this.http.get(this.URL_MMCALL + "action=call&code=" + campos.requester + "&key=1&custom_message=" + campos.mensaje, {responseType: 'text'});
      
    }
    else if (campos.accion == 200) {
      return this.http.get(this.URL_MMCALL + "action=cancel&code=" + campos.requester, {responseType: 'text'});
    }
  }

  /* Suma el porcentaje indicado a un color (RR, GG o BB) hexadecimal para aclararlo */

  colorear(color, porcentaje: number)
  {

    var r, g, b, hsp;
    
    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) 
    {

        // If HEX --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        
        r = color[1];
        g = color[2];
        b = color[3];
        color = "#" + r + g + b;
    }
    
    if (porcentaje > 0)
    {
      //Se oscurece
      
      const subtractLight = function(color, porcentaje){
        let cc = parseInt(color,16) - porcentaje;
        let c = (cc < 0) ? 0 : (cc);
        return (c.toString(16).length > 1 ) ? c.toString(16) : `0${c.toString(16)}`;
      }
  
      /* Oscurece un color hexadecimal de 6 caracteres #RRGGBB segun el porcentaje indicado */
      color = (color.indexOf("#")>=0) ? color.substring(1,color.length) : color;
      porcentaje = parseInt('' + (255 * porcentaje) /100);
      return color = `#${subtractLight(color.substring(0,2), porcentaje)}${subtractLight(color.substring(2,4), porcentaje)}${subtractLight(color.substring(4,6), porcentaje)}`;
    }
    else
    {
      porcentaje = porcentaje * -1;
      const addLight = function(color: string, porcentaje: number)
      {
        let cc = parseInt(color,16) + porcentaje;
        let c: number = (cc > 255) ? 255 : (cc);
        return (c.toString(16).length > 1 ) ? c.toString(16) : `0${c.toString(16)}`;
      }

        color = (color.indexOf("#")>=0) ? color.substring(1,color.length) : color;
        porcentaje = parseInt('' + (255 * porcentaje) / 100);
        return color = `#${addLight(color.substring(0,2), porcentaje)}${addLight(color.substring(2,4), porcentaje)}${addLight(color.substring(4,6), porcentaje)}`;
    }

  /* Resta el porcentaje indicado a un color (RR, GG o BB) hexadecimal para oscurecerlo */
    
  }

  claridad(color) {

    // Variables for red, green, blue values
    var r, g, b, hsp;
    
    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

        // If HEX --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        
        r = color[1];
        g = color[2];
        b = color[3];
    } 

    else {
        
        // If RGB --> Convert it to HEX: http://gist.github.com/983661
        color = +("0x" + color.slice(1).replace( 
        color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }
    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    return Math.sqrt(0.241 * (r * r) + 0.691 * (g * g) + 0.068 * (b * b));
  }

  tiempoTranscurrido(fecha: string, formato: string): string
  {
    if (formato == "S")
    {
      return "0;0;0;" + Math.round((new Date().getTime() - new Date(fecha).getTime()) / 1000);
    }
    else if (formato == "FS")
    {
      return "0;0;0;" + Math.round((new Date(fecha).getTime() - new Date().getTime()) / 1000);
    }
    else if (formato == "F" || formato == "FD")
    {
      let segundos = Math.round((new Date(fecha).getTime() - new Date().getTime()) / 1000);
      if (formato == "FD")
      {
        let dias = Math.floor(segundos / 86400);
        let horas = Math.floor((segundos % 86400) / 3600);
        let minutos = Math.floor(((segundos % 86400) % 3600) / 60);
        segundos = segundos % 60 ; 
        return dias + ";" + horas + ";" + minutos + ";" + segundos;
      }
      else
      {
        let horas = Math.floor(segundos / 3600);
        let minutos = Math.floor((segundos % 3600) / 60);
        segundos = segundos % 60 ; 
        return "0;" + horas + ";" + minutos + ";" + segundos;
      }
    }
    else 
    {
      let segundos = Math.round((new Date().getTime() - new Date(fecha).getTime()) / 1000);
      if (formato == "D")
      {
        let dias = Math.floor(segundos / 86400);
        let horas = Math.floor((segundos % 86400) / 3600);
        let minutos = Math.floor(((segundos % 86400) % 3600) / 60);
        segundos = segundos % 60 ; 
        return dias + ";" + horas + ";" + minutos + ";" + segundos;
      }
      else
      {
        let horas = Math.floor(segundos / 3600);
        let minutos = Math.floor((segundos % 3600) / 60);
        segundos = segundos % 60 ; 
        return "0;" + horas + ";" + minutos + ";" + segundos;
      }
      
    }
  }

  generarReporte(arreglo, titulo, archivo)
  {
    let exportCSV = ""; 
    exportCSV = titulo + "\r\n";
    exportCSV = exportCSV + 'Fecha del reporte: ' + this.fecha(1, '', 'dd/MM/yyyy HH:mm:ss') + "\r\n";
    for (var i = 0; i < arreglo.length; i++)
    {
      for (var j in arreglo[i])
      {
        exportCSV = exportCSV + '"' + arreglo[i][j] + '",'
      }
      exportCSV = exportCSV  + "\r\n"
    }
    exportCSV = exportCSV + "Total registros: " + (arreglo.length - 1) + "\r\n"
    var blob = new Blob([exportCSV], {type: 'text/csv' }),
    url = window.URL.createObjectURL(blob);
    let link = document.createElement('a')
    link.download = archivo;
    link.href = url
    link.click()
    window.URL.revokeObjectURL(url);
    link.remove();
  }
  
    
}
