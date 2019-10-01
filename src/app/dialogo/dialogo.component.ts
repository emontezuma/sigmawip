import { Component, OnInit, Inject } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-dialogo',
  templateUrl: './dialogo.component.html',
  styleUrls: ['./dialogo.component.css']
})

export class DialogoComponent implements OnInit {

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
  
  visibilidad: string = "password";
  causas = [];  

  constructor(
    private servicio: ServicioService,
    public dialogRef: MatDialogRef<DialogoComponent>, 
    @Inject(MAT_DIALOG_DATA) public datos: any
    
  ) 
  {
    this.datos.claves = "";
    this.datos.causa = -1;
    this.colorear();
    this.listarCausas();
  }

  ngOnInit() {
  }


  listarCausas()
  {
    if (this.datos.revision > -1)
    {
      let sentencia = "SELECT id, nombre FROM sigma.cat_situaciones WHERE tipo = " + this.datos.revision + " ORDER BY nombre;"
      this.causas = [];
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        this.causas = resp;
      });
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

  validar(id: number)
  {
    if (id==1 && this.datos.clave >= 1)
    {
      let sentencia = "SELECT id, calidad, reversos, estatus FROM sigma.cat_usuarios WHERE referencia = '" + this.datos.usuario + "' AND clave = '" + this.datos.claves + "';";
      let campos = {accion: 100, sentencia: sentencia};  
      this.servicio.consultasBD(campos).subscribe( resp =>
      {
        if (resp.length == 0)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El usuario o la contraseña no son válidos";
          mensajeCompleto.tiempo = 3000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].estatus != "A")
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El usuario '" + this.datos.usuario + "' NO está activo en el sistema"
          mensajeCompleto.tiempo = 3000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].calidad != "S" && this.datos.clave < 4)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El usuario '" + this.datos.usuario + "' NO tiene privilegios suficientes para realizar esta operación";
          mensajeCompleto.tiempo = 3000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else if (resp[0].reversos != "S" && this.datos.clave == 4)
        {
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "El usuario '" + this.datos.usuario + "' NO tiene privilegios suficientes para realizar reversos";
          mensajeCompleto.tiempo = 3000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        }
        else 
        {
          this.datos.usuarioCalidad = resp[0].id;
          this.datos.accion = id;
          if (this.datos.causa>-1)
          {
            this.datos.causaC = this.causas[this.datos.causa].id;
            this.datos.causaD = this.causas[this.datos.causa].nombre;
          }
          this.dialogRef.close(this.datos);
        }
      })
    }
    else
    {
      this.datos.accion = id;
      this.dialogRef.close(this.datos);
    }
    
  }

}
