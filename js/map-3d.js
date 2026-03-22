/**
 * Nannys y Peques - Refined 3D Map Engine
 * Geographic 3D polygons for coverage zones.
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('map-3d-container');
    if (!container) return;

    // --- Configuration ---
    const colors = {
        background: 0xffffff,
        grid: 0xeeeeee,
        base: 0xf1f5f9,
        zones: [
            0xEC80C6, // Pink (Lomas / Santa Clara)
            0x4DC9E1, // Cyan (San Bernardino)
            0xFBBF24, // Yellow (Cholula)
            0x10B981  // Green (Cuautlancingo)
        ],
        hover: 0xFFFFFF
    };

    // --- Shape Definitions (Approximated from Image 2) ---
    // Coordinates are relative to a central point in Puebla
    
    // 1. Cuautlancingo (Greeen/Norte)
    const shapeCuautlancingo = new THREE.Shape();
    shapeCuautlancingo.moveTo(-1, 2);
    shapeCuautlancingo.lineTo(2, 2.5);
    shapeCuautlancingo.lineTo(3.5, 1.5);
    shapeCuautlancingo.lineTo(3, 0.5);
    shapeCuautlancingo.lineTo(1, 0.2);
    shapeCuautlancingo.lineTo(-1.5, 0.5);
    shapeCuautlancingo.lineTo(-1, 2);

    // 2. San Pedro Cholula (Yellow/West)
    const shapeCholula = new THREE.Shape();
    shapeCholula.moveTo(-3, 1.5);
    shapeCholula.lineTo(-1.2, 1.8);
    shapeCholula.lineTo(-1, 0.5);
    shapeCholula.lineTo(-2, -0.2);
    shapeCholula.lineTo(-3.5, 0.5);
    shapeCholula.lineTo(-3, 1.5);

    // 3. San Bernardino Tlaxcalancingo (Cyan/SouthWest)
    const shapeSanBernardino = new THREE.Shape();
    shapeSanBernardino.moveTo(-2, -0.2);
    shapeSanBernardino.lineTo(-0.5, 0);
    shapeSanBernardino.lineTo(0.2, -1.2);
    shapeSanBernardino.lineTo(-1.5, -1.8);
    shapeSanBernardino.lineTo(-2.5, -1);
    shapeSanBernardino.lineTo(-2, -0.2);

    // 4. Santa Clara Ocoyucan / Lomas (Pink/South)
    const shapeSantaClara = new THREE.Shape();
    shapeSantaClara.moveTo(0.2, -1.2);
    shapeSantaClara.lineTo(1.5, -0.8);
    shapeSantaClara.lineTo(2.5, -1.5);
    shapeSantaClara.lineTo(2, -2.5);
    shapeSantaClara.lineTo(0, -2.8);
    shapeSantaClara.lineTo(-0.5, -2);
    shapeSantaClara.lineTo(0.2, -1.2);

    const extrudeSettings = { 
        depth: 0.4, 
        bevelEnabled: true, 
        bevelThickness: 0.1, 
        bevelSize: 0.1, 
        bevelOffset: 0, 
        bevelSegments: 3 
    };

    const zonesData = [
        { 
            name: "Lomas de Angelópolis", 
            desc: "Santa Clara Ocoyucan y Lomas I, II, III. Zona de alta demanda.", 
            shape: shapeSantaClara,
            color: colors.zones[0],
            height: 0.6
        },
        { 
            name: "San Bernardino", 
            desc: "Tlaxcalancingo y alrededores de la Vía Atlixcáyotl.", 
            shape: shapeSanBernardino,
            color: colors.zones[1],
            height: 0.5
        },
        { 
            name: "San Pedro Cholula", 
            desc: "Zonas residenciales de Cholula y Zavaleta Poniente.", 
            shape: shapeCholula,
            color: colors.zones[2],
            height: 0.55
        },
        { 
            name: "Cuautlancingo", 
            desc: "Cobertura completa en la zona industrial y residencial norte.", 
            shape: shapeCuautlancingo,
            color: colors.zones[3],
            height: 0.45
        }
    ];

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 8); // Top-down perspective
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 15, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // --- Central Map Plate (Simplified) ---
    const basePlateGeo = new THREE.CircleGeometry(6, 64);
    const basePlateMat = new THREE.MeshPhongMaterial({ color: 0xf8fafc, side: THREE.DoubleSide });
    const basePlate = new THREE.Mesh(basePlateGeo, basePlateMat);
    basePlate.rotation.x = -Math.PI / 2;
    basePlate.position.y = -0.1;
    basePlate.receiveShadow = true;
    scene.add(basePlate);

    // --- Zone Meshes ---
    const zoneMeshes = [];
    const infoCard = document.getElementById('map-3d-info');
    const zoneNameEl = document.getElementById('zone-name');
    const zoneDescEl = document.getElementById('zone-desc');

    zonesData.forEach((data) => {
        const geometry = new THREE.ExtrudeGeometry(data.shape, { ...extrudeSettings, depth: data.height });
        const material = new THREE.MeshPhongMaterial({ 
            color: data.color,
            transparent: true,
            opacity: 0.7,
            shininess: 80
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2; // Flat on the ground
        mesh.position.y = 0;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = data;
        
        scene.add(mesh);
        zoneMeshes.push(mesh);
    });

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

    // --- Animation Loop ---
    function animate() {
        requestAnimationFrame(animate);

        // Gentle floating effect for the whole group
        const time = Date.now() * 0.001;
        scene.position.y = Math.sin(time) * 0.05;

        // Perspective rotation
        const targetRotY = mouse.x * 0.15;
        const targetRotX = mouse.y * 0.1;
        scene.rotation.y += (targetRotY - scene.rotation.y) * 0.05;
        scene.rotation.x += (targetRotX - scene.rotation.x) * 0.05;

        // Interaction
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(zoneMeshes);

        if (intersects.length > 0) {
            const first = intersects[0].object;
            if (hoveredMesh !== first) {
                if (hoveredMesh) {
                    hoveredMesh.material.opacity = 0.7;
                    hoveredMesh.position.y = 0;
                }
                hoveredMesh = first;
                hoveredMesh.material.opacity = 1;
                hoveredMesh.position.y = 0.2; // Lift up
                
                zoneNameEl.innerText = hoveredMesh.userData.name;
                zoneDescEl.innerText = hoveredMesh.userData.desc;
                infoCard.classList.add('active');
            }
        } else {
            if (hoveredMesh) {
                hoveredMesh.material.opacity = 0.7;
                hoveredMesh.position.y = 0;
                hoveredMesh = null;
                infoCard.classList.remove('active');
            }
        }

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    animate();
});
