import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { ActivatedRoute, GuardsCheckStart } from '@angular/router';
import { trigger, style, animate, transition, query, group, state, stagger } from '@angular/animations';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DialogoComponent } from '../dialogo/dialogo.component';
import { MatDialog, MatSelect } from '@angular/material';
import { ViewportRuler } from "@angular/cdk/overlay";
import { CdkDrag, CdkDragStart, CdkDropList, CdkDropListGroup, CdkDragMove, CdkDragEnter, moveItemInArray } from '@angular/cdk/drag-drop';
import { ThrowStmt } from '@angular/compiler';

@Component({

  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
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

export class HomeComponent implements AfterViewInit, OnInit {

  @ViewChild("txtBuscar", { static: false }) txtBuscar: ElementRef;
  @ViewChild("txtDesde", { static: false }) txtDesde: ElementRef;
  @ViewChild("txtFechaDesde", { static: false }) txtFechaDesde: ElementRef;
  @ViewChild("txtNombre", { static: false }) txtNombre: ElementRef;
  @ViewChild("txtRepetir", { static: false }) txtRepetir: ElementRef;
  @ViewChild("txtAcumular", { static: false }) txtAcumular: ElementRef;
  @ViewChild("txtRepetir0", { static: false }) txtRepetir0: ElementRef;
  @ViewChild("txtRepetir1", { static: false }) txtRepetir1: ElementRef;
  @ViewChild("txtRepetir2", { static: false }) txtRepetir2: ElementRef;
  @ViewChild("txtRepetir3", { static: false }) txtRepetir3: ElementRef;
  @ViewChild("txtAnticipo", { static: false }) txtAnticipo: ElementRef;
  @ViewChild("txtReferencia", { static: false }) txtReferencia: ElementRef;
  @ViewChild("txtCapacidad_proceso", { static: false }) txtCapacidad_proceso: ElementRef;
  @ViewChild("lstProceso", { static: false }) lstProceso: MatSelect;
  @ViewChild("lstProcesos", { static: false }) lstProcesos: MatSelect;
  @ViewChild("lstProceso2", { static: false }) lstProceso2: MatSelect;
  @ViewChild("txtCapacidad_stock", { static: false }) txtCapacidad_stock: ElementRef;
  @ViewChild("txtTiempo_stock", { static: false }) txtTiempo_stock: ElementRef;
  @ViewChild("txtTiempo_proceso", { static: false }) txtTiempo_proceso: ElementRef;
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
    this.vistaCatalogo = this.servicio.vista.subscribe((vista: number)=>
    {
      this.maestroActual = vista - 1;
      if (vista == 1)
      {
        this.indices = [{ nombre: "Procesos", icono: "iconshock-iphone-business-solution"} ];
        this.nivelActual = 1;
      }
      else if (vista == 2)
      {
        this.indices = [{ nombre: "Rutas de fabricación", icono: "iconshock-iphone-business-decision-support-system"} ];
        this.nivelActual = 0;
      }
      else if (vista == 3)
      {
        this.listarRutas();
        this.indices = [{ nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"} ];
        this.nivelActual = 0;
      }
      else if (vista == 4)
      {
        this.indices = [{ nombre: "Recipientes", icono: "iconshock-materialblack-mail-contacts"} ];
        this.nivelActual = 0;
      }
      else if (vista == 5)
      {
        this.listaListas();
        this.indices = [{ nombre: "Alertas", icono: "iconshock-iphone-business-risk"} ];
        this.nivelActual = 0;
      }
      else if (vista == 6)
      {
        this.indices = [{ nombre: "Situaciones", icono: "iconshock-iphone-business-risk-assessment"} ];
        this.nivelActual = 0;
      }
      else if (vista == 7)
      {
        this.indices = [{ nombre: "Horarios", icono: "iconshock-materialblack-general-clock"} ];
        this.nivelActual = 0;
      }
      else if (vista == 8)
      {
        this.indices = [{ nombre: "Usuarios", icono: "iconshock-materialblack-general-group"} ];
        this.nivelActual = 0;
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
    this.target = null;
    this.source = null;
    this.colorear();
    let vista = this.servicio.rVista();
    this.maestroActual = vista - 1;
    if (vista == 1)
    {
      this.indices = [{ nombre: "Procesos", icono: "iconshock-iphone-business-solution"} ];
      this.nivelActual = 1;
    }
    else if (vista == 2)
    {
      this.indices = [{ nombre: "Rutas de fabricación", icono: "iconshock-iphone-business-decision-support-system"} ];
      this.nivelActual = 0;
    }
    else if (vista == 3)
    {
      this.indices = [{ nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"} ];
      this.nivelActual = 0;
    }
    else if (vista == 4)
    {
      this.indices = [{ nombre: "Recipientes", icono: "iconshock-materialblack-mail-contacts"} ];
      this.nivelActual = 0;
    }
    else if (vista == 5)
    {
      this.indices = [{ nombre: "Alertas", icono: "iconshock-iphone-business-risk"} ];
      this.nivelActual = 0;
    }
    else if (vista == 6)
    {
      this.indices = [{ nombre: "Situaciones", icono: "iconshock-iphone-business-risk-assessment"} ];
      this.nivelActual = 0;
    }
    else if (vista == 7)
    {
      this.indices = [{ nombre: "Horarios", icono: "iconshock-materialblack-general-clock"} ];
      this.nivelActual = 0;
    }
    else if (vista == 8)
    {
      this.indices = [{ nombre: "Usuarios", icono: "iconshock-materialblack-general-group"} ];
      this.nivelActual = 0;
    }
    this.verRegistro = (this.verRegistro != 0 ? 1 : 0);   
    this.pantalla = 2;
    this.verRegistro = (this.verRegistro != 0 ? 1 : 0);  
    this.noAnimar = this.servicio.rHuboError();
    this.procesarPantalla(1);  
    this.validarTabla();
  }

  botonera: any = [false, true, true, true, true, true, false, true, true, true, true, false]
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
  ayuda15: string = "Inicializa la contraseña del usuario actual";

  titulos: any = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
  
  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropList;
  public sourceIndex: number;
  public dragIndex: number;
  public activeContainer;
  
  resecuenciar: boolean = false;
  botonera1: boolean = true;
  botonera2: boolean = false;

  segStock: string = "0min";
  segProceso: string = "0min";
  segSetup: string = "0min";
  estatusActual: string = "";
  secuenciaActual: string = "";
  iconoGeneral: string = "";
  
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
  nivelActual: number = 0;
  textoBuscar: string = "";
  detalleRegistro: any = [];
  verBuscar: boolean = false;
  noAnimar: boolean = false;  
  verImagen: boolean = false;
  editando: boolean = false;
  verRegistro: number = 0;
  tiempoRevision: number = 5000;
  seleccionAlerta = [];
  seleccionescalar1 = [];
  seleccionescalar2 = [];
  seleccionescalar3 = [];
  seleccionescalar4 = [];
  seleccionescalar5 = [];
  seleccionProcesos = [];

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
  rutas: any = [];
  equipos: any = [];
  operaciones: any = [];
  procesos: any = [];
  listas: any = [];
  indices: any = [{ nombre: "Procesos", icono: "iconshock-iphone-business-solution"} ]
  cronometro: any;
  

  ngAfterViewInit() {
    let phElement = this.placeholder.element.nativeElement;

    phElement.style.display = 'none';
    phElement.parentNode.removeChild(phElement);
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
    this.servicio.activarSpinner.emit(true);       
    let sentencia = "SELECT a.id, a.nombre, a.capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM det_procesos WHERE proceso = a.id and estatus = 'A'), 0) AS capacidad_proceso, IFNULL(a.modificacion, 'N/A') AS fcambio, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(c.nombre, 'N/A') AS ucambio, a.imagen, 'S' AS mostrarImagen FROM sigma.cat_procesos a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id ORDER BY a.nombre";
    if (this.maestroActual == 0 && this.nivelActual == 0) //Rutas de producción
    {
      this.iconoGeneral = "iconshock-iphone-business-solution";
      this.nuevoRegistro = "Agregar un proceso";
      this.literalSingular = "proceso";
      this.literalPlural = "procesos";
      this.literalSingularArticulo = "El proceso";
      
    }
    if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
    {
      sentencia = "SELECT a.id, a.nombre, a.capacidad AS cuenta, IFNULL(a.modificacion, 'N/A') AS fcambio, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.det_procesos a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.proceso = " + this.idNivel0 + " ORDER BY a.nombre";
      this.iconoGeneral = "iconshock-iphone-business-solution";
      this.nuevoRegistro = "Agregar un equipo";
      this.literalSingular = "equipo";
      this.literalPlural = "equipos";
      this.literalSingularArticulo = "El equipo";
      
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
    {
      sentencia = "SELECT a.id, a.nombre, IFNULL(a.modificacion, 'N/A') AS fcambio, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(c.nombre, 'N/A') AS ucambio, a.imagen, (SELECT COUNT(*) FROM sigma.det_rutas WHERE ruta = a.id) AS cuenta FROM sigma.cat_rutas a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id ORDER BY a.nombre";
      this.nuevoRegistro = "Agregar una ruta de fabricación";
      this.literalSingular = "ruta de fabricación";
      this.literalPlural = "rutas de fabricación";
      this.literalSingularArticulo = "La ruta de fabricación";
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1) //Líneas de producción
    {
      sentencia = "SELECT a.id, a.secuencia, a.nombre, a.tiempo_stock, a.tiempo_proceso, a.tiempo_setup, IFNULL(a.modificacion, 'N/A') AS fcambio, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(c.nombre, 'N/A') AS ucambio, d.imagen, 'S' AS mostrarImagen FROM sigma.det_rutas a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id LEFT JOIN sigma.cat_procesos d ON a.proceso = d.id WHERE a.ruta = " + this.idNivel0 + " ORDER BY a.secuencia";
      this.iconoGeneral = "iconshock-materialblack-project-management-flow";
      this.nuevoRegistro = "Agregar una operación";
      this.literalSingular = "operación";
      this.literalPlural = "operaciones";
      this.literalSingularArticulo = "La operación";
    }
    else if (this.maestroActual == 2 && this.nivelActual == 0) //Rutas de producción
    {
      this.listarRutas();
      this.iconoGeneral = "iconshock-iphone-business-product-combo";
      sentencia = "SELECT a.id, a.referencia, a.nombre, IFNULL(a.modificacion, 'N/A') AS fcambio, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(c.nombre, 'N/A') AS ucambio, a.imagen, 'S' AS mostrarImagen FROM sigma.cat_partes a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id ORDER BY a.nombre";
      this.nuevoRegistro = "Agregar un Número de parte";
      this.literalSingular = "número de parte";
      this.literalPlural = "números de parte";
      this.literalSingularArticulo = "El número de parte";
    }
    else if (this.maestroActual == 3 && this.nivelActual == 0) 
    {
      sentencia = "SELECT a.id, a.nombre, IFNULL(a.modificacion, 'N/A') AS fcambio, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.cat_distribucion a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id ORDER BY a.nombre";
      this.nuevoRegistro = "Agregar un Recipiente";
      this.literalSingular = "recipiente";
      this.literalPlural = "recipientes";
      this.literalSingularArticulo = "El recipiente";
    }
    else if (this.maestroActual == 4 && this.nivelActual == 0) 
    {
      this.listaListas();
      sentencia = "SELECT a.id, a.nombre, IFNULL(a.modificacion, 'N/A') AS fcambio, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.cat_alertas a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id ORDER BY a.nombre";
      this.nuevoRegistro = "Agregar una Alerta";
      this.literalSingular = "alerta";
      this.literalPlural = "alertas";
      this.literalSingularArticulo = "La alerta";
    }
    else if (this.maestroActual == 5 && this.nivelActual == 0) 
    {
      sentencia = "SELECT a.id, IF(a.tipo = 0, 'Calidad', 'Scrap') as tipo, a.nombre, a.referencia, IFNULL(a.modificacion, 'N/A') AS fcambio, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.cat_situaciones a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id ORDER BY a.nombre";
      this.nuevoRegistro = "Agregar una Situación";
      this.literalSingular = "situación";
      this.literalPlural = "situacines";
      this.literalSingularArticulo = "La situación";
    }
    else if (this.maestroActual == 6 && this.nivelActual == 0) 
    {
      this.listarProcesos(1);
      this.iconoGeneral = "iconshock-materialblack-general-clock";
      sentencia = "SELECT a.id, a.desde, a.hasta, a.tipo, a.dia, 'S' AS mostrarImagen, IFNULL(b.nombre, 'CUALQUIER PROCESO') as pnombre, CASE WHEN a.dia = 0 THEN 'Todos los domingos' WHEN a.dia = 1 THEN 'Todos los lunes' WHEN a.dia = 2 THEN 'Todos los martes' WHEN a.dia = 3 THEN 'Todos los miércoles' WHEN a.dia = 4 THEN 'Todos los jueves' WHEN a.dia = 5 THEN 'Todos los viernes' WHEN a.dia = 6 THEN 'Todos los sábados' WHEN a.dia = 9 THEN a.fecha END as nombre, a.proceso FROM sigma.horarios a LEFT JOIN sigma.cat_procesos b ON a.proceso = b.id ORDER BY a.dia";
      this.nuevoRegistro = "Agregar un Horario";
      this.literalSingular = "horario";
      this.literalPlural = "horarios";
      this.literalSingularArticulo = "El horario";
    }
    else if (this.maestroActual == 7 && this.nivelActual == 0) 
    {
      this.iconoGeneral = "iconshock-materialblack-general-group";
      sentencia = "SELECT a.id, a.referencia, a.admin, a.nombre, IFNULL(a.modificacion, 'N/A') AS fcambio, IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(c.nombre, 'N/A') AS ucambio, a.rol, CASE WHEN a.rol = 'A' THEN 'ADMINISTRADOR' WHEN a.rol = 'C' THEN 'SUPERVISOR DE CALIDAD' WHEN a.rol = 'O' THEN 'OPERADOR' WHEN a.rol = 'G' THEN 'GESTOR DE LA APLICACIÓN' END as rolnombre, 'S' AS mostrarImagen FROM sigma.cat_usuarios a LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id ORDER BY a.referencia";
      this.nuevoRegistro = "Agregar un Usuario";
      this.literalSingular = "usuario";
      this.literalPlural = "usuarios";
      this.literalSingularArticulo = "El usuario";
    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if ( JSON.stringify(this.arrFiltrado) != JSON.stringify(resp))
      {
        this.registros = resp;
        this.arrFiltrado = resp;
        this.contarRegs();
        setTimeout(() => {
          this.servicio.activarSpinner.emit(false);    
        }, 300);
        
      }
      else
      {
        setTimeout(() => {
          this.servicio.activarSpinner.emit(false);    
        }, 300);   
      }
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
    let sentencia = "SELECT a.*, IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(a.creacion, 'N/A') AS fcreacion, IFNULL(b.nombre, 'N/A') AS ucreacion, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.cat_procesos a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
    
    if (this.maestroActual == 0 && this.nivelActual == 0)
    {
      //0. Proceso origen de esta operación      
      this.titulos = ["", "1. Nombre", "", "2. Capacidad máxima de lotes en stock", "", "4. Referencia", "5. Imagen", "6. Notas", "7. Estatus del registro", "", "8. Rutas de fabricacion asociadas a este proceso", "9. Números de parte asociados a este proceso", "10. Máquinas/Equipos asociadas a este proceso", "11. Fecha del último cambio", "12. Usuario que realizó el último cambio", "13. Fecha de creación del registro ", "14. Usuario que creó el registro", "15. ID único del registro", "" ]
      this.indices = [{ nombre: "Procesos", icono: "iconshock-iphone-business-solution"}, { nombre: "Equipos", icono: "iconshock-materialblack-networking-lan-cable"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Procesos")
    }
    else if (this.maestroActual == 0 && this.nivelActual == 1)
    {
      this.titulos = ["", "1. Nombre", "", "2. Capacidad máxima de lotes en proceso", "", "3. Referencia", "4. Imagen", "4. Notas", "6. Estatus del registro", "", "7. Rutas de fabricacion asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "7. Fecha del último cambio", "8. Usuario que realizó el último cambio", "9. Fecha de creación del registro ", "10. Usuario que creó el registro", "11. ID único del registro", "5. Permitir la programación", "0. Permitir la programación" ]
      sentencia = "SELECT a.*, IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(a.creacion, 'N/A') AS fcreacion, IFNULL(b.nombre, 'N/A') AS ucreacion, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.det_procesos a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
      this.indices = [{ nombre: "Procesos", icono: "iconshock-iphone-business-solution"}, { nombre: "Equipos", icono: "iconshock-materialblack-networking-lan-cable"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Procesos/Equipamiento")
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0)
    {
      this.titulos = ["", "1. Nombre", "", "2. Capacidad máxima de lotes en proceso", "", "2. Referencia", "4. Imagen", "3. Notas", "4. Estatus del registro", "5. Operaciones asociadas a la ruta de fabricación", "7. Rutas Rutas de fabricacion asociadas a este proceso", "6. Números de parte asociados a esta ruta de fabricación", "9. Máquinas/Equipos asociadas a este proceso", "7. Fecha del último cambio", "8. Usuario que realizó el último cambio", "9. Fecha de creación del registro ", "10. Usuario que creó el registro", "11. ID único del registro", "" ]
      sentencia = "SELECT a.*, IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(a.creacion, 'N/A') AS fcreacion, IFNULL(b.nombre, 'N/A') AS ucreacion, IFNULL(c.nombre, 'N/A') AS ucambio, (SELECT COUNT(*) FROM sigma.det_rutas WHERE ruta = a.id) AS cuenta FROM sigma.cat_rutas a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
      this.indices = [{ nombre: "Rutas de fabricación", icono: "iconshock-iphone-business-decision-support-system"}, { nombre: "Operaciones", icono: "iconshock-materialblack-project-management-flow"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Rutas de fabricación")
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1)
    {
      this.titulos = ["1. Proceso origen de esta operación (requerido)", "2. Nombre", "3. Secuencia de la operación", "2. Capacidad máxima de lotes en proceso", "4. Tiempo de uso por lote", "5. Referencia", "4. Imagen", "6. Notas", "7. Estatus del registro", "", "8. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "8. Fecha del último cambio", "9. Usuario que realizó el último cambio", "10. Fecha de creación del registro ", "11. Usuario que creó el registro", "12. ID único del registro", "0. Ruta de fabricación asociada", "2. Cuentas de correo", "3. Números de teléfono", "3. Recipientes de MMCall" ]
      sentencia = "SELECT a.*, IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(a.creacion, 'N/A') AS fcreacion, IFNULL(b.nombre, 'N/A') AS ucreacion, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.det_rutas a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
      this.indices = [{ nombre: "Rutas de fabricación", icono: "iconshock-iphone-business-decision-support-system"}, { nombre: "Operaciones", icono: "iconshock-materialblack-project-management-flow"} ];
      this.listarProcesos(1);
      this.listarSecuencias();
      this.servicio.mensajeSuperior.emit("Gestión de Rutas de fabricación/Operaciones")
    }
    else if (this.maestroActual == 2 && this.nivelActual == 0)
    {
      this.listarRutas();
      this.titulos = ["", "1. Descripción", "3. Secuencia de la operación", "2. Capacidad máxima de lotes en proceso", "4. Tiempo de uso por lote", "3. Referencia", "4. Imagen", "5. Notas", "6. Estatus del registro", "", "7. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "7. Fecha del último cambio", "8. Usuario que realizó el último cambio", "9. Fecha de creación del registro ", "10. Usuario que creó el registro", "11. ID único del registro", "0. Ruta de fabricación asociada", "2. Ruta de fabricación asociada" ]
      sentencia = "SELECT a.*, IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(a.creacion, 'N/A') AS fcreacion, IFNULL(b.nombre, 'N/A') AS ucreacion, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.cat_partes a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
      this.indices = [{ nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Números de parte")
    }
    else if (this.maestroActual == 3 && this.nivelActual == 0)
    {
      this.titulos = ["1. Proceso origen de esta operación (requerido)", "1. Nombre", "3. Secuencia de la operación", "2. Capacidad máxima de lotes en proceso", "4. Tiempo de uso por lote", "5. Referencia", "4. Imagen", "6. Notas", "7. Estatus del registro", "", "8. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "8. Fecha del último cambio", "9. Usuario que realizó el último cambio", "10. Fecha de creación del registro ", "11. Usuario que creó el registro", "12. ID único del registro", "0. Ruta de fabricación asociada", "", "2. Cuentas de correo", "3. Números de teléfono", "4. Web services a consumir en MMCall" ]
      sentencia = "SELECT a.*, IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(a.creacion, 'N/A') AS fcreacion, IFNULL(b.nombre, 'N/A') AS ucreacion, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.cat_distribucion a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
      this.indices = [{ nombre: "Recipientes", icono: "iconshock-materialblack-mail-contacts"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Recipientes")
    }
    else if (this.maestroActual == 4 && this.nivelActual == 0)
    {
      this.listaListas();
      this.listarProcesos(1);
      this.titulos = ["0. Proceso origen de esta operación (requerido)", "1. Nombre", "3. Secuencia de la operación", "2. Capacidad máxima de lotes en proceso", "4. Tiempo de uso por lote", "12. Referencia", "4. Imagen", "13. Notas", "14. Estatus del registro", "", "8. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "15. Fecha del último cambio", "16. Usuario que realizó el último cambio", "17. Fecha de creación del registro ", "18. Usuario que creó el registro", "19. ID único del registro", "0. Ruta de fabricación asociada", "", "2. Cuentas de correo", "3. Números de teléfono", "4. Web services a consumir en MMCall", "2. Generar nueva alarma con una alerta activa", "2. Tipo de alerta", "4. ALERTA POR ACUMULACIÓN", "4.1 Configurar como alerta por acumulacion", "4.2. Número de eventos a acumular", "4.3. Período de acumulación (0 perpetua)", "4.4. Inicializar el contador una vez generada la alarma", "4.5. Tipo de mensaje a enviar por acumulación", "4.6. Mensaje por repetición", "5. Canal de notificación para la alarma", "6. Recipiente asociado a la alerta", "7. REPETICIÓN DE LA ALERTA", "7.1. Repetir la alarma", "7.2. Lapso de espera para la repetición (en segundos)", "8. ESCALAMIENTO (PRIMER NIVEL)", "8.1. Escalar la alerta", "8.2. Canal de notificación del escalamiento", "8.3. Lapso de espera para el escalamiento (en segundos)", "8.4. Recipiente del escalamiento", "8.5. Repetir el escalamiento", "9. ESCALAMIENTO (SEGUNDO NIVEL)", "9.1. Escalar la alerta", "9.2. Canal de notificación del escalamiento", "9.3. Lapso de espera para el escalamiento (en segundos)", "9.4. Recipiente del escalamiento", "9.5. Repetir el escalamiento", "10. ESCALAMIENTO (ULTIMO NIVEL)", "10.1. Escalar la alerta", "10.2. Canal de notificación del escalamiento", "10.3. Lapso de espera para el escalamiento (en segundos)", "10.4. Recipiente del escalamiento", "10.5. Repetir el escalamiento", "11. Reportar resolución", "7. ANTICIPACIÓN DE LA ALERTA", "7.1. Anticipar la alerta", "7.2. Canal de notificación de la anticipación", "7.3. Lapso de espera para la anticipación (en segundos)", "7.4. Recipiente para la anticipación", "7.5. Repetir la anticipación",   ];
      sentencia = "SELECT a.*, IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(a.creacion, 'N/A') AS fcreacion, IFNULL(b.nombre, 'N/A') AS ucreacion, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.cat_alertas a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
      this.indices = [{ nombre: "Alertas", icono: "iconshock-iphone-business-risk"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Alertas")
    }
    else if (this.maestroActual == 5 && this.nivelActual == 0)
    {
      this.titulos = ["2. Tipo de situación", "1. Nombre", "3. Secuencia de la operación", "2. Capacidad máxima de lotes en proceso", "4. Tiempo de uso por lote", "3. Referencia", "4. Imagen", "4. Notas", "5. Estatus del registro", "", "6. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "6. Máquinas/Equipos asociadas a este proceso", "6. Fecha del último cambio", "7. Usuario que realizó el último cambio", "8. Fecha de creación del registro ", "9. Usuario que creó el registro", "10. ID único del registro", "0. Ruta de fabricación asociada", "", "2. Cuentas de correo", "3. Números de teléfono", "3. Recipientes de MMCall" ]
      sentencia = "SELECT a.*, IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(a.creacion, 'N/A') AS fcreacion, IFNULL(b.nombre, 'N/A') AS ucreacion, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.cat_situaciones a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
      this.indices = [{ nombre: "Situaciones", icono: "iconshock-iphone-business-risk-assessment"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Situaciones")
    }
    else if (this.maestroActual == 6 && this.nivelActual == 0)
    {
      this.listarProcesos(1);
      this.titulos = ["3. Tipo de horario", "5. Hora desde", "6. Hora hasta", "2. Día a aplicar", "4. Fecha específica", "5. Referencia", "4. Imagen", "6. Notas", "7. Estatus del registro", "", "8. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "8. Fecha del último cambio", "9. Usuario que realizó el último cambio", "10. Fecha de creación del registro ", "11. Usuario que creó el registro", "6. ID único del registro", "0. Ruta de fabricación asociada", "", "2. Cuentas de correo", "3. Números de teléfono", "3. Recipientes de MMCall" ]
      sentencia = "SELECT * FROM sigma.horarios WHERE id = " + this.registroActual; 
      this.indices = [{ nombre: "Horarios", icono: "iconshock-materialblack-general-clock"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Situaciones")
    }
    else if (this.maestroActual == 7 && this.nivelActual == 0)
    {
      this.listarProcesos(1);
      this.titulos = ["1. Proceso asociado al horario", "1. Nombre completo del usuario", "5. Hora hasta", "2. Día a aplicar", "3. Fecha específica", "2. Perfil (con el que inician sesión)", "4. Imagen", "10. Notas", "11. Estatus del registro", "", "8. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "12. Fecha del último cambio", "13. Usuario que realizó el último cambio", "14. Fecha de creación del registro ", "15. Usuario que creó el registro", "16. ID único del registro", "0. Ruta de fabricación asociada", "", "2. Cuentas de correo", "3. Números de teléfono", "3. Recipientes de MMCall" ]
      sentencia = "SELECT a.*, IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(a.creacion, 'N/A') AS fcreacion, IFNULL(b.nombre, 'N/A') AS ucreacion, IFNULL(c.nombre, 'N/A') AS ucambio FROM sigma.cat_usuarios a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id WHERE a.id = " + this.registroActual; 
      this.indices = [{ nombre: "Usuarios", icono: "iconshock-materialblack-general-group"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Situaciones")
    }
    
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
        this.servicio.mensajeInferior.emit("Edición de " + this.literalSingular);    
        this.detalleRegistro = resp[0];
        if (this.detalleRegistro.proceso=="0" && (this.maestroActual == 6 || this.maestroActual == 4))
        {
          this.detalleRegistro.proceso = 0;
        }
        
        this.detalleRegistro.fecha = new Date(this.detalleRegistro.fecha)
        this.registroActual = resp[0].id;
        if (this.nivelActual == 1)
        {
          this.detalleRegistro.asociado = this.nombreRuta;
          this.detalleRegistro.asociadoID = this.idNivel0;
        }
        else
        {
          this.nombreRuta = this.detalleRegistro.nombre;
          this.idNivel0 = this.detalleRegistro.id;
        }
        if (this.detalleRegistro.referencia != "ADMIN" || this.despuesBusqueda == 1)
        {
          this.detalleRegistro.admin = "N";
        }
        this.cancelarEdicion = false;
        this.mostrarImagenRegistro = "S";
        this.estatusActual = this.detalleRegistro.estatus;
        this.secuenciaActual = this.detalleRegistro.secuencia;
        this.botonera[3]= false;
        this.botonera[4]= this.detalleRegistro.estatus == "I";
        this.botonera[5]= false;

        if (this.detalleRegistro.sms == "S")
        this.seleccionAlerta.push("S");
        if (this.detalleRegistro.llamada == "S")
        this.seleccionAlerta.push("L");
        if (this.detalleRegistro.correo == "S")
        this.seleccionAlerta.push("C");
        if (this.detalleRegistro.mmcall == "S")
        this.seleccionAlerta.push("M");


        if (this.detalleRegistro.sms1 == "S")
        this.seleccionescalar1.push("S");
        if (this.detalleRegistro.llamada1 == "S")
        this.seleccionescalar1.push("L");
        if (this.detalleRegistro.correo1 == "S")
        this.seleccionescalar1.push("C");
        if (this.detalleRegistro.mmcall1 == "S")
        this.seleccionescalar1.push("M");
        if (this.detalleRegistro.sms2 == "S")
        this.seleccionescalar2.push("S");
        if (this.detalleRegistro.llamada2 == "S")
        this.seleccionescalar2.push("L");
        if (this.detalleRegistro.correo2 == "S")
        this.seleccionescalar2.push("C");
        if (this.detalleRegistro.mmcall2 == "S")
        this.seleccionescalar2.push("M");
        if (this.detalleRegistro.sms3 == "S")
        this.seleccionescalar3.push("S");
        if (this.detalleRegistro.llamada3 == "S")
        this.seleccionescalar3.push("L");
        if (this.detalleRegistro.correo3 == "S")
        this.seleccionescalar3.push("C");
        if (this.detalleRegistro.mmcall3 == "S")
        this.seleccionescalar3.push("M");
        this.calculoSeg(1);
        this.calculoSeg(2);
        this.calculoSeg(3);
        if (this.maestroActual==7)
        {
          this.seleccionProcesos = []; 
          sentencia = "SELECT proceso FROM sigma.relacion_usuarios_operaciones WHERE usuario = " + this.registroActual; 
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp2 =>
          {
            var i;
            for (i = 0; i < +resp2.length; i++ )
            {
              this.seleccionProcesos.push(resp2[i].proceso);  
            }  
          })
        }
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
        this.llenarListas();
    }, 
    error => 
      {
        console.log(error)
      })
  }

  buscarRegistro(accion: number)
  {
    let catalogo = "sigma.cat_procesos"
    if (this.maestroActual == 0 && this.nivelActual == 1) 
    {
      catalogo = "sigma.det_procesos"
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0) //Líneas de producción
    {
      catalogo = "sigma.cat_rutas"
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1) //Líneas de producción
    {
      catalogo = "sigma.det_rutas"
    }
    else if (this.maestroActual == 2 && this.nivelActual == 0) //Líneas de producción
    {
      catalogo = "sigma.cat_partes"
    }
    else if (this.maestroActual == 3 && this.nivelActual == 0) //Líneas de producción
    {
      catalogo = "sigma.cat_distribucion"
    }
    else if (this.maestroActual == 4 && this.nivelActual == 0) //Líneas de producción
    {
      catalogo = "sigma.cat_alertas"
    }
    else if (this.maestroActual == 5 && this.nivelActual == 0) //Líneas de producción
    {
      catalogo = "sigma.cat_situaciones"
    }
    else if (this.maestroActual == 6 && this.nivelActual == 0) //Líneas de producción
    {
      catalogo = "sigma.horarios"
    }
    else if (this.maestroActual == 7 && this.nivelActual == 0) //Líneas de producción
    {
      catalogo = "sigma.cat_usuarios"
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
    if (this.maestroActual == 1 && this.nivelActual == 1)
    {
      if (accion == 2)
      {
        sentencia = "SELECT MIN(secuencia) AS id FROM sigma.det_rutas WHERE ruta = " + this.idNivel0;
      }
      else if (accion == 3)
      {
        sentencia = " SELECT (SELECT secuencia FROM sigma.det_rutas WHERE ruta = " + this.idNivel0 + " AND secuencia > " + this.secuenciaActual + " ORDER BY secuencia ASC LIMIT 1) AS id UNION ALL (SELECT MIN(secuencia) FROM sigma.det_rutas WHERE ruta = " + this.idNivel0 + ") ORDER BY 1 DESC LIMIT 1;"
      }
      else if (accion == 4)
      {
        sentencia  = " SELECT (SELECT MAX(secuencia) FROM sigma.det_rutas WHERE ruta = " + this.idNivel0 + ") AS id UNION ALL (SELECT secuencia FROM sigma.det_rutas WHERE ruta = " + this.idNivel0 + " AND secuencia < " + this.secuenciaActual + " ORDER BY 1 DESC LIMIT 1) ORDER BY 1 ASC LIMIT 1;"
      }
      else if (accion == 5)
      {
        sentencia = " SELECT MAX(secuencia) AS id FROM sigma.det_rutas WHERE ruta = " + this.idNivel0 + ";";
      }
    }
    else if (this.maestroActual == 0 && this.nivelActual == 1)
    {
      if (accion == 2)
      {
        sentencia = "SELECT MIN(id) AS id FROM sigma.det_procesos WHERE proceso = " + this.idNivel0;
      }
      else if (accion == 3)
      {
        sentencia = " SELECT (SELECT id FROM sigma.det_procesos WHERE proceso = " + this.idNivel0 + " AND id > " + this.registroActual + " ORDER BY id ASC LIMIT 1) AS id UNION ALL (SELECT MIN(id) FROM sigma.det_procesos WHERE proceso = " + this.idNivel0 + ") ORDER BY 1 DESC LIMIT 1;"
      }
      else if (accion == 4)
      {
        sentencia  = " SELECT (SELECT MAX(id) FROM sigma.det_procesos WHERE proceso = " + this.idNivel0 + ") AS id UNION ALL (SELECT id FROM sigma.det_procesos WHERE proceso = " + this.idNivel0 + " AND id < " + this.registroActual + " ORDER BY 1 DESC LIMIT 1) ORDER BY 1 ASC LIMIT 1;"
      }
      else if (accion == 5)
      {
        sentencia = " SELECT MAX(id) AS id FROM sigma.det_procesos WHERE proceso = " + this.idNivel0 + ";";
      }
    }
    else
    {
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
    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp[0].id)
      {
        if (this.maestroActual == 1 && this.nivelActual == 1)
        {
          sentencia = " SELECT id FROM sigma.det_rutas WHERE ruta = " + this.idNivel0 + " AND secuencia = " + resp[0].id + ";";
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            this.registroActual = resp[0].id;
            this.recuperar()
          });
        }
        else
        {
          this.registroActual = resp[0].id;
          this.recuperar()
        }
        
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
      
      let sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.actualizaciones WHERE procesos = 'S'";
      if (this.maestroActual == 0 && this.nivelActual == 1)
      {
        sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.actualizaciones WHERE det_procesos = 'S'";
      }
      else if (this.maestroActual == 1 && this.nivelActual == 0)
      {
        sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.actualizaciones WHERE rutas = 'S'";
      }
      else if (this.maestroActual == 1 && this.nivelActual == 1)
      {
        sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.actualizaciones WHERE det_rutas = 'S'";
      }
      else if (this.maestroActual == 2 && this.nivelActual == 0)
      {
        sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.actualizaciones WHERE partes = 'S'";
      }
      else if (this.maestroActual == 3 && this.nivelActual == 0)
      {
        sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.actualizaciones WHERE recipientes = 'S'";
      }
      else if (this.maestroActual == 4 && this.nivelActual == 0)
      {
        sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.actualizaciones WHERE alertas = 'S'";
      }
      else if (this.maestroActual == 5 && this.nivelActual == 0)
      {
        sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.actualizaciones WHERE situaciones = 'S'";
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
            sentencia = "UPDATE sigma.actualizaciones SET procesos = 'N'";
            if (this.maestroActual == 0 && this.nivelActual == 1)
            {
              sentencia = "UPDATE sigma.actualizaciones SET det_procesos = 'N'";
            }
            else if (this.maestroActual == 1 && this.nivelActual == 0)
            {
              sentencia = "UPDATE sigma.actualizaciones SET rutas = 'N'";
            }
            else if (this.maestroActual == 1 && this.nivelActual == 1)
            {
              sentencia = "UPDATE sigma.actualizaciones SET det_rutas = 'N'";
            }
            else if (this.maestroActual == 2 && this.nivelActual == 0)
            {
              sentencia = "UPDATE sigma.actualizaciones SET partes = 'N'";
            }
            else if (this.maestroActual == 3 && this.nivelActual == 0)
            {
              sentencia = "UPDATE sigma.actualizaciones SET recipientes = 'N'";
            }
            else if (this.maestroActual == 4 && this.nivelActual == 0)
            {
              sentencia = "UPDATE sigma.actualizaciones SET alertas = 'N'";
            }
            else if (this.maestroActual == 5 && this.nivelActual == 0)
            {
              sentencia = "UPDATE sigma.actualizaciones SET situaciones = 'N'";
            }
            campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
              {
                //setTimeout(() => {
                //  this.revisar()  
                //}, +this.tiempoRevision);
              })
          }
        },
      error => 
        {
          //setTimeout(() => {
          //  this.revisar()  
         // }, +this.tiempoRevision);
        }
      )
      //setTimeout(() => {
      //  this.revisar()  
      //}, +this.tiempoRevision);
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
    let conRuta = "";
    if (this.maestroActual == 1 && this.nivelActual == 1)
    {
      conRuta =  " para la ruta '" + this.nombreRuta + "'"
    }
    else if (this.maestroActual == 0 && this.nivelActual == 1)
    {
      conRuta =  " para el proceso '" + this.nombreRuta + "'"
    }
    let cadAdicional: string = (this.registros.length != this.arrFiltrado.length ? " (lista filtrada de un total de " + this.arrFiltrado.length + ") " : "");
    let mensaje = "No hay " + this.literalPlural + conRuta;
    if (this.registros.length > 0)
    {
      mensaje = "Hay " + (this.registros.length == 1 ? "un " + this.literalSingular : this.registros.length + " " + this.literalPlural) 
    }
    mensaje = mensaje + " en la vista" + cadAdicional + conRuta
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

  editar(id: number)
  {
    this.registroActual = id;    
    this.despuesBusqueda = 0;
    this.buscarRegistro(1);    
    this.verRegistro = 22;
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
        this.nivelActual = 0;
        this.indices = [];
        
        this.servicio.mensajeSuperior.emit("Gestión de Procesos")
      }
    else if (id == 1 && this.maestroActual == 1)
    {
      this.nivelActual = 0;
      this.indices = [];
      this.servicio.mensajeSuperior.emit("Gestión de Rutas de fabricación")
      
      this.revisar();
    }
    else if (id == 2 && this.maestroActual == 1)
    {
      if (!this.idNivel0 || this.idNivel0 == 0)
      {
        this.idNivel0 = this.registroActual;
      }
      
      this.nivelActual = 1;
    
      this.indices = this.indices = [{ nombre: "Rutas de fabricación", icono: "iconshock-iphone-business-decision-support-system"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Rutas de fabricación/Operaciones")
      this.revisar();
    
    }
    else if (id == 2 && this.maestroActual == 0)
    {
      if (!this.idNivel0 || this.idNivel0 == 0)
      {
        this.idNivel0 = this.registroActual;
      }
      
      this.nivelActual = 1;
    
      this.indices = this.indices = [{ nombre: "Procesos", icono: "iconshock-iphone-business-solution"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Procesos/Equipamiento")
      this.revisar();
    
    }
    else if (id == 1 && this.maestroActual == 2)
    {
      this.nivelActual = 0;
      this.indices = [];
     this.servicio.mensajeSuperior.emit("Gestión de Números de parte")
    }
    else if (id == 1 && this.maestroActual == 3)
    {
      this.nivelActual = 0;
      this.indices = [];
     this.servicio.mensajeSuperior.emit("Gestión de Recipientes")
    }
    else if (id == 1 && this.maestroActual == 4)
    {
      this.nivelActual = 0;
      this.indices = [];
      this.servicio.mensajeSuperior.emit("Gestión de Alertas")
    }
    else if (id == 1 && this.maestroActual == 5)
    {
      this.nivelActual = 0;
      this.indices = [];
      this.servicio.mensajeSuperior.emit("Gestión de Situaciones")
    }
    else if (id == 1 && this.maestroActual == 6)
    {
      this.nivelActual = 0;
      this.indices = [];
      this.servicio.mensajeSuperior.emit("Gestión de Horarios")
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
    let catalogo = "procesos_cabecera"
    let sentenciaR = "SELECT 'Catalogo de procesos', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Nombre del proceso', 'Referencia', 'Capacidad de stock', 'Capacidad de proceso', 'Usuario creador', 'Fecha de creacion', 'Ultimo usuario que modifico', 'Ultima fecha de modificacion', 'Estatus' UNION ALL SELECT a.id, a.nombre, a.referencia, a.capacidad_stock, IFNULL((SELECT SUM(capacidad) FROM det_procesos WHERE proceso = a.id and estatus = 'A'), 0), IFNULL(b.nombre, 'N/A'), IFNULL(a.creacion, 'N/A'), IFNULL(c.nombre, 'N/A'), IFNULL(a.modificacion, 'N/A'), IF(a.estatus = 'A', 'activo', 'inactivo') FROM sigma.cat_procesos a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id"; 
    let sentenciaC = "SELECT COUNT(*) AS cuenta FROM sigma.cat_procesos;";
    if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
    { 
      catalogo = "equipos"
      sentenciaC = "SELECT COUNT(*) AS cuenta FROM sigma.det_procesos;";
      sentenciaR = "SELECT 'Catalogo de equipos (detalle de procesos)', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Nombre del equipo', 'Capacidad', 'Referencia', 'Acepta programacion', 'Nombre del proceso asociado', 'Usuario creador', 'Fecha de creacion', 'Ultimo usuario que modifico', 'Ultima fecha de modificacion', 'Estatus' UNION ALL SELECT a.id, a.nombre, a.capacidad, a.referencia, IF(a.programar = 'S', 'SI', 'NO'), IFNULL(d.nombre, 'N/A'), IFNULL(b.nombre, 'N/A'), IFNULL(a.creacion, 'N/A'), IFNULL(c.nombre, 'N/A'), IFNULL(a.modificacion, 'N/A'), IF(a.estatus = 'A', 'activo', 'inactivo') FROM sigma.det_procesos a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id LEFT JOIN sigma.cat_procesos d ON a.proceso = d.id"; 
          
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
    {
      catalogo = "rutas_fabricacion"
      sentenciaR = "SELECT 'Rutas de fabricacion', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Nombre de la ruta', 'Referencia', 'Primera secuencia activa', 'Ultima secuencia activa', 'Usuario creador', 'Fecha de creacion', 'Ultimo usuario que modifico', 'Ultima fecha de modificacion', 'Estatus' UNION ALL SELECT a.id, a.nombre, a.referencia, a.inicia, a.finaliza, IFNULL(b.nombre, 'N/A'), IFNULL(a.creacion, 'N/A'), IFNULL(c.nombre, 'N/A'), IFNULL(a.modificacion, 'N/A'), IF(a.estatus = 'A', 'activo', 'inactivo') FROM sigma.cat_rutas a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id"; 
      sentenciaC = "SELECT COUNT(*) AS cuenta FROM sigma.cat_rutas;";
      
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1) //Líneas de producción
    {
      catalogo = "operaciones"
      sentenciaC = "SELECT COUNT(*) AS cuenta FROM sigma.det_rutas;";
      sentenciaR = "SELECT 'Catalogo de operaciones (detalle de rutas)', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Nombre de la operacion', 'Secuencia', 'Tiempo de stock (seg)', 'Tiempo de setup (seg)', 'Tiempo de proceso (seg)', 'Nombre la ruta asociada', 'Nombre del proceso asociado', 'Usuario creador', 'Fecha de creacion', 'Ultimo usuario que modifico', 'Ultima fecha de modificacion', 'Estatus' UNION ALL SELECT a.id, a.nombre, a.secuencia, a.tiempo_stock, a.tiempo_setup, a.tiempo_proceso, IFNULL(e.nombre, 'N/A'), IFNULL(d.nombre, 'N/A'), IFNULL(b.nombre, 'N/A'), IFNULL(a.creacion, 'N/A'), IFNULL(c.nombre, 'N/A'), IFNULL(a.modificacion, 'N/A'), IF(a.estatus = 'A', 'activo', 'inactivo') FROM sigma.det_rutas a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id LEFT JOIN sigma.cat_procesos d ON a.proceso = d.id LEFT JOIN sigma.cat_rutas e ON a.ruta = e.id"; 
    }
    else if (this.maestroActual == 2 && this.nivelActual == 0) //Rutas de producción
    {
      catalogo = "numeros_de_parte"
      sentenciaC = "SELECT COUNT(*) AS cuenta FROM sigma.cat_partes;";
      sentenciaR = "SELECT 'Catalogo de Números de parte', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Nombre del numero de parte', 'Referencia', 'Ruta de fabricacion', 'Usuario creador', 'Fecha de creacion', 'Ultimo usuario que modifico', 'Ultima fecha de modificacion', 'Estatus' UNION ALL SELECT a.id, a.nombre, a.referencia, IFNULL(d.nombre, 'N/A'), IFNULL(b.nombre, 'N/A'), IFNULL(a.creacion, 'N/A'), IFNULL(c.nombre, 'N/A'), IFNULL(a.modificacion, 'N/A'), IF(a.estatus = 'A', 'activo', 'inactivo') FROM sigma.cat_partes a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id LEFT JOIN sigma.cat_rutas d ON a.ruta = d.id"; 
    }
    else if (this.maestroActual == 3 && this.nivelActual == 0) 
    {
      catalogo = "recipientes"
      sentenciaC = "SELECT COUNT(*) AS cuenta FROM sigma.cat_distribucion;";
      sentenciaR = "SELECT 'Recipientes (alertas)', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Nombre del recipiente', 'Numeros de telefonos', 'Cuentas de correos', 'Servicios de MMCall', 'Usuario creador', 'Fecha de creacion', 'Ultimo usuario que modifico', 'Ultima fecha de modificacion', 'Estatus' UNION ALL SELECT a.id, a.nombre, a.telefonos, a.correos, a.mmcall, IFNULL(b.nombre, 'N/A'), IFNULL(a.creacion, 'N/A'), IFNULL(c.nombre, 'N/A'), IFNULL(a.modificacion, 'N/A'), IF(a.estatus = 'A', 'activo', 'inactivo') FROM sigma.cat_distribucion a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id"; 
    }
    else if (this.maestroActual == 4 && this.nivelActual == 0) 
    {
    }
    else if (this.maestroActual == 5 && this.nivelActual == 0) 
    {
      catalogo = "situaciones_calidad"
      sentenciaC = "SELECT COUNT(*) AS cuenta FROM sigma.cat_situaciones;";
      sentenciaR = "SELECT 'Situaciones de calidad', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Nombre de la situacion', 'Referencia', 'Tipo de situacion', 'Usuario creador', 'Fecha de creacion', 'Ultimo usuario que modifico', 'Ultima fecha de modificacion', 'Estatus' UNION ALL SELECT a.id, a.nombre, a.referencia, IF(a.tipo = 0, 'Inspeccion', 'Scrap/MERMA'), IFNULL(b.nombre, 'N/A'), IFNULL(a.creacion, 'N/A'), IFNULL(c.nombre, 'N/A'), IFNULL(a.modificacion, 'N/A'), IF(a.estatus = 'A', 'activo', 'inactivo') FROM sigma.cat_situaciones a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id"; 
    }
    else if (this.maestroActual == 6 && this.nivelActual == 0) 
    {
      catalogo = "horarios"
      sentenciaC = "SELECT COUNT(*) AS cuenta FROM sigma.horarios;";
      sentenciaR = "SELECT 'Horarios', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Tipo', 'Proceso asociado', 'Tipo de fecha', 'Dia especifico', 'Hora inicio', 'Hora fin' UNION ALL SELECT a.id, IF(a.tipo = 'S', 'Laborable', 'NO laborable'), IFNULL(b.nombre, 'Todos los procesos'), CASE WHEN a.dia = 0 THEN 'Todos los domingos' WHEN a.dia = 1 THEN 'Todos los lunes' WHEN a.dia = 2 THEN 'Todos los martes' WHEN a.dia = 3 THEN 'Todos los miércoles' WHEN a.dia = 4 THEN 'Todos los jueves' WHEN a.dia = 5 THEN 'Todos los viernes' WHEN a.dia = 6 THEN 'Todos los sábados' WHEN a.dia = 9 THEN 'Dia especifico' END, IF(a.dia = 9, a.fecha, ''), a.desde, a.hasta FROM sigma.horarios a LEFT JOIN sigma.cat_procesos b ON a.proceso = b.id"; 
    }
    else if (this.maestroActual == 7 && this.nivelActual == 0) 
    {
      catalogo = "usuarios"
      sentenciaC = "SELECT COUNT(*) AS cuenta FROM sigma.cat_usuarios;";
      sentenciaR = "SELECT 'Usuarios del sistema', '', '', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha: " + this.servicio.fecha(1, "", "dd-MMM-yyyy HH:mm:ss") + "', '', '', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'id', 'Perfil', 'Nombre del usuario', 'Es usuario ADMIN', 'Rol', 'Acceso a todas las operaciones', 'Acceso a calidad', 'Acceso a reversos de lote', 'Acceso a la programacion (solo lectura)', 'Acceso a los inventarios', 'Usuario creador', 'Fecha de creacion', 'Ultimo usuario que modifico', 'Ultima fecha de modificacion', 'Estatus' UNION ALL SELECT a.id, a.referencia, a.nombre, IF(a.admin = 'S', 'SI', 'NO'), CASE WHEN a.rol = 'A' THEN 'ADMINISTRADOR' WHEN a.rol = 'C' THEN 'SUPERVISOR DE CALIDAD' WHEN a.rol = 'O' THEN 'OPERADOR' WHEN a.rol = 'G' THEN 'GESTOR DE LA APLICACIÓN' END, IF(a.operacion = 'S', 'SI', 'NO'), IF(a.calidad = 'S', 'SI', 'NO'), IF(a.reversos = 'S', 'SI', 'NO'), IF(a.programacion = 'S', 'SI', 'NO'), IF(a.inventario = 'S', 'SI', 'NO'), IFNULL(b.nombre, 'N/A'), IFNULL(a.creacion, 'N/A'), IFNULL(c.nombre, 'N/A'), IFNULL(a.modificacion, 'N/A'), IF(a.estatus = 'A', 'activo', 'inactivo') FROM sigma.cat_usuarios a LEFT JOIN sigma.cat_usuarios b ON a.creado = b.id LEFT JOIN sigma.cat_usuarios c ON a.modificado = c.id"; 
    }
    let campos = {accion: 100, sentencia: sentenciaC};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp[0].cuenta == 0)
      {
        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "400px", data: { titulo: "No se encontraron datos", mensaje: "No se han hallado registros para descargar", alto: "30", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
        });

      }
      else
      {
        let campos = {accion: 150, sentencia: sentenciaR, archivo: 'catalogo_usuario_' + this.servicio.rUsuario().id};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          this.http.get(this.URL_FOLDER + 'catalogo_usuario_' + this.servicio.rUsuario().id + '.csv', {responseType: 'arraybuffer'})
          .subscribe((res) => {
              this.writeContents(res, catalogo + '.csv', 'text/csv'); 
          });
        })
      }
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
    else if (this.maestroActual == 0 && this.nivelActual == 0)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ucambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fcambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.capacidad_stock.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.capacidad_proceso.toLowerCase().indexOf(cadena.toLowerCase()) !== -1          
      )
    }
    else if (this.maestroActual == 0 && this.nivelActual == 1)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ucambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fcambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.cuenta.toLowerCase().indexOf(cadena.toLowerCase()) !== -1          
      )
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ucambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fcambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.cuenta.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ucambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fcambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.cuenta.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.tiempo_stock.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.tiempo_proceso.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }
    else if (this.maestroActual == 2 && this.nivelActual == 0)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ucambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fcambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.referencia.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }  
    else if (this.maestroActual == 3 && this.nivelActual == 0)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ucambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fcambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }       
    else if (this.maestroActual == 4 && this.nivelActual == 0)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ucambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fcambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }   
    else if (this.maestroActual == 5 && this.nivelActual == 0)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.tipo.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ucambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fcambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.referencia.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    } 
    else if (this.maestroActual == 6 && this.nivelActual == 0)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.dia.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.pnombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
      )
    }
    else if (this.maestroActual == 7&& this.nivelActual == 0)
    {
      return this.arrFiltrado.filter(datos => 
          datos.id.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.nombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.rolnombre.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.ucambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.fcambio.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.estatus.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          ||
          datos.referencia.toLowerCase().indexOf(cadena.toLowerCase()) !== -1
          
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
    if (this.detalleRegistro.admin=="S")
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "400px", height: "210px", data: { titulo: "Usuario administrador", mensaje: "La cuenta del administrador NO se puede eliminar", alto: "40", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
      });
      return;
    } 
    let idBuscar = this.registroActual
    let sentencia = "";
    if (this.maestroActual == 0 && this.nivelActual == 0) //Rutas de producción
    {
      sentencia = "SELECT COUNT(*) AS totalr FROM sigma.det_rutas WHERE estatus = 'A' AND proceso = " + idBuscar; 
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
    {
      sentencia = "SELECT COUNT(*) AS totalr FROM sigma.cat_partes WHERE estatus = 'A' AND ruta = " + idBuscar; 
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
    if (this.maestroActual == 0 && this.nivelActual == 0)
    {
      this.indices = [{ nombre: "Procesos", icono: "iconshock-iphone-business-solution"} ];
      this.titulos = ["", "1. Nombre", "", "2. Capacidad máxima de lotes en stock", "", "4. Referencia", "5. Imagen", "6. Notas", "7. Estatus del registro", "", "8. Rutas de fabricacion asociadas a este proceso", "9. Números de parte asociados a este proceso", "10. Máquinas/Equipos asociadas a este proceso", "11. Fecha del último cambio", "12. Usuario que realizó el último cambio", "13. Fecha de creación del registro ", "14. Usuario que creó el registro", "15. ID único del registro", "" ]
      this.servicio.mensajeSuperior.emit("Gestión de Procesos")
    }
    else if (this.maestroActual == 0 && this.nivelActual == 1)
    {
      this.indices = [{ nombre: "Procesos", icono: "iconshock-iphone-business-solution"}, { nombre: "Equipos", icono: "iconshock-materialblack-networking-lan-cable"} ];
      this.titulos = ["", "1. Nombre", "", "2. Capacidad máxima de lotes en proceso", "", "3. Referencia", "4. Imagen", "4. Notas", "6. Estatus del registro", "", "7. Rutas de fabricacion asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "7. Fecha del último cambio", "8. Usuario que realizó el último cambio", "9. Fecha de creación del registro ", "10. Usuario que creó el registro", "11. ID único del registro", "5. Permitir la programación" ]
      this.servicio.mensajeSuperior.emit("Gestión de Procesos/Equipamiento")
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0)
    {
      this.titulos = ["", "1. Nombre", "", "2. Capacidad máxima de lotes en proceso", "", "2. Referencia", "4. Imagen", "3. Notas", "4. Estatus del registro", "5. Operaciones asociadas a la ruta de fabricación", "7. Rutas Rutas de fabricación asociadas a este proceso", "6. Números de parte asociados a esta ruta de fabricación", "9. Máquinas/Equipos asociadas a este proceso", "7. Fecha del último cambio", "8. Usuario que realizó el último cambio", "9. Fecha de creación del registro ", "10. Usuario que creó el registro", "11. ID único del registro", "" ]
      this.indices = [{ nombre: "Rutas de fabricación", icono: "iconshock-iphone-business-decision-support-system"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Rutas de fabricación")
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1)
    {
      this.titulos = ["1. Proceso origen de esta operación (requerido)", "2. Nombre", "3. Secuencia de la operación", "2. Capacidad máxima de lotes en proceso", "4. Tiempo de uso por lote", "5. Referencia", "4. Imagen", "6. Notas", "7. Estatus del registro", "", "8. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "8. Fecha del último cambio", "9. Usuario que realizó el último cambio", "10. Fecha de creación del registro ", "11. Usuario que creó el registro", "12. ID único del registro", "0. Ruta de fabricación asociada" ]
      this.indices = [{ nombre: "Rutas de fabricación", icono: "iconshock-iphone-business-decision-support-system"}, { nombre: "Operaciones", icono: "iconshock-materialblack-project-management-flow"} ];
      this.listarProcesos(0);
      this.listarSecuencias();
      this.detalleRegistro.secuencia = "0";
      this.servicio.mensajeSuperior.emit("Gestión de Rutas de fabricación/Operaciones")
    }
    else if (this.maestroActual == 2 && this.nivelActual == 0)
    {
      this.titulos = ["", "1. Descripción", "3. Secuencia de la operación", "2. Capacidad máxima de lotes en proceso", "4. Tiempo de uso por lote", "3. Referencia", "4. Imagen", "5. Notas", "6. Estatus del registro", "", "7. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "7. Fecha del último cambio", "8. Usuario que realizó el último cambio", "9. Fecha de creación del registro ", "10. Usuario que creó el registro", "11. ID único del registro", "0. Ruta de fabricación asociada", "2. Ruta de fabricación asociada" ]
      this.indices = [{ nombre: "Números de parte", icono: "iconshock-iphone-business-product-combo"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Números de parte")
    }
    else if (this.maestroActual == 3 && this.nivelActual == 0)
    {
      this.titulos = ["1. Proceso origen de esta operación (requerido)", "1. Nombre", "3. Secuencia de la operación", "2. Capacidad máxima de lotes en proceso", "4. Tiempo de uso por lote", "5. Referencia", "4. Imagen", "6. Notas", "7. Estatus del registro", "", "8. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "8. Fecha del último cambio", "9. Usuario que realizó el último cambio", "10. Fecha de creación del registro ", "11. Usuario que creó el registro", "12. ID único del registro", "0. Ruta de fabricación asociada", "", "2. Cuentas de correo", "3. Números de teléfono", "3. Recipientes de MMCall" ]
      this.indices = [{ nombre: "Recipientes", icono: "iconshock-materialblack-mail-contacts"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Recipientes")
    }
    else if (this.maestroActual == 4 && this.nivelActual == 0)
    {
      this.listaListas();
      this.listarProcesos(1);
      this.titulos = ["0. Proceso origen de esta operación (requerido)", "1. Nombre", "3. Secuencia de la operación", "2. Capacidad máxima de lotes en proceso", "4. Tiempo de uso por lote", "12. Referencia", "4. Imagen", "13. Notas", "14. Estatus del registro", "", "8. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "15. Fecha del último cambio", "16. Usuario que realizó el último cambio", "17. Fecha de creación del registro ", "18. Usuario que creó el registro", "19. ID único del registro", "0. Ruta de fabricación asociada", "", "2. Cuentas de correo", "3. Números de teléfono", "4. Web services a consumir en MMCall", "2. Generar nueva alarma con una alerta activa", "2. Tipo de alerta", "4. ALERTA POR ACUMULACIÓN", "4.1 Configurar como alerta por acumulacion", "4.2. Número de eventos a acumular", "4.3. Período de acumulación (0 perpetua)", "4.4. Inicializar el contador una vez generada la alarma", "4.5. Tipo de mensaje a enviar por acumulación", "4.6. Mensaje por repetición", "5. Canal de notificación para la alarma", "6. Recipiente asociado a la alerta", "7. REPETICIÓN DE LA ALERTA", "7.1. Repetir la alarma", "7.2. Lapso de espera para la repetición (en segundos)", "8. ESCALAMIENTO (PRIMER NIVEL)", "8.1. Escalar la alerta", "8.2. Canal de notificación del escalamiento", "8.3. Lapso de espera para el escalamiento (en segundos)", "8.4. Recipiente del escalamiento", "8.5. Repetir el escalamiento", "9. ESCALAMIENTO (SEGUNDO NIVEL)", "9.1. Escalar la alerta", "9.2. Canal de notificación del escalamiento", "9.3. Lapso de espera para el escalamiento (en segundos)", "9.4. Recipiente del escalamiento", "9.5. Repetir el escalamiento", "10. ESCALAMIENTO (ULTIMO NIVEL)", "10.1. Escalar la alerta", "10.2. Canal de notificación del escalamiento", "10.3. Lapso de espera para el escalamiento (en segundos)", "10.4. Recipiente del escalamiento", "10.5. Repetir el escalamiento", "11. Reportar resolución", "7. ANTICIPACIÓN DE LA ALERTA", "7.1. Anticipar la alerta", "7.2. Canal de notificación de la anticipación", "7.3. Lapso de espera para la anticipación (en segundos)", "7.4. Recipiente para la anticipación", "7.5. Repetir la anticipación",   ];
      this.indices = [{ nombre: "Alertas", icono: "iconshock-iphone-business-risk"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Alertas")
    }
     else if (this.maestroActual == 5 && this.nivelActual == 0)
    {
      this.titulos = ["2. Tipo de situación", "1. Nombre", "3. Secuencia de la operación", "2. Capacidad máxima de lotes en proceso", "4. Tiempo de uso por lote", "3. Referencia", "4. Imagen", "4. Notas", "5. Estatus del registro", "", "6. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "6. Máquinas/Equipos asociadas a este proceso", "6. Fecha del último cambio", "7. Usuario que realizó el último cambio", "8. Fecha de creación del registro ", "9. Usuario que creó el registro", "10. ID único del registro", "0. Ruta de fabricación asociada", "", "2. Cuentas de correo", "3. Números de teléfono", "3. Recipientes de MMCall" ]
      this.indices = [{ nombre: "Situaciones", icono: "iconshock-iphone-business-risk-assessment"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Situaciones")
    }
    else if (this.maestroActual == 6 && this.nivelActual == 0)
    {
      this.listarProcesos(1);
      this.titulos = ["3. Tipo de horario", "5. Hora desde", "6. Hora hasta", "2. Día a aplicar", "4. Fecha específica", "5. Referencia", "4. Imagen", "6. Notas", "7. Estatus del registro", "", "8. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "8. Fecha del último cambio", "9. Usuario que realizó el último cambio", "10. Fecha de creación del registro ", "11. Usuario que creó el registro", "6. ID único del registro", "0. Ruta de fabricación asociada", "", "2. Cuentas de correo", "3. Números de teléfono", "3. Recipientes de MMCall" ]
      this.indices = [{ nombre: "Horarios", icono: "iconshock-materialblack-general-clock"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Horarios")
      this.botonera[1] = false;
      this.botonera[2] = false;
      this.editando = true;
      this.cancelarEdicion = true;
      this.faltaMensaje = "No se han guardado los cambios..."
        
    }
    else if (this.maestroActual == 7 && this.nivelActual == 0)
    {
      this.listarProcesos(1);
      this.titulos = ["1. Proceso asociado al horario", "1. Nombre completo del usuario", "5. Hora hasta", "2. Día a aplicar", "3. Fecha específica", "2. Perfil (con el que inician sesión)", "4. Imagen", "10. Notas", "11. Estatus del registro", "", "8. Rutas asociadas a este proceso", "8. Números de parte asociados a este proceso", "9. Máquinas/Equipos asociadas a este proceso", "12. Fecha del último cambio", "13. Usuario que realizó el último cambio", "14. Fecha de creación del registro ", "15. Usuario que creó el registro", "16. ID único del registro", "0. Ruta de fabricación asociada", "", "2. Cuentas de correo", "3. Números de teléfono", "3. Recipientes de MMCall" ]
      this.indices = [{ nombre: "Usuarios", icono: "iconshock-materialblack-general-group"} ];
      this.servicio.mensajeSuperior.emit("Gestión de Usuarios")
      this.botonera[1] = false;
      this.botonera[2] = false;
      this.editando = true;
      this.cancelarEdicion = true;
      this.faltaMensaje = "No se han guardado los cambios..."
        
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
      this.detalleRegistro.proceso = 0;
      this.detalleRegistro.nombre = "";
      this.detalleRegistro.admin = "N";
      this.detalleRegistro.asociado = this.nombreRuta;
      this.detalleRegistro.asociadoID = this.idNivel0;
      this.detalleRegistro.referencia = "";
      this.detalleRegistro.notas = "";
      this.detalleRegistro.operacion = "S";
      this.detalleRegistro.programacion = "N";
      this.detalleRegistro.inventario = "N";
      this.detalleRegistro.calidad = "N";
      this.detalleRegistro.rol = "O";
      this.detalleRegistro.dia = "0";
      this.detalleRegistro.reversos = "N";
      this.seleccionProcesos = [];
      this.detalleRegistro.acumular = "N";
      this.detalleRegistro.acumular_veces = "0";
      this.detalleRegistro.acumular_tiempo = "0";
      this.detalleRegistro.fecha = new Date();
      this.detalleRegistro.acumular_inicializar = "S";
      this.detalleRegistro.reduccion_setup = "S";
      this.detalleRegistro.repetir = "N";
      this.detalleRegistro.repetir0 = "N";
      this.detalleRegistro.repetir1 = "N";
      this.detalleRegistro.repetir2 = "N";
      this.detalleRegistro.repetir3 = "N";
      this.detalleRegistro.escalar1 = "N";
      this.detalleRegistro.escalar2 = "N";
      this.detalleRegistro.escalar3 = "N";

      this.detalleRegistro.repetir_tiempo = "0";
      this.detalleRegistro.acumular_tipo_mensaje = "T";
      this.detalleRegistro.informar_resolucion = "S";
      this.seleccionAlerta = ["M", "C"];
      this.seleccionescalar1 = ["C"];
      this.seleccionescalar2 = ["C"];
      this.seleccionescalar3 = ["C"];
      this.detalleRegistro.tiempo1 = "0";
      this.detalleRegistro.tipo = (this.maestroActual==6 ? "S" : "0");
      this.detalleRegistro.programar = "N";
      this.detalleRegistro.tiempo2 = "0";
      this.detalleRegistro.tiempo3 = "0";
      this.detalleRegistro.tiempo0 = "0";
      this.detalleRegistro.lista = "0"
      this.detalleRegistro.lista1 = "0"
      this.detalleRegistro.lista2 = "0"
      this.detalleRegistro.lista3 = "0"
      this.detalleRegistro.acumular_mensaje= ""
      this.detalleRegistro.fecha = new Date();
      this.detalleRegistro.desde= "00:00:00"
      this.detalleRegistro.hasta= "23:59:59"
      this.detalleRegistro.imagen = "";
      this.detalleRegistro.capacidad_stock = 0;
      this.detalleRegistro.capacidad = 0;
      this.detalleRegistro.tiempo_proceso = 0;
      this.detalleRegistro.tiempo_setup = 0;
      this.detalleRegistro.tiempo_stock = 0;
      this.detalleRegistro.estatus = "A"
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
      if (this.maestroActual!=6)
      {
        this.botonera[1] = true;
        this.botonera[2] = true;
        this.botonera[3] = true;
        this.botonera[4] = true;
        this.botonera[5] = true;
      }
      setTimeout(() => {
        if (this.maestroActual == 1 && this.nivelActual == 1)
        {
          this.lstProceso.focus();
        }
        else if (this.maestroActual == 6 && this.nivelActual == 1)
        {
          this.lstProceso.focus();
        }
        else
        {
          this.txtNombre.nativeElement.focus();
        }
      }, 300);
    } 
  }

  listarProcesos(id: number)
  {
    let sentencia = "SELECT id, nombre FROM sigma.cat_procesos ORDER BY nombre;"
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.procesos = resp;
      if (id == 0)
      {
        if (this.procesos.length > 0)
        {
          this.detalleRegistro.proceso = this.procesos[0].id;
        }
      }       
      
    });
  }
  
  listarRutas()
  {
    let sentencia = "SELECT id, nombre FROM sigma.cat_rutas ORDER BY nombre;"
    this.rutas = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.rutas = resp;
    });
  }

  listaListas()
  {
    let sentencia = "SELECT id, nombre FROM sigma.cat_distribucion ORDER BY nombre;"
    this.listas = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.listas = resp;
    });
  }

  listarSecuencias()
  {
    this.secuencias = [ { id: "-1", nombre: 'Configurar como la primera operación' }, {id: "0", nombre: 'Configurar como la última operación' } ];
    let sentencia = "SELECT COUNT(*) as cuenta FROM sigma.det_rutas WHERE ruta = " + this.idNivel0 + ";";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp[0].cuenta)
      {
        var i;
        for (i = 1; i <= +resp[0].cuenta; i++ )
        {
          this.secuencias.push({ id:  (i + ''), nombre: i });
        }
      }         
    });
  }

  nuevoRegistroGral()
  {
    this.nuevo();    
    this.verRegistro = 22;
  }

  validarTabla()
  {
    let sentencia = "SELECT id FROM sigma.cat_procesos LIMIT 1";
    if (this.maestroActual == 0 && this.nivelActual == 1) 
    {
      sentencia = "SELECT id FROM sigma.det_procesos LIMIT 1";
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0) 
    {
      sentencia = "SELECT id FROM sigma.cat_rutas LIMIT 1";
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1)
    {
      sentencia = "SELECT id FROM sigma.det_rutas LIMIT 1";
    }
    else if (this.maestroActual == 2 && this.nivelActual == 0)
    {
      sentencia = "SELECT id FROM sigma.cat_partes LIMIT 1";
    }
    else if (this.maestroActual == 3 && this.nivelActual == 0)
    {
      sentencia = "SELECT id FROM sigma.cat_distribucion LIMIT 1";
    }
    else if (this.maestroActual == 4 && this.nivelActual == 0)
    {
      sentencia = "SELECT id FROM sigma.cat_alertas LIMIT 1";
    }
    else if (this.maestroActual == 5 && this.nivelActual == 0)
    {
      sentencia = "SELECT id FROM sigma.cat_situaciones LIMIT 1";
    }
    else if (this.maestroActual == 6 && this.nivelActual == 0)
    {
      sentencia = "SELECT id FROM sigma.horarios LIMIT 1";
    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
        if (resp && resp[0].id > 0 && this.botonera[7])
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
      if (!this.detalleRegistro.nombre)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el Nombre del proceso";
      }
      if (!this.detalleRegistro.capacidad_stock || this.detalleRegistro.capacidad_stock == 0)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar la capacidad general de stock (lotes)";
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
          if (!this.detalleRegistro.nombre)
          {
            this.txtNombre.nativeElement.focus()
          }
          else if (!this.detalleRegistro.capacidad_stock || this.detalleRegistro.capacidad_stock == 0)
          {
            this.txtCapacidad_stock.nativeElement.focus()
          }
        }, 100);
      }

    }
    else if (this.maestroActual == 0 && this.nivelActual == 1)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.nombre)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el Nombre de la máquina";
      }
      if (!this.detalleRegistro.capacidad || this.detalleRegistro.capacidad == 0)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar la capacidad de la máquina (lotes)";
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
          if (!this.detalleRegistro.nombre)
          {
            this.txtNombre.nativeElement.focus()
          }
          else if (!this.detalleRegistro.capacidad || this.detalleRegistro.capacidad == 0)
          {
            this.txtCapacidad_proceso.nativeElement.focus()
          }
        }, 100);
      }

    }

    else if (this.maestroActual == 1 && this.nivelActual == 0)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.nombre)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el Nombre de la ruta de fabricación";
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
          if (!this.detalleRegistro.nombre)
          {
            this.txtNombre.nativeElement.focus()
          }
        }, 100);
      }

    }
    else if (this.maestroActual == 1 && this.nivelActual == 1)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.proceso)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el proceso origen";
      }
      else if (!this.detalleRegistro.nombre)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el Nombre de la operación";
      }
      if (!this.detalleRegistro.tiempo_stock || this.detalleRegistro.tiempo_stock == 0)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el tiempo de stock (segundos)";
      }
      if (!this.detalleRegistro.tiempo_proceso || this.detalleRegistro.tiempo_proceso == 0)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el tiempo de proceso (segundos)";
      }
      
      if (errores == 0)
      {
        if (this.detalleRegistro.id != 0 && this.detalleRegistro.estatus == "I" && this.estatusActual == "A")
        {
          this.validarInactivar(this.detalleRegistro.id, 2);            
        } 
        
        else
        {
          if (this.detalleRegistro.id != 0 && this.detalleRegistro.secuencia != this.secuenciaActual)
          {
            const respuesta = this.dialogo.open(DialogoComponent, {
              width: "430px", height: "230px", data: { titulo: "Resecuenciar ruta de fabricación ", mensaje: "El cambio en la secuencia de las operaciones afectará el funcionamiento de las rutas. ¿Desea continuar con esta operación?", alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Continuar y resecuenciar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-mail-block" }
            });
            respuesta.afterClosed().subscribe(result => {
              if (result.accion == 1) 
              {
                this.resecuenciar = true;
                this.guardar();
              }
            });
          
            return;
          } 
          else
          {
            this.guardar();
          }
        }
      }
      else
      {
        setTimeout(() => {
          if (!this.detalleRegistro.proceso)
          {
            this.lstProceso.focus()
          }
          else if (!this.detalleRegistro.nombre)
          {
            this.txtNombre.nativeElement.focus()
          }
          else if (!this.detalleRegistro.tiempo_stock || this.detalleRegistro.tiempo_stock == 0)
          {
            this.txtTiempo_stock.nativeElement.focus()
          }
          else if (!this.detalleRegistro.tiempo_proceso || this.detalleRegistro.tiempo_proceso == 0)
          {
            this.txtTiempo_proceso.nativeElement.focus()
          }

        }, 100);
      }

    }
    else if (this.maestroActual == 2 && this.nivelActual == 0)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.nombre)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar la Descripción del número de parte";
      }
      if (!this.detalleRegistro.ruta)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar la ruta de fabricación asociada";
      }
      if (!this.detalleRegistro.referencia)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar la Referencia (código de barras))";
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
          if (!this.detalleRegistro.nombre)
          {
            this.txtNombre.nativeElement.focus()
          }
          else if (!this.detalleRegistro.ruta)
          {
            this.lstProceso2.focus()
          }
          
          else if (!this.detalleRegistro.referencia)
          {
            this.txtReferencia.nativeElement.focus()
          }
        }, 100);
      }

    }
    else if (this.maestroActual == 3 && this.nivelActual == 0)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.nombre)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el Nombre del recipiente";
      }
      if (!this.detalleRegistro.correos && !this.detalleRegistro.telefonos && !this.detalleRegistro.mmcall)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar una salida válida para el recipiente";
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
          if (!this.detalleRegistro.nombre)
          {
            this.txtNombre.nativeElement.focus()
          }
          else if (!this.detalleRegistro.ruta)
          {
            //eemv
            this.lstProceso2.focus()
          }
        }, 100);
      }

    }
    else if (this.maestroActual == 4 && this.nivelActual == 0)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.nombre)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el Nombre de la alerta";
      }
      if (+this.detalleRegistro.tipo >4 && (!this.detalleRegistro.tiempo0 || this.detalleRegistro.tiempo0 == 0))
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Especifique el tiempo de anticipación para generar la alerta";
      }
      if (!this.seleccionAlerta || this.seleccionAlerta.length == 0)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el canal de notificación";
      }
      if (this.detalleRegistro.acumular =="S" && this.detalleRegistro.acumular_veces == 0 && this.detalleRegistro.acumular_tiempo == 0)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Al acumular las alertas debe especificar la frecuencia o el tiempo ";
      }
      if (this.detalleRegistro.repetir !="N" && (this.detalleRegistro.repetir_tiempo == 0 || !this.detalleRegistro.repetir_tiempo))
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Especifique el lapso de tiempo de espera para la repetición ";
      }
      if (this.detalleRegistro.escalar1 !="N" && this.detalleRegistro.tiempo1 == 0)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Especifique el lapso de tiempo de espera para el primer escalamiento";
      }
      if (this.detalleRegistro.escalar1!="S" && this.detalleRegistro.escalar2 !="N" && this.detalleRegistro.tiempo2 == 0)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Especifique el lapso de tiempo de espera para el segundo escalamiento";
      }
      if (this.detalleRegistro.escalar1!="S" && this.detalleRegistro.escalar2!="S" && this.detalleRegistro.escalar3 !="N" && this.detalleRegistro.tiempo3 == 0)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Especifique el lapso de tiempo de espera para el último escalamiento";
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
          if (!this.detalleRegistro.nombre)
          {
            this.txtNombre.nativeElement.focus()
          }
          if (+this.detalleRegistro.tipo >4 && (!this.detalleRegistro.tiempo0 || this.detalleRegistro.tiempo0 == 0))
          {
            this.txtAnticipo.nativeElement.focus()
          }
          else if (this.detalleRegistro.acumular =="S" && this.detalleRegistro.acumular_veces == 0 && this.detalleRegistro.acumular_tiempo == 0)
          {
            this.txtAcumular.nativeElement.focus()
          }
          else if (this.detalleRegistro.repetir !="N" && this.detalleRegistro.repetir_veces == 0)
          {
            this.txtRepetir.nativeElement.focus()
          }
          else if (this.detalleRegistro.escalar1 !="N" && this.detalleRegistro.tiempo1 == 0)
          {
            this.txtRepetir1.nativeElement.focus()
          }
          else if (this.detalleRegistro.escalar2 !="N" && this.detalleRegistro.tiempo2 == 0)
          {
            this.txtRepetir2.nativeElement.focus()
          }
          else if (this.detalleRegistro.escalar3 !="N" && this.detalleRegistro.tiempo3 == 0)
          {
            this.txtRepetir3.nativeElement.focus()
          }
        }, 100);
      }

    }
    else if (this.maestroActual == 5 && this.nivelActual == 0)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.nombre)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el Nombre de la situación";
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
          if (!this.detalleRegistro.nombre)
          {
            this.txtNombre.nativeElement.focus()
          }
        }, 100);
      }

    }
    else if (this.maestroActual == 6 && this.nivelActual == 0)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (this.detalleRegistro.desde > this.detalleRegistro.hasta)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") La hora desde no puede ser mayor a la hora hasta";
      }
      if (!this.detalleRegistro.fecha && this.detalleRegistro.dia==9)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Especifique la fecha";
      }
      if (errores == 0)
      {
          this.guardar();
      }
      else
      {
        setTimeout(() => {
          if (this.detalleRegistro.desde > this.detalleRegistro.hasta)
          {
            this.txtDesde.nativeElement.focus()
          }
          else 
          {
            this.txtFechaDesde.nativeElement.focus()
          }
        }, 100);
      }


    }
    else if (this.maestroActual == 7 && this.nivelActual == 0)
    {
      let errores = 0;
      this.faltaMensaje = "";
      if (!this.detalleRegistro.nombre)
      {
        errores = errores + 1;
        this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el nombre completo del usuario";
      }
      if (!this.detalleRegistro.referencia)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el perfil (referencia) del usuario";
      }
      if (!this.detalleRegistro.rol)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Falta especificar el rol del usuario";
      }
      if (this.detalleRegistro.rol=="O" && this.seleccionProcesos.length==0)
      {
        errores = errores + 1;
        if (!this.faltaMensaje)
        {
          this.faltaMensaje = "No se ha guardado el registro por el siguiente mensaje: ";
        }
        this.faltaMensaje = this.faltaMensaje + "<br>(" + errores + ") Un usuario operador debe tener al menos un proceso activo";
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
          if (!this.detalleRegistro.nombre)
          {
            this.txtNombre.nativeElement.focus()
          }
          else if (!this.detalleRegistro.referencia)
          {
            this.txtReferencia.nativeElement.focus()
          }
          else if (this.detalleRegistro.rol=="O" && this.seleccionProcesos.length==0)
          {
            this.lstProcesos.focus()
          }
        }, 100);
      }

    }
    
  }

  guardar()
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
    if (this.maestroActual == 0 && this.nivelActual == 0)
    {
      if (!this.detalleRegistro.capacidad_stock)
      {
        this.detalleRegistro.capacidad_stock = 0;
      }
      campos = 
      {
        accion: 1100, 
        id: this.detalleRegistro.id,  
        nombre: this.detalleRegistro.nombre, 
        referencia: (!this.detalleRegistro.referencia ? "" : this.detalleRegistro.referencia), 
        notas: (!this.detalleRegistro.notas ? "" : this.detalleRegistro.notas), 
        capacidad_stock: this.detalleRegistro.capacidad_stock, 
        imagen: (!this.detalleRegistro.imagen ? "" : this.detalleRegistro.imagen), 
        estatus: this.detalleRegistro.estatus,  
        reduccion_setup: this.detalleRegistro.reduccion_setup,  
        usuario: this.servicio.rUsuario().id,
        copiandoDesde: this.copiandoDesde 
      };
    }
    else if (this.maestroActual == 0 && this.nivelActual == 1)
    {
      if (!this.detalleRegistro.ruta || this.detalleRegistro.ruta == 0)
      {
        this.detalleRegistro.ruta = this.idNivel0;
      }
      if (!this.detalleRegistro.capacidad)
      {
        this.detalleRegistro.capacidad = 0;
      }
      campos = 
      {
        accion: 1500, 
        id: this.detalleRegistro.id,  
        proceso: this.detalleRegistro.ruta, 
        nombre: this.detalleRegistro.nombre, 
        referencia: (!this.detalleRegistro.referencia ? "" : this.detalleRegistro.referencia), 
        notas: (!this.detalleRegistro.notas ? "" : this.detalleRegistro.notas), 
        capacidad: this.detalleRegistro.capacidad, 
        estatus: this.detalleRegistro.estatus,  
        programar: this.detalleRegistro.programar,  
        usuario: this.servicio.rUsuario().id
      };
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0)
    {
      campos = 
      {
        accion: 1200, 
        id: this.detalleRegistro.id,  
        nombre: this.detalleRegistro.nombre, 
        referencia: (!this.detalleRegistro.referencia ? "" : this.detalleRegistro.referencia), 
        notas: (!this.detalleRegistro.notas ? "" : this.detalleRegistro.notas), 
        estatus: this.detalleRegistro.estatus,  
        usuario: this.servicio.rUsuario().id,
        copiandoDesde: this.copiandoDesde 
      };
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1)
    {
      if (!this.detalleRegistro.ruta || this.detalleRegistro.ruta == 0)
      {
        this.detalleRegistro.ruta = this.idNivel0;
      }
      if (!this.detalleRegistro.tiempo_proceso)
      {
        this.detalleRegistro.tiempo_proceso = 0;
      }
      if (!this.detalleRegistro.tiempo_stock)
      {
        this.detalleRegistro.tiempo_stock = 0;
      }
      if (!this.detalleRegistro.tiempo_setup)
      {
        this.detalleRegistro.tiempo_setup = 0;
      }
      campos = 
      {
        accion: 1300, 
        id: this.detalleRegistro.id,  
        ruta: this.detalleRegistro.ruta, 
        tiempo_stock: this.detalleRegistro.tiempo_stock, 
        tiempo_proceso: this.detalleRegistro.tiempo_proceso, 
        tiempo_setup: this.detalleRegistro.tiempo_setup, 
        nombre: this.detalleRegistro.nombre, 
        referencia: (!this.detalleRegistro.referencia ? "" : this.detalleRegistro.referencia), 
        notas: (!this.detalleRegistro.notas ? "" : this.detalleRegistro.notas), 
        secuencia: this.detalleRegistro.secuencia, 
        proceso: this.detalleRegistro.proceso, 
        estatus: this.detalleRegistro.estatus,  
        usuario: this.servicio.rUsuario().id 
      };
    }
    else if (this.maestroActual == 2 && this.nivelActual == 0)
    {
      campos = 
      {
        accion: 1700, 
        id: this.detalleRegistro.id,  
        nombre: this.detalleRegistro.nombre, 
        ruta: this.detalleRegistro.ruta, 
        imagen: this.detalleRegistro.imagen, 
        referencia: this.detalleRegistro.referencia, 
        notas: (!this.detalleRegistro.notas ? "" : this.detalleRegistro.notas), 
        estatus: this.detalleRegistro.estatus,  
        usuario: this.servicio.rUsuario().id
      };
    }
    else if (this.maestroActual == 3 && this.nivelActual == 0)
    {
      campos = 
      {
        accion: 1800, 
        id: this.detalleRegistro.id,  
        nombre: this.detalleRegistro.nombre, 
        correos: (!this.detalleRegistro.correos ? "" : this.detalleRegistro.correos), 
        telefonos: (!this.detalleRegistro.telefonos ? "" : this.detalleRegistro.telefonos), 
        mmcall: (!this.detalleRegistro.mmcall ? "" : this.detalleRegistro.mmcall), 
        estatus: this.detalleRegistro.estatus,  
        usuario: this.servicio.rUsuario().id
      };
    }
    else if (this.maestroActual == 4 && this.nivelActual == 0)
    {
      let sms = -1;
      let llamada = -1;
      let mmcall = -1;
      let correo = -1;
      let sms1 = -1;
      let llamada1 = -1;
      let mmcall1 = -1;
      let correo1 = -1;
      let sms2 = -1;
      let llamada2 = -1;
      let mmcall2 = -1;
      let correo2 = -1;
      let sms3 = -1;
      let llamada3 = -1;
      let mmcall3 = -1;
      let correo3 = -1;

      
      if (this.seleccionAlerta)
      {
        sms = this.seleccionAlerta.findIndex(c => c=="S");
        mmcall = this.seleccionAlerta.findIndex(c => c=="M");
        llamada = this.seleccionAlerta.findIndex(c => c=="L");
        correo = this.seleccionAlerta.findIndex(c => c=="C");
      }
      if (this.seleccionescalar1)
      {
        sms1 = this.seleccionescalar1.findIndex(c => c=="S");
        mmcall1 = this.seleccionescalar1.findIndex(c => c=="M");
        llamada1 = this.seleccionescalar1.findIndex(c => c=="L");
        correo1 = this.seleccionescalar1.findIndex(c => c=="C");
      }
      if (this.seleccionescalar2)
      {
        sms2 = this.seleccionescalar2.findIndex(c => c=="S");
        mmcall2 = this.seleccionescalar2.findIndex(c => c=="M");
        llamada2 = this.seleccionescalar2.findIndex(c => c=="L");
        correo2 = this.seleccionescalar2.findIndex(c => c=="C");
      }
      if (this.seleccionescalar3)
      {
        sms3 = this.seleccionescalar3.findIndex(c => c=="S");
        mmcall3 = this.seleccionescalar3.findIndex(c => c=="M");
        llamada3 = this.seleccionescalar3.findIndex(c => c=="L");
        correo3 = this.seleccionescalar3.findIndex(c => c=="C");
      }
      if (!this.detalleRegistro.proceso || this.detalleRegistro.proceso == 0)
      {
        sms3 = this.seleccionescalar3.findIndex(c => c=="S");
        mmcall3 = this.seleccionescalar3.findIndex(c => c=="M");
        llamada3 = this.seleccionescalar3.findIndex(c => c=="L");
        correo3 = this.seleccionescalar3.findIndex(c => c=="C");
      }

      campos = 
      {
        accion: 1900, 
        id: this.detalleRegistro.id,  
        nombre: this.detalleRegistro.nombre, 
        tipo: this.detalleRegistro.tipo, 
        proceso: this.detalleRegistro.proceso, 
        escalar1: this.detalleRegistro.escalar1, 
        escalar2: this.detalleRegistro.escalar2, 
        escalar3: this.detalleRegistro.escalar3, 
        referencia: (!this.detalleRegistro.referencia ? "" : this.detalleRegistro.referencia), 
        notas: (!this.detalleRegistro.notas ? "" : this.detalleRegistro.notas), 
        acumular: this.detalleRegistro.acumular,
        acumular_veces: (!this.detalleRegistro.acumular_veces ? 0 : this.detalleRegistro.acumular_veces), 
        acumular_tiempo: (!this.detalleRegistro.acumular_tiempo ? 0 : this.detalleRegistro.acumular_tiempo), 
        acumular_inicializar: this.detalleRegistro.acumular_inicializar, 
        acumular_tipo_mensaje: (!this.detalleRegistro.acumular_tipo_mensaje ? "" : this.detalleRegistro.acumular_tipo_mensaje), 
        tiempo1: (!this.detalleRegistro.tiempo1 ? 0 : this.detalleRegistro.tiempo1), 
        tiempo2: (!this.detalleRegistro.tiempo2 ? 0 : this.detalleRegistro.tiempo2), 
        tiempo3: (!this.detalleRegistro.tiempo3 ? 0 : this.detalleRegistro.tiempo3), 
        tiempo0: (!this.detalleRegistro.tiempo0 ? 0 : this.detalleRegistro.tiempo0), 
        sms: (sms > -1 ? "S" : "N"), 
        llamada: (llamada > -1 ? "S" : "N"),
        mmcall: (mmcall > -1 ? "S" : "N"),
        correo: (correo > -1 ? "S" : "N"),

        sms1: (sms1 > -1 ? "S" : "N"), 
        llamada1: (llamada1 > -1 ? "S" : "N"),
        mmcall1: (mmcall1 > -1 ? "S" : "N"),
        correo1: (correo1 > -1 ? "S" : "N"),
        sms2: (sms2 > -1 ? "S" : "N"), 
        llamada2: (llamada2 > -1 ? "S" : "N"),
        mmcall2: (mmcall2 > -1 ? "S" : "N"),
        correo2: (correo2 > -1 ? "S" : "N"),
        sms3: (sms3 > -1 ? "S" : "N"), 
        llamada3: (llamada3 > -1 ? "S" : "N"),
        mmcall3: (mmcall3 > -1 ? "S" : "N"),
        correo3: (correo3 > -1 ? "S" : "N"),
        lista: (!this.detalleRegistro.lista ? "0" : this.detalleRegistro.lista),
        lista1: (!this.detalleRegistro.lista1 ? "0" : this.detalleRegistro.lista1),
        lista2: (!this.detalleRegistro.lista2 ? "0" : this.detalleRegistro.lista2),
        lista3: (!this.detalleRegistro.lista3 ? "0" : this.detalleRegistro.lista3),
        lista0: (!this.detalleRegistro.lista0 ? "0" : this.detalleRegistro.lista0),
        acumular_mensaje: (!this.detalleRegistro.acumular_mensaje ? "" : this.detalleRegistro.acumular_mensaje),
        repetir1: this.detalleRegistro.repetir1,
        repetir2: this.detalleRegistro.repetir2,
        repetir3: this.detalleRegistro.repetir3,
        informar_resolucion: this.detalleRegistro.informar_resolucion,
        repetir: this.detalleRegistro.repetir,
        repetir_tiempo: (!this.detalleRegistro.repetir_tiempo ? "0" : this.detalleRegistro.repetir_tiempo),
        estatus: this.detalleRegistro.estatus,  
        usuario: this.servicio.rUsuario().id
      };
    }
    else if (this.maestroActual == 5 && this.nivelActual == 0)
    {
      campos = 
      {
        accion: 2000, 
        id: this.detalleRegistro.id,  
        nombre: this.detalleRegistro.nombre, 
        tipo: this.detalleRegistro.tipo, 
        referencia: this.detalleRegistro.referencia, 
        estatus: this.detalleRegistro.estatus,  
        usuario: this.servicio.rUsuario().id
      };
    }
    else if (this.maestroActual == 6 && this.nivelActual == 0)
    {
      if (!this.detalleRegistro.desde)
      {
        this.detalleRegistro.desde ="00:00:00";
      }
      if (!this.detalleRegistro.hasta)
      {
        this.detalleRegistro.hasta ="23:59:59";
      }
      campos = 
      {
        accion: 2100, 
        id: this.detalleRegistro.id,  
        dia: this.detalleRegistro.dia, 
        proceso: this.detalleRegistro.proceso, 
        tipo: this.detalleRegistro.tipo, 
        desde: this.detalleRegistro.desde, 
        hasta: this.detalleRegistro.hasta, 
        fecha: this.servicio.fecha(2, this.detalleRegistro.fecha, "yyyy/MM/dd"),
      };
    }

    else if (this.maestroActual == 7 && this.nivelActual == 0)
    {
      if (!this.detalleRegistro.rol)
      {
        this.detalleRegistro.rol = "O";
      }
      campos = 
      {
        accion: 2200, 
        id: this.detalleRegistro.id,  
        nombre: this.detalleRegistro.nombre, 
        notas: this.detalleRegistro.notas, 
        rol: this.detalleRegistro.rol, 
        programacion: this.detalleRegistro.programacion, 
        inventario: this.detalleRegistro.inventario, 
        reversos: this.detalleRegistro.reversos, 
        referencia: this.detalleRegistro.referencia, 
        calidad: this.detalleRegistro.calidad, 
        operacion: this.detalleRegistro.operacion, 
        estatus: this.detalleRegistro.estatus,  
        usuario: this.servicio.rUsuario().id
      };
    }
    this.servicio.consultasBD(campos).subscribe((datos: string) =>{
    if (datos)
    {
      sentencia = "";
      if (datos.substring(0, 1) == "A")
      {
        this.listarSecuencias();
        this.detalleRegistro.id = +datos.substring(1, 10);
        if (this.detalleRegistro.secuencia == -1)
        {
          sentencia = "UPDATE sigma.det_rutas SET secuencia = secuencia + 1 WHERE ruta = " + this.idNivel0 + ";UPDATE sigma.det_rutas SET secuencia = 1 WHERE id = " + this.detalleRegistro.id +";";
        }
        else if (this.detalleRegistro.secuencia == 0)
        {
          sentencia = "SET @nuevaSecuencia:= (SELECT COUNT(*) FROM sigma.det_rutas WHERE ruta = " + this.idNivel0 + ");UPDATE sigma.det_rutas SET secuencia = @nuevaSecuencia WHERE id = " + this.detalleRegistro.id +";";
        }
        else if (this.maestroActual == 1 && this.nivelActual == 1)
        {
          sentencia = "UPDATE sigma.det_rutas SET secuencia = secuencia + 1 WHERE ruta = " + this.idNivel0 + " AND secuencia >= " + this.detalleRegistro.secuencia + ";UPDATE sigma.det_rutas SET secuencia = " + this.detalleRegistro.secuencia + " WHERE id = " + this.detalleRegistro.id +";";
        }
      }
      else
      {
        if (this.detalleRegistro.secuencia == -1)
        {
          sentencia = "UPDATE sigma.det_rutas SET secuencia = secuencia + 1 WHERE ruta = " + this.idNivel0 + " AND secuencia < " + this.secuenciaActual + ";UPDATE sigma.det_rutas SET secuencia = 1 WHERE id = " + this.detalleRegistro.id +";";
        }
        else if (this.detalleRegistro.secuencia == 0)
        {
          sentencia = "UPDATE sigma.det_rutas SET secuencia = secuencia - 1 WHERE ruta = " + this.idNivel0 + " AND secuencia > " + this.secuenciaActual + ";UPDATE sigma.det_rutas SET secuencia = (SELECT COUNT(*) FROM sigma.det_rutas WHERE ruta = " + this.idNivel0 + ") WHERE id = " + this.detalleRegistro.id +";";
        }
        else if (this.detalleRegistro.secuencia > this.secuenciaActual)
        {
          sentencia = "UPDATE sigma.det_rutas SET secuencia = secuencia - 1 WHERE ruta = " + this.idNivel0 + " AND secuencia > " + this.secuenciaActual + " AND secuencia <= " + this.detalleRegistro.secuencia +";UPDATE sigma.det_rutas SET secuencia = " + this.detalleRegistro.secuencia + " WHERE id = " + this.detalleRegistro.id +";";
        }
        else if (this.detalleRegistro.secuencia < this.secuenciaActual)
        {
          sentencia = "UPDATE sigma.det_rutas SET secuencia = secuencia + 1 WHERE ruta = " + this.idNivel0 + " AND secuencia >= " + this.detalleRegistro.secuencia + " AND secuencia < " + this.secuenciaActual +";UPDATE sigma.det_rutas SET secuencia = " + this.detalleRegistro.secuencia + " WHERE id = " + this.detalleRegistro.id +";";
        }
        
      }
      if (sentencia)
      {
        
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          sentencia = "SELECT secuencia FROM sigma.det_rutas WHERE id = " + this.detalleRegistro.id +";";
          campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            this.detalleRegistro.secuencia = resp[0].secuencia + '';
            this.secuenciaActual = this.detalleRegistro.secuencia;
          });

        })  
      }
      this.resecuenciar = false;
      
      if (datos.substring(0, 1) == "A")
      {
        this.detalleRegistro.id = +datos.substring(1, 10);
        this.registroActual = this.detalleRegistro.id
        this.detalleRegistro.ucreacion = (this.servicio.rUsuario().nombre ? this.servicio.rUsuario().nombre : "N/A");
        this.detalleRegistro.fcreacion = new Date(); 
        this.llenarListas();
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
      sentencia = "UPDATE sigma.actualizaciones SET procesos = 'S'";
      if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
      {
        sentencia = "UPDATE sigma.actualizaciones SET det_procesos = 'S'"
      }
      else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
      {
        sentencia = "UPDATE sigma.actualizaciones SET rutas = 'S'"
      }
      else if (this.maestroActual == 1 && this.nivelActual == 1) //Rutas de producción
      {
        sentencia = "UPDATE sigma.actualizaciones SET det_rutas = 'S'"
      }
      else if (this.maestroActual == 2 && this.nivelActual == 0) //Rutas de producción
      {
        sentencia = "UPDATE sigma.actualizaciones SET partes = 'S'"
      }
      else if (this.maestroActual == 3 && this.nivelActual == 0) //Rutas de producción
      {
        sentencia = "UPDATE sigma.actualizaciones SET recipientes = 'S'"
      }
      else if (this.maestroActual == 4 && this.nivelActual == 0) //Rutas de producción
      {
        sentencia = "UPDATE sigma.actualizaciones SET alertas = 'S'"
      }
      else if (this.maestroActual == 5 && this.nivelActual == 0) //Rutas de producción
      {
        sentencia = "UPDATE sigma.actualizaciones SET situaciones = 'S'"
      }
      else if (this.maestroActual == 7 && this.nivelActual == 0) //Rutas de producción
      {
        sentencia = "DELETE FROM sigma.relacion_usuarios_operaciones WHERE usuario = " + this.detalleRegistro.id
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
        else if (this.maestroActual == 7 && this.seleccionProcesos.length>0)
        {
          let cadAgregar = "INSERT INTO relacion_usuarios_operaciones (usuario, proceso) VALUES"
          var i;
          for (i = 0; i < this.seleccionProcesos.length; i++ )
          {
            cadAgregar = cadAgregar + "(" + this.detalleRegistro.id + ", " + this.seleccionProcesos[i] + "),";  
          }
          cadAgregar = cadAgregar.substr(0, cadAgregar.length - 1) + ";";
          let campos = {accion: 200, sentencia: cadAgregar};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
          });
        }
      })
    }})
  }
  
  llenarListas()
  {
    let sentencia = "SELECT c.id, c.referencia, c.nombre, c.estatus FROM sigma.det_rutas a LEFT JOIN sigma.cat_partes c ON a.ruta = c.ruta WHERE a.proceso = " + this.registroActual + " GROUP BY c.id, c.referencia, c.nombre, c.estatus ORDER BY c.nombre"
    if (this.maestroActual == 1 && this.nivelActual == 0) 
    {
      sentencia = "SELECT id, referencia, nombre, estatus FROM sigma.cat_partes WHERE ruta = " + this.registroActual + " ORDER BY nombre"
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1) 
    {
      sentencia = "SELECT id, referencia, nombre, estatus FROM sigma.cat_partes WHERE ruta = " + this.idNivel0 + " ORDER BY nombre"
    }
    this.partes = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.partes = resp;          
      setTimeout(() => {
        if (this.maestroActual == 1 && this.nivelActual == 1)
        {
          if (this.lstProceso)
          {
            this.lstProceso.focus();  
          }
        }
        else
        {
          this.txtNombre.nativeElement.focus();
        }
      }, 300);
    });
    if (this.maestroActual == 0 && this.nivelActual == 0) 
    {
      sentencia = "SELECT a.id, a.nombre, a.estatus FROM sigma.cat_rutas a LEFT JOIN sigma.det_rutas b ON a.id = b.ruta WHERE b.proceso = " + this.registroActual + " GROUP BY a.id, a.nombre, a.estatus ORDER BY a.id;"
    }
    else if (this.maestroActual == 0 && this.nivelActual == 1) 
    {
      sentencia = "SELECT a.id, a.nombre, a.estatus FROM sigma.cat_procesos a LEFT JOIN sigma.det_procesos b ON a.id = b.proceso WHERE b.proceso = " + this.registroActual + " GROUP BY a.id, a.nombre, a.estatus ORDER BY a.id;"
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0) 
    {
      sentencia = "SELECT id, secuencia, nombre, estatus FROM sigma.det_rutas WHERE ruta = " + this.registroActual + " ORDER BY secuencia;"
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1) 
    {
      sentencia = "SELECT a.id, a.nombre, a.estatus FROM sigma.cat_rutas a LEFT JOIN sigma.det_rutas b ON a.id = b.ruta WHERE b.id = " + this.registroActual + " GROUP BY a.id, a.nombre, a.estatus ORDER BY a.id;"
    }
    
    this.operaciones = [];
    campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.operaciones = resp;          
    });
    sentencia = "SELECT id, nombre, capacidad, estatus FROM sigma.det_procesos WHERE proceso = " + this.registroActual + " ORDER BY nombre;"
    this.equipos = [];
    campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.equipos = resp;          
    });
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
    this.detalleRegistro.tipo = (this.maestroActual==6 ? "S" : "0");
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
      if (this.maestroActual == 1 && this.nivelActual == 1)
      {
        this.lstProceso.focus();
      }
      else
      {
        this.txtNombre.nativeElement.focus();
      }
    }, 300);
    
  }

  validarInactivar(id: number, accion: number)
  {
    if (this.detalleRegistro.admin=="S")
    {
      const respuesta = this.dialogo.open(DialogoComponent, {
        width: "400px", height: "210px", data: { titulo: "Usuario administrador", mensaje: "La cuenta del administrador NO se puede inactivar", alto: "40", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
      });
      return;
    }
    let idBuscar = (id == 0 ? this.registroActual : id);
    let sentencia = "";
    if (this.maestroActual == 0 && this.nivelActual == 0) //Rutas de producción
    {
      sentencia = "SELECT COUNT(*) AS totalr FROM sigma.det_rutas WHERE estatus = 'A' AND proceso = " + idBuscar; 
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
    {
      sentencia = "SELECT COUNT(*) AS totalr FROM sigma.cat_partes WHERE estatus = 'A' AND ruta = " + idBuscar; 
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

  Inactivar(idBuscar: number)
  {
    let mensaje = "Esta acción inhabilitará el proceso seleccionado.<br>¿Desea continuar con la operación?";
    if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
    {
      mensaje = "Esta acción inhabilitará el equipo seleccionado.<br>¿Desea continuar con la operación?";
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
    {
      mensaje = "Esta acción inhabilitará la ruta de fabricación seleccionada.<br>¿Desea continuar con la operación?";
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1)
    {
      mensaje = "Esta acción inhabilitará la operación de fabricación seleccionada.<br>¿Desea continuar con la operación?";
    }
    else if (this.maestroActual == 2 && this.nivelActual == 0)
    {
      mensaje = "Esta acción inhabilitará el Número de parte seleccionado.<br>¿Desea continuar con la operación?";
    }
    else if (this.maestroActual == 3 && this.nivelActual == 0)
    {
      mensaje = "Esta acción inhabilitará el Recipiente seleccionado.<br>¿Desea continuar con la operación?";
    }
    else if (this.maestroActual == 4 && this.nivelActual == 0)
    {
      mensaje = "Esta acción inhabilitará la alerta seleccionada.<br>¿Desea continuar con la operación?";
    }
    else if (this.maestroActual == 5 && this.nivelActual == 0)
    {
      mensaje = "Esta acción inhabilitará la situación seleccionada.<br>¿Desea continuar con la operación?";
    }
    else if (this.maestroActual == 7 && this.nivelActual == 0)
    {
      mensaje = "Esta acción inhabilitará el usuario seleccionado.<br>¿Desea continuar con la operación?";
    }
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "430px", height: "230px", data: { titulo: "Inactivar " + this.literalSingular, mensaje: mensaje, alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Continuar e inactivar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-mail-block" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        let sentencia = "UPDATE sigma.cat_procesos SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
        {
          sentencia = "UPDATE sigma.det_procesos SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
        {
          sentencia = "UPDATE sigma.cat_rutas SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 1 && this.nivelActual == 1)
        {
          sentencia = "UPDATE sigma.det_rutas SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 2 && this.nivelActual == 0)
        {
          sentencia = "UPDATE sigma.cat_partes SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 3 && this.nivelActual == 0)
        {
          sentencia = "UPDATE sigma.cat_distribucion SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 4 && this.nivelActual == 0)
        {
          sentencia = "UPDATE sigma.cat_alertas SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 5 && this.nivelActual == 0)
        {
          sentencia = "UPDATE sigma.cat_situaciones SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 7 && this.nivelActual == 0)
        {
          sentencia = "UPDATE sigma.cat_usuarios SET estatus = 'I', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + " WHERE id = " + idBuscar + ";"
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
          sentencia = "UPDATE sigma.actualizaciones SET procesos = 'S'";
          if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
          {
            sentencia = "UPDATE sigma.actualizaciones SET det_procesos = 'S'"
          }
          else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
          {
            sentencia = "UPDATE sigma.actualizaciones SET rutas = 'S'"
          }
          else if (this.maestroActual == 1 && this.nivelActual == 1) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET det_rutas = 'S'"
          }
          else if (this.maestroActual == 2 && this.nivelActual == 0) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET partes = 'S'"
          }
          else if (this.maestroActual == 3 && this.nivelActual == 0) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET recipientes = 'S'"
          }
          else if (this.maestroActual == 4 && this.nivelActual == 0) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET alertas = 'S'"
          }
          else if (this.maestroActual == 5 && this.nivelActual == 0) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET situaciones = 'S'"
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
              let sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_procesos a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
              {
                sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.det_procesos a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
              {
                sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_rutas a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              else if (this.maestroActual == 1 && this.nivelActual == 1)
              {
                sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.det_rutas a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              else if (this.maestroActual == 2 && this.nivelActual == 0)
              {
                sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_partes a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              else if (this.maestroActual == 3 && this.nivelActual == 0)
              {
                sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_distribucion a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              else if (this.maestroActual == 4 && this.nivelActual == 0)
              {
                sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_alertas a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              else if (this.maestroActual == 5 && this.nivelActual == 0)
              {
                sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_situaciones a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
              }
              else if (this.maestroActual == 7 && this.nivelActual == 0)
              {
                sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_usuarios a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
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
    let mensaje = "Esta acción eliminará el proceso seleccionado.<br>¿Desea continuar con la operación?"
    if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
    {
      mensaje = "Esta acción eliminará el equipo seleccionado.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
    {
      mensaje = "Esta acción eliminará la ruta de fabricación seleccionada y sus operaciones.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1)
    {
      mensaje = "Esta acción eliminará la operación de fabricación seleccionada.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 2 && this.nivelActual == 0)
    {
      mensaje = "Esta acción eliminará el número de parte seleccionado.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 3 && this.nivelActual == 0)
    {
      mensaje = "Esta acción eliminará el recipiente seleccionado.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 4 && this.nivelActual == 0)
    {
      mensaje = "Esta acción eliminará la alerta seleccionada.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 5 && this.nivelActual == 0)
    {
      mensaje = "Esta acción eliminará la situación seleccionada.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 7 && this.nivelActual == 0)
    {
      mensaje = "Esta acción eliminará el usuario seleccionado.<br>¿Desea continuar con la operación?"
    }
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "430px", height: "230px", data: { titulo: "Eliminar " + this.literalSingular, mensaje: mensaje, alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Continuar y eliminar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-general-trash-can" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        let sentencia = "DELETE FROM sigma.cat_procesos WHERE id = " + idBuscar + ";;DELETE FROM sigma.det_procesos WHERE proceso = " + idBuscar + ";";
        if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
        {
          sentencia = "DELETE FROM sigma.det_procesos WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
        {
          sentencia = "DELETE FROM sigma.cat_rutas WHERE id = " + idBuscar + ";DELETE FROM sigma.det_rutas WHERE ruta = " + idBuscar + ";"
        }
        else if (this.maestroActual == 1 && this.nivelActual == 1) 
        {
          sentencia = "DELETE FROM sigma.det_rutas WHERE id = " + idBuscar + ";";
        }
        else if (this.maestroActual == 2 && this.nivelActual == 0) 
        {
          sentencia = "DELETE FROM sigma.cat_partes WHERE id = " + idBuscar + ";";
        }
        else if (this.maestroActual == 3 && this.nivelActual == 0) 
        {
          sentencia = "DELETE FROM sigma.cat_distribucion WHERE id = " + idBuscar + ";";
        }
        else if (this.maestroActual == 4 && this.nivelActual == 0) 
        {
          sentencia = "DELETE FROM sigma.cat_alertas WHERE id = " + idBuscar + ";";
        }
        else if (this.maestroActual == 5 && this.nivelActual == 0) 
        {
          sentencia = "DELETE FROM sigma.cat_situaciones WHERE id = " + idBuscar + ";";
        }
        else if (this.maestroActual == 6 && this.nivelActual == 0) 
        {
          sentencia = "DELETE FROM sigma.horarios WHERE id = " + idBuscar + ";";
        }
        else if (this.maestroActual == 7 && this.nivelActual == 0) 
        {
          sentencia = "DELETE FROM sigma.cat_usuarios WHERE id = " + idBuscar + ";";
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
          sentencia = "UPDATE sigma.actualizaciones SET procesos = 'S';";
          if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
          {
            sentencia = "UPDATE sigma.actualizaciones SET det_procesos = 'S';"
          }
          else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
          {
            sentencia = "UPDATE sigma.actualizaciones SET rutas = 'S';"
          }
          else if (this.maestroActual == 1 && this.nivelActual == 1) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET det_rutas = 'S';"
          }
          else if (this.maestroActual == 2 && this.nivelActual == 0) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET partes = 'S';"
          }
          else if (this.maestroActual == 3 && this.nivelActual == 0) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET recipientes = 'S';"
          }
          else if (this.maestroActual == 4 && this.nivelActual == 0) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET alertas = 'S';"
          }
          else if (this.maestroActual == 5 && this.nivelActual == 0) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET situaciones = 'S';"
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
    let mensaje = "Esta acción reactivará el proceso seleccionado.<br>¿Desea continuar con la operación?"
    if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
    {
      mensaje = "Esta acción reactivará el equipo seleccionado.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
    {
      mensaje = "Esta acción reactivará la ruta de fabricación seleccionada.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 1 && this.nivelActual == 1)
    {
      mensaje = "Esta acción reactivará la operación de fabricación seleccionada.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 2 && this.nivelActual == 0)
    {
      mensaje = "Esta acción reactivará el número de parte seleccionado.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 3 && this.nivelActual == 0)
    {
      mensaje = "Esta acción reactivará el recipiente seleccionado.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 4 && this.nivelActual == 0)
    {
      mensaje = "Esta acción reactivará la alerta seleccionada.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 5 && this.nivelActual == 0)
    {
      mensaje = "Esta acción reactivará la situación seleccionada.<br>¿Desea continuar con la operación?"
    }
    else if (this.maestroActual == 7 && this.nivelActual == 0)
    {
      mensaje = "Esta acción reactivará el usuario seleccionado.<br>¿Desea continuar con la operación?"
    }
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "430px", height: "230px", data: { titulo: "Reactivar " + this.literalSingular, mensaje: mensaje, alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Reactivar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-mail-block" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        let sentencia = "UPDATE sigma.cat_procesos SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + "  WHERE id = " + idBuscar + ";"
        if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
        {
          sentencia = "UPDATE sigma.det_procesos SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + "  WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
        {
          sentencia = "UPDATE sigma.cat_rutas SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + "  WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 1 && this.nivelActual == 1) 
        {
          sentencia = "UPDATE sigma.det_rutas SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + "  WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 2 && this.nivelActual == 0) 
        {
          sentencia = "UPDATE sigma.cat_partes SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + "  WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 3 && this.nivelActual == 0) 
        {
          sentencia = "UPDATE sigma.cat_distribucion SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + "  WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 4 && this.nivelActual == 0) 
        {
          sentencia = "UPDATE sigma.cat_alertas SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + "  WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 5 && this.nivelActual == 0) 
        {
          sentencia = "UPDATE sigma.cat_situaciones SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + "  WHERE id = " + idBuscar + ";"
        }
        else if (this.maestroActual == 7 && this.nivelActual == 0) 
        {
          sentencia = "UPDATE sigma.cat_usuarios SET estatus = 'A', modificacion = NOW(), modificado = " + this.servicio.rUsuario().id + "  WHERE id = " + idBuscar + ";"
        }
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe(resp =>
        {
          let indice = this.registros.findIndex(c => c.id == idBuscar);
          {
            let sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_procesos a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
            if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
            {
              sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.det_procesos a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
            }
            else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
            {
              sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_rutas a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
            }
            else if (this.maestroActual == 1 && this.nivelActual == 1)
            {
              sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.det_rutas a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
            }
            else if (this.maestroActual == 2 && this.nivelActual == 0)
            {
              sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_partes a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
            }
            else if (this.maestroActual == 3 && this.nivelActual == 0)
            {
              sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_distribucion a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
            }
            else if (this.maestroActual == 4 && this.nivelActual == 0)
            {
              sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_alertas a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
            }
            else if (this.maestroActual == 5 && this.nivelActual == 0)
            {
              sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_situaciones a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
            }
            else if (this.maestroActual == 7 && this.nivelActual == 0)
            {
              sentencia = "SELECT IFNULL(a.modificacion, 'N/A') AS fcambio, IFNULL(b.nombre, 'N/A') AS ucambio FROM sigma.cat_usuarios a LEFT JOIN sigma.cat_usuarios b ON a.modificado = b.id WHERE a.id = " + idBuscar; 
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
          sentencia = "UPDATE sigma.actualizaciones SET procesos = 'S'";
          if (this.maestroActual == 0 && this.nivelActual == 1) //Rutas de producción
          {
            sentencia = "UPDATE sigma.actualizaciones SET det_procesos = 'S'"
          }
          else if (this.maestroActual == 1 && this.nivelActual == 0) //Rutas de producción
          {
            sentencia = "UPDATE sigma.actualizaciones SET rutas = 'S'"
          }
          else if (this.maestroActual == 1 && this.nivelActual == 1) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET det_rutas = 'S'"
          }
          else if (this.maestroActual == 2 && this.nivelActual == 0) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET partes = 'S'"
          }
          else if (this.maestroActual == 3 && this.nivelActual == 0) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET recipientes = 'S'"
          }
          else if (this.maestroActual == 4 && this.nivelActual == 0) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET alertas = 'S'"
          }
          else if (this.maestroActual == 5 && this.nivelActual == 0) 
          {
            sentencia = "UPDATE sigma.actualizaciones SET situaciones = 'S'"
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

  calculoSeg(id: number)
  {
    if (id == 1)
    {
      if (Math.floor(this.detalleRegistro.tiempo_stock / 60) < 60)
      {
        this.segStock = (this.detalleRegistro.tiempo_stock / 60).toFixed(1) + "min"
        if (this.detalleRegistro.tiempo_stock > 0 && this.segStock == "0.0min")
        {
          this.segStock = "0.1min";
        }
      }
      else
      {
        this.segStock = (this.detalleRegistro.tiempo_stock / 3600).toFixed(2) + "hr"
      }
    }
    else if (id == 2)
    {
      if (Math.floor(this.detalleRegistro.tiempo_proceso / 60) < 60)
      {
        this.segProceso = (this.detalleRegistro.tiempo_proceso / 60).toFixed(1) + "min"
        if (this.detalleRegistro.tiempo_proceso > 0 && this.segProceso == "0.0min")
        {
          this.segProceso = "0.1min";
        }
      }
      else
      {
        this.segProceso = (this.detalleRegistro.tiempo_proceso / 3600).toFixed(2) + "hr"
      }
    }
    else if (id == 3)
    {
      if (Math.floor(this.detalleRegistro.tiempo_setup / 60) < 60)
      {
        this.segSetup = (this.detalleRegistro.tiempo_setup / 60).toFixed(1) + "min"
        if (this.detalleRegistro.tiempo_setup > 0 && this.segSetup == "0.0min")
        {
          this.segSetup = "0.1min";
        }
      }
      else
      {
        this.segSetup = (this.detalleRegistro.tiempo_setup / 3600).toFixed(2) + "hr"
      }
    }
  }

  explorar(id: number, nombre: string)
  {    
    this.idNivel0 = id;
    this.nivelActual = 1;
    this.nombreRuta = nombre;
    this.procesarPantalla(2);
  }

  dragMoved(e: CdkDragMove) {
    let point = this.getPointerPositionOnPage(e.event);

    this.listGroup._items.forEach(dropList => {
      if (__isInsideDropListClientRect(dropList, point.x, point.y)) {
        this.activeContainer = dropList;
        return;
      }
    });
  }

  dropListDropped() 
  {
    if (!this.target)
      return;

    let phElement = this.placeholder.element.nativeElement;
    let parent = phElement.parentElement;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.sourceIndex != this.targetIndex)
    {
        moveItemInArray(this.registros, this.sourceIndex, this.targetIndex);
        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "430px", height: "230px", data: { titulo: "Resecuenciar ruta de fabricación ", mensaje: "El cambio en la secuencia de las operaciones afectará el funcionamiento de la ruta. ¿Desea continuar con esta operación?", alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Continuar y resecuenciar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-mail-block" }
        });
        respuesta.afterClosed().subscribe(result => {
        if (result.accion == 1) 
        {
          //Se reenumera el arreglo
          let sentencia = "";
          if (this.sourceIndex > this.targetIndex)
          {
            sentencia = "UPDATE sigma.det_rutas SET secuencia = " + (+this.targetIndex + 1) + " WHERE id = " + this.registros[this.targetIndex].id + ";UPDATE sigma.det_rutas SET secuencia = secuencia + 1 WHERE ruta = " + this.idNivel0 + " AND secuencia >= " + (this.targetIndex + 1) + " AND secuencia < " + (this.sourceIndex + 1) + " AND id <> " + this.registros[this.targetIndex].id + ";";
          }
          else
          {
            sentencia = "UPDATE sigma.det_rutas SET secuencia = " + (+this.targetIndex + 1) + " WHERE id = " + this.registros[this.targetIndex].id + ";UPDATE sigma.det_rutas SET secuencia = secuencia - 1 WHERE ruta = " + this.idNivel0 + " AND secuencia <= " + (this.targetIndex + 1) + " AND secuencia >= " + (this.sourceIndex + 1) + " AND id <> " + this.registros[this.targetIndex].id + ";";
          }
          if (sentencia)
          {
            let campos = {accion: 200, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              if (this.sourceIndex > this.targetIndex)
              {
                for (var i = this.targetIndex; i <= this.sourceIndex; i++)
                {
                  this.registros[i].secuencia = i + 1;
                }
              }
              else
              {
                for (var i = this.sourceIndex; i <= this.targetIndex; i++)
                {
                  this.registros[i].secuencia = i + 1;
                }
              }
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "custom-class";
              mensajeCompleto.mensaje = "La ruta ha sido resecuenciada";
              mensajeCompleto.tiempo = 2000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
            });
          }
          
        }
        else
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class";
          mensajeCompleto.mensaje = "Se cancela la resecuecia";
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
          moveItemInArray(this.registros, this.targetIndex, this.sourceIndex);
        }
      });
    }
  }

  dropListEnterPredicate = (drag: CdkDrag, drop: CdkDropList) => {
    if (drop == this.placeholder)
      return true;

    if (drop != this.activeContainer)
      return false;

    let phElement = this.placeholder.element.nativeElement;
    let sourceElement = drag.dropContainer.element.nativeElement;
    let dropElement = drop.element.nativeElement;

    let dragIndex = __indexOf(dropElement.parentElement.children, (this.source ? phElement : sourceElement));
    let dropIndex = __indexOf(dropElement.parentElement.children, dropElement);

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      phElement.style.width = sourceElement.clientWidth + 'px';
      phElement.style.height = sourceElement.clientHeight + 'px';
      
      sourceElement.parentElement.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    dropElement.parentElement.insertBefore(phElement, (dropIndex > dragIndex 
      ? dropElement.nextSibling : dropElement));

    this.placeholder.enter(drag, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);
    return false;
  }

  recuperarProceso(evento: any)
  {
    let sentencia = "SELECT * FROM sigma.cat_procesos WHERE id = " + this.detalleRegistro.proceso;
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.detalleRegistro.nombre = resp[0].nombre;
      if (!this.detalleRegistro.notas)
      {
        this.detalleRegistro.notas = resp[0].notas;
      }
      if (!this.detalleRegistro.referencia)
      {
        this.detalleRegistro.referencia = resp[0].referencia;
      }
    })
  }

  selectAll() {
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
    var i;
    this.seleccionProcesos = [];
    for (i = 0; i < this.procesos.length; i++ )
    {
      this.seleccionProcesos.push(this.procesos[i].id);  
    } 
  }

  deselectAll() {
    this.seleccionProcesos = [];
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

  /** Determines the point of the page that was touched by the user. */
  getPointerPositionOnPage(event: MouseEvent | TouchEvent) {
    // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
    const point = __isTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
        const scrollPosition = this.viewportRuler.getViewportScrollPosition();

        return {
            x: point.pageX - scrollPosition.left,
            y: point.pageY - scrollPosition.top
        };
    }

    refrescar()
    {
      this.verRegistro = 21;
      this.llenarRegistros();
    }

    editarEquipo(id: number)
    {
      this.registroActual = id;    
      this.maestroActual = 0; 
      this.nivelActual = 1;
      this.despuesBusqueda = 0;
      this.buscarRegistro(1);    
      this.verRegistro = 22;
    }

    editarItem(id: number)
    {
      this.registroActual = id;    
      this.maestroActual = 2; 
      this.nivelActual = 0;
      this.despuesBusqueda = 0;
      this.buscarRegistro(1);    
      this.verRegistro = 22;
    }

    editarDetalleRuta(id: number)
    {
      this.registroActual = id;    
      this.maestroActual = 1; 
      this.nivelActual = 1;
      this.despuesBusqueda = 0;
      this.buscarRegistro(1);    
      this.verRegistro = 22;
    }

    editarRuta(id: number)
    {
      this.registroActual = id;    
      this.maestroActual = 1; 
      this.nivelActual = 0;
      this.despuesBusqueda = 0;
      this.buscarRegistro(1);    
      this.verRegistro = 22;
    }

    editarCabecera(id: number)
    {
      this.registroActual = id;    
      this.nivelActual = 0;
      this.despuesBusqueda = 0;
      this.buscarRegistro(1);    
      this.verRegistro = 22;
    }
    
  iniClave()
  {
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "400px", data: { titulo: "Inicializar contraseña de usuario ", mensaje: "Esta acción inicializará la contraseña de este usuario quién deberá cambiarla en su próximo inicio de sesión. ¿Desea continuar con esta operación?", alto: "80", id: 0, accion: 0, botones: 2, boton1STR: "Inicializar contraseña", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-mail-block" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        let sentencia = "UPDATE sigma.cat_usuarios SET inicializada = 'S' WHERE id = " + this.detalleRegistro.id 
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class";
            mensajeCompleto.mensaje = "La contraseña del usuario se ha inicializado";
            mensajeCompleto.tiempo = 3000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
            
        })  
      }
    });
  }

}

function __indexOf(collection, node) {
  return Array.prototype.indexOf.call(collection, node);
};

/** Determines whether an event is a touch event. */
function __isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return event.type.startsWith('touch');
}

function __isInsideDropListClientRect(dropList: CdkDropList, x: number, y: number) {
  const {top, bottom, left, right} = dropList.element.nativeElement.getBoundingClientRect();
  return y >= top && y <= bottom && x >= left && x <= right; 
}