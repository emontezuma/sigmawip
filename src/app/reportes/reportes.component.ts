import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { ActivatedRoute, GuardsCheckStart } from '@angular/router';
import { trigger, style, animate, transition, query, group, state, stagger } from '@angular/animations';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DialogoComponent } from '../dialogo/dialogo.component';
import { FiltroComponent } from '../filtro/filtro.component';
import { FormatoComponent } from '../formato/formato.component';
import { MatDialog, MatSelect } from '@angular/material';
import { DatePipe } from '@angular/common'
import { fakeAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DxChartComponent } from "devextreme-angular";
import { saveAs } from 'file-saver';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
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


export class ReportesComponent implements OnInit {
  constructor(
    private servicio: ServicioService,
    public datepipe: DatePipe,
    public scroll: ScrollDispatcher,
    public dialogo: MatDialog, 
    private http: HttpClient,
    private router: Router, 
  ) {
    this.servicio.cambioPantalla.subscribe((pantalla: any)=>
    {
      this.altoPantalla = this.servicio.rPantalla().alto - 105;
      this.anchoPantalla = this.servicio.rPantalla().ancho - 10;
      this.altoGrafica = this.altoPantalla - 120
      this.anchoGrafica = this.anchoPantalla - 30
    });
    this.servicio.quitarBarra.subscribe((accion: boolean)=>
    {
      this.altoPantalla = this.servicio.rPantalla().alto - 105;
      this.anchoPantalla = this.servicio.rPantalla().ancho - 10 + 300;
      this.altoGrafica = this.altoPantalla - 120
      this.anchoGrafica = this.anchoPantalla - 30
    });
    this.servicio.teclaBuscar.subscribe((accion: boolean)=>
    {
      this.buscar();
    });
    this.servicio.teclaEscape.subscribe((accion: boolean)=>
    {
      this.escapar();
    });
    this.servicio.cadaSegundo.subscribe((accion: boolean)=>
    {
      if (this.router.url.substr(0, 9) == "/reportes" && this.maestroActual==4)
      {
        this.cadaSegundo();
      }
    });
    this.vistaCatalogo = this.servicio.vista_4.subscribe((vista: number)=>
    {
      this.verRegistro = 0;
      
      if (vista==30)
      {
        this.ventanaViene = 1;
        //this.verRegistro = 21;
      }
      else
      {
        this.ventanaViene = 2;
        //this.verRegistro = 22;
      }
      
      this.verPantalla(vista - 30);
      //this.configuracion();
    });
    this.scrollingSubscription = this.scroll
      .scrolled()
      .subscribe((data: CdkScrollable) => {
        this.miScroll(data);
    });
    this.detalleRegistro.reporte = 0;
    this.detalleRegistro.periodo = 0;
    this.detalleRegistro.parte = 0;
    this.detalleRegistro.proceso = 0;
    this.detalleRegistro.estado = -1;
    this.detalleRegistro.desde = new Date();
    this.detalleRegistro.hasta = new Date()
    this.detalleRegistro.incluir_traza = 0;
    this.altoPantalla = this.servicio.rPantalla().alto - 105;
    this.anchoPantalla = this.servicio.rPantalla().ancho - 10;
    this.altoGrafica = this.altoPantalla - 120
    this.anchoGrafica = this.anchoPantalla - 30
    this.listarPartes();
    this.listarProcesos();
    
    this.servicio.mensajeSuperior.emit("Reportes de la aplicación")
    this.colorear();
    let vista = this.servicio.rVista();
    this.verRegistro = 0;
    
    if (vista==30)
    {
      //this.verRegistro = (this.verRegistro == 0 || this.verRegistro == 21 ? 1 : 21);  
        this.ventanaViene = 1;
    }  
    else 
    {
      this.ventanaViene = 2;
    }
    this.verPantalla(vista - 30);
    this.configuracion();
   }

   @ViewChild("txtBuscar", { static: false }) txtBuscar: ElementRef;
   @ViewChild(DxChartComponent, { static: false }) chart: DxChartComponent;

    config: any;
    scrollingSubscription: Subscription;
    periodo: string = "";
    tituloReporte: string = "";
    literalSingular: string = "";
    literalSingularArticulo: string = "";
    literalPlural: string = "";
    mensajeNoHay: string = "";
    casSQLAdicional: string = "";
    etiqueta_fuente: string = "14";
    maestroActual: number = 0;
    vistaCatalogo: Subscription;
    altoPantalla: number = this.servicio.rPantalla().alto - 105;
    anchoPantalla: number = this.servicio.rPantalla().ancho - 10;
    errorMensaje: string = "";
    textoEstimado: string = "";
    verBarra: string = "auto";
    pantalla: number = 0;
    estimado_productividad: number = 0;
    textoBuscar: string = "";
    detalleRegistro: any = [];
    buscarOperaciones: boolean = false;
    buscarPartes: boolean = false;
    verTodos: boolean = true;
    verBuenos: boolean = true;
    verMalos: boolean = true;
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
    verBuscar: boolean = false;
    arrFiltrado = [];
    verRegistro: number = 0;
    ventanaViene: number = 0;
    registros: any = []
    bajo_color_todo: string = "0px 0px 1px 2px #606060";
    medio_color_todo: string = "0px 0px 1px 2px #606060";
    alto_color_todo: string = "0px 0px 1px 2px #606060";
    visualizar: string = "N";
    periodoFecha: number = 0;
    fDesde: string = "";
    fHasta: string = "";
    sentenciaR: string = "";
    verIrArriba: boolean = false;
    verImagen: boolean = false;
    cronometrando: boolean = false;
    cronometro: any;
    offSet: number;
    altoGrafica: number = 200;
    anchoGrafica: number = 200;

    titulo: string = "Entrega de lotes por semana";
    sub_titulo: string = "";
    mostrar_tabla: string = "S";
    titulo_fuente: string = "30";
    texto_x: string = "";
    texto_y: string = "";
    texto_z: string = "";
    partes = [];
    procesos = [];
    //URL_FOLDER = "http://localhost:8081/sigma/assets/datos/";
    URL_FOLDER = "/sigma/assets/datos/";
    ayuda01: string = "Descarga los datos de la gráfica";
    ayuda02: string = "Descargar el gráfico como una imagen"
    ayuda03: string = "Aplicar un filtro a la imagen"
    ayuda04: string = "Refrescar el reporte"
    ayuda05: string = "Configurar la gráfica"
    ayuda06: string = "Guardar el gráfico como una imagen"
    accion1: boolean= false;
    accion2: boolean= false;
    accion3: boolean= false;
    accion4: boolean= false;

    salidaEfecto(evento: any)
    {
      this.verRegistro = this.ventanaViene;
    }

  verPantalla(vista: number)
  {
    this.maestroActual = vista;
    if (vista==0)
      {
        this.accion1 = false;
        this.accion2 = false;
        this.accion3 = false;
        this.accion4 = false;
        setTimeout(() => {
          this.verRegistro = this.ventanaViene  
        }, 300);
        ;
      }  
      else
      {
        this.accion1 = true;
        this.accion2 = false;
        this.accion3 = true;   
        this.accion4 = true;     
        
        if (vista==1)
        {
          this.mensajeNoHay = "No se hallaron operaciones";
          this.literalSingular = "operación";
          this.literalPlural = "operaciones";
          this.literalSingularArticulo = "La operacion";
        }
        else if (vista==2)
        {
          this.mensajeNoHay = "No se hallaron operaciones";
          this.literalSingular = "operación";
          this.literalPlural = "operaciones";
          this.literalSingularArticulo = "La operacion";
        }
        else if (vista==3)
        {
          this.mensajeNoHay = "No se hallaron números de parte";
          this.literalSingular = "número de parte";
          this.literalPlural = "números de parte";
          this.literalSingularArticulo = "El número de parte";
        }
        else if (vista==5)
        {
          this.mensajeNoHay = "No se hallaron semanas";
          this.literalSingular = "semana";
          this.literalPlural = "semanas";
          this.literalSingularArticulo = "La semana";
        }
        else if (vista==6)
        {
          this.mensajeNoHay = "No se hallaron operaciones";
          this.literalSingular = "operación";
          this.literalPlural = "operaciones";
          this.literalSingularArticulo = "La operación";
        }
        else if (vista==7)
        {
          this.mensajeNoHay = "No se hallaron operaciones";
          this.literalSingular = "operación";
          this.literalPlural = "operaciones";
          this.literalSingularArticulo = "La operación";
        }
        else if (vista==4)
        {
          this.mensajeNoHay = "No se hallaron alertas activas";
          this.literalSingular = "alerta";
          this.literalPlural = "alertas";
          this.literalSingularArticulo = "La alerta";
          this.accion1 = false;
          this.accion2 = false;
          this.accion3 = false;   
          this.accion4 = true;
        }
        this.aplicarConsulta(vista)
      }
      this.buscarConsulta()
  }
  
    ngOnInit() {
  }

  aplicarConsulta(vista: number)
  {
    this.registros = [];
    this.arrFiltrado = [];
    let cadWhere = "";
    let cadWhereExt = "";
    let cadHaving = "";
  if (vista == 1 || vista == 2)
  {
    cadWhere = " AND NOT ISNULL(fecha_salida) ";
    if (this.periodoFecha != 0)
    {
      cadWhere = cadWhere + "AND fecha_entrada >= '" + this.fDesde + "' AND fecha_entrada <= '" + this.fHasta + "'";
    }
    if (this.buscarPartes)
    {
      cadWhere = cadWhere + " AND parte IN (SELECT valor FROM consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 1) "
    }
    if (this.buscarOperaciones)
    {
      cadWhereExt = cadWhereExt + " WHERE a.id IN (SELECT valor FROM consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 2) "
    }
  }
  else if (vista == 3)
  {
    cadWhere = " AND estado > 0  ";
    if (this.periodoFecha != 0)
    {
      cadWhere = cadWhere + "AND finaliza >= '" + this.fDesde + "' AND finaliza <= '" + this.fHasta + "'";
    }
    
    if (this.buscarPartes)
    {
      cadWhere = cadWhere + " AND proceso IN (SELECT valor FROM consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 2) "
    }
    if (this.buscarOperaciones)
    {
      cadWhereExt = cadWhereExt + " WHERE a.id IN (SELECT valor FROM consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 1) "
    }
  }
  else if (vista == 5)
  {
    cadWhere = " WHERE NOT ISNULL(fecha_salida) ";
    if (this.periodoFecha != 0)
    {
      cadWhere = cadWhere + " AND a.fecha_entrada >= '" + this.fDesde + "' AND a.fecha_entrada <= '" + this.fHasta + "'";
    }
    if (this.buscarPartes)
    {
      cadWhere = cadWhere + " AND a.parte IN (SELECT valor FROM consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 1) "
    }
    if (this.buscarOperaciones)
    {
      cadWhere = cadWhere + " AND a.proceso IN (SELECT valor FROM consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 2) "
    }    
  }
  else if (vista == 6)
  {
    cadWhere = " WHERE NOT ISNULL(a.fecha_salida) ";
    if (this.periodoFecha != 0)
    {
      cadWhere = cadWhere + " AND a.fecha_entrada >= '" + this.fDesde + "' AND a.fecha_entrada <= '" + this.fHasta + "'";
    }
    if (this.buscarPartes)
    {
      cadWhere = cadWhere + " AND a.parte IN (SELECT valor FROM consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 1) "
    }
    if (this.buscarOperaciones)
    {
      cadWhere = cadWhere + " AND a.proceso IN (SELECT valor FROM consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 2) "
    }    
  }
  else if (vista == 7)
  {
    cadWhere = " WHERE NOT ISNULL(a.fecha_salida) ";
    if (this.periodoFecha != 0)
    {
      cadWhere = cadWhere + " AND a.fecha_entrada >= '" + this.fDesde + "' AND a.fecha_entrada <= '" + this.fHasta + "'";
    }
    if (this.buscarPartes)
    {
      cadWhere = cadWhere + " AND a.parte IN (SELECT valor FROM consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 1) "
    }
    if (this.buscarOperaciones)
    {
      cadWhere = cadWhere + " AND a.proceso IN (SELECT valor FROM consultas_det WHERE consulta = " + this.servicio.rConsulta() + " AND tabla = 2) "
    }    
  }
  if (this.visualizar == "N")
  {
    cadHaving = "HAVING total > 0"
  }
    this.calcularPeriodo(this.periodoFecha);
    this.tituloReporte ="Efectividad por operación " + this.periodo
    let sentencia = "SELECT * FROM (SELECT 1 as pos, a.nombre, IFNULL((SELECT COUNT(*) FROM sigma.lotes_historia WHERE proceso = a.id " + cadWhere + "), 0) AS total, IFNULL((SELECT SUM(IF((c.tiempo_estimado - b.tiempo_stock) >= c.tiempo_proceso, 1, 0)) FROM sigma.lotes_historia c INNER JOIN sigma.det_rutas b ON c.ruta_detalle = b.id WHERE c.proceso = a.id " + cadWhere + "), 0) AS buenos, (SELECT total) - (SELECT buenos) AS malos, IF((SELECT total) > 0, ROUND((SELECT buenos) / (SELECT total) * 100, 0), 0) AS pct, CONCAT((SELECT pct), '%') AS pctchar FROM sigma.cat_procesos a " + cadWhereExt + " " + cadHaving + ") as query01 UNION (SELECT 0, 'TOTAL GENERAL', IFNULL((SELECT COUNT(*) FROM sigma.lotes_historia WHERE proceso >0 " + cadWhere + "), 0) AS total, IFNULL((SELECT SUM(IF((c.tiempo_estimado - b.tiempo_stock) >= c.tiempo_proceso, 1, 0)) FROM sigma.lotes_historia c INNER JOIN sigma.det_rutas b ON c.ruta_detalle = b.id WHERE c.proceso > 0 " + cadWhere + "), 0) AS buenos, (SELECT total) - (SELECT buenos) AS malos, IF((SELECT total) > 0, ROUND((SELECT buenos) / (SELECT total) * 100, 0), 0) AS pct, CONCAT((SELECT pct), '%') AS pctchar FROM sigma.cat_procesos a) ORDER BY 1, 2 ASC, 6 DESC, 4 DESC";
    this.sentenciaR = "SELECT 'Operacion', 'Total lotes', 'Lotes OK', 'Lotes con demora', '% OK' UNION SELECT a.nombre, IFNULL((SELECT COUNT(*) FROM sigma.lotes_historia WHERE proceso = a.id " + cadWhere + "), 0) AS total, IFNULL((SELECT SUM(IF((c.tiempo_estimado - b.tiempo_stock) >= c.tiempo_proceso, 1, 0)) FROM sigma.lotes_historia c INNER JOIN sigma.det_rutas b ON c.ruta_detalle = b.id WHERE c.proceso = a.id " + cadWhere + "), 0) AS buenos, (SELECT total) - (SELECT buenos) AS malos, IF((SELECT total) > 0, ROUND((SELECT buenos) / (SELECT total) * 100, 0), 0) AS pct FROM sigma.cat_procesos a " + cadWhereExt + " " + cadHaving + " UNION SELECT '(TOTAL PLANTA)', IFNULL((SELECT COUNT(*) FROM sigma.lotes_historia WHERE proceso > 0 " + cadWhere + "), 0) AS total, IFNULL((SELECT SUM(IF((c.tiempo_estimado - b.tiempo_stock) >= c.tiempo_proceso, 1, 0)) FROM sigma.lotes_historia c INNER JOIN sigma.det_rutas b ON c.ruta_detalle = b.id WHERE c.proceso > 0 " + cadWhere + "), 0) AS buenos, (SELECT total) - (SELECT buenos) AS malos, IF((SELECT total) > 0, ROUND((SELECT buenos) / (SELECT total) * 100, 0), 0) AS pct FROM sigma.cat_procesos a " + cadWhereExt + " ";      
    if (vista == 2)
    {
      this.tituloReporte ="Productividad por operación " + this.periodo
      sentencia = "SELECT * FROM (SELECT 1 as pos, a.nombre, IFNULL((SELECT COUNT(*) FROM sigma.lotes_historia WHERE proceso = a.id " + cadWhere + "), 0) AS total, IFNULL((SELECT SUM(IF((c.tiempo_estimado - b.tiempo_stock) >= c.tiempo_proceso, 1, 0)) FROM sigma.lotes_historia c INNER JOIN sigma.det_rutas b ON c.ruta_detalle = b.id WHERE c.proceso = a.id  " + cadWhere + "), 0) AS buenos, (SELECT total) - (SELECT buenos) AS malos, IFNULL((SELECT SUM(c.tiempo_estimado - b.tiempo_stock) FROM sigma.lotes_historia c INNER JOIN sigma.det_rutas b ON c.ruta_detalle = b.id WHERE c.proceso = a.id " + cadWhere + "), 0) AS estimado, IFNULL((SELECT SUM(tiempo_proceso) FROM sigma.lotes_historia WHERE proceso = a.id " + cadWhere + "), 0) AS treal, IF((SELECT treal) > 0, 100 + ROUND(((SELECT estimado) - (SELECT treal)) / (SELECT treal) * 100, 1), 0) AS pct, CONCAT((SELECT pct), '%') AS pctchar FROM sigma.cat_procesos a " + cadWhereExt + " " + cadHaving + ") as query01 UNION (SELECT 0, 'TOTAL GENERAL', IFNULL((SELECT COUNT(*) FROM sigma.lotes_historia WHERE proceso > 0 " + cadWhere + "), 0) AS total, IFNULL((SELECT SUM(IF((c.tiempo_estimado - b.tiempo_stock) >= c.tiempo_proceso, 1, 0)) FROM sigma.lotes_historia c INNER JOIN sigma.det_rutas b ON c.ruta_detalle = b.id WHERE c.proceso > 0 " + cadWhere + "), 0) AS buenos, (SELECT total) - (SELECT buenos) AS malos, IFNULL((SELECT SUM(c.tiempo_estimado - b.tiempo_stock) FROM sigma.lotes_historia c INNER JOIN sigma.det_rutas b ON c.ruta_detalle = b.id WHERE c.proceso > 0 " + cadWhere + "), 0) AS estimado, IFNULL((SELECT SUM(tiempo_proceso) FROM sigma.lotes_historia WHERE proceso > 0 " + cadWhere + "), 0) AS treal, IF((SELECT treal) > 0, 100 + ROUND(((SELECT estimado) - (SELECT treal)) / (SELECT treal) * 100, 1), 0) AS pct, CONCAT((SELECT pct), '%') AS pctchar  FROM sigma.cat_procesos a " + cadWhereExt + ") ORDER BY 1, 2, 8 DESC, 4 ASC";
      this.sentenciaR = "SELECT 'Operacion', 'Total lotes', 'Lotes OK', 'Lotes con demora', 'Total estimado', 'Total utilizado', 'Tiempo ocupado (%)' UNION SELECT a.nombre, IFNULL((SELECT COUNT(*) FROM sigma.lotes_historia WHERE proceso = a.id " + cadWhere + "), 0) AS total, IFNULL((SELECT SUM(IF((c.tiempo_estimado - b.tiempo_stock) >= c.tiempo_proceso, 1, 0)) FROM sigma.lotes_historia c INNER JOIN sigma.det_rutas b ON c.ruta_detalle = b.id WHERE c.proceso = a.id  " + cadWhere + "), 0) AS buenos, (SELECT total) - (SELECT buenos) AS malos, IFNULL((SELECT SUM(c.tiempo_estimado - b.tiempo_stock) FROM sigma.lotes_historia c INNER JOIN sigma.det_rutas b ON c.ruta_detalle = b.id WHERE c.proceso = a.id " + cadWhere + "), 0) AS estimado, IFNULL((SELECT SUM(tiempo_proceso) FROM sigma.lotes_historia WHERE proceso = a.id " + cadWhere + "), 0) AS treal, IF((SELECT treal) > 0, 100 + ROUND(((SELECT estimado) - (SELECT treal)) / (SELECT treal) * 100, 1), 0) AS pct FROM sigma.cat_procesos a " + cadHaving + " UNION SELECT 'TOTAL GENERAL', IFNULL((SELECT COUNT(*) FROM sigma.lotes_historia WHERE proceso > 0 " + cadWhere + "), 0) AS total, IFNULL((SELECT SUM(IF((c.tiempo_estimado - b.tiempo_stock) >= c.tiempo_proceso, 1, 0)) FROM sigma.lotes_historia c INNER JOIN sigma.det_rutas b ON c.ruta_detalle = b.id WHERE c.proceso > 0 " + cadWhere + "), 0) AS buenos, (SELECT total) - (SELECT buenos) AS malos, IFNULL((SELECT SUM(c.tiempo_estimado - b.tiempo_stock) FROM sigma.lotes_historia c INNER JOIN sigma.det_rutas b ON c.ruta_detalle = b.id WHERE c.proceso > 0 " + cadWhere + "), 0) AS estimado, IFNULL((SELECT SUM(tiempo_proceso) FROM sigma.lotes_historia WHERE proceso > 0 " + cadWhere + "), 0) AS treal, IF((SELECT treal) > 0, 100 + ROUND(((SELECT estimado) - (SELECT treal)) / (SELECT treal) * 100, 1), 0) AS pct FROM sigma.cat_procesos a ";      
    }
    if (vista == 3)
    {
      this.tituloReporte ="Productividad por Numero de parte " + this.periodo
      sentencia = "SELECT * FROM (SELECT 1 as pos, a.nombre, IFNULL((SELECT COUNT(*) FROM sigma.lotes WHERE estado = 99 AND parte = a.id " + cadWhere + "), 0) AS total, IFNULL((SELECT SUM(IF(tiempo_estimado >= tiempo, 1, 0)) FROM sigma.lotes WHERE estado = 99 AND parte = a.id " + cadWhere + "), 0) AS buenos, IFNULL((SELECT SUM(IF(tiempo_estimado < tiempo, 1, 0)) FROM sigma.lotes WHERE estado = 99 AND parte = a.id " + cadWhere + "), 0) AS malos, IFNULL((SELECT SUM(tiempo_estimado) FROM sigma.lotes WHERE estado = 99 AND parte = a.id " + cadWhere + "), 0) AS estimado, IFNULL((SELECT SUM(tiempo) FROM sigma.lotes WHERE estado = 99 AND parte = a.id " + cadWhere + "), 0) AS treal, IF((SELECT treal) > 0, 100 + ROUND(((SELECT estimado) - (SELECT treal)) / (SELECT treal) * 100, 1), 0) AS pct, CONCAT((SELECT pct), '%') AS pctchar FROM sigma.cat_partes a " + cadHaving + ") as query01 UNION (SELECT 0, 'TOTAL GENERAL', IFNULL((SELECT COUNT(*) FROM sigma.lotes WHERE estado = 99 AND parte > 0 " + cadWhere + "), 0) AS total, IFNULL((SELECT SUM(IF(tiempo_estimado >= tiempo, 1, 0)) FROM sigma.lotes WHERE estado = 99 AND parte > 0 " + cadWhere + "), 0) AS buenos, IFNULL((SELECT SUM(IF(tiempo_estimado < tiempo, 1, 0)) FROM sigma.lotes WHERE estado = 99 AND parte > 0 " + cadWhere + "), 0) AS malos, IFNULL((SELECT SUM(tiempo_estimado) FROM sigma.lotes WHERE estado = 99 AND parte > 0 " + cadWhere + "), 0) AS estimado, IFNULL((SELECT SUM(tiempo) FROM sigma.lotes WHERE estado = 99 AND parte > 0 " + cadWhere + "), 0) AS treal, IF((SELECT treal) > 0, 100 + ROUND(((SELECT estimado) - (SELECT treal)) / (SELECT treal) * 100, 1), 0) AS pct, CONCAT((SELECT pct), '%') AS pctchar FROM sigma.cat_partes a) ORDER BY 1, 8 DESC, 4 DESC, 2 ASC";
      this.sentenciaR = "SELECT 'Numero de parte', 'Referencia', 'Total lotes', 'Lotes OK', 'Lotes con demora', 'Total estimado', 'Total utilizado', 'Desviación (%)' UNION SELECT a.nombre, a.referencia, IFNULL((SELECT COUNT(*) FROM sigma.lotes WHERE parte = a.id " + cadWhere + "), 0) AS total, IFNULL((SELECT SUM(IF(tiempo_estimado >= tiempo, 1, 0)) FROM sigma.lotes WHERE parte = a.id " + cadWhere + "), 0) AS buenos, IFNULL((SELECT SUM(IF(tiempo_estimado < tiempo, 1, 0)) FROM sigma.lotes WHERE parte = a.id " + cadWhere + "), 0) AS malos, IFNULL((SELECT SUM(tiempo_estimado) FROM sigma.lotes WHERE parte = a.id " + cadWhere + "), 0) AS estimado, IFNULL((SELECT SUM(tiempo) FROM sigma.lotes WHERE parte = a.id " + cadWhere + "), 0) AS treal, IF((SELECT treal) > 0, 100 + ((SELECT estimado) - (SELECT treal)) / (SELECT treal) * 100, 0) AS pct FROM sigma.cat_partes a " + cadHaving + " UNION SELECT 'TOTAL GENERAL', '', IFNULL((SELECT COUNT(*) FROM sigma.lotes WHERE parte > 0 " + cadWhere + "), 0) AS total, IFNULL((SELECT SUM(IF(tiempo_estimado >= tiempo, 1, 0)) FROM sigma.lotes WHERE parte > 0 " + cadWhere + "), 0) AS buenos, IFNULL((SELECT SUM(IF(tiempo_estimado < tiempo, 1, 0)) FROM sigma.lotes WHERE parte > 0 " + cadWhere + "), 0) AS malos, IFNULL((SELECT SUM(tiempo_estimado) FROM sigma.lotes WHERE parte > 0 " + cadWhere + "), 0) AS estimado, IFNULL((SELECT SUM(tiempo) FROM sigma.lotes WHERE parte > 0 " + cadWhere + "), 0) AS treal, IF((SELECT treal) > 0, 100 + ((SELECT estimado) - (SELECT treal)) / (SELECT treal) * 100, 0) AS pct FROM sigma.cat_partes a ";            
    }
    if (vista == 4)
    {
      this.tituloReporte ="Alarmas activas";
      sentencia = "SELECT a.*, d.nombre AS nombre_alerta, b.numero, c.nombre, c.referEncia FROM sigma.alarmas a LEFT JOIN sigma.cat_alertas d ON a.alerta = d.id LEFT JOIN sigma.lotes b ON a.lote = b.id  LEFT JOIN sigma.cat_partes c ON b.parte = c.id WHERE ISNULL(a.fin) AND a.tipo <> 3 AND a.tipo <> 7 AND a.tipo <> 4 UNION (SELECT a.*, d.nombre AS nombre_alerta, b.carga, b.carga, b.carga FROM sigma.alarmas a LEFT JOIN sigma.cat_alertas d ON a.alerta = d.id LEFT JOIN sigma.cargas b ON a.lote = b.id WHERE ISNULL(a.fin) AND (a.tipo = 3 OR a.tipo = 7)) ORDER BY 7";
    }
    if (vista == 5)
    {
      this.tituloReporte ="Cumplimiento por semana " + this.periodo
      sentencia = "SELECT * FROM (SELECT DATE_FORMAT(fecha_entrada,'%x/%v') AS pref, STR_TO_DATE(CONCAT(DATE_FORMAT(fecha_entrada,'%x/%v'), ' Monday'), '%x/%v %W') AS inicio, CONCAT((SELECT pref), ' ', (SELECT inicio)) AS liga, COUNT(*) AS total, SUM(IF((a.tiempo_estimado - b.tiempo_stock) >= a.tiempo_proceso, 1, 0)) AS buenos, SUM(IF((a.tiempo_estimado - b.tiempo_stock) < a.tiempo_proceso, 1, 0))  AS malos FROM sigma.lotes_historia a INNER JOIN sigma.det_rutas b ON a.ruta_detalle = b.id " + cadWhere + " GROUP BY 1) AS query01 ORDER BY 1;";
      this.sentenciaR = "SELECT 'Semana', 'Fecha de inicio', 'Fecha de fin', 'Lotes totales', 'Lotes OK', 'Lotes con demora'  UNION SELECT DATE_FORMAT(fecha_entrada,'%x/%v') AS pref, STR_TO_DATE(CONCAT(DATE_FORMAT(fecha_entrada,'%x/%v'), ' Monday'), '%x/%v %W') AS inicio, DATE_ADD((SELECT inicio), INTERVAL 6 DAY) AS fin, COUNT(*) AS total, SUM(IF((a.tiempo_estimado - b.tiempo_stock) >= a.tiempo_proceso, 1, 0)) AS buenos, SUM(IF((a.tiempo_estimado - b.tiempo_stock) < a.tiempo_proceso, 1, 0))  AS malos FROM sigma.lotes_historia a INNER JOIN sigma.det_rutas b ON a.ruta_detalle = b.id " + cadWhere + "GROUP BY 1 ";      
    
    }
    if (vista == 6)
    {
      this.tituloReporte ="Cumplimiento por operación " + this.periodo
      sentencia = "SELECT * FROM (SELECT c.nombre AS liga, COUNT(*) AS total, SUM(IF((a.tiempo_estimado - b.tiempo_stock) >= a.tiempo_proceso, 1, 0)) AS buenos, SUM(IF((a.tiempo_estimado - b.tiempo_stock) < a.tiempo_proceso, 1, 0))  AS malos FROM sigma.lotes_historia a INNER JOIN sigma.det_rutas b ON a.ruta_detalle = b.id LEFT JOIN sigma.cat_procesos c ON a.proceso = c.id " + cadWhere + "GROUP BY 1) AS query01 ORDER BY 1;";
      this.sentenciaR = "SELECT 'Proceso', 'Referencia', 'Lotes totales', 'Lotes OK', 'Lotes con demora' UNION SELECT c.nombre AS pref, c.referencia, COUNT(*) AS total, SUM(IF((a.tiempo_estimado - b.tiempo_stock) >= a.tiempo_proceso, 1, 0)) AS buenos, SUM(IF((a.tiempo_estimado - b.tiempo_stock) < a.tiempo_proceso, 1, 0))  AS malos FROM sigma.lotes_historia a INNER JOIN sigma.det_rutas b ON a.ruta_detalle = b.id LEFT JOIN sigma.cat_procesos c ON a.proceso = c.id  " + cadWhere + "GROUP BY 1 ";      
    
    }
    if (vista == 7)
    {
      this.tituloReporte ="Productividad por operación " + this.periodo
      sentencia = "SELECT * FROM (SELECT b.nombre AS liga, COUNT(*) AS total, 0 as buenos, SUM(a.tiempo_estimado - c.tiempo_stock), SUM(a.tiempo_proceso), ROUND(IF(SUM(a.tiempo_proceso) = 0,  0, 100 + (SUM(a.tiempo_estimado - c.tiempo_stock) - SUM(a.tiempo_proceso)) / SUM(a.tiempo_proceso) * 100), 0) AS malos FROM sigma.lotes_historia a LEFT JOIN sigma.cat_procesos b ON a.proceso = b.id INNER JOIN sigma.det_rutas c ON a.ruta_detalle = c.id " + cadWhere + "GROUP BY 1) AS query01 ORDER BY 1;";
      this.sentenciaR = "SELECT 'Proceso', 'Referencia', 'Lotes totales', 'Lotes OK', 'Lotes con demora', 'Uso del tiempo (%)' UNION SELECT b.nombre AS pref, b.referencia, COUNT(*) AS total, SUM(IF((a.tiempo_estimado - c.tiempo_stock) >= a.tiempo_proceso, 1, 0)) AS buenos, SUM(IF((a.tiempo_estimado - c.tiempo_stock) < a.tiempo_proceso, 1, 0)) AS malos, ROUND(IF(SUM(a.tiempo_proceso) = 0,  0, 100 + (SUM(a.tiempo_estimado - c.tiempo_stock) - SUM(a.tiempo_proceso)) / SUM(a.tiempo_proceso) * 100), 0) FROM sigma.lotes_historia a LEFT JOIN sigma.cat_procesos b ON a.proceso = b.id INNER JOIN sigma.det_rutas c ON a.ruta_detalle = c.id " + cadWhere + "GROUP BY 1 ";      
    
    }
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    { 
      this.registros = resp;
        this.arrFiltrado = resp;
        this.contarRegs()
        setTimeout(() => {
        this.verRegistro = 2;
        //this.verRegistro = 2;
        ;
      }, 300);
        
      if (resp.length == 0)
      { 
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "custom-class-red";
        mensajeCompleto.mensaje = this.mensajeNoHay;
        mensajeCompleto.tiempo = 2000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        
      }
    })
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

 calcularPeriodo(periodo: number)
 {
   if (periodo == 0)
   {
    this.periodo="(Toda la base de datos)";
   }
   else if (periodo == 1)
   {
    this.periodo="(Lo que va del día)";
   }
   else if (periodo == 2)
   {
    this.periodo="(Lo que va de semana)";
   }
   else if (periodo == 3)
   {
    this.periodo="(Lo que va del mes)";
   }
   else if (periodo == 4)
   {
    this.periodo="(Lo que va del año)";
   }
   else if (periodo == 5)
   {
    this.periodo="(La semana pasada)";
   }
   else if (periodo == 6)
   {
    this.periodo="(El mes pasado)";
   }
   else if (periodo == 7)
   {
    this.periodo="(El año pasado)";
   }
   else if (periodo == 8)
   {
    this.periodo="(Desde: " + this.servicio.fecha(2, this.fDesde.substr(0, 10), "dd-MMM-yyyy") + " Hasta: " + this.servicio.fecha(2, this.fHasta.substr(0, 10), "dd-MMM-yyyy") + ")";
   }
 }

 escapar()
  {
    if (this.verBuscar)
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

contarRegs()
{
  let mensaje = "";
  if (this.maestroActual!=5)
  {
    let cadAdicional: string = (this.registros.length != this.arrFiltrado.length ? " (lista filtrada de un total de " + this.arrFiltrado.length + ") " : "");
    mensaje = "No hay " + this.literalPlural;
    if (this.registros.length > 0)
    {
      mensaje = "Hay " + (this.registros.length == 1 ? "un " + this.literalSingular : this.registros.length + " " + this.literalPlural) 
    }
    mensaje = mensaje + " en la vista" + cadAdicional;
  }
  this.servicio.mensajeInferior.emit(mensaje);    
}

buscarConsulta()
  {
    this.verTodos=true;
    this.verBuenos=true;
    this.verMalos=true;
        
    let sentencia = "SELECT * FROM sigma.pu_graficos WHERE (usuario = " + this.servicio.rUsuario().id + " OR usuario = 0) AND grafico = " + (this.maestroActual - 4) + " ORDER BY usuario DESC LIMIT 1;";
    this.partes = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        this.texto_x = resp[0].texto_x;
        this.texto_y = resp[0].texto_y;
        this.titulo = resp[0].titulo;
        this.sub_titulo = resp[0].sub_titulo;
        this.mostrar_tabla = resp[0].mostrar_tabla;
        if (resp[0].texto_z)
        {
          this.verTodos=false;
          this.verBuenos=false;
          this.verMalos=false;
        
          let mensajes = resp[0].texto_z.split(";");
          if (mensajes[0] == 1 || mensajes[1] == 1 || mensajes[2] == 1)
          {
            this.verTodos=true;
          }
          if (mensajes[0] == 2 || mensajes[1] == 2 || mensajes[2] == 2)
          {
            this.verBuenos=true
          }
          if (mensajes[0] == 3 || mensajes[1] == 3 || mensajes[2] == 3)
          {
            this.verMalos = true;
          }
          this.texto_z = mensajes[3];
        }
      }
    });
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
    else if (this.maestroActual == 1)
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

  listarProcesos()
  {
    let sentencia = "SELECT id, nombre FROM sigma.cat_procesos ORDER BY nombre;"
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.procesos = resp;
    });
  }

  calcularFecha(evento: any)
  {
    this.detalleRegistro.desde = new Date();
    this.detalleRegistro.hasta = new Date();
    if (this.detalleRegistro.periodo == "2")
    {
      if (this.detalleRegistro.desde.getDay()==0) 
      {
        //domingo
        this.detalleRegistro.desde.setDate(this.detalleRegistro.desde.getDate() - 6);
      }
      else 
      {
        this.detalleRegistro.desde.setDate(this.detalleRegistro.desde.getDate() - (this.detalleRegistro.desde.getDay() - 1));
      }
    }
    else if (this.detalleRegistro.periodo == "3")
    {
      let nuevaFecha = this.servicio.fecha(1, '' , "yyyy/MM") + "/01";         
      this.detalleRegistro.desde = new Date(nuevaFecha);
    }
    else if (this.detalleRegistro.periodo == "4")
    {
      let nuevaFecha = this.servicio.fecha(1, '' , "yyyy") + "/01/01";         
      this.detalleRegistro.desde = new Date(nuevaFecha);
    }
    else if (this.detalleRegistro.periodo == "5")
    {
      this.detalleRegistro.desde = new Date();
      if (this.detalleRegistro.desde.getDay() == 0) 
      {
        this.detalleRegistro.desde.setDate(this.detalleRegistro.desde.getDate() - 13);
        this.detalleRegistro.hasta.setDate(this.detalleRegistro.hasta.getDate() - 7);
      }
      else 
      {
        this.detalleRegistro.hasta.setDate(this.detalleRegistro.hasta.getDate() - (this.detalleRegistro.hasta.getDay()));
        this.detalleRegistro.desde.setDate(this.detalleRegistro.desde.getDate() - (this.detalleRegistro.desde.getDay() - 1) - 7);
      }
    }
    else if (this.detalleRegistro.periodo == "6")
    {
      let mesTemp = new Date(this.datepipe.transform(new Date(this.detalleRegistro.desde), "yyyy/MM") + "/01");
      mesTemp.setDate(mesTemp.getDate() - 1);
      this.detalleRegistro.desde = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy/MM") + "/01");
      this.detalleRegistro.hasta = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy/MM/dd"));
    }
    else if (this.detalleRegistro.periodo == "7")
    {
      let mesTemp = new Date(this.datepipe.transform(new Date(this.detalleRegistro.desde), "yyyy") + "/01/01");
      mesTemp.setDate(mesTemp.getDate() - 1);
      this.detalleRegistro.desde = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy") + "/01/01");
      this.detalleRegistro.hasta = new Date(this.datepipe.transform(new Date(mesTemp), "yyyy") + "/12/31");
    }
  }

  accion(id: number)
  {
    if (id == 1)
    {
      if (this.detalleRegistro.periodo=="8" && new Date(this.detalleRegistro.desde) > new Date(this.detalleRegistro.hasta))
      {
        const respuesta = this.dialogo.open(DialogoComponent, {
          width: "400px", data: { titulo: "Incongruencia en período", mensaje: "La fecha inicial no puede ser mayor a la fecha final del reporte", alto: "50", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
        });
      }
      else
      {
        let filtro = " WHERE a.inicia >= '" + this.servicio.fecha(2, this.detalleRegistro.desde, "yyyy/MM/dd") + " 00:00:00' AND a.inicia <= '" + this.servicio.fecha(2, this.detalleRegistro.hasta, "yyyy/MM/dd") + " 23:59:59' ";
        let filtro_trazabilidad = " WHERE a.fecha_entrada >= '" + this.servicio.fecha(2, this.detalleRegistro.desde, "yyyy/MM/dd") + " 00:00:00' AND a.fecha_entrada <= '" + this.servicio.fecha(2, this.detalleRegistro.hasta, "yyyy/MM/dd") + " 23:59:59' ";
        let filtroD = "";
        if (this.detalleRegistro.reporte==1)
        {
          filtro = " AND a.inicio >= '" + this.servicio.fecha(2, this.detalleRegistro.desde, "yyyy/MM/dd") + " 00:00:00' AND a.inicio <= '" + this.servicio.fecha(2, this.detalleRegistro.hasta, "yyyy/MM/dd") + " 23:59:59' ";
        
        }
        if (this.detalleRegistro.periodo=="0")
        {
          if (this.detalleRegistro.reporte==2)
          {
            filtro = "";
          }
          else
          {
            filtro = " WHERE a.id >= 0 ";
            filtro_trazabilidad = " WHERE a.id >= 0 ";  
          }
        }
        if (this.detalleRegistro.parte > 0)
        {
          filtro = filtro + " AND a.parte = " + this.detalleRegistro.parte;
          filtro_trazabilidad = filtro_trazabilidad + " AND b.parte = " + this.detalleRegistro.parte;
          if (this.detalleRegistro.reporte==2)
          {
            filtroD = filtroD + " AND b.parte = " + this.detalleRegistro.parte;
          }
        }
        if (this.detalleRegistro.proceso > 0)
        {
          filtro = filtro + " AND a.proceso = " + this.detalleRegistro.proceso;
          filtro_trazabilidad = filtro_trazabilidad + " AND a.proceso = " + this.detalleRegistro.proceso;
          if (this.detalleRegistro.reporte==1)
          {
            filtroD = filtroD + " AND b.proceso = " + this.detalleRegistro.parte;
          }
        }
        if (this.detalleRegistro.estado > -1 && this.detalleRegistro.reporte==0)
        {
          filtro = filtro + " AND a.estado = " + this.detalleRegistro.estado;
        }
        this.registros = [];
        let sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.lotes a " + filtro ;
        let archivo = "reporte_de_lotes.csv";
        let nReporte = "Historico de lotes";
        if (this.detalleRegistro.reporte==3)
        {
          sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.calidad_historia a " + filtro ;
          archivo = "revision_calidad.csv";
          nReporte = "Historico de movimientos de calidad";
        }
        else if (this.detalleRegistro.reporte==1)
        {
          sentencia = "SELECT COUNT(*) AS cuenta FROM sigma.lotes_historia a " + filtro_trazabilidad
          archivo = "trazabilidad_de_lotes.csv";
          nReporte = "Historico de trazabilidad de lotes";
        }
        else if (this.detalleRegistro.reporte==2)
        {
          sentencia = "SELECT SUM(cuenta) FROM (SELECT COUNT(*) AS cuenta FROM sigma.alarmas a INNER JOIN sigma.lotes b ON a.lote = b.id " + filtroD + " WHERE (a.tipo <> 3 AND a.tipo <> 7) " + filtro + " UNION (SELECT COUNT(*) AS cuenta FROM sigma.alarmas a INNER JOIN sigma.cargas b ON a.lote = b.id WHERE (a.tipo = 3 OR a.tipo = 7) " + filtro + ")) AS qr01";
          archivo = "alarmas.csv";
          let nReporte = "Historico de alarms";
        }
        let campos = {accion: 100, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          if (resp[0].cuenta == 0)
          {
            const respuesta = this.dialogo.open(DialogoComponent, {
              width: "400px", data: { titulo: "No se encontraron datos", mensaje: "No se han hallado datos con los filtros especificados. Cambie los filtros e intente de nuevo", alto: "60", id: 0, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
            });

          }
          else
          {
            let sentencia = "SELECT 'id', 'Numero del lote', 'Fecha de entrada', 'Fecha de estimada de salida', 'Fecha real de salida', 'Tiempo total estimado (segundos)', 'Tiempo total ocupado (segundos)', 'Diferencia (estimado - real)', 'Estatus del registro', 'Referencia del nro de parte', 'Descripcion del nro de parte', 'Prioridad', 'Carga pre-asignada', 'Estado', 'Nombre del proceso actual', 'Nombre del equipo actual', 'Nombre de la operacion', 'Secuencia', 'Total inspecciones', 'Fecha de la últimma inspeccion', 'Causa de la últimma inspeccion', 'Usuario que efectuo la últimma inspeccion', 'Total rechazos', 'Fecha del últimmo rechazo', 'Causa del últimmo rechazo', 'Usuario que efectuó el ultimo rechazo', 'Total de alarmas', 'Tiempo de stock excedido', 'Tiempo de proceso excedido' UNION ALL SELECT a.id, a.numero, a.inicia, a.estimada, a.finaliza, a.tiempo, a.tiempo_estimado, (a.tiempo_estimado - a.tiempo), IF(a.estatus = 'A', 'activo', 'inactivo') AS estatus, IFNULL(d.referencia, 'N/A') AS referencia, IFNULL(d.nombre, 'N/A') AS producto, IFNULL((SELECT MIN(orden) FROM sigma.prioridades WHERE parte = a.parte AND proceso = a.proceso AND fecha >= NOW() AND estatus = 'A'), 'N/A') AS prioridad, j.carga  , CASE WHEN a.estado = 0 THEN 'En Espera' WHEN a.estado = 20 THEN 'En Stock' WHEN a.estado = 50 THEN 'En Proceso' WHEN a.estado = 80 THEN 'En Inspeccion' WHEN a.estado = 90 THEN 'Rechazado' WHEN a.estado = 99 THEN 'Finalizado' END as estado, IFNULL(e.nombre, 'N/A') AS nproceso, IFNULL(b.nombre, 'N/A') AS nequipo, IFNULL(c.nombre, 'N/A') AS nruta_detalle, ruta_secuencia, a.inspecciones, a.inspeccion, IFNULL(f.nombre, 'N/A') AS insp_causa, IFNULL(h.nombre, 'N/A') AS insp_por, a.rechazos, a.rechazo, IFNULL(g.nombre, 'N/A') AS recha_causa, IFNULL(i.nombre, 'N/A') AS recha_por, a.alarmas, IF(a.alarma_tse = 'S', 'Si', 'No'), IF(a.alarma_tpe = 'S', 'Si', 'No') FROM sigma.lotes a LEFT JOIN sigma.det_procesos b ON a.equipo = b.id LEFT JOIN sigma.det_rutas c ON a.ruta_detalle = c.id LEFT JOIN sigma.cat_partes d ON a.parte = d.id LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id LEFT JOIN sigma.cat_situaciones f ON a.inspeccion_id = f.id LEFT JOIN sigma.cat_situaciones g ON a.rechazo_id = g.id LEFT JOIN sigma.cat_usuarios h ON a.inspeccionado_por = h.id LEFT JOIN sigma.cat_usuarios i ON a.rechazado_por = i.id LEFT JOIN sigma.cargas j ON a.carga = j.id " + filtro + " "; 
            if (this.detalleRegistro.reporte==1)
            {
              sentencia = "SELECT 'Numero del lote', 'Numero de parte', 'Referencia', 'Secuencia', 'Operacion', 'Equipo', 'Fecha de entrada', 'Fecha de stock', 'Fecha de proceso', 'Fecha estimada de termino', 'Fecha real de termino', 'Tiempo de espera', 'Tiempo de stock', 'Tiempo de proceso', 'Tiempo real de operacion', 'Tiempo estimado de operacion', 'Diferencia (estimado - real)', 'Secuencia anterior', 'Operacion anterior', 'Alerta por salto', 'Total reversos' UNION ALL SELECT b.numero, IFNULL(c.nombre, 'N/A'), IFNULL(c.referencia, 'N/A'), a.ruta_secuencia, IFNULL(d.nombre, 'N/A'), IFNULL(e.nombre, 'N/A'), a.fecha_entrada, a.fecha_stock, a.fecha_proceso, a.fecha_estimada, a.fecha_salida, a.tiempo_espera, a.tiempo_stock, a.tiempo_proceso, a.tiempo_total, a.tiempo_estimado, (a.tiempo_estimado - a.tiempo_total), a.ruta_secuencia_antes, IFNULL(f.nombre, 'N/A'), IF(a.alarma_so = 'N', 'NO', 'SI'), a.reversos FROM sigma.lotes_historia a LEFT JOIN sigma.lotes b ON a.lote = b.id LEFT JOIN sigma.cat_partes c ON b.parte = c.id LEFT JOIN sigma.cat_procesos d ON a.proceso = d.id LEFT JOIN sigma.det_procesos e ON a.equipo = e.id LEFT JOIN sigma.cat_procesos f ON a.proceso_anterior = f.id " + filtro_trazabilidad + " "; 
            }
            else if (this.detalleRegistro.reporte==2)
            {
              sentencia = "SELECT 'ID de la alerta', 'Tipo de alerta', 'Lote/Carga', 'Descripcion (Numero de parte)', 'Referencia (número de parte)', 'Operacion', 'Inicio de la alerta', 'Fin de la alerta', 'Tiempo alertado' UNION SELECT a.id, CASE WHEN a.tipo = 1 THEN 'Tiempo de stock excedido' WHEN a.tipo = 2 THEN 'Tiempo de proceso excedido' WHEN a.tipo = 3 THEN 'Tiempo de programacion excedido' WHEN a.tipo = 4 THEN 'Salto de operacion' WHEN a.tipo = 5 THEN 'Antipacion de tiempo de stock' WHEN a.tipo = 6 THEN 'Antipacion de tiempo de proceso' WHEN a.tipo = 7 THEN 'Anticipacion de tiempo de programacion' END AS tipo, b.numero, IFNULL(d.nombre, 'N/A') AS producto, IFNULL(d.referencia, 'N/A') AS referencia, IFNULL(e.nombre, 'N/A') AS nproceso, a.inicio, a.fin, a.tiempo FROM sigma.alarmas a LEFT JOIN sigma.lotes b ON a.lote = b.id " + filtroD + " LEFT JOIN sigma.cat_partes d ON b.parte = d.id LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id WHERE (a.tipo <> 3 AND a.tipo <> 7) " + filtro + " UNION SELECT a.id, CASE WHEN a.tipo = 1 THEN 'Tiempo de stock excedido' WHEN a.tipo = 2 THEN 'Tiempo de proceso excedido' WHEN a.tipo = 3 THEN 'Tiempo de programacion excedido' WHEN a.tipo = 4 THEN 'Salto de operacion' WHEN a.tipo = 5 THEN 'Antipacion de tiempo de stock' WHEN a.tipo = 6 THEN 'Antipacion de tiempo de proceso' WHEN a.tipo = 7 THEN 'Anticipacion de tiempo de programacion' END AS tipo, b.carga, '', '', IFNULL(e.nombre, 'N/A') AS nproceso, a.inicio, a.fin, a.tiempo FROM sigma.alarmas a LEFT JOIN sigma.cargas b ON a.lote = b.id " + filtroD + " LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id WHERE (a.tipo = 3 OR a.tipo = 7) " + filtro + " ";
            }
            else if (this.detalleRegistro.reporte==3)
            {
              sentencia = "SELECT 'Lote', 'Descripcion (Numero de parte)', 'Referencia (número de parte)', 'Situacion', 'Tipo', 'Usuario', 'Operacion', 'Secuencia de la ruta', 'Inicio de la revision', 'Fin de la revision', 'Tiempo en revision' UNION ALL SELECT b.numero, IFNULL(d.nombre, 'N/A') AS producto, IFNULL(d.referencia, 'N/A') AS referencia, IFNULL(f.nombre, 'N/A') AS insp_causa, IF(a.tipo = 0, 'CALIDAD', 'SCRAP/RECHAZO/MERMA'), IFNULL(h.nombre, 'N/A') AS insp_por, IFNULL(e.nombre, 'N/A') AS nproceso, a.secuencia, a.inicia, a.finaliza, a.tiempo FROM sigma.calidad_historia a LEFT JOIN sigma.lotes b ON a.lote = b.id LEFT JOIN sigma.cat_partes d ON a.parte = d.id LEFT JOIN sigma.cat_procesos e ON a.proceso = e.id LEFT JOIN sigma.cat_situaciones f ON a.inspeccion_id = f.id LEFT JOIN sigma.cat_usuarios h ON a.inspeccionado_por = h.id " + filtro + " "; 
            }
            let campos = {accion: 100, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {

              if (resp.length > 0)
                {
                  this.servicio.generarReporte(resp, nReporte, archivo)
                }


              })
            }
          })
            //if (this.detalleRegistro.incluir_traza==0 && this.detalleRegistro.reporte==0)
            //{
            //  let sentencia = "SELECT 'Reporte de lotes (trazabilidad)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Fecha del reporte: " + this.servicio.fecha(1, "", "yyyy/MM/dd HH:mm:ss") + "', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Desde: " + this.servicio.fecha(2, this.detalleRegistro.desde, "dd-MMM-yyyy") + " Hasta: " + this.servicio.fecha(2, this.detalleRegistro.hasta, "dd-MMM-yyyy") + "', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '' UNION ALL SELECT 'Numero del lote', 'Numero de parte', 'Referencia', 'Secuencia', 'Operacion', 'Equipo', 'Fecha de entrada', 'Fecha de stock', 'Fecha de proceso', 'Fecha estimada de termino', 'Fecha real de termino', 'Tiempo de espera', 'Tiempo de stock', 'Tiempo de proceso', 'Tiempo real de operacion', 'Tiempo estimado de operacion', 'Diferencia (estimado - real)', 'Secuencia anterior', 'Operacion anterior', 'Alerta por salto', 'Total reversos' UNION ALL SELECT b.numero, IFNULL(c.nombre, 'N/A'), IFNULL(c.referencia, 'N/A'), a.ruta_secuencia, IFNULL(d.nombre, 'N/A'), IFNULL(e.nombre, 'N/A'), a.fecha_entrada, a.fecha_stock, a.fecha_proceso, a.fecha_estimada, a.fecha_salida, a.tiempo_espera, a.tiempo_stock, a.tiempo_proceso, a.tiempo_total, a.tiempo_estimado, (a.tiempo_estimado - a.tiempo_total), a.ruta_secuencia_antes, IFNULL(f.nombre, 'N/A'), IF(a.alarma_so = 'N', 'NO', 'SI'), a.reversos FROM sigma.lotes_historia a LEFT JOIN sigma.lotes b ON a.lote = b.id LEFT JOIN sigma.cat_partes c ON b.parte = c.id LEFT JOIN sigma.cat_procesos d ON a.proceso = d.id LEFT JOIN sigma.det_procesos e ON a.equipo = e.id LEFT JOIN sigma.cat_procesos f ON a.proceso_anterior = f.id " + filtro_trazabilidad + " "; 
            //  let campos = {accion: 150, sentencia: sentencia, archivo: 'archivo_usuario_detalle_' + this.servicio.rUsuario().id};  
            //  this.servicio.consultasBD(campos).subscribe( resp =>
            //  {
            //    this.http.get(this.URL_FOLDER + 'archivo_usuario_detalle_' + this.servicio.rUsuario().id + '.csv', {responseType: 'arraybuffer'})
            //    .subscribe((res) => {
            //        this.writeContents(res, 'trazabilidad_de_lotes.csv', 'text/csv'); 
            //    });
            //  })
            //}
          }
      }
    }
          
  writeContents(content, fileName, contentType) 
  {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  configuracion()
  {
    this.config = [];
    let sentencia = "SELECT * FROM sigma.configuracion";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp && resp.length > 0)
      { 
        this.estimado_productividad = resp[0].estimado_productividad
        this.textoEstimado = "Estimado (" + this.estimado_productividad + "%)";
        resp[0].bajo_color = resp[0].bajo_color.replace("HEX", "#"); 
        resp[0].medio_color = resp[0].medio_color.replace("HEX", "#"); 
        resp[0].alto_color = resp[0].alto_color.replace("HEX", "#"); 
        this.bajo_color_todo = "0px 0px 1px 2px " + resp[0].bajo_color
        this.medio_color_todo = "0px 0px 1px 2px " + resp[0].medio_color
        this.alto_color_todo = "0px 0px 1px 2px " + resp[0].alto_color
        this.config = resp[0];
      }
    }, 
    error => 
    {
      console.log(error)
    })
  }

  filtro()
  {
    const respuesta = this.dialogo.open(FiltroComponent, {
      width: "580px", data: { sesion: this.maestroActual- 4, periodo: this.periodoFecha, visualizar: this.visualizar, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
    });  
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        this.visualizar = result.visualizar;
        this.periodoFecha = result.periodo;
        this.fDesde = this.servicio.fecha(2,result.desde,"yyyy/MM/dd") + " 00:00:00";
        this.fHasta = this.servicio.fecha(2,result.hasta,"yyyy/MM/dd") + " 23:59:59";
        this.previaConsulta();        
      }
      else
      {
        if (result.accion == 2) 
        {
          this.visualizar = "S";
          this.periodoFecha = 0;
          this.aplicarConsulta(this.maestroActual);
        }
      }
    });
  }

  formato()
  {
    const respuesta = this.dialogo.open(FormatoComponent, {
      width: "580px", data: { sesion: this.maestroActual - 4, periodo: this.periodoFecha, visualizar: this.visualizar, accion: 0, botones: 1, boton1STR: "Aceptar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "", icono2: "", icono0: "iconshock-materialblack-mail-block" }
    });  
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        this.buscarConsulta()
      }
    });
  }

  cancelarAlarma(id: number)
  {
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "430px", height: "270px", data: { titulo: "Cancelar alarma activa ", mensaje: "Esta acción cancelrá la alarma seleccionada y enviará un mensaje de cancelación a los involucrados. ¿Desea continuar con esta operación?", alto: "60", id: 0, accion: 0, botones: 2, boton1STR: "Continuar y cancelar alarma", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-mail-block" }
    });
    respuesta.afterClosed().subscribe(result => {
      if (result.accion == 1) 
      {
        let sentencia = "UPDATE sigma.alarmas SET fin = NOW(), tiempo = TIME_TO_SEC(TIMEDIFF(NOW(), inicio)) WHERE id = " + this.registros[id].id + ";UPDATE sigma.vw_reportes SET estado = 9, atendida = NOW(), tiempo = TIME_TO_SEC(TIMEDIFF(NOW(), activada)) WHERE id NOT IN (SELECT reporte FROM sigma.alarmas WHERE tiempo = 0) AND estado <> 9;INSERT INTO sigma.mensajes (alerta, tipo, canal, destino, mensaje) SELECT a.alerta, (80 + a.tipo), a.canal, a.destino, CONCAT('ATENCION La alerta asociada al lote/carga ', '" + this.registros[id].numero + "', ' ha sido cancelada por el Administrador!') FROM sigma.mensajes a WHERE a.tipo <= 5 AND a.canal <> 4 AND a.alerta IN (SELECT id FROM sigma.vw_reportes WHERE estado = 9 AND informar_resolucion = 'S' AND informado = 'N') GROUP BY a.alerta, (80 + a.tipo), a.canal, a.destino, CONCAT('ATENCION La alerta asociada al lote/carga ', '" + this.registros[id].numero + "', ' ha sido cancelada por el Administrador!');INSERT INTO sigma.mensajes (alerta, tipo, canal, destino, mensaje) SELECT a.alerta, (80 + a.tipo), a.canal, a.destino, CONCAT('ALERTA LOTE o CARGA ', '" + this.registros[id].numero + "', ' CANCELADA') FROM sigma.mensajes a WHERE a.tipo <= 5 AND a.canal = 4 AND a.alerta IN (SELECT id FROM sigma.vw_reportes WHERE estado = 9 AND informar_resolucion = 'S' AND informado = 'N') GROUP BY a.alerta, (80 + a.tipo), a.canal, a.destino, CONCAT('ALERTA LOTE o CARGA ', '" + this.registros[id].numero + "', ' CANCELADA');UPDATE sigma.vw_reportes SET informado = 'S' WHERE estado = 9 AND informar_resolucion = 'S' AND informado = 'N';UPDATE sigma.lotes SET " + ( + this.registros[id].tipo == 1 || this.registros[id].tipo == 5 ? "alarma_tse_paso = 'N', alarma_tse = 'N', alarma_tse_p = 'N' " : "alarma_tpe_paso = 'N', alarma_tpe = 'N', alarma_tpe_p = 'N'") + " WHERE id = " + this.registros[id].id;
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
        });
      }
  })
}

  previaConsulta()
  {
    let sentencia = "SELECT * FROM sigma.consultas_cab WHERE id = " + this.servicio.rConsulta() + ";";
    this.partes = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.visualizar = "N"
      this.periodoFecha = 0;
      this.casSQLAdicional = "";
      this.buscarOperaciones = false;
      this.buscarPartes = false;
      if (resp.length > 0)
      {
        this.visualizar = resp[0].visualizar
        this.periodoFecha = resp[0].periodo
        this.casSQLAdicional = "";
        this.buscarOperaciones = resp[0].filtrooper > 0;
        this.buscarPartes = resp[0].filtronpar > 0;
      }
      this.aplicarConsulta(this.maestroActual)
    });
    
  }

  refrescar()
  {
    this.verRegistro = 0;
    this.ventanaViene = 2;
    this.verPantalla(this.maestroActual );
    //this. ();
  }

  exportar()
  {
    let nombreReporte = "cumplimiento_por_operacion.csv";
    if (this.maestroActual==2)
    {
      nombreReporte = "variacion_por_operacion.csv";
    }
    else if (this.maestroActual==3)
    {
      nombreReporte = "variacion_por_numeroparte.csv";
    }
    else if (this.maestroActual==5)
    {
      nombreReporte = "entrega_por_semana.csv";
    }
    else if (this.maestroActual==7)
    {
      nombreReporte = "productividad_operacion.csv";
    }
    let campos = {accion: 100, sentencia: this.sentenciaR};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        this.servicio.generarReporte(resp, this.tituloReporte, nombreReporte)
      }
    })
  }

  cadaSegundo()
  {
    
      if (this.cronometrando || this.maestroActual != 4) 
      {
        return;
      }
      this.cronometrando = true;
      
      let sentencia = "SELECT a.*, CASE WHEN a.tipo = 1 THEN 'Tiempo de stock excedido' WHEN a.tipo = 2 THEN 'Tiempo de proceso excedido' WHEN a.tipo = 3 THEN 'Tiempo de programación excedido' WHEN a.tipo = 4 THEN 'Salto de operacion' WHEN a.tipo = 5 THEN 'Antipación de tiempo de stock' WHEN a.tipo = 6 THEN 'Antipación de tiempo de proceso' WHEN a.tipo = 7 THEN 'Anticipacion de tiempo de programacion' END AS nombre_alerta, b.numero, c.nombre, c.referEncia FROM sigma.alarmas a LEFT JOIN sigma.lotes b ON a.lote = b.id  LEFT JOIN sigma.cat_partes c ON b.parte = c.id WHERE ISNULL(a.fin) AND tipo <> 4 ORDER BY a.inicio";
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
          };
        }
        if (actualizar)
        {
          this.registros = resp;
          this.arrFiltrado = resp;
        }

        Object.keys(this.registros).forEach((elemento, index) => 
        {
          let segundos = [];
          segundos =  this.servicio.tiempoTranscurrido(this.registros[index].inicio, "").split(";");
          this.registros[index].transcurrido = segundos[1] + ":" + (+segundos[2] < 10 ? "0" + segundos[2] : segundos[2]) + ":" + (+segundos[3] < 10 ? "0" + segundos[3] : segundos[3]);
          this.contarRegs();
        }); 
      });
    this.cronometrando = false;
  }

  exportarImagen()
  {
    this.chart.instance.exportTo((this.maestroActual == 5 ? "entrega_semanal" : (this.maestroActual == 6 ? "productividad_operacion" : "productividad_parte")), 'PNG');
  }

  
}
