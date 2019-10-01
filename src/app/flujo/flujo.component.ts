import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { ActivatedRoute, GuardsCheckStart } from '@angular/router';
import { trigger, style, animate, transition, query, group, state, stagger } from '@angular/animations';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DialogoComponent } from '../dialogo/dialogo.component';
import { MatDialog, MatSelect, MatInput } from '@angular/material';
import { ViewportRuler } from "@angular/cdk/overlay";
import { DatePipe } from '@angular/common'
import { CdkDrag, CdkDragStart, CdkDropList, CdkDropListGroup, CdkDragMove, CdkDragEnter, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-flujo',
  templateUrl: './flujo.component.html',
  styleUrls: ['./flujo.component.css'],
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

export class FlujoComponent implements AfterViewInit, OnInit {

  @ViewChild("txtBuscar", { static: false }) txtBuscar: ElementRef;
  @ViewChild("lstParte", { static: false }) lstParte: MatSelect;
  @ViewChild("lstParte2", { static: false }) lstParte2: MatSelect;
  @ViewChild("lstParte3", { static: false }) lstParte3: MatSelect;
  @ViewChild("lstParte4", { static: false }) lstParte4: MatSelect;
  @ViewChild("lstProceso", { static: false }) lstProceso: MatSelect;
  @ViewChild("txtFecha", { static: false }) txtFecha: ElementRef;
  @ViewChild("txtCarga", { static: false }) txtCarga: ElementRef;
  @ViewChild("txtDesde", { static: false }) txtDesde: ElementRef;
  @ViewChild("txtCantidad", { static: false }) txtCantidad: ElementRef;
  @ViewChild(CdkDropListGroup, { static: false }) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList, { static: false }) placeholder: CdkDropList;

  scrollingSubscription: Subscription;
  vistaCatalogo: Subscription;
  //URL_FOLDER = "http://localhost:8081/sigma/assets/datos/";  
  URL_FOLDER = "/sigma/assets/datos/";  
  
  constructor
  (
    private servicio: ServicioService,
    private route: ActivatedRoute,
    public scroll: ScrollDispatcher,
    private http: HttpClient,
    public dialogo: MatDialog, 
    private viewportRuler: ViewportRuler,
    public datepipe: DatePipe,
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
    this.servicio.teclaEscape.subscribe((accion: boolean)=>
    {
      this.cancelar();
    });
    this.vistaCatalogo = this.servicio.vista_3.subscribe((vista: number)=>
    {
      this.maestroActual = vista - 21;
      this.nivelActual = 0;
      if (this.maestroActual == 0) 
      {
        this.indices = [{ nombre: "Cargas", icono: "iconshock-materialblack-general-calendar"} ];
      }
      else if (this.maestroActual == 1) 
      {
        this.indices = [{ nombre: "Prioridades", icono: "iconshock-materialblack-general-bell"} ];
      }
      else if (this.maestroActual == 2) 
      {
        this.indices = [];
      }
      else if (this.maestroActual == 3) 
      {
        this.indices = [];
      }
      else if (this.maestroActual == 4) 
      {
        this.indices = [{ nombre: "General", icono: "iconshock-materialblack-general-bell"}, { nombre: "Procesos", icono: "iconshock-iphone-business-solution"}, { nombre: "Equipos", icono: "iconshock-materialblack-networking-lan-cable"}, { nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"}, { nombre: "Estado", icono: "iconshock-materialblack-communications-sign-in"}  ];
      }
      
      this.pantalla = 2;
      this.verRegistro = (this.verRegistro != 0 ? 1 : 0);  
      this.noAnimar = this.servicio.rHuboError();
      this.procesarPantalla(1);
    });
    this.scrollingSubscription = this.scroll
      .scrolled()
      .subscribe((data: CdkScrollable) => {
        this.miScroll(data);
    });
    this.colorear();
    this.maestroActual = this.servicio.rVista() - 21;
    this.nivelActual = 0
    if (this.maestroActual == 0) 
      {
        this.indices = [{ nombre: "Cargas", icono: "iconshock-materialblack-general-calendar"} ];
      }
      else if (this.maestroActual == 1) 
      {
        this.indices = [{ nombre: "Prioridades", icono: "iconshock-materialblack-general-bell"} ];
      }
      else if (this.maestroActual == 2) 
      {
        this.indices = [];
      }
      else if (this.maestroActual == 3) 
      {
        this.indices = [];
      }
      else if (this.maestroActual == 4) 
      {
        this.indices = [{ nombre: "General", icono: "iconshock-materialblack-general-bell"}, { nombre: "Procesos", icono: "iconshock-iphone-business-solution"}, { nombre: "Equipos", icono: "iconshock-materialblack-networking-lan-cable"}, { nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"}, { nombre: "Estado", icono: "iconshock-materialblack-communications-sign-in"}  ];
      }
    this.indices = [{ nombre: "Planes", icono: "iconshock-materialblack-general-calendar"} ];
    this.procesarPantalla(1);  
    this.validarTabla();
  }

  botonera: any = [false, true, true, true, true, true, false, true, true, true, true]
  ayuda01: string = "Descarga la lista actual en formato CSV";
  ayuda02: string = "Filtrar la lista actual"
  ayuda03: string = "Inicializa la plantilla actual";
  ayuda04: string = "Guarda el registro actual";
  ayuda05: string = "Cancela la edición actual";
  ayuda06: string = "Crear una copia del registro actual en uno nuevo";
  ayuda07: string = "Inactiva el registro actual";
  ayuda08: string = "Elimina el registro actual";
  ayuda09: string = "Salir de la edición";
  ayuda10: string = "Ir al primer registro";
  ayuda11: string = "Ir al registro anterior";
  ayuda12: string = "Ir al siguiente registro";
  ayuda13: string = "Ir al último registro";
  ayuda14: string = "Actualiza la lista de registros";
  ayuda15: string = "Ver sólo elementos con stock";
  ayuda16: string = "Ver todos los elementos";
  ayuda17: string = "Ver sólo cargas activas";
  ayuda18: string = "Ver todas las cargas";

  sentenciaR: string = "";

  titulos: any = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
  
  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropList;
  public sourceIndex: number;
  public dragIndex: number;
  public activeContainer;
  
  soloStock: boolean = true;
  soloActivas: boolean = true;
  seleccion: number = 0;

  resecuenciar: boolean = false;
  botonera1: boolean = true;
  botonera2: boolean = false;
  vision: number = 0;
  cubiertas: number = 0;
  saltos: number = 0;
  cadHistorico: string = "";
  actual: number = 0;
  vistaDetalle: number = 0;

  segStock: string = "0min";
  segProceso: string = "0min";
  segSetup: string = "0min";
  estatusActual: string = "";
  secuenciaActual: string = "";
  iconoGeneral = "iconshock-iphone-business-product-combo";
  titulo_fecha: string = "";
  titulo_lote: string = "";
  cancelarEdicion: boolean = false;

  //URL_BASE = "http://localhost:8081/sigma/api/upload.php";
  //URL_IMAGENES = "http://localhost:8081/sigma/assets/imagenes/";

  URL_BASE = "/sigma/api/upload.php"
  URL_IMAGENES = "/sigma/assets/imagenes/";

  estadoArriba: string = "desaparecer";
  mensajeImagen: string = "Campo opcional";

  faltaMensaje: string = "";
  despuesBusqueda: number = 0;
  mostrarImagenRegistro: string = "N";
  verIrArriba: boolean = false;
  verBarra: string = "auto";
  nombreRuta: string = "";
  offSet: number;
  registroActual: number = 0;
  copiandoDesde: number = 0;
  idNivel0: number = 0;
  idNivel1: number = 0;
  idNivel2: number = 0;
  nivelActual: number = 0;
  textoBuscar: string = "";
  detalleRegistro: any = [];
  verBuscar: boolean = false;
  noAnimar: boolean = false;  
  verImagen: boolean = false;
  editando: boolean = false;
  verRegistro: number = 0;
  tiempoRevision: number = 5000;
  historicos = [];
  
  nuevoRegistro: string = ";"
  maestroActual: number = 0;
  altoPantalla: number = this.servicio.rPantalla().alto - 105;
  anchoPantalla: number = this.servicio.rPantalla().ancho - 10;
  errorTitulo: string = "Ocurrió un error durante la conexión al servidor";
  errorMensaje: string = "";
  pantalla: number = 2;

  literalSingular: string = "";
  literalSingularArticulo: string = "";
  literalPlural: string = "";
  
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
  actualizarMaestro: boolean = false;
  
  edicion: boolean = true;
  registros: any = [];
  secuencias: any = [];
  arrFiltrado: any = [];
  partes: any = [];
  cargas: any = [];
  procesos: any = [];
  cabProcesos: any = [];
  listas: any = [];
  indices: any = [{ nombre: "Procesos", icono: "iconshock-iphone-business-solution"} ]
  cronometro: any;
  

  ngAfterViewInit() {
  }

  ngOnInit()
  {

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
 }

  irArriba() 
  {
    this.verIrArriba = false;
    document.querySelector('[cdkScrollable]').scrollTop = 0;    
  }

  miScroll(data: CdkScrollable) 
  {
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

  ascendenteID(a, b)
  {
    let comparison = 0;
    if (+a.id > +b.id) {
      comparison = 1;
    } else if (+a.id < +b.id) {
      comparison = -1;
    }
    return comparison;
  }

  llenarRegistros()
  {
    let mensajeNoHay = "";
    this.servicio.activarSpinner.emit(true);       
    let sentencia =   "SELECT a.id, a.completada, a.fecha, a.reprogramaciones, SEC_TO_TIME(TIME_TO_SEC(TIMEDIFF(a.fecha, a.fecha_anterior))) AS sumado, CONCAT('Carga # ', a.carga) AS nombre, IFNULL((SELECT COUNT(DISTINCT(parte)) FROM sigma.programacion WHERE carga = a.id AND estatus = 'A'), 0) AS partes, IFNULL((SELECT SUM(cantidad) FROM sigma.programacion WHERE carga = a.id AND estatus = 'A'), 0) AS piezas, IFNULL((SELECT COUNT(*) FROM sigma.lotes WHERE carga = a.id), 0) AS avance, IFNULL((SELECT COUNT(*) FROM sigma.lotes WHERE carga = a.id AND equipo > 0), 0) AS avancec, IF((SELECT piezas) = 0, 0, FLOOR((SELECT avance) / (SELECT piezas) * 100)) as pct, IF((SELECT piezas) = 0, 0, FLOOR((SELECT avancec) / (SELECT piezas) * 100)) as pctc, d.capacidad, IFNULL(d.nombre, 'N/A') AS equipo, IFNULL(a.modificacion, 'N/A') AS fcambio, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.cargas a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id LEFT JOIN sigma.det_procesos d ON a.equipo = d.id " + (this.soloActivas ? "WHERE a.completada <> 'Y'" : "") + " ORDER BY a.completada DESC, a.fecha, a.carga";
    this.sentenciaR =   "SELECT 'Reporte de cargas (programación)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Carga', 'Estado', 'Notas', 'Fecha promesa', 'Fecha anterior a la ultima reprogramacion', 'Total reprogramaciones', 'Fecha promesa original', 'Numeros de partes', 'Lotes', 'Lotes en la operacion', 'PCT de completado', 'Equipo', 'Lotes cargados en equipo', 'PCT de ejecucion', 'Estatus', 'Numero de parte (referencia)', 'Numero de parte (descripcion)', 'Lotes programados', 'Lotes en la operacion', 'Lotes cargados al equipo'  UNION ALL SELECT a.id, a.carga, CASE WHEN a.completada = 'Y' THEN 'Ejecutada' WHEN a.completada = 'U' THEN 'Equipando' WHEN a.completada = 'S' THEN 'Completa' WHEN a.completada = 'N' THEN 'En curso' END, a.notas, a.fecha, a.fecha_anterior, a.reprogramaciones, a.fecha_original, IFNULL((SELECT COUNT(DISTINCT(parte)) FROM sigma.programacion WHERE carga = a.id AND estatus = 'A'), 0), IFNULL((SELECT SUM(cantidad) FROM sigma.programacion WHERE carga = a.id AND estatus = 'A' ), 0) AS piezas, IFNULL((SELECT COUNT(*) FROM sigma.lotes WHERE carga = a.id), 0) AS avance, IF((SELECT piezas) = 0, 0, FLOOR((SELECT avance) / (SELECT piezas) * 100)), IFNULL(d.nombre, 'N/A'), IFNULL((SELECT COUNT(*) FROM sigma.lotes WHERE carga = a.id AND equipo > 0), 0) AS avancec, IF((SELECT piezas) = 0, 0, FLOOR((SELECT avancec) / (SELECT piezas) * 100)), IF(a.estatus = 'A', 'activo', 'inactivo'), b.referencia, IFNULL(b.nombre, 'N/A'), c.cantidad, IFNULL((SELECT COUNT(*) FROM sigma.lotes WHERE carga = a.id AND parte = b.id), 0), IFNULL((SELECT COUNT(*) FROM sigma.lotes WHERE carga = a.id AND parte = b.id AND equipo > 0), 0) FROM sigma.cargas a LEFT JOIN sigma.programacion c ON a.id = c.carga LEFT JOIN sigma.cat_partes b ON c.parte = b.id LEFT JOIN sigma.det_procesos d ON a.equipo = d.id" + (this.soloActivas ? " WHERE a.completada <> 'Y'" : "");
    if (this.maestroActual == 0 && this.nivelActual==0)
    {
      mensajeNoHay = "No se hallaron cargas en el sistema";
      this.titulo_fecha = "Fecha promesa";
      this.iconoGeneral = "iconshock-materialblack-general-calendar";
      this.nuevoRegistro = "Agregar una carga";
      this.literalSingular = "carga";
      this.literalPlural = "cargas";
      this.literalSingularArticulo = "La carga";
    }
    else if (this.maestroActual == 0 && this.nivelActual==1)
    {
      sentencia = "SELECT a.id, a.cantidad, IFNULL((SELECT COUNT(*) FROM sigma.lotes WHERE parte = a.parte AND carga = a.carga), 0) AS avance, IF(a.cantidad = 0, 0, FLOOR((SELECT avance) / a.cantidad * 100)) as pct, IFNULL(d.nombre, 'N/A') as nombre, d.referencia, IFNULL(a.modificacion, 'N/A') AS fcambio, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(c.nombre, 'N/A') AS ucambio, d.imagen, 'S' AS mostrarImagen FROM sigma.programacion a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id LEFT JOIN sigma.cat_partes d ON a.parte = d.id WHERE a.carga = " + this.idNivel0 + " ORDER BY d.nombre";
      this.sentenciaR =   "SELECT 'Reporte de cargas (programación)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Carga', 'Notas', 'Fecha promesa', 'Fecha anterior a la ultima reprogramacion', 'Total reprogramaciones', 'Fecha promesa original', 'Numeros de partes', 'Lotes', 'Lotes avance', 'PCT de avance', 'Equipo', 'Estatus', 'Numero de parte (referencia)', 'Numero de parte (descripcion)', 'Lotes programados'  UNION ALL SELECT a.id, a.carga, a.notas, a.fecha, a.fecha_anterior, a.reprogramaciones, a.fecha_original, IFNULL((SELECT COUNT(DISTINCT(parte)) FROM sigma.programacion WHERE carga = a.id AND estatus = 'A'), 0), IFNULL((SELECT SUM(cantidad) FROM sigma.programacion WHERE carga = a.id AND estatus = 'A'), 0) AS piezas, IFNULL((SELECT COUNT(*) FROM sigma.lotes WHERE carga = a.id), 0) AS avance, IF((SELECT piezas) = 0, 0, FLOOR((SELECT avance) / (SELECT piezas) * 100)), IFNULL(d.nombre, 'N/A'), IF(a.estatus = 'A', 'activo', 'inactivo'), b.referencia, IFNULL(b.nombre, 'N/A'), c.cantidad FROM sigma.cargas a LEFT JOIN sigma.programacion c ON a.id = c.carga LEFT JOIN sigma.cat_partes b ON c.parte = b.id LEFT JOIN sigma.det_procesos d ON a.equipo = d.id";
      mensajeNoHay="No se hallaron Números de parte para la Carga seleccionada";
      this.iconoGeneral = "iconshock-iphone-business-product-combo";
      this.nuevoRegistro = "Agregar un Número de parte";
      this.literalSingular = "Número de parte";
      this.literalPlural = "Números de parte";
      this.literalSingularArticulo = "El Número de parte";
    }
    if (this.maestroActual == 1) 
    {
      mensajeNoHay="No se hallaron prioridades en el sistema";
      sentencia = "SELECT a.id, a.fecha, d.nombre, IFNULL(e.nombre, 'N/A') as nproceso, a.orden, d.referencia, IFNULL(a.modificacion, 'N/A') AS fcambio, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(c.nombre, 'N/A') AS ucambio, d.imagen, 'S' AS mostrarImagen FROM sigma.prioridades a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id LEFT JOIN sigma.cat_partes d ON a.parte = d.id LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id ORDER BY a.orden, a.fecha, d.nombre";
      this.sentenciaR =   "SELECT 'Reporte de prioridades', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Numero de parte (referencia)', 'Numero de parte (descripcion)', 'Prioridad', 'Fecha de vencimiento', 'Proceso', 'Lotes con la prioridad', 'Notas', 'Estatus' UNION ALL SELECT a.id, d.referencia, IFNULL(d.nombre, 'N/A'), a.orden, a.fecha, IFNULL(e.nombre, 'N/A'), (SELECT COUNT(*) FROM sigma.lotes WHERE estado <= 50 AND estatus = 'A' AND estado <= 50 AND proceso = a.proceso AND estatus = 'A'), a.notas, IF(a.estatus = 'A', 'activo', 'inactivo') FROM sigma.prioridades a LEFT JOIN sigma.cat_partes d ON a.parte = d.id LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id";
      
      this.titulo_fecha = "Fecha de vencimiento";
      this.iconoGeneral = "iconshock-materialblack-general-bell";
      this.nuevoRegistro = "Agregar una prioridad";
      this.literalSingular = "prioridad";
      this.literalPlural = "prioridades";
      this.literalSingularArticulo = "La prioridad";
    }
    if (this.maestroActual == 2) 
    {
      this.titulo_lote = "Causa de la inspección";
      mensajeNoHay="No se hallaron lotes en inspección";
      sentencia = "SELECT a.id, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte  AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, CONCAT('LOTE/OP: ', a.numero) AS nombre, a.numero AS elote, a.inspeccion as fecha, IFNULL(c.nombre, 'N/A') AS causa, IFNULL(e.nombre, 'N/A') AS nproceso, IFNULL(c.referencia, 'N/A') AS causaref, d.imagen, 'S' AS mostrarImagen, IFNULL(d.referencia, 'N/A') AS referencia, IFNULL(d.nombre, 'N/A') AS producto, IFNULL(b.nombre, 'N/A') AS ucambio, a.proceso, a.ruta_secuencia FROM sigma.lotes a LEFT JOIN sigma.cat_usuarios b ON a.inspeccionado_por = b.id LEFT JOIN sigma.cat_situaciones c ON a.inspeccion_id = c.id LEFT JOIN sigma.cat_partes d ON a.parte = d.id LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id WHERE a.estado = 80 ORDER BY 2, a.fecha, a.numero";
      this.sentenciaR =   "SELECT 'Reporte de lotes en inspeccion', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Lote', 'Numero de parte (referencia)', 'Numero de parte (descripcion)', 'Prioridad', 'Fecha de inspeccion', 'Referencia inspeccion', 'Causa de la inspeccion', 'Inspeccionado por', 'Proceso', 'Secuencia en la ruta' UNION ALL SELECT a.numero, d.referencia, IFNULL(d.nombre, 'N/A'), IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte  AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 'N/A'), a.inspeccion, IFNULL(c.referencia, 'N/A'), IFNULL(c.nombre, 'N/A'), IFNULL(b.nombre, 'N/A'), IFNULL(e.nombre, 'N/A'), a.ruta_secuencia FROM sigma.lotes a LEFT JOIN sigma.cat_usuarios b ON a.inspeccionado_por = b.id LEFT JOIN sigma.cat_situaciones c ON a.inspeccion_id = c.id LEFT JOIN sigma.cat_partes d ON a.parte = d.id LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id WHERE a.estado = 80";
      this.titulo_fecha = "Entrada a inspección";
      this.iconoGeneral = "iconshock-materialblack-general-preview2";
      this.nuevoRegistro = "";
      this.literalSingular = "lote en inspección";
      this.literalPlural = "lotes en en inspección";
      this.literalSingularArticulo = "El lote en inspección";
      
    }

    if (this.maestroActual == 3) 
    {
      this.titulo_lote = "Causa del rechazo";
      mensajeNoHay="No se hallaron lotes rechazados";
      sentencia = "SELECT a.id, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte  AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, CONCAT('LOTE/OP: ', a.numero) AS nombre, a.numero AS elote, a.rechazo as fecha, IFNULL(c.nombre, 'N/A') AS causa, IFNULL(e.nombre, 'N/A') AS nproceso, IFNULL(c.referencia, 'N/A') AS causaref, d.imagen, 'S' AS mostrarImagen, IFNULL(d.referencia, 'N/A') AS referencia, IFNULL(d.nombre, 'N/A') AS producto, IFNULL(b.nombre, 'N/A') AS ucambio, a.proceso, a.ruta_secuencia FROM sigma.lotes a LEFT JOIN sigma.cat_usuarios b ON a.rechazado_por = b.id LEFT JOIN sigma.cat_situaciones c ON a.rechazo_id = c.id LEFT JOIN sigma.cat_partes d ON a.parte = d.id LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id WHERE a.estado = 90 ORDER BY 2, a.fecha, a.numero";
      this.sentenciaR =   "SELECT 'Reporte de lotes rechazados', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Lote', 'Numero de parte (referencia)', 'Numero de parte (descripcion)', 'Prioridad', 'Fecha de rechazo', 'Referencia rechazo', 'Causa del rechazo', 'Rechazado por', 'Proceso''Secuencia en la ruta'  UNION ALL SELECT a.numero, d.referencia, IFNULL(d.nombre, 'N/A'), IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte  AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 'N/A'), a.rechazo, IFNULL(c.referencia, 'N/A'), IFNULL(c.nombre, 'N/A'), IFNULL(b.nombre, 'N/A'), IFNULL(e.nombre, 'N/A'), a.ruta_secuencia FROM sigma.lotes a LEFT JOIN sigma.cat_usuarios b ON a.rechazado_por = b.id LEFT JOIN sigma.cat_situaciones c ON a.rechazo_id = c.id LEFT JOIN sigma.cat_partes d ON a.parte = d.id LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id WHERE a.estado = 90";
      this.titulo_fecha = "Fecha de rechazo";
      this.iconoGeneral = "iconshock-materialblack-general-cancel";
      this.nuevoRegistro = "";
      this.literalSingular = "lote rechazado";
      this.literalPlural = "lotes rechazados";
      this.literalSingularArticulo = "El lote rechazado";      
    }
    if (this.maestroActual == 4 && (this.vision==0 || this.vistaDetalle==1)) 
    {
      mensajeNoHay="No se hallaron lotes";
      let adicional = " a.estado <> 99 AND a.estatus = 'A'";
      if (this.vistaDetalle==1)
      {
        if (this.vision==1)
        {
          adicional = " a.estado <> 99 AND a.proceso = " + this.idNivel1;
        }
        else if (this.vision==2)
        {
          adicional = " a.estado <> 99 AND (a.equipo = " + this.idNivel1 + " AND a.estado = 50)";
        }
        else if (this.vision==3)
        {
          adicional = " a.estado <> 99 AND a.parte = " + this.idNivel1;
        }
        else if (this.vision==4)
        {
          adicional = " a.estado = " + this.idNivel1;
        }
      }
      sentencia = "SELECT a.inicia, a.carga, IFNULL(f.carga, 'N/A') AS ncarga, a.finaliza, a.estimada, 'activo' as estatus, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte  AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 100) AS prioridad, a.id, a.numero, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' WHEN a.estado = 80 THEN 'En Inspección' WHEN a.estado = 90 THEN 'Rechazado' WHEN a.estado = 99 THEN 'Finalizado' END as estado, a.ruta_secuencia, a.fecha, IFNULL(a.hasta, 'N/A') AS hasta, IFNULL(e.nombre, 'N/A') AS nproceso, d.imagen, 'S' AS mostrarImagen, IFNULL(d.referencia, 'N/A') AS referencia, IFNULL(d.nombre, 'N/A') AS producto FROM sigma.lotes a LEFT JOIN sigma.cat_partes d ON a.parte = d.id LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id LEFT JOIN sigma.cargas f ON a.carga = f.id WHERE " + adicional + " ORDER BY a.inspecciones DESC, 5, a.fecha, a.numero;";
      this.sentenciaR = "SELECT 'Inventario actual en WIP (lotes)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Numero del lote (O/P)', 'Numero de parte (referencia)', 'Numero de parte (Descripcion)', 'Fecha de creacion del lote', 'Fecha de termino', 'Fecha estimada de termino', 'Prioridad', 'Proceso', 'Equipo/Maquina', 'Secuencia', 'Estado', 'Total inspecciones', 'Ultima Inspeccion: Causa', 'Ultima Inspeccion: Fecha', 'Ultima Inspeccion: Usuario', 'Total rechazos', 'Ultimo Rechazo: Causa', 'Ultimo Rechazo: Fecha', 'Ultimo Rechazo: Usuario', 'Numero de carga', 'Alarmas generadas', 'Alarmado por tiempo excedido de stock', 'Alarmado por tiempo excedido de proceso' UNION ALL SELECT a.id, a.numero, IFNULL(d.referencia, 'N/A'), IFNULL(d.nombre, 'N/A'), a.inicia, a.finaliza, a.estimada, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), ' N/A') AS prioridad, IFNULL(e.nombre, 'N/A'), IFNULL(b.nombre, 'N/A'), a.ruta_secuencia, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' WHEN a.estado = 80 THEN 'En Inspeccion' WHEN a.estado = 90 THEN 'Rechazado' WHEN a.estado = 99 THEN 'Finalizado' END as estado, a.inspecciones, IFNULL(f.nombre, 'N/A'), a.inspeccion, IFNULL(h.nombre, 'N/A'), a.rechazos, IFNULL(g.nombre, 'N/A'), a.rechazo, IFNULL(i.nombre, 'N/A'), j.carga, a.alarmas, IF(a.alarma_tse = 'S', 'SI', 'NO'), IF(a.alarma_tpe = 'S', 'SI', 'NO') FROM sigma.lotes a LEFT JOIN sigma.det_procesos b ON a.equipo = b.id LEFT JOIN sigma.det_rutas c ON a.ruta_detalle = c.id LEFT JOIN sigma.cat_partes d ON a.parte = d.id LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id LEFT JOIN sigma.cat_situaciones f ON a.inspeccion_id = f.id LEFT JOIN sigma.cat_situaciones g ON a.rechazo_id = g.id LEFT JOIN sigma.cat_usuarios h ON a.inspeccionado_por = h.id LEFT JOIN sigma.cat_usuarios i ON a.rechazado_por = i.id LEFT JOIN sigma.cargas j ON a.carga = j.id WHERE " + adicional + " ";
      this.titulo_fecha = "Fecha de rechazo";
      this.iconoGeneral = "iconshock-iphone-business-product-combo";
      this.nuevoRegistro = "";
      this.literalSingular = "lote";
      this.literalPlural = "lotes";
      this.literalSingularArticulo = "El lote";            
    }
    else if (this.maestroActual == 4 && this.vision > 0 && this.vistaDetalle==0)
    {
      mensajeNoHay="No se hallaron lotes";
      sentencia = "SELECT a.id, a.nombre, a.referencia, a.capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM det_procesos WHERE proceso = a.id AND estatus = 'A'), 0) AS cap_proceso, a.imagen, 'S' AS mostrarImagen, (SELECT COUNT(*) FROM sigma.lotes WHERE estado <= 50 AND estatus = 'A' AND estado <= 50 AND proceso = a.id) AS totall, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 0 AND estatus = 'A' AND proceso = a.id) AS espera, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 20 AND estatus = 'A' AND proceso = a.id) AS stock, IF(a.capacidad_stock = 0, 0, FLOOR((SELECT stock) / a.capacidad_stock * 100)) AS pctstock, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 50 AND estatus = 'A' AND proceso = a.id) AS proceso, IF((SELECT cap_proceso) = 0, 0, FLOOR((SELECT proceso) / (SELECT cap_proceso) * 100)) AS pctproceso, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 80 AND estatus = 'A' AND proceso = a.id) AS calidad FROM sigma.cat_procesos a " + (this.soloStock ? "HAVING totall > 0" : "") + " ORDER BY a.nombre";//7 DESC" ;
      this.sentenciaR = "SELECT 'Inventario actual en WIP (por operacion/proceso)', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Proceso', 'Referencia', 'Capacidad de stock', 'Capacidad de proceso', 'Total lotes', 'Lotes en espera', 'Lotes en stock', 'PCT uso de Stock', 'Lotes en proceso', 'PCT uso de procesamiento', 'Lotes en calidad' UNION ALL SELECT a.id, a.nombre, a.referencia, a.capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM det_procesos WHERE proceso = a.id AND estatus = 'A'), 0) AS cap_proceso, (SELECT COUNT(*) FROM sigma.lotes WHERE estado <= 50 AND estatus = 'A' AND proceso = a.id) AS totall, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 0 AND estatus = 'A' AND proceso = a.id), (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 20 AND estatus = 'A' AND proceso = a.id) AS stock, IF(a.capacidad_stock = 0, 0, FLOOR((SELECT stock) / a.capacidad_stock * 100)), (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 50 AND estatus = 'A' AND proceso = a.id) AS proceso, IF((SELECT cap_proceso) = 0, 0, FLOOR((SELECT proceso) / (SELECT cap_proceso) * 100)), (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 80 AND estatus = 'A' AND proceso = a.id) FROM sigma.cat_procesos a " + (this.soloStock ? "HAVING totall > 0" : "") + " ";
      if (this.vision==1)
      {
        this.literalSingular = "proceso";
        this.literalPlural = "procesos";
        this.literalSingularArticulo = "El proceso";  
        this.iconoGeneral = "iconshock-iphone-business-solution";    
      }
      else if (this.vision==2)
      {
        sentencia = "SELECT a.id, a.nombre, a.capacidad, a.proceso, IFNULL(b.nombre, 'N/A') AS nproceso, 'S' as mostrarImagen, a.referencia, (SELECT COUNT(*) FROM sigma.lotes WHERE estatus = 'A' AND estado = 50 AND equipo = a.id) AS totall, IF(a.capacidad = 0, 0, FLOOR((SELECT totall) / a.capacidad * 100)) AS pctproceso FROM sigma.det_procesos a LEFT JOIN sigma.cat_procesos b ON a.proceso = b.id " + (this.soloStock ? "HAVING totall > 0" : "") + " ORDER BY a.nombre";//6 DESC;";
        this.sentenciaR = "SELECT 'Inventario actual en WIP (por equipo en proceso)', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Equipo', 'Proceso asociado (ID)', 'Proceso asociado (Descripcion)', 'Referencia', 'Capacidad del equipo', 'Lotes en proceso', 'PCT de uso'  UNION ALL SELECT a.id, a.nombre, a.proceso, IFNULL(b.nombre, 'N/A'), a.referencia, a.capacidad, (SELECT COUNT(*) FROM sigma.lotes WHERE estatus = 'A' AND estado = 50 AND equipo = a.id) AS totall, IF(a.capacidad = 0, 0, FLOOR((SELECT totall) / a.capacidad * 100)) FROM sigma.det_procesos a LEFT JOIN sigma.cat_procesos b ON a.proceso = b.id " + (this.soloStock ? "HAVING totall > 0" : "") + " ";
        this.iconoGeneral = "iconshock-materialblack-networking-lan-cable";
        this.literalSingular = "equipo";
        this.literalPlural = "equipos";
        this.literalSingularArticulo = "El equipo";      
      }
      else if (this.vision==3)
      {
        sentencia = "SELECT a.id, a.nombre, a.referencia, a.imagen, 'S' AS mostrarImagen, (SELECT COUNT(*) FROM sigma.lotes WHERE estado <= 50 AND estatus = 'A' AND parte = a.id) AS totall, (SELECT COUNT(*) FROM sigma.lotes WHERE carga <> 0 AND estado <= 50 AND estatus = 'A' AND parte = a.id) AS asignados, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 0 AND estatus = 'A' AND parte = a.id) AS espera, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 20 AND estatus = 'A' AND parte = a.id) AS stock, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 50 AND estatus = 'A' AND parte = a.id) AS proceso, (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 80 AND estatus = 'A' AND parte = a.id) AS calidad FROM sigma.cat_partes a " + (this.soloStock ? "HAVING totall > 0" : "") + " ORDER BY a.nombre";//6 DESC;";
        this.sentenciaR = "SELECT 'Inventario actual en WIP (por numero de parte)', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Numero de parte', 'Referencia', 'Total lotes', 'Lotes asignados en cargas (programados)', 'Lotes en espera', 'Lotes en stock', 'Lotes en proceso', 'Lotes en calidad' UNION ALL SELECT a.id, a.nombre, a.referencia, (SELECT COUNT(*) FROM sigma.lotes WHERE estado <= 50 AND estatus = 'A' AND parte = a.id) AS totall, (SELECT COUNT(*) FROM sigma.lotes WHERE carga <> 0 AND estado <= 50 AND estatus = 'A' AND parte = a.id), (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 0 AND estatus = 'A' AND parte = a.id), (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 20 AND estatus = 'A' AND parte = a.id), (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 50 AND estatus = 'A' AND parte = a.id), (SELECT COUNT(*) FROM sigma.lotes WHERE estado = 80 AND estatus = 'A' AND parte = a.id) FROM sigma.cat_partes a " + (this.soloStock ? "HAVING totall > 0" : "") + " ";
        this.iconoGeneral = "iconshock-iphone-business-product-combo";
        this.literalSingular = "número de parte";
        this.literalPlural = "números de parte";
        this.literalSingularArticulo = "El número de parte";      
      }
      else if (this.vision==4)
      {
        sentencia = "SELECT a.estado as id, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' WHEN a.estado = 80 THEN 'En Inspección' WHEN a.estado = 90 THEN 'Rechazado' WHEN a.estado = 99 THEN 'Finalizado' END as nombre, COUNT(*) as totall, 'S' AS mostrarImagen FROM sigma.lotes a GROUP BY a.estado, 2 " + (this.soloStock ? "HAVING totall > 0" : "") + " ORDER BY 1;";
        this.sentenciaR = "SELECT 'Inventario actual en WIP (por estado de lote)', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '' UNION ALL SELECT 'id', 'Estado', 'Lotes' UNION ALL SELECT a.estado as id, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' WHEN a.estado = 80 THEN 'En Inspección' WHEN a.estado = 90 THEN 'Rechazado' WHEN a.estado = 99 THEN 'Finalizado' END as nombre, COUNT(*) AS totall FROM sigma.lotes a GROUP BY a.estado, 2 " + (this.soloStock ? "HAVING totall > 0" : "") + " ";
        this.iconoGeneral = "iconshock-materialblack-communications-sign-in";
        this.literalSingular = "estado de lote";
        this.literalPlural = "estados de lote";
        this.literalSingularArticulo = "El estado de lote";      
      }
    }    
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.registros = resp;
      this.arrFiltrado = resp;
      this.contarRegs();
      if (resp.length == 0)
      {
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "custom-class";
        mensajeCompleto.mensaje = mensajeNoHay;
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      }
      setTimeout(() => {
        this.servicio.activarSpinner.emit(false);    
      }, 300);
    }, 
    error => 
      {
        setTimeout(() => {
          this.servicio.activarSpinner.emit(false);    
        }, 300);    
      })
  }

  recuperar()
  {
    this.listarPartes();
    this.listarCargas();
    this.listarProcesos();
    let sentencia = "SELECT a.*, SEC_TO_TIME(TIME_TO_SEC(TIMEDIFF(a.fecha, a.fecha_anterior))) AS sumado, IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(a.creacion, 'N/A') AS fcreacion, IFNULL(b.nombre, 'N/A') AS ucreacion, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.cargas a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
    
    if (this.maestroActual == 0 && this.nivelActual==0)
    {
      //0. Proceso origen de esta operación      
      this.titulos = ["1. Numero de parte", "3. Fecha promesa", "4. Hora promesa", "5. Cantidad (Lotes)", "5. Notas", "7. Estatus del registro", "11. Fecha del último cambio", "12. Usuario que realizó el último cambio", "13. Fecha de creación del registro ", "14. Usuario que creó el registro", "15. ID único del registro", "5. Activar la alarma de no cumplire la promesa", "2. Equipo a programar", "1. Número de carga", "8. Fecha anterior a la reprogramación", "9. Número de veces que se ha reprogramado", "10. Fecha promesa original de la carga",   ]
      this.indices = [{ nombre: "Cargas", icono: "iconshock-materialblack-general-calendar"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Programación")
    }
    if (this.maestroActual == 0 && this.nivelActual==1)
    {
      sentencia = "SELECT a.*, IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(a.creacion, 'N/A') AS fcreacion, IFNULL(b.nombre, 'N/A') AS ucreacion, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.programacion a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
      //0. Proceso origen de esta operación      
      this.titulos = ["2. Numero de parte", "3. Fecha promesa", "4. Hora promesa", "3. Cantidad (Lotes)", "7. Notas", "4. Estatus del registro", "5. Fecha del último cambio", "6. Usuario que realizó el último cambio", "7. Fecha de creación del registro ", "8. Usuario que creó el registro", "9. ID único del registro", "10. Activar la alarma de no cumplire la promesa", "2. Equipo a programar", "6. Número de carga (referencia)"  ]
      this.indices = [{ nombre: "Cargas", icono: "iconshock-materialblack-general-calendar"}, { nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Programación")
    }
    else if (this.maestroActual == 1)
    {
      this.listarCabProcesos()
      this.titulos = ["1. Numero de parte", "2. Fecha y hora de vencimiento de la prioridad", "", "4. Prioridad de producción (1 más alta)", "5. Notas", "6. Estatus del registro", "7. Fecha del último cambio", "8. Usuario que realizó el último cambio", "9. Fecha de creación del registro ", "10. Usuario que creó el registro", "11. ID único del registro", "" ]
      sentencia = "SELECT a.*, IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(a.creacion, 'N/A') AS fcreacion, IFNULL(b.nombre, 'N/A') AS ucreacion, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.prioridades a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
      //0. Proceso origen de esta operación      
      this.indices = [{ nombre: "Prioridades", icono: "iconshock-materialblack-general-bell"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Prioridades")
    }
    else if (this.maestroActual == 4)
    {
      sentencia = "SELECT a.*, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), ' N/A') AS prioridad, CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' WHEN a.estado = 80 THEN 'En Inspección' WHEN a.estado = 90 THEN 'Rechazado' WHEN a.estado = 99 THEN 'Finalizado' END as estado, IFNULL(e.nombre, 'N/A') AS nproceso, IFNULL(b.nombre, 'N/A') AS nequipo, IFNULL(c.nombre, 'N/A') AS nruta_detalle, IFNULL(d.referencia, 'N/A') AS referencia, IFNULL(d.nombre, 'N/A') AS producto, IFNULL(f.nombre, 'N/A') AS insp_causa, IFNULL(g.nombre, 'N/A') AS recha_causa, IFNULL(h.nombre, 'N/A') AS insp_por, IFNULL(i.nombre, 'N/A') AS recha_por FROM sigma.lotes a LEFT JOIN sigma.det_procesos b ON a.equipo = b.id LEFT JOIN sigma.det_rutas c ON a.ruta_detalle = c.id LEFT JOIN sigma.cat_partes d ON a.parte = d.id LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id LEFT JOIN sigma.cat_situaciones f ON a.inspeccion_id = f.id LEFT JOIN sigma.cat_situaciones g ON a.rechazo_id = g.id LEFT JOIN sigma.cat_usuarios h ON a.inspeccionado_por = h.id LEFT JOIN sigma.cat_usuarios i ON a.rechazado_por = i.id WHERE a.id = " + this.registroActual; 
      //0. Proceso origen de esta operación 
           
      this.titulos = ["1. Numero de parte", "2. Fecha y hora de vencimiento de la prioridad", "", "4. Prioridad de producción (1 más alta)", "5. Notas", "6. Estatus del registro", "7. Fecha del último cambio", "8. Usuario que realizó el último cambio", "9. Fecha de creación del registro ", "10. Usuario que creó el registro", "11. ID único del registro", "" ]
      this.servicio.mensajeSuperior.emit("Consulta de inventario");
    }
    
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
        this.servicio.mensajeInferior.emit("Edición de " + this.literalSingular);    
        this.detalleRegistro = resp[0];
        this.registroActual = resp[0].id;
        this.detalleRegistro.hora = this.servicio.fecha(2, this.detalleRegistro.fecha, "HH:mm")
        this.detalleRegistro.fecha = new Date(this.detalleRegistro.fecha)
        this.cancelarEdicion = false;
        this.mostrarImagenRegistro = "S";
        this.estatusActual = this.detalleRegistro.estatus;
        this.secuenciaActual = this.detalleRegistro.secuencia;
        this.botonera[3]= false;
        this.botonera[4]= this.detalleRegistro.estatus == "I";
        this.botonera[5]= false;
        this.copiandoDesde = 0;
        if (this.despuesBusqueda == 1)
        {
          this.copiandoDesde = this.detalleRegistro.id;
          this.registroActual = 0;
          this.mostrarImagenRegistro = "S";
          this.detalleRegistro.estatus = "A"
          this.botonera[1] = false;
          this.botonera[2] = false;
          this.editando = true;
          this.faltaMensaje = "No se han guardado los cambios..."
          this.detalleRegistro.id = 0;
          this.detalleRegistro.fcambio = "";
          this.detalleRegistro.ucambio = "";
          this.detalleRegistro.fcreacion = "";
          this.detalleRegistro.ucreacion = "";
        }
        else
        {
          this.editando = false;
          this.botonera[1]= true;
          this.botonera[2]= true;
        }
        if (this.maestroActual==4)
        {
          this.historicos = [];
          //sentencia = "SELECT a.*, SEC_TO_TIME(a.tiempo_total) AS tiempoSEC, IFNULL(b.nombre, 'N/A') AS nruta_detalle, IFNULL(c.nombre, 'N/A') AS nequipo FROM sigma.lotes_historia a LEFT JOIN sigma.det_rutas b ON a.ruta_detalle = b.id LEFT JOIN sigma.det_procesos c ON a.equipo = c.id WHERE a.lote = " + this.registroActual + " ORDER BY a.id;"
          sentencia = "SELECT a.fecha_estimada, a.fecha_entrada, a.fecha_stock, a.fecha_proceso, a.fecha_salida, e.secuencia, IFNULL(a.id, 0) AS pasado, 1 AS salto, SEC_TO_TIME(a.tiempo_total) AS tiempoSEC, IFNULL(b.nombre, 'N/A') AS nruta_detalle, IFNULL(c.nombre, 'N/A') AS nequipo FROM sigma.ruta_congelada e LEFT JOIN sigma.lotes_historia a ON e.lote = a.lote AND e.secuencia = a.ruta_secuencia LEFT JOIN sigma.det_rutas b ON e.id_detruta = b.id LEFT JOIN sigma.det_procesos c ON a.equipo = c.id WHERE e.lote = " + this.registroActual + " ORDER BY e.secuencia;"
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            this.cubiertas = 0;
            this.actual = 0;
            this.saltos = 0;
            let totales = 0;
            let blancos = 0;
            for (var i = 0 ; i < resp.length; i++)
            {
              totales = totales + 1;
              if (+resp[i].pasado > 0)
              {
                this.actual = i;
                this.saltos = blancos;
                this.cubiertas = totales;
                resp[i].salto = 0;
              }
              else
              {
                blancos = blancos + 1;
              }
            }  
            if (!resp[this.actual].fecha_salida)
            {
              this.cubiertas = this.cubiertas - 1;
            }
            
            this.cadHistorico = "Este lote ha cubierto un " + Math.floor(this.cubiertas / resp.length * 100) + "% de su ruta de fabricación (" + this.cubiertas + " de " + resp.length + "). Se han registrado " + this.saltos + " salto(s) de operación";
            this.historicos = resp;
          });
        }
        setTimeout(() => {
          if (this.maestroActual==0 && this.nivelActual==1)
          {
            this.lstParte3.focus();
          }
          else if (this.maestroActual==0)
          {
            this.txtCarga.nativeElement.focus();
          }
          else
          {
            this.lstParte.focus();
          }
          
        }, 300);
    }, 
    error => 
      {
        console.log(error)
      })
  }

  buscarRegistro(accion: number)
  {
    let catalogo = "sigma.cargas"
    if (this.nivelActual == 1) 
    {
      catalogo = "sigma.programacion"
    }
    else if (this.maestroActual == 1) 
    {
      catalogo = "sigma.prioridades"
    }
    let sentencia: string = "";
    if (accion == 1)
    {
      this.recuperar()
      return;
    }
    else
    {
      if (this.editando && !this.cancelarEdicion)
      {
        this.deshacerEdicion(accion, 2);
        return;
      }
    }
    this.verRegistro = 22;
    if (accion == 2)
    {
      sentencia = "SELECT MIN(id) AS id FROM " + catalogo;
    }
    else if (accion == 3)
    {
      sentencia = " SELECT (SELECT id FROM " + catalogo + " WHERE id > " + this.registroActual + " ORDER BY id ASC LIMIT 1) AS id UNION ALL (SELECT MIN(id) FROM " + catalogo + ") ORDER BY 1 DESC LIMIT 1;"
    }
    else if (accion == 4)
    {
      sentencia  = " SELECT (SELECT MAX(id) FROM " + catalogo + ") AS id UNION ALL (SELECT id FROM " + catalogo + " WHERE id < " + this.registroActual + " ORDER BY 1 DESC LIMIT 1) ORDER BY 1 ASC LIMIT 1;"
    }
    else if (accion == 5)
    {
      sentencia = " SELECT MAX(id) AS id FROM " + catalogo;
    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp[0].id)
      {
        this.registroActual = resp[0].id;
        this.recuperar()
      }
      else
      {
        this.procesarPantalla(this.maestroActual)
      }
    })
    
  }

  revisar()
  {
    if (this.actualizarMaestro && this.verRegistro == 1)
    {
      
      let sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.actualizaciones WHERE cargas = 'S'";
      if (this.nivelActual == 1)
      {
        sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.actualizaciones WHERE prioridades = 'S'";
      }
      else if (this.maestroActual == 1)
      {
        sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.actualizaciones WHERE prioridades = 'S'";
      }
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
        {
          if (resp[0].cuenta > 0)
          {
            //Se revisa la tabla para 
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class";
            mensajeCompleto.mensaje = "La vista se ha actualizado";
            mensajeCompleto.tiempo = 2000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
            this.llenarRegistros();

            //Se actualiza la tabla
            sentencia = "UPDATE sigma.actualizaciones SET planes = 'N'";
            if (this.maestroActual == 1)
            {
              sentencia = "UPDATE sigma.actualizaciones SET prioridades = 'N'";
            }
            campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
              {
                setTimeout(() => {
                  this.revisar()  
                }, +this.tiempoRevision);
              })
          }
        },
      error => 
        {
          console.log(error);
          setTimeout(() => {
            this.revisar()  
          }, +this.tiempoRevision);
        }
      )
      setTimeout(() => {
        this.revisar()  
      }, +this.tiempoRevision);
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

  contarRegs()
  {
    let cadAdicional: string = (this.registros.length != this.arrFiltrado.length ? " (lista filtrada de un total de " + this.arrFiltrado.length + ") " : "");
    let mensaje = "No hay " + this.literalPlural;
    if (this.registros.length > 0)
    {
      mensaje = "Hay " + (this.registros.length == 1 ? "un " + this.literalSingular : this.registros.length + " " + this.literalPlural) 
    }
    if (this.nivelActual==1)
    {
      cadAdicional = cadAdicional + " para la '" + this.nombreRuta + "'";
    }
    mensaje = mensaje + " en la vista" + cadAdicional;
    this.servicio.mensajeInferior.emit(mensaje);    
  }

  cambioMaestro()
  {
    if (this.maestroActual == 1)
    {

    }
  }

  imagenError(id: number)
  {
    //if (this.accion == "in")
    {
      this.registros[id].mostrarImagen = "N";
      
    }
  }

  imagenErrorRegistro()
  {
    //if (this.accion == "in")
    {
      this.mostrarImagenRegistro = "N";
      this.mensajeImagen = "Imagen no encontrada..."
    }
  }

  editar(i: number)
  {
    let id = this.registros[i].id; 
    if (this.maestroActual >= 2 && this.maestroActual < 4)
    {
      this.liberar(id);
    }
    else if (this.maestroActual == 4 && (this.vision==0 || this.vistaDetalle==1))
    {
      this.registroActual = id; 
      this.verRegistro = 22;
      this.recuperar();
    }
    else if (this.maestroActual == 4 && this.vision==1)
    {
      this.vistaDetalle = 1;
      this.idNivel1 = id; 
      this.verRegistro = 21;
      this.llenarRegistros();
    }
    else if (this.maestroActual == 4 && this.vision==2)
    {
      this.vistaDetalle = 1;
      this.idNivel1 = id; 
      this.idNivel2 = this.registros[i].proceso;
      this.verRegistro = 21;
      this.llenarRegistros();
    }
    else if (this.maestroActual == 4 && this.vision==3)
    {
      this.vistaDetalle = 1;
      this.idNivel1 = id; 
      this.idNivel2 = this.registros[i].proceso;
      this.verRegistro = 21;
      this.llenarRegistros();
    }
    else if (this.maestroActual == 4 && this.vision==4)
    {
      this.vistaDetalle = 1;
      this.idNivel1 = id; 
      this.verRegistro = 21;
      this.llenarRegistros();
    }
    else
    {
      if (this.servicio.rUsuario().programacion=="S" && (this.servicio.rUsuario().rol=="O" || this.servicio.rUsuario().rol=="C"))
      {
        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "400px", data: { titulo: "Privilegios insuficientes", mensaje: "El perfil de usuario NO tiene los privilegios suficientes para editar la carga", alto: "40", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
        });
        return;
      }
      else
      {
        this.registroActual = id;    
        this.despuesBusqueda = 0;
        this.buscarRegistro(1);    
        this.verRegistro = 22;
      }
      
    }
  }

  salidaEfecto(evento: any)
  {
    if (evento.toState)
    {
      this.verRegistro = (this.verRegistro == 21 || this.verRegistro == 1 ? 1 : 2);
      this.botonera1 = this.verRegistro == 1;
      this.botonera2 = this.verRegistro == 2;
      
    }
    this.verImagen = this.verRegistro == 1;  
  }

  procesarPantalla(id: number)
  {
    if (this.editando && !this.cancelarEdicion)
    {
      this.deshacerEdicion(id, 1)
      return;
    }   
    this.botonera1 = true;
    this.botonera2 = false;
    this.verImagen = false;
    if (!this.noAnimar)
    {
      this.verRegistro = (this.verRegistro == 0 || this.verRegistro == 21 ? 1 : 21);  
    }
    else
    {
      this.verRegistro = 1;
    }  
    if (id == 1 && this.maestroActual == 0)
      {
        
        this.indices = [];
        this.nivelActual = 0;
        
        this.servicio.mensajeSuperior.emit("Gestión de Programación")
      }
      else if (id == 1 && this.maestroActual == 1)
      {
        this.indices = [];
        
        this.servicio.mensajeSuperior.emit("Gestión de Prioridades")
      }
      else if (id == 1 && this.maestroActual == 2)
      {
        this.indices = [];
        
        this.servicio.mensajeSuperior.emit("Gestión de Lotes en inspección")
      }
      else if (id == 1 && this.maestroActual == 3)
      {
        this.indices = [];
        
        this.servicio.mensajeSuperior.emit("Gestión de Lotes rechazados")
      }
      else if (id == 2 && this.maestroActual == 0)
      {
        
        this.indices = [{ nombre: "Cargas", icono: "iconshock-materialblack-general-calendar"} ];
        
        this.servicio.mensajeSuperior.emit("Gestión de Programación")
      }
      else if (id == 1 && this.maestroActual == 4)
      {
        this.vistaDetalle = 1;
        this.vision = 0;
        this.indices = [{ nombre: "General", icono: "iconshock-materialblack-general-bell"}, { nombre: "Procesos", icono: "iconshock-iphone-business-solution"}, { nombre: "Equipos", icono: "iconshock-materialblack-networking-lan-cable"}, { nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"}, { nombre: "Estado", icono: "iconshock-materialblack-communications-sign-in"}  ];
        
        this.servicio.mensajeSuperior.emit("Consulta de inventario")
      }
      else if (id == 2 && this.maestroActual == 4)
      {
        this.vistaDetalle = 0;
        this.vision = 1;
        this.nivelActual = 0;
        this.indices = [{ nombre: "General", icono: "iconshock-materialblack-general-bell"}, { nombre: "Procesos", icono: "iconshock-iphone-business-solution"}, { nombre: "Equipos", icono: "iconshock-materialblack-networking-lan-cable"}, { nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"}, { nombre: "Estado", icono: "iconshock-materialblack-communications-sign-in"}  ];
        this.servicio.mensajeSuperior.emit("Consulta de inventario")
      }
      else if (id == 3 && this.maestroActual == 4)
      {
        this.vistaDetalle = 0;
        this.vision = 2;
        this.nivelActual = 0;
        this.indices = [{ nombre: "General", icono: "iconshock-materialblack-general-bell"}, { nombre: "Procesos", icono: "iconshock-iphone-business-solution"}, { nombre: "Equipos", icono: "iconshock-materialblack-networking-lan-cable"}, { nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"}, { nombre: "Estado", icono: "iconshock-materialblack-communications-sign-in"}  ];
        this.servicio.mensajeSuperior.emit("Consulta de inventario")
      }
      else if (id == 4 && this.maestroActual == 4)
      {
        this.vistaDetalle = 0;
        this.vision = 3;
        this.nivelActual = 0;
        this.indices = [{ nombre: "General", icono: "iconshock-materialblack-general-bell"}, { nombre: "Procesos", icono: "iconshock-iphone-business-solution"}, { nombre: "Equipos", icono: "iconshock-materialblack-networking-lan-cable"}, { nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"}, { nombre: "Estado", icono: "iconshock-materialblack-communications-sign-in"}  ];
        this.servicio.mensajeSuperior.emit("Consulta de inventario")
      }
      else if (id == 5 && this.maestroActual == 4)
      {
        this.vistaDetalle = 0;
        this.vision = 4;
        this.nivelActual = 0;
        this.indices = [{ nombre: "General", icono: "iconshock-materialblack-general-bell"}, { nombre: "Procesos", icono: "iconshock-iphone-business-solution"}, { nombre: "Equipos", icono: "iconshock-materialblack-networking-lan-cable"}, { nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"}, { nombre: "Estado", icono: "iconshock-materialblack-communications-sign-in"}  ];
        this.servicio.mensajeSuperior.emit("Consulta de inventario")
      }
      if (this.maestroActual==4)
      {
        this.seleccion = id - 1;
      }
    this.llenarRegistros();
    this.revisar();
  }

  escapar()
  {
    this.buscar()
  }

  buscar()
  {
    this.verBuscar = !this.verBuscar
    if (this.verBuscar)
    {
      setTimeout(() => {
        this.txtBuscar.nativeElement.focus();
      }, 50);
    }
  }

  descargar()
  {
    let catalogo = "inventario_lotes"
    if (this.maestroActual == 0)
    {
      catalogo = "cargas_programacion"
    }
    else if (this.maestroActual == 1)
    {
      catalogo = "prioridades"
    }
    else if (this.maestroActual == 2)
    {
      catalogo = "lotes_inspeccion"
    }
    else if (this.maestroActual == 3)
    {
      catalogo = "lotes_scrap"
    }
    else if (this.maestroActual == 4 && this.vision==1) //Rutas de producción
    {
      catalogo = "lotes_por_proceso"
    }
    else if (this.maestroActual == 4 && this.vision==2) //Rutas de producción
    {
      catalogo = "lotes_por_equipo"
    }
    else if (this.maestroActual == 4 && this.vision==3) //Rutas de producción
    {
      catalogo = "lotes_por_numeros_de_parte"
    }
    else if (this.maestroActual == 4 && this.vision==4) //Rutas de producción
    {
      catalogo = "lotes_por_estado"
    }
    let campos = {accion: 150, sentencia: this.sentenciaR, archivo: 'lotes_usuario_' + this.servicio.rUsuario().id};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.http.get(this.URL_FOLDER + 'lotes_usuario_' + this.servicio.rUsuario().id + '.csv', {responseType: 'arraybuffer'})
      .subscribe((res) => {
          this.writeContents(res, catalogo + '.csv', 'text/csv'); 
      });
    })
  }

  writeContents(content, fileName, contentType) 
  {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  filtrar()
  {
    this.registros = this.aplicarFiltro(this.textoBuscar);
    this.contarRegs();    
  }

  aplicarFiltro(cadena: string) {
    if (!cadena ) 
    {
      return this.arrFiltrado;
    }
    else if (this.maestroActual == 0 && this.nivelActual==1)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fcambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ucambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.cantidad.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.referencia.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }
    else if (this.maestroActual == 0 && this.nivelActual==0)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fecha.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fcambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ucambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.partes.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.piezas.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }
    else if (this.maestroActual == 1)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fecha.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fcambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.orden.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.referencia.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }
    else if (this.maestroActual == 2 || this.maestroActual == 3)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fecha.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.elote.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nproceso.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.causa.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.causaref.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.causa.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.proceso.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.producto.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ucambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          
          datos.referencia.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }
    else if (this.maestroActual == 4 && this.vistaDetalle==1)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nproceso.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.producto.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fecha.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.hasta.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.prioridad.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ruta_secuencia.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estado.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.numero.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.referencia.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ncarga.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }
    else if (this.maestroActual == 4 && this.vision==1)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.pctproceso.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.pctstock.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.calidad.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.espera.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.totall.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.calidad.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.stock.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }

  else if (this.maestroActual == 4 && this.vision==2)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nproceso.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.referencia.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.espera.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.totall.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }
    else if (this.maestroActual == 4 && this.vision==3)
    {
      return this.arrFiltrado.filter(datos => 
        datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
        ||
        datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
        ||
        datos.calidad.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
        ||
        datos.espera.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
        ||
        datos.totall.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
        ||
        datos.calidad.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
        ||
        datos.stock.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }
  }

  cambiando(evento: any)
  {
    if (!this.editando)
    {
      this.botonera[1] = false;
      this.botonera[2] = false;
      this.botonera[3] = true;
      this.botonera[4] = true;
      this.botonera[5] = true;
      this.editando = true;
      this.faltaMensaje = "No se han guardado los cambios..."
      this.detalleRegistro.fcambio = "";
      this.detalleRegistro.ucambio = "";
      this.cancelarEdicion = false;
    }
    if (evento.target)
    {
      if (evento.target.name)
      {
        if (evento.target.name == "imagen")
        {
          this.mostrarImagenRegistro = "S";
          this.mensajeImagen = "Campo opcional"
        }
      }
    }
  }
  
  onFileSelected(event)
  {
    const fd = new FormData();
    fd.append('avatar', event.target.files[0], event.target.files[0].name);

    /** In Angular 5, including the header Content-Type can invalidate your request */
    this.http.post<any>(this.URL_BASE, fd)
    .subscribe((res) => {
        this.botonera[1] = false;
        this.botonera[2] = false;
        this.editando = true;
        this.faltaMensaje = "No se han guardado los cambios..."
        this.mostrarImagenRegistro = "S";
        this.mensajeImagen = "Campo opcional"
        this.detalleRegistro.imagen = this.URL_IMAGENES + event.target.files[0].name;
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "custom-class";
        mensajeCompleto.mensaje = "La imagen fue guardada satisfactoriamente";
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
      });
  }

  cancelar()
  {
    if (!this.botonera[2])
    {
      this.edicionCancelada();              
      this.despuesBusqueda = 0;
      if (!this.registroActual)
      {
        this.inicializarPantalla();
        return;
      }
      else
      {
        this.buscarRegistro(1)
      }
    }
  }

  copiar()
  {
    if (!this.botonera[3])
    {
      if (this.editando && !this.cancelarEdicion)
      {
        this.deshacerEdicion(0, 99)
        return;
      } 
      this.despuesBusqueda = 1;
      this.buscarRegistro(1);
      
    } 
  }

  validarEliminar()
  {
    let idBuscar = this.registroActual
    let sentencia = "";
    if (this.maestroActual == 0 && this.nivelActual == 0) //Rutas de producción
    {
      //sentencia = "SELECT COUNT(*) AS totalr FROM sigma.programacion WHERE estatus = 'A' AND proceso = " + idBuscar; 
    }
    if (sentencia)
    {
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp && resp[0].totalr > 0)
        {
          let mensaje = "El proceso no se puede eliminar porque hay " + (resp[0].totalr == 1 ? "una operación asociada" : resp[0].totalr + " operaciones asociadas") + " a este registro"
          if (this.maestroActual == 1)
          {
            mensaje = "La ruta de fabricación no se puede eliminar porque hay " + (resp[0].totalr == 1 ? "un número de parte asociado" : resp[0].totalr + " números de parte asociados") + " a este registro"
          }
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", data: { titulo: "Eliminar " + this.literalSingular, mensaje: mensaje, alto: "80", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
          });
        }
        else
        {
          this.eliminar(idBuscar);
        }
      })
    }
    else
    {
      this.eliminar(idBuscar); 
    }
  }

  nuevo()
  {
    if (this.servicio.rUsuario().programacion=="S" && (this.servicio.rUsuario().rol=="O" || this.servicio.rUsuario().rol=="C"))
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "400px", data: { titulo: "Privilegios insuficientes", mensaje: "El perfil de usuario NO tiene los privilegios suficientes para crear una carga", alto: "40", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
      });
      return;
    }
    else
    {
      this.verRegistro = 22;

    
    this.listarPartes();
    this.listarCargas();
    this.listarProcesos();
    this.listarCabProcesos()
    if (this.maestroActual == 0 && this.nivelActual==1)
    {
      this.listarPartes();
      this.indices = [{ nombre: "Cargas", icono: "iconshock-materialblack-general-calendar"}, { nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"} ];
      this.titulos = ["2. Numero de parte", "3. Fecha promesa", "4. Hora promesa", "3. Cantidad (Lotes)", "7. Notas", "4. Estatus del registro", "5. Fecha del último cambio", "6. Usuario que realizó el último cambio", "7. Fecha de creación del registro ", "8. Usuario que creó el registro", "9. ID único del registro", "8. Activar la alarma de no cumplire la promesa", "2. Equipo a programar", "6. Número de carga (referencia)"  ]
      this.servicio.mensajeSuperior.emit("Gestión de Programación")
    }
    if (this.maestroActual == 0 && this.nivelActual==0)
    {
      this.listarProcesos();
      this.indices = [{ nombre: "Cargas", icono: "iconshock-materialblack-general-calendar"} ];
      this.titulos = ["1. Numero de parte", "3. Fecha promesa", "4. Hora promesa", "5. Cantidad (Lotes)", "5. Notas", "7. Estatus del registro", "11. Fecha del último cambio", "12. Usuario que realizó el último cambio", "13. Fecha de creación del registro ", "14. Usuario que creó el registro", "15. ID único del registro", "5. Activar la alarma de no cumplire la promesa", "2. Equipo a programar", "1. Número de carga", "8. Fecha anterior a la reprogramación", "9. Número de veces que se ha reprogramado", "10. Fecha promesa original de la carga",   ]
      this.servicio.mensajeSuperior.emit("Gestión de Programación")
    }
    else if (this.maestroActual == 1)
    {

      this.indices = [{ nombre: "Prioridades", icono: "iconshock-materialblack-general-bell"} ];
      this.titulos = ["1. Numero de parte", "2. Fecha y hora de vencimiento de la prioridad", "", "3. Prioridad de producción (1 más alta)", "4. Notas", "5. Estatus del registro", "6. Fecha del último cambio", "7. Usuario que realizó el último cambio", "8. Fecha de creación del registro ", "9. Usuario que creó el registro", "10. ID único del registro", "" ]
      this.servicio.mensajeSuperior.emit("Gestión de Programación")
    }
    this.copiandoDesde = 0;
    this.servicio.mensajeInferior.emit("Edición de " + this.literalSingular);    
    if (!this.botonera[0])
    {
      if (this.editando && !this.cancelarEdicion)
      {
        this.deshacerEdicion(0, 99)
        return;
      } 
      this.despuesBusqueda = 0;
      //
      this.detalleRegistro.id = 0;
      this.detalleRegistro.parte = 0;
      this.detalleRegistro.proceso = 1;
      this.detalleRegistro.cantidad = 1;
      this.detalleRegistro.permitir_reprogramacion = "S";
      this.detalleRegistro.alarma = "S";
      this.detalleRegistro.orden = 99;
      this.detalleRegistro.notas = "";
      this.detalleRegistro.carga = "";
      if (this.nivelActual==1)
      {
        this.detalleRegistro.carga = this.idNivel0;
      }
      this.detalleRegistro.fecha = new Date();
      this.detalleRegistro.hora = this.servicio.fecha(1, "", "HH") + ":00";
      this.detalleRegistro.estatus = "A"
      this.detalleRegistro.alarma = "S"
      this.detalleRegistro.id = 0;
      this.detalleRegistro.fcambio = "";
      this.detalleRegistro.ucambio = "";
      this.detalleRegistro.fcreacion = "";
      this.detalleRegistro.ucreacion = "";
      //
      this.registroActual = 0;
      this.cancelarEdicion = true;
      this.mostrarImagenRegistro = "S";
      this.editando = false;
      this.botonera[1] = true;
      this.botonera[2] = true;
      this.botonera[3] = true;
      this.botonera[4] = true;
      this.botonera[5] = true;
      setTimeout(() => {
        if (this.maestroActual==0 && this.nivelActual==1)
        {
          this.lstParte3.focus();
        }
        else if (this.maestroActual==0)
        {
          this.txtCarga.nativeElement.focus();
        }
        else
        {
          this.lstParte.focus();
        }
        
      }, 300);
    }
    } 
  }

  listarPartes()
  {
    let sentencia = "SELECT id, nombre FROM sigma.cat_partes ORDER BY nombre;"
    this.partes = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.partes = resp;
      
    });
  }

  listarCargas()
  {
    let sentencia = "SELECT a.id, CONCAT('#', a.carga, ' / Fecha: ', a.fecha, ' / Equipo: ', b.nombre) AS carga FROM sigma.cargas a INNER JOIN sigma.det_procesos b ON a.equipo = b.id ORDER BY a.fecha;"
    this.cargas = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.cargas = resp;
      
    });
  }

  listarProcesos()
  {
    let sentencia = "SELECT id, nombre FROM sigma.det_procesos WHERE programar = 'S' ORDER BY nombre;"
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.procesos = resp;
    });
  }

  listarCabProcesos()
  {
    let sentencia = "SELECT id, nombre FROM sigma.cat_procesos ORDER BY nombre;"
    this.cabProcesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.cabProcesos = resp;
    });
  }


  nuevoRegistroGral()
  {
    this.nuevo();    
    
  }

  validarTabla()
  {
    let sentencia = "SELECT id FROM sigma.cargas LIMIT 1";
    if (this.maestroActual == 0 && this.nivelActual == 1) 
    {
      sentencia = "SELECT id FROM sigma.programacion LIMIT 1";
    }
    else if (this.maestroActual == 1) 
    {
      sentencia = "SELECT id FROM sigma.prioridades LIMIT 1";
    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
        if (resp.length > 0)
        {
          if (resp[0].id > 0 && this.botonera[7])
          {
            this.botonera[7] = false;
            this.botonera[8] = false;
            this.botonera[9] = false;
            this.botonera[10] = false;
          }
          else if (!this.botonera[7])
          {
            this.botonera[7] = true;
            this.botonera[8] = true;
            this.botonera[9] = true;
            this.botonera[10] = true;
          }
        }
        else if (!this.botonera[7])
        {
          this.botonera[7] = true;
          this.botonera[8] = true;
          this.botonera[9] = true;
          this.botonera[10] = true;
        }
    }) 
  }

  deshacerEdicion(parametro: number, desde: number)
  {
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "480px", height: "230px", data: { titulo: "Registro no guardado", mensaje: "Ha efectuado cambios en el registro que no se han guardado. <br>¿Que desea hacer?", alto: "60", id: 0, accion: 0, botones: 3, boton1STR: "Guardar", icono1: "iconshock-materialblack-general-diskette", boton2STR: "Continuar sin guardar", icono2: "iconshock-materialblack-general-next", boton3STR: "Regresar", icono3: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-project-management-problems" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        this.cancelarEdicion = true;
        this.validarGuardar();      
      }
      else if (result.accion == 2) 
      {
        this.cancelarEdicion = true;
        this.edicionCancelada();      
        if (desde == 1)
        {
          this.procesarPantalla(parametro)
        }
        else if (desde == 2)
        {
          this.buscarRegistro(parametro)
        }        
      }
    });
  }

  validarGuardar()
  {
    if (this.maestroActual == 0 && this.nivelActual == 0)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.carga)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el número de Carga";
      }
      if (!this.detalleRegistro.equipo)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el Equipo asociado a la programación";
      }
      if (!this.detalleRegistro.hora)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar la hora de la programación";
      }
      if (!this.detalleRegistro.fecha)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta la fecha promesa";
      }
      
      
      
      if (errores == 0)
      {
        if (this.detalleRegistro.id != 0 && this.detalleRegistro.estatus == "I" && this.estatusActual == "A")
        {
          this.validarInactivar(this.detalleRegistro.id, 2);            
        } 
        else
        {

          if (this.detalleRegistro.fecha && this.detalleRegistro.hora && new Date(this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd") + " " + this.detalleRegistro.hora) < new Date())
          {
            const respuesta = this.dialogo.open(DialogoComponent, {
              width: "430px", height: "230px", data: { titulo: "Fecha de promesa vencida", mensaje: "La fecha de promesa de la carga ya esta vencida. ¿Desea continuar y guardar la carga?", alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Continuar y guardar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-mail-block" }
            });
            respuesta.afterClosed().subscribe(result => {
              if (!result)
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "custom-class";
                mensajeCompleto.mensaje = "La edición ha sido cancelado por el usuario";
                mensajeCompleto.tiempo = 3000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
              }
              else if (result.accion == 1) 
              {
                this.continuar();
              }
              else
              {
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "custom-class";
                mensajeCompleto.mensaje = "La edición ha sido cancelado por el usuario";
                mensajeCompleto.tiempo = 3000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
              }
            })
          }
          else
          {
            this.continuar()
          }
        }
      }
        else
      {
        setTimeout(() => {
          if (!this.detalleRegistro.carga)
          {
            this.txtCarga.nativeElement.focus();
          }
          else if (!this.detalleRegistro.equipo || this.detalleRegistro.equipo==0)
          {
            this.lstParte2.focus()
          }
          else if (!this.detalleRegistro.fecha)
          {
            this.txtFecha.nativeElement.focus()
          }
          else if (!this.detalleRegistro.hora)
          {
            this.txtDesde.nativeElement.focus()
          }
          if (this.detalleRegistro.fecha && this.detalleRegistro.hora && new Date(this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd") + " " + this.detalleRegistro.hora) < new Date())
          {
            this.txtFecha.nativeElement.focus()
          }
        }, 100);
      }
    }
    if (this.maestroActual == 0 && this.nivelActual == 1)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.carga || this.detalleRegistro.carga==0)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el Número de carga asociado";
      }
      if (!this.detalleRegistro.parte || this.detalleRegistro.parte==0)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el Número de parte";
      }
      
      if (!this.detalleRegistro.cantidad || this.detalleRegistro.cantidad == 0)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar la cantidad de lotes";
      }
      if (errores == 0)
      {
        if (this.detalleRegistro.id != 0 && this.detalleRegistro.estatus == "I" && this.estatusActual == "A")
        {
          this.validarInactivar(this.detalleRegistro.id, 2);            
        } 
        else
        {
          let sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.det_procesos a INNER JOIN sigma.det_rutas b ON a.proceso = b.proceso INNER JOIN sigma.cat_partes c ON b.ruta = c.ruta INNER JOIN sigma.cargas d ON a.id = d.equipo WHERE c.id = " + this.detalleRegistro.parte + " AND d.id = " + this.detalleRegistro.carga + ";"; 
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            if (resp[0].cuenta > 0)
            {
              this.detalleRegistro.id = (!this.detalleRegistro.id ? 0: +this.detalleRegistro.id)
              let sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.programacion WHERE parte = " + this.detalleRegistro.parte + " AND carga = " + this.detalleRegistro.carga + " AND id <> " + this.detalleRegistro.id + ";"; 
              let campos = {accion: 100, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                if (resp[0].cuenta == 0)
                {
                  this.guardar();
                }
                else
                {
                  const respuesta = this.dialogo.open(DialogoComponent, {
                    width: "400px", data: { titulo: "Operación incongruente", mensaje: "El Número de parte que está programando ya forma parte de esta carga. Vaya a la pantalla anterior y seleccionelo para su edición", alto: "80", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
                  });
                }
              })
            }
            else
            {
              const respuesta = this.dialogo.open(DialogoComponent, {
                width: "400px", data: { titulo: "Operación incongruente", mensaje: "El Número de parte que está programando no tiene en su ruta de fabricación al equipo asociado a esta Carga", alto: "80", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
              });
            }
          })
        }
      }
      else
      {
        setTimeout(() => {
          if (!this.detalleRegistro.carga || this.detalleRegistro.carga==0)
          {
            this.lstParte3.focus()
          }
          if (!this.detalleRegistro.parte || this.detalleRegistro.parte==0)
          {
            this.lstParte.focus()
          }
          else if (!this.detalleRegistro.cantidad || this.detalleRegistro.cantidad == 0)
          {
            this.txtCantidad.nativeElement.focus()
          }
        }, 100);
      }
    }
    else if (this.maestroActual == 1)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.parte || this.detalleRegistro.parte==0)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el Número de parte";
      }
      if (!this.detalleRegistro.proceso || this.detalleRegistro.proceso==0)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el Proceso asociado";
      }
      if (!this.detalleRegistro.hora)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar la hora de vencimiento de la prioridad";
      }
      if (!this.detalleRegistro.fecha)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta la fecha de vencimiento de la prioridad";
      }
      if (this.detalleRegistro.fecha && this.detalleRegistro.hora && new Date(this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd") + " " + this.detalleRegistro.hora) < new Date())
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") La fecha de vencimiento de la prioridad no puede menor a la fecha de hoy";
      }

      if (errores == 0)
      {
        if (this.detalleRegistro.id != 0 && this.detalleRegistro.estatus == "I" && this.estatusActual == "A")
        {
          this.validarInactivar(this.detalleRegistro.id, 2);            
        } 
        else
        {
          this.guardar();
        }
      }
      else
      {
        setTimeout(() => {
          if (!this.detalleRegistro.parte || this.detalleRegistro.parte==0)
          {
            this.lstParte.focus()
          }
          else if (!this.detalleRegistro.proceso || this.detalleRegistro.proceso==0)
          {
            this.lstParte4.focus()
          }
          else if (!this.detalleRegistro.fecha)
          {
            this.txtFecha.nativeElement.focus()
          }
          else if (!this.detalleRegistro.hora)
          {
            this.txtDesde.nativeElement.focus()
          }
          if (this.detalleRegistro.fecha && this.detalleRegistro.hora && new Date(this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd") + " " + this.detalleRegistro.hora) < new Date())
          {
            this.txtFecha.nativeElement.focus()
          }
          
        }, 100);
      }
    }
  }

  continuar()
  {
    let sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.cargas WHERE carga = '" + this.detalleRegistro.carga + "' AND id <> " + this.detalleRegistro.id + ";"; 
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp[0].cuenta == 0)
      {
        this.guardar();
      }
      else
      {
        
        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "430px", height: "230px", data: { titulo: "Número de carga existente", mensaje: "Ya existe una carga con ese número. ¿Desea guardar el registro y duplicar el número de carga?", alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Continuar y guardar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-mail-block" }
        });
        respuesta.afterClosed().subscribe(result => {
          if (!result)
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class";
            mensajeCompleto.mensaje = "La edición ha sido cancelado por el usuario";
            mensajeCompleto.tiempo = 3000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          else if (result.accion == 1) 
          {
            this.guardar();
          }
          else
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class";
            mensajeCompleto.mensaje = "La edición ha sido cancelado por el usuario";
            mensajeCompleto.tiempo = 3000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
        })
      }
    })
  }

  guardar()
  {
    if (this.maestroActual == 0 && this.nivelActual==1) 
    {
      let sentencia = "SELECT c.capacidad, (SELECT SUM(cantidad) FROM sigma.programacion WHERE carga = a.id AND id <> " + this.detalleRegistro.id + " AND estatus = 'A') AS cantidad FROM sigma.cargas a INNER JOIN sigma.det_procesos c ON a.equipo = c.id WHERE a.id = " + this.detalleRegistro.carga + " GROUP BY c.capacidad;"; 
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (+resp[0].capacidad < +this.detalleRegistro.cantidad + +resp[0].cantidad)
        {
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", height: "230px", data: { titulo: "Equipo sobrecargado", mensaje: "El total de lotes programados en esta carga (" + (+this.detalleRegistro.cantidad + +resp[0].cantidad) + ") supera a la capacidad máxima de proceso del equipo (" + resp[0].capacidad + ")", alto: "60", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
          });
        }
        else
        {
          this.guardarFinal();
        }
      })
    }
    else
    {
      this.guardarFinal();
    }
    
  }

  guardarFinal()
  {
    this.editando = false;
    this.botonera[1] = true;
    this.botonera[2] = true;
    this.botonera[3] = false;
    this.botonera[4] = this.detalleRegistro.estatus == "I";
    this.botonera[5] = false;
    this.faltaMensaje = "";
    let campos = {};
    let sentencia = "";
    if (this.maestroActual == 0 && this.nivelActual==1)
    {
      if (!this.detalleRegistro.cantidad)
      {
        this.detalleRegistro.cantidad = 0;
      }
      campos = 
      {
        accion: 3000, 
        id: this.detalleRegistro.id,  
        cantidad: this.detalleRegistro.cantidad, 
        parte: this.detalleRegistro.parte,
        carga: this.detalleRegistro.carga, 
        estatus: this.detalleRegistro.estatus,  
        usuario: this.servicio.rUsuario().id,
      };
    }
    if (this.maestroActual == 0 && this.nivelActual==0)
    {
      campos = 
      {
        accion: 3050, 
        id: this.detalleRegistro.id,  
        fecha: this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd") + " " + this.detalleRegistro.hora, 
        notas: (!this.detalleRegistro.notas ? "" : this.detalleRegistro.notas), 
        carga: this.detalleRegistro.carga, 
        estatus: this.detalleRegistro.estatus,  
        equipo: this.detalleRegistro.equipo, 
        permitir_reprogramacion: this.detalleRegistro.permitir_reprogramacion,  
        alarma: this.detalleRegistro.alarma,  
        usuario: this.servicio.rUsuario().id,
        copiandoDesde: this.copiandoDesde 
      };
    }
    else if (this.maestroActual == 1)
    {
      if (this.detalleRegistro.orden==0)
      {
        this.detalleRegistro.orden = 1;
      }
      campos = 
      {
        accion: 3100, 
        id: this.detalleRegistro.id,  
        fecha: this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd") + " " + this.detalleRegistro.hora, 
        notas: (!this.detalleRegistro.notas ? "" : this.detalleRegistro.notas), 
        orden: (!this.detalleRegistro.orden ? 1 : this.detalleRegistro.orden), 
        parte: this.detalleRegistro.parte, 
        proceso: this.detalleRegistro.proceso, 
        estatus: this.detalleRegistro.estatus,  
        usuario: this.servicio.rUsuario().id,
      };
    }
    this.servicio.consultasBD(campos).subscribe((datos: string) =>{
    if (datos)
    {
      if (datos.substring(0, 1) == "A")
      {
        this.detalleRegistro.id = +datos.substring(1, 10);
        this.registroActual = this.detalleRegistro.id
        this.detalleRegistro.ucreacion = (this.servicio.rUsuario().nombre ? this.servicio.rUsuario().nombre : "N/A");
        this.detalleRegistro.fcreacion = new Date(); 
      }
      this.estatusActual = this.detalleRegistro.estatus;
      this.detalleRegistro.fcambio = new Date();
      this.detalleRegistro.ucambio = (this.servicio.rUsuario().nombre ? this.servicio.rUsuario().nombre : "N/A");
      this.botonera[4] = this.detalleRegistro.estatus == "I";
      this.cancelarEdicion = false;
      let mensajeCompleto: any = [];
      mensajeCompleto.clase = "custom-class";
      mensajeCompleto.mensaje = "El registro se guardó satisfactoriamente";
      mensajeCompleto.tiempo = 2500;
      this.servicio.mensajeToast.emit(mensajeCompleto);
      sentencia = "UPDATE sigma.actualizaciones SET planes = 'S'";
      {
        //sentencia = "UPDATE sigma.actualizaciones SET det_procesos = 'S'"
      }
      let campos = {accion: 200, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        setTimeout(() => {
          this.revisar()  
        }, +this.tiempoRevision);
        if (this.maestroActual == 1 && this.nivelActual == 1)
        {
          let campos = {accion: 1400, id: this.detalleRegistro.ruta};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
          });
        }
      })
    }})
  }
  

  edicionCancelada()
  {
    let mensajeCompleto: any = [];
    mensajeCompleto.clase = "custom-class";
    mensajeCompleto.mensaje = "La edición ha sido cancelado por el usuario";
    mensajeCompleto.tiempo = 3000;
    this.servicio.mensajeToast.emit(mensajeCompleto);
  }

  inicializarPantalla()
  {
    this.detalleRegistro = [];
    this.detalleRegistro.fecha = new Date();
    this.detalleRegistro.desde= "00:00:00"
    this.detalleRegistro.hasta= "23:59:59"
    this.registroActual = 0;
    this.cancelarEdicion = false;
    this.mostrarImagenRegistro = "S";
    this.editando = false;
    this.detalleRegistro.estatus = "A"
    this.botonera[1] = true;
    this.botonera[2] = true;
    this.botonera[3] = true;
    this.botonera[4] = true;
    this.botonera[5] = true;
    setTimeout(() => {
      if (this.maestroActual==0 && this.nivelActual==1)
      {
        this.lstParte3.focus();
      }
      else if (this.maestroActual==0)
      {
        this.txtCarga.nativeElement.focus();
      }
      else
      {
        this.lstParte.focus();
      }
      
    }, 300);
    
  }

  validarInactivar(id: number, accion: number)
  {
    if (this.servicio.rUsuario().programacion=="S" && (this.servicio.rUsuario().rol=="O" || this.servicio.rUsuario().rol=="C"))
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "400px", data: { titulo: "Privilegios insuficientes", mensaje: "El perfil de usuario NO tiene los privilegios suficientes para inactivar la carga", alto: "40", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
      });
      return;
    }
    else
    {

    
      
    let idBuscar = (id == 0 ? this.registroActual : id);
    let sentencia = "";
    if (this.maestroActual == 0 && this.nivelActual == 0) //Rutas de producción
    {
      //sentencia = "SELECT COUNT(*) AS totalr FROM sigma.det_rutas WHERE estatus = 'A' AND proceso = " + idBuscar; 
    }
    if (sentencia)
    {
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp && resp[0].totalr > 0)
        {
          if (accion == 2)
          {
            this.faltaMensaje = "No se han guardado los cambios..."
          }
          let mensaje = "El proceso no se puede inactivar porque hay " + (resp[0].totalr == 1 ? "una operación asociada" : resp[0].totalr + " operaciones asociadas") + " a este registro"
          if (this.maestroActual == 1 && this.nivelActual == 0)
          {
            mensaje = "la ruta de fabricación no se puede inactivar porque hay " + (resp[0].totalr == 1 ? "un número de parte asociado" : resp[0].totalr + " números de parte asociados") + " a este registro"
          }
          const respuesta = this.dialogo.open(DialogoComponent, {
            width: "400px", data: { titulo: "Inactivar " + this.literalSingular, mensaje: mensaje, alto: "80", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
          });
        }
        else if (accion == 1)
        {
          this.Inactivar(idBuscar);
        }
        else if (accion == 2)
        {
          this.guardar();
        }
      })
    }
    else
    {
      this.Inactivar(idBuscar);
    }
  }
  }

  Inactivar(idBuscar: number)
  {
    let mensaje = "Esta acción inhabilitará la carga seleccionada.<br>¿Desea continuar con la operación?";
    if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
    {
      mensaje = "Esta acción inhabilitará el plan para el Número de parte seleccionado.<br>¿Desea continuar con la operación?";
    }
    else if (this.maestroActual == 1) //Rutas de producción
    {
      mensaje = "Esta acción inhabilitará la prioridad seleccionada.<br>¿Desea continuar con la operación?";
    }
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "430px", height: "230px", data: { titulo: "Inactivar " + this.literalSingular, mensaje: mensaje, alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Continuar e inactivar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-mail-block" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        let sentencia = "UPDATE sigma.cargas SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";UPDATE sigma.lotes SET carga = 0 WHERE carga = " + idBuscar;
        if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
        {
          sentencia = "UPDATE sigma.programacion SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";UPDATE sigma.lotes SET carga = 0 WHERE carga = " + this.idNivel0 + " AND parte = " + idBuscar; 
        }
        else if (this.maestroActual == 1) //Rutas de producción
        {
          sentencia = "UPDATE sigma.prioridades SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe(resp =>
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class";
          mensajeCompleto.mensaje = this.literalSingularArticulo + " ha sido inactivado";
          this.detalleRegistro.estatus = "I"
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
          sentencia = "UPDATE sigma.actualizaciones SET planes = 'S'";
          if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
          {
            //sentencia = "UPDATE sigma.actualizaciones SET det_procesos = 'S'"
          }
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
            {
              setTimeout(() => {
                this.revisar()  
              }, +this.tiempoRevision);
            })
          if (this.verRegistro == 1)
          {
            let indice = this.registros.findIndex(c => c.id == idBuscar)
            {
              let sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cargas a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
              {
                sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.programacion a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              else if (this.maestroActual == 1) //Rutas de producción
              {
                sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.prioridades a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              let campos = {accion: 100, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                this.registros[indice].estatus = "inactivo";
                this.registros[indice].fcambio = resp[0].fcambio;
                this.registros[indice].ucambio = resp[0].ucambio;
                indice = this.arrFiltrado.findIndex(c => c.id == idBuscar)
                this.arrFiltrado[indice].estatus = "inactivo";
                this.arrFiltrado[indice].fcambio = resp[0].fcambio;
                this.arrFiltrado[indice].ucambio = resp[0].ucambio;
              })
            } 
          }
        })
      }
    });
  }

  eliminar(idBuscar: number)
  {
    let mensaje = "Esta acción eliminará la carga seleccionada.<br>¿Desea continuar con la operación?";
    if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
    {
      mensaje = "Esta acción eliminará el plan para el Número de parte seleccionado.<br>¿Desea continuar con la operación?";
    }
    else if (this.maestroActual == 1) //Rutas de producción
    {
      mensaje = "Esta acción eliminará la prioridad seleccionada.<br>¿Desea continuar con la operación?";
    }
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "430px", height: "230px", data: { titulo: "Eliminar " + this.literalSingular, mensaje: mensaje, alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Continuar y eliminar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-general-trash-can" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        let sentencia = "DELETE FROM sigma.cargas  WHERE id = " + idBuscar + ";DELETE FROM sigma.programacion WHERE carga = " + idBuscar + ";UPDATE sigma.lotes SET carga = 0 WHERE carga = " + idBuscar;
        if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
        {
          sentencia = "DELETE FROM sigma.programacion  WHERE id = " + idBuscar +";UPDATE sigma.lotes SET carga = 0 WHERE carga = " + this.idNivel0 + " AND parte = " + idBuscar;
        }
        else if (this.maestroActual == 1) //Rutas de producción
        {
          sentencia = "DELETE FROM sigma.prioridades  WHERE id = " + idBuscar;
        }
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe(resp =>
        {
          this.buscarRegistro(3)
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = this.literalSingularArticulo + " ha sido eliminado. Se mueve al próximo registro";
          this.detalleRegistro.estatus = "I"
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
          sentencia = "UPDATE sigma.actualizaciones SET planes = 'S';";
          if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
          {
            //sentencia = "UPDATE sigma.actualizaciones SET det_procesos = 'S';"
          }
          campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
            {
              setTimeout(() => {
                this.revisar()  
              }, +this.tiempoRevision);
              if (this.maestroActual == 1 && this.nivelActual == 1)
              {
                let campos = {accion: 1600, id: this.detalleRegistro.ruta};  
                this.servicio.consultasBD(campos).subscribe( resp =>
                {
                });
              }
            })
        })
      }
    });
  }

  reactivar(idBuscar: number)
  {
    if (this.servicio.rUsuario().programacion=="S" && (this.servicio.rUsuario().rol=="O" || this.servicio.rUsuario().rol=="C"))
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "400px", data: { titulo: "Privilegios insuficientes", mensaje: "El perfil de usuario NO tiene los privilegios suficientes para inactivar la carga", alto: "40", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
      });
      return;
    }
    else
    {

    
    let mensaje = "Esta acción reactivará la carga seleccionada.<br>¿Desea continuar con la operación?";
    if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
    {
      mensaje = "Esta acción reactivará el plan para el Número de parte seleccionado.<br>¿Desea continuar con la operación?";
    }
    else if (this.maestroActual == 1) //Rutas de producción
    {
      mensaje = "Esta acción reactivará la prioridad seleccionada.<br>¿Desea continuar con la operación?";
    }
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "430px", height: "230px", data: { titulo: "Reactivar " + this.literalSingular, mensaje: mensaje, alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Reactivar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-mail-block" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        let sentencia = "UPDATE sigma.cargas SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
        {
          sentencia = "UPDATE sigma.programacion SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 1) //Rutas de producción
        {
          sentencia = "UPDATE sigma.prioridades SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe(resp =>
        {
          let indice = this.registros.findIndex(c => c.id == idBuscar);
          {
            let sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cargas a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
              {
                sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.programacion a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              else if (this.maestroActual == 1) //Rutas de producción
              {
                sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.prioridades a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
            let campos = {accion: 100, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              this.registros[indice].estatus = "activo";
              this.registros[indice].fcambio = resp[0].fcambio;
              this.registros[indice].ucambio = resp[0].ucambio;
              indice = this.arrFiltrado.findIndex(c => c.id == idBuscar)
              this.arrFiltrado[indice].estatus = "activo";
              this.arrFiltrado[indice].fcambio = resp[0].fcambio;
              this.arrFiltrado[indice].ucambio = resp[0].ucambio;
            })
          }
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class";
          mensajeCompleto.mensaje = this.literalSingularArticulo + " ha sido reactivado";
          this.detalleRegistro.estatus = "I"
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
          sentencia = "UPDATE sigma.actualizaciones SET planes = 'S'";
          if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
          {
            //sentencia = "UPDATE sigma.actualizaciones SET det_procesos = 'S'"
          }
          campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
            {
              setTimeout(() => {
                this.revisar()  
              }, +this.tiempoRevision);
            })
        })
      }
    });
  }
  }

    refrescar()
    {
      this.verRegistro = 21;
      this.llenarRegistros();
    }

    liberar(id: number)
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "480px", height: "385px", data: { revision: -1, clave: "1", claves:"", causaC: -1, causaD: this.registros[id].causa + " (Ref: " + this.registros[id].causaref + ")", titulo: "Liberar Lote de inspección a producción", mensaje: "", alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Retornar a producción", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-project-management-problems" }
      });
      respuesta.afterClosed().subscribe(result => {
        if (result.accion == 1) 
        {
          let sentencia = "UPDATE sigma.lotes SET estado = 0, alarma_tse = 'N', alarma_tse_p = 'N', alarma_tse_paso = 'N', alarma_tpe = 'N', alarma_tpe_p = 'N', alarma_tpe_paso = 'N', carga = 0, finaliza = NULL, hasta = NULL, calcular_hasta = '1', equipo = 0, fecha = NOW() WHERE id = " + this.registros[id].id + ";UPDATE sigma.lotes_historia SET equipo = 0, fecha_entrada = NOW(), fecha_stock = NULL, fecha_proceso = NULL, fecha_salida = NULL, tiempo_total = 0, tiempo_espera = 0, tiempo_stock = 0, tiempo_proceso = 0, alarma_so = 'N', alarma_so_rep = NULL WHERE lote = " + this.registros[id].id + " AND ruta_secuencia = " + this.registros[id].ruta_secuencia + ";UPDATE sigma.calidad_historia SET finaliza = NOW(), tiempo = TIME_TO_SEC(TIMEDIFF(NOW(), inicia)) WHERE lote = " + this.registros[id].id + " AND ISNULL(finaliza)";
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( dato =>
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class";
            mensajeCompleto.mensaje = "El lote se ha retornado al proceso: '" + this.registros[id].nproceso + "' y tendrá alta prioridad";
            mensajeCompleto.tiempo = 3000;
            
            this.servicio.mensajeToast.emit(mensajeCompleto);
            let sentencia = "SELECT numero, parte, proceso FROM sigma.lotes WHERE id = " + this.registros[id].id
            let campos = {accion: 100, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( datoLote =>
            {
                this.registros.splice(id, 1);
                let nuevaFecha = this.datepipe.transform(new Date().setDate(new Date().getDate() +1), "yyyy/MM/dd HH:mm:ss");
                let campos2 = 
                {
                  accion: 3100, 
                  id: 0,  
                  fecha: nuevaFecha, 
                  notas: "Esta prioridad se creó de forma automática por la liberación del lote: " + datoLote[0].numero, 
                  orden: 1,
                  parte: datoLote[0].parte, 
                  proceso: datoLote[0].proceso, 
                  estatus: "A",  
                  usuario: this.servicio.rUsuario().id,
                };
                this.servicio.consultasBD(campos2).subscribe((datos: string) =>{
                })
              })
            })
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class";
          mensajeCompleto.mensaje = "Operación cancelada";
          mensajeCompleto.tiempo = 1500;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
      })

    }

    rechazar(id: number)
    {
      if (this.maestroActual==3)
      {
        this.aInspeccion(id);
        return;
      }
      this.servicio.aEscanear(false);
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "480px", height: "430px", data: { revision: 50, causaD: "", causaC: 0, claves: "", usuarioCalidad: 0, clave: "3", titulo: "ENVIAR LOTE A RECHAZO", mensaje: "", alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Rechazar el lote", icono1: "iconshock-materialblack-general-cancel", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-project-management-problems" }
      });
      respuesta.afterClosed().subscribe(result => {
        if (result.accion == 1) 
        {

          let sentencia = "SELECT * FROM sigma.calidad_historia WHERE lote = " + this.registros[id].id + " AND ISNULL(finaliza)";
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( datoLote =>
          {
            let sentencia = "UPDATE sigma.lotes SET estado = 90, carga = 0, alarma_tse = 'N', alarma_tse_p = 'N', alarma_tse_paso = 'N', alarma_tpe = 'N', alarma_tpe_p = 'N', alarma_tpe_paso = 'N', rechazos = rechazos + 1, rechazo_id = " + result.causaC + ", rechazado_por = " + result.usuarioCalidad + ", rechazo = NOW() WHERE id = " + this.registros[id].id + ";UPDATE sigma.lotes_historia SET rechazos = rechazos + 1 WHERE lote = " + this.registros[id].id + " AND ruta_secuencia = " + this.registros[id].ruta_secuencia + ";UPDATE sigma.calidad_historia SET finaliza = NOW(), tiempo = TIME_TO_SEC(TIMEDIFF(NOW(), inicia)) WHERE id = " + datoLote[0].id + ";INSERT INTO sigma.calidad_historia (lote, secuencia, tipo, parte, inspeccion_id, inspeccionado_por, proceso, equipo, inicia) VALUES(" + datoLote[0].lote + ", " + datoLote[0].secuencia + ", 50, " + datoLote[0].parte + ", " + result.causaC + ", " + result.usuarioCalidad + ", " + datoLote[0].proceso + ", " + datoLote[0].equipo + ", NOW());";
            let campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "custom-class";
              mensajeCompleto.mensaje = "El lote '" + this.registros[id].elote + "' se transfiere a la situación '" + result.causaD + "'";
              mensajeCompleto.tiempo = 4000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              this.registros.splice(id, 1);
            })
          })
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class";
          mensajeCompleto.mensaje = "Operación cancelada";
          mensajeCompleto.tiempo = 1500;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        this.servicio.aEscanear(true);
    })
  }



    aInspeccion(id: number)
    {
      this.servicio.aEscanear(false);
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "480px", height: "430px", data: { revision: 0, causaD: "", causaC: 0, claves: "", usuarioCalidad: 0, clave: "3", titulo: "ENVIAR LOTE A INSPECCIÓN", mensaje: "", alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Transferir lote a Inspección", icono1: "iconshock-materialblack-general-preview2", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-project-management-problems" }
      });
      respuesta.afterClosed().subscribe(result => {
        if (result.accion == 1) 
        {
          let sentencia = "SELECT * FROM sigma.calidad_historia WHERE lote = " + this.registros[id].id + " AND ISNULL(finaliza)";
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( datoLote =>
          {
            sentencia = "UPDATE sigma.lotes SET estado = 80, carga = 0, alarma_tse = 'N', alarma_tse_p = 'N', alarma_tse_paso = 'N', alarma_tpe = 'N', alarma_tpe_p = 'N', alarma_tpe_paso = 'N', inspecciones = inspecciones + 1, inspeccion_id = " + result.causaC + ", inspeccionado_por = " + result.usuarioCalidad + ", inspeccion = NOW() WHERE id = " + this.registros[id].id + ";UPDATE sigma.lotes_historia SET inspecciones = inspecciones + 1 WHERE lote = " + this.registros[id].id + " AND ruta_secuencia = " + this.registros[id].ruta_secuencia + ";UPDATE sigma.calidad_historia SET finaliza = NOW(), tiempo = TIME_TO_SEC(TIMEDIFF(NOW(), inicia)) WHERE id = " + datoLote[0].id + ";INSERT INTO sigma.calidad_historia (lote, secuencia, tipo, parte, inspeccion_id, inspeccionado_por, proceso, equipo, inicia) VALUES(" + datoLote[0].lote + ", " + datoLote[0].secuencia + ", 0, " + datoLote[0].parte + ", " + result.causaC + ", " + result.usuarioCalidad + ", " + datoLote[0].proceso + ", " + datoLote[0].equipo + ", NOW());";
            campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "custom-class";
              mensajeCompleto.mensaje = "El lote '" + this.registros[id].elote + "' se transfiere a la situación '" + result.causaD + "'";
              
              mensajeCompleto.tiempo = 4000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
              this.registros.splice(id, 1);
            })
          })
          
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class";
          mensajeCompleto.mensaje = "Operación cancelada";
          mensajeCompleto.tiempo = 1500;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        this.servicio.aEscanear(true);
    })

    }

    explorar(id: number, nombre: string)
    {    
      this.idNivel0 = id;
      this.nivelActual = 1;
      this.nombreRuta = nombre;
      this.procesarPantalla(2);
    }

    filtro()
    {
      this.soloStock = !this.soloStock;
      this.llenarRegistros();
    }

    filtroCarga()
    {
      this.soloActivas = !this.soloActivas;
      this.llenarRegistros();
    }

    refrescarLote()
    {
      this.verRegistro = 22;
      this.recuperar();
    }
    
}
