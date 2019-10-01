import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-sesion',
  templateUrl: './sesion.component.html',
  styleUrls: ['./sesion.component.css']
})
export class SesionComponent implements OnInit {

  colorLetrasBotones: string = "";
  colorLetrasBotonesDes: string = "";
  colorFondoBoton: string = "";
  claveInicializada: boolean = false;
  claveIncorrecta: boolean = false;
  
  colorLetrasTitulo: string = "";
  colorBarraSuperior: string = "";
  
  colorSN: string = "";
  colorLetrasBox: string = "";
  colorFondo: string = "";
  colorFondoCabecera: string = "";
  colorBorde: string = "";
  colorFondoTarjeta: string = "";
  
  visibilidad: string = "password";
  visibilidad2: string = "password";
  visibilidad3: string = "password";
  visibilidad1: string = "password";
  causas = [];  
  fase: number = 1;

  constructor(
    private servicio: ServicioService,
    public dialogRef: MatDialogRef<SesionComponent>, 
    @Inject(MAT_DIALOG_DATA) public datos: any
    
  ) 
  {
    this.datos.clave = "";
    this.colorear();
    this.datos.nuevaClave = "";
    this.datos.nuevaClaveCon = "";
    this.mostrarInit();
  }


  @ViewChild("txtNvaClave", { static: false }) txtNvaClave: ElementRef;
  @ViewChild("txtUsuario", { static: false }) txtUsuario: ElementRef;
  @ViewChild("txtclaveActual", { static: false }) txtclaveActual: ElementRef;

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

  mostrarInit()
  {
    this.claveInicializada = false;
    let sentencia = "SELECT id, inicializada FROM sigma.cat_usuarios WHERE id = " + this.datos.idUsuario;
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        this.claveInicializada = resp[0].inicializada == "S";
        if (this.claveInicializada)
        {
          this.datos.claveActual = "abcdefghijk";
        }
      }
    });
  }

  validar(id: number)
  {
    if (this.datos.sesion == 1)
    {
      if (id==1)
      {
        let sentencia = "SELECT id, estatus, inicializada, rol, inventario, programacion FROM sigma.cat_usuarios WHERE referencia = '" + this.datos.usuario + "' AND (clave = '" + this.datos.clave + "' OR inicializada = 'S');";
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
          else if (resp[0].inicializada == 'S')
          {
            this.datos.idUsuario = resp[0].id;
            this.datos.titulo = "Contraseña inicializada"
            this.datos.sesion = 2;
            setTimeout(() => {
              this.txtNvaClave.nativeElement.focus();  
            }, 300);
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class";
            mensajeCompleto.mensaje = "El Administrador ha sido inicializada su contraseña. Sirvase a establecer una nueva";
            mensajeCompleto.tiempo = 3000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
            
          }
          else if (this.datos.sesion == 2) 
          {
            this.datos.sesion = 1;
            setTimeout(() => {
              this.txtUsuario.nativeElement.focus();  
            }, 300);
          }
          else if (this.datos.rolBuscar == "/") 
          { 
            if (resp[0].rol=="C") 
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "custom-class-red";
              mensajeCompleto.mensaje = "El usuario '" + this.datos.usuario + "' NO tiene privilegios suficientes para realizar esta operación";
              mensajeCompleto.tiempo = 3000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
            }
            else
            {
              this.datos.idUsuario = resp[0].id;
              this.datos.accion = id;
              this.dialogRef.close(this.datos);
            }
          }
          else if (this.datos.rolBuscar == "-") 
          { 
            if ((resp[0].rol=="C" || resp[0].rol=="O") && resp[0].inventario!="S") 
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "custom-class-red";
              mensajeCompleto.mensaje = "El usuario '" + this.datos.usuario + "' NO tiene privilegios suficientes para realizar esta operación";
              mensajeCompleto.tiempo = 3000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
            }
            else
            {
              this.datos.idUsuario = resp[0].id;
              this.datos.accion = id;
              this.dialogRef.close(this.datos);
            }
          }
          else if (this.datos.opcionSel == 21) 
          { 
            if ((resp[0].rol=="C" || resp[0].rol=="O") && resp[0].programacion!="S") 
            {
              let mensajeCompleto: any = [];
              mensajeCompleto.clase = "custom-class-red";
              mensajeCompleto.mensaje = "El usuario '" + this.datos.usuario + "' NO tiene privilegios suficientes para realizar esta operación";
              mensajeCompleto.tiempo = 3000;
              this.servicio.mensajeToast.emit(mensajeCompleto);
            }
            else
            {
              this.datos.idUsuario = resp[0].id;
              this.datos.accion = id;
              this.dialogRef.close(this.datos);
            }
          }
          else if (resp[0].rol != this.datos.rolBuscar && resp[0].rol != "A" && this.datos.rolBuscar != "*")
          {
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class-red";
            mensajeCompleto.mensaje = "El usuario '" + this.datos.usuario + "' NO tiene privilegios suficientes para realizar esta operación";
            mensajeCompleto.tiempo = 3000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          }
          else
          {
            this.datos.idUsuario = resp[0].id;
            this.datos.accion = id;
            this.dialogRef.close(this.datos);
          }
        })
      }
      else if (id == 2)
      {
        this.datos.accion = id;
        this.dialogRef.close(this.datos);
      }
    }
    else if (this.datos.sesion==2)
    {
      if (id == 1)
      {
        let sentencia = "UPDATE sigma.cat_usuarios SET inicializada = 'N', clave = '" + this.datos.nuevaClave + "' WHERE id = " + this.datos.idUsuario;
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe( resp =>
        {
          this.datos.accion = id;
          this.dialogRef.close(this.datos);
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class";
          mensajeCompleto.mensaje = "La contraseña ha sido establecida satisfactoriamente";
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        })
      }
      else if (id == 2)
      {
        if (this.datos.sesion = 2) 
        {
          this.datos.titulo = "Sesión de usuario"
          this.datos.sesion = 1;
          this.txtUsuario.nativeElement.focus();
        }
      }

    }
    else if (this.datos.sesion==3)
    {
      if (id == 1)
      {
        if (!this.claveInicializada)
        {
          let sentencia = "SELECT clave FROM sigma.cat_usuarios WHERE id = " + this.datos.idUsuario;
          let campos = {accion: 100, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            if (resp[0].clave != this.datos.claveActual)
            {
              this.claveIncorrecta = true;
              this.txtclaveActual.nativeElement.focus();
            }
            else
            {
              let sentencia = "UPDATE sigma.cat_usuarios SET inicializada = 'N', clave = '" + this.datos.nuevaClave + "' WHERE id = " + this.datos.idUsuario;
              let campos = {accion: 200, sentencia: sentencia};  
              this.servicio.consultasBD(campos).subscribe( resp =>
              {
                this.datos.accion = id;
                this.dialogRef.close(this.datos);
                let mensajeCompleto: any = [];
                mensajeCompleto.clase = "custom-class";
                mensajeCompleto.mensaje = "La contraseña ha sido cambiada satisfactoriamente";
                mensajeCompleto.tiempo = 2000;
                this.servicio.mensajeToast.emit(mensajeCompleto);
              })
            }
          })  
        }
        else
        {
          let sentencia = "UPDATE sigma.cat_usuarios SET inicializada = 'N', clave = '" + this.datos.nuevaClave + "' WHERE id = " + this.datos.idUsuario;
          let campos = {accion: 200, sentencia: sentencia};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            this.datos.accion = id;
            this.dialogRef.close(this.datos);
            let mensajeCompleto: any = [];
            mensajeCompleto.clase = "custom-class";
            mensajeCompleto.mensaje = "La contraseña ha sido cambiada satisfactoriamente";
            mensajeCompleto.tiempo = 2000;
            this.servicio.mensajeToast.emit(mensajeCompleto);
          })
        }
      }
      else if (id == 2)
      {
        this.datos.accion = id;
        this.dialogRef.close(this.datos);
      }
    }
  }
}

