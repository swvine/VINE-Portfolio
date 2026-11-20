
/* =====================================
   VINE WORLD — 3D GARDEN
===================================== */
 
import * as THREE from "three";
 
import { OrbitControls } from
  "three/addons/controls/OrbitControls.js";
 
import { GLTFLoader } from
  "three/addons/loaders/GLTFLoader.js";
const container = document.getElementById("vine-world-scene");
 
if (container) {
 
  // Create the 3D scene
  const scene = new THREE.Scene();
 

// VINE WORLD — TEXTURED WOODLAND STREAM AND BANKS
// Lightweight textured bands following the octagonal island.

const riverSettings = {
  segments: 256,
  islandRadius: 7,
  waterOuterInset: 0.47,
  waterInnerInset: 1.10,
  bankWidth: 0.18,
  waterHeight: 0.00,
  bankHeight: 0.00
};

// Load the existing 1K Poly Haven texture files.
const shoreTextureLoader = new THREE.TextureLoader();

function loadShoreTexture(path, repeatX = 1) {
  const texture = shoreTextureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, 1);
  texture.anisotropy = 4;
  return texture;
}

const mudTexture = loadShoreTexture(
  "assets/models/brown_mud_03_1k/textures/brown_mud_03_diff_1k.jpg"
);

const smallPebbleTexture = loadShoreTexture(
  "assets/models/ganges_river_pebbles_1k/textures/ganges_river_pebbles_diff_1k.jpg"
);

const largePebbleTexture = loadShoreTexture(
  "assets/models/dry_river_pebbles_1k/textures/dry_river_pebbles_diff_1k.jpg"
);

// Match the floating island's octagonal outline.
function octagonRadius(angle) {
  const sector = Math.PI / 4;
  const local =
    ((angle % sector) + sector) % sector - sector / 2;

  return riverSettings.islandRadius *
    Math.cos(sector / 2) / Math.cos(local);
}

function shoreRadius(angle, inset) {
  const gentleBend =
    0.055 * Math.sin(angle * 5 + 0.4) +
    0.025 * Math.sin(angle * 11);

  return octagonRadius(angle) - inset + gentleBend;
}

// Build a thin, textured shoreline band.
function makeShoreBand(
  outerInset,
  innerInset,
  height,
  material
) {
  const vertices = [];
  const indices = [];
  const uvs = [];

  for (let i = 0; i <= riverSettings.segments; i++) {
    const angle =
      i * Math.PI * 2 / riverSettings.segments;

    const insets = [outerInset, innerInset];

    for (let j = 0; j < 2; j++) {
      const r = shoreRadius(angle, insets[j]);

const slope = j === 0 ? 0.004 : -0.004;
const variation = 0.002 * Math.sin(angle * 18);

vertices.push(
  r * Math.cos(angle),
  height + slope + variation,
  r * Math.sin(angle)
);


    uvs.push(
  (i / riverSettings.segments) * 32,
  j * 0.35
);
    }

    if (i < riverSettings.segments) {
      const k = i * 2;

      indices.push(
        k, k + 1, k + 2,
        k + 1, k + 3, k + 2
      );
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(uvs, 2)
  );

  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const band = new THREE.Mesh(geometry, material);

  band.receiveShadow = true;
  band.frustumCulled = false;

  return band;
}


// Ice 002 texture — testing as a water surface
const waterTexture = new THREE.TextureLoader().load(
  "assets/models/Ice002_1K-JPG/Ice002_1K-JPG_Color.jpg"
);

waterTexture.colorSpace = THREE.SRGBColorSpace;
waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;
waterTexture.repeat.set(2, 2);


// Existing water color retained for this first update.

const waterMaterial = new THREE.MeshStandardMaterial({
  map: waterTexture,
  color: 0xb5f5ee,
  roughness: 0.25,
  metalness: 0.1,
  transparent: true,
  opacity: 0.96,
  side: THREE.DoubleSide
});


const earthBankMaterial = new THREE.MeshStandardMaterial({
  map: mudTexture,
  roughness: 1,
  side: THREE.DoubleSide
});

const mossBankMaterial = new THREE.MeshStandardMaterial({
  map: smallPebbleTexture,
  roughness: 1,
  side: THREE.DoubleSide
});

const largePebbleBankMaterial =
  new THREE.MeshStandardMaterial({
    map: largePebbleTexture,
    roughness: 1,
    side: THREE.DoubleSide
  });

// The shoreline is built from adjoining textured bands.
//  pebbles -> mud -> water -> mud -> peppbles -> grass.

scene.add(
  // Outer upper bank: light river pebbles
  makeShoreBand(
    0.30, 0.55, 0.065,
    largePebbleBankMaterial

  ),

  // Continuous river
  makeShoreBand(
    0.47, 1.10, 0.004,
    waterMaterial
  ),

  // Inner lower bank: wet mud beside water
  makeShoreBand(
    1.04, 1.21, 0.008,
    earthBankMaterial
  ),

  // Inner upper bank: light river pebbles
  makeShoreBand(
    1.21, 1.35, 0.008,
    mossBankMaterial
  )
);



// Dark mud along the curved edge between rocks and water
scene.add(
  makeShoreBand(
    0.30, 0.65, 0.012,
    earthBankMaterial
  )
);


scene.add(
  makeShoreBand(
    -0.09, 0.30, 0.009,
    earthBankMaterial
  )
);


// =====================================
// VINE WORLD — REALISTIC WOODLAND ASSETS
// =====================================
 
const gltfLoader = new GLTFLoader();
 
// =====================================
// VINE WORLD — INDIVIDUAL ASSET PLACEMENT
// Change each item's position [X,Y,Z], rotation (radians), and scale [X,Y,Z].
// These are separate scene objects; models containing multiple meshes remain intact.
// =====================================
function placeModelCopies(path, label, placements) {
  gltfLoader.load(path, (gltf) => {
    placements.forEach(({ name, position, rotation = 0, scale = [1, 1, 1] }) => {
      const item = gltf.scene.clone(true);
      item.name = name;
      item.position.set(...position);
      item.rotation.y = rotation;
      item.scale.set(...scale);
      scene.add(item);
    });
    console.log(
      `${label}: ${placements.length} individually positioned objects loaded`

    );
  }, undefined, (error) => console.error(`Error loading ${label}:`, 
    error
));
}


 // =====================================
 // VINE WORLD — 3D SHORELINE GRAVEL
 // =====================================

function addShorelineGravel(path, label, placements) {
  gltfLoader.load(path, (gltf) => {
    const source = gltf.scene;

    const bounds = new THREE.Box3().setFromObject(source);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    // Normalize the model so its original size is not a problem.
    const footprint = Math.max(size.x, size.z, 0.001);

    placements.forEach((settings, index) => {
      const patch = source.clone(true);
      const group = new THREE.Group();

      patch.position.set(
        -center.x,
        -bounds.min.y,
        -center.z
      );

      group.add(patch);

      const width = settings.width;
      const factor = width / footprint;

      
group.scale.set(
  factor * (settings.length ?? 1),
  factor * settings.height,
  factor * (settings.depth ?? 1)
);


      const angle = settings.angle;
      const radius = shoreRadius(angle, settings.inset);

      group.position.set(
        radius * Math.cos(angle),
        settings.y,
        radius * Math.sin(angle)
      );

      group.rotation.y = angle + settings.rotation;
      group.name = `${label} ${index + 1}`;

      scene.add(group);
    });
  }, undefined, (error) => {
    console.error(`Could not load ${label}:`, error);
  });
}


// Dry River Pebbles — 10 varied rock shapes
addShorelineGravel(
  "assets/models/dry_river_pebbles_1k/dry_river_pebbles_1k.gltf",
  "Dry River Pebbles Test",
  [
    // Behind art
    {
      angle: 0,
      inset: 1.30,
      y: 0.012,
      width: 0.45,
      height: 0.12,
      length: 1.65,
      depth: 0.75,
      rotation: 0
    },
    {
      angle: 0.35,
      inset: 1.30,
      y: 0.012,
      width: 0.38,
      height: 0.10,
      length: 0.95,
      depth: 1.10,
      rotation: 0.2
    },
    {
      angle: 0.75,
      inset: 1.30,
      y: 0.012,
      width: 0.42,
      height: 0.12,
      length: 1.35,
      depth: 0.85,
      rotation: 0.5
    },
    {
      angle: 1.15,
      inset: 1.30,
      y: 0.012,
      width: 0.36,
      height: 0.10,
      length: 0.85,
      depth: 1.35,
      rotation: 0.8
    },
    {
      angle: 1.55,
      inset: 1.30,
      y: 0.012,
      width: 0.40,
      height: 0.11,
      length: 1.15,
      depth: 1.00,
      rotation: 0.3
    },
    {
      angle: 2.10,
      inset: 1.30,
      y: 0.012,
      width: 0.38,
      height: 0.10,
      length: 1.80,
      depth: 0.70,
      rotation: 0.7
    },
    {
      angle: 2.65,
      inset: 1.30,
      y: 0.012,
      width: 0.42,
      height: 0.12,
      length: 1.05,
      depth: 1.25,
      rotation: 0.4
    },
    {
      angle: 3.20,
      inset: 1.30,
      y: 0.012,
      width: 0.36,
      height: 0.10,
      length: 1.45,
      depth: 0.90,
      rotation: 0.9
    },
    {
      angle: 3.75,
      inset: 1.30,
      y: 0.012,
      width: 0.40,
      height: 0.11,
      length: 0.90,
      depth: 1.15,
      rotation: 0.6
    },
    {
      angle: 4.30,
      inset: 1.30,
      y: 0.012,
      width: 0.38,
      height: 0.10,
      length: 1.55,
      depth: 0.80,
      rotation: 0.2
    }
  ]
);

// Ganges River Pebbles — 12 shoreline patches
addShorelineGravel(
  "assets/models/ganges_river_pebbles_1k/ganges_river_pebbles_1k.gltf",
  "Ganges River Pebbles",
  [
{ //behind art//
  angle: 0.18,
  length: 1.8,
  depth: 0.75, 
  inset: 1.12, 
  y: 0.03, 
  width: 0.24, 
  height: 0.37, 
  rotation: 0.5
    },
{ //art sign//
  angle: 0.55, 
  length: 1.0,
  depth: 1.0,
  inset: 1.27, 
  y: 0.012, 
  width: 0.46, 
  height: 0.33, 
  rotation: 0.7 
    },
{ //barrels//
  angle: 0.95,
  length: 1.4,
  depth: 0.85, 
  inset: 1.16, 
  y: 0.012, 
  width: 0.40, 
  height: 0.38, 
  rotation: 0.2 
    },
{ //behind tech//
  angle: 1.35, 
  length: 0.9,
  depth: 1.3,
  inset: 1.31, 
  y: 0.012, 
  width: 0.45, 
  height: 0.25, 
  rotation: 0.9 
    },
{ //between plants and tech//
  angle: 1.85, 
  length: 1.0,
  depth: 1.0,
  inset: 1.14, 
  y: 0.012, 
  width: 0.29, 
  height: 0.25, 
  rotation: 0.4 
    },
{ // behing tech sign//
  angle: 2.35, 
  length: 2.0,
  depth: 0.70,
  inset: 1.24, 
  y: 0.012, 
  width: 0.37, 
  height: 0.38, 
  rotation: 0.6 
    },
{ //behind pavilion
  angle: 2.90,
  length: 0.85,
  depth: 1.15, 
  inset: 1.13, 
  y: 0.012, 
  width: 0.32, 
  height: 0.46, 
  rotation: 0.1 
    },
{ //behind devine//
  angle: 3.45, 
  length: 1.5,
  depth: 0.90,
  inset: 1.33, 
  y: 0.012, 
  width: 0.50, 
  height: 0.42, 
  rotation: 0.8 
    },
{ //behind tree-devine//
  angle: 4.00, 
  length: 1.2,
  depth: 1.1,
  inset: 1.13, 
  y: 0, 
  width: 0.43, 
  height: 0.40, 
  rotation: 1 
    },
{ //behind design//
  angle: 4.55, 
  length: 1.7,
  depth: 0.75,
  inset: 1.29, 
  y: 0.012, 
  width: 0.38, 
  height: 0.45, 
  rotation: 0.2 
    },
{ //devine sign//
  angle: 5.20, 
  length: 0.95,
  depth: 1.25,
  inset: 1.27, 
  y: 0.012, 
  width: 0.32, 
  height: 0.30, 
  rotation: 0.7 
    },
{ //behind trees-devine//
  angle: 5.80, 
  length: 1.35,
  depth: 0.95,
  inset: 1.29, 
  y: 0.012, 
  width: 0.36, 
  height: 0.32, 
  rotation: 0.4 
    }
  ]
);


 // =====================================
 // VINE WORLD — MOVABLE PINE TREES
 // =====================================

const pinePlacements = [
  { name: "Pine A", 
    position: [-2.95, 0, -2.95], 
    rotation: 0.35, 
    scale: [1.0, 1.0, 1.0] 
  },//devine//
  { name: "Pine B", 
    position: [2.95, 0, -2.85], 
    rotation: 1.15, 
    scale: [0.95, 0.95, 0.95] 
  },//design//
  { name: "Pine C", 
    position: [3.0, 0, 2.8], 
    rotation: 2.05, 
    scale: [1.05, 1.05, 1.05] 
  } //art//
];

gltfLoader.load(
  "assets/models/pine_sapling_small_1k/pine_sapling_small_1k.gltf",
  (gltf) => {
    const ids = ["a", "b", "c"];

    pinePlacements.forEach((settings, index) => {
      const tree = new THREE.Group();
      tree.name = settings.name;

      const parts = [
        `pine_sapling_small_${ids[index]}_1`,
        `pine_sapling_small_${ids[index]}_2`
      ];

      parts.forEach((partName) => {
        const original = gltf.scene.getObjectByName(partName);

        if (original) {
          const copy = original.clone();
          tree.add(copy);
        }
      });

      tree.position.set(...settings.position);
      tree.rotation.y = settings.rotation;
      tree.scale.set(...settings.scale);

      scene.add(tree);
    });

    console.log("Three movable pine trees loaded");
  }
);

// =====================================
// VINE WORLD — INDIVIDUAL PACHIRA TREES
// =====================================
 
gltfLoader.load(
  "assets/models/pachira_aquatica_01_1k/pachira_aquatica_01_1k.gltf",
  (gltf) => {
 

const treeSettings = [
  { id: "a", 
    position: [2.5, 0, -3.2], 
    scale: 0.72, 
    rotation: 0.3 
// design //
  },
  { id: "b", 
    position: [2.45, 0, 3.1], 
    scale: 0.65, 
    rotation: 1.0 
// art //
  },
  { id: "c", 
    position: [-2.7, 0, 3.0], 
    scale: 0.72, 
    rotation: 1.8 
// tech //
  },
  { id: "d", 
    position: [-2.7, 0, -3.1], 
    scale: 0.68, 
    rotation: 2.5 
//devine//
  }
];

    treeSettings.forEach(({ id, position, scale, rotation = 0 }) => {
      const tree = new THREE.Group();
 
      const bark = gltf.scene.getObjectByName(
        `pachira_aquatica_01_bark_${id}`
      );
 
      const leaves = gltf.scene.getObjectByName(
        `pachira_aquatica_01_leaves_${id}`
      );
 
      if (!bark || !leaves) {
        console.warn(`Pachira ${id} parts not found`);
        return;
      }
 
      // Clone the matching trunk and leaves
      const barkCopy = bark.clone();
      const leavesCopy = leaves.clone();
 
      // Remove original offsets so each tree has its own origin
      const offset = bark.position.clone();
 
      barkCopy.position.sub(offset);
      leavesCopy.position.sub(offset);
 
      tree.add(barkCopy);
      tree.add(leavesCopy);
 
      // Individual tree placement
      tree.position.set(...position);
      tree.rotation.y = rotation;
      tree.scale.set(scale, scale, scale);
 
      scene.add(tree);
    });
 
    console.log("Four individual Pachira trees loaded");
  },
  undefined,
  (error) => console.error("Error loading Pachira trees:", error)
);
 
// THREE INDIVIDUALLY POSITIONED FIR SAPLINGS
const firPlacements = [
  //tech//
  { id: "005", 
    name: "Fir A", 
    position: [-3.35, 0, 2.45], 
    rotation: 0.35, 
    scale: [0.52, 0.52, 0.52] 
  },
  //design x2//
  { id: "006", 
    name: "Fir B", 
    position: [3.35, 0, -2.35], 
    rotation: 1.2, 
    scale: [0.47, 0.47, 0.47] 
  },
  { id: "007", 
    name: "Fir C", 
    position: [1.75, 0, -3.4], 
    rotation: 2.1, 
    scale: [0.5, 0.5, 0.5] 

  }
];
gltfLoader.load("assets/models/fir_sapling_medium_1k/fir_sapling_medium_1k.gltf", (gltf) => {
  firPlacements.forEach((settings) => {
    const parts = [`NurbsPath${settings.id}`, `NurbsPath${settings.id}_2`]
      .map((name) => gltf.scene.getObjectByName(name)).filter(Boolean);
    if (parts.length !== 2) {
      console.warn(`Missing parts for ${settings.name}`);
      return;
    }
    const tree = new THREE.Group();
    tree.name = settings.name;
    const offset = parts[0].position.clone();
    parts.forEach((part) => {
      const copy = part.clone();
      copy.position.sub(offset);
      tree.add(copy);
    });
    tree.position.set(...settings.position);
    tree.rotation.y = settings.rotation;
    tree.scale.set(...settings.scale);
    scene.add(tree);
  });
  console.log("Three individually positioned fir trees loaded");
}, undefined, (error) => console.error("Fir tree loading error:", error));

// LEAFY GRASS — independent scene object (model may contain multiple plants)
const leafyGrassPlacements = [
  { name: "Leafy Grass 1", 
    position: [0, 0.015, 0], 
    rotation: 0, 
    scale: [1.5,0.018, 1.5] 
}// under table//
];
placeModelCopies(
    "assets/models/leafy_grass_1k/leafy_grass_1k.gltf", 
    "Leafy grass", 
    leafyGrassPlacements
);
 
// GRASS MEDIUM — 17 independently adjustable patches
// Keep the first original patch plus the 16 scattered patches.

const grassPlacements = [
  { name: "Grass 01", 
    position: [-4.5, 0.04, -1.2], 
    rotation: 0.0, 
    scale: [0.38, 0.38, 0.38] 

  },
  { name: "Grass 02", 
    position: [-4.15, 0.04, -3.0], 
    rotation: 1.17, 
    scale: [0.445, 0.445, 0.445] 

  },
  { name: "Grass 03", 
    position: [-2.6, 0.04, -4.5], 
    rotation: 2.34, 
    scale: [0.51, 0.51, 0.51] 

  },
  { name: "Grass 04", 
    position: [-1.25, 0.04, -2.65], 
    rotation: 3.51, 
    scale: [0.575, 0.575, 0.575] 

  },
  { name: "Grass 05", 
    position: [1.45, 0.04, -2.55], 
    rotation: 4.68, 
    scale: [0.64, 0.64, 0.64] 

  },
  { name: "Grass 06", 
    position: [2.5, 0.04, -4.35], 
    rotation: 5.85, 
    scale: [0.38, 0.38, 0.38] 

  },
  { name: "Grass 07", 
    position: [4.4, 0.04, -1.1], 
    rotation: 0.74, 
    scale: [0.445, 0.445, 0.445] 

  },
  { name: "Grass 08", 
    position: [3.25, 0.04, 1.85], 
    rotation: 1.91, 
    scale: [0.51, 0.51, 0.51] 

  },
  { name: "Grass 09", 
    position: [4.25, 0.04, 2.5], 
    rotation: 3.08, 
    scale: [0.575, 0.575, 0.575] 

  },
  { name: "Grass 10", 
    position: [2.0, 0.04, 3.0], 
    rotation: 4.25, 
    scale: [0.64, 0.64, 0.64] 

  },
  { name: "Grass 11", 
    position: [1.0, 0.04, 4.75], 
    rotation: 5.42, 
    scale: [0.38, 0.38, 0.38] 

  },
  { name: "Grass 12", 
    position: [-1.65, 0.04, 4.6], 
    rotation: 0.3, 
    scale: [0.445, 0.445, 0.445] 

  },
  { name: "Grass 13", 
    position: [-3.25, 0.04, 3.0], 
    rotation: 1.47, 
    scale: [0.51, 0.51, 0.51] 

  },
  { name: "Grass 14", 
    position: [-4.4, 0.04, 1.65], 
    rotation: 2.64, 
    scale: [0.575, 0.575, 0.575] 

  },
  { name: "Grass 15", 
    position: [-2.5, 0.04, 0.45], 
    rotation: 3.81, 
    scale: [0.64, 0.64, 0.64] 

  },
  { name: "Grass 16", 
    position: [0.8, 0.04, 1.9], 
    rotation: 4.98, 
    scale: [0.38, 0.38, 0.38] 

  },
  { name: "Grass 17", 
    position: [-1.25, 0.04, 1.9], 
    rotation: 6.15, 
    scale: [0.445, 0.445, 0.445] 

  },
  { name: "Grass 18", 
    position: [1.1, 0.04, -1.15], 
    rotation: 1.04, 
    scale: [0.51, 0.51, 0.51] 

  },
  { name: "Grass 19", 
    position: [3.7, 0.04, -2.4], 
    rotation: 2.21, 
    scale: [0.575, 0.575, 0.575] 

  },
  { name: "Grass 20", 
    position: [-3.6, 0.04, -2.0], 
    rotation: 3.38, 
    scale: [0.64, 0.64, 0.64] 

  },
  { name: "Grass 21", 
    position: [2.75, 0.04, -0.8], 
    rotation: 4.55, 
    scale: [0.38, 0.38, 0.38] 

  },
  { name: "Grass 22", 
    position: [0.0, 0.04, -2.35], 
    rotation: 5.72, 
    scale: [0.445, 0.445, 0.445] 

  }
];


placeModelCopies(
    "assets/models/grass_medium_02_1k/grass_medium_02_1k.gltf", 
    "Grass", 
    grassPlacements
);
 
// FOREST LEAVES 03 — individual placement
const forestLeaves03Placements = []; // Removed isolated light ground-cover patch; picnic-table grass remains.
placeModelCopies(
    "assets/models/forest_leaves_03_1k/forest_leaves_03_1k.gltf", 
    "Forest leaves 03", 
    forestLeaves03Placements
);

// BROWN MUD — only the four signpost patches (unused test patch stays removed)
const mudPlacements = [
  { name: "Mud - Design Studio", 
    position: [1.8, 0.05, -2.8], 
    rotation: 0, 
    scale: [0.48, 0.012, 0.3] 
},
  { name: "Mud - Technology Lab", 
    position: [-2.2, 0.05, 2.8], 
    rotation: 0.6, 
    scale: [0.48, 0.012, 0.3] 
},
  { name: "Mud - Art Gallery", 
    position: [4, 0.05, 1.5], 
    rotation: 1.2, 
    scale: [0.48, 0.012, 0.3] 
},
  { name: "Mud - Dé Vine Events", 
    position: [-2.8, 0.05, -1.8], 
    rotation: 1.8, 
    scale: [0.48, 0.012, 0.3] 
}
];
placeModelCopies(
    "assets/models/brown_mud_leaves_01_1k/brown_mud_leaves_01_1k.gltf", 
    "Brown mud", 
    mudPlacements
);
 
// FOREST LEAVES 02 — individual placement
const forestLeaves02Placements = [
  { name: "Forest Leaves 02 - 1", 
    position: [-3.8, 0.0, 0], 
    rotation: 0, 
    scale: [1, 0.35, 1] 
}// under devine//
];
placeModelCopies(
    "assets/models/forest_leaves_02_1k/forest_leaves_02_1k.gltf", 
    "Forest leaves 02", 
    forestLeaves02Placements
);

// SHRUBS — eight individually adjustable shrubs
const shrubPlacements = [
  { name: "Shrub 1", 
    position: [-3.8, 0, -2.05], 
    rotation: 0.0, 
    scale: [0.77, 0.77, 0.77] 
  },
  { name: "Shrub 2", 
    position: [-3.85, 0, 2.7], 
    rotation: 0.61, 
    scale: [0.66, 0.66, 0.66] 
  },
  { name: "Shrub 3", 
    position: [2.6, 0, -3.95], 
    rotation: 1.22, 
    scale: [0.68, 0.68, 0.68] 
  },
  { name: "Shrub 4", 
    position: [-2.6, 0, -3.8], 
    rotation: 1.83, 
    scale: [0.63, 0.63, 0.63] 
  },
  { name: "Shrub 5", 
    position: [2.8, 0, 2.75], 
    rotation: 2.44, 
    scale: [0.71, 0.71, 0.71] 
  },
  { name: "Shrub 6", 
    position: [3.8, 0, 1.75], 
    rotation: 3.05, 
    scale: [0.60, 0.60, 0.60] 
  },
  { name: "Shrub 7", 
    position: [-2.65, 0, 3.65], 
    rotation: 3.66, 
    scale: [0.71, 0.71, 0.71] 
  },
  { name: "Shrub 8", 
    position: [3.45, 0, -2.25], 
    rotation: 4.27, 
    scale: [0.66, 0.66, 0.66] 
  },
  { name: "Shrub 9", 
    position: [-1.6, 0, -3.65], 
    rotation: 4.88, 
    scale: [0.57, 0.57, 0.57] 
  },
  { name: "Shrub 10", 
    position: [1.5, 0, 3.4], 
    rotation: 5.49, 
    scale: [0.63, 0.63, 0.63] 
  },
  { name: "Shrub 11", 
    position: [3.75, 0, -1.45], 
    rotation: 6.1, 
    scale: [0.95, 0.95, 0.95] 
  },
  { name: "Shrub 12", 
    position: [-3.75, 0, 1.35], 
    rotation: 0.43, 
    scale: [0.60, 0.60, 0.60] 
  }
];
placeModelCopies("assets/models/shrub_04_1k/shrub_04_1k.gltf", 
    "Shrubs", 
    shrubPlacements
);

 
// =====================================
// VINE WORLD — WOODLAND PLANTING USING REAL GLTF MODELS
// All positions, rotations and scales can be adjusted independently.
// Plant on the dry inner bank; keep the water, signs, entrances and plaza clear.
// =====================================
const bankGrassPlacements = [];
const bankShrubPlacements = [];
for (let i = 0; i < 42; i++) {
  const angle = (i + 0.25) * Math.PI * 2 / 42;
  const r = shoreRadius(angle, 1.70 + 0.20 * (i % 3));
  const x = r * Math.cos(angle), z = r * Math.sin(angle);
  // Reserve approaches to the pavilion and gallery.
  if ((x < -2.8 && Math.abs(z) < 1.25) ||
      (x > 2.9 && Math.abs(z) < 1.1)) continue;
  const size = 0.22 + 0.045 * (i % 4);
  bankGrassPlacements.push({
    name: `Riverbank Grass ${i + 1}`, 
    position: [x, 0.025, z],
    rotation: angle + 0.35, 
    scale: [size, size, size]
  }); 
  }
// Small clusters around the woodland, away from the central picnic table.
const woodlandShrubLocations = [
  [-3.15,-2.35],
  [-3.7,2.35],
  [-1.6,3.45],
  [1.45,3.35],
  [3.2,2.65],
  [3.65,-2.3],
  [1.6,-3.35],
  [-1.7,-3.5]
];
woodlandShrubLocations.forEach(([x,z],i) => {
  bankShrubPlacements.push({
    name: `Woodland Shrub ${i + 1}`, 
    position: [x,0,z],
    rotation: i * 0.79, 
    scale: [0.52 + (i%3)*0.09,0.52 + (i%3)*0.09,0.52 + (i%3)*0.09]
  });
});
placeModelCopies('assets/models/grass_medium_02_1k/grass_medium_02_1k.gltf',
  'Riverbank grasses', 
  bankGrassPlacements
);
placeModelCopies('assets/models/shrub_04_1k/shrub_04_1k.gltf',
  'Woodland shrubs', 
  bankShrubPlacements
);


// =====================================
// VINE WORLD — ADDITIONAL DOWNLOADED BOTANICAL MODELS
// Real GLTF plants, each with independent position / rotation / scale.
// Grounding uses the loaded model's bounding box so pots and shrubs sit on the island.
// =====================================
function placeGroundedPlants(path, label, placements) {
  gltfLoader.load(path, (gltf) => {
    // Work from the complete asset, retaining its materials and textures.
    const prototype = gltf.scene;
    prototype.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(prototype);
    if (bounds.isEmpty()) {
      console.warn(`No geometry found for ${label}`);
      return;
    }
    const center = bounds.getCenter(new THREE.Vector3());
    placements.forEach(({ name, position, rotation = 0, scale = [1, 1, 1] }) => {
      const plant = new THREE.Group();
      plant.name = name;
      const model = prototype.clone(true);
      // Center horizontally; place the model's lowest point on ground level.
      model.position.x -= center.x;
      model.position.y -= bounds.min.y;
      model.position.z -= center.z;
      plant.add(model);
      plant.position.set(...position);
      plant.rotation.y = rotation;
      plant.scale.set(...scale);
      scene.add(plant);
    });
    console.log(`${label}: ${placements.length} grounded plants loaded`);
  }, undefined, (error) => console.error(`Error loading ${label}:`, error));
}

// Woodland shrub 03 — clustered in open pockets, not in the water.
const shrub03Placements = [
  {name:'Woodland Shrub 03 A',
    position:[-3.15,0.01,-3.15],
    rotation:0.2,
    scale:[0.27,0.27,0.27]
  },
  {name:'Woodland Shrub 03 B',
    position:[-3.8,0.01,2.05],
    rotation:1.3,
    scale:[0.23,0.23,0.23]
  },
  {name:'Woodland Shrub 03 C',
    position:[2.8,0.01,-3.5],
    rotation:2.2,
    scale:[0.28,0.28,0.28]
  },
  {name:'Woodland Shrub 03 D',
    position:[3.55,0.01,2.65],
    rotation:0.8,
    scale:[0.25,0.25,0.25]
  },
  {name:'Woodland Shrub 03 E',
    position:[-1.65,0.01,3.55],
    rotation:1.7,
    scale:[0.22,0.22,0.22]
  },
  {name:'Woodland Shrub 03 F',
    position:[1.85,0.01,3.35],
    rotation:2.8,
    scale:[0.24,0.24,0.24]
  }
];
placeGroundedPlants('assets/models/shrub_03_1k/shrub_03_1k.gltf', 
  'Shrub 03', 
  shrub03Placements
);

// Low wild plants on dry inner-bank ground and in small woodland patches.
const weedPlantPlacements = [
  [-4.25,-2.15],
  [-4.15,1.7],
  [-3.4,3.2],
  [-2.4,4.0],
  [-1.25,4.35],
  [1.15,4.25],
  [2.35,3.8],
  [3.65,2.35],
  [4.2,1.25],
  [4.15,-1.7],
  [3.3,-3.25],
  [2.15,-4.0],
  [1.15,-4.35],
  [-1.2,-4.25],
  [-2.25,-3.8],
  [-3.55,-3.0]
].map(([x,z],i) => {
  const size = 0.14 + (i % 4)*0.022;
  return {
  name:`Woodland Weed Plant ${i+1}`,
  position:[x,0.015,z],
  rotation:i*0.91,
  scale:[size,size,size]
};
}
);
placeGroundedPlants(
  'assets/models/weed_plant_02_1k/weed_plant_02_1k.gltf', 
  'Weed plant 02', 
  weedPlantPlacements
);

// EXTRA WOODLAND FILLERS — small, individually movable copies of existing models.
// Keep the central picnic area and pavilion hill clear.
const extraShrubFillers = [
  {name:'Extra Shrub A',
    position:[-2.8,0.01,1.55],
    rotation:0.4,
    scale:[0.319,0.319,0.319]

  },
  {name:'Extra Shrub B',
    position:[-1.65,0.01,2.15],
    rotation:1.8,
    scale:[0.362,0.362,0.362]

  },
  {name:'Extra Shrub C',
    position:[1.9,0.01,2.1],
    rotation:2.5,
    scale:[0.334,0.334,0.334]

  },
  {name:'Extra Shrub D',
    position:[2.65,0.01,0.55],
    rotation:0.9,
    scale:[0.348,0.348,0.348]

  },
  {name:'Extra Shrub E',
    position:[-1.55,0.01,-1.85],
    rotation:2.1,
    scale:[0.304,0.304,0.304]

  },
  {name:'Extra Shrub F',
    position:[1.75,0.01,-1.9],
    rotation:1.2,
    scale:[0.319,0.319,0.319]

  },
  {name:'Extra Shrub G',
    position:[-2.55,0.01,-0.55],
    rotation:3.0,
    scale:[0.29,0.29,0.29]

  },
  {name:'Extra Shrub H',
    position:[2.5,0.01,-1.25],
    rotation:2.7,
    scale:[0.319,0.319,0.319]

  }
];
placeGroundedPlants(
  'assets/models/shrub_03_1k/shrub_03_1k.gltf',
  'Extra woodland shrubs',
  extraShrubFillers

);

const extraWildflowerFillers = [
  [-2.25,1.7],
  [-1.7,2.65],
  [-0.65,2.8],
  [0.65,2.7],
  [1.8,1.5],
  [2.9,1.25],
  [2.25,-0.35],
  [1.6,-2.25],
  [0.4,-2.4],
  [-1.65,-2.25],
  [-2.8,-1.35],
  [-2.7,0.75]
]
.map(([x,z],i)=>{
  const size=0.23+(i%3)*0.04;
  return {name:`Extra Wild Plant ${i+1}`,
  position:[x,0.015,z],
  rotation:i*0.73,
  scale:[size,size,size]
};
}
);
placeGroundedPlants('assets/models/weed_plant_02_1k/weed_plant_02_1k.gltf',
  'Extra woodland wild plants',
  extraWildflowerFillers
);

const extraGrassFillers = [
  [-2.15,2.15],
  [-0.9,3.15],
  [0.9,3.0],
  [2.25,2.25],
  [2.7,-0.5],
  [1.65,-2.9],
  [0.15,-2.75],
  [-1.8,-2.85],
  [-2.95,-0.6],
  [-2.7,1.1]
].map(([x,z],i)=>{
  const size=0.43+(i%4)*0.065;
  return {name:`Extra Grass ${i+1}`,
  position:[x,0.04,z],
  rotation:i*0.83,
  scale:[size,size,size]
};
}
);
placeModelCopies(
  'assets/models/grass_medium_02_1k/grass_medium_02_1k.gltf',
  'Extra grass',
  extraGrassFillers
);

// Thin fallen-leaf patches in open woodland, not additional raised hills.
const extraLeafFillers = [
  // Dark-brown leaf litter under existing trees, NOT the pale grassy cover.
  {name:'Extra Leaf Litter A - Pine A and nearby tree',
    position:[-2.9,0.018,-3.0],
    rotation:0.3,
    scale:[0.43,0.012,0.43]
  }, //devine//
  
  {name:'Extra Leaf Litter B - Pine B',
    position:[2.95,0.018,-2.85],
    rotation:1.2,
    scale:[1,0.012,1.5]
  }, //design//
  
  {name:'Extra Leaf Litter C - Pine C',
    position:[3.0,0.018,2.8],
    rotation:2.1,
    scale:[0.8,0.012,0.8]
  }, //art//
  
  {name:'Extra Leaf Litter D - Fir A',
    position:[-3.35,0.018,2.45],
    rotation:0.8,
    scale:[1,0.012,1]
  } //tech//
];
placeModelCopies(
  'assets/models/forest_leaves_03_1k/forest_leaves_03_1k.gltf',
  'Extra fallen leaves',
  extraLeafFillers
);

// Decorative pots near buildings and the Dé Vine pavilion, away from doorways.
const potted01Placements = [
  {name:'Studio Planter Left',
    position:[-0.95,0.02,-3.1],
    rotation:0.2,
    scale:[1,1,1]
  },
  {name:'Studio Planter Right',
    position:[0.95,0.02,-3.1],
    rotation:1.0,
    scale:[1,1,1]
  },
  {name:'Technology Planter Left',
    position:[-1.0,0.02,3.1],
    rotation:0.4,
    scale:[1,1,1]
  },
  {name:'Technology Planter Right',
    position:[1.0,0.02,3.1],
    rotation:1.5,
    scale:[1,1,1]
  },
  {name:'Pavilion Garden Planter West',
    position:[-2.4,0.02,-1.45],
    rotation:0.6,
    scale:[0.85,0.85,0.85]
  },
  {name:'Technology Side Planter',
    position:[-1.25,0.02,3.65],
    rotation:1.1,
    scale:[0.72,0.72,0.72]
  }
];
placeGroundedPlants('assets/models/potted_plant_01_1k/potted_plant_01_1k.gltf', 
  'Potted plant 01', 
  potted01Placements
);

const potted02Placements = [
  {name:'Gallery Planter North',
    position:[3.55,0.02,-0.95],
    rotation:0.7,
    scale:[0.75,0.75,0.75]
  },
  {name:'Gallery Planter South',
    position:[3.55,0.02,0.95],
    rotation:2.0,
    scale:[0.75,0.75,0.75]
  },
  {name:'Gallery Side Planter',
    position:[3.65,0.02,1.65],
    rotation:0.4,
    scale:[0.68,0.68,0.68]
  },
  {name:'Pavilion Garden Planter East',
    position:[-2.4,0.02,1.55],
    rotation:1.7,
    scale:[0.82,0.82,0.82]
  },
  {name:'Studio Side Planter',
    osition:[-1.55,0.02,-3.5],
    rotation:2.3,
    scale:[0.65,0.65,0.65]
  },

];
placeGroundedPlants(
  'assets/models/potted_plant_02_1k/potted_plant_02_1k.gltf', 
  'Potted plant 02', 
  potted02Placements
);

// A small pair of empty clay pots near the barrels for a rustic garden detail.
const clayPotPlacements = [
  {name:'Clay Garden Pot A',
    position:[2.9,0.02,3.7],
    rotation:0.35,
    scale:[0.17,0.17,0.17]

  },
  {name:'Clay Garden Pot B',
    position:[3.3,0.02,3.45],
    rotation:1.3,
    scale:[0.13,0.13,0.13]

  }
];
placeGroundedPlants(
  'assets/models/planter_pot_clay_1k/planter_pot_clay_1k.gltf', 
  'Clay pots', 
  clayPotPlacements
);

// =====================================
// VINE WORLD — MOVABLE FURNITURE AND LIGHTS
// Initial test locations; adjust each position and scale after viewing.
// =====================================
const picnicTablePlacements = [
  { name: "Picnic Table 1", 
    position: [0, 0, 0], 
    rotation: Math.PI / 4, 
    scale: [0.75, 0.75, 0.75] 
}
];
placeModelCopies(
    "assets/models/wooden_picnic_table_1k/wooden_picnic_table_1k.gltf", 
    "Picnic table", 
    picnicTablePlacements
);
 
// =====================================
// VINE WORLD — INDIVIDUAL BARRELS
// AND GROUPED WOODEN PIECES
// =====================================

const barrelPlacements = [
  {
    id: "barrel01",
    name: "Barrel 1",
    position: [2, 0.02, 4.5],
    rotation: 1,
    scale: [0.6, 0.6, 0.6]
  },
  {
    id: "barrel02",
    name: "Barrel 2",
    position: [1.8, 0.02, 4],
    rotation: 3,
    scale: [0.6, 0.6, 0.6]
  }
];

const woodenPiecesPlacement = {
  name: "Wooden Pieces Group",
  position: [3, 0, 3.5],
  rotation: 3,
  scale: [0.6, 0.6, 0.6]
};

gltfLoader.load(
  "assets/models/wooden_barrels_01_1k/wooden_barrels_01_1k.gltf",
  (gltf) => {

    // Create two independently movable barrels
    barrelPlacements.forEach((settings) => {
      const original = gltf.scene.getObjectByName(
        `wooden_barrels_01_${settings.id}`
      );

      if (!original) {
        console.warn(`${settings.name} not found`);
        return;
      }

      const barrel = original.clone();

      // Center the original geometry around its own origin
      barrel.position.set(0, 0, 0);
      barrel.updateMatrix();

      const bounds = new THREE.Box3().setFromObject(barrel);
      const center = bounds.getCenter(new THREE.Vector3());

      barrel.geometry = barrel.geometry.clone();
      barrel.geometry.translate(-center.x, -bounds.min.y, -center.z);

      barrel.position.set(...settings.position);
      barrel.rotation.y = settings.rotation;
      barrel.scale.set(...settings.scale);
      barrel.name = settings.name;

      scene.add(barrel);
    });

    // Group all 18 wooden pieces
    const woodenPieces = new THREE.Group();
    woodenPieces.name = woodenPiecesPlacement.name;

    for (let i = 1; i <= 18; i++) {
      const id = `piece${String(i).padStart(2, "0")}`;

      const original = gltf.scene.getObjectByName(
        `wooden_barrels_01_${id}`
      );

      if (original) {
        woodenPieces.add(original.clone());
      }
    }

    woodenPieces.position.set(...woodenPiecesPlacement.position);
    woodenPieces.rotation.y = woodenPiecesPlacement.rotation;
    woodenPieces.scale.set(...woodenPiecesPlacement.scale);

    scene.add(woodenPieces);

    console.log("Two barrels and grouped wooden pieces loaded");
  },
  undefined,
  (error) => console.error("Error loading barrel models:", error)
);

 
 
const streetLampPlacements = [
  { name: "Streetlamp 1", 
    position: [-2, 0, 1.3], 
    rotation: 0, 
    scale: [1, 1, 1] 
}
];
placeModelCopies(
    "assets/models/street_lamp_01_1k/street_lamp_01_1k.gltf", 
    "Streetlamp", 
    streetLampPlacements
);
 
  // Camera
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
 
  camera.position.set(8, 9, 12);
  camera.lookAt(0, 0, 0);
 
  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  }
);
 
  renderer.setSize(
    container.clientWidth,
    container.clientHeight
  );
 
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );
 
  container.appendChild(renderer.domElement);
 
  // =====================================
  // VINE WORLD — CAMERA CONTROLS
  // =====================================
 
  const controls = new OrbitControls(
    camera,
    renderer.domElement
  );
 
  controls.target.set(0, 0, 0);
 
  // Smooth camera movement
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
 
  // Allow rotation and zoom
  controls.enableRotate = true;
  controls.enableZoom = true;
 
  // Keep visitors from moving the island off-center
  controls.enablePan = false;
 
  // Limit zoom distance
  controls.minDistance = 9;
  controls.maxDistance = 25;
 
  // Prevent the camera from going underneath the island
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = Math.PI / 2.1;
 
  controls.update();
 
  // Lighting
  const ambientLight = new THREE.AmbientLight(
    0xffffff,
    2
  );
 
  scene.add(ambientLight);
 
  const sunlight = new THREE.DirectionalLight(
    0xffe6a3,
    3
  );
 
  sunlight.position.set(8, 15, 10);
  scene.add(sunlight);
 
  // Floating island
  const islandGeometry = new THREE.CylinderGeometry(
    7,
    5,
    1.5,
    8
  );
 
// VINE World — Natural Woodland Ground
 
 
const islandMaterial = new THREE.MeshStandardMaterial({
  color: 0x46583b,
  roughness: 1
});
 
  const island = new THREE.Mesh(
    islandGeometry,
    islandMaterial
  );
 
  island.position.y = -0.75;
  scene.add(island);
  
 
 
  // Gold edge around the island
  const edgeGeometry = new THREE.TorusGeometry(
    6.7,
    0.06,
    8,
    8
  );
 
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0xc6a35a,
    metalness: 0.5,
    roughness: 0.4
  });
 
  const edge = new THREE.Mesh(
    edgeGeometry,
    edgeMaterial
  );
 
  edge.rotation.x = Math.PI / 2;
  edge.position.y = 0.05;
  scene.add(edge);
 
  // The shoreline and garden vegetation are placed using actual GLTF assets
  // near the beginning of this file. No geometric cone grass or ball flowers.

 
  // Trees around the island
  
 
 
  // =====================================
  // VINE WORLD — WOODLAND STONE PATHWAYS
  // =====================================
 
  const stoneColors = [
    0x9c9787,
    0xb0a996,
    0x777b70,
    0xc1b8a2,
    0x89877b
  ];
 
  const stoneMaterials = stoneColors.map(color =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: 1,
      flatShading: true
    })
  );
 
  // Irregular stones create a natural woodland clearing
  function placeStone(x, z, radius = 0.24) 
  {
    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(
        radius * 0.9,
        radius,
        0.055,
        7
      ),
      stoneMaterials[
        Math.floor(Math.random() * stoneMaterials.length)
      ]
    );
 
    stone.position.set(x, 0.045, z);
    stone.rotation.y = Math.random() * Math.PI;
    stone.scale.z = 0.7 + Math.random() * 0.4;
    scene.add(stone);
  }
 
  // Curving route made of individual stepping stones
  function createWoodlandPath(points, count = 30) {
    const curve = new THREE.CatmullRomCurve3(
      points.map(([x, z]) => new THREE.Vector3(x, 0, z))
    );
 
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const sideways = new THREE.Vector3(
        -tangent.z, 0, tangent.x
      );
 
      // Two staggered stones across the pathway
      for (const side of [0]) {
        const offset = side * 0.19 +
          (Math.random() - 0.5) * 0.09;
 
        placeStone(
          point.x + sideways.x * offset,
          point.z + sideways.z * offset,
          0.17 + Math.random() * 0.045
        );
      }
    }
  }
 
  // Central circular clearing
  const clearing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 1, 0.035, 16),
    new THREE.MeshStandardMaterial({
      color: 0x62734d,
      roughness: 1,
      flatShading: true
    })
  );
 
  //clearing.position.y = 0.025;
  scene.add(clearing);
 
  // Winding paths to the four existing destinations
 
// Four single-file paths ending at the picnic grass

// Path 1
createWoodlandPath([
  [0, -1.5],
  [-0.25, -2.0],
  [-0.25, -2.6],
  [0, -3.3]
]);

// Path 2
createWoodlandPath([
  [0, 1.5],
  [0.25, 2.0],
  [0.25, 2.6],
  [0, 3.3]
]);

// Path 3
createWoodlandPath([
  [1.5, 0],
  [2.0, -0.2],
  [2.6, -0.2],
  [3.5, 0]
]);

// Path 4
createWoodlandPath([
  [-1.5, 0],
  [-2.0, 0.2],
  [-2.6, 0.2],
  [-3.5, 0]
]);

  // Single stepping-stone border around picnic grass
const grassBorderRadius = 1.5;
const grassBorderStones = 36;

for (let i = 0; i < grassBorderStones; i++) {
  const angle = (i / grassBorderStones) * Math.PI * 2;

  const x = Math.cos(angle) * grassBorderRadius;
  const z = Math.sin(angle) * grassBorderRadius;

  placeStone(x, z, 0.14);
}
 
 
  // =====================================
  // VINE WORLD — REFINED WOODLAND BUILDINGS
  // =====================================
  const cream = new THREE.MeshStandardMaterial(
    {
      color:0xf3e9d5,
      roughness:0.92
    }
  );
  const forest = new THREE.MeshStandardMaterial(
    {
      color:0x234735,
      roughness:0.86
    }
  );
  const wood = new THREE.MeshStandardMaterial(
    {
      color:0x69462e,
      roughness:0.92
    }
  );
  const roofWood = new THREE.MeshStandardMaterial(
    {
      color:0x62402b,
      roughness:0.95,
      side:THREE.DoubleSide

    }
  );
  const roofGold = new THREE.MeshStandardMaterial(
    {
      color:0xa98240,
      metalness:0.12,
      roughness:0.72,
      side:THREE.DoubleSide

    }
  );
  const gold = new THREE.MeshStandardMaterial(
    {
      color:0xc6a35a,
      metalness:0.38,
      roughness:0.48
    }
  );
  const glass = new THREE.MeshPhysicalMaterial(
    {
      color:0x8cbec1,
      metalness:0.1,
      roughness:0.18,
      transparent:true,
      opacity:0.72,
      side:THREE.DoubleSide
    }
  );
  const darkGlass = new THREE.MeshPhysicalMaterial(
    {color:0x4e8c8e,
      metalness:0.14,
      roughness:0.2,
      transparent:true,
      opacity:0.78
    }
  );
  function piece(parent,geometry,material,x,y,z,rx=0,ry=0,rz=0){
    const mesh=new THREE.Mesh(geometry,material);
    mesh.position.set(x,y,z);
    mesh.rotation.set(rx,ry,rz);
    mesh.castShadow=true;
    mesh.receiveShadow=true;
    parent.add(mesh);
    return mesh;
  }
  function beam(parent,ax,ay,az,bx,by,bz,r,material)
  {
    const start=new THREE.Vector3(ax,ay,az),end=new THREE.Vector3(bx,by,bz);
    const m=piece
    (parent,new THREE.CylinderGeometry(r,r,start.distanceTo(end),10),
    material,...start.clone().add(end).multiplyScalar(0.5).toArray()
  );
    m.quaternion.setFromUnitVectors
    (new THREE.Vector3(0,1,0),
    end.sub(start).normalize()
  );
    return m;
  }
  function gableRoof(parent,width,depth,eaveY,rise,material){
    // Two accurately aligned sloping roof planes, with a modest eave overhang.
    const half=width/2+0.14, length=depth+0.26;
    const slope=Math.hypot(half,rise);
    const angle=Math.atan2(rise,half);
    for(const side of [-1,1]){
      const panel=piece(parent,new THREE.BoxGeometry(slope,0.055,length),material,
        side*half/2,eaveY+rise/2,0,0,0,-side*angle);
      // Narrow, flush seams: texture-like detail rather than bulky roof beams.
      for(let i=-2;i<=2;i++){
        const seam=piece(parent,new THREE.BoxGeometry(slope-0.06,0.009,0.009),wood,
          side*half/2,eaveY+rise/2+0.033,i*length/6,0,0,-side*angle);
      }
    }
    // Thin ridge cap; no protruding diagonal structural rods.
    piece(parent,new THREE.BoxGeometry(0.095,0.075,length+0.035),wood,0,eaveY+rise+0.025,0);
  }
  function gableInfill(parent,width,eaveY,rise,depth,material){
    // Triangular infill closes the front and rear ends of the gable roof.
    const shape=new THREE.Shape();
    const gableHalf = width / 2 + 0.14;    
    shape.moveTo(-gableHalf, eaveY);
    shape.lineTo(gableHalf, eaveY);
    shape.lineTo(0, eaveY + rise);
    shape.closePath();

    const geo=new THREE.ShapeGeometry(shape);
    const gableMaterial = material.clone();
    gableMaterial.side = THREE.DoubleSide;
    piece(parent,geo,gableMaterial,0,0,depth/2+0.003);
    piece(parent,geo,gableMaterial,0,0,-depth/2-0.003,0,Math.PI,0);
  }
  function framedWindow(parent,x,y,z,width=0.36,height=0.45,material=glass){
    piece(parent,new THREE.BoxGeometry(
      width+0.11,
      height+0.11,0.045
    ),
      wood,x,y,z-0.015
    );
    piece(parent,new THREE.BoxGeometry(
      width,
      height,0.055
    ),
      material,x,y,z+0.025);
    piece(parent,new THREE.BoxGeometry(
      0.026,
      height,0.068
    ),
    gold,x,y,z+0.062);
    piece(parent,new THREE.BoxGeometry(
      width,0.026,0.068),
      gold,x,y,z+0.062
    );
    piece(parent,new THREE.BoxGeometry(
      width+0.16,0.065,0.14
    ),
    wood,x,y-height/2-0.045,
    z+0.045
  );
  }
  function entry(parent,z,y=0.42){
    piece(parent,new THREE.BoxGeometry(0.47,0.82,0.065),wood,0,y,z);
    piece(parent,new THREE.BoxGeometry(0.37,0.73,0.076),gold,0,y,z+0.025);
    piece(parent,new THREE.SphereGeometry(0.027,10,8),wood,0.13,y-0.02,z+0.08);
    piece(parent,new THREE.BoxGeometry(0.72,0.065,0.35),wood,0,0.045,z+0.18);
  }
  function foundation(parent,w,d){piece(parent,new THREE.BoxGeometry(w+0.13,0.12,d+0.13),wood,0,0.065,0);}
  function trimCorners(parent,w,h,d){
    for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])piece(parent,new THREE.BoxGeometry(0.065,h,0.065),wood,x,h/2,z);
  }

  // Design Studio: cream cottage, layered timber gable, gold entry.
  const studio=new THREE.Group();
  foundation(studio,1.5,1.5);
  piece(studio,new THREE.BoxGeometry(1.5,1.28,1.5),cream,0,0.70,0);
  trimCorners(studio,1.5,1.22,1.5);
  gableRoof(studio,1.5,1.5,1.31,0.57,roofWood);
  gableInfill(studio,1.5,1.31,0.57,1.5,cream);
  
  // Wooden beam beneath the Design Studio's front gable.
  piece(studio,
    new THREE.BoxGeometry(1.58, 0.09, 0.12),
    wood,
    0, 1.31, 0.78
  );

  framedWindow(studio,-0.48,0.76,0.765,0.27,0.42);
  framedWindow(studio,0.48,0.76,0.765,0.27,0.42);
  entry(studio,0.79);
  piece(studio,new THREE.BoxGeometry(0.92,0.07,0.18),wood,0,1.22,0.79);
  studio.position.set(0,0,-4);scene.add(studio);

  // Technology Lab: woodland green lodge with warm wood and luminous glass.
  const technologyLab=new THREE.Group();
  foundation(technologyLab,1.7,1.5);
  piece(technologyLab,new THREE.BoxGeometry(1.7,1.36,1.5),forest,0,0.74,0);
  trimCorners(technologyLab,1.7,1.32,1.5);
  gableRoof(technologyLab,1.7,1.5,1.4,0.55,roofWood);
  gableInfill(technologyLab,1.7,1.4,0.55,1.5,forest);

  // Timber beam beneath the front gable to conceal the roof-wall seam.
  piece(technologyLab,
    new THREE.BoxGeometry(1.78, 0.09, 0.12),
    wood,
    0, 1.40, 0.78
  );

  framedWindow(technologyLab,-0.53,0.82,0.765,0.35,0.52,darkGlass);
  framedWindow(technologyLab,0.53,0.82,0.765,0.35,0.52,darkGlass);
  entry(technologyLab,0.79);
  // A restrained gold lintel replaces the floating vertical ornament bars.
  piece(technologyLab,new THREE.BoxGeometry(1.35,0.045,0.07),gold,0,1.34,0.79);
  technologyLab.position.set(0,0,4);technologyLab.rotation.y=Math.PI;scene.add(technologyLab);

  // Art Gallery: cream cottage with a broad warm-gold roof and framed glazing.
  const artGallery=new THREE.Group();
  foundation(artGallery,1.5,1.4);
  piece(artGallery,new THREE.BoxGeometry(1.5,1.24,1.4),cream,0,0.68,0);
  trimCorners(artGallery,1.5,1.18,1.4);
  gableRoof(artGallery,1.5,1.4,1.27,0.56,roofGold);
  gableInfill(artGallery,1.5,1.27,0.56,1.4,cream);

  // Wooden beam beneath the Art Gallery's front gable.
  piece(artGallery,
    new THREE.BoxGeometry(1.58, 0.09, 0.12),
    wood,
    0, 1.27, 0.73
  );

  framedWindow(artGallery,-0.5,0.75,0.715,0.29,0.48);
  framedWindow(artGallery,0.5,0.75,0.715,0.29,0.48);
  entry(artGallery,0.74);
  piece(artGallery,new THREE.BoxGeometry(0.26,0.28,0.05),gold,-0.51,0.75,0.79);
  artGallery.position.set(4.7,0,0);artGallery.rotation.y=-Math.PI/2;scene.add(artGallery);

  // Dé Vine Events: refined open-air garden pavilion, preserving its gold base,
  // green pointed roof, gold columns and pink flowering plants.
  const devineGarden=new THREE.Group();
  const gardenPlatform=piece(devineGarden,new THREE.CylinderGeometry(1.15,1.15,0.12,48),gold,0,0.06,0);
  piece(devineGarden,new THREE.CylinderGeometry(1.04,1.04,0.045,48),wood,0,0.135,0);
  const columnPositions=[[-0.65,-0.65],[0.65,-0.65],[-0.65,0.65],[0.65,0.65]];
  for(const [x,z] of columnPositions){
    piece(devineGarden,new THREE.CylinderGeometry(0.058,0.07,1.68,16),gold,x,1.01,z);
    piece(devineGarden,new THREE.CylinderGeometry(0.12,0.12,0.11,16),gold,x,0.22,z);
    piece(devineGarden,new THREE.CylinderGeometry(0.12,0.12,0.1,16),gold,x,1.87,z);
  }
  const gardenRoofMat=new THREE.MeshStandardMaterial({color:0x315c42,roughness:0.77,side:THREE.DoubleSide});
  piece(devineGarden,new THREE.ConeGeometry(1.3,0.78,8),gardenRoofMat,0,2.27,0,0,Math.PI/8);
  piece(devineGarden,new THREE.CylinderGeometry(0.035,0.035,0.22,12),gold,0,2.76,0);
  piece(devineGarden,new THREE.SphereGeometry(0.09,16,12),gold,0,2.91,0);
  // The garden edge is planted with GLTF shrubs, not pink sphere decorations.
  devineGarden.position.set(-3.8,0.4,0);scene.add(devineGarden);

  // =====================================
  // VINE WORLD — STREET SIGNS
  // =====================================
const streetSigns = [];
 
  function createStreetSign(label, x, z, rotation = 0) {
    const sign = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: 0x745236, roughness: 0.9 });
    const darkWood = new THREE.MeshStandardMaterial({ color: 0x4c3426, roughness: 0.95 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xc6a35a, metalness: 0.45, roughness: 0.42 });

    // Shorter, slimmer wooden post with a small gold finial.
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.83, 8), wood);
    post.position.y = 0.415;
    sign.add(post);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), gold);
    cap.position.y = 0.91;
    sign.add(cap);

    // Double-sided carved-looking plaque: wood frame, forest-green face, gold lettering.
    const signWidth = Math.max(1.15, label.length * 0.085);
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(signWidth + 0.12, 0.43, 0.10), darkWood);
    plaque.position.y = 0.89;
    sign.add(plaque);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(signWidth + 0.04, 0.35, 0.115), gold);
    trim.position.y = 0.89;
    sign.add(trim);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#173b2c';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#c6a35a';
    context.lineWidth = 13;
    context.strokeRect(12, 12, 1000, 232);
    context.fillStyle = '#f4dfaa';
    context.font = 'bold 69px Georgia, serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label, 512, 130, 945);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const faceMaterial = new THREE.MeshBasicMaterial(
      { 
        map: texture, 
        side: THREE.FrontSide 
      }
    );
    for (const side of [-1, 1]) {
      const face = new THREE.Mesh(new THREE.PlaneGeometry(signWidth, 0.31), faceMaterial);
      face.position.set(0, 0.89, side * 0.065);
      if (side < 0) face.rotation.y = Math.PI;
      sign.add(face);
    }

    sign.position.set(x, 0, z);
    // Keep the signs facing the plaza, as before.
    sign.rotation.y = Math.atan2(-x, -z);
    sign.userData.destination = label;
    scene.add(sign);
    streetSigns.push(sign);
    return sign;
  }

// Design Studio
createStreetSign("DESIGN STUDIO", 1.8, -2.8, Math.PI);
 
// Technology Lab
createStreetSign("TECHNOLOGY LAB", -2.2, 2.8, 0);
 
// Art Gallery
createStreetSign("ART GALLERY", 4.0, 1.5, -Math.PI / 2);
 
// Dé Vine Events Garden
createStreetSign("DÉ VINE EVENTS", -2.8, -1.8, Math.PI / 2);
  // =====================================
  // VINE WORLD — INTERACTIVE DESTINATIONS
  // =====================================
 
  const destinations = [
    {
      object: studio,
      name: "Design Studio",
      url: "projects.html"
    },
    {
      object: technologyLab,
      name: "Technology Lab",
      url: "projects.html"
    },
    {
      object: artGallery,
      name: "Art Gallery",
      url: "art.html"
    },
    {
      object: devineGarden,
      name: "Dé Vine Events Garden",
      url: "projects.html"
    }
  ];
 
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
 
  // =====================================
  // VINE WORLD — BUILDING CLICK DETECTION
  // =====================================
 
  let pointerStart = null;
 
    renderer.domElement.addEventListener("pointermove", (event) => {
  const bounds = renderer.domElement.getBoundingClientRect();
 
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
 
  raycaster.setFromCamera(pointer, camera);
 
  const hoverObjects = [
    ...destinations.map((destination) => destination.object),
    ...streetSigns
  ];
 
  const intersections = raycaster.intersectObjects(hoverObjects, true);
 
  renderer.domElement.style.cursor =
    intersections.length > 0 ? "pointer" : "grab";
});
 
  renderer.domElement.addEventListener("pointerdown", (event) => {
    pointerStart = {
      x: event.clientX,
      y: event.clientY
    };
  });
 
  renderer.domElement.addEventListener("pointercancel", () => {
    pointerStart = null;
  });
 
  renderer.domElement.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;
 
    const movement = Math.hypot(
      event.clientX - pointerStart.x,
      event.clientY - pointerStart.y
    );
 
    pointerStart = null;
 
    // Ignore dragging used to rotate the garden
    if (movement > 6) return;
 
    const bounds = renderer.domElement.getBoundingClientRect();
 
    pointer.x =
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
 
    pointer.y =
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
 
    raycaster.setFromCamera(pointer, camera);
 
   const clickableObjects = [
  ...destinations.map((destination) => destination.object),
  ...streetSigns
];
 
    const intersections = raycaster.intersectObjects(
      clickableObjects,
      true
    );
 
    if (intersections.length === 0) return;
 
    const selected = destinations.find((destination) => {
      let object = intersections[0].object;
 
      while (object) {
        if (object === destination.object) return true;
        object = object.parent;
      }
 
      return false;
    });
 
   
if (selected) {
  window.location.href = selected.url;
  return;
}
 
// Check whether a street sign was clicked
let clickedObject = intersections[0].object;
 
while (clickedObject) {
  if (clickedObject.userData.destination) {
    const signDestination = clickedObject.userData.destination;
 
    const signLinks = {
      "DESIGN STUDIO": "projects.html",
      "TECHNOLOGY LAB": "projects.html",
      "ART GALLERY": "art.html",
      "DÉ VINE EVENTS": "projects.html"
    };
 
    const url = signLinks[signDestination];
 
    if (url) {
      window.location.href = url;
    }
 
    return;
  }
 
  clickedObject = clickedObject.parent;
}
 
  });
 
  // Render scene
  

function animate() {
  requestAnimationFrame(animate);

  

// Flow around the island's perimeter
waterTexture.offset.x += 0.00045;


  controls.update();
  renderer.render(scene, camera);
}
 
  animate();
 
  // Responsive resizing
  window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
 
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
 
    renderer.setSize(width, height);
  });
 
}
 