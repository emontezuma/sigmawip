import { Component, ViewChild, AfterContentInit, HostListener } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { MatIconRegistry } from '@angular/material/icon';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ServicioService } from './servicio/servicio.service';
import { R3TargetBinder } from '@angular/compiler';
import { SesionComponent } from './sesion/sesion.component';
import { DialogoComponent } from './dialogo/dialogo.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [trigger('efecto', [
    state('in', style({ opacity: 1, transform: 'translateY(0px)'})),
    state('out', style({ opacity: 0, transform: 'translateY(10px)'})),
    transition('* <=> *', [
      animate(200)
    ])
  ]), [trigger('iconoMenu', [
    state('cerrado', style({ transform: 'rotate(-180deg)'})),
    state('abierto', style({ transform: 'rotate(0deg)'})),
    transition('* <=> *', [
      animate(200)
    ])
  ])],
  [trigger('iconoPin', [
    state('in', style({ opacity: 1, transform: 'translateY(0px)'})),
    state('out', style({ opacity: 0, transform: 'translateY(10px)'})),
    transition('in <=> out', [
      animate(200)
    ])
  ])],
  ]
})

export class AppComponent implements AfterContentInit {
    
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    
    this.calcularPantalla()    
  }

  sinConexion: boolean = false;
  pinEfecto: string = "in";
  verPin: boolean = false;
  colorBaseOrigen: string = "B";
  colorFondoCbecera = "";
  iconoPin: string = "place";
  colorBase: string = "#FFFFFF";
  colorBarraSuperior: string = "";
  colorBotonMenu: string = ""
  colorPie: string = "";
  colorCuerpo: string = "";
  colorLetrasTitulo: string = "";
  colorLetrasPanel: string = "";
  colorLetrasBox: string = "";
  colorFondoCabecera = "";
  colorPanelImportante: string = "";
  colorLetrasPie: string = "";
  autenticado: boolean = false;
  colorIconoNormal: string = "";
  colorIconoInhabilitado: string = "";
  colorFondoLogo: string = "";
  colorFondo: string = "";
  abiertoSN: boolean = false;
  colorSN: string = "";
  colorPanel: string = "";
  colorTransparente: string = "transparent";
  colorFondoMenu: string = "";
  logoCompania: string = "./assets/icons/logo.png";
  logoAplicacion: string = "./assets/icons/sigma.png";
  seleccion: number = 0
  clareador;
  sufijoEscaner: string = "";
  prefijoEscaner: string = "";
  largoEscaner: number = 3;

  ayuda01: string = "Abre el menú de opciones";
  ayuda02: string = "Opciones de usuario";
  ayuda03: string = "Fija la barra de menú";
  ayuda04: string = "Sin conexión a la base de datos";
  ayuda05: string = "Esperando lectura del escaner";

  direccion: string = "cerrado";
  pinDireccion: string = "normal";

  mUsuario: boolean = false;
  conEscaner: boolean = false;
  
  alto_opciones: number = 0;

  ayudaInferior: string = "";    
  cadenaEscaneada: string = "";
  cadenaEscaneadaPrint:string = "";

  miVista: number = 0;
  pantalla: number = 0;
  verProceso: boolean = false;
  modoSN: string = "side";
  verIrArriba: boolean = false;
  verCronos: boolean = false;
  offSet: number;
  estacion: string = "Refrescar beepers";
  estacionIcono: string = "./assets/icons/refrescar.svg";
  cerrar_al_ejecutar: boolean = false;

  iconoCronos: string = "./assets/icons/cronos.png";
  hora: any =  new Date();
  isHandset: boolean = false;
  ayudaSuperior: string = "";
  
  irArribaTT: string = "Ir al tope de la lista"
  cambioClave: string = "Cambiar contraseña..."
  cerrarSesion: string = "Cerrar la seisón";
  
  usuarioActual: string = "Invitado";
  perfilActual: any = [];
  primerNombre: string = "";

  estado: string = "";  
  version: string = "Gestión de WIP v1.00.011019"
  verBarra: boolean = false;
  verPie: boolean = true;
  iconoHamburguesa: string = "menu";
  menuHamburguesaTT: string  = "Abrir panel de opciones";
  configTT: string  = "Configurar correo base";
  cronometro: any;
  tiempoLectura: number = 2000;
  
  constructor
  (  
    public snackBar: MatSnackBar, 
    public scroll: ScrollDispatcher,
    iconRegistry: MatIconRegistry, 
    sanitizer: DomSanitizer, 
    private router: Router, 
    private breakpointObserver: BreakpointObserver,
    private servicio: ServicioService,
    public dialog: MatDialog, 
    ) 
    {
    //Iconos propios
      this.breakpointObserver.observe(['(min-width: 600px)']).subscribe((estado: BreakpointState)=> {
        this.isHandset = !estado.matches;
        this.servicio.esMovil.emit(this.isHandset);
        if (this.isHandset && this.sidenav.opened)
        {
          this.menuIzquierdo();
        }
      })

      this.calcularPantalla();
      this.servicio.activarSpinner.subscribe((data: any)=>
      {
        this.verProceso = data
      });

      iconRegistry.addSvgIcon("menu", sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/menu.svg'));
      iconRegistry.addSvgIcon("pin", sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/pin.svg'));
      iconRegistry.addSvgIcon("desconexion", sanitizer.bypassSecurityTrustResourceUrl('./assets/icons/desconexion.svg'));
      
      this.scrollingSubscription = this.scroll
      .scrolled()
      .subscribe((data: CdkScrollable) => {
        this.miScroll(data);
      });

      this.reloj();
      
      this.servicio.mensajeSuperior.subscribe((mensaje: any)=>
      {
        this.ayudaSuperior = mensaje
      });

      this.servicio.listoEscanear.subscribe((val) => {
          this.conEscaner = val;
      })

      this.router.events.subscribe((val) => {
        //Se valida que exista el usuario
        if (this.router.url.substr(0, 12) != "/operaciones")
        {
          this.servicio.aEscanear(false);
          this.cadenaEscaneada = "";
          this.cadenaEscaneadaPrint = "";
          if (this.cronometro)
          {
            clearTimeout(this.cronometro); 
          }
        }
      })

      this.servicio.sinConexion.subscribe((dato: boolean)=>
      {
        this.sinConexion = dato;
      });

      this.servicio.mensajeInferior.subscribe((mensaje: any)=>
      {
        this.ayudaInferior = mensaje
      });
      this.servicio.configurando.subscribe((mensaje: any)=>
      {
        this.configuracion();
      });
      this.servicio.mensajeToast.subscribe((mensaje)=>{
        this.toast(mensaje.clase, mensaje.mensaje, mensaje.tiempo)
      });
      this.configuracion();
    }
  
  @HostListener('document:keypress', ['$event']) onKeypressHandler(event: KeyboardEvent) 
  {
    if (event.keyCode == 27)
    {
      this.cadenaEscaneada = "" ;
      setTimeout(() => {
        this.cadenaEscaneadaPrint = "" ;
      }, 1000);
      if (this.cronometro)
      {
        clearTimeout(this.cronometro); 
      }
      this.servicio.teclaEscape.emit(true);
    }
    else if (!event.ctrlKey && !event.altKey)
    {
      if (this.servicio.rEscanear() && event.keyCode > 20) 
      {
        if (this.clareador)
        {
          clearTimeout(this.clareador);  
        }
        if (this.cadenaEscaneada.length==0)
        {
          this.cronometro = setTimeout(() => {
          if (this.cadenaEscaneada.length>0)
          {
            let completo: boolean = true;
            if (this.prefijoEscaner)
            {
              completo = this.cadenaEscaneada.substr(0, this.prefijoEscaner.length) == this.prefijoEscaner;
            }
            if (this.sufijoEscaner && completo)
            {
              completo = (this.cadenaEscaneada.length > this.prefijoEscaner.length) && (this.cadenaEscaneada.substr(this.cadenaEscaneada.length - this.sufijoEscaner.length, this.sufijoEscaner.length) == this.sufijoEscaner);
            }
            if (completo)
            {
              completo = this.cadenaEscaneada.length > this.prefijoEscaner.length + this.sufijoEscaner.length
            }
            if (completo)
            {
              completo = this.largoEscaner > 0 && this.cadenaEscaneada.length >= this.largoEscaner || this.largoEscaner == 0   
            }
            if (completo)
            {
              this.servicio.escaneado.emit(this.cadenaEscaneada.substr(this.prefijoEscaner.length, this.cadenaEscaneada.length - this.prefijoEscaner.length - this.sufijoEscaner.length));
            }
            else
            {
              this.cadenaEscaneadaPrint="Lectura incompleta o incongruente"
            }
            this.cadenaEscaneada = "";
            this.iniciarImpreso();
          }
          }, this.tiempoLectura);
        }
        this.cadenaEscaneada = this.cadenaEscaneada + String.fromCharCode(event.keyCode);
        this.cadenaEscaneadaPrint = this.cadenaEscaneada;
      }
    }
  }

  cambiarClave()
  {
    const respuesta = this.dialog.open(SesionComponent, 
      {
        width: "480px", data: { sesion: 3, opcionSel: 0, idUsuario: this.servicio.rUsuario().id, usuario: "", clave: "", titulo: "Cambio de contraseña", mensaje: "", alto: "90", id: 0, accion: 0, botones: 2, boton1STR: "Cambiar contraseña", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-general-key" }
      });
  }

  iniciarImpreso()
  {
    if (this.cronometro)
    {
      clearTimeout(this.cronometro);  
    }
    this.clareador = setTimeout(() => {
      this.cadenaEscaneadaPrint = "" ;  
      
    }, 2000);
  }

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) 
  {
    if (event.ctrlKey  && (event.keyCode == 66 || event.keyCode == 98))
    {
      this.buscar()
    }

    else if (event.shiftKey  && event.keyCode == 117)
    {
      this.servicio.teclaProceso.emit(true);
    }

    else if (event.shiftKey  && event.keyCode == 113)
    {
      this.servicio.teclaResumen.emit(true);
    }

    else if (event.keyCode == 118)
    {
      this.cambiarVista()
    }

    else if (event.ctrlKey  && (event.keyCode == 123 || event.keyCode == 123))
    {

    }

    else if (event.keyCode == 27)
    {
      this.cadenaEscaneada = "";
      this.cadenaEscaneadaPrint = "";
      if (this.cronometro)
      {
        clearTimeout(this.cronometro); 
      }
      this.servicio.teclaEscape.emit(true);
    }

    else if (event.keyCode == 113)
    {
      this.menuIzquierdo();
    }
  }
  
  @ViewChild('barraIzquierda', { static: true }) sidenav: MatSidenav;
  scrollingSubscription: Subscription;
  verMenuSuperior: boolean = true;

  ngAfterContentInit() {
    this.estado="in";
    this.calcularColores();
    this.router.navigateByUrl('/vacio');
    this.accion(0);
  }

  calcularPantalla()
  {
    this.servicio.aPantalla({ alto: window.innerHeight, ancho: window.innerWidth - this.servicio.rAnchoSN() });
    this.alto_opciones = window.innerHeight - 170;
    this.servicio.cambioPantalla.emit(true);
  }

  buscar()
  {
    this.servicio.teclaBuscar.emit(true);
  }

  cambiarVista()
  {     
    this.servicio.teclaCambiar.emit(true);
  }


escapar()
{
  this.buscar()
}


  configuracion()
  {
    let sentencia = "SELECT * FROM sigma.configuracion";
    let campos = {accion: 100, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp =>
    {
      if (resp && resp.length > 0)
      {
        this.largoEscaner = +resp[0].largo_escaner; 
        this.tiempoLectura = +resp[0].tiempo_escaner; 
        this.sufijoEscaner = resp[0].escaner_sufijo;
        this.prefijoEscaner = resp[0].escaner_prefijo;
      }
    }, 
    error => 
      {
        console.log(error)
      })
  }
  
  irArriba() {
    window.requestAnimationFrame(this.irArriba);
    document.querySelector('[cdkScrollable]').scrollTop = 0;    
  }

  miScroll(data: CdkScrollable) {
    const scrollTop = data.getElementRef().nativeElement.scrollTop || 0;
     if (scrollTop < 5) {
      this.verIrArriba = false
    }
     else {
      this.verIrArriba = true
    }

    this.offSet = scrollTop;
  }


    getState(outlet){
      return outlet.activatedRouteData.state;
    }
    
    toast(clase: string, mensaje: string, duracion: number) {
      let config = new MatSnackBarConfig();
        config.panelClass = [clase];
        config.duration = duracion;
        config.verticalPosition='bottom';
        this.snackBar.open(mensaje, null, config);
    }

  menuIzquierdo() 
  {
    if (this.sidenav.opened)
    {
      this.servicio.quitarBarra.emit(true);
    }
    this.sidenav.toggle();
    if (!this.sidenav.opened)
    {
      this.iconoHamburguesa="menu";
      this.menuHamburguesaTT = "Abrir panel de opciones";
      this.direccion = "abierto"
      this.pinEfecto = "out";
      setTimeout(() => {
        this.verPin = false;
      }, 200);
    }
    else 
    {
      this.iconoHamburguesa="cerrar";
      this.menuHamburguesaTT = "Cerrar el panel de opciones";
      this.direccion = "cerrado"
      this.verPin = true;
      this.pinEfecto = "in";
    }
  }

    reloj()
    {
      setInterval(() => {
        this.hora = new Date();
        this.servicio.cadaSegundo.emit(true);
      }, 1000);
    }

    
cerrarSalir()
{
  if (this.cerrar_al_ejecutar)
    {
      setTimeout(() => {
        this.sidenav.close()
        this.iconoHamburguesa="menu";
        this.menuHamburguesaTT = "Abrir panel de opciones";
        this.servicio.aAnchoSN(0);  
      }, 400);
      
    }
    if (this.pantalla>0)
    {
      let consulta = "UPDATE sigma.cat_usuarios SET ultima_pantalla = " + this.pantalla + " WHERE id = " + this.servicio.rUsuario().id;
      let campos = {accion: 2000, consulta: consulta};  
      this.servicio.consultasBD(campos).subscribe((datos: any []) =>{
      })
    }
}

  irCronos() {
    window.open("http://www.mmcallmexico.mx/  ", "_blank");
  }

  

recuperar(id: number, opcion: number)
{
  let sentencia = "SELECT * FROM sigma.cat_usuarios WHERE id = " + id
  let campos = {accion: 100, sentencia: sentencia};  
  this.servicio.consultasBD(campos).subscribe( registro =>
  {
    if (registro && registro.length>0)
      {
        this.autenticado = true;
        this.servicio.aUsuario({id: registro[0].id, nombre: registro[0].nombre, referencia: registro[0].referencia, rol: registro[0].rol, admin: (registro[0].admin == "S" ? true : false), vista_resumida_fallas: (registro[0].vista_resumida_fallas == "S" ? true : false), upantalla: +registro[0].ultima_pantalla, operacion: registro[0].operacion, programacion: registro[0].programacion, inventario: registro[0].inventario })
        let cadena = registro[0].nombre.split(' ');
        this.primerNombre = cadena[0];
        this.cerrar_al_ejecutar = registro[0].cerrar_al_ejecutar == "S";
        //this.verPin = this.cerrar_al_ejecutar;
        this.abiertoSN = !this.cerrar_al_ejecutar;
        this.pinDireccion = (this.cerrar_al_ejecutar ? "normal" : "aplicado");
        this.ayuda03 = (this.pinDireccion == "normal" ? "Fija la barra de menú" : "Barra de menú flotante");
        this.modoSN = (this.pinDireccion == "normal" ? "over" : "side");
        this.sidenav.mode = (this.cerrar_al_ejecutar ? "over" : "side");
        this.iconoPin = (this.pinDireccion == "normal" ? "place" : "pin_drop");
        if (this.cerrar_al_ejecutar){
          this.iconoHamburguesa="menu";
          this.menuHamburguesaTT = "Abrir panel de opciones";
          this.servicio.aAnchoSN(0);
        }
        else {
          this.iconoHamburguesa="cerrar";
          this.menuHamburguesaTT = "Cerrar el panel de opciones";
          this.servicio.aAnchoSN(300);
        }
        this.cerrarSalir();
        if (opcion == 0)
          {
            this.router.navigateByUrl('/vacio');
          }
          else if (opcion < 10)
          {
            this.servicio.aVista(opcion);
            if (this.router.url.substr(0, 5) != "/home")
            {
              this.router.navigateByUrl('/home');
            }
            else
            {
              this.servicio.vista.emit(opcion);
            }
          }
          else if (opcion == 10)
          {
            if (this.router.url.substr(0, 12) != "/operaciones")
            {
              this.router.navigateByUrl('/operaciones');
            }
            else
            {
              this.servicio.vista_2.emit(opcion);
            }
          }
          else if (opcion < 30)
          {
            
            this.servicio.aVista(opcion);
            if (this.router.url.substr(0, 6) != "/flujo")
            {
              this.router.navigateByUrl('/flujo');
            }
            else
            {
              this.servicio.vista_3.emit(opcion);
            }
          }
          else if (opcion >= 30 && opcion < 40)
          {
            this.servicio.aVista(opcion);
            if (this.router.url.substr(0, 9) != "/reportes")
            {
              this.router.navigateByUrl('/reportes');
            }
            else
            {
              this.servicio.vista_4.emit(opcion);
            }
          }
          if (this.cerrar_al_ejecutar)
          {
            this.sidenav.close();
          }
      }
    })
  }

cambioSN()
{
  this.servicio.aAnchoSN((this.modoSN=="side" && this.sidenav.opened ? 300 : 0));
  this.verBarra = !this.verBarra;
  if (!this.sidenav.opened)
  {
    this.iconoHamburguesa="menu";
    this.menuHamburguesaTT = "Abrir panel de opciones";
    this.direccion = "abierto"
    this.pinEfecto = "out";
    setTimeout(() => {
      this.verPin = false;
    }, 200);
  }
  else 
  {
    this.iconoHamburguesa="cerrar";
    this.menuHamburguesaTT = "Cerrar el panel de opciones";
    this.direccion = "cerrado"
    this.verPin = true;
    this.pinEfecto = "in";
  }
  
  this.calcularPantalla();
}

calcularColores()
{
  let miClaridad = this.servicio.claridad(this.colorBase);
  if (miClaridad > 178.5 && this.colorBaseOrigen=="B") 
  {
    //Aclarar el color de la  barra en 20%
    let tasa = Math.floor(((miClaridad - 178.5) / 255) * 100);
    this.colorBase = this.servicio.colorear(this.colorBase, tasa);
    this.colorBarraSuperior = this.colorBase;
  }
  else if (miClaridad < 76.5 && this.colorBaseOrigen=="F") 
  {
    //Aclarar el color de la  barra en 20%
    let tasa = Math.floor(((miClaridad - 76.5) / 255) *100);
    this.colorBase = this.servicio.colorear(this.colorBase, tasa);
  } 
  if (this.colorBaseOrigen=="B") 
  {
    this.colorBarraSuperior = this.colorBase;
    this.colorBase = this.servicio.colorear(this.colorBase, -40);
  }
  else
  {
    this.colorBarraSuperior = this.servicio.colorear(this.colorBase, 40);
  }
  
  this.colorPie = this.colorBarraSuperior
  this.colorCuerpo = this.colorBase;
  this.colorFondoMenu = this.servicio.colorear(this.colorBase, -10)
  this.colorFondoCbecera = this.servicio.colorear(this.colorBase, -10)
  this.colorSN = this.servicio.colorear(this.colorBase, 5)
  if (this.servicio.claridad(this.colorBarraSuperior) < 127.5)
  {
    this.colorLetrasTitulo = "rgba(235, 235, 235, 1)";
    this.colorIconoInhabilitado = "rgba(255, 255, 255, 0.3)";
  }
  else
  {
    this.colorLetrasTitulo = "rgba(41, 41, 41, 1)";
    this.colorIconoInhabilitado = "rgba(0, 0, 0, 0.4)";
  }

  if (this.servicio.claridad(this.colorBase) < 127.5)
  {
    this.colorLetrasBox = "rgba(235, 235, 235, 1)";
  }
  else
  {
    this.colorLetrasBox = "rgba(41, 41, 41, 1)";
  }

  this.colorIconoNormal = this.colorLetrasTitulo;
  this.colorLetrasPie = this.colorLetrasTitulo;

  this.colorFondo = this.servicio.colorear(this.colorBarraSuperior, 25)
  this.colorPanel = "rgba(255, 255, 255, 0.4)"
  
  this.colorFondoLogo = "transparent";
  this.colorLetrasPanel = "rgba(51, 51, 51, 1)";
  this.colorPanelImportante = "rgba(255, 99, 71, 0.5)";
  this.colorBotonMenu = "transparent"

  this.servicio.aColores(
    {
      colorSN: this.colorSN, 
      colorFondo: this.colorBase, 
      colorLetrasBox: this.colorLetrasBox,
      colorLetrasPanel: this.colorLetrasPanel,
      colorLetrasTitulo: this.colorLetrasTitulo,
      colorBarraSuperior: this.colorBarraSuperior,
    });

}

aplicarSN() 
{
  this.iconoPin = (this.pinDireccion == "normal" ? "pin_drop" : "place");
  this.pinDireccion = (this.pinDireccion == "normal" ? "aplicado" : "normal");
  this.ayuda03 = (this.iconoPin == "pin_drop" ? "Barra de menú flotante" : "Fija la barra de menú");
  this.modoSN = (this.iconoPin == "pin_drop" ? "side" : "over");
  this.sidenav.mode = (this.iconoPin == "pin_drop" ? "side" : "over");
  
  
  if (this.autenticado)
  {
    let sentencia = "UPDATE sigma.cat_usuarios SET cerrar_al_ejecutar = '" + (this.iconoPin == "pin_drop" ? "N" : "S") + "' WHERE id = " + this.servicio.rUsuario().id;
    let campos = {accion: 200, sentencia: sentencia};  
    this.servicio.consultasBD(campos).subscribe( resp => {
      this.cerrar_al_ejecutar = this.iconoPin == "place";
    })
  }
}


//DESDE AQUI

  accion(opcion: number)
  {
    let rolBuscar = "*"
    if (opcion==25)
    {
      rolBuscar = "-"
    }
    else if (opcion==10)
    {
      rolBuscar = "/";
    }
    else if (opcion==21 || opcion==22 || (opcion > 0 && opcion < 8))
    {
      rolBuscar = "G";
    }
    else if (opcion>=8 && opcion<=10)
    {
      rolBuscar = "A";
    }
    else if (opcion==23 || opcion==24)
    {
      rolBuscar = "C";
    }
    else if (opcion>=30 && opcion<40)
    {
      rolBuscar = "G";
    }
    else if (opcion>=40 && opcion<=42)
    {
      rolBuscar = "A";
    }
    if (this.autenticado && this.servicio.rUsuario().rol == rolBuscar || this.servicio.rUsuario().rol == "A" || (rolBuscar == "-" && (this.servicio.rUsuario().rol == "G" || this.servicio.rUsuario().inventario == "S")) || (rolBuscar == "/" && (this.servicio.rUsuario().rol == "G" || this.servicio.rUsuario().rol == "O")) || (opcion==21 && this.servicio.rUsuario().programacion == "S"))
    {
      this.seleccion = opcion;
      if (opcion < 9)
      {
        this.servicio.aVista(opcion);
        if (this.router.url.substr(0, 5) != "/home")
        {
          this.router.navigateByUrl('/home');
        }
        else
        {
          this.servicio.vista.emit(opcion);
        }
      }
      else if (opcion == 10)
      {
        if (this.router.url.substr(0, 12) != "/operaciones")
        {
          this.router.navigateByUrl('/operaciones');
        }
        else
        {
          this.servicio.vista_2.emit(opcion);
        }
      }
      else if (opcion < 30)
      {
        
        this.servicio.aVista(opcion);
        if (this.router.url.substr(0, 6) != "/flujo")
        {
          this.router.navigateByUrl('/flujo');
        }
        else
        {
          this.servicio.vista_3.emit(opcion);
        }
      }
      else if (opcion >= 30 && opcion < 40)
      {
        this.servicio.aVista(opcion);
        if (this.router.url.substr(0, 9) != "/reportes")
        {
          this.router.navigateByUrl('/reportes');
        }
        else
        {
          this.servicio.vista_4.emit(opcion);
        }
        
      }
      else if (opcion >=40 && opcion <=42 )
      {
        this.servicio.aVista(opcion);
        if (this.router.url.substr(0, 14) != "/configuracion")
        {
          this.router.navigateByUrl('/configuracion');
        }
        else
        {
          this.servicio.vista_5.emit(opcion);
        }
        
      }
      this.cerrarSalir();
    }
    else
    {
      const respuesta = this.dialog.open(SesionComponent, 
      {
        width: "480px", data: { sesion: 1, rolBuscar: rolBuscar, opcionSel: opcion, idUsuario: 0, usuario: "", clave: "", titulo: "Sesión de usuario", mensaje: "", alto: "90", id: 0, accion: 0, botones: 2, boton1STR: "Ingresar", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-general-key" }
      });
      respuesta.afterClosed().subscribe(result => 
      {
        if (result.accion == 1) 
        {
          this.seleccion = opcion;
          this.recuperar(result.idUsuario, opcion);
        }
      })
    }
    
  }

  cierreSesion()
  {
    const respuesta = this.dialog.open(DialogoComponent, 
    {
      width: "400px", data: { titulo: "Cerrar sesión de usuario", mensaje: "Esta acción terminará su sesión en la aplicación de Gestión de WIP.<br>¿Desea continuar?", alto: "75", id: 0, accion: 0, botones: 2, boton1STR: "Cerrar sesión", icono1: "iconshock-materialblack-general-check-mark", boton2STR: "Cancelar", icono2: "iconshock-materialblack-general-reload", icono0: "iconshock-materialblack-project-management-problems" }
    });
    respuesta.afterClosed().subscribe(result => 
    {
      if (result.accion == 1) 
      {
        this.primerNombre = "";
        this.servicio.mensajeError.emit("");
        this.servicio.mensajeInferior.emit("");
        this.servicio.mensajeSuperior.emit("");
        this.router.navigateByUrl('/vacio');
        this.autenticado=false;
        this.servicio.aUsuario( { id: 0 } );
        this.toast('custom-class', 'Se ha finalizado la sesión en la aplicación', 3000)
      }
    })
  }

}