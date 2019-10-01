import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { ActivatedRoute, GuardsCheckStart } from '@angular/router';
import { trigger, style, animate, transition, query, group, state, stagger } from '@angular/animations';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DialogoComponent } from '../dialogo/dialogo.component';
import { MatDialog, MatSelect } from '@angular/material';
import { ViewportRuler } from "@angular/cdk/overlay";

@Component({
  selector: 'app-operaciones',
  templateUrl: './operaciones.component.html',
  styleUrls: ['./operaciones.component.css'],
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

export class OperacionesComponent implements OnInit {

  constructor
  (
    public snackBar: MatSnackBar, 
    private servicio: ServicioService,
    public scroll: ScrollDispatcher,
    private http: HttpClient,
    public dialogo: MatDialog, 
    private router: Router, 
    private viewportRuler: ViewportRuler
  ) 
  {
    this.servicio.mensajeError.subscribe((mensaje: any)=>
    {
      let mensajes = mensaje.split(";");
      if (mensajes[0] == 1)
      {
        this.pantalla = 1;
        this.servicio.mensajeInferior.emit("Por favor comuníque este error a su soporte de TI local");
        this.errorMensaje = mensajes[1];
      }
    });

    this.escaner = this.servicio.escaneado.subscribe((cadena: string)=>
    {
      //Se escane a el lote
      this.validarEntrada(cadena);
    });

    this.servicio.cambioPantalla.subscribe((pantalla: any)=>
    {
      this.altoPantalla = this.servicio.rPantalla().alto - 105;
      this.anchoPantalla = this.servicio.rPantalla().ancho - 10;
      this.verBarra = "auto";
    });
    this.servicio.quitarBarra.subscribe((accion: boolean)=>
    {
      this.altoPantalla = this.servicio.rPantalla().alto - 105;
      this.anchoPantalla = this.servicio.rPantalla().ancho - 10 + 300;
    });
    this.servicio.teclaBuscar.subscribe((accion: boolean)=>
    {
      this.buscar();
    });
    this.servicio.teclaProceso.subscribe((accion: boolean)=>
    {
      this.solicitarIdentificacion();
    });
    this.servicio.teclaResumen.subscribe((accion: boolean)=>
    {
      this.resumen();
    });
    this.servicio.teclaEscape.subscribe((accion: boolean)=>
    {
      this.escapar();
    });
    this.vistaCatalogo = this.servicio.vista_2.subscribe((vista: number)=>
    {
      this.validarProcesos();      

    });
    this.servicio.cadaSegundo.subscribe((accion: boolean)=>
    {
      if (this.router.url.substr(0, 12) == "/operaciones" && this.vista != 1)
      {
        this.cadaSegundo();
      }
    });
    this.servicio.teclaEscape.subscribe((accion: boolean)=>
    {
      this.cancelar();
    });
    this.scrollingSubscription = this.scroll
      .scrolled()
      .subscribe((data: CdkScrollable) => {
        this.miScroll(data);
    });
    this.colorear();
    this.configuracion();
    this.servicio.mensajeSuperior.emit("Flujo de material")
    if (this.procesoSeleccionado.id == 0)
    {
      this.validarProcesos();      
    }
   }

  pantalla: number = 2;
  indices: any = [{ nombre: "Procesos", icono: "iconshock-iphone-business-solution"} ];
  nuevoRegistro: string = ";"
  verRegistro: number = 0;
  cronometrando: boolean = false;
  conLote: number = 0;

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
  rutaActual: number = 0;
  //Colores generales
  colorAlerta: string = "tomato";
  tiempoAlerta: number = 30;
  arrFiltrado: any = [];
  textoBuscar: string = "";
  vista: number = 1;
  estadoActual: string = "";
  mensajeLote: string = "";
  mensajeBase: string = "";
  tipoLote: number = 0;
  esperaDisparo: number = 0;
  verEspera: boolean = false;
  disparoSiguiente: number = 0;
  loteMover: number = 0;
  parteMover: number = 0;
  loteNumeroMover: string = "";
  ultimaSecuencia: number = 0;
  ultimaRutaDetalle: number = 0;
  procesoAnterior: number = 0;
  loteEstado: number = 0;
  lote_inspeccion_clave: string = "N"
  situacionCalidad: string = "";
  causaInspeccion: number = 0;
  inspector: number = 0;
  accionCalidad: number = 0;
  
  //
  tiempo: string = "";
  tiempoTitulo: string = "";
  tiempoDetalle: string = "";
  verIrArriba: boolean = false;
  verImagen: boolean = false;
  cronometro: any;
  offSet: number;
  enProceso: any = [];
  enStock: any = [];
  enEspera: any = [];
  detalles: any = [];
  detLote: any = [];
  tiempo_entre_lecturas: number = 20;
  tipo_flujo: string = ""
  
  procesoSeleccionado: any = {id: 0, nombre: "", capacidad_proceso: 0, capacidad_stock: 0, desde: "", imagen: "", lotes: 0, items: 0, };
  verBuscar: boolean = false;
  noAnimar: boolean = false;  
  permiteBuscar: boolean = true;  
  verBarra: string = "auto";
  altoPantalla: number = this.servicio.rPantalla().alto - 105;
  anchoPantalla: number = this.servicio.rPantalla().ancho - 10;
  errorMensaje: string = "";
  procesos: any = [];
  iconoGeneral = "iconshock-iphone-business-solution";
  iconoParte = "iconshock-iphone-business-product-combo";


  //URL_BASE = "http://localhost:8081/sigma/api/upload.php";
  //URL_IMAGENES = "http://localhost:8081/sigma/assets/imagenes/";

  URL_BASE = "/sigma/api/upload.php"
  URL_IMAGENES = "/sigma/assets/imagenes/";

  @ViewChild("txtBuscar", { static: false }) txtBuscar: ElementRef;
  @ViewChild("lstProceso", { static: false }) lstProceso: MatSelect;

  scrollingSubscription: Subscription;
  escaner: Subscription;
  vistaCatalogo: Subscription;

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.scrollingSubscription) 
    {
      this.scrollingSubscription.unsubscribe()
    }

    if (this.vistaCatalogo) 
    {
      this.vistaCatalogo.unsubscribe()
    }

    if (this.escaner) 
    {
      this.escaner.unsubscribe()
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

  salidaEfecto(evento: any)
  {
    if (evento.toState && this.verRegistro > 0)
    {
       if (this.verRegistro == 21 || this.verRegistro == 1)      
       {
        this.verRegistro = 1;
       }
       else if (this.verRegistro == 22 || this.verRegistro == 2)      
       {
        this.verRegistro = 2;
       }
       else if (this.verRegistro == 23 || this.verRegistro == 3)      
       {
        this.verRegistro = 3;
       }
    }

    setTimeout(() => {
      this.verImagen = true  
    }, 300);
    
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

  validarProcesos()
  {
    this.servicio.activarSpinner.emit(true);       
    let sentencia = "SELECT a.id FROM sigma.cat_procesos a INNER JOIN sigma.relacion_usuarios_operaciones b ON a.id = b.proceso WHERE a.estatus = 'A' AND b.usuario = " + this.servicio.rUsuario().id + " ORDER BY a.nombre;"
    if (this.servicio.rUsuario().operacion=="S")
    {
      sentencia = "SELECT a.id FROM sigma.cat_procesos a WHERE a.estatus = 'A' ORDER BY a.nombre;"
    }
    
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 1)
      {
        this.vista = 1;
        this.verRegistro = 2;
        this.permiteBuscar = true;
        this.listarProcesos();
        
      }
      else if (resp.length == 1)
      {
        this.verRegistro = 2;        
        this.procesoSeleccionado.id = resp[0].id;
        this.resumen();
        this.permiteBuscar = false;
      }
      else
      {
        this.servicio.aEscanear(false);
        this.vista = 1;
        setTimeout(() => {
          this.servicio.activarSpinner.emit(false);    
        }, 300);
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "custom-class-red";
        mensajeCompleto.mensaje = "El usuario '" + this.servicio.rUsuario().nombre + "' NO tiene ningún proceso asociado";;
        mensajeCompleto.tiempo = 2500;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        }
    })
    
  }
  listarProcesos()
  {
    this.servicio.activarSpinner.emit(true);       
    //let sentencia = "SELECT id, imagen, nombre, referencia, capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM det_procesos WHERE proceso = a.id and estatus = 'A'), 0) AS capacidad_proceso, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 20 and proceso = a.id) AS enstock, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 50 and proceso = a.id) AS enproceso, 'S' AS mostrarImagen FROM sigma.cat_procesos a INNER JOIN sigma.relacion_usuarios_operaciones b ON a.id = b.proceso WHERE a.estatus = 'A' AND b.usuario = " + this.servicio.rUsuario().id + " ORDER BY a.nombre;"
    let sentencia = "SELECT a.id, a.nombre, a.referencia, a.capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM det_procesos WHERE proceso = a.id AND estatus = 'A'), 0) AS cap_proceso, a.imagen, 'S' AS mostrarImagen, (SELECT COUNT(*) FROM sigma.lotes WHERE estado <= 50 AND estatus = 'A' AND estado <= 50 AND proceso = a.id) AS totall, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 0 AND estatus = 'A' AND proceso = a.id) AS espera, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 20 AND estatus = 'A' AND proceso = a.id) AS stock, IF(a.capacidad_stock = 0, 0, FLOOR((SELECT stock) / a.capacidad_stock * 100)) AS pctstock, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 50 AND estatus = 'A' AND proceso = a.id) AS proceso, IF((SELECT cap_proceso) = 0, 0, FLOOR((SELECT proceso) / (SELECT cap_proceso) * 100)) AS pctproceso, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 80 AND estatus = 'A' AND proceso = a.id) AS calidad FROM sigma.cat_procesos a WHERE a.estatus = 'A' AND a.id IN (SELECT proceso FROM sigma.relacion_usuarios_operaciones WHERE usuario = " + this.servicio.rUsuario().id + ") ORDER BY a.nombre" ;
    if (this.servicio.rUsuario().operacion=="S")
    {
      sentencia = "SELECT a.id, a.nombre, a.referencia, a.capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM det_procesos WHERE proceso = a.id AND estatus = 'A'), 0) AS cap_proceso, a.imagen, 'S' AS mostrarImagen, (SELECT COUNT(*) FROM sigma.lotes WHERE estado <= 50 AND estatus = 'A' AND estado <= 50 AND proceso = a.id) AS totall, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 0 AND estatus = 'A' AND proceso = a.id) AS espera, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 20 AND estatus = 'A' AND proceso = a.id) AS stock, IF(a.capacidad_stock = 0, 0, FLOOR((SELECT stock) / a.capacidad_stock * 100)) AS pctstock, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 50 AND estatus = 'A' AND proceso = a.id) AS proceso, IF((SELECT cap_proceso) = 0, 0, FLOOR((SELECT proceso) / (SELECT cap_proceso) * 100)) AS pctproceso, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 80 AND estatus = 'A' AND proceso = a.id) AS calidad FROM sigma.cat_procesos a WHERE a.estatus = 'A' ORDER BY a.nombre" ;
    }
    this.servicio.aEscanear(false);
      
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.procesos = resp;
      this.arrFiltrado = resp;
      setTimeout(() => {
        this.servicio.activarSpinner.emit(false);    
      }, 300);
      this.contarRegs()

    });
  }

  filtrar()
  {
    if (this.vista == 1)
    {
      this.procesos = this.aplicarFiltro(this.textoBuscar);
    }
    else if (this.vista == 3)
    {
      this.detalles = this.aplicarFiltro(this.textoBuscar);
    }
    this.contarRegs();    
  }

  aplicarFiltro(cadena: string) 
  {
    if (!cadena ) 
    {
      return this.arrFiltrado;
    }
    else if (this.vista == 1)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.capacidad_stock.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.cap_proceso.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.referencia.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.stock.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.totall.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.espera.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.pctproceso.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.pctstock.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          
      )
    }
    else if (this.vista == 3)
    {
      return this.arrFiltrado.filter(datos => 
          datos.numero.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.referencia.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fecha.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.hasta.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.parte.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estado.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.prioridad.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }
  }

  contarRegs()
  {
    let mensaje = "No hay procesos validos asociados este usuario";
    let cadAdicional: string = (this.procesos.length != this.arrFiltrado.length ? " (filtrada de un total de " + this.arrFiltrado.length + ") " : "");
    if (this.vista == 1)
    {
      if (this.procesos.length > 0)
      {
        mensaje = "Hay " + (this.procesos.length == 1 ? "un proceso valido asociado a este usuario" : this.procesos.length + " procesos validos asociados a este usuario") + cadAdicional
      }
      this.servicio.mensajeInferior.emit(mensaje);          
    }
    else if (this.vista == 3)
    {
      cadAdicional = (this.detalles.length != this.arrFiltrado.length ? " (filtrada de un total de " + this.arrFiltrado.length + ") " : "");
      if (this.detalles.length > 0)
      {
        mensaje = (this.detalles.length == 1 ? "Un lote en la vista" : this.detalles.length + " lotes en la vista");
      }
      else
      {
        mensaje = "No hay lotes en la vista"
      }
      mensaje = mensaje + cadAdicional + " => Proceso '" + this.procesoSeleccionado.nombre + "'";

      this.servicio.mensajeInferior.emit(mensaje);
    }
  }

  imagenError(id: number)
  {
    //if (this.accion == "in")
    {
      this.procesos[id].mostrarImagen = "N";
      
    }
  }

  imagenErrorParte(id: number)
  {
    //if (this.accion == "in")
    {
      this.detalles[id].mostrarImagen = "N";
      
    }
  }

  imagenErrorLote()
  {
    //if (this.accion == "in")
    {
      this.detLote.mostrarImagen = "N";
      
    }
  }

  imagenErrorDetalle()
  {
    //if (this.accion == "in")
    {
      this.procesoSeleccionado.mostrarImagen = "N";
    }
  }


  cancelar()
  {
  }

  procesarPantalla(id: number)
  {

  }

  solicitarIdentificacion()
  {
    this.vista = 1;
    this.permiteBuscar = true;
    
    this.verImagen = false;
    this.verRegistro = 22;
    this.listarProcesos();
  }

  identificar(proceso: any)
  {
    this.servicio.aEscanear(true);
    this.procesoSeleccionado.id = proceso.id;
    this.procesoSeleccionado.nombre = proceso.nombre;
    this.procesoSeleccionado.referencia = proceso.referencia;
    this.procesoSeleccionado.mostrarImagen = "S";
    this.procesoSeleccionado.capacidad_proceso = (+proceso.enproceso > 0 ? proceso.enproceso + " / ": "") + proceso.capacidad_proceso;
    this.procesoSeleccionado.imagen = proceso.imagen;
    this.procesoSeleccionado.capacidad_stock =  (+proceso.enstock > 0 ? proceso.enstock + " / ": "") + proceso.capacidad_stock;
    this.procesoSeleccionado.capacidad_proceso_pct = Math.floor((+proceso.enproceso / +proceso.capacidad_proceso) * 100) + "%";
    this.procesoSeleccionado.capacidad_stock_pct = Math.floor((+proceso.enstock / +proceso.capacidad_stock) * 100) + "%";
    this.procesoSeleccionado.lotesEPAlarmados = 0;
    this.procesoSeleccionado.lotesEPPorAlarmar = 0;
    this.procesoSeleccionado.lotesESAlarmados = 0;
    this.procesoSeleccionado.lotesESPorAlarmar = 0;
    this.procesoSeleccionado.lotesEEAlarmados = 0;
    this.procesoSeleccionado.lotesEEPorAlarmar = 0;
    this.procesoSeleccionado.desde = new Date();
    this.vista = 2;
    this.cronometrando = false;
    this.permiteBuscar = false;
    this.verBuscar = false;
    this.verRegistro = 21;
    this.cadaSegundo();
  }

  estatusProceso()
  {
    this.buscarLotes(50);
    this.buscarLotes(51);
    //this.buscarLotes(20);
    this.buscarLotes(0);
    this.contarRegs();
  }

  cadaSegundo()
  {
    if (this.esperaDisparo > 0)
    {
      this.esperaDisparo = this.esperaDisparo - 1;
      let mensaje = "";
      if (this.esperaDisparo == 0)
      {
        this.disparoSiguiente = 0;
        mensaje = "0";
        setTimeout(() => {
          this.verEspera = false;
        }, 1000);
      }
      else
      {
        mensaje = '' + this.esperaDisparo ;
      }      
      this.detLote.tiempo = mensaje;
    }
    else
    {
      if (this.cronometrando || this.vista == 1 || this.procesoSeleccionado.id == 0) 
      {
        return;
      }
      this.cronometrando = true;
      let tiempo = this.servicio.tiempoTranscurrido(this.procesoSeleccionado.desde, "D").split(";");
      let strDias = tiempo[0];
      let strHoras = tiempo[1];
      let strMinutos = tiempo[2];
      if (+tiempo[0] == 0)
      {
        strDias = "";
      }
      if (+tiempo[1] < 10) 
      { 
        strHoras = '0' + tiempo[1];
      }
      if (+tiempo[2] < 10) 
      { 
        strMinutos = '0' + +tiempo[2];
      } 
      if (+tiempo[0] > 0)
      {
        strDias = +tiempo[0] + "d";
      }
      if ((+tiempo[0] + +tiempo[1] + +tiempo[2]) > 0)
      {
        this.tiempo = strDias + " " + (+tiempo[1] + +tiempo[2] > 0  ? (strHoras + ":" + strMinutos) : "") 
      }
      else
      {
        this.tiempo = "< 1 min"
      }
      if (this.vista == 2)
      {
        this.servicio.mensajeInferior.emit("Asignado desde: " + this.servicio.fecha(2,this.procesoSeleccionado.desde,"EEEE, dd MMM yyyy HH:mm") + " Van: " + this.tiempo);  
        this.revisarLotes();
      }

      if (this.vista == 3)
      {

        let sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' END as estado, a.parte, b.referencia, IFNULL(b.nombre, 'N/A') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado, c.tiempo_proceso, a.hasta FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id LEFT JOIN sigma.det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = " + this.tipoLote + " ORDER BY a.inspecciones DESC, 3, a.fecha;"
        if (this.tipoLote == 0)
        {
          this.estadoActual = "EN ESPERA"
          sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' END as estado, a.parte, b.referencia, IFNULL(b.nombre, 'N/A') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = 0 ORDER BY a.inspecciones DESC, 3, a.fecha;"
        }
        else if (this.tipoLote == 90)
        {
          this.estadoActual = "TODOS"
          sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' END as estado, a.parte, b.referencia, IFNULL(b.nombre, 'N/A') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado, IF(a.estado = 20, c.tiempo_stock, c.tiempo_proceso) AS tiempo_proceso, a.hasta FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id LEFT JOIN sigma.det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado < 90 ORDER BY a.inspecciones DESC, 3, a.fecha;"
        }
        else if (this.tipoLote == 20)
        {
          sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' END as estado, a.parte, b.referencia, IFNULL(b.nombre, 'N/A') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado, c.tiempo_stock, a.hasta FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id LEFT JOIN sigma.det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = " + this.tipoLote + " ORDER BY a.inspecciones DESC, 3, a.fecha;"
          this.estadoActual = "EN STOCK"
        }
        else if (this.tipoLote == 50)
        {
          this.estadoActual = "EN PROCESO"
        }
    
        let campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {

          let actualizar: boolean = false; 
          actualizar = this.arrFiltrado.length != resp.length;
          if (!actualizar)
          {
            for (var i = 0; i < this.arrFiltrado.length; i++)
            {
              actualizar = this.arrFiltrado[i].id != resp[i].id
              if (actualizar)
              {
                break;
              }
              else
                {
                  if (this.arrFiltrado[i].hasta)
                  {
                    if (this.arrFiltrado[i].hasta != resp[i].hasta)
                    {
                      actualizar = true
                      break;
                    }
                  }
                  if (this.arrFiltrado[i].prioridad)
                  {
                    if (this.arrFiltrado[i].prioridad != resp[i].prioridad)
                    {
                      actualizar = true
                      break;
                    }
                  }
                }
            };
          }
          if (actualizar)
          {
            this.detalles = resp;
            this.arrFiltrado = resp;
          }

          Object.keys(this.detalles).forEach((elemento, index) => 
          {
            let segundos = [];
            if (this.detalles[index].hasta && this.detalles[index].estado != "En Espera")
            {
              if (new Date(this.detalles[index].hasta) > new Date())
              {
                if (+this.servicio.tiempoTranscurrido(this.detalles[index].hasta, "FS").split(";")[3] < this.tiempoAlerta)
                {
                  this.detalles[index].alarmado = "1";
                  this.detalles[index].titulo = "Faltan";
                }
                else
                {
                  this.detalles[index].alarmado = "0";
                  this.detalles[index].titulo = "Faltan";
                }
                segundos =  this.servicio.tiempoTranscurrido(this.detalles[index].hasta, "F").split(";");
              } 
              else
              {
                this.detalles[index].alarmado = "2";
                this.detalles[index].titulo = "Retraso";
                segundos =  this.servicio.tiempoTranscurrido(this.detalles[index].hasta, "").split(";");
              }
            }
            else if (this.detalles[index].estado == "En Espera")
            {
              console.log(new Date(this.detalles[index].fecha) + " " + new Date())
              if (new Date(this.detalles[index].fecha) > new Date())
              {
                this.detalles[index].tiempo = "N/A";
                this.detalles[index].titulo = "En espera";
              }
              else
              {
                segundos =  this.servicio.tiempoTranscurrido(this.detalles[index].fecha, "").split(";");
                this.detalles[index].titulo = "Van";
              }
            }
            else
            {
              this.detalles[index].tiempo = "N/A";
              this.detalles[index].titulo = "En espera";
            }
            if (this.detalles[index].titulo != "En espera")
            {
              this.detalles[index].tiempo = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
            }
            this.contarRegs();
          }); 
        });
      }
    }
    this.cronometrando = false;
  }

  buscarLotes(tipoLote: number)
  {
    let sentencia = "SELECT COUNT(DISTINCT(parte)) AS partes, COUNT(*) AS lotes FROM sigma.lotes WHERE estatus = 'A' AND proceso = " + this.procesoSeleccionado.id + " AND estado = 50 UNION ALL SELECT COUNT(DISTINCT(parte)) AS partes, COUNT(*) AS lotes FROM sigma.lotes WHERE estatus = 'A' AND proceso = " + this.procesoSeleccionado.id + " AND estado = 20 UNION ALL SELECT COUNT(DISTINCT(parte)) AS partes, COUNT(*) AS lotes FROM sigma.lotes WHERE estatus = 'A' AND proceso = " + this.procesoSeleccionado.id + " AND estado = 0 UNION ALL SELECT COUNT(DISTINCT(parte)) AS partes, COUNT(*) AS lotes FROM sigma.lotes WHERE estatus = 'A' AND proceso = " + this.procesoSeleccionado.id + " AND estado <= 50;";

    if (tipoLote == 51)
    {
      sentencia = "SELECT a.id, a.numero, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, a.inspecciones, IFNULL(b.nombre, 'N/A') AS parte, a.fecha, '0' AS alarmado, c.tiempo_proceso, a.hasta FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id LEFT JOIN sigma.det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = 50 ORDER BY a.inspecciones DESC, 3, a.fecha ASC LIMIT 5;"
    }
    else if (tipoLote == 20)
    {
      sentencia = "SELECT a.id, a.numero, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, a.inspecciones, IFNULL(b.nombre, 'N/A') AS parte, a.fecha, '0' AS alarmado, c.tiempo_stock, a.hasta FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id LEFT JOIN sigma.det_rutas c ON a.ruta_detalle = c.id id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = 20 ORDER BY a.inspecciones DESC, 3, a.fecha ASC LIMIT 5;"
    }
    else if (tipoLote == 0)
    {
      sentencia = "SELECT a.id, a.numero, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, a.inspecciones, IFNULL(b.nombre, 'N/A') AS parte, a.fecha FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = 0 ORDER BY a.inspecciones DESC, 3, a.fecha ASC LIMIT 5;"
    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (tipoLote == 50)
      {
        this.procesoSeleccionado.lotes = resp[3].lotes;
        this.procesoSeleccionado.items = resp[3].partes;
        this.procesoSeleccionado.lotesEP = resp[0].lotes;
        this.procesoSeleccionado.itemsEP = resp[0].partes;
        this.procesoSeleccionado.lotesES = resp[1].lotes;
        this.procesoSeleccionado.itemsES = resp[1].partes;
        this.procesoSeleccionado.lotesEE = resp[2].lotes;
        this.procesoSeleccionado.itemsEE = resp[2].partes;
        this.procesoSeleccionado.calidad = resp[3].lotes;
        this.procesoSeleccionado.itemsEE = resp[2].partes;
      }
      else if (tipoLote == 51)
      {
        this.procesoSeleccionado.tmpLotesPorAlarmar = 0;
        this.procesoSeleccionado.tmpLotesAlarmados = 0;
        let actualizar: boolean = false; 
        actualizar = this.enProceso.length != resp.length;
        if (!actualizar)
        {
          for (var i = 0; i < this.enProceso.length; i++)
          {
            actualizar = this.enProceso[i].id != resp[i].id
            if (actualizar)
            {
              break;
            }
            else
              {
                if (this.enProceso[i].hasta || resp[i].hasta)
                {
                  if (this.enProceso[i].hasta != resp[i].hasta)
                  {
                    actualizar = true
                    break;
                  }
                  else
                  {
                    actualizar = this.enProceso[i].inspecciones != resp[i].inspecciones
                    if (actualizar)
                    {
                      break;
                    }
                  }
                }
              }
          };
        }
        if (actualizar)
        {
          this.enProceso = resp;
        }
        let lotesEPAlarmados = 0;
        let lotesEPPorAlarmar = 0;
        if (this.enProceso.length > 0 && this.vista == 2)
        {
          for (var i = 0; i < this.enProceso.length; i++)
          {
            let segundos = [];
            if (this.enProceso[i].hasta)
            {
              if (new Date(this.enProceso[i].hasta) > new Date())
              {
                
                if (+this.servicio.tiempoTranscurrido(this.enProceso[i].hasta, "FS").split(";")[3] < this.tiempoAlerta)
                {
                  this.enProceso[i].alarmado = "1";
                  lotesEPPorAlarmar = lotesEPPorAlarmar + 1;
                  this.procesoSeleccionado.tmpLotesPorAlarmar = this.procesoSeleccionado.tmpLotesPorAlarmar + 1;
                }
                else
                {
                  this.enProceso[i].alarmado = "0";
                }
                segundos =  this.servicio.tiempoTranscurrido(this.enProceso[i].hasta, "F").split(";");
              } 
              else
              {
                this.enProceso[i].alarmado = "2";
                segundos =  this.servicio.tiempoTranscurrido(this.enProceso[i].hasta, "").split(";");
                lotesEPAlarmados = lotesEPAlarmados + 1; 
                this.procesoSeleccionado.tmpLotesAlarmados = this.procesoSeleccionado.tmpLotesAlarmados + 1; 
              }
              this.enProceso[i].tiempo = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
            }
            else
            {
              this.enProceso[i].alarmado = "0";
              this.enProceso[i].tiempo =  "N/A";
            }
          } 
        }
        if (lotesEPAlarmados != this.procesoSeleccionado.lotesEPAlarmados)
        {
          this.procesoSeleccionado.lotesEPAlarmados = lotesEPAlarmados; 
        }
        if (lotesEPPorAlarmar != this.procesoSeleccionado.lotesEPPorAlarmar)
        {
          this.procesoSeleccionado.lotesEPPorAlarmar = lotesEPPorAlarmar; 
        }
        
        sentencia = "SELECT a.id, a.numero, IFNULL(b.nombre, 'N/A') AS parte, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, a.inspecciones, a.fecha, '0' AS alarmado, c.tiempo_stock, a.hasta FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id LEFT JOIN sigma.det_rutas c ON a.ruta_detalle = c.id LEFT JOIN sigma.det_rutas d ON a.parte = d.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = 20 ORDER BY a.inspecciones DESC, 4, a.fecha, a.id ASC LIMIT 5;"
        let campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          let actualizar: boolean = false; 
          actualizar = this.enStock.length != resp.length;
          if (!actualizar)
          {
            for (var i = 0; i < this.enStock.length; i++)
            {
              actualizar = this.enStock[i].id != resp[i].id
              if (actualizar)
              {
                break;
              }
              else
              {
                if (this.enStock[i].hasta)
                {
                  if (this.enStock[i].hasta != resp[i].hasta)
                  {
                    actualizar = true
                    break;
                  }
                }
                if (this.enStock[i].prioridad)
                {
                  if (this.enStock[i].prioridad != resp[i].prioridad)
                  {
                    actualizar = true
                    break;
                  }
                  else
                {
                  actualizar = this.enStock[i].inspecciones != resp[i].inspecciones
                  if (actualizar)
                  {
                    break;
                  }
                }
                }
              }
            };
          }
          if (actualizar)
          {
            this.enStock = resp;
          }
          let lotesESAlarmados = 0;
          let lotesESPorAlarmar = 0;
            
          if (this.enStock.length > 0 && this.vista == 2)
          {
            for (var i = 0; i < this.enStock.length; i++) 
            {
              let segundos = [];
              if (new Date(this.enStock[i].hasta) > new Date())
              {
                if (+this.servicio.tiempoTranscurrido(this.enStock[i].hasta, "FS").split(";")[3] < this.tiempoAlerta)
                {
                  this.enStock[i].alarmado = "1";
                  lotesESPorAlarmar = lotesESPorAlarmar + 1;
                  this.procesoSeleccionado.tmpLotesPorAlarmar = this.procesoSeleccionado.tmpLotesPorAlarmar + 1;
                }
                else
                {
                  this.enStock[i].alarmado = "0";
                }
                segundos =  this.servicio.tiempoTranscurrido(this.enStock[i].hasta, "F").split(";");
              } 
              else
              {
                this.enStock[i].alarmado = "2";
                segundos =  this.servicio.tiempoTranscurrido(this.enStock[i].hasta, "").split(";");
                lotesESAlarmados = lotesESAlarmados + 1; 
                this.procesoSeleccionado.tmpLotesAlarmados = this.procesoSeleccionado.tmpLotesAlarmados + 1; 
              }
              this.enStock[i].tiempo = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
            }
            
          }
          if (lotesESAlarmados != this.procesoSeleccionado.lotesESAlarmados)
          {
            this.procesoSeleccionado.lotesESAlarmados = lotesESAlarmados;
          }
          if (lotesESPorAlarmar != this.procesoSeleccionado.lotesESPorAlarmar)
          {
            this.procesoSeleccionado.lotesESPorAlarmar = lotesESPorAlarmar;
          }
          if (this.procesoSeleccionado.tmpLotesAlarmados != this.procesoSeleccionado.lotesAlarmados)
          {
            this.procesoSeleccionado.lotesAlarmados = this.procesoSeleccionado.tmpLotesAlarmados;
          }
          if (this.procesoSeleccionado.tmpLotesPorAlarmar != this.procesoSeleccionado.lotesPorAlarmar)
          {
            this.procesoSeleccionado.lotesPorAlarmar = this.procesoSeleccionado.tmpLotesPorAlarmar;
          }
        })


      }
      else if (tipoLote == 20)
      {
        let actualizar: boolean = false; 
        actualizar = this.enStock.length != resp.length;
        if (!actualizar)
        {
          for (var i = 0; i < this.enStock.length; i++)
          {
            actualizar = this.enStock[i].id != resp[i].id
            if (actualizar)
            {
              break;
            }
            else
            {
              if (this.enStock[i].hasta)
              {
                if (this.enStock[i].hasta != resp[i].hasta)
                {
                  actualizar = true
                  break;
                }
              }
              if (this.enStock[i].prioridad)
              {
                if (this.enStock[i].prioridad != resp[i].prioridad)
                {
                  actualizar = true
                  break;
                }
                else
                {
                  actualizar = this.enStock[i].inspecciones != resp[i].inspecciones
                  if (actualizar)
                  {
                    break;
                  }
                }
         
              }
            }
          };
        }
        if (actualizar)
        {
          this.enStock = resp;
        }
        if (this.enStock.length > 0 && this.vista == 2)
        {
          let lotesESAlarmados = 0;
          let lotesESPorAlarmar = 0;
          for (var i = 0; i < this.enStock.length; i++) 
          {
            let segundos = [];
            if (new Date(this.enStock[i].hasta) > new Date())
            {
              if (+this.servicio.tiempoTranscurrido(this.enStock[i].hasta, "FS").split(";")[3] < this.tiempoAlerta)
              {
                this.enStock[i].alarmado = "1";
                lotesESPorAlarmar = lotesESPorAlarmar + 1;
                this.procesoSeleccionado.tmpLotesPorAlarmar = this.procesoSeleccionado.tmpLotesPorAlarmar + 1;
              }
              else
              {
                this.enStock[i].alarmado = "0";
              }
              segundos =  this.servicio.tiempoTranscurrido(this.enStock[i].hasta, "F").split(";");
            } 
            else
            {
              this.enStock[i].alarmado = "2";
              segundos =  this.servicio.tiempoTranscurrido(this.enStock[i].hasta, "").split(";");
              lotesESAlarmados = lotesESAlarmados + 1; 
              this.procesoSeleccionado.tmpLotesAlarmados = this.procesoSeleccionado.tmpLotesAlarmados + 1; 
            }
            this.enStock[i].tiempo = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
          }
          if (lotesESAlarmados != this.procesoSeleccionado.lotesESAlarmados)
          {
            this.procesoSeleccionado.lotesESAlarmados = lotesESAlarmados;
          }
          if (lotesESPorAlarmar != this.procesoSeleccionado.lotesPorAlarmar)
          {
            this.procesoSeleccionado.lotesPorAlarmar = lotesESPorAlarmar;
          }
          if (this.procesoSeleccionado.tmpLotesAlarmados != this.procesoSeleccionado.lotesAlarmados)
          {
            this.procesoSeleccionado.lotesAlarmados = this.procesoSeleccionado.tmpLotesAlarmados;
          }
          if (this.procesoSeleccionado.tmpLotesPorAlarmar != this.procesoSeleccionado.lotesPorAlarmar)
          {
            this.procesoSeleccionado.lotesPorAlarmar = this.procesoSeleccionado.tmpLotesPorAlarmar;
          }
        }
      }
      else if (tipoLote == 0)
      {
        let actualizar: boolean = false; 
        actualizar = this.enEspera.length != resp.length;
        if (!actualizar)
        {
          for (var i = 0; i < this.enEspera.length; i++)
          {
            actualizar = this.enEspera[i].id != resp[i].id
            if (actualizar)
            {
              break;
            }
            else
            {
              if (this.enEspera[i].prioridad)
              {
                if (this.enEspera[i].prioridad != resp[i].prioridad)
                {
                  actualizar = true
                  break;
                }
                else
                {
                  actualizar = this.enEspera[i].inspecciones != resp[i].inspecciones
                  if (actualizar)
                  {
                    break;
                  }
                }
              }
            }
          };
        }
        if (actualizar)
        {
          this.enEspera = resp;
        }
        if (this.enEspera.length > 0 && this.vista == 2)
        {
          for (var i = 0; i < this.enEspera.length; i++)
          {
            let segundos = [];
            if (new Date(this.enEspera[i].fecha) > new Date())
            {
              this.enEspera[i].tiempo = "N/A";
            }
            else
            {
              segundos =  this.servicio.tiempoTranscurrido(this.enEspera[i].fecha, "").split(";");
              this.enEspera[i].tiempo = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);  
            }
            
          }
        }
      }
    });
  }

  escapar()
  {
    if (this.verEspera)
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      let mensajeCompleto: any = [];
      mensajeCompleto.clase = "custom-class";
      mensajeCompleto.mensaje = "Se cancela la lectura";
      mensajeCompleto.tiempo = 2500;
      this.servicio.mensajeToast.emit(mensajeCompleto);
    }
    else if (this.verBuscar)
    {
      this.buscar()
    }
    
  }

  buscar()
  {
    if (this.permiteBuscar)
    {
      this.verBuscar = !this.verBuscar
      if (this.verBuscar)
      {
        setTimeout(() => {
          this.txtBuscar.nativeElement.focus();
        }, 50);
      }
    }
  }

  refrescar()
  {
    if (this.vista == 3)
    {
      this.detalleProceso(this.tipoLote); 
    }
    else if (this.vista == 2)
    {
      this.resumen(); 
      
    }
    else if (this.vista == 1)
    {
      this.verRegistro = 2;
      this.listarProcesos(); 
      
    }
  }

  detalleProceso(tipoLote: number)
  {
    this.servicio.aEscanear(true);
    this.tipoLote = tipoLote;
    this.verRegistro = 23;
    this.permiteBuscar = true;
    this.vista = 3;
    this.detalles = [];
    this.servicio.activarSpinner.emit(true);    
    let sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, a.inspecciones, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' END as estado, a.parte, b.referencia, IFNULL(b.nombre, 'N/A') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado, c.tiempo_proceso, a.hasta FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id LEFT JOIN sigma.det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = " + tipoLote + " ORDER BY a.inspecciones DESC, prioridad, a.fecha, a.id;"
    if (tipoLote == 0)
    {
      this.estadoActual = "EN ESPERA"
      sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, a.inspecciones, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' END as estado, a.parte, b.referencia, IFNULL(b.nombre, 'N/A') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = 0 ORDER BY a.inspecciones DESC, prioridad,  a.fecha, a.id;"
    }
    else if (tipoLote == 90)
    {
      this.estadoActual = "TODOS"
      sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, a.inspecciones, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' END as estado, a.parte, b.referencia, IFNULL(b.nombre, 'N/A') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado, IF(a.estado = 20, c.tiempo_stock, c.tiempo_proceso) AS tiempo_proceso, a.hasta FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id LEFT JOIN sigma.det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " ORDER BY a.inspecciones DESC, prioridad,  a.fecha, a.id;"
    }
    else if (tipoLote == 20)
    {
      sentencia = "SELECT a.numero, b.imagen, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, a.inspecciones, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' END as estado, a.parte, b.referencia, IFNULL(b.nombre, 'N/A') AS nombre, 'S' AS mostrarImagen, a.fecha, '-' AS tiempo, '0' AS alarmado, c.tiempo_stock, a.hasta FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id LEFT JOIN sigma.det_rutas c ON a.ruta_detalle = c.id WHERE a.estatus = 'A' AND a.proceso = " + this.procesoSeleccionado.id + " AND a.estado = " + tipoLote + " ORDER BY a.inspecciones DESC, prioridad,  a.fecha, a.id;"
      this.estadoActual = "EN STOCK"
    }
    else if (tipoLote == 50)
    {
      this.estadoActual = "EN PROCESO"
    }

    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length == 0)
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "custom-class";
        mensajeCompleto.mensaje = "No se hallaron lotes en el proceso seleccionado";
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      this.detalles = resp;
      this.arrFiltrado = resp;
      setTimeout(() => {
        this.servicio.activarSpinner.emit(false);    
      }, 300);
      this.contarRegs()
    });
    
    this.cronometrando = false;
  }

  resumen()
  {
    this.detalles = [];
    this.servicio.aEscanear(true);
    this.servicio.activarSpinner.emit(true);  
    let sentencia = "SELECT id, imagen, referencia, nombre, capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM det_procesos WHERE proceso = a.id and estatus = 'A'), 0) AS capacidad_proceso, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 20 AND proceso = a.id) AS enstock, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 50 AND proceso = a.id) AS enproceso, 'S' AS mostrarImagen FROM sigma.cat_procesos a WHERE id = " +  this.procesoSeleccionado.id + ";";
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.identificar(resp[0])
    })
    setTimeout(() => {
      this.servicio.activarSpinner.emit(false);    
    }, 300);
  }

  flujo(accion: number)
  {
    
  }

  validarEntrada(cadenaScaner: string)
  {
    let cadena = cadenaScaner.replace(/('|")/g, "");

    //Se valida que el lote exista en el sistema, que sea un código de scrap o que sea un código de inspección
    //sSe busca vía de Escape
    if (this.disparoSiguiente == 0)
    {
      let sentencia = "SELECT * FROM sigma.cat_situaciones WHERE referencia = '" + cadena + "'";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length > 1)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "Existen " + resp.length + " situaciones de calidad con la referencia '" + cadena + "'. Por favor notifique este incidente al administador del sistema";
          mensajeCompleto.tiempo = 6000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp.length == 1)
        {
          let boton1 = "";
          let icono1 = "";
          if (resp[0].tipo == 0)
          {
            this.detLote.subTitulo = "Lea el código del Lote a inspeccionar";
            this.detLote.titulo = "ENVIAR LOTE A INSPECCIÓN";
            boton1 = "Transferir lote a Inspección";
            icono1 = "iconshock-materialblack-general-cancel";
            this.accionCalidad = 0;
          }
          else if (resp[0].tipo == 50)
          {
            this.detLote.subTitulo = "Lea el código del Lote a rechazar";
            this.detLote.titulo = "ENVIAR LOTE A RECHAZO";
            boton1 = "Rechazar el lote";
            icono1 = "iconshock-materialblack-general-preview2";
            this.accionCalidad = 50;
          }
          this.causaInspeccion = resp[0].id;
          if (this.lote_inspeccion_clave == "S")
          {
            this.servicio.aEscanear(false);
            const respuesta = this.dialogo.open(DialogoComponent, {
              width: "480px", height: "385px", data: { revision: 0, causaC: 0, causaD: resp[0].nombre + " (Ref: " + resp[0].referencia + ")", codigo: resp[0].id, claves: "", usuarioCalidad: 0, clave: "1", titulo: this.detLote.titulo, mensaje: "", alto: "60", id: 0, accion: 0, botones: 2, boton1STR: boton1, icono1: icono1, boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-project-management-problems" }
            });
            respuesta.afterClosed().subscribe(result => {
              if (!result)
              {
                this.servicio.aEscanear(true);
              }
              if (result.accion == 1) 
              {
                this.servicio.aEscanear(true);
                this.situacionCalidad = resp[0].nombre;
                this.esperaDisparo = this.tiempo_entre_lecturas;
                this.inspector = result.usuarioCalidad;
                this.disparoSiguiente = 10;
                this.verEspera = true;
  
                this.conLote = 2;
                
                this.detLote.literal = "El lote será movido a la siguiente situación";
                this.detLote.producto = resp[0].nombre;
                this.detLote.numero = "";
                this.detLote.imagen = "";
                this.detLote.refproducto = "";
                this.detLote.mostrarImagen = "";
                this.detLote.fecha = "";
                this.detLote.estadoLote = "";
                this.detLote.tiempo = this.tiempo_entre_lecturas;
              }
              else
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "custom-class";
                mensajeCompleto.mensaje = "Operación cancelada";
                mensajeCompleto.tiempo = 1500;
                this.servicio.mensajeToast.emit(mensajeCompleto);
                this.servicio.aEscanear(true);
              }
            })
          }
          else
          {
            this.servicio.aEscanear(true);
            this.situacionCalidad = resp[0].nombre;
            this.esperaDisparo = this.tiempo_entre_lecturas;
            this.inspector = this.servicio.rUsuario().id;
            this.disparoSiguiente = 10;
            this.verEspera = true;

            this.conLote = 2;
            
            this.detLote.literal = "El lote será movido a la siguiente situación";
            this.detLote.producto = resp[0].nombre;
            this.detLote.numero = "";
            this.detLote.imagen = "";
            this.detLote.refproducto = "";
            this.detLote.mostrarImagen = "";
            this.detLote.fecha = "";
            this.detLote.estadoLote = "";
            this.detLote.tiempo = this.tiempo_entre_lecturas;
          }
          
        } 
        else
        {
          let sentencia = "SELECT reverso_permitir FROM sigma.configuracion WHERE reverso_referencia = '" + cadena + "'";
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            if (resp.length > 0)
            {
              if (resp[0].reverso_permitir == "N")
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "custom-class-red";
                mensajeCompleto.mensaje = "No está permitido el reverso de movimientos";
                mensajeCompleto.tiempo = 3000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
              }
              else if (resp[0].reverso_permitir == "S")
              {
                this.loteNumeroMover = cadena;
                this.loteEstado = resp[0].estado;
                this.loteMover = resp[0].id;
                this.parteMover = resp[0].parte;
                this.ultimaSecuencia = resp[0].secuencia;
                this.esperaDisparo = this.tiempo_entre_lecturas;
                this.disparoSiguiente = 50;
                this.verEspera = true;
                
                this.conLote = 2;
                this.detLote.titulo = "REVERSO DE MOVIMIENTO DE LOTE";
                this.detLote.numero = resp[0].numero;
                this.detLote.producto = "";
                this.detLote.literal = "";
                this.detLote.imagen = resp[0].imagen;
                this.detLote.refproducto = resp[0].refproducto;
                this.detLote.mostrarImagen = resp[0].mostrarImagen;
                this.detLote.fecha = resp[0].fecha;
                this.detLote.estadoLote = resp[0].estadoLote;
                this.mensajeBase = "";
                
                this.detLote.subTitulo = "Lea el código del Lote a transferir";
                this.detLote.tiempo = this.tiempo_entre_lecturas;
              }
              else if (resp[0].reverso_permitir == "C")
              {
                this.servicio.aEscanear(false);
                const respuesta = this.dialogo.open(DialogoComponent, {
                  width: "480px", height: "385px", data: { revision: 0, causaC: 0, causaD: "Transferir un lote a la situación de 'En Espera'", codigo: "", claves: "", usuarioCalidad: 0, clave: "4", titulo: "CONTRASEÑA REQUERIDA", mensaje: "", alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Transferir lote a situación 'En Espera'", icono1: "iconshock-materialblack-communications-sign-in", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-project-management-problems" }
                });
                respuesta.afterClosed().subscribe(result => {
                  if (!result)
                  {
                    this.servicio.aEscanear(true);
                  }
                  else if (result.accion == 1) 
                  {
                    this.loteNumeroMover = cadena;
                    this.loteEstado = resp[0].estado;
                    this.loteMover = resp[0].id;
                    this.ultimaSecuencia = resp[0].secuencia;
                    this.esperaDisparo = this.tiempo_entre_lecturas;
                    this.disparoSiguiente = 50;
                    this.verEspera = true;
                    
                    this.conLote = 2;
                    this.detLote.titulo = "REVERSO DE MOVIMIENTO DE LOTE";
                    this.detLote.numero = resp[0].numero;
                    this.detLote.producto = "";
                    this.detLote.literal = "";
                    this.detLote.imagen = resp[0].imagen;
                    this.detLote.refproducto = resp[0].refproducto;
                    this.detLote.mostrarImagen = resp[0].mostrarImagen;
                    this.detLote.fecha = resp[0].fecha;
                    this.detLote.estadoLote = resp[0].estadoLote;
                    this.mensajeBase = "";
                    
                    this.detLote.subTitulo = "Lea el código del Lote a transferir";
                    this.detLote.tiempo = this.tiempo_entre_lecturas;
                    this.servicio.aEscanear(true);
                  }
                  else
                  {
                    let mensajeCompleto: any = [];
                    mensajeCompleto.clase = "custom-class";
                    mensajeCompleto.mensaje = "Operación cancelada";
                    mensajeCompleto.tiempo = 1500;
                    this.servicio.mensajeToast.emit(mensajeCompleto);
                    this.servicio.aEscanear(true);
                  }
                  
                })
              }
            }
            else
            {
              sentencia = "SELECT a.*, d.nombre AS rdnombre, e.referencia as refproducto, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' END as estadoLote, b.nombre, e.nombre as producto, e.imagen, 'S' as mostrarImagen, c.nombre as nruta, c.inicia, (SELECT MAX(secuencia) FROM sigma.ruta_congelada WHERE lote = a.id) AS finaliza, (SELECT secuencia FROM sigma.ruta_congelada WHERE lote = a.id AND secuencia > a.ruta_secuencia ORDER BY secuencia LIMIT 1) as secuencia_siguiente FROM sigma.lotes a LEFT JOIN sigma.cat_procesos b ON a.proceso = b.id LEFT JOIN sigma.cat_rutas c ON a.ruta = c.id LEFT JOIN sigma.det_rutas d ON a.ruta_detalle = d.id LEFT JOIN sigma.cat_partes e ON a.parte = e.id WHERE a.estatus = 'A' AND a.numero = '" + cadena + "';";
              campos = {accion: 100, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                if (resp.length > 0)
                {
                  if (resp[0].estado == 90)
                  {
                    let mensajeCompleto: any = [];
                    mensajeCompleto.clase = "custom-class-red";
                    mensajeCompleto.mensaje = "El lote '" + cadena + "' está rechazado desde el día " + this.servicio.fecha(2, resp[0].rechazo, "dd/MM/yyyy HH:mm:ss");
                    mensajeCompleto.tiempo = 4000;
                    this.servicio.mensajeToast.emit(mensajeCompleto);
                  }
                  else if (resp[0].estado == 80)
                  {
                    let mensajeCompleto: any = [];
                    mensajeCompleto.clase = "custom-class-red";
                    mensajeCompleto.mensaje = "El lote '" + cadena + "' está en inspección desde el día " + this.servicio.fecha(2, resp[0].inspeccion, "dd/MM/yyyy HH:mm:ss");
                    mensajeCompleto.tiempo = 4000;
                    this.servicio.mensajeToast.emit(mensajeCompleto);
                  }
                  else if (resp[0].estado == 50 && +resp[0].finaliza == +resp[0].ruta_secuencia)
                  {
                    //Fin del proceso
                    sentencia = "UPDATE sigma.lotes SET estado = 99, alarma_tse = 'N', alarma_tpe = 'N', finaliza = NOW(), tiempo = TIME_TO_SEC(TIMEDIFF(NOW(), inicia)) WHERE id = " + resp[0].id + ";UPDATE sigma.lotes_historia SET fecha_salida = NOW(), tiempo_total = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_entrada)), tiempo_proceso = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_proceso)) WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + ";";
                    let campos = {accion: 200, sentencia: sentencia};  
                    this.servicio.consultasBD(campos).subscribe( resp =>
                    {
                      let mensajeCompleto: any = [];
                      mensajeCompleto.clase = "custom-class";
                      mensajeCompleto.mensaje = "FELICIDADES El lote '" + cadena + "' ha finalizado su ciclo de operación";
                      mensajeCompleto.tiempo = 4000;
                      this.servicio.mensajeToast.emit(mensajeCompleto);
                      this.cadaSegundo();
                    })
                  }   
                  else if (resp[0].estado == 50 && resp[0].proceso == this.procesoSeleccionado.id && this.tipo_flujo!="E")
                  {
                    let mensajeCompleto: any = [];
                    mensajeCompleto.clase = "custom-class-red";
                    mensajeCompleto.mensaje = "El lote '" + cadena + "' está procesandose en esta misma operación";
                    mensajeCompleto.tiempo = 3000;
                    this.servicio.mensajeToast.emit(mensajeCompleto);
                  }
                  else if (resp[0].estado == 50 && resp[0].proceso != this.procesoSeleccionado.id && this.tipo_flujo=="E")
                  {
                    let mensajeCompleto: any = [];
                    mensajeCompleto.clase = "custom-class-red";
                    mensajeCompleto.mensaje = "El lote '" + cadena + "' no es válido porque esta en la operación '" + resp[0].rdnombre + "'";
                    mensajeCompleto.tiempo = 4000;
                    this.servicio.mensajeToast.emit(mensajeCompleto);
                  }
                  else if (resp[0].estado == 50 && resp[0].proceso == this.procesoSeleccionado.id && this.tipo_flujo=="E")
                  {
                    this.loteNumeroMover = cadena;
                    this.loteEstado = resp[0].estado;
                    this.rutaActual = resp[0].ruta;
                    this.ultimaRutaDetalle = resp[0].ruta_detalle
                    this.loteMover = resp[0].id;
                    this.parteMover = resp[0].parte;
                    this.ultimaSecuencia = resp[0].ruta_secuencia;
                    this.esperaDisparo = this.tiempo_entre_lecturas;
                    this.disparoSiguiente = 20;
                    this.verEspera = true;
                    
                    this.conLote = 1;
                    this.detLote.titulo = "TRANSFERIR EL LOTE A OTRA OPERACIÓN";
                    this.detLote.numero = resp[0].numero;
                    this.detLote.producto = resp[0].producto;
                    this.detLote.literal = "";
                    this.detLote.imagen = resp[0].imagen;
                    this.detLote.refproducto = resp[0].refproducto;
                    this.detLote.mostrarImagen = resp[0].mostrarImagen;
                    this.detLote.fecha = resp[0].fecha;
                    this.detLote.estadoLote = resp[0].estadoLote;
                    this.mensajeBase = "";
                    
                    this.detLote.subTitulo = "Lea el código del Lote a transferir";
                    this.detLote.tiempo = this.tiempo_entre_lecturas;
                  }
                  else if (resp[0].estado == 50 && this.tipo_flujo=="J")
                  {
                    let sentencia = "SELECT a.secuencia, b.nombre FROM sigma.ruta_congelada a LEFT JOIN sigma.det_rutas b ON a.id_detruta = b.id WHERE a.proceso = " + this.procesoSeleccionado.id + " AND a.ruta = " + resp[0].ruta + " ORDER BY a.secuencia DESC LIMIT 1;";
                    let campos = {accion: 100, sentencia: sentencia};  
                    this.servicio.consultasBD(campos).subscribe( respRuta =>
                    {
                      if (respRuta.length==0)
                      {
                        let mensajeCompleto: any = [];
                        mensajeCompleto.clase = "custom-class-red";
                        mensajeCompleto.mensaje = "El lote '" + cadena + "' NO se puede mover a esta operación porque no pertenece a la ruta de fabricación '" + resp[0].nruta + "'";
                        mensajeCompleto.tiempo = 4000;
                        this.servicio.mensajeToast.emit(mensajeCompleto);
                      }
                      else if (+respRuta[0].secuencia <= +resp[0].ruta_secuencia)
                      {
                        let mensajeCompleto: any = [];
                        mensajeCompleto.clase = "custom-class-red";
                        mensajeCompleto.mensaje = "El lote '" + cadena + "' NO se puede mover a esta operación ya que está en una secuencia superior";
                        mensajeCompleto.tiempo = 4000;
                        this.servicio.mensajeToast.emit(mensajeCompleto);
                      }
                      else
                      {
                        let sentencia = "SELECT a.id_detruta AS id, a.secuencia, b.nombre FROM sigma.ruta_congelada a LEFT JOIN sigma.det_rutas b ON a.id_detruta = b.id WHERE a.proceso = " + this.procesoSeleccionado.id + " AND a.ruta = " + resp[0].ruta + " AND a.secuencia > " + resp[0].ruta_secuencia + " ORDER BY a.secuencia LIMIT 1;";
                        let campos = {accion: 100, sentencia: sentencia};  
                        this.servicio.consultasBD(campos).subscribe( respRuta =>
                        {
                          let alarma= "N";
                          if (+respRuta[0].secuencia != +resp[0].secuencia_siguiente)
                          {
                            alarma = "S";
                          }
                          let cadNuevoLote = ";INSERT INTO sigma.lotes_historia (lote, parte, ruta, ruta_detalle, ruta_secuencia, proceso, fecha_entrada, ruta_detalle_anterior, ruta_secuencia_antes, proceso_anterior, alarma_so) VALUES (" + resp[0].id + ", " + resp[0].parte + ", " + resp[0].ruta + ", " + respRuta[0].id + ", " + respRuta[0].secuencia + ", " + this.procesoSeleccionado.id + ", NOW(), " + resp[0].ruta_detalle + ", " + resp[0].ruta_secuencia + ", " + resp[0].proceso + ", '" + alarma + "');";
                          
                          sentencia = "UPDATE sigma.lotes SET estado = 0, equipo = 0, alarma_tse = 'N', alarma_tpe = 'N', fecha = NOW(), ruta_secuencia = " + respRuta[0].secuencia + ", ruta_detalle = " + respRuta[0].id + ", proceso = " + this.procesoSeleccionado.id + ", hasta = NULL WHERE id = " + resp[0].id + ";UPDATE sigma.lotes_historia SET fecha_salida = NOW(), tiempo_proceso = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_proceso)), tiempo_total = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_entrada)) WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + cadNuevoLote;
                          let campos = {accion: 200, sentencia: sentencia};  
                          this.servicio.consultasBD(campos).subscribe( dato =>
                          {
                            let mensajeCompleto: any = [];
                            mensajeCompleto.mensaje = "El lote '" + cadena + "' se transfiere esta operación de acuerdo a su ruta de fabricación";
                            mensajeCompleto.clase = "custom-class";
                            if (+respRuta[0].secuencia != +resp[0].secuencia_siguiente)
                            {
                              //elvis2
                              mensajeCompleto.mensaje = "El lote '" + cadena + "' se transfiere esta operación con SALTO DE OPERACIÓN";
                              mensajeCompleto.clase = "custom-class-red";
                             }
                            mensajeCompleto.tiempo = 4000;
                            this.servicio.mensajeToast.emit(mensajeCompleto);
                            this.cadaSegundo();
                          })
                        })
                      }  
                      
                    })
                  }
                  else if (resp[0].estado == 50 && this.tipo_flujo=="C")
                  {
                    this.loteNumeroMover = cadena;
                    this.loteEstado = resp[0].estado;
                    this.rutaActual = resp[0].ruta;
                    this.ultimaRutaDetalle = resp[0].ruta_detalle
                    this.loteMover = resp[0].id;
                    this.parteMover = resp[0].parte;
                    this.procesoAnterior = resp[0].proceso;
                    this.ultimaSecuencia = resp[0].ruta_secuencia;
                    this.esperaDisparo = this.tiempo_entre_lecturas;
                    this.disparoSiguiente = 60;
                    this.verEspera = true;
                    
                    this.conLote = 1;
                    this.detLote.titulo = "CONFIRMAR LA OPERACIÓN DESTINO";
                    this.detLote.numero = resp[0].numero;
                    this.detLote.producto = resp[0].producto;
                    this.detLote.literal = "";
                    this.detLote.imagen = resp[0].imagen;
                    this.detLote.refproducto = resp[0].refproducto;
                    this.detLote.mostrarImagen = resp[0].mostrarImagen;
                    this.detLote.fecha = resp[0].fecha;
                    this.detLote.estadoLote = resp[0].estadoLote;
                    this.mensajeBase = "";
                    
                    this.detLote.subTitulo = "Lea el código de la operación";
                    this.detLote.tiempo = this.tiempo_entre_lecturas;
                  } 
                  else if (resp[0].estado == 0 || resp[0].estado == 20)
                  {
                    if (resp[0].proceso == this.procesoSeleccionado.id)
                    {
                      this.loteNumeroMover = cadena;
                      this.loteEstado = resp[0].estado;
                      this.loteMover = resp[0].id;
                      this.parteMover = resp[0].parte;
                      this.ultimaSecuencia = resp[0].ruta_secuencia;
                      this.esperaDisparo = this.tiempo_entre_lecturas;
                      this.disparoSiguiente = 40;
                      this.verEspera = true;
                      
                      this.conLote = 1;
                      this.detLote.titulo = "TRANSFERIR LOTE A PROCESO (EQUIPO)";
                      this.detLote.numero = resp[0].numero;
                      this.detLote.producto = resp[0].producto;
                      this.detLote.imagen = resp[0].imagen;
                      this.detLote.refproducto = resp[0].refproducto;
                      this.detLote.mostrarImagen = resp[0].mostrarImagen;
                      this.detLote.fecha = resp[0].fecha;
                      this.detLote.estadoLote = resp[0].estadoLote;
                      this.mensajeBase = "Por favor ingrese el código del Equipo/Máquina ";
                      
                      this.detLote.subTitulo = "Lea el código del Equipo";
                      this.detLote.tiempo = this.tiempo_entre_lecturas;
                    }
                    else
                    {
                      let mensajeCompleto: any = [];
                      mensajeCompleto.clase = "custom-class-red";
                      mensajeCompleto.mensaje = "El lote '" + cadena + "' NO ha iniciado su proceso en la operación '" + resp[0].rdnombre + "'";
                      mensajeCompleto.tiempo = 4000;
                      this.servicio.mensajeToast.emit(mensajeCompleto);
                    }
                  }                       
                }            
                else
                //Buscar crear un nuevo lote
                {
                  let sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.det_rutas WHERE proceso = " + this.procesoSeleccionado.id + " AND secuencia = 1;";
                  let campos = {accion: 100, sentencia: sentencia};  
                  this.servicio.consultasBD(campos).subscribe( resp =>
                  {
                    if (resp[0].cuenta > 0)
                    {
                      this.loteNumeroMover = cadena;
                      this.ultimaSecuencia = resp[0].secuencia;
                      this.esperaDisparo = this.tiempo_entre_lecturas;
                      this.disparoSiguiente = 30;
                      this.verEspera = true;
                      this.conLote = 2;
                      this.detLote.titulo = "ALTA DE LOTE DE PRODUCCIÓN"
                      this.detLote.numero = "";
                      this.detLote.producto = cadena;
                      this.detLote.literal = "Número de Orden de Producción (lote)";
                      this.detLote.imagen = "";
                      this.detLote.refproducto = "";
                      this.detLote.mostrarImagen = "";
                      this.detLote.fecha = "";
                      this.detLote.estadoLote = "";;
                      this.detLote.subTitulo = "Lea el código del Número de parte ";
                      this.detLote.tiempo = this.tiempo_entre_lecturas;
                    }
                    else
                    {
                      let mensajeCompleto: any = [];
                      mensajeCompleto.clase = "custom-class-red";
                      mensajeCompleto.mensaje = "El lote '" + cadena + "' NO está activo o no está registrado en el sistema";
                      mensajeCompleto.tiempo = 4000;
                      this.servicio.mensajeToast.emit(mensajeCompleto);                  
                    }
                  });          
                }     
              });
            }
          })    
        }     
      })
    }
    else if (this.disparoSiguiente == 10)
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      //Se espera un lote que exista en el proceso
      this.conLote = 0;
      let sentencia = "SELECT a.*, b.nombre FROM sigma.lotes a LEFT JOIN sigma.cat_procesos b ON a.proceso = b.id WHERE a.estatus = 'A' AND a.numero = '" + cadena + "';";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length == 0)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El lote '" + cadena + "' NO está activo o no está registrado en el sistema";
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].estado == 90)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El lote '" + cadena + "' está rechazado desde el día " + this.servicio.fecha(2, resp[0].rechazo, "dd/MM/yyyy HH:mm:ss");
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].estado == 80)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El lote '" + cadena + "' está en inspección desde el día " + this.servicio.fecha(2, resp[0].inspeccion, "dd/MM/yyyy HH:mm:ss");
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].proceso != this.procesoSeleccionado.id)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El lote '" + cadena + "' está en la operación '" + resp[0].nombre + "'";
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }    
        else
        {
          let adic = "";
          if (resp[0].estado == 20)
          {
            adic = "alarma_tse_paso = 'S', "
          }
          else if (resp[0].estado == 50)
          {
            adic = "alarma_tpe_paso = 'S', "
          }
          if (this.accionCalidad == 0)
          {
            sentencia = "UPDATE sigma.lotes SET estado = 80, " + adic + "inspecciones = inspecciones + 1, inspeccion_id = " + this.causaInspeccion + ", inspeccionado_por = " + this.inspector + ", inspeccion = NOW() WHERE id = " + resp[0].id + ";UPDATE sigma.lotes_historia SET inspecciones = inspecciones + 1 WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia
          }
          else
          {
            sentencia = "UPDATE sigma.lotes SET estado = 90, " + adic + "rechazos = rechazos + 1, rechazo_id = " + this.causaInspeccion + ", rechazado_por = " + this.inspector + ", rechazo = NOW() WHERE id = " + resp[0].id + ";UPDATE sigma.lotes_historia SET rechazos = rechazos + 1 WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + ";";
          }
          sentencia = sentencia + ";INSERT INTO sigma.calidad_historia (lote, secuencia, tipo, parte, inspeccion_id, inspeccionado_por, proceso, equipo, inicia) VALUES(" + resp[0].id + ", " + resp[0].ruta_secuencia + ", " + this.accionCalidad + ", " + resp[0].parte + ", " + this.causaInspeccion + ", " + this.inspector + ", " + resp[0].proceso + ", " + resp[0].equipo + ", NOW());";
          
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class";
            mensajeCompleto.mensaje = "El lote '" + cadena + "' se transfiere a la situación '" + this.situacionCalidad + "'";
            mensajeCompleto.tiempo = 4000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
            this.cadaSegundo();
          })
        }  
      })
    }
    else if (this.disparoSiguiente == 20)
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      this.conLote = 0;
      if (cadena.toUpperCase() == this.procesoSeleccionado.referencia.toUpperCase())
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "custom-class-red";
        mensajeCompleto.mensaje = "Operacion inválida: La operación destino debe ser diferente a la operación actual";
        mensajeCompleto.tiempo = 4000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        return;
      }
      //Se busca la siguiente secuencia de la ruta
      let sentencia = "SELECT id_detruta AS id, secuencia FROM sigma.ruta_congelada WHERE ruta = " + this.rutaActual + " AND secuencia > " + this.ultimaSecuencia + " ORDER BY secuencia LIMIT 1;";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        let sigSecuencia = resp[0].secuencia;

        sentencia = "SELECT a.id, a.nombre as n1, b.id_detruta AS id_det_ruta, b.ruta, c.nombre, b.secuencia FROM sigma.cat_procesos a LEFT JOIN sigma.ruta_congelada b ON a.id = b.proceso AND b.ruta = " + this.rutaActual + " LEFT JOIN sigma.det_rutas c ON b.id_detruta = c.id WHERE a.estatus = 'A' AND a.referencia = '" + cadena + "' AND b.secuencia > " + this.ultimaSecuencia + " ORDER BY b.secuencia LIMIT 1;";
        campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          if (resp.length == 0)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class-red";
            mensajeCompleto.mensaje = "La operación cuya referencia es '" + cadena + "' NO está activa o no está registrado en el sistema";
            mensajeCompleto.tiempo = 4000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          else if (!resp[0].id_det_ruta)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class-red";
            mensajeCompleto.mensaje = "El proceso '" + resp[0].n1 + "' NO está asociado a la ruta de fabricación de este número de parte";
            mensajeCompleto.tiempo = 6000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          else if (+this.ultimaSecuencia > +sigSecuencia)
          {
            //elvis
            return;
            const respuesta = this.dialogo.open(DialogoComponent, {
              width: "480px", data: { titulo: "Operación incongruente", mensaje: "Esta enviando al lote a una secuencia anterior, esto podría generar una alerta por SALTO DE OPERACIÓN. <br>¿Que desea hacer?", alto: "90", id: 0, accion: 0, botones: 2, boton1STR: "Continuar con la transferencia", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-project-management-problems" }
            });
            respuesta.afterClosed().subscribe(result => {
              if (result.accion == 1) 
              {
                let adcLoteH = "";
                if (resp[0].secuencia != this.ultimaSecuencia)
                {

                }
                let cadNuevoLote = ";INSERT INTO sigma.lotes_historia (lote, ruta, ruta_detalle, ruta_secuencia, proceso, fecha_entrada) VALUES (" + this.loteMover + ", " + resp[0].ruta + ", " + resp[0].id_det_ruta + ", " + resp[0].secuencia + ", " + resp[0].id + ", NOW());";
                let adicional = "en la situación 'En Espera'"
                sentencia = "UPDATE sigma.lotes SET estado = 0, alarma_tse = 'N', alarma_tpe = 'N', fecha = NOW(), ruta_secuencia = " + resp[0].secuencia + ", ruta_detalle = " + resp[0].id_det_ruta + ", proceso = " + resp[0].id + " WHERE id = " + this.loteMover + ";UPDATE sigma.lotes_historia SET fecha_salida = NOW(), tiempo_proceso = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_stock)), tiempo_total = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_entrada)) WHERE lote = " + this.loteMover + " AND proceso = " + this.procesoSeleccionado.id + cadNuevoLote;
                let campos = {accion: 200, sentencia: sentencia};  
                this.servicio.consultasBD(campos).subscribe( dato =>
                {
                  let mensajeCompleto: any = [];
                  mensajeCompleto.mensaje = "El lote '" + this.loteNumeroMover + "' se transfiere a la próxima operación '" + resp[0].nombre + "' " + adicional + " de acuerdo a su ruta de fabricación";
                  mensajeCompleto.clase = "custom-class";
                  if (resp[0].secuencia != this.ultimaSecuencia)
                  {
                    //elvis incongruencia
                    mensajeCompleto.mensaje = "El lote '" + this.loteNumeroMover + "' se transfiere a la operación '" + resp[0].nombre + "' " + adicional + " (SALTO DE OPERACIÓN)";
                    mensajeCompleto.clase = "custom-class-red";
                  }
                  mensajeCompleto.tiempo = 7000;
                  this.servicio.mensajeToast.emit(mensajeCompleto);
                  this.cadaSegundo();
                })
              }
              else
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "custom-class-red";
                mensajeCompleto.mensaje = "Se cancela la transferencia";
                mensajeCompleto.tiempo = 2500;
                this.servicio.mensajeToast.emit(mensajeCompleto);
              }
            })      
          }
          else 
          {
            let alarma= "N";
            if (+resp[0].secuencia != +sigSecuencia)
            {
              alarma = "S";
            }
            let cadNuevoLote = ";INSERT INTO sigma.lotes_historia (lote, parte, ruta, ruta_detalle, ruta_secuencia, proceso, fecha_entrada, ruta_detalle_anterior, ruta_secuencia_antes, proceso_anterior, alarma_so) VALUES (" + this.loteMover + ", " + this.parteMover + ", " + resp[0].ruta + ", " + resp[0].id_det_ruta + ", " + resp[0].secuencia + ", " + resp[0].id + ", NOW(), " + this.ultimaRutaDetalle + ", " + this.ultimaSecuencia + ", " + this.procesoSeleccionado.id + ", '" + alarma + "');";
            let adicional = "en la situación 'En Espera'"
            
            sentencia = "UPDATE sigma.lotes SET estado = 0, equipo = 0, alarma_tpe_paso = 'S', alarma_tse_paso = 'N', alarma_tse = 'N', fecha = NOW(), ruta_secuencia = " + resp[0].secuencia + ", ruta_detalle = " + resp[0].id_det_ruta + ", proceso = " + resp[0].id + ", hasta = NULL WHERE id = " + this.loteMover + ";UPDATE sigma.lotes_historia SET fecha_salida = NOW(), tiempo_proceso = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_proceso)), tiempo_total = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_entrada)) WHERE lote = " + this.loteMover + " AND ruta_secuencia = " + this.ultimaSecuencia + cadNuevoLote;
            let campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( dato =>
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.mensaje = "El lote '" + this.loteNumeroMover + "' se transfiere a la próxima operación '" + resp[0].nombre + "' " + adicional + " de acuerdo a su ruta de fabricación";
              mensajeCompleto.clase = "custom-class";
              if (+resp[0].secuencia != +sigSecuencia)
              {
                //elvis2
                mensajeCompleto.mensaje = "El lote '" + this.loteNumeroMover + "' se transfiere a la operación '" + resp[0].nombre + "' " + adicional + " (SALTO DE OPERACIÓN)";
                mensajeCompleto.clase = "custom-class-red";
               }
              mensajeCompleto.tiempo = 4000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              this.cadaSegundo();
            })
          }
        })
      })
      //Se espera un codigo de proceso
      
    }
    else if (this.disparoSiguiente == 30)
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      this.conLote = 0;
      //Se espera un codigo de proceso
      let sentencia = "SELECT a.id, a.nombre, a.ruta, b.secuencia, b.id AS iddet_ruta FROM sigma.cat_partes a INNER JOIN sigma.det_rutas b ON a.ruta = b.ruta AND b.proceso = " + this.procesoSeleccionado.id + " INNER JOIN sigma.cat_procesos c ON c.id = " + this.procesoSeleccionado.id + " WHERE a.estatus = 'A' AND a.referencia = '" + cadena + "' ORDER BY b.secuencia LIMIT 1;";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length == 0)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El número de parte '" + cadena + "' NO está activo, no está registrado en el sistema o no tiene una ruta de fabricación asociada";
          mensajeCompleto.tiempo = 6000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp.length > 1)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "Existen " + resp.length + " Números de parte con la referencia '" + cadena + "'. Por favor notifique este incidente al administrador del sistema";
          mensajeCompleto.tiempo = 5000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].secuencia != 1)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El lote no se creó. La producción debe iniciar en la primera secuencia de la ruta de fabricación asociada";
          mensajeCompleto.tiempo = 5000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else 
        {
          sentencia = "INSERT INTO sigma.lotes (numero, parte, fecha, proceso, ruta, ruta_detalle, ruta_secuencia, inicia, estado, creacion, creado) VALUES ('" + this.loteNumeroMover + "', " + resp[0].id + ", NOW(), " + this.procesoSeleccionado.id + ", " + resp[0].ruta + ", " + resp[0].iddet_ruta + ", " + resp[0].secuencia + ", NOW(), 0, NOW(), " + this.servicio.rUsuario().id + ")";
          let campos = {accion: 300, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( dato =>
          {
            if (dato.substring(0, 1) == "A")
            {
              let loteID = +dato.substring(1, 10);
              let adicional = "en la situación 'En Espera'"
              sentencia = "INSERT INTO sigma.ruta_congelada (lote, id_detruta, ruta, secuencia, proceso) SELECT " + loteID + ", id, ruta, secuencia, proceso FROM sigma.det_rutas WHERE estatus = 'A' AND ruta = " + resp[0].ruta + ";INSERT INTO sigma.lotes_historia (lote, parte, ruta, ruta_detalle, ruta_secuencia, proceso, fecha_entrada) VALUES (" + loteID + ", " + resp[0].id + ", " + resp[0].ruta + ", " + resp[0].iddet_ruta + ", " + resp[0].secuencia + ", " + this.procesoSeleccionado.id + ", NOW());";
              campos = {accion: 200, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( dato =>
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "custom-class";
                mensajeCompleto.mensaje = "Se crea el lote '" + this.loteNumeroMover + "' " + adicional + " para el número de parte '" + resp[0].nombre + "' de acuerdo a su ruta de fabricación";
                mensajeCompleto.tiempo = 5000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
                this.cadaSegundo();
                //actualizar pantallas
              })
            }  
          })
        }
      })
    }
    else if (this.disparoSiguiente == 40)
    //Se espera un equipo;
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      //Se espera un lote que exista en el proceso
      let sentencia = "SELECT a.id, a.nombre, a.proceso, a.capacidad, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 50 and proceso = a.proceso AND equipo = a.id) AS enproceso FROM sigma.det_procesos a WHERE a.estatus = 'A' AND a.referencia = '" + cadena + "';";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length == 0)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El Equipo/Máquina con referencia '" + cadena + "' NO está activo o no está registrado en el sistema";
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        if (resp.length > 1)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "Existen " + resp.length + " Equipos/Máquinas con la referencia '" + cadena + "'. Por favor notifique este incidente al administrador del sistema";
          mensajeCompleto.tiempo = 5000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].proceso != this.procesoSeleccionado.id)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El Equipo/Máquina '" + resp[0].nombre + "' NO pertenece a este proceso";
          mensajeCompleto.tiempo = 3000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (+resp[0].capacidad <= +resp[0].enproceso)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El Equipo/Máquina '" + resp[0].nombre + "' NO tiene capacidad para procesar el lote";
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else 
        {
          let adicional = "UPDATE sigma.lotes_historia SET equipo = " + resp[0].id + ", fecha_proceso = NOW(), tiempo_espera = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_entrada)) WHERE lote = " + this.loteMover + " AND ruta_secuencia = " + this.ultimaSecuencia + ";"
          let adicSituacion = "En Espera";
          if (this.loteEstado == 20)
          {
            adicional = "UPDATE sigma.lotes_historia SET equipo = " + resp[0].id + ", fecha_proceso = NOW(), tiempo_stock = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_stock)) WHERE lote = " + this.loteMover + " AND ruta_secuencia = " + this.ultimaSecuencia + ";"
            adicSituacion = "En Stock";
          }
          sentencia = "UPDATE sigma.lotes SET hasta = NULL, equipo = " + resp[0].id + ", alarma_tse_paso = 'S', alarma_tpe_paso = 'N', alarma_tpe = 'N', estado = 50, calcular_hasta = '2', alarma_tse = 'N', alarma_tpe = 'N', fecha = NOW() WHERE id = " + this.loteMover + ";" + adicional;
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( dato =>
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class";
            mensajeCompleto.mensaje = "El lote '" + this.loteNumeroMover + "' se ha transferido de la situación " + adicSituacion + "' a la situación 'En Proceso' en el Equipo/Máquina '" + resp[0].nombre + "'";
            mensajeCompleto.tiempo = 5000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
            this.cadaSegundo();
          })
        }      
      })
    }
    else if (this.disparoSiguiente == 50)
    //Se espera un equipo;
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      //Se espera un lote que exista en el proceso
      this.conLote = 0;
      let sentencia = "SELECT a.*, b.nombre FROM sigma.lotes a LEFT JOIN sigma.cat_procesos b ON a.proceso = b.id WHERE a.estatus = 'A' AND a.numero = '" + cadena + "';";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length == 0)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El lote '" + cadena + "' NO está activo o no está registrado en el sistema";
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].proceso != this.procesoSeleccionado.id)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El lote '" + cadena + "' está en la operación '" + resp[0].nombre + "'";
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].estado == 90)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El lote '" + cadena + "' no se puede reversar porque está rechazado desde el día " + this.servicio.fecha(2, resp[0].rechazo, "dd/MM/yyyy HH:mm:ss");
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].estado == 80)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El lote '" + cadena + "' no se puede reversar porque está en inspección desde el día " + this.servicio.fecha(2, resp[0].inspeccion, "dd/MM/yyyy HH:mm:ss");
          mensajeCompleto.tiempo = 4000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (+resp[0].estado > 0)
        {
          sentencia = "UPDATE sigma.lotes SET estado = 0, alarma_tse_paso = 'S', alarma_tpe_paso = 'S', hasta = NULL, fecha = DATE_ADD(NOW(), INTERVAL 60 SECOND), calcular_hasta = '3', reversos = reversos + 1, equipo = 0 WHERE id = " + resp[0].id + ";UPDATE sigma.lotes_historia SET fecha_entrada = NOW(), fecha_stock = NULL, fecha_proceso = NULL, fecha_salida = NULL, tiempo_total = 0, tiempo_espera = 0, tiempo_stock = 0, tiempo_proceso = 0, equipo = 0, reversado = 'S', reversos = reversos + 1 WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + ";";
          if (resp[0].estado==20)
          {
            sentencia = "UPDATE sigma.lotes SET estado = 0, alarma_tpe_paso = 'S', hasta = NULL, fecha = DATE_ADD(NOW(), INTERVAL 60 SECOND), calcular_hasta = '3', reversos = reversos + 1, equipo = 0 WHERE id = " + resp[0].id + ";UPDATE sigma.lotes_historia SET fecha_entrada = NOW(), fecha_stock = NULL, fecha_proceso = NULL, fecha_salida = NULL, tiempo_total = 0, tiempo_espera = 0, tiempo_stock = 0, tiempo_proceso = 0, equipo = 0, reversado = 'S', reversos = reversos + 1 WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + ";";
          }
          else if (resp[0].estado==50)
          {
            sentencia = "UPDATE sigma.lotes SET estado = 0, alarma_tpe_paso = 'S', hasta = NULL, fecha = DATE_ADD(NOW(), INTERVAL 60 SECOND), calcular_hasta = '3', reversos = reversos + 1, equipo = 0 WHERE id = " + resp[0].id + ";UPDATE sigma.lotes_historia SET fecha_entrada = NOW(), fecha_stock = NULL, fecha_proceso = NULL, fecha_salida = NULL, tiempo_total = 0, tiempo_espera = 0, tiempo_stock = 0, tiempo_proceso = 0, equipo = 0, reversado = 'S', reversos = reversos + 1 WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + ";";
          }
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class-red";
            mensajeCompleto.mensaje = "El lote '" + cadena + "' se regresa hasta la situación 'En Espera' tiene un minuto para transferir al lote a la operación anterior";
            mensajeCompleto.tiempo = 5000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          })
        } 
        else 
        {
          sentencia = "SELECT a.proceso_anterior, a.ruta_detalle_anterior, a.ruta_secuencia_antes, b.nombre FROM sigma.lotes_historia a LEFT JOIN sigma.det_rutas b ON a.ruta_detalle_anterior = b.id WHERE a.lote = " + resp[0].id + " AND a.ruta_secuencia = " + resp[0].ruta_secuencia + " ORDER BY a.ruta_secuencia LIMIT 1;";
          campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( respSec =>
          {
            if (respSec.length==0)
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "custom-class-red";
              mensajeCompleto.mensaje = "El lote '" + cadena + "' ya no puede moverse a una secuencia anterior";
              mensajeCompleto.tiempo = 3000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
            }
            else
            {
              let mensaje = "El lote '" + cadena + "' se regresa a la operación '" + respSec[0].nombre + "'. Tendrá un minuto para transferir el lote a una operación anterior";
              if (+respSec[0].proceso_anterior > 0)
              {
                sentencia = "UPDATE sigma.lotes SET estado = 0, hasta = NULL, fecha = DATE_ADD(NOW(), INTERVAL 60 SECOND), calcular_hasta = '3', reversos = reversos + 1, equipo = 0, proceso = " + respSec[0].proceso_anterior + ", ruta_detalle = " + respSec[0].ruta_detalle_anterior + ", ruta_secuencia = " + respSec[0].ruta_secuencia_antes + " WHERE id = " + resp[0].id + ";DELETE FROM sigma.lotes_historia WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + resp[0].ruta_secuencia + ";UPDATE sigma.lotes_historia SET fecha_entrada = NOW(), fecha_stock = NULL, fecha_proceso = NULL, fecha_salida = NULL, tiempo_total = 0, tiempo_espera = 0, tiempo_stock = 0, tiempo_proceso = 0, equipo = 0, reversado = 'S', reversos = reversos + 1 WHERE lote = " + resp[0].id + " AND ruta_secuencia = " + respSec[0].ruta_secuencia_antes + ";";
              }
              else
              {
                sentencia = "UPDATE sigma.lotes SET estatus = 'I' WHERE id = " + resp[0].id + ";DELETE FROM sigma.lotes_historia WHERE lote = " + resp[0].id + "";
                mensaje = "El lote '" + cadena + "' se inactivó y no estará disponible en el sistema";
              }
              campos = {accion: 200, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "custom-class-red";
                mensajeCompleto.mensaje = mensaje;
                mensajeCompleto.tiempo = 5000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
                this.cadaSegundo();
              })
            }  
          });
        }   
      })
    }
    else if (this.disparoSiguiente == 60)
    {
      this.disparoSiguiente = 0;
      this.esperaDisparo = 0;
      this.verEspera = false;
      this.conLote = 0;
      if (cadena.toUpperCase() != this.procesoSeleccionado.referencia.toUpperCase())
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "custom-class-red";
        mensajeCompleto.mensaje = "Operacion incorrecta";
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        return;
      }
      //Se busca la siguiente secuencia de la ruta
      let sentencia = "SELECT id_detruta AS id, secuencia FROM sigma.ruta_congelada WHERE ruta = '" + this.rutaActual + "' AND secuencia > " + this.ultimaSecuencia + " ORDER BY secuencia LIMIT 1;";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        let sigSecuencia = resp[0].secuencia;

        //sentencia = "SELECT a.id, a.nombre as n1, b.id AS id_det_ruta, b.ruta, b.nombre, b.secuencia FROM sigma.cat_procesos a LEFT JOIN sigma.det_rutas b ON a.id = b.proceso AND b.ruta = " + this.rutaActual + " WHERE a.estatus = 'A' AND a.referencia = '" + cadena + "' AND b.secuencia > " + this.ultimaSecuencia + " ORDER BY b.secuencia LIMIT 1;";
        sentencia = "SELECT a.id, a.nombre as n1, b.id_detruta AS id_det_ruta, b.ruta, c.nombre, b.secuencia FROM sigma.cat_procesos a LEFT JOIN sigma.ruta_congelada b ON a.id = b.proceso AND b.ruta = " + this.rutaActual + " LEFT JOIN sigma.det_rutas c ON b.id_detruta = c.id WHERE a.estatus = 'A' AND a.referencia = '" + cadena + "' AND b.secuencia > " + this.ultimaSecuencia + " ORDER BY b.secuencia LIMIT 1;";
        campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          if (resp.length == 0)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class-red";
            mensajeCompleto.mensaje = "La operación cuya referencia es '" + cadena + "' NO está activa o no está registrado en el sistema";
            mensajeCompleto.tiempo = 4000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          else if (!resp[0].id_det_ruta)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class-red";
            mensajeCompleto.mensaje = "El proceso '" + resp[0].n1 + "' NO está asociado a la ruta de fabricación de este número de parte";
            mensajeCompleto.tiempo = 6000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          
          else 
          {
            let alarma= "N";
            if (+resp[0].secuencia != +sigSecuencia)
            {
              alarma = "S";
            }
            let cadNuevoLote = ";INSERT INTO sigma.lotes_historia (lote, parte, ruta, ruta_detalle, ruta_secuencia, proceso, fecha_entrada, ruta_detalle_anterior, ruta_secuencia_antes, proceso_anterior, alarma_so) VALUES (" + this.loteMover + ", " + this.parteMover + ", " + resp[0].ruta + ", " + resp[0].id_det_ruta + ", " + resp[0].secuencia + ", " + resp[0].id + ", NOW(), " + this.ultimaRutaDetalle + ", " + this.ultimaSecuencia + ", " + this.procesoAnterior + ", '" + alarma + "');";
            let adicional = "en la situación 'En Espera'"
            
            sentencia = "UPDATE sigma.lotes SET estado = 0, equipo = 0, alarma_tpe_paso = 'S', fecha = NOW(), ruta_secuencia = " + resp[0].secuencia + ", ruta_detalle = " + resp[0].id_det_ruta + ", proceso = " + this.procesoSeleccionado.id + ", hasta = NULL WHERE id = " + this.loteMover + ";UPDATE sigma.lotes_historia SET fecha_salida = NOW(), tiempo_proceso = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_proceso)), tiempo_total = TIME_TO_SEC(TIMEDIFF(NOW(), fecha_entrada)) WHERE lote = " + this.loteMover + " AND ruta_secuencia = " + this.ultimaSecuencia + cadNuevoLote;
            let campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( dato =>
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.mensaje = "El lote '" + this.loteNumeroMover + "' se transfiere a la próxima operación '" + resp[0].nombre + "' " + adicional + " de acuerdo a su ruta de fabricación";
              mensajeCompleto.clase = "custom-class";
              if (+resp[0].secuencia != +sigSecuencia)
              {
                //elvis2
                mensajeCompleto.mensaje = "El lote '" + this.loteNumeroMover + "' se transfiere a la operación '" + resp[0].nombre + "' " + adicional + " (SALTO DE OPERACIÓN)";
                mensajeCompleto.clase = "custom-class-red";
               }
              mensajeCompleto.tiempo = 4000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              this.cadaSegundo();
            })
          }
        })
      })
      //Se espera un codigo de proceso
      
    }
  }


  revisarLotes()
  {
    //Se recorren los arreglos
    let sentencia = "SELECT id, imagen, referencia, nombre, capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM det_procesos WHERE proceso = a.id and estatus = 'A'), 0) AS capacidad_proceso, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 20 and proceso = a.id) AS enstock, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 50 and proceso = a.id) AS enproceso, 'S' AS mostrarImagen FROM sigma.cat_procesos a WHERE id = " +  this.procesoSeleccionado.id + ";";
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.procesoSeleccionado.nombre = resp[0].nombre;
      this.procesoSeleccionado.referencia = resp[0].referencia;
      this.procesoSeleccionado.capacidad_proceso = (+resp[0].enproceso > 0 ? resp[0].enproceso + " / ": "") + resp[0].capacidad_proceso;
      this.procesoSeleccionado.capacidad_stock =  (+resp[0].enstock > 0 ? resp[0].enstock + " / ": "") + resp[0].capacidad_stock;
      if (+resp[0].capacidad_proceso > 0)
      {
        this.procesoSeleccionado.capacidad_proceso_pct = Math.floor((+resp[0].enproceso / +resp[0].capacidad_proceso) * 100) + "%";
      }
      else
      {
        this.procesoSeleccionado.capacidad_proceso_pct = "0%";
      }
      if (+resp[0].capacidad_stock > 0)
      {
        this.procesoSeleccionado.capacidad_stock_pct = Math.floor((+resp[0].enstock / +resp[0].capacidad_stock) * 100) + "%";
      }
      {
        this.procesoSeleccionado.capacidad_stock_pct = "0%";
      }
      this.estatusProceso();      
    })
  }

  configuracion()
  {
    let sentencia = "SELECT * FROM sigma.configuracion";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp && resp.length > 0)
      {
        this.tiempo_entre_lecturas = +resp[0].tiempo_entre_lecturas; 
        this.tiempo_entre_lecturas = (this.tiempo_entre_lecturas==0 ? 10 : this.tiempo_entre_lecturas);
        this.lote_inspeccion_clave = resp[0].lote_inspeccion_clave;
        this.tipo_flujo = resp[0].tipo_flujo;
        this.tiempoAlerta = +resp[0].avisar_segundos;
      }
    }, 
    error => 
      {
        console.log(error)
      })
  }

  
}