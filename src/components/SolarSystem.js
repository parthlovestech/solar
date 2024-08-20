import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './SolarSystem.css'; // Import the CSS file
import SpriteText from 'three-spritetext';

const SolarSystem = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Create scene
    const scene = new THREE.Scene();

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 50, 150); // Set initial position

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);

    // Add OrbitControls for camera manipulation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.maxPolarAngle = Math.PI / 2; // Prevent camera from going below the ground

    // Set background image
    const container = mountRef.current;
    container.style.background = `url('/assets/textures/stars.jpg') no-repeat center center fixed`;
    container.style.backgroundSize = 'cover';

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 10, 10).normalize();
    scene.add(ambientLight);
    scene.add(directionalLight);

    // Create Sun with image texture
    const sunTexture = new THREE.TextureLoader().load('/assets/textures/sun.jpg');
    const sunMaterial = new THREE.MeshBasicMaterial({
      map: sunTexture
    });

    const sun = new THREE.Mesh(new THREE.SphereGeometry(10, 64, 64), sunMaterial);
    scene.add(sun);

    // Create planets with detailed textures
    const planetTextures = [
      '/assets/textures/mercury.jpg',
      '/assets/textures/venus.jpg',
      '/assets/textures/earth.jpg',
      '/assets/textures/mars.jpg',
      '/assets/textures/jupiter.jpg',
      '/assets/textures/saturn.jpg',
      '/assets/textures/uranys.jpg',
      '/assets/textures/neptune.jpg'
    ];

    const planetDistances = [20, 30, 40, 50, 60, 70, 80, 100];
    const planets = [];
    const planetNames = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

    planetTextures.forEach((texturePath, i) => {
      const texture = new THREE.TextureLoader().load(texturePath);
      const material = new THREE.MeshStandardMaterial({ map: texture });
      const geometry = new THREE.SphereGeometry(2, 32, 32);
      const planet = new THREE.Mesh(geometry, material);

      // Set initial position to align with orbit
      planet.position.set(planetDistances[i], 0, 0);
      scene.add(planet);
      planets.push({
        mesh: planet,
        distance: planetDistances[i],
        rotationSpeed: 0.01 * (i + 1),
        orbitSpeed: 0.02 / (i + 1)
      });

      // Add planet name above it
      const nameText = new SpriteText(planetNames[i], 1.5, 'white');
      nameText.position.set(0, 3, 0);
      planet.add(nameText);
    });

    // Add a ring to Saturn
    const createSaturnRings = (size) => {
      const ringTexture = new THREE.TextureLoader().load('/assets/textures/saturn-ring.png');
      const ringGeometry = new THREE.RingGeometry(size * 1.3, size * 1.5, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8 // Adjust opacity as needed
      });
      const rings = new THREE.Mesh(ringGeometry, ringMaterial);
      rings.rotation.x = Math.PI / 2;
      return rings;
    };

    const saturnIndex = planetNames.indexOf('Saturn');
    if (saturnIndex !== -1) {
      const saturnRing = createSaturnRings(2);
      planets[saturnIndex].mesh.add(saturnRing);
    }

    // Create visible orbits
    const createOrbit = (radius) => {
      const segments = 64;
      const orbitGeometry = new THREE.BufferGeometry();
      const positions = [];
      const angleStep = (Math.PI * 2) / segments;

      for (let i = 0; i < segments; i++) {
        const angle = i * angleStep;
        positions.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      }

      // Close the loop
      positions.push(positions[0], 0, positions[2]);

      orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.7,
        transparent: true,
        linewidth: 2
      });

      const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
      orbitLine.rotation.x = Math.PI / 2;
      return orbitLine;
    };

    planetDistances.forEach(distance => {
      const orbit = createOrbit(distance);
      scene.add(orbit);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate Sun
      sun.rotation.y += 0.01;

      // Update planet positions
      const time = Date.now() * 0.0005;
      planets.forEach((planet) => {
        planet.mesh.position.x = planet.distance * Math.cos(time * planet.orbitSpeed);
        planet.mesh.position.z = planet.distance * Math.sin(time * planet.orbitSpeed);
        planet.mesh.rotation.y += planet.rotationSpeed;
      });

      controls.update();

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Cleanup on unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="solar-system-container">
      <h1 className="title">Solar System</h1>
      <div ref={mountRef} />
    </div>
  );
};

export default SolarSystem;
