'use strict';

// GAME_DATA — Edit here to change content
// =============================================================================
const GAME_DATA = {
  levels: {
    // LEVEL 1: Build a Wall (4 stages)
    wall: {
      id: 'wall', title: 'Build a Wall',
      stages: [
        {
          id: 'wall-foundation', name: 'Foundation',
          instruction: 'Choose the material to lay the foundation of the wall.',
          slotLabel: 'Foundation', correctIds: ['concrete'],
          materials: [
            { id:'concrete',   name:'Concrete',   description:'A mix of cement, sand and gravel that sets rock-hard.',      icon:'🪨' },
            { id:'sand',       name:'Sand',        description:'Fine grains that pack together but shift under load.',       icon:'🏜️' },
            { id:'wood',       name:'Wood',        description:'Strong above ground, but rots underground.',                 icon:'🪵' },
            { id:'gravel',     name:'Gravel',      description:'Crushed stone that drains water well.',                     icon:'⚪' }
          ],
          failureReasons: {
            sand:   'Sand shifts under pressure and cannot support the wall above.',
            wood:   'Wood rots when buried in damp soil — your foundation would fail!',
            gravel: 'Gravel drains water well but has no structural strength on its own.'
          }
        },
        {
          id: 'wall-bricks', name: 'Bricks',
          instruction: 'Choose the material to build up the body of the wall.',
          slotLabel: 'Bricks', correctIds: ['clay-bricks'],
          materials: [
            { id:'clay-bricks', name:'Clay Bricks', description:'Fired clay blocks — strong, weather-resistant, long-lasting.', icon:'🧱' },
            { id:'glass',       name:'Glass',        description:'Transparent and brittle — shatters easily under impact.',      icon:'🪟' },
            { id:'plastic',     name:'Plastic',      description:'Light and flexible — far too weak for a load-bearing wall.',   icon:'🧴' },
            { id:'cardboard',   name:'Cardboard',    description:'Soaks up water and collapses.',                               icon:'📦' }
          ],
          failureReasons: {
            glass:     'Glass is far too brittle — it would crack under the wall\'s weight.',
            plastic:   'Plastic bends over time and cannot carry the load of a wall.',
            cardboard: 'Cardboard absorbs water and turns to mush in the rain!'
          }
        },
        {
          id: 'wall-mortar', name: 'Mortar Joints',
          instruction: 'Choose the material to bind the bricks together.',
          slotLabel: 'Mortar Joints', correctIds: ['mortar'],
          materials: [
            { id:'mortar', name:'Mortar',      description:'A mix of cement, sand and water that locks bricks in place.', icon:'🪣' },
            { id:'mud',    name:'Mud',         description:'Sticky when wet, but crumbles when it dries out.',            icon:'🟤' },
            { id:'glue',   name:'Craft Glue',  description:'Great for paper — far too weak for heavy masonry.',           icon:'🫙' },
            { id:'water',  name:'Water',       description:'Needed to mix mortar, but water alone holds nothing.',        icon:'💧' }
          ],
          failureReasons: {
            mud:   'Mud dries and cracks — your bricks would slowly slide apart.',
            glue:  'Craft glue is not strong enough to hold heavy bricks.',
            water: 'Water does not bond materials — it just washes the bricks clean!'
          }
        },
        {
          id: 'wall-capstone', name: 'Cap Stone',
          instruction: 'Choose the material to cap and protect the top of the wall.',
          slotLabel: 'Cap Stone', correctIds: ['coping-stones'],
          materials: [
            { id:'coping-stones', name:'Coping Stones', description:'Dense stone caps that shed rainwater and protect the wall top.', icon:'🗿' },
            { id:'cap-sand',      name:'Sand',           description:'Loose granules — rain would wash them straight off the top.',   icon:'🏜️' },
            { id:'foam',          name:'Foam',           description:'Soaks up water and crumbles outdoors.',                         icon:'🧽' },
            { id:'carpet',        name:'Carpet',         description:'Traps moisture and rots the wall beneath.',                     icon:'🟫' }
          ],
          failureReasons: {
            'cap-sand': 'Sand would be washed away by the first rainstorm.',
            foam:       'Foam absorbs water and breaks down in sunlight.',
            carpet:     'Carpet soaks up rain and causes damp and decay.'
          }
        }
      ]
    },

    // LEVEL 2: Build a Bridge (5 stages)
    bridge: {
      id: 'bridge', title: 'Build a Bridge',
      stages: [
        {
          id: 'bridge-foundation', name: 'Foundation',
          instruction: 'Choose the material to anchor the bridge to the ground.',
          slotLabel: 'Foundation', correctIds: ['reinforced-concrete'],
          materials: [
            { id:'reinforced-concrete', name:'Reinforced Concrete', description:'Concrete strengthened with steel bars — the strongest foundation material.', icon:'🏗️' },
            { id:'bridge-sand',         name:'Sand',                description:'Fine and loose — shifts under the enormous weight of a bridge.',           icon:'🏜️' },
            { id:'bridge-wood',         name:'Wood',                description:'Rots underground and cannot carry bridge loads.',                           icon:'🪵' },
            { id:'bridge-plastic',      name:'Plastic',             description:'Not nearly strong enough for a bridge foundation.',                         icon:'🧴' }
          ],
          failureReasons: {
            'bridge-sand':    'Sand shifts and settles unevenly — the bridge would tilt and sink.',
            'bridge-wood':    'Wood rots underground and cannot carry the huge loads of a bridge.',
            'bridge-plastic': 'Plastic deforms under heavy load — the bridge would collapse.'
          }
        },
        {
          id: 'bridge-piers', name: 'Piers',
          instruction: 'Choose the material to build the vertical supports (piers) of the bridge.',
          slotLabel: 'Piers', correctIds: ['steel-reinforced-concrete-piers'],
          materials: [
            { id:'steel-reinforced-concrete-piers', name:'Steel-Reinforced Concrete', description:'Concrete columns with steel inside — handles enormous loads.', icon:'🏛️' },
            { id:'sandbags',      name:'Sandbags',      description:'Too unstable for permanent structures.',                                    icon:'⚫' },
            { id:'pier-wood',     name:'Wooden Posts',  description:'Too weak and rot-prone for a road bridge.',                                icon:'🪵' },
            { id:'hollow-bricks', name:'Hollow Bricks', description:'The hollow core makes them too fragile for piers.',                        icon:'⬜' }
          ],
          failureReasons: {
            sandbags:        'Sandbags are temporary — they would wash away under bridge loads.',
            'pier-wood':     'Wooden posts rot and split over time and cannot carry bridge loads.',
            'hollow-bricks': 'Hollow bricks crush easily under heavy vertical loads.'
          }
        },
        {
          id: 'bridge-deck', name: 'Deck',
          instruction: 'Choose the material for the bridge deck — the surface vehicles drive on.',
          slotLabel: 'Deck', correctIds: ['prestressed-concrete'],
          materials: [
            { id:'prestressed-concrete', name:'Pre-stressed Concrete Slabs', description:'Concrete panels with tensioned steel — span wide gaps without sagging.', icon:'🛣️' },
            { id:'deck-glass',   name:'Glass',            description:'Brittle — would shatter the moment a vehicle drove over it.', icon:'🪟' },
            { id:'thin-wood',    name:'Thin Wood Planks', description:'Too flexible and prone to rot.',                              icon:'🪵' },
            { id:'plastic-sheet',name:'Plastic Sheets',   description:'Would buckle and split under a single car.',                  icon:'🧴' }
          ],
          failureReasons: {
            'deck-glass':    'Glass shatters under vehicle impact.',
            'thin-wood':     'Thin planks flex too much and rot outdoors.',
            'plastic-sheet': 'Plastic sheets buckle under load and become slippery when wet.'
          }
        },
        {
          id: 'bridge-reinforcement', name: 'Reinforcement',
          instruction: 'Choose the internal reinforcement to strengthen the concrete structure.',
          slotLabel: 'Reinforcement', correctIds: ['steel-rebar'],
          materials: [
            { id:'steel-rebar',    name:'Steel Rebar',    description:'Ribbed steel bars embedded in concrete — handle tension perfectly.', icon:'⚙️' },
            { id:'bamboo',         name:'Bamboo',         description:'Strong for its weight, but rots inside concrete when wet.',           icon:'🎋' },
            { id:'rubber',         name:'Rubber',         description:'Too flexible — would let the structure deform dangerously.',           icon:'⚫' },
            { id:'aluminium-foil', name:'Aluminium Foil', description:'Paper-thin and easily torn — almost no structural strength.',         icon:'🥈' }
          ],
          failureReasons: {
            bamboo:          'Bamboo absorbs water inside concrete, swells, and eventually rots.',
            rubber:          'Rubber is too flexible and allows dangerous sagging.',
            'aluminium-foil':'Aluminium foil tears instantly under stress.'
          }
        },
        {
          id: 'bridge-railing', name: 'Railing',
          instruction: 'Choose the material for the bridge railing to keep people safe.',
          slotLabel: 'Railing', correctIds: ['steel-railing'],
          materials: [
            { id:'steel-railing',      name:'Steel',         description:'Strong, durable and weather-resistant — the standard for bridge railings.', icon:'⛓️' },
            { id:'cardboard-railing',  name:'Cardboard',     description:'Collapses when wet and offers no protection.',                             icon:'📦' },
            { id:'rope',               name:'Rope',          description:'Sags and stretches — cannot stop someone from falling.',                   icon:'🪢' },
            { id:'tissue-paper',       name:'Tissue Paper',  description:'Disintegrates in rain and has no strength whatsoever.',                   icon:'🧻' }
          ],
          failureReasons: {
            'cardboard-railing': 'Cardboard dissolves in rain — the railing would disappear at the first shower!',
            rope:                'Rope stretches and sags — someone leaning on it could easily fall through.',
            'tissue-paper':      'Tissue paper disintegrates immediately in the weather.'
          }
        }
      ]
    },

    // LEVEL 3: Build a Dam (5 stages)
    dam: {
      id: 'dam', title: 'Build a Dam',
      stages: [
        {
          id: 'dam-base', name: 'Base',
          instruction: 'Choose the material for the dam\'s base — it must resist huge water pressure.',
          slotLabel: 'Base', correctIds: ['mass-concrete'],
          materials: [
            { id:'mass-concrete', name:'Mass Concrete', description:'Thick heavy concrete that resists water pressure through sheer weight.', icon:'🧱' },
            { id:'gravel-base',   name:'Gravel',        description:'Loose stones — water seeps right through and washes it away.',          icon:'⚪' },
            { id:'sand-base',     name:'Sand',          description:'Fine and loose — swept away under a reservoir\'s pressure.',            icon:'🏜️' },
            { id:'clay-base',     name:'Clay',          description:'Used inside earth dams, but cracks and leaks under pressure alone.',   icon:'🟤' }
          ],
          failureReasons: {
            'gravel-base': 'Gravel is too loose — water would flow through and erode the base completely.',
            'sand-base':   'Sand is unstable under pressure — the dam base would liquefy.',
            'clay-base':   'Clay alone is too soft and cracks when dried.'
          }
        },
        {
          id: 'dam-core', name: 'Core Wall',
          instruction: 'Choose the material for the inner core wall that blocks water flow.',
          slotLabel: 'Core Wall', correctIds: ['compacted-clay'],
          materials: [
            { id:'compacted-clay', name:'Compacted Clay', description:'Tightly packed clay is nearly impermeable — perfect for blocking seepage.', icon:'🟫' },
            { id:'core-sand',      name:'Sand',           description:'Highly permeable — water passes straight through.',                       icon:'🏜️' },
            { id:'core-gravel',    name:'Gravel',         description:'Coarse and porous — water drains through rather than being blocked.',     icon:'⚪' },
            { id:'core-wood',      name:'Wood Planks',    description:'Rots and eventually collapses when submerged.',                           icon:'🪵' }
          ],
          failureReasons: {
            'core-sand':   'Sand is far too porous — water seeps straight through.',
            'core-gravel': 'Gravel lets water pass freely — it cannot act as a watertight core.',
            'core-wood':   'Submerged wood rots and opens leaks in the dam.'
          }
        },
        {
          id: 'dam-waterproof', name: 'Waterproofing',
          instruction: 'Choose the material to waterproof the upstream face of the dam.',
          slotLabel: 'Waterproofing', correctIds: ['bituminous-membrane'],
          materials: [
            { id:'bituminous-membrane', name:'Bituminous Membrane', description:'A flexible asphalt sheet forming a watertight barrier.', icon:'🛡️' },
            { id:'paint-coat',          name:'Paint',               description:'Flakes off under prolonged water pressure.',             icon:'🪣' },
            { id:'plastic-film',        name:'Thin Plastic Film',   description:'Tears easily — water pressure would puncture it.',       icon:'🧴' },
            { id:'cardboard-wp',        name:'Cardboard',           description:'Disintegrates in water — the dam would leak within hours.', icon:'📦' }
          ],
          failureReasons: {
            'paint-coat':   'Paint peels off in water and offers almost no waterproofing.',
            'plastic-film': 'Thin plastic film tears under water pressure.',
            'cardboard-wp': 'Cardboard dissolves in water — it would fail instantly.'
          }
        },
        {
          id: 'dam-spillway', name: 'Spillway',
          instruction: 'Choose the material for the spillway — the channel that safely releases excess water.',
          slotLabel: 'Spillway', correctIds: ['reinforced-concrete-spillway'],
          materials: [
            { id:'reinforced-concrete-spillway', name:'Reinforced Concrete', description:'Strong and erosion-resistant — handles high-speed water flow.', icon:'🏗️' },
            { id:'earth-spillway',  name:'Bare Earth',  description:'Flowing water erodes bare earth rapidly.',                icon:'🌍' },
            { id:'timber-spillway', name:'Timber',      description:'Wood is eroded by fast-moving water.',                    icon:'🪵' },
            { id:'sand-spillway',   name:'Sand Bags',   description:'Shift and wash away when high-volume water flows over.', icon:'⚫' }
          ],
          failureReasons: {
            'earth-spillway':  'Water erodes bare earth very quickly — the spillway would fail.',
            'timber-spillway': 'Timber is scoured away by fast-flowing water.',
            'sand-spillway':   'Sandbags wash away immediately under spillway flows.'
          }
        },
        {
          id: 'dam-facing', name: 'Facing',
          instruction: 'Choose the material for the downstream slope facing — protection from weathering.',
          slotLabel: 'Facing', correctIds: ['riprap'],
          materials: [
            { id:'riprap',        name:'Riprap (Rock Armour)', description:'Large interlocking rocks that absorb wave energy.', icon:'🪨' },
            { id:'grass-facing',  name:'Grass',                description:'Good for gentle slopes, but waves erode it.',      icon:'🌿' },
            { id:'sand-facing',   name:'Sand',                 description:'Washes away at first rainfall.',                   icon:'🏜️' },
            { id:'foam-facing',   name:'Foam Blocks',          description:'Floats away and degrades in sunlight.',            icon:'🧽' }
          ],
          failureReasons: {
            'grass-facing': 'Grass roots are too shallow — waves and runoff erode grass-covered slopes.',
            'sand-facing':  'Sand washes away instantly in rain or wave splash.',
            'foam-facing':  'Foam blocks float off and break down outdoors.'
          }
        }
      ]
    },

    // LEVEL 4: Build a Skyscraper (5 stages)
    skyscraper: {
      id: 'skyscraper', title: 'Build a Skyscraper',
      stages: [
        {
          id: 'sky-foundation', name: 'Deep Foundation',
          instruction: 'Choose the deep foundation type to support the skyscraper\'s enormous weight.',
          slotLabel: 'Deep Foundation', correctIds: ['concrete-piles'],
          materials: [
            { id:'concrete-piles', name:'Concrete Piles',  description:'Long concrete columns driven deep into bedrock.',              icon:'🏗️' },
            { id:'shallow-slab',   name:'Shallow Slab',    description:'Too shallow for a skyscraper\'s loads.',                      icon:'⬜' },
            { id:'timber-piles',   name:'Timber Piles',    description:'Rot and crush under tall-building loads.',                    icon:'🪵' },
            { id:'sand-fill',      name:'Sand Fill',       description:'Loose and compressible — the building would sink unevenly.', icon:'🏜️' }
          ],
          failureReasons: {
            'shallow-slab': 'A shallow slab would sink under a skyscraper\'s weight.',
            'timber-piles': 'Timber piles rot underground and cannot carry skyscraper loads.',
            'sand-fill':    'Sand compresses under load — the building would tilt.'
          }
        },
        {
          id: 'sky-core', name: 'Core Frame',
          instruction: 'Choose the material for the structural core that carries all vertical and wind loads.',
          slotLabel: 'Core Frame', correctIds: ['structural-steel'],
          materials: [
            { id:'structural-steel', name:'Structural Steel', description:'High-strength steel I-beams — incredibly strong and fast to erect.', icon:'⚙️' },
            { id:'hollow-block',     name:'Hollow Blocks',    description:'Too fragile under tall-building loads.',                              icon:'⬜' },
            { id:'bamboo-core',      name:'Bamboo',           description:'Too inconsistent in strength for a core frame.',                      icon:'🎋' },
            { id:'plastic-core',     name:'Plastic Tubes',    description:'Creeps and buckles under sustained heavy load.',                      icon:'🧴' }
          ],
          failureReasons: {
            'hollow-block': 'Hollow blocks crush under the enormous loads in a skyscraper\'s core.',
            'bamboo-core':  'Bamboo is too weak for the lateral wind forces on a tall building.',
            'plastic-core': 'Plastic creeps under sustained load — the core would lean and buckle.'
          }
        },
        {
          id: 'sky-floors', name: 'Floor Slabs',
          instruction: 'Choose the material for the floor slabs that span between the steel beams.',
          slotLabel: 'Floor Slabs', correctIds: ['composite-deck'],
          materials: [
            { id:'composite-deck', name:'Composite Metal Deck', description:'Steel decking topped with concrete — lightweight and strong.', icon:'🛣️' },
            { id:'glass-floor',    name:'Glass Panels',         description:'Shatter under heavy foot and furniture loads.',                icon:'🪟' },
            { id:'plywood-floor',  name:'Plywood',              description:'Too flexible and fire-prone for tall buildings.',              icon:'🪵' },
            { id:'foam-floor',     name:'Foam Panels',          description:'Compresses and collapses under normal floor loads.',          icon:'🧽' }
          ],
          failureReasons: {
            'glass-floor':  'Glass shatters under heavy live loads.',
            'plywood-floor':'Plywood is a fire hazard and too weak for tall buildings.',
            'foam-floor':   'Foam panels compress under load and offer almost no strength.'
          }
        },
        {
          id: 'sky-curtain', name: 'Curtain Wall',
          instruction: 'Choose the material for the outer curtain wall — the building\'s skin.',
          slotLabel: 'Curtain Wall', correctIds: ['aluminium-glass-facade'],
          materials: [
            { id:'aluminium-glass-facade', name:'Aluminium & Glass Facade', description:'Lightweight aluminium frames with double-glazed glass.', icon:'🏢' },
            { id:'cardboard-facade',       name:'Cardboard Panels',         description:'Disintegrates in rain — cannot form a building\'s skin.', icon:'📦' },
            { id:'fabric-wall',            name:'Fabric Sheeting',          description:'Tears in wind and lets in water.',                        icon:'🧣' },
            { id:'mud-render',             name:'Mud Render',               description:'Washes off in rain — completely impractical outdoors.',   icon:'🟤' }
          ],
          failureReasons: {
            'cardboard-facade': 'Cardboard dissolves in rain — a skyscraper\'s wall must be weatherproof for decades.',
            'fabric-wall':      'Fabric tears in wind and lets in rain and cold.',
            'mud-render':       'Mud erodes within days of the first rainstorm.'
          }
        },
        {
          id: 'sky-roof', name: 'Roof',
          instruction: 'Choose the roofing system for the skyscraper\'s top — it must handle wind and water.',
          slotLabel: 'Roof', correctIds: ['steel-membrane-roof'],
          materials: [
            { id:'steel-membrane-roof', name:'Steel & Membrane Roof', description:'Structural steel with a waterproof membrane — designed for extreme wind loads.', icon:'🏗️' },
            { id:'clay-tiles-roof',     name:'Clay Roof Tiles',       description:'Too heavy — wind at height would dislodge them dangerously.',                   icon:'🏠' },
            { id:'thatch-roof',         name:'Thatch',                description:'Blows off in wind — impossible at skyscraper height.',                          icon:'🌾' },
            { id:'paper-roof',          name:'Wax Paper',             description:'Disintegrates in the first rain.',                                               icon:'📄' }
          ],
          failureReasons: {
            'clay-tiles-roof': 'Clay tiles are too heavy — high winds would tear them off dangerously.',
            'thatch-roof':     'Thatch blows away in wind — it cannot survive rooftop weather.',
            'paper-roof':      'Wax paper disintegrates immediately in rain.'
          }
        }
      ]
    }
  } // end levels
}; // end GAME_DATA

// =============================================================================
// SCREEN MANAGER
// =============================================================================
const SCREEN_MAP = {
  start: 'screen-start',
  levelSelect: 'screen-level-select',
  game: 'screen-game',
  results: 'screen-results',
  settings: 'screen-settings'
};

function showScreen(screenName) {
  const targetId = SCREEN_MAP[screenName];
  if (!targetId) { console.error('showScreen: unknown screen "' + screenName + '"'); return; }
  Object.values(SCREEN_MAP).forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', id === targetId);
  });
}

// Wire buttons on start screen
document.getElementById('btn-play').addEventListener('click', function() { showScreen('levelSelect'); });

// =============================================================================