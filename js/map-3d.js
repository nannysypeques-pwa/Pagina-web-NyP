/**
 * Nannys y Peques - Professional Interactive 3D Map
 * CALIBRATED alignment to img/maps/Puebla.png
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('map-3d-container');
    if (!container) return;

    // --- Configuration ---
    const colors = {
        zones: {
            cuautlancingo: 0x14A492, // Green/Teal
            cholula: 0xEDB112,       // Yellow
            sanBernardino: 0x1E40AF, // Blue
            santaClara: 0xEF4444      // Red/Pink
        }
    };

    // --- Calibrated Shapes (Targeting Puebla.png outlines) ---
    
    // 1. Zona Superior (Teal) - Wide and top
    const shapeTop = new THREE.Shape();
    shapeTop.moveTo(-2.5, 4.5);
    shapeTop.lineTo(6.5, 4.5);
    shapeTop.lineTo(6.8, 0.5);
    shapeTop.lineTo(1.8, -0.2);
    shapeTop.lineTo(-0.5, 0.5);
    shapeTop.lineTo(-1.8, 1.8);
    shapeTop.lineTo(-2.5, 4.5);

    // 2. Zona Izquierda (Amarillo) - Top Left
    const shapeLeft = new THREE.Shape();
    shapeLeft.moveTo(-4.5, 4.8);
    shapeLeft.lineTo(-2.5, 4.5);
    shapeLeft.lineTo(-1.8, 1.8);
    shapeLeft.lineTo(-4.2, 1.5);
    shapeLeft.lineTo(-4.5, 4.8);

    // 3. Zona Inferior Izquierda (Azul) - Large Bottom Left
    const shapeBottomLeft = new THREE.Shape();
    shapeBottomLeft.moveTo(-4.2, 1.5);
    shapeBottomLeft.lineTo(-0.8, 0.2);
    shapeBottomLeft.lineTo(-0.5, -2.5);
    shapeBottomLeft.lineTo(-2.8, -6.5);
    shapeBottomLeft.lineTo(-5.5, -2.5);
    shapeBottomLeft.lineTo(-4.2, 1.5);

    // 4. Zona Inferior Derecha (Roja) - Center Bottom
    const shapeBottomRight = new THREE.Shape();
    shapeBottomRight.moveTo(-0.5, -2.5);
    shapeBottomRight.lineTo(3.8, -1.2);
    shapeBottomRight.lineTo(5.2, -4.5);
    shapeBottomRight.lineTo(2.0, -6.8);
    shapeBottomRight.lineTo(-1.8, -6.2);
    shapeBottomRight.lineTo(-0.5, -2.5);

    const extrudeSettings = { depth: 0.3, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 };

    const zonesData = [
        { name: "Zona Norte", shape: shapeTop, color: colors.zones.cuautlancingo },
        { name: "Zona Poniente", shape: shapeLeft, color: colors.zones.cholula },
        { name: "Zona Sur-Poniente", shape: shapeBottomLeft, color: colors.zones.sanBernardino },
        { name: "Zona Sur", shape: shapeBottomRight, color: colors.zones.santaClara }
    ];

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfcfc);

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 18, 0); 
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(10, 20, 10);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // --- Base Map Image ---
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('img/maps/Puebla.png', (texture) => {
        const aspect = texture.image.width / texture.image.height;
        const planeGeo = new THREE.PlaneGeometry(12 * aspect, 12); // Slightly larger for better fit
        const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const mapPlane = new THREE.Mesh(planeGeo, planeMat);
        mapPlane.rotation.x = -Math.PI / 2;
        mapPlane.position.y = -0.15;
        mapPlane.receiveShadow = true;
        scene.add(mapPlane);

        initZones();
    });

    const zoneMeshes = [];

    function initZones() {
        zonesData.forEach((data) => {
            const geometry = new THREE.ExtrudeGeometry(data.shape, extrudeSettings);
            const material = new THREE.MeshPhongMaterial({ 
                color: data.color, 
                transparent: true, 
                opacity: 0.5,
                shininess: 90
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.y = 0;
            mesh.castShadow = true;
            mesh.userData = data;
            
            scene.add(mesh);
            zoneMeshes.push(mesh);
        });
        animate();
    }

    // --- Interaction ---
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let hoveredMesh = null;

    function onMouseMove(event) {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
    }

    container.addEventListener('mousemove', onMouseMove);

    function animate() {
        requestAnimationFrame(animate);

        // Perspective rotation
        scene.rotation.y += (mouse.x * 0.1 - scene.rotation.y) * 0.05;
        scene.rotation.x += (mouse.y * 0.1 - scene.rotation.x) * 0.05;

        // Intersection (Elevation)
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(zoneMeshes);

        if (intersects.length > 0) {
            const first = intersects[0].object;
            if (hoveredMesh !== first) {
                if (hoveredMesh) hoveredMesh.material.opacity = 0.5;
                hoveredMesh = first;
                hoveredMesh.material.opacity = 0.8;
            }
            hoveredMesh.position.y += (1.0 - hoveredMesh.position.y) * 0.1; // Higher lift for visibility
        } else {
            if (hoveredMesh) {
                hoveredMesh.material.opacity = 0.5;
                hoveredMesh.position.y += (0 - hoveredMesh.position.y) * 0.1;
                if (Math.abs(hoveredMesh.position.y) < 0.01) {
                    hoveredMesh.position.y = 0;
                    hoveredMesh = null;
                }
            }
        }

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
});
