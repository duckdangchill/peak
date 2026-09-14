// script.js — nền 3D dùng chung cho trang 20/10 (nhiều đối tượng).
// Phụ thuộc: THREE (three.js), #threejs-canvas, wishes.js
// (cung cấp window.TEXTS_BY_TAB và đọc window.currentWishTab).

(function () {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const isCompactViewport = window.matchMedia
    ? window.matchMedia("(max-width: 700px)").matches
    : viewportWidth <= 700;
  const starCount = isCompactViewport ? 360 : 800;
  const dustCount = isCompactViewport ? 300 : 720;
  const textCount = isCompactViewport ? 90 : 200;
  const petalCount = isCompactViewport ? 10 : 15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    viewportWidth / viewportHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isCompactViewport });

  if (isCompactViewport) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  }

  renderer.setSize(viewportWidth, viewportHeight);
  document.getElementById("threejs-canvas").appendChild(renderer.domElement);

  camera.position.z = 20;
  camera.rotation.y = 0.5;

  renderer.domElement.addEventListener("wheel", (event) => {
    event.preventDefault();
    camera.position.z += event.deltaY * 0.006;
    camera.position.z = Math.max(3, Math.min(camera.position.z, 50));
  });

  function createTextTexture(text) {
    const maxCanvasWidth = 1200;
    const initialFontSize = 96;
    const horizontalPadding = 100;

    const measureCanvas = document.createElement("canvas");
    const measureCtx = measureCanvas.getContext("2d");

    let fontSize = initialFontSize;
    measureCtx.font = `bold ${fontSize}px 'Arial'`;

    let measuredWidth = measureCtx.measureText(text).width;

    if (measuredWidth + horizontalPadding * 2 > maxCanvasWidth) {
      const availableWidth = maxCanvasWidth - horizontalPadding * 2;
      fontSize = Math.floor((fontSize * availableWidth) / measuredWidth);
      measureCtx.font = `bold ${fontSize}px 'Arial'`;
      measuredWidth = measureCtx.measureText(text).width;
    }

    const canvasWidth = Math.ceil(measuredWidth + horizontalPadding * 2);
    const canvasHeight = 384;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d");
    ctx.font = `bold ${fontSize}px 'Arial'`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = `rgb(${getCurrentAccentRGB().join(", ")})`;
    ctx.shadowBlur = 50;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    ctx.strokeStyle = "#fff";
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

    return {
      texture: new THREE.CanvasTexture(canvas),
      aspect: canvas.width / canvas.height,
    };
  }

  const starMeshes = [];
  const textMeshes = [];
  const petalMeshes = [];
  const shootingStars = [];
  const retiringTextBatches = [];
  let ambientDustField = null;
  let fallingPetalTextures = [];
  let activeTextTextures = [];
  const FALLBACK_ACCENT_RGB = [255, 183, 77];

  function getCurrentAccentRGB() {
    const rgb = window.currentAccentRGB;
    return Array.isArray(rgb) && rgb.length === 3 ? rgb : FALLBACK_ACCENT_RGB;
  }

  function rgbToHex(rgb) {
    return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
  }

  function getCurrentPetalEmojis() {
    const emojis = window.currentPetalEmojis;
    return Array.isArray(emojis) && emojis.length
      ? emojis
      : ["🌼", "🌸", "✨"];
  }

  function createEmojiTexture(emoji) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    const [red, green, blue] = getCurrentAccentRGB();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 116px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = `rgba(${red}, ${green}, ${blue}, 0.85)`;
    ctx.shadowBlur = 24;
    ctx.fillText(emoji, canvas.width / 2, canvas.height / 2 + 4);

    return new THREE.CanvasTexture(canvas);
  }

  function createBackgroundStars() {
    const geometry = new THREE.SphereGeometry(0.07, 6, 6);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < starCount; i += 1) {
      const star = new THREE.Mesh(geometry, material);
      star.position.x = (Math.random() - 0.5) * 120;
      star.position.y = Math.random() * 80 - 20;
      star.position.z = (Math.random() - 0.5) * 120 - 20;
      scene.add(star);
      starMeshes.push(star);
    }
  }

  function createAmbientDust() {
    const count = dustCount;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 92;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 58;
      positions[i * 3 + 2] = -100 + Math.random() * 30;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: rgbToHex(getCurrentAccentRGB()),
      size: 0.16,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    ambientDustField = new THREE.Points(geometry, material);
    scene.add(ambientDustField);
  }

  function updateAmbientDustColor() {
    if (ambientDustField) {
      ambientDustField.material.color.setHex(rgbToHex(getCurrentAccentRGB()));
    }
  }

  function getCurrentTexts() {
    const tab = window.currentWishTab || "chung";
    const source = (window.TEXTS_BY_TAB && window.TEXTS_BY_TAB[tab]) || [];
    return source.length ? source : ["20/10 vui vẻ"];
  }

  function disposeTextBatch(batch) {
    batch.meshes.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    batch.textures.forEach((texture) => texture.dispose());
  }

  function createFallingTexts(crossfade = false) {
    const oldMeshes = textMeshes.splice(0);
    const oldTextures = activeTextTextures;
    activeTextTextures = [];

    if (crossfade && oldMeshes.length) {
      retiringTextBatches.push({ meshes: oldMeshes, textures: oldTextures });
    } else {
      disposeTextBatch({ meshes: oldMeshes, textures: oldTextures });
    }

    const textSource = getCurrentTexts();
    const textEntries = textSource.map((text) => createTextTexture(text));
    activeTextTextures = textEntries.map((entry) => entry.texture);

    for (let i = 0; i < textCount; i += 1) {
      const entry = textEntries[Math.floor(Math.random() * textEntries.length)];
      const { texture, aspect } = entry;
      texture.needsUpdate = true;

      const planeHeight = 3;
      const planeWidth = planeHeight * aspect;
      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        color: 0xffffff,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (Math.random() - 0.5) * 100;
      mesh.position.y = Math.random() * 32 - 12;
      mesh.position.z = (Math.random() - 0.5) * 40;
      mesh.userData.phase = Math.random() * Math.PI * 2;
      mesh.userData.fadeIn = crossfade ? 0 : 1;

      scene.add(mesh);
      textMeshes.push(mesh);
    }
  }

  function createFallingPetals() {
    petalMeshes.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    petalMeshes.length = 0;

    fallingPetalTextures.forEach((texture) => texture.dispose());
    fallingPetalTextures = getCurrentPetalEmojis().map(createEmojiTexture);

    for (let i = 0; i < petalCount; i += 1) {
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({
        map: fallingPetalTextures[i % fallingPetalTextures.length],
        transparent: true,
        depthWrite: false,
        depthTest: true,
      });

      const petal = new THREE.Mesh(geometry, material);
      petal.position.x = (Math.random() - 0.5) * 30;
      petal.position.y = Math.random() * 32 - 12;
      petal.position.z = (Math.random() - 0.5) * 20;

      const scale = 1 + Math.random() * 1.5;
      petal.scale.set(scale, scale, 1);
      petal.userData.spin = (Math.random() - 0.5) * 0.02;

      scene.add(petal);
      petalMeshes.push(petal);
    }
  }

  function spawnShootingStar() {
    const geometry = new THREE.SphereGeometry(0.15, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
    });

    const star = new THREE.Mesh(geometry, material);
    star.position.x = (Math.random() - 0.5) * 100;
    star.position.y = Math.random() * 80 - 20;
    star.position.z = -40 - Math.random() * 40;

    star.userData = {
      vx: 0.4 + Math.random() * 0.3,
      vy: -0.2 - Math.random() * 0.2,
      vz: 0.7 + Math.random() * 0.5,
      tail: [],
    };

    scene.add(star);
    shootingStars.push(star);
  }

  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let isTouching = false;
  let lastTouchX = 0;
  let lastTouchY = 0;
  let manualRotationX = 0;
  let manualRotationY = 0.5;
  let pointerParallaxX = 0;
  let pointerParallaxY = 0;
  let targetRotationX = manualRotationX;
  let targetRotationY = manualRotationY;

  function updateRotationTarget() {
    targetRotationX = manualRotationX + pointerParallaxX;
    targetRotationY = manualRotationY + pointerParallaxY;
  }

  renderer.domElement.addEventListener("mousedown", (event) => {
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  window.addEventListener("mousemove", (event) => {
    if (!isDragging) {
      pointerParallaxY = ((event.clientX / window.innerWidth) - 0.5) * 0.14;
      pointerParallaxX = ((event.clientY / window.innerHeight) - 0.5) * 0.07;
      updateRotationTarget();
      return;
    }

    const deltaX = event.clientX - lastMouseX;
    const deltaY = event.clientY - lastMouseY;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    manualRotationY += deltaX * 0.0015;
    manualRotationX = Math.max(-0.65, Math.min(0.65, manualRotationX + deltaY * 0.0012));
    pointerParallaxX = 0;
    pointerParallaxY = 0;
    updateRotationTarget();
  });

  renderer.domElement.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) return;
    isTouching = true;
    lastTouchX = event.touches[0].clientX;
    lastTouchY = event.touches[0].clientY;
  });

  window.addEventListener("touchend", () => {
    isTouching = false;
  });

  window.addEventListener("touchmove", (event) => {
    if (!isTouching || event.touches.length !== 1) return;

    const currentTouchX = event.touches[0].clientX;
    const currentTouchY = event.touches[0].clientY;
    const deltaX = currentTouchX - lastTouchX;
    const deltaY = currentTouchY - lastTouchY;
    lastTouchX = currentTouchX;
    lastTouchY = currentTouchY;
    manualRotationY += deltaX * 0.0015;
    manualRotationX = Math.max(-0.65, Math.min(0.65, manualRotationX + deltaY * 0.0012));
    pointerParallaxX = 0;
    pointerParallaxY = 0;
    updateRotationTarget();
  });

  function lerpColor(fromRgb, toRgb, t) {
    return [
      Math.round(fromRgb[0] + (toRgb[0] - fromRgb[0]) * t),
      Math.round(fromRgb[1] + (toRgb[1] - fromRgb[1]) * t),
      Math.round(fromRgb[2] + (toRgb[2] - fromRgb[2]) * t),
    ];
  }

  let animatedAccentRGB = getCurrentAccentRGB().slice();

  function animate() {
    requestAnimationFrame(animate);

    camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.08;
    camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.08;
    const now = Date.now();
    if (ambientDustField) {
      ambientDustField.rotation.y += 0.000018;
      ambientDustField.rotation.x = Math.sin(now * 0.00008) * 0.025;
    }
    animatedAccentRGB = lerpColor(
      animatedAccentRGB,
      getCurrentAccentRGB(),
      0.08
    );

    textMeshes.forEach((mesh) => {
      mesh.position.y -= 0.025 + Math.random() * 0.005;

      if (mesh.position.y < -12) {
        mesh.position.y = Math.random() * 20 + 10;
        mesh.position.x = (Math.random() - 0.5) * 30;
        mesh.position.z = (Math.random() - 0.5) * 40;
      }

      if (mesh.position.x > 16) mesh.position.x = -16;
      if (mesh.position.x < -16) mesh.position.x = 16;

      const glowPhase = (Math.sin(now * 0.0005 + mesh.userData.phase) + 1) / 2;
      const interpolatedRgb = lerpColor(
        [255, 255, 255],
        animatedAccentRGB,
        glowPhase
      );
      const hexColor =
        (interpolatedRgb[0] << 16) |
        (interpolatedRgb[1] << 8) |
        interpolatedRgb[2];

      mesh.material.color.setHex(hexColor);
      mesh.userData.fadeIn = Math.min(1, mesh.userData.fadeIn + 0.06);
      mesh.material.opacity = mesh.userData.fadeIn;
    });

    for (let i = retiringTextBatches.length - 1; i >= 0; i -= 1) {
      const batch = retiringTextBatches[i];
      let finished = true;
      batch.meshes.forEach((mesh) => {
        mesh.material.opacity = Math.max(0, mesh.material.opacity - 0.06);
        if (mesh.material.opacity > 0) finished = false;
      });

      if (finished) {
        disposeTextBatch(batch);
        retiringTextBatches.splice(i, 1);
      }
    }

    petalMeshes.forEach((petal) => {
      petal.position.y -= 0.04 + Math.random() * 0.02;
      petal.position.x += (Math.random() - 0.5) * 0.05;
      petal.rotation.z += petal.userData.spin || 0;

      if (petal.position.y < -12) {
        petal.position.y = Math.random() * 20 + 10;
        petal.position.x = (Math.random() - 0.5) * 30;
        petal.position.z = (Math.random() - 0.5) * 20;
      }

      if (petal.position.x > 16) petal.position.x = -16;
      if (petal.position.x < -16) petal.position.x = 16;
    });

    shootingStars.forEach((star, index) => {
      if (star.userData.tail.length > 20) {
        star.userData.tail.shift();
      }

      star.userData.tail.push({
        x: star.position.x,
        y: star.position.y,
        z: star.position.z,
      });

      star.position.x += star.userData.vx;
      star.position.y += star.userData.vy;
      star.position.z += star.userData.vz;

      for (let i = 0; i < star.userData.tail.length - 1; i += 1) {
        const p1 = star.userData.tail[i];
        const p2 = star.userData.tail[i + 1];

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(p1.x, p1.y, p1.z),
          new THREE.Vector3(p2.x, p2.y, p2.z),
        ]);

        const lineMaterial = new THREE.LineBasicMaterial({
          color: rgbToHex(animatedAccentRGB),
          transparent: true,
          opacity: 0.15 + 0.25 * (i / star.userData.tail.length),
        });

        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        setTimeout(() => scene.remove(line), 40);
      }

      star.material.opacity = 0.8;

      if (star.position.z > 0 || star.position.y < -40) {
        scene.remove(star);
        shootingStars.splice(index, 1);
      }
    });

    if (Math.random() < 0.012) {
      spawnShootingStar();
    }

    renderer.render(scene, camera);
  }

  createBackgroundStars();
  createAmbientDust();
  createFallingTexts();
  createFallingPetals();
  animate();

  window.addEventListener("resize", () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });

  // Cho phép index.html gọi lại khi người dùng đổi tab đối tượng,
  // để chữ và emoji bay trong nền đổi theo giọng điệu của tab đó.
  window.refreshFallingTexts = () => {
    createFallingTexts(true);
    createFallingPetals();
    updateAmbientDustColor();
  };
})();
