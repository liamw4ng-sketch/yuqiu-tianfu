import type { RatingContent } from '../types'

export const ratingEs: RatingContent = {
  moduleLabel: 'MODULE 02 | AMATEUR LEVEL',
  title: 'Nivel amateur',
  subtitle: '18 preguntas y unos 3 minutos para conocer tu nivel amateur de bádminton',
  intro:
    'Responde según cómo has jugado de verdad en los últimos 3 meses en partidos contra rivales de tu nivel, no según tu mejor día.',
  progress: '{done} de {total} preguntas respondidas',
  submit: 'Ver mi nivel',
  incomplete: 'Te faltan {n} preguntas por responder; complétalas antes de enviar.',

  questions: {
    clear: {
      title: 'Clear de fondo',
      options: [
        'Mi clear de derecha casi nunca llega al fondo de pista del rival: suele quedarse en media pista, o se va a la red o fuera',
        'Llega al fondo de pista, pero casi siempre cae antes de la línea de saque largo de dobles, sin alcanzar la zona de fondo (entre esa línea y la línea de fondo)',
        'Llega a la zona de fondo, pero menos de 7 de cada 10, o con una trayectoria baja que el rival puede interceptar',
        'De cada 10 clears de derecha, 7 o más caen en la zona de fondo, con altura suficiente para que el rival tenga que retroceder hasta la línea de fondo',
        'Alterno a voluntad el clear y el clear de ataque hasta la zona de fondo; incluso por encima de la cabeza o en apuros, devuelvo el volante a la línea de fondo del rival',
      ],
    },
    smash: {
      title: 'Remate',
      options: [
        'Casi no remato, o cuando lo hago se va a la red o fuera',
        'Remato, pero el volante va plano y sin velocidad; un rival de mi nivel lo devuelve sin problema',
        'Mi remate tiene ángulo hacia abajo y hace daño desde media pista, pero desde el fondo suele salir plano y con poco peligro',
        'Desde el fondo encadeno 2–3 remates seguidos, en línea y cruzados, sin perder calidad',
        'Domino el remate en salto, el remate corto y el remate cortado; mi remate fuerte desde el fondo suele ganar el punto directamente y a un rival de mi nivel le cuesta mucho devolverlo',
      ],
    },
    drop: {
      title: 'Dejada',
      options: [
        'No sé hacer dejada, o cuando la intento se va a la red',
        'Hago dejada, pero suele pasar alta o caer en media pista; al rival le resulta fácil matarla en la red o empujarla',
        'Juego la dejada en línea y casi siempre cae cerca de la línea de saque corto',
        'Juego la dejada en línea y cruzada, y uso la dejada cortada o la dejada cortada invertida para que el volante caiga rápido',
        'Clear, remate y dejada salen de la misma preparación; el rival se equivoca a menudo al leer el golpe',
      ],
    },
    net: {
      title: 'Juego de red',
      options: [
        'Cuando el volante me llega a la red, casi solo sé levantarlo con un globo',
        'Sé hacer dejada en la red, pero suele quedar separada de la red o alta, y el rival la empuja o la mata con facilidad',
        'Mi dejada en la red cae pegada a la cinta, sé hacer red con efecto y a veces juego la red cruzada',
        'Domino la red con efecto, la red cruzada, el empuje y matar en la red, y llego al volante en su punto más alto',
        'Tengo fintas en la red (amago empuje y juego red cruzada, amago dejada y empujo), domino la zona de red y a menudo fuerzo el error del rival',
      ],
    },
    serve: {
      title: 'Saque',
      options: [
        'Fallo el saque a menudo: no pasa la red, se va fuera o ni siquiera toco el volante',
        'Del saque largo de derecha y el saque corto de revés, solo uno me sale estable',
        'Tanto el saque largo de derecha como el saque corto de revés me salen bastante estables',
        'Vario la colocación del saque (al centro, a la banda, al cuerpo) y rara vez me atacan el saque directamente',
        'Vario el ritmo, la colocación y las fintas en el saque, y cuando saco ya tengo pensado el tercer golpe',
      ],
    },
    defense: {
      title: 'Defensa del remate',
      options: [
        'Cuando un rival de mi nivel remata fuerte, casi nunca consigo devolverlo',
        'Llego a tocar el volante, pero lo devuelvo alto y corto, y me vuelven a rematar una y otra vez',
        'Puedo devolver el remate con un globo al fondo de pista del rival o bloquearlo a la red',
        'Según el remate, bloqueo en línea o cruzado, o respondo con un drive, y paso de defender a un intercambio igualado',
        'Tras la defensa del remate suelo contraatacar directamente: un drive que empuja al fondo, o un bloqueo a la red y subo a atacar; a menudo gano el punto',
      ],
    },
    footwork: {
      title: 'Footwork',
      options: [
        'No he aprendido footwork: juego casi parado y llego al volante estirando el brazo o con zancadas',
        'Subo a la red y retrocedo, pero sobre todo corro detrás del volante y muchas veces no vuelvo al centro después de golpear',
        'Conozco el footwork básico y vuelvo al centro tras golpear, pero cuando me mueven varias veces seguidas no llego',
        'Mi footwork es completo: arranco con un pequeño salto de preparación (split step), recupero a tiempo, uso pasos cruzados y pasos juntos al retroceder, y aguanto casi siempre que me muevan varias veces seguidas',
        'El footwork ya es automático: me mandan a las cuatro esquinas y siempre recupero, y combino salto, zancada y paso de ajuste sin pensarlo',
      ],
    },
    drive: {
      title: 'Drive y bloqueo',
      options: [
        'Cuando me llega un drive en la zona media no reacciono a tiempo: se me escapa o lo mando fuera',
        'Lo devuelvo, pero a la defensiva; suele salir alto y el rival me presiona',
        'Con la derecha hago drive y con el revés bloqueo, aguanto unos golpes, pero si el intercambio se alarga acabo fallando',
        'Encadeno drives y bloqueos de derecha y de revés, y consigo llevar el volante a la espalda del rival o a los huecos',
        'En un intercambio rápido cambio de repente de dirección o de ritmo, o bajo el volante para atacar; suelo tomar la iniciativa',
      ],
    },
    backhand: {
      title: 'Revés',
      options: [
        'Casi no uso el revés: los volantes a ese lado se me escapan o apenas los toco',
        'Con el revés solo resuelvo volantes en la red o delante del cuerpo; desde el fondo de pista de revés casi nunca consigo pasarlo',
        'Desde el fondo de pista, de revés llevo el volante hasta la media pista del rival',
        'Desde el fondo de pista, de revés devuelvo el volante al fondo de pista del rival',
        'Mi clear de revés llega a la línea de fondo, y también juego dejada y remate de revés',
      ],
    },
    grip: {
      title: 'Empuñadura',
      options: [
        'Uso siempre la misma empuñadura, llegue el volante que llegue',
        'Conozco la empuñadura de derecha y la de revés, pero en juego se me olvida cambiar o no me da tiempo',
        'Cambio de empuñadura con volantes normales, pero con volantes rápidos (por ejemplo, en un drive) a menudo no llego a cambiar',
        'Cambio de empuñadura con naturalidad incluso en intercambios rápidos; agarro la raqueta relajada y solo la aprieto en el momento del golpe',
        'Ajusto en cada golpe la empuñadura y el ángulo de la cara de la raqueta, genero fuerza con los dedos y tengo mucha finura en la red con efecto, la red cruzada y el bloqueo',
      ],
    },
    doubles: {
      title: 'Rotación en dobles',
      options: [
        'En dobles no tengo claro dónde colocarme; a menudo vamos los dos a por el mismo volante o ninguno lo coge',
        'Conozco la regla de "en ataque uno delante y otro detrás, en defensa lado a lado", pero en el partido se me olvida o llego tarde',
        'Roto siguiendo el patrón, pero a veces choco con mi pareja o dejamos un hueco',
        'En las transiciones entre ataque y defensa roto por iniciativa propia, y cuando mueven a mi pareja sé cubrir su hueco',
        'Anticipo la devolución de mi pareja para colocarme antes, y combinamos cerrar la red y presionar el fondo para encadenar ataques',
      ],
    },
    tactics: {
      title: 'Sentido táctico',
      options: [
        'Cuando juego, solo pienso en devolver el volante',
        'Sé que hay que buscar los huecos del rival, pero coloco el volante por instinto',
        'Muevo al rival a las cuatro esquinas a propósito, por ejemplo, presionando primero el fondo y luego jugando la dejada',
        'Detecto los puntos débiles del rival y juego sobre ellos (por ejemplo, atacar siempre su revés); si voy perdiendo, cambio de plan',
        'Preparo de antemano combinaciones de varios golpes y las cambio en cualquier momento según el marcador y el estado del rival',
      ],
    },
    consistency: {
      title: 'Estabilidad en el peloteo',
      options: [
        'En los peloteos suelo cometer un error propio antes de 5 golpes (a la red, fuera o sin tocar el volante)',
        'Normalmente aguanto de 5 a 9 golpes antes de cometer un error propio',
        'Normalmente aguanto de 10 a 19 golpes antes de un error propio, pero si sube el ritmo fallo',
        'Aguanto bien peloteos de 20 golpes o más; mis errores llegan sobre todo cuando me mueven',
        'Aunque suba el ritmo o me muevan, casi no cometo errores no forzados, y en el peloteo busco la ocasión de atacar',
      ],
    },
    fitness: {
      title: 'Físico en individuales',
      options: [
        'Jugando individuales, ya me cuesta mucho aguantar un set',
        'Termino un set, pero en el segundo bajo claramente el ritmo',
        'Termino dos sets y es en el tercero cuando empiezo a bajar el ritmo',
        'Juego los tres sets sin perder claramente velocidad ni calidad',
        'Juego varios partidos de individuales en un mismo día y en el último mantengo la velocidad y la intensidad',
      ],
    },
    match: {
      title: 'Experiencia en torneos',
      options: [
        'Nunca he jugado ningún torneo, ni siquiera uno interno',
        'Solo he jugado torneos internos de un pabellón, un club, una empresa o un centro de estudios',
        'He jugado torneos abiertos amateur de distrito, municipales o de nivel similar',
        'He llegado a cuartos de final en un torneo abierto amateur de distrito o municipal, o he ganado varios partidos en torneos amateur autonómicos',
        'He llegado a semifinales en torneos amateur autonómicos o de nivel superior, o he competido representando a un centro de tecnificación o a un equipo profesional',
      ],
    },
    training: {
      title: 'Formación',
      options: [
        'Autodidacta: juego sobre todo quedando para jugar y en pachangas, y nunca he dado clases',
        'He dado algunas clases sueltas o un curso corto, menos de medio año en total',
        'He dado clases sistemáticas con entrenador o en una escuela entre medio año y un año en total',
        'Llevo más de un año en total de entrenamiento sistemático (clases con entrenador, escuela o equipo del colegio o la universidad)',
        'He entrenado en un centro de tecnificación, un equipo profesional o un equipo de alto nivel',
      ],
    },
    years: {
      title: 'Años y frecuencia de juego',
      options: [
        'Llevo menos de 1 año jugando',
        'Llevo 1 año o más jugando, pero menos de 3',
        'Llevo entre 3 y 5 años jugando, de media menos de 3 veces por semana',
        'Llevo entre 3 y 5 años jugando 3 veces o más por semana, o llevo más de 5 años jugando',
        'Llevo más de 10 años jugando y siempre he entrenado con regularidad',
      ],
    },
    benchmark: {
      title: 'Individuales contra el mejor del club',
      options: [
        'Jugando individuales contra el jugador o la jugadora de referencia de mi pabellón o club, casi solo sumo puntos por sus errores',
        'Consigo algunos puntos, pero en cada set no llego a la mitad de los suyos',
        'En cada set consigo más de la mitad de sus puntos, pero todavía no le gano ningún set',
        'Le gano algunos sets y, en partidos completos, unas veces gano y otras pierdo',
        'Le gano la mayoría de los partidos',
      ],
    },
  },

  levels: {
    1: {
      code: 'L1',
      name: 'Iniciación',
      tagline: 'Deja que el volante vuele y disfruta moviendo la raqueta',
      can: [
        'El saque largo de derecha aún no es estable: a menudo no pasa la red, se va fuera o ni siquiera toca el volante',
        'El clear casi siempre se queda en media pista, sin llegar al fondo de pista del rival',
        'Cuando el volante le llega a la red, casi solo sabe levantarlo con un globo',
        'Todavía no ha aprendido footwork: llega al volante estirando el brazo o con zancadas',
        'En los peloteos suele fallar antes de 5 golpes',
      ],
      typical: 'Todavía no ha jugado ningún torneo; en un set contra alguien que también empieza, suele quedarse en un solo dígito de puntos.',
      next: [
        'Aprender la empuñadura de derecha y la de revés, y cambiar entre ellas con rapidez',
        'Practicar el saque largo de derecha: cuerpo de lado, buena preparación y golpeo por delante y por encima del cuerpo',
        'Pelotear clears con un compañero o compañera, con el objetivo de encadenar 10 golpes sin que caiga el volante',
      ],
    },
    2: {
      code: 'L2',
      name: 'Principiante',
      tagline: 'Ya aguantas unos cuantos golpes y empiezas a disfrutar del peloteo',
      can: [
        'El clear de derecha suele pasar la red, pero se queda en media pista y es fácil rematarlo directamente',
        'Remata, pero el volante va plano y sin velocidad; el rival lo devuelve sin problema',
        'En la red juega sobre todo globos; la dejada en la red todavía no es estable',
        'Sabe que hay que subir a la red y retroceder, pero sobre todo corre detrás del volante y muchas veces no vuelve al centro',
        'En un peloteo cooperativo aguanta de 5 a 9 golpes',
      ],
      typical: 'Juega sobre todo quedando para jugar y en pachangas; en los torneos internos del pabellón o del club suele caer en la fase de grupos.',
      next: [
        'Trabajar el golpe de látigo: giro del cuerpo, brazo, antebrazo y muñeca, en ese orden, para que el clear llegue al fondo de pista del rival',
        'Aprender la dejada en la red: el objetivo es que el volante caiga pegado a la cinta',
        'Acostumbrarse a volver al centro de la pista después de cada golpe',
      ],
    },
    3: {
      code: 'L3',
      name: 'Principiante avanzado',
      tagline: 'El gesto ya tiene forma; solo falta mandar el volante hasta el fondo',
      can: [
        'Del saque largo de derecha y el saque corto de revés, normalmente solo uno le sale estable',
        'El clear de derecha llega al fondo de pista, pero casi siempre cae antes de la línea de saque largo de dobles, sin alcanzar la zona de fondo: esta es la frontera con el nivel intermedio',
        'Sabe hacer dejada en la red, pero suele quedar separada de la red o alta, y el rival la empuja o la mata',
        'Sube a la red, retrocede y empieza a volver al centro a propósito, pero cuando lo mueven varias veces seguidas suele llegar tarde',
        'En la defensa del remate llega a tocar el volante, pero suele devolverlo alto y corto, y le vuelven a rematar',
      ],
      typical: 'Ya completa partidos enteros; gana algunos partidos en los torneos internos del club, pero contra jugadores intermedios suele perder más de lo que gana.',
      next: [
        'Pasar de un clear que "llega al fondo de pista" a uno que "llega a la zona de fondo": es el paso clave para subir a intermedio',
        'Practicar la defensa del remate: primero conseguir levantar el volante alto y profundo, hasta el fondo de pista del rival',
        'Repetir una y otra vez el arranque y la vuelta al centro del footwork',
      ],
    },
    4: {
      code: 'L4',
      name: 'Intermedio',
      tagline: 'Clear, dejada y remate: el pilar del pabellón',
      can: [
        'Tanto el saque largo de derecha como el saque corto de revés le salen bastante estables',
        'El clear de derecha llega a la zona de fondo, pero todavía es irregular: menos de 7 de cada 10',
        'Su remate tiene ángulo hacia abajo y hace daño desde media pista, pero desde el fondo suele salir plano',
        'Su dejada en la red cae pegada a la cinta, sabe hacer red con efecto y a veces juega la red cruzada',
        'Conoce el footwork básico y vuelve al centro tras golpear, pero cuando lo mueven varias veces seguidas no llega',
      ],
      typical: 'Suele estar entre los primeros en los torneos internos del club; en torneos abiertos amateur de distrito o municipales gana uno o dos partidos.',
      next: [
        'Practicar el remate con subida a la red: nada más rematar, subir a la red listo para cerrar la red o matar en la red',
        'Golpe de transición de revés: primero devolver de revés los volantes de fondo a la media pista del rival, y después hasta su fondo de pista',
        'Continuidad en el drive y bloqueo: cambiar rápido de empuñadura entre derecha y revés, con el objetivo de encadenar intercambios sin fallar a la primera',
      ],
    },
    5: {
      code: 'L5',
      name: 'Intermedio alto',
      tagline: 'La técnica ya es un sistema; empiezas a jugar con la cabeza',
      can: [
        'De cada 10 clears de derecha, 7 o más caen en la zona de fondo, con altura suficiente',
        'Desde el fondo encadena 2–3 remates seguidos, en línea y cruzados',
        'Juega la dejada en línea de forma estable, casi siempre cerca de la línea de saque corto',
        'En la red domina la red con efecto, la red cruzada, el empuje y matar en la red, y llega al volante en su punto más alto',
        'Mueve al rival a las cuatro esquinas a propósito',
      ],
      typical: 'Gana partidos en torneos abiertos amateur municipales y a menudo pasa de la fase de grupos; contra jugadores intermedios gana más de lo que pierde.',
      next: [
        'Practicar la dejada cortada y la dejada cortada invertida, para que la preparación se parezca más a la del clear y el remate',
        'En la defensa del remate, practicar el bloqueo en línea, el bloqueo cruzado y el drive, en vez de limitarse al globo',
        'Rotación en dobles y los tres primeros golpes: tener jugadas fijas para el tercer golpe después del saque y del resto',
      ],
    },
    6: {
      code: 'L6',
      name: 'Avanzado',
      tagline: 'Una cara conocida en los torneos amateur, con golpes de calidad',
      can: [
        'Varía la colocación del saque (al centro, a la banda, al cuerpo) y rara vez le atacan el saque directamente',
        'Tanto el clear como el clear de ataque llegan a la zona de fondo, y por encima de la cabeza también le salen estables',
        'Su remate varía entre remate fuerte y remate corto, y a menudo gana el punto directamente',
        'Domina la red con efecto y la red cruzada, y a veces usa fintas para forzar el error del rival',
        'En la defensa del remate bloquea en línea o cruzado, o responde con un drive, y pasa de defender a un intercambio igualado',
      ],
      typical:
        'En torneos abiertos amateur de distrito o municipales suele llegar a cuartos de final; en el club suele ser quien ayuda a los que empiezan. Si te has quedado en este nivel porque aún no has jugado ningún torneo abierto fuera de tu club, apúntate a uno: tus resultados confirmarán tu nivel real.',
      next: [
        'Revés completo desde el fondo: clear de revés hasta la línea de fondo y dejada cortada de revés',
        'Fintas en la red y ataque cerrando la red: amagar empuje y jugar red cruzada, amagar dejada y empujar',
        'Entrenamiento físico específico para mantener la velocidad en el tercer set',
      ],
    },
    7: {
      code: 'L7',
      name: 'Amateur de élite',
      tagline: 'El techo del nivel amateur, con un as en la manga',
      can: [
        'Varía el ritmo, la colocación y las fintas en el saque, y cuando saca ya tiene pensado el tercer golpe',
        'Domina el remate en salto, el remate corto y el remate cortado, y después de rematar sube rápido a cerrar la red',
        'Clear, remate y dejada salen de la misma preparación; el rival se equivoca a menudo al leer el golpe',
        'Tiene fintas en la red, domina la zona de red y a menudo fuerza el error del rival',
        'En dobles anticipa la devolución de su pareja para colocarse antes, y entre los dos combinan cerrar la red y presionar el fondo para encadenar ataques',
      ],
      typical:
        'En torneos abiertos amateur de distrito o municipales suele subir al podio, y en torneos autonómicos gana varios partidos; contra el jugador o la jugadora de referencia del club, los partidos están igualados y unas veces gana y otras pierde.',
      next: [
        'Pulir 1–2 golpes fuertes hasta atreverse a usarlos también en los puntos clave',
        'Revisar vídeos de sus partidos para ir reduciendo, uno a uno, los errores no forzados',
        'Tener pensado de antemano cómo jugar cuando va por delante y cuando va por detrás en el marcador',
      ],
    },
    8: {
      code: 'L8',
      name: 'Casi profesional',
      tagline: 'Técnica de nivel casi profesional, cada gesto con oficio',
      can: [
        'Técnica completa: gana puntos por iniciativa propia de derecha y de revés, en la red y en el fondo, sin puntos débiles evidentes',
        'Su clear de revés llega a la línea de fondo, y también domina la dejada y el remate de revés',
        'El footwork ya es automático: lo mandan a las cuatro esquinas y siempre recupera',
        'Aunque suba el ritmo o lo muevan, casi no comete errores no forzados',
        'Juega varios partidos en un mismo día y en el último mantiene la velocidad y la intensidad',
      ],
      typical:
        'En los torneos amateur suele jugar en la categoría más alta y a menudo tiene experiencia en un centro de tecnificación, un equipo profesional o un equipo de alto nivel; si es tu caso, antes de inscribirte revisa bien la normativa del torneo sobre jugadores con pasado profesional.',
      next: [
        'Mantener el físico específico y cuidar la prevención de lesiones',
        'Adaptar el estilo de juego a la edad y el físico actuales: menos desgaste, más control',
        'Ayudar a quienes empiezan, hacer de sparring y compartir la experiencia con la gente del club',
      ],
    },
  },

  rules: {
    smashNoClear:
      'Dices que desde el fondo encadenas remates, pero tu clear de derecha todavía no llega a la zona de fondo. Quien remata con continuidad desde el fondo de pista suele tener también la base para mandar el clear profundo; te recomendamos revisar estas dos respuestas.',
    dropNoClear:
      'Dices que usas la dejada cortada o la dejada cortada invertida, pero tu clear de derecha todavía no llega a la zona de fondo. La dejada engaña porque se prepara igual que el clear, así que quien consigue esa calidad de dejada no suele tener un clear tan corto; te recomendamos revisar estas dos respuestas.',
    doublesNoDrive:
      'Dices que en dobles rotas por iniciativa propia en las transiciones y cubres los huecos, pero casi no puedes devolver los drives en la zona media. Una rotación fluida necesita drive y bloqueo en la zona media, y las dos cosas suelen mejorar a la vez; te recomendamos confirmarlo.',
    consistencyNoFitness:
      'Dices que aguantas bien peloteos de 20 golpes o más, pero en individuales ya te cuesta mucho aguantar un set. Mantener peloteos largos requiere cierta base física; estas dos respuestas parecen contradictorias, así que te recomendamos repensarlas.',
    tacticsNoFootwork:
      'Dices que preparas de antemano combinaciones de varios golpes y las cambias en cualquier momento, pero tu footwork todavía consiste en correr detrás del volante y muchas veces no vuelves al centro después de golpear. La táctica solo funciona si los pies llegan a tiempo; sin footwork es difícil ejecutarla, así que te recomendamos confirmarlo.',
    newbieExpert:
      'Llevas menos de 1 año jugando, pero elegiste la opción más alta tanto en remate como en juego de red. Es un progreso muy rápido: si antes practicaste tenis u otro deporte de raqueta, tiene sentido; si no, te recomendamos pedir a un entrenador o a alguien con más nivel que te ayude a confirmar estas dos respuestas.',
    benchmarkMismatch:
      'Dices que en individuales le ganas sets, o incluso la mayoría de los partidos, al jugador o la jugadora de referencia del club, pero tu clear de derecha todavía no llega a la zona de fondo, o tu footwork todavía consiste en correr detrás del volante sin volver al centro después de golpear. Plantar cara a alguien así suele exigir un clear profundo y un footwork que llegue a tiempo; te recomendamos confirmarlo.',
  },

  result: {
    title: 'Tu nivel amateur',
    scoreLine: '{points} / {max} puntos, aproximadamente un {percent} %',
    capsTitle: 'Por qué no es más alto',
    cap: '«{question}» limita tu nivel máximo a {level}',
    warningsTitle: 'Algunas respuestas no encajan del todo',
    canTitle: 'Lo que suele hacer este nivel',
    typicalTitle: 'Resultados típicos en competición',
    nextTitle: 'Qué entrenar a continuación',
    basis:
      'Esta evaluación se inspira en sistemas reales: el Estándar de Evaluación del Nivel Deportivo en Bádminton de la Asociación China de Bádminton, que asigna niveles mediante pruebas técnicas y resultados en competición (de ahí los topes por fundamentos y por experiencia en torneos); la clasificación de nivel técnico de la comunidad china Zhongyu Online, que describe cada nivel con gestos técnicos concretos; los sistemas de Badminton England y Badminton Danmark, que clasifican y agrupan a los jugadores según sus resultados en competición; y el sistema NTRP de la Asociación de Tenis de Estados Unidos (USTA), que describe lo que se sabe hacer en cada nivel. Este resultado no equivale al nivel de ninguno de esos sistemas.',
    retake:
      'Te recomendamos repetir la evaluación dentro de 3 meses y comprobar con tus resultados recientes en competición si este nivel sigue siendo acertado.',
    disclaimer:
      'Este resultado es una referencia generada a partir de tu autoevaluación: no es un nivel oficial de la Evaluación del Nivel Deportivo en Bádminton de la Asociación China de Bádminton ni sustituye a ningún certificado oficial. Para obtener un nivel oficial, preséntate a las pruebas que organiza la Asociación China de Bádminton.',
    missing: 'No se ha encontrado este resultado de nivel. Vuelve a hacer la evaluación.',
  },
}
