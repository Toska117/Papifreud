(() => {
  const CANVAS_WIDTH = 680;
  const CANVAS_HEIGHT = 220;
  const INTRO_CANVAS_HEIGHT = 180;
  const END_CANVAS_HEIGHT = 120;

  let animationFrameId;
  let time = 0;
  let currentScene = 0;

  let score = 0;
  let currentStepIndex = 0;
  let hasAnswered = false;
  let selectedChoiceText = "";

  const SCENES = [
    { bg: "#1a1a2e", sky: "#2d2b55", ground: "#3d2b1f", buildings: ["#2a3a5c", "#1e3a4a", "#3a2a4a"] },
    { bg: "#1a2a1a", sky: "#1e3a2e", ground: "#2a3a1a", buildings: ["#1a3a2a", "#253a1a", "#1a2a3a"] },
    { bg: "#2a1a2a", sky: "#3a1a3a", ground: "#2a2a1a", buildings: ["#3a1a2a", "#2a1a3a", "#1a2a3a"] },
    { bg: "#1a1a3a", sky: "#0a0a2a", ground: "#1a1a2a", buildings: ["#1a1a3a", "#0a1a2a", "#2a1a1a"] },
  ];

  const STEPS = [
    {
      level: 1,
      scene: 0,
      char: "PLAZA DEL LENGUAJE",
      dialog: "Un letrero en la plaza dice: \"Estoy muy estresado hoy.\" Dos habitantes debaten. ¿Cómo lo interpretas?",
      chars: ["student", "townA", "townB"],
      choices: [
        { t: "Describe un estado interno real: su mente experimenta estrés.", r: "mid" },
        { t: "Cumple una función social: pide comprensión o explica una falla.", r: "good" },
      ],
      fb: {
        good: "¡Exacto! Gergen llama a esto visión pragmática: el lenguaje no es un espejo de la mente sino una acción social. El significado surge en la interacción.",
        mid: "Esta es la visión pictórica: útil, pero Gergen la cuestiona. Asume que la mente contiene realidades formadas antes del lenguaje.",
        bad: "",
      },
      pts: { good: 20, mid: 5, bad: 0 },
    },
    {
      level: 1,
      scene: 0,
      char: "BIBLIOTECA",
      dialog: "\"Tristeza\", \"amor\", \"miedo\"... ¿Son estados de la mente o herramientas sociales?",
      chars: ["student", "prof"],
      choices: [
        { t: "Son espejos: describen estados mentales que existen antes de ser nombrados.", r: "mid" },
        { t: "Son herramientas: nacen en la interacción y significan según el contexto.", r: "good" },
      ],
      fb: {
        good: "Construccionismo en acción. Gergen argumenta que esas palabras emergieron en intercambios sociales. El significado no está dentro de la persona, está entre las personas.",
        mid: "La visión pictórica es dominante en psicología clásica. Gergen la desafía mostrando que el lenguaje da forma activa a la experiencia, no solo la etiqueta.",
        bad: "",
      },
      pts: { good: 20, mid: 5, bad: 0 },
    },
    {
      level: 2,
      scene: 1,
      char: "TRIBUNAL DE CATEGORÍAS",
      dialog: "Tomás olvida sus llaves y se distrae fácilmente. El tribunal decide si es \"normal\" o \"problemático\". ¿Qué recomiendas?",
      chars: ["student", "judge", "tomasChar"],
      choices: [
        { t: "Diagnosticarlo con déficit atencional: su conducta necesita clasificación clínica.", r: "bad" },
        { t: "Considerar el contexto: trabajo excesivo, poco sueño, alta exigencia.", r: "mid" },
        { t: "Preguntar a quiénes molesta su conducta y por qué eso es un \"problema\".", r: "good" },
      ],
      fb: {
        good: "Perspectiva construccionista completa. Gergen propone preguntar quién se beneficia de la categorización y qué relaciones de poder produce.",
        mid: "Buen instinto relacional. El paso siguiente sería también preguntar quién define eso como problema y con qué efectos sociales.",
        bad: "Aplica el discurso del déficit: traduce una conducta ordinaria a categoría clínica, ignorando los factores sociales.",
      },
      pts: { good: 25, mid: 10, bad: 0 },
    },
    {
      level: 2,
      scene: 1,
      char: "CASO DE LUCÍA",
      dialog: "Lucía llora con frecuencia y prefiere estar sola. ¿Qué preguntaría Gergen primero?",
      chars: ["student", "luciaChar"],
      choices: [
        { t: "¿Qué síntomas tiene para determinar su diagnóstico?", r: "bad" },
        { t: "¿En qué contextos y relaciones aparece esa conducta?", r: "good" },
        { t: "¿Cuánto tiempo lleva así y desde cuándo es un \"problema\"?", r: "mid" },
      ],
      fb: {
        good: "¡Perspectiva gergeniana! Los problemas no ocurren dentro de la persona, ocurren en contextos y relaciones específicas.",
        mid: "Útil, pero sigue centrando el problema en Lucía. Gergen preguntaría también quién denominó esa conducta como problemática.",
        bad: "Parte del supuesto de que el problema es interno a Lucía. Gergen invita a suspender ese supuesto primero.",
      },
      pts: { good: 25, mid: 10, bad: 0 },
    },
    {
      level: 3,
      scene: 2,
      char: "EMISORA DE PSICOLANDIA",
      dialog: "La TV transmite: \"¿Te sientes agotado? Puede ser burnout.\" ¿Qué efecto produce esto según Gergen?",
      chars: ["student", "tvChar", "anchorChar"],
      choices: [
        { t: "Informa sobre condiciones que siempre existieron pero no tenían nombre.", r: "mid" },
        { t: "Expande el vocabulario del déficit: más personas interpretan su experiencia como patología.", r: "good" },
        { t: "No tiene mayor efecto; solo los realmente enfermos se identifican.", r: "bad" },
      ],
      fb: {
        good: "Exactamente. Gergen describe un círculo: más términos, más personas que se identifican, más demanda, nuevos términos. El lenguaje produce la realidad que pretende describir.",
        mid: "Gergen matizaría: los términos no solo nombran condiciones, también las crean al volverlas reconocibles y \"deseables\" de poseer.",
        bad: "Gergen demostraría lo contrario: cuando un término se populariza, aumenta el número de personas que se diagnostican con esa condición.",
      },
      pts: { good: 20, mid: 8, bad: 0 },
    },
    {
      level: 3,
      scene: 2,
      char: "REDES SOCIALES",
      dialog: "Todos publican: \"mi ansiedad\", \"mi TOC\", \"mi depresión\". Los términos clínicos son conversación cotidiana. ¿Qué ocurre aquí?",
      chars: ["student", "influencer"],
      choices: [
        { t: "El lenguaje clínico se democratiza: todos acceden a entender su salud mental.", r: "mid" },
        { t: "El vocabulario clínico coloniza la vida cotidiana y moldea la identidad.", r: "good" },
        { t: "Las redes solo amplifican lo que existía; los diagnósticos no cambian.", r: "bad" },
      ],
      fb: {
        good: "Construccionismo aplicado. Cuando decimos \"mi ansiedad\" como identidad estable, dejamos de vernos como actores en relaciones y comenzamos a vernos como portadores de déficits fijos.",
        mid: "Hay algo de cierto, pero Gergen advierte: definir la identidad entera a través de categorías clínicas limita otras formas de entenderse.",
        bad: "Gergen refutaría esto: la popularización de términos clínicos aumenta su prevalencia reportada. El lenguaje no es pasivo.",
      },
      pts: { good: 20, mid: 8, bad: 0 },
    },
    {
      level: 4,
      scene: 3,
      char: "EL CICLO DE ENFERMIZACIÓN",
      dialog: "El alcalde muestra el ciclo: traduccion del deficit problema, diseminación cultural, construcción cultural de la identidad, expansión del vocabulario. ¿Cómo rompermelo?",
      chars: ["student", "mayor"],
      choices: [
        { t: "Prohibir que los medios usen vocabulario psicológico sin supervisión.", r: "mid" },
        { t: "Buscar explicaciones relacionales antes de traducir al lenguaje clínico.", r: "good" },
        { t: "Crear más especialistas para atender la demanda creciente.", r: "bad" },
      ],
      fb: {
        good: "¡Salida construccionista! Gergen propone que antes de traducir un malestar a lenguaje clínico individual, busquemos comprensiones relacionales y contextuales.",
        mid: "Controlar la difusión puede reducir efectos, pero no aborda la raíz. Gergen propone repensar el punto de partida mismo.",
        bad: "Más especialistas atienden la demanda pero profundizan la dependencia del vocabulario del déficit sin resolver las condiciones sociales.",
      },
      pts: { good: 25, mid: 10, bad: 0 },
    },
    {
      level: 4,
      scene: 3,
      char: "CONSULTA FINAL",
      dialog: "Un joven llega sintiéndose \"roto\". ¿Cuál es la respuesta más construccionista?",
      chars: ["student", "youngChar"],
      choices: [
        { t: "Aplicar pruebas para identificar el trastorno subyacente.", r: "bad" },
        { t: "Explorar en qué relaciones y contextos surge ese sentimiento.", r: "good" },
        { t: "Recomendar autoayuda para que gestione sus emociones individualmente.", r: "mid" },
      ],
      fb: {
        good: "\"Sentirse roto\" no es un estado interno fijo: es una forma de dar sentido a la experiencia en un contexto relacional. Explorar esos contextos es la práctica del construccionismo de Gergen.",
        mid: "La autoayuda puede aliviar, pero también refuerza la idea de que el problema es individual y la solución está dentro de la persona.",
        bad: "Las pruebas presuponen que hay un déficit interno que descubrir. Gergen invita a cuestionar ese supuesto antes de aplicarlo.",
      },
      pts: { good: 25, mid: 10, bad: 0 },
    },
  ];

  const CHARACTERS = {
    student: { color: "#7f77dd", hat: false, name: "Tú" },
    townA: { color: "#d4537e", hat: false, name: "" },
    townB: { color: "#1d9e75", hat: false, name: "" },
    prof: { color: "#ef9f27", hat: true, name: "Prof." },
    judge: { color: "#d85a30", hat: true, name: "Juez" },
    tomasChar: { color: "#85b7eb", hat: false, name: "Tomás" },
    luciaChar: { color: "#ed93b1", hat: false, name: "Lucía" },
    tvChar: { color: "#5dcaa5", hat: false, name: "" },
    anchorChar: { color: "#fac775", hat: true, name: "TV" },
    influencer: { color: "#d4537e", hat: false, name: "Influ." },
    mayor: { color: "#afa9ec", hat: true, name: "Alcalde" },
    youngChar: { color: "#85b7eb", hat: false, name: "Joven" },
  };

  const skylineTemplate = [
    { x: 0, w: 80, h: 120, colorIndex: 0, windows: 5, seed: 11 },
    { x: 90, w: 60, h: 100, colorIndex: 1, windows: 4, seed: 17 },
    { x: 160, w: 100, h: 140, colorIndex: 2, windows: 6, seed: 23 },
    { x: 270, w: 70, h: 110, colorIndex: 0, windows: 5, seed: 31 },
    { x: 350, w: 50, h: 90, colorIndex: 1, windows: 4, seed: 37 },
    { x: 410, w: 90, h: 130, colorIndex: 2, windows: 6, seed: 43 },
    { x: 510, w: 70, h: 105, colorIndex: 0, windows: 5, seed: 53 },
    { x: 590, w: 90, h: 120, colorIndex: 1, windows: 5, seed: 61 },
  ];

  function getCanvas() {
    return document.getElementById("gc");
  }

  function prepareCanvasContext(canvas, logicalWidth, logicalHeight) {
    const bounds = canvas.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.round(bounds.width || logicalWidth));
    const cssHeight = Math.max(1, Math.round(bounds.height || logicalHeight));
    const dpr = window.devicePixelRatio || 1;

    const targetWidth = Math.round(cssWidth * dpr);
    const targetHeight = Math.round(cssHeight * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    const context = canvas.getContext("2d");
    context.setTransform(canvas.width / logicalWidth, 0, 0, canvas.height / logicalHeight, 0, 0);
    context.imageSmoothingEnabled = true;
    return context;
  }

  function setGameCanvasSize() {
    const canvas = getCanvas();
    if (!canvas) {
      return;
    }
    prepareCanvasContext(canvas, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  function seededRandom(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function drawBuilding(context, x, y, width, height, color, windows, seed) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);

    context.fillStyle = "rgba(255,255,255,0.06)";
    for (let row = 0; row < windows; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        if (seededRandom(seed + row * 10 + col) > 0.35) {
          const windowWidth = Math.floor((width - 24) / 3) - 2;
          context.fillRect(x + 6 + col * ((width - 12) / 3), y + 8 + row * 18, windowWidth, 10);
        }
      }
    }
  }

  function drawStars(context, elapsed) {
    context.fillStyle = "rgba(255,255,255,0.6)";

    const pseudo = (n) => {
      const s = n * 9301 + 49297;
      return (s % 233280) / 233280;
    };

    for (let i = 0; i < 40; i += 1) {
      const x = pseudo(i * 7) * CANVAS_WIDTH;
      const y = pseudo(i * 13) * 80;
      const alpha = 0.4 + 0.6 * Math.sin(elapsed * 0.02 + i);
      context.globalAlpha = alpha * 0.7;
      context.fillRect(x, y, 1.5, 1.5);
    }

    context.globalAlpha = 1;
  }

  function drawMoon(context, x, y, skyColor) {
    context.fillStyle = "#fffbe8";
    context.beginPath();
    context.arc(x, y, 18, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = skyColor;
    context.beginPath();
    context.arc(x + 8, y - 4, 14, 0, Math.PI * 2);
    context.fill();
  }

  function wrapText(context, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (context.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  function drawPerson(context, x, y, color, animOffset, hat, name, bubble) {
    const bob = Math.sin(time * 0.05 + animOffset) * 2;
    const bodyY = y + bob;

    context.fillStyle = color;
    context.beginPath();
    context.arc(x, bodyY - 34, 11, 0, Math.PI * 2);
    context.fill();
    context.fillRect(x - 7, bodyY - 23, 14, 22);
    context.fillRect(x - 13, bodyY - 23, 7, 16);
    context.fillRect(x + 6, bodyY - 23, 7, 16);
    context.fillRect(x - 5, bodyY - 1, 6, 16);
    context.fillRect(x - 1, bodyY - 1, 6, 16);

    if (hat) {
      context.fillStyle = "#26215c";
      context.fillRect(x - 10, bodyY - 50, 20, 6);
      context.fillRect(x - 7, bodyY - 58, 14, 10);
    }

    context.fillStyle = "#f5d5b8";
    context.beginPath();
    context.arc(x, bodyY - 34, 9, 0, Math.PI * 2);
    context.fill();

    if (name) {
      context.fillStyle = "rgba(255,255,255,0.6)";
      context.font = "9px sans-serif";
      context.textAlign = "center";
      context.fillText(name, x, bodyY - 62 + (hat ? -4 : 0));
    }

    if (!bubble) {
      return;
    }

    context.font = "11px 'Segoe UI', sans-serif";
    const maxTextWidth = 320;
    const lines = wrapText(context, bubble, maxTextWidth);
    const lineHeight = 14;
    const textWidth = Math.max(...lines.map((line) => context.measureText(line).width));
    const bubbleWidth = Math.max(110, Math.ceil(textWidth + 16));
    const bubbleHeight = Math.ceil(lines.length * lineHeight + 16);

    const wantsLeftSide = x > CANVAS_WIDTH * 0.55;
    const baseX = wantsLeftSide ? x - bubbleWidth - 14 : x + 14;
    const bubbleX = Math.max(8, Math.min(baseX, CANVAS_WIDTH - bubbleWidth - 8));
    const bubbleY = Math.max(4, bodyY - 62 - (bubbleHeight - 18));
    const tailBaseX = wantsLeftSide ? bubbleX + bubbleWidth : bubbleX;

    context.fillStyle = "rgba(255,255,255,0.9)";
    context.beginPath();
    context.roundRect(bubbleX, bubbleY - 14, bubbleWidth, bubbleHeight, 4);
    context.fill();

    context.beginPath();
    context.moveTo(tailBaseX, bubbleY + 2);
    context.lineTo(wantsLeftSide ? tailBaseX + 6 : tailBaseX - 6, bubbleY + 8);
    context.lineTo(wantsLeftSide ? tailBaseX - 6 : tailBaseX + 6, bubbleY + 2);
    context.fill();

    context.fillStyle = "#1a1a2e";
    context.textAlign = "left";
    lines.forEach((line, index) => {
      context.fillText(line, bubbleX + 8, bubbleY - 4 + (index + 1) * lineHeight);
    });
  }

  function drawSkyline(context, sceneConfig, canvasHeight) {
    skylineTemplate.forEach((building) => {
      drawBuilding(
        context,
        building.x,
        canvasHeight - building.h,
        building.w,
        building.h,
        sceneConfig.buildings[building.colorIndex],
        building.windows,
        building.seed
      );
    });
  }

  function drawGround(context, sceneConfig, width, height) {
    context.fillStyle = sceneConfig.ground;
    context.fillRect(0, height - 30, width, 30);

    context.fillStyle = "rgba(255,255,255,0.04)";
    for (let i = 0; i < width; i += 40) {
      context.fillRect(i, height - 18, 20, 5);
    }
  }

  function drawScene(sceneIndex, elapsed) {
    const canvas = getCanvas();
    if (!canvas) {
      return;
    }

    const context = prepareCanvasContext(canvas, CANVAS_WIDTH, CANVAS_HEIGHT);
    const sceneConfig = SCENES[sceneIndex];

    context.fillStyle = sceneConfig.sky;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawStars(context, elapsed);
    drawMoon(context, CANVAS_WIDTH - 70, 40, sceneConfig.sky);
    drawSkyline(context, sceneConfig, CANVAS_HEIGHT);
    drawGround(context, sceneConfig, CANVAS_WIDTH, CANVAS_HEIGHT);

    const step = STEPS[currentStepIndex] || STEPS[0];
    const charKeys = step.chars || ["student"];
    const positions = [CANVAS_WIDTH / 2 - 60, CANVAS_WIDTH / 2, CANVAS_WIDTH / 2 + 60, CANVAS_WIDTH / 2 - 120, CANVAS_WIDTH / 2 + 120];

    charKeys.forEach((charKey, index) => {
      const character = CHARACTERS[charKey];
      if (!character) {
        return;
      }

      const posX = positions[index] || CANVAS_WIDTH / 2;
      const bubble =
        !hasAnswered && index === 1
          ? step.dialog
          : hasAnswered && charKey === "student" && selectedChoiceText
            ? `Yo respondo: ${selectedChoiceText}`
            : null;
      drawPerson(context, posX, CANVAS_HEIGHT - 28, character.color, index * 1.5, character.hat, character.name, bubble);
    });

    context.fillStyle = "rgba(127,119,221,0.25)";
    context.beginPath();
    context.roundRect(10, 10, 80, 22, 6);
    context.fill();

    context.fillStyle = "#afa9ec";
    context.font = "11px sans-serif";
    context.textAlign = "left";
    context.fillText(`Nivel ${step.level} / 4`, 18, 25);

    const clouds = [
      [100, 20],
      [300, 35],
      [500, 18],
    ];

    clouds.forEach(([cloudX, cloudY], index) => {
      const offset = Math.sin(elapsed * 0.003 + index) * 8;
      context.fillStyle = "rgba(255,255,255,0.05)";
      context.beginPath();
      context.ellipse(cloudX + offset, cloudY, 35, 12, 0, 0, Math.PI * 2);
      context.fill();
    });
  }

  function renderPanelScene(canvasId, characterRenderer) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      return;
    }

    const panelHeight = canvasId === "gc-intro" ? INTRO_CANVAS_HEIGHT : END_CANVAS_HEIGHT;
    const context = prepareCanvasContext(canvas, CANVAS_WIDTH, panelHeight);

    const scene = SCENES[0];
    context.fillStyle = scene.sky;
    context.fillRect(0, 0, CANVAS_WIDTH, panelHeight);

    drawStars(context, Date.now() / 50);
    drawMoon(context, 620, 40, scene.sky);
    drawSkyline(context, scene, panelHeight);
    drawGround(context, scene, CANVAS_WIDTH, panelHeight);

    characterRenderer(context, panelHeight);
  }

  function animateGame() {
    time += 1;

    const gameScreen = document.getElementById("game-screen");
    if (gameScreen && gameScreen.classList.contains("on")) {
      drawScene(currentScene, time);
    }

    animationFrameId = requestAnimationFrame(animateGame);
  }

  function showStep() {
    const step = STEPS[currentStepIndex];
    currentScene = step.scene;

    document.getElementById("lv-label").textContent = `Nivel ${step.level} / 4`;
    const progress = Math.round((currentStepIndex / STEPS.length) * 100);
    document.getElementById("prog").style.width = `${progress}%`;

    document.getElementById("dlg-char").textContent = step.char;
    document.getElementById("dlg-txt").textContent = step.dialog;

    const choicesContainer = document.getElementById("choices");
    choicesContainer.innerHTML = "";

    step.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.className = "cho";
      button.textContent = choice.t;
      button.addEventListener("click", () => handleChoice(index));
      choicesContainer.appendChild(button);
    });

    const feedback = document.getElementById("fb");
    feedback.style.display = "none";
    feedback.classList.remove("good-fb", "bad-fb", "mid-fb");

    document.getElementById("nxt").style.display = "none";
    hasAnswered = false;
    selectedChoiceText = "";
  }

  function handleChoice(choiceIndex) {
    if (hasAnswered) {
      return;
    }

    hasAnswered = true;
    const step = STEPS[currentStepIndex];
    const result = step.choices[choiceIndex].r;
    selectedChoiceText = step.choices[choiceIndex].t;

    const earned = step.pts[result] || 0;
    score += earned;
    document.getElementById("pts").textContent = `${score} pts`;

    document.querySelectorAll(".cho").forEach((button, index) => {
      if (index === choiceIndex) {
        button.classList.add(result === "good" ? "good" : result === "bad" ? "bad" : "mid");
        return;
      }
      button.classList.add("dim");
    });

    const feedback = document.getElementById("fb");
    const message = step.fb[result] || step.fb.mid;

    document.getElementById("fb-p").textContent = message;

    const tag =
      result === "good"
        ? "Perspectiva construccionista ✓"
        : result === "bad"
          ? "Para reflexionar"
          : "Para profundizar";

    document.getElementById("fb-tag").textContent = tag;
    feedback.classList.remove("good-fb", "bad-fb", "mid-fb");
    feedback.classList.add(result === "good" ? "good-fb" : result === "bad" ? "bad-fb" : "mid-fb");
    feedback.style.display = "block";

    document.getElementById("nxt").style.display = "block";
  }

  function showEnd() {
    document.getElementById("game-screen").classList.remove("on");
    document.getElementById("end-screen").classList.add("on");

    document.getElementById("end-pts").textContent = `${score} pts`;

    document.getElementById("end-msg").textContent = "";

    renderPanelScene("gc-end", (context) => {
      const colors = ["#7f77dd", "#1d9e75", "#d4537e", "#ef9f27", "#5dcaa5"];

      let endBubbles = ["felicidades vamos a ponerte 50"];
      if (score < 90) {
        endBubbles = ["Aun tienes muy presente el discurso del deficit, no le sabes a Gergen"];
      } else if (score <= 150) {
        endBubbles = ["vamos bien, una postura mas neutral pero puede mejorar"];
      }

      for (let i = 0; i < 8; i += 1) {
        const bubble = i === 0 ? endBubbles[0] : i === 1 ? endBubbles[1] : null;
        drawPerson(context, 60 + i * 80, 100, colors[i % colors.length], i * 0.8, i % 3 === 0, "", bubble);
      }
    });
  }

  function resetGame() {
    score = 0;
    currentStepIndex = 0;
    hasAnswered = false;

    document.getElementById("end-screen").classList.remove("on");
    document.getElementById("game-screen").classList.add("on");
    document.getElementById("pts").textContent = "0 pts";

    setGameCanvasSize();
    showStep();
  }

  function renderIntroStaticFrame() {
    renderPanelScene("gc-intro", (context) => {
      const colors = ["#7f77dd", "#d4537e", "#1d9e75", "#ef9f27", "#5dcaa5", "#afa9ec"];
      for (let i = 0; i < 6; i += 1) {
        const name = ["", "Prof.", "", "Juez", "", ""][i];
        drawPerson(context, 80 + i * 100, 148, colors[i], i, i === 2 || i === 4, name, null);
      }
    });
  }

  function animateIntro() {
    const introScreen = document.getElementById("intro-screen");
    if (!introScreen || !introScreen.classList.contains("on")) {
      return;
    }

    renderPanelScene("gc-intro", (context) => {
      const elapsed = Date.now() / 20;
      const colors = ["#7f77dd", "#d4537e", "#1d9e75", "#ef9f27", "#5dcaa5", "#afa9ec"];
      for (let i = 0; i < 6; i += 1) {
        const name = ["", "Prof.", "", "Juez", "", ""][i];
        drawPerson(context, 80 + i * 100, 148, colors[i], i * 1.2 + elapsed * 0.01, i === 2 || i === 4, name, null);
      }
    });

    requestAnimationFrame(animateIntro);
  }

  function startGame() {
    document.getElementById("intro-screen").classList.remove("on");
    document.getElementById("game-screen").classList.add("on");

    setGameCanvasSize();
    showStep();

    if (!animationFrameId) {
      animateGame();
    }
  }

  function bindEvents() {
    document.getElementById("nxt").addEventListener("click", () => {
      currentStepIndex += 1;
      if (currentStepIndex >= STEPS.length) {
        showEnd();
        return;
      }
      showStep();
    });

    document.getElementById("play-again").addEventListener("click", resetGame);
    document.getElementById("start-btn").addEventListener("click", startGame);
    window.addEventListener("resize", setGameCanvasSize);
  }

  function init() {
    renderIntroStaticFrame();
    animateIntro();
    bindEvents();
  }

  init();
})();
