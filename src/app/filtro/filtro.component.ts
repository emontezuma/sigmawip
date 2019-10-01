import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { ServicioService } from '../servicio/servicio.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelectionList, MatDialog } from '@angular/material';
import { DatePipe } from '@angular/common'
import { DialogoComponent } from '../dialogo/dialogo.component';


@Component({
  selector: 'app-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.css']
})
export class FiltroComponent implements OnInit {

  constructor(
    private servicio: ServicioService,
    public dialogRef: MatDialogRef<FiltroComponent>, 
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
    this.listarConsultas();
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
  selPartes: number = 1;
  selOperaciones: number = 1;
  selPartesT: string = "S";
  selOperacionesT: string = "S";
  ayuda01: string = "Elimina la consulta seleccionada";

  ngOnInit() {
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
      if (this.detalleRegistro.periodo == "8" && new Date(this.detalleRegistro.desde) > new Date(this.detalleRegistro.hasta))
      {
        this.errorFecha = true;
      }
      else
      {
        if (this.detalleRegistro.selPartes==2 && this.listaPartes.selectedOptions.selected.length==0)
        {
          this.detalleRegistro.selPartes=1;
        }
        if (this.detalleRegistro.selOperaciones==2 && this.listaProcesos.selectedOptions.selected.length==0)
        {
          this.detalleRegistro.selPartes=1;
        }
        this.datos.periodo = this.detalleRegistro.periodo;
        this.datos.desde = this.detalleRegistro.desde;
        this.datos.hasta = this.detalleRegistro.hasta;
        this.datos.visualizar = this.detalleRegistro.visualizar;
        let cadCabecera = "";
        if (!this.detalleRegistro.consulta && (!this.detalleRegistro.nombre || this.detalleRegistro.nombre.length==0))
        {
          cadCabecera = "DELETE FROM sigma.consultas_det WHERE consulta IN (SELECT id FROM consultas_cab WHERE general = 'S' AND usuario = " + this.servicio.rUsuario().id + ");DELETE FROM consultas_cab WHERE general = 'S' AND usuario = " + this.servicio.rUsuario().id + ";INSERT INTO consultas_cab (usuario, periodo, desde, hasta, filtrooper, filtronpar, visualizar, general) VALUES (" + this.servicio.rUsuario().id + ", " + this.detalleRegistro.periodo + ", '" +  this.servicio.fecha(2, this.detalleRegistro.desde, "yyyy/MM/dd") + " 00:00:00"+ "', '" + this.servicio.fecha(2, this.detalleRegistro.hasta, "yyyy/MM/dd") + " 23:59:59"+ "', " + (this.selOperaciones==1 ? "0" : this.listaProcesos.selectedOptions.selected.length) + ", " + (this.selPartes==1 ? 0 : this.listaPartes.selectedOptions.selected.length) + ", '" + this.detalleRegistro.visualizar + "', 'S');"
          let campos = {accion: 200, sentencia: cadCabecera};  
          this.servicio.consultasBD(campos).subscribe(resp =>
          {
            let sentencia = "SELECT MAX(id) AS numero FROM sigma.consultas_cab;"
            let campos = {accion: 100, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              this.detalleRegistro.consulta = resp[0].numero;
              this.guardarDetalle();
            })
          }); 
        }
        else if (!this.detalleRegistro.consulta)
        {
          cadCabecera = "INSERT INTO consultas_cab (nombre, usuario, periodo, desde, hasta, filtrooper, filtronpar, visualizar) VALUES ('" + this.detalleRegistro.nombre + "', " + this.servicio.rUsuario().id + ", " + this.detalleRegistro.periodo + ", '" +  this.servicio.fecha(2, this.detalleRegistro.desde, "yyyy/MM/dd") + " 00:00:00"+ "', '" + this.servicio.fecha(2, this.detalleRegistro.hasta, "yyyy/MM/dd") + " 23:59:59"+ "', " + (this.selOperaciones==1 ? "0" : this.listaProcesos.selectedOptions.selected.length) + ", " + (this.selPartes==1 ? 0 : this.listaPartes.selectedOptions.selected.length) + ", '" + this.detalleRegistro.visualizar + "');"
          let campos = {accion: 200, sentencia: cadCabecera};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            let sentencia = "SELECT MAX(id) AS numero FROM sigma.consultas_cab;"
            let campos = {accion: 100, sentencia: sentencia};  
            this.servicio.consultasBD(campos).subscribe( resp =>
            {
              this.detalleRegistro.consulta = resp[0].numero;
              this.guardarDetalle();
            })
            
          }); 
        }
        else if (this.detalleRegistro.consulta>0)
        {
          cadCabecera = "UPDATE consultas_cab SET nombre = '" + this.detalleRegistro.nombre + "', periodo = " + this.detalleRegistro.periodo + " desde = '" + this.servicio.fecha(2, this.detalleRegistro.desde, "yyyy/MM/dd") + " 00:00:00', hasta = '" + this.servicio.fecha(2, this.detalleRegistro.hasta, "yyyy/MM/dd") + " 23:59:59', filtrooper = " + this.selOperaciones == "1" ? "0" : this.listaProcesos.selectedOptions.selected.length + ", filtronpar " + (this.selPartes==1 ? 0 : this.listaPartes.selectedOptions.selected.length) + ", visualizar = '" + this.detalleRegistro.visualizar + "' WHERE id = " +this.detalleRegistro.consulta;
          let campos = {accion: 200, sentencia: cadCabecera};  
          this.servicio.consultasBD(campos).subscribe( resp =>
          {
            this.guardarDetalle();
          })
        }
      }
    }
    else
    {
      this.datos.accion = id;
      this.dialogRef.close(this.datos);
    }
  }

  guardarDetalle()
  {
    let cadAgregar = "INSERT INTO consultas_det (consulta, tabla, valor) VALUES "
    var i;
    for (i = 0; i < this.listaPartes.selectedOptions.selected.length; i++ )
    {
      cadAgregar = cadAgregar + "(" + this.detalleRegistro.consulta + ", 1, " + this.listaPartes.selectedOptions.selected[i].value + "),";  
    }
    for (i = 0; i < this.listaProcesos.selectedOptions.selected.length; i++ )
    {
      cadAgregar = cadAgregar + "(" + this.detalleRegistro.consulta + ", 2, " + this.listaProcesos.selectedOptions.selected[i].value + "),";  
    }
    cadAgregar = cadAgregar.substr(0, cadAgregar.length - 1) + ";";
    
    let campos = {accion: 200, sentencia: cadAgregar};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.servicio.aConsulta(this.detalleRegistro.consulta);
      this.datos.accion = 1;
      this.dialogRef.close(this.datos);
    });
  }

  buscarConsulta()
  {
    let sentencia = "SELECT * FROM sigma.consultas_cab WHERE id = " + this.servicio.rConsulta() + ";";
    this.partes = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp.length > 0)
      {
        if (resp[0].general=="N")
        {
          this.detalleRegistro.nombre = resp[0].nombre
          this.eliminar = true;
        }
        else
        {
          this.detalleRegistro.nombre = ""
          this.eliminar = false;
        }
        this.detalleRegistro.visualizar = resp[0].visualizar
        this.detalleRegistro.nombre = resp[0].nombre
        this.detalleRegistro.periodo = resp[0].periodo
        this.selOperaciones = resp[0].filtrooper == 0 ? 1 : 2;
        this.selPartes = resp[0].filtronpar == 0 ? 1 :2;
        if (this.detalleRegistro.periodo == 8)
        {
          this.detalleRegistro.desde = new Date(this.detalleRegistro.desde);
          this.detalleRegistro.hasta = new Date(this.detalleRegistro.hasta);
        }
        else
        {
          this.detalleRegistro.desde = new Date();
          this.detalleRegistro.hasta = new Date();
        }
      }
      else
      {
        this.eliminar = false;
        this.detalleRegistro.desde = new Date();
        this.detalleRegistro.hasta = new Date();
      }
      this.listarProcesos();
      this.listarPartes();
    });
  }

  listarPartes()
  {
    let sentencia = "SELECT a.id, a.nombre, 1 AS seleccionado FROM sigma.cat_partes a ORDER BY a.nombre;"
    if (this.selPartes == 2)
    {
      sentencia = "SELECT a.id, a.nombre, IF(ISNULL(b.valor), 0, 1) AS seleccionado FROM sigma.cat_partes a LEFT JOIN sigma.consultas_det b ON b.valor = a.id AND b.tabla = 1 ORDER BY a.nombre;"
    }
    
    this.partes = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.partes = resp;
      
    });
  }

  listarProcesos()
  {
    let sentencia = "SELECT a.id, a.nombre, 1 AS seleccionado FROM sigma.cat_procesos a ORDER BY a.nombre;"
    if (this.selOperaciones == 2)
    {
      sentencia = "SELECT a.id, a.nombre, IF(ISNULL(b.valor), 0, 1) AS seleccionado FROM sigma.cat_procesos a LEFT JOIN sigma.consultas_det b ON b.valor = a.id AND b.tabla = 2 ORDER BY a.nombre;"
    }
    
    this.procesos = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.procesos = resp;
    });
  }

  listarConsultas()
  {
    let sentencia = "SELECT id, nombre FROM sigma.consultas_cab WHERE usuario = " + this.servicio.rUsuario().id + " AND general <> 'S' ORDER BY nombre;";
    this.consultas = [];
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      this.consultas = resp;
    });
  }

  cConsulta(event: any) 
  {
    this.eliminar = event.value != 0;
    if (event.value == 0) {
      setTimeout(() => {
        this.txtNombre.nativeElement.focus();  
      }, 100);
      
    }
  }
  
  
  seleccion(tipo: number, event: any) 
  {
    if (tipo == 1)
    {
      if (event.value == 1) {
        this.partes.forEach((arreglo, index) => {
          this.partes[index].seleccionado = 1;
        });
      }
      else if (event.value == 0) {
        this.partes.forEach((arreglo, index) => {
          this.partes[index].seleccionado = 0;
        });
      }
      setTimeout(() => {
        this.selPartesT = "S";  
      }, 100);
      
    }
    else if (tipo == 2)
    {
      if (event.value == 1) {
        this.procesos.forEach((arreglo, index) => {
          this.procesos[index].seleccionado = 1;
        });
      }
      else if (event.value == 0) {
        this.procesos.forEach((arreglo, index) => {
          this.procesos[index].seleccionado = 0;
        });
      }
      setTimeout(() => {
        this.selOperacionesT = "S";  
      }, 100);
      
    }
    
  }

  eliminarConsulta()
  {
    const respuesta = this.dialogo.open(DialogoComponent, {
      width: "430px", height: "260px", data: { titulo: "Eliminar consulta", mensaje: "Esta acción eliminará permanentemente la consulta actual y ya no podrá ser usada en el sistema<br>¿Desea continuar con la operación?", alto: "80", id: 0, accion: 0, botones: 2, boton1STR: "Continuar y eliminar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-mail-block" }
    });
    respuesta.afterClosed().subscribe(result => 
    {
      if (result.accion == 1) 
      {
        let sentencia = "DELETE sigma.consultas_cab WHERE id = " + this.detalleRegistro.consulta + ";DELETE sigma.consultas_det WHERE consulta = " + this.detalleRegistro.consulta + ";"
        let campos = {accion: 200, sentencia: sentencia};  
        this.servicio.consultasBD(campos).subscribe(resp =>
        {
          this.detalleRegistro.consulta = 0;
          let mensajeCompleto: any = [];
          mensajeCompleto.clase = "custom-class-red";
          mensajeCompleto.mensaje = "La consulta ha sido  eliminada";
          mensajeCompleto.tiempo = 2000;
          this.servicio.mensajeToast.emit(mensajeCompleto);
        });
      }
    })
  }

}
