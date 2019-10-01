import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelectionList, MatDialog } from '@angular/material';
import { DatePipe } from '@angular/common'
import { DialogoComponent } from '../dialogo/dialogo.component';

@Component({
  selector: 'app-formato',
  templateUrl: './formato.component.html',
  styleUrls: ['./formato.component.css']
})
export class FormatoComponent implements OnInit {

  constructor(
    private servicio: ServicioService,
    public dialogRef: MatDialogRef<FormatoComponent>, 
    public datepipe: DatePipe,
    public dialogo: MatDialog, 
    @Inject(MAT_DIALOG_DATA) public datos: any
    
  ) 
  {
    this.detalleRegistro.periodo = this.datos.periodo;
    this.detalleRegistro.desde = new Date();
    this.detalleRegistro.hasta = new Date();
    this.detalleRegistro.visualizar = this.datos.visualizar;
    
    this.colorear();
    this.buscarConsulta();
   }

   @ViewChild("txtNombre", { static: false }) txtNombre: ElementRef;
   @ViewChild("listaPartes", { static: false }) listaPartes: MatSelectionList;
   @ViewChild("listaProcesos", { static: false }) listaProcesos: MatSelectionList;

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
  detalleRegistro: any = [];
  procesos: any = [];
  consultas: any = [];
  partes: any = [];
  errorFecha: boolean = false;
  eliminar: boolean = false;
  uda01: string = "Elimina la consulta seleccionada";
  seleccionProcesos = ["1", "2", "3"];
  hayGrafica: boolean = false;

  ngOnInit() {
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

  validar(id: number)
  {
    if (id==1)
    {
      let todos = false;
      let ok = false;
      let demorados = false;
      var i;
      for (i = 0; i < this.seleccionProcesos.length; i++ )
      {
        if (!todos)
        {
          todos = this.seleccionProcesos[i] == "1";
        }        
        if (!ok)
        {
          ok = this.seleccionProcesos[i] == "2"; 
        }
        if (!demorados)
        {
          demorados = this.seleccionProcesos[i] == "3";
        } 
        
      }
      let cadValores = "";
      if (todos)
      {
        cadValores = cadValores + "1;"
      }
      if (ok)
      {
        cadValores = cadValores + "2;"
      }
      if (demorados)
      {
        cadValores = cadValores + "3;"
      }
      let sentencia = "UPDATE sigma.pu_graficos SET titulo = '" + this.detalleRegistro.titulo + "', sub_titulo = '" + this.detalleRegistro.sub_titulo + "', mostrar_tabla = '" + this.detalleRegistro.mostrar_tabla + "', texto_x = '" + this.detalleRegistro.texto_x + "', texto_y = '" + this.detalleRegistro.texto_y + "', texto_z = '" +  cadValores + "' WHERE grafico = " + this.datos.sesion + " AND usuario = " + this.servicio.rUsuario().id;
      if (!this.hayGrafica)
      {
        sentencia = "INSERT INTO sigma.pu_graficos (usuario, grafico, titulo, sub_titulo, texto_x, texto_y, texto_z, mostrar_tabla)  VALUES (" + this.servicio.rUsuario().id + ", " + this.datos.sesion + ", '" + this.detalleRegistro.titulo + "', '" + this.detalleRegistro.sub_titulo + "', '" + this.detalleRegistro.texto_x + "', '" + this.detalleRegistro.texto_y + "', '" +  cadValores + "', '" + this.detalleRegistro.mostrar_tabla + "');";
      }
      let campos = {accion: 200, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        this.datos.accion = id;
        this.dialogRef.close(this.datos);  
      }); 
    }
    {
      this.datos.accion = id;
      this.dialogRef.close(this.datos);
    }
  }

  
  buscarConsulta()
  {
    let sentencia = "SELECT * FROM sigma.pu_graficos WHERE (usuario = " + this.servicio.rUsuario().id + " OR usuario = 0) AND grafico = " + this.datos.sesion + " ORDER BY usuario DESC LIMIT 1;";
    this.partes = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        this.hayGrafica = resp[0].usuario == 1;
        this.detalleRegistro = resp[0];
        if (this.detalleRegistro.texto_z)
        {
          this.seleccionProcesos=[];
          let mensajes = this.detalleRegistro.texto_z.split(";");
          if (mensajes[0] == 1 || mensajes[1] == 1 || mensajes[2] == 1)
          {
            this.seleccionProcesos[0]="1";
          }
          if (mensajes[0] == 2 || mensajes[1] == 2 || mensajes[2] == 2)
          {
            this.seleccionProcesos[1]="2";
          }
          if (mensajes[0] == 3 || mensajes[1] == 3 || mensajes[2] == 3)
          {
            this.seleccionProcesos[2]="3";
          }
        }
      }
    });
  }
 
  
}
