import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { fromLanding } from '../shared/store/selectors';
import { Subject, takeUntil } from 'rxjs';
import { LandingActions } from '../shared/store/actions';
import { ActivePlatformsModel } from '../home/home.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-need-help',
  templateUrl: './need-help.component.html',
  styleUrls: ['./need-help.component.css'],
})
export class NeedHelpComponent implements OnInit {
  public selectActivePlatforms$ = this.store.select(
    fromLanding.selectActivePlatforms
  );
  public selectIsSupportSent$ = this.store.select(
    fromLanding.selectIsSupportSent
  );
  selectedContent: string = '';
  contactForm: FormGroup;

  faqs = [
    {
      id: 1,
      question: '¿Cómo puedo realizar una reserva de cancha?',
      answer:
        'Accede a la app, selecciona la cancha disponible en la fecha y hora deseada, y confirma la reserva. Recibirás una notificación de confirmación.',
    },
    {
      id: 2,
      question: '¿Cómo sé si una cancha está disponible?',
      answer:
        'La app te muestra las canchas disponibles en tiempo real, lo que te permite ver los horarios libres y hacer reservas sin confusión.',
    },
    {
      id: 3,
      question: '¿Qué hago si tengo un problema con mi reserva?',
      answer:
        'Si encuentras algún problema, puedes gestionar tu reserva desde la app. Si necesitas asistencia adicional, contacta con el administrador del club a través de la plataforma.',
    },
    {
      id: 4,
      question: '¿Puedo modificar o cancelar una reserva?',
      answer:
        'Sí, puedes modificar o cancelar tu reserva directamente desde la app antes del tiempo límite establecido por el club.',
    },
    {
      id: 5,
      question:
        '¿Cómo puedo acceder a la cancha una vez que tengo una reserva?',
      answer:
        'El sistema de control de accesos garantizará tu entrada mediante códigos o identificaciones proporcionadas en la app, asegurando una entrada segura.',
    },
    {
      id: 6,
      question:
        '¿Cómo puedo actualizar mi información personal o datos de membresía?',
      answer:
        'Ve a la sección de "Perfil" en la app, donde podrás actualizar tus datos personales, membresía, pagos y beneficios.',
    },
    {
      id: 7,
      question: '¿Qué tipo de notificaciones recibiré?',
      answer:
        'Recibirás notificaciones automáticas de recordatorios de reservas, eventos, torneos, y actualizaciones importantes de las canchas.',
    },
    {
      id: 8,
      question:
        '¿Cómo puedo participar en eventos, torneos o ligas organizados por el club?',
      answer:
        'A través de la app, podrás inscribirte a los eventos, torneos y ligas, y recibirás notificaciones con todos los detalles y fechas clave.',
    },
    {
      id: 9,
      question: '¿Cómo puedo saber si tengo beneficios exclusivos?',
      answer:
        'La app te mostrará los beneficios a los que tienes acceso, como descuentos o promociones especiales, según tu nivel de membresía.',
    },
    {
      id: 10,
      question:
        '¿Cómo puedo contactar con el personal del club si tengo un problema?',
      answer:
        'Puedes contactar al personal directamente desde la app a través de un formulario de contacto o el número de teléfono proporcionado en la sección de "Soporte".',
    },
    {
      id: 11,
      question: '¿Hay algún límite en el número de reservas que puedo hacer?',
      answer:
        'Dependiendo de las políticas del club, podrás realizar varias reservas, pero algunas restricciones pueden aplicarse durante las horas pico.',
    },
    {
      id: 12,
      question: '¿Puedo ver mi historial de reservas?',
      answer:
        'Sí, desde tu perfil puedes acceder al historial de reservas pasadas y futuras, permitiéndote hacer un seguimiento de tus actividades.',
    },
    {
      id: 13,
      question: '¿La app está disponible en varios idiomas?',
      answer:
        'Sí, la app está diseñada para ser fácil de usar y está disponible en varios idiomas para la comodidad de todos los socios.',
    },
    {
      id: 14,
      question: '¿Puedo personalizar las notificaciones que recibo?',
      answer:
        'Sí, podrás ajustar las preferencias de notificación para que solo recibas alertas sobre lo que te interesa, como eventos o recordatorios de reservas.',
    },
    {
      id: 15,
      question: '¿Cómo mejora Intelipadel la experiencia para los usuarios?',
      answer:
        'Con una interfaz intuitiva, un sistema de reservas eficiente, y la posibilidad de gestionar todas tus actividades en un solo lugar, Intelipadel optimiza tu experiencia en el club.',
    },
  ];

  lastSegment: string | null = null;
  idPlatforms = 0;
  titlePlatform = '';

  isSupportSent = false;

  activePlatforms!: ActivePlatformsModel[];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required],
      platform: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.lastSegment = params.get('id');

      if (this.lastSegment === 'padelroom') {
        this.idPlatforms = 1;
        this.titlePlatform = 'PadelRoom';
        this.contactForm.get('platform')?.setValidators(null);
      }
    });

    this.store.dispatch(LandingActions.getActivePlatformsWeb());
    this.selectActivePlatforms$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((activePlatforms) => {
        this.activePlatforms = activePlatforms;
      });

    this.selectIsSupportSent$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isSupportSent) => {
        if (isSupportSent) {
          this.isSupportSent = isSupportSent;
          this.contactForm.reset();
        }
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  showContent(content: string): void {
    this.selectedContent = content;
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log('Form Submitted', this.contactForm.value);
      // Handle form submission logic here
      this.store.dispatch(
        LandingActions.insertSupportHelpWeb({
          name: this.contactForm.value.name,
          email: this.contactForm.value.email,
          message: this.contactForm.value.message,
          id_platforms:
            this.idPlatforms !== 0
              ? this.idPlatforms
              : this.contactForm.value.platform,
        })
      );
    }
  }

  resetForm(): void {
    this.contactForm.reset();
    this.store.dispatch(LandingActions.resetSupportHelpWeb());
    this.isSupportSent = false;
  }
}
