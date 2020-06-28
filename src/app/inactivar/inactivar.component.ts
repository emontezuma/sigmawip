import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelectionList, MatDialog } from '@angular/material';
import { DatePipe } from '@angular/common'
import { DialogoComponent } from '../dialogo/dialogo.component';

@Component({
  selector: 'app-inactivar',
  templateUrl: './inactivar.component.html',
  styleUrls: ['./inactivar.component.css']
})
export class InactivarComponent implements OnInit {

  constructor(

    private servicio: ServicioService,
    public dialogRef: MatDialogRef<InactivarComponent>, 
    public datepipe: DatePipe,
    public dialogo: MatDialog, 
    @Inject(MAT_DIALOG_DATA) public datos: any

  ) 
  {
    this.detalleRegistro.titulo = "";
    
    this.colorear();
   }

   @ViewChild("txtNombre", { static: false }) txtNombre: ElementRef;

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
  tituloBoton: string = "Inactivar";
  nroParte: string = "Prueba";
  ruta_secuencia: string = "";
  referencia: string = "";
  nombre: string = "";
  nproceso: string = "";
  estatusActual: string = "";
  loteHallado: boolean = false;

  ngOnInit() {
  }

  buscarLote()
  {
    this.loteHallado = false;
    let sentencia = "SELECT a.estatus, a.ruta_secuencia, IFNULL(b.referencia, 'N/A') AS referencia, IFNULL(b.nombre, 'N/A') AS nombre, IFNULL(c.nombre, 'N/A') AS nproceso FROM sigma.lotes a LEFT JOIN sigma.cat_partes b ON a.parte = b.id LEFT JOIN sigma.cat_procesos c ON a.proceso = c.id WHERE a.numero = '" + this.detalleRegistro.titulo + "'";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length>0)
        {
          this.ruta_secuencia = resp[0].ruta_secuencia;
          this.referencia = resp[0].referencia;
          this.nombre = resp[0].nombre;
          this.nproceso = resp[0].nproceso;
          this.loteHallado = true;
          if (resp[0].estatus == 'A')
          {
            this.estatusActual = "ACTIVO";
            this.tituloBoton = "Inactivar";
          }
          else
          {
            this.estatusActual = "INACTIVO";
            this.tituloBoton = "Reactivar";
          }
        }
        
        else
        {
          this.ruta_secuencia = "";
          this.referencia = "";
          this.nombre = "";
          this.nproceso = "";
          this.estatusActual = "";
          
          this.loteHallado = false;
        }
      })
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
    if (id == 1)
    {
      let sentencia = "UPDATE sigma.lotes SET estatus = '" + (this.tituloBoton == "Inactivar" ? "I" : "A") + "' WHERE numero = '" + this.detalleRegistro.titulo + "'";
      let campos = {accion: 200, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        
        this.detalleRegistro.titulo = "";
        this.ruta_secuencia = "";
        this.referencia = "";
        this.nombre = "";
        this.nproceso = "";
        this.estatusActual = "";
        this.loteHallado = false;
        let mensajeCompleto: any = [];
        mensajeCompleto.clase = "custom-class";
        mensajeCompleto.mensaje = this.tituloBoton == "Inactivar" ? "El lote ha sido inactivado" : "El lote ha sido reactivado";
        mensajeCompleto.tiempo = 3000;
        this.servicio.mensajeToast.emit(mensajeCompleto);
        this.tituloBoton = "Inactivar";
        setTimeout(() => {
          this.txtNombre.nativeElement.focus();  
        }, 300);
      })
    }
    else
    {
      this.datos.accion = id;
      this.dialogRef.close(this.datos);
    }
      
    }

    iniLote()
    {
      this.ruta_secuencia = "";
      this.referencia = "";
      this.nombre = "";
      this.nproceso = "";
      this.estatusActual = "";
      this.loteHallado = false;
    }

}
