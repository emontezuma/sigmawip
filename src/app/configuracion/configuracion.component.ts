
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { ActivatedRoute, GuardsCheckStart } from '@angular/router';
import { trigger, style, animate, transition, query, group, state, stagger } from '@angular/animations';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DialogoComponent } from '../dialogo/dialogo.component';
import { MatDialog, MatSelect } from '@angular/material';
import { DatePipe } from '@angular/common'



@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
  ,
  animations: [
    trigger('esquema', [
      transition(':enter', [
        style({ opacity: 0.3, transform: 'translateY(5px)' }),
        animate('0.1s', style({ opacity: 1, transform: 'translateY(0px)' })),
      ]),
      transition(':leave', [
        animate('0.2s', style({ opacity: 0, transform: 'translateY(5px)' }))
      ])
    ]),
    trigger('arriba', [
    transition(':enter', [
      style({ opacity: 0.3, transform: 'scale(0.3)' }),
      animate('0.1s', style({ opacity: 1, transform: 'scale(1)' })),
    ]),
    transition(':leave', [
      animate('0.1s', style({ opacity: 0.3, transform: 'scale(0.3)' }))
    ])
  ]),]
})

export class ConfiguracionComponent implements OnInit {

  constructor(

    private servicio: ServicioService,
    public datepipe: DatePipe,
    public scroll: ScrollDispatcher,
    public dialogo: MatDialog, 
    private http: HttpClient
  ) {
    this.servicio.cambioPantalla.subscribe((pantalla: any)=>
    {
      this.altoPantalla = this.servicio.rPantalla().alto - 105;
      this.anchoPantalla = this.servicio.rPantalla().ancho - 10;
      this.verBarra = "auto";
    });
    this.servicio.teclaEscape.subscribe((accion: boolean)=>
    {
      this.cancelar();
    });
    this.servicio.quitarBarra.subscribe((accion: boolean)=>
    {
      this.altoPantalla = this.servicio.rPantalla().alto - 105;
      this.anchoPantalla = this.servicio.rPantalla().ancho - 10 + 300;
    });   
    this.scrollingSubscription = this.scroll
      .scrolled()
      .subscribe((data: CdkScrollable) => {
        this.miScroll(data);
    }); 
    this.servicio.mensajeSuperior.emit("Parámetros del sistema")
    this.colorear();
    this.configuracion();
   }


   @ViewChild("txtMeses", { static: false }) txtMeses: ElementRef;
   scrollingSubscription: Subscription;

  botonera1: boolean = true;
  botonera: any = [true, true]
  ayuda01: string = "Guarda los cambios";
  ayuda02: string = "Cancela los cambios";
  editando: boolean = false;
  hay: boolean = false;
  
   altoPantalla: number = this.servicio.rPantalla().alto - 105;
    anchoPantalla: number = this.servicio.rPantalla().ancho - 10;
    errorMensaje: string = "";
    verBarra: string = "auto";
    pantalla: number = 2;
    detalleRegistro: any = [];
    colorLetrasBotones: string = "";
    colorLetrasBotonesDes: string = "";
    colorFondoBoton: string = "";
    colorLetrasTitulo: string = "";
    colorBarraSuperior: string = "";
    colorSN: string = "";
    colorLetrasBox: string = "";
    colorFondo: string = "";
    colorFondoCabecera: string = "";
    colorBorde: string = "";
    colorFondoTarjeta: string = "";
    registros = [];
    faltaMensaje: string = "";

    verIrArriba: boolean = false;
    verImagen: boolean = false;
    cronometro: any;
    offSet: number;
    partes = [];
    procesos = [];
    //URL_FOLDER = "http://localhost:8081/sigma/assets/datos/";
    URL_FOLDER = "/sigma/assets/datos/";
    
  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.scrollingSubscription) 
    {
      this.scrollingSubscription.unsubscribe()
    }

 }


  colorear()
  {
    this.colorSN = this.servicio.rColores().colorSN;
    
    this.colorLetrasBox = this.servicio.rColores().colorLetrasBox;
    this.colorLetrasTitulo = this.servicio.rColores().colorLetrasTitulo;
    this.colorBarraSuperior = this.servicio.rColores().colorBarraSuperior;
    this.colorFondo = "transparent";
    this.colorBorde = "rgba(0, 0, 0, 0.2)";
    this.colorFondoTarjeta = "rgba(0, 0, 0, 0.05)";
    this.colorFondoCabecera = "rgba(0, 0, 0, 0.1)";
    this.colorFondoBoton = "rgba(255, 255, 255, 0.1)";
    this.colorLetrasBotones = this.servicio.rColores().colorLetrasPanel;
    this.colorLetrasBotonesDes = this.servicio.colorear(this.colorLetrasBotones, -30);
  }

  irArriba() {
    this.verIrArriba = false;
    document.querySelector('[cdkScrollable]').scrollTop = 0;    
  }

  miScroll(data: CdkScrollable) {
    const scrollTop = data.getElementRef().nativeElement.scrollTop || 0;
      if (scrollTop < 5) 
      {
        this.verIrArriba = false
      }
      else 
      {
        this.verIrArriba = true
        clearTimeout(this.cronometro);
        this.cronometro = setTimeout(() => {
          this.verIrArriba = false;
        }, 3000);
      }

    this.offSet = scrollTop;
  }
          
  configuracion()
  {
    let sentencia = "SELECT * FROM sigma.configuracion";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp && resp.length > 0)
      {
        this.hay = true;
        this.detalleRegistro = resp[0];
        this.detalleRegistro.bajo_color = this.detalleRegistro.bajo_color.replace("HEX", "#"); 
        this.detalleRegistro.medio_color = this.detalleRegistro.medio_color.replace("HEX", "#"); 
        this.detalleRegistro.alto_color = this.detalleRegistro.alto_color.replace("HEX", "#"); 
      }
      else{
        this.hay = false;
      }
    }, 
    error => 
      {
        console.log(error)
      })
  }
  
  cambiando(evento: any)
  {
    
      this.botonera[0] = false;
      this.botonera[1] = false;
      this.editando = true;
      this.faltaMensaje = "No se han guardado los cambios..."
  }

  cancelar()
  {
    this.configuracion();
    this.editando = false;
    this.botonera[0]=true;
    this.botonera[1]=true;
    this.faltaMensaje = "";
    this.txtMeses.nativeElement.focus();
  }

  guardar()
  {
    if (!this.hay)
    {
      let sentencia = "INSERT INTO sigma.configuracion (tiempo) VALUE (0)";
      let campos = {accion: 200, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        this.actualizar();
      })
    }
    else
    {
      this.actualizar();
    }
  }

  actualizar()
  {
    this.detalleRegistro.dias_programacion = (!this.detalleRegistro.dias_programacion ? 0 : this.detalleRegistro.dias_programacion)
    this.detalleRegistro.holgura_reprogramar = (!this.detalleRegistro.holgura_reprogramar ? 0 : this.detalleRegistro.holgura_reprogramar)
    this.detalleRegistro.avisar_segundos = (!this.detalleRegistro.avisar_segundos ? 0 : this.detalleRegistro.avisar_segundos)
    this.detalleRegistro.estimado_productividad = (!this.detalleRegistro.estimado_productividad ? 0 : this.detalleRegistro.estimado_productividad)
    this.detalleRegistro.tiempo_escaner = (this.detalleRegistro.tiempo_escaner < 300 ? 300 : this.detalleRegistro.tiempo_escaner)
    this.detalleRegistro.tiempo_entre_lecturas = (this.detalleRegistro.tiempo_entre_lecturas < 5 ? 5 : this.detalleRegistro.tiempo_entre_lecturas)
    this.detalleRegistro.tiempo_holgura = (!this.detalleRegistro.tiempo_holgura ? 0 : this.detalleRegistro.tiempo_holgura)
    let sentencia = "UPDATE sigma.configuracion SET estimado_productividad = " + this.detalleRegistro.estimado_productividad + ",  avisar_segundos = " + +this.detalleRegistro.avisar_segundos + ", tipo_flujo = '" + this.detalleRegistro.tipo_flujo + "', correo_cuenta = '" + this.detalleRegistro.correo_cuenta + "', correo_puerto = '" + this.detalleRegistro.correo_puerto + "', correo_ssl = '" + this.detalleRegistro.correo_ssl + "', correo_clave = '" + this.detalleRegistro.correo_clave + "', correo_host = '" + this.detalleRegistro.correo_host + "', optimizar_correo = '" + this.detalleRegistro.optimizar_correo + "', optimizar_mmcall = '" + this.detalleRegistro.optimizar_mmcall + "', gestion_meses = " + this.detalleRegistro.gestion_meses + ", bajo_hasta = " + this.detalleRegistro.bajo_hasta + ", bajo_color = '" + this.detalleRegistro.bajo_color.replace("#", "HEX") + "', bajo_etiqueta = '"+ this.detalleRegistro.bajo_etiqueta + "', medio_hasta = " + this.detalleRegistro.medio_hasta + ", medio_color = '" +this.detalleRegistro.medio_color.replace("#", "HEX")  + "', medio_etiqueta = '" + this.detalleRegistro.medio_etiqueta + "', alto_color = '" + this.detalleRegistro.alto_color.replace("#", "HEX")  + "', alto_etiqueta = '" + this.detalleRegistro.alto_etiqueta + "', escaner_prefijo = '" + this.detalleRegistro.escaner_prefijo + "', escaner_sufijo = '" + this.detalleRegistro.escaner_sufijo + "', tiempo_holgura = " + this.detalleRegistro.tiempo_holgura + ", tiempo_entre_lecturas = " + this.detalleRegistro.tiempo_entre_lecturas + ", tiempo_escaner = " + this.detalleRegistro.tiempo_escaner + ", lote_inspeccion_clave = '" + this.detalleRegistro.lote_inspeccion_clave + "', reverso_permitir = '" + this.detalleRegistro.reverso_permitir + "', reverso_referencia = '" + this.detalleRegistro.reverso_referencia + "', dias_programacion = " + this.detalleRegistro.dias_programacion + ", holgura_reprogramar = " + this.detalleRegistro.holgura_reprogramar + ";";
    let campos = {accion: 200, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.servicio.configurando.emit(true);
      let mensajeCompleto: any = [];
      mensajeCompleto.clase = "custom-class";
      mensajeCompleto.mensaje = "Se ha guardado la configuración";
      mensajeCompleto.tiempo = 2000;
      this.servicio.mensajeToast.emit(mensajeCompleto);
      this.editando = false;
      this.botonera[0]=true;
      this.botonera[1]=true;
      this.faltaMensaje = "";
      this.txtMeses.nativeElement.focus();
    })
  }

}
