'use strict';

// SVG STRUCTURE RENDERER
// =============================================================================
function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(function(p) { el.setAttribute(p[0], p[1]); });
  return el;
}

const GHOST_FILL   = 'rgba(255,255,255,0.06)';
const GHOST_STROKE = 'rgba(180,180,180,0.3)';
const ACTIVE_FILL  = 'rgba(255,215,0,0.22)';
const ACTIVE_STROKE= '#FFD700';

function makeSlotClickable(g) {
  g.style.cursor = 'pointer';
  g.addEventListener('click', attemptPlacement);
}
function pulseSlot(g) { g.classList.add('svg-slot-active'); }

// Popup label system — one tooltip that fades in on top of the active slot
// No static labels drawn on SVG at all (eliminates all overlap)
function showSvgTooltip(svg, x, y, text) {
  // Remove any existing tooltip
  const old = svg.querySelector('.svg-tooltip-group');
  if (old) old.remove();

  const fs = 10;
  const w  = text.length * 6.2 + 16;
  const h  = fs + 10;
  const g  = svgEl('g', { class: 'svg-tooltip-group', 'pointer-events': 'none' });

  // Arrow pointing down
  const arrowY = y - h / 2 - 6;
  g.appendChild(svgEl('polygon', {
    points: x + ',' + (arrowY + 6) + ' ' + (x - 5) + ',' + arrowY + ' ' + (x + 5) + ',' + arrowY,
    fill: 'rgba(30,30,30,0.88)'
  }));
  // Pill background
  g.appendChild(svgEl('rect', {
    x: x - w / 2, y: y - h - 6,
    width: w, height: h,
    rx: h / 2, fill: 'rgba(30,30,30,0.88)'
  }));
  const t = svgEl('text', {
    x: x, y: y - h / 2 - 6,
    'text-anchor': 'middle', 'dominant-baseline': 'middle',
    fill: '#FFD700', 'font-size': fs,
    'font-family': 'Segoe UI, system-ui, sans-serif',
    'font-weight': '800'
  });
  t.textContent = text;
  g.appendChild(t);
  g.style.opacity = '0';
  svg.appendChild(g);
  // Fade in
  requestAnimationFrame(function() {
    g.style.transition = 'opacity 0.25s ease';
    g.style.opacity    = '1';
  });
}

// Make active slots show their name on hover / mouseenter
function attachSlotTooltip(g, svg, cx, cy, name) {
  function show() { showSvgTooltip(svg, cx, cy, name); }
  function hide() { const t = svg.querySelector('.svg-tooltip-group'); if (t) { t.style.opacity='0'; setTimeout(function(){ t.remove(); }, 260); } }
  g.addEventListener('mouseenter', show);
  g.addEventListener('touchstart',  show, { passive: true });
  g.addEventListener('mouseleave', hide);
  g.addEventListener('touchend',    hide, { passive: true });
}

// ---- Shared slot shape helper ----
function drawSlotRect(g, x, y, w, h, filled, active, fill, rx) {
  var f = filled ? fill : active ? ACTIVE_FILL : GHOST_FILL;
  var s = filled ? 'rgba(255,255,255,0.18)' : active ? ACTIVE_STROKE : GHOST_STROKE;
  var sw = active ? 2.5 : 1;
  var da = active ? '0' : filled ? '0' : '5,3';
  g.appendChild(svgEl('rect', { x:x, y:y, width:w, height:h, fill:f, stroke:s,
    'stroke-width':sw, 'stroke-dasharray':da, rx: rx||3 }));
}

// ---- Draw Wall — realistic brick wall with shadow, depth, weathering ----
function drawWall(svg, stageIndex) {
  svg.setAttribute('viewBox','0 0 600 230'); svg.innerHTML='';
  const defs=svgEl('defs',{});

  // Brick pattern — alternating courses with mortar
  const bp=svgEl('pattern',{id:'wBrick',patternUnits:'userSpaceOnUse',width:'60',height:'20'});
  bp.appendChild(svgEl('rect',{x:0,y:0,width:60,height:20,fill:'#b71c1c'}));
  bp.appendChild(svgEl('rect',{x:1,y:1,width:57,height:17,fill:'#e53935',rx:1}));
  // mortar joints
  bp.appendChild(svgEl('rect',{x:0,y:0,width:60,height:1.5,fill:'#d7ccc8'}));
  bp.appendChild(svgEl('rect',{x:0,y:18.5,width:60,height:1.5,fill:'#d7ccc8'}));
  // highlight/shadow on brick
  bp.appendChild(svgEl('rect',{x:1,y:1,width:57,height:3,fill:'rgba(255,255,255,0.12)'}));
  bp.appendChild(svgEl('rect',{x:1,y:15,width:57,height:3,fill:'rgba(0,0,0,0.12)'}));
  defs.appendChild(bp);

  // Offset brick pattern (second course)
  const bp2=svgEl('pattern',{id:'wBrick2',patternUnits:'userSpaceOnUse',width:'60',height:'20',x:'30'});
  bp2.appendChild(svgEl('rect',{x:0,y:0,width:60,height:20,fill:'#b71c1c'}));
  bp2.appendChild(svgEl('rect',{x:1,y:1,width:57,height:17,fill:'#e53935',rx:1}));
  bp2.appendChild(svgEl('rect',{x:0,y:0,width:60,height:1.5,fill:'#d7ccc8'}));
  bp2.appendChild(svgEl('rect',{x:0,y:18.5,width:60,height:1.5,fill:'#d7ccc8'}));
  defs.appendChild(bp2);

  // Concrete foundation texture
  const cp=svgEl('pattern',{id:'wConc',patternUnits:'userSpaceOnUse',width:'40',height:'25'});
  cp.appendChild(svgEl('rect',{x:0,y:0,width:40,height:25,fill:'#78909c'}));
  cp.appendChild(svgEl('rect',{x:0,y:0,width:40,height:1,fill:'rgba(255,255,255,0.1)'}));
  cp.appendChild(svgEl('circle',{cx:8,cy:10,r:2,fill:'rgba(0,0,0,0.15)'}));
  cp.appendChild(svgEl('circle',{cx:28,cy:18,r:1.5,fill:'rgba(0,0,0,0.12)'}));
  cp.appendChild(svgEl('circle',{cx:18,cy:6,r:1,fill:'rgba(255,255,255,0.08)'}));
  defs.appendChild(cp);

  // Stone cap pattern
  const sp=svgEl('pattern',{id:'wStone',patternUnits:'userSpaceOnUse',width:'50',height:'20'});
  sp.appendChild(svgEl('rect',{x:0,y:0,width:50,height:20,fill:'#546e7a'}));
  sp.appendChild(svgEl('rect',{x:1,y:1,width:48,height:17,fill:'#607d8b',rx:2}));
  sp.appendChild(svgEl('rect',{x:1,y:1,width:48,height:4,fill:'rgba(255,255,255,0.1)'}));
  sp.appendChild(svgEl('rect',{x:1,y:14,width:48,height:4,fill:'rgba(0,0,0,0.15)'}));
  defs.appendChild(sp);

  // Drop shadow filter
  const flt=svgEl('filter',{id:'wallShadow',x:'-5%',y:'-5%',width:'110%',height:'120%'});
  const fe=svgEl('feDropShadow',{dx:'3',dy:'4',stdDeviation:'3','flood-color':'rgba(0,0,0,0.3)'});
  flt.appendChild(fe); defs.appendChild(flt);
  svg.appendChild(defs);

  // Sky with gradient feel
  svg.appendChild(svgEl('rect',{x:0,y:0,width:600,height:170,fill:'#87CEEB'}));
  // Sun
  svg.appendChild(svgEl('circle',{cx:520,cy:45,r:28,fill:'#FFF176',opacity:'0.9'}));
  svg.appendChild(svgEl('circle',{cx:520,cy:45,r:22,fill:'#FFEE58'}));
  // Clouds
  [[70,38,55,20],[230,28,70,24],[400,42,60,18]].forEach(function(c){
    svg.appendChild(svgEl('ellipse',{cx:c[0],cy:c[1],rx:c[2],ry:c[3],fill:'rgba(255,255,255,0.92)'}));
    svg.appendChild(svgEl('ellipse',{cx:c[0]+20,cy:c[1]+8,rx:c[2]-15,ry:c[3]-4,fill:'rgba(255,255,255,0.7)'}));
  });
  // Ground with soil layers
  svg.appendChild(svgEl('rect',{x:0,y:170,width:600,height:60,fill:'#6D4C41'}));
  svg.appendChild(svgEl('rect',{x:0,y:170,width:600,height:8,fill:'#8D6E63'}));
  svg.appendChild(svgEl('rect',{x:0,y:165,width:600,height:8,fill:'#66BB6A'}));
  // Grass tufts
  [[50,165],[130,164],[220,166],[310,164],[390,165],[470,164],[555,166]].forEach(function(t){
    svg.appendChild(svgEl('ellipse',{cx:t[0],cy:t[1],rx:8,ry:4,fill:'#43A047'}));
  });

  const WL=155, WW=290;

  // Wall left/right side edge shading (3D depth)
  svg.appendChild(svgEl('rect',{x:WL-8,y:65,width:8,height:105,fill:'rgba(0,0,0,0.2)',rx:2}));
  svg.appendChild(svgEl('rect',{x:WL+WW,y:65,width:8,height:105,fill:'rgba(0,0,0,0.12)',rx:2}));

  // Foundation shadow on ground
  svg.appendChild(svgEl('ellipse',{cx:WL+WW/2,cy:172,rx:WW/2+10,ry:6,fill:'rgba(0,0,0,0.2)'}));

  const layers=[
    {name:'Foundation', y:140, h:30, fill:'url(#wConc)', cy:155},
    {name:'Bricks',     y: 85, h:55, fill:'url(#wBrick)', cy:112},
    {name:'Mortar',     y: 70, h:15, fill:'#d7ccc8',      cy:77 },
    {name:'Cap Stone',  y: 52, h:18, fill:'url(#wStone)', cy:61 }
  ];

  layers.forEach(function(s,i){
    const filled=i<stageIndex, active=i===stageIndex;
    const g=svgEl('g',{'data-slot-index':i});
    if(!active) g.setAttribute('pointer-events','none');

    if(filled){
      // Main fill
      g.appendChild(svgEl('rect',{x:WL,y:s.y,width:WW,height:s.h,fill:s.fill}));
      // Top highlight
      g.appendChild(svgEl('rect',{x:WL,y:s.y,width:WW,height:2,fill:'rgba(255,255,255,0.18)'}));
      // Bottom shadow
      g.appendChild(svgEl('rect',{x:WL,y:s.y+s.h-2,width:WW,height:2,fill:'rgba(0,0,0,0.18)'}));
      // Brick vertical joints overlay
      if(i===1){
        for(let bx=WL+60;bx<WL+WW;bx+=60)
          g.appendChild(svgEl('line',{x1:bx,y1:s.y,x2:bx,y2:s.y+s.h,stroke:'#d7ccc8','stroke-width':'1.5',opacity:'0.5'}));
        // Second course offset joints
        for(let bx=WL+30;bx<WL+WW;bx+=60)
          g.appendChild(svgEl('line',{x1:bx,y1:s.y+20,x2:bx,y2:s.y+40,stroke:'#d7ccc8','stroke-width':'1.2',opacity:'0.4'}));
      }
      // Cap stone groove lines
      if(i===3){
        for(let bx=WL+50;bx<WL+WW;bx+=50)
          g.appendChild(svgEl('line',{x1:bx,y1:s.y+2,x2:bx,y2:s.y+s.h-2,stroke:'rgba(0,0,0,0.15)','stroke-width':'1'}));
      }
    } else if(active){
      g.appendChild(svgEl('rect',{x:WL,y:s.y,width:WW,height:s.h,
        fill:ACTIVE_FILL,stroke:ACTIVE_STROKE,'stroke-width':'2.5','stroke-dasharray':'8,4',rx:4}));
      // Animated arrow hint
      g.appendChild(svgEl('text',{x:WL+WW/2,y:s.y+s.h/2,
        'text-anchor':'middle','dominant-baseline':'middle',
        'font-size':'14','pointer-events':'none',fill:'#FF6B00'})).textContent='TAP HERE ▼';
      // Enlarged transparent hit area for easier touch
      g.appendChild(svgEl('rect',{x:WL-10,y:s.y-15,width:WW+20,height:s.h+30,fill:'transparent'}));
    } else {
      g.appendChild(svgEl('rect',{x:WL,y:s.y,width:WW,height:s.h,
        fill:'rgba(200,220,235,0.15)',stroke:'rgba(150,180,200,0.35)','stroke-width':'1',
        'stroke-dasharray':'5,4',rx:2}));
    }

    svg.appendChild(g);
    if(active){ pulseSlot(g); makeSlotClickable(g); attachSlotTooltip(g,svg,WL+WW/2,s.y,s.name); }
  });

  // Structural annotation lines on right side (blueprint style)
  if(stageIndex > 0){
    svg.appendChild(svgEl('line',{x1:WL+WW+12,y1:140,x2:WL+WW+12,y2:170,stroke:'#90A4AE','stroke-width':'1'}));
    svg.appendChild(svgEl('line',{x1:WL+WW+8,y1:140,x2:WL+WW+16,y2:140,stroke:'#90A4AE','stroke-width':'1'}));
    svg.appendChild(svgEl('line',{x1:WL+WW+8,y1:170,x2:WL+WW+16,y2:170,stroke:'#90A4AE','stroke-width':'1'}));
  }
}

// ---- Draw Bridge — realistic arch bridge over river ----
function drawBridge(svg, stageIndex) {
  svg.setAttribute('viewBox','0 0 600 230'); svg.innerHTML='';
  const defs=svgEl('defs',{});
  const cp=svgEl('pattern',{id:'bConc',patternUnits:'userSpaceOnUse',width:'30',height:'25'});
  cp.appendChild(svgEl('rect',{x:0,y:0,width:30,height:25,fill:'#78909c'}));
  cp.appendChild(svgEl('circle',{cx:7,cy:9,r:2,fill:'rgba(0,0,0,0.14)'}));
  cp.appendChild(svgEl('circle',{cx:22,cy:18,r:1.5,fill:'rgba(0,0,0,0.1)'}));
  defs.appendChild(cp);
  const rp=svgEl('pattern',{id:'bRoad',patternUnits:'userSpaceOnUse',width:'40',height:'16'});
  rp.appendChild(svgEl('rect',{x:0,y:0,width:40,height:16,fill:'#546e7a'}));
  rp.appendChild(svgEl('rect',{x:13,y:6,width:14,height:3,fill:'rgba(255,255,255,0.4)',rx:1}));
  defs.appendChild(rp);
  svg.appendChild(defs);

  svg.appendChild(svgEl('rect',{x:0,y:0,width:600,height:160,fill:'#87CEEB'}));
  svg.appendChild(svgEl('circle',{cx:540,cy:40,r:25,fill:'#FFF176',opacity:'0.9'}));
  [[60,32,60,20],[220,22,75,24],[390,38,55,18]].forEach(function(c){
    svg.appendChild(svgEl('ellipse',{cx:c[0],cy:c[1],rx:c[2],ry:c[3],fill:'rgba(255,255,255,0.92)'}));
  });
  svg.appendChild(svgEl('rect',{x:0,y:160,width:600,height:70,fill:'#1565C0'}));
  [[70,172,40,7],[180,178,50,6],[300,170,55,8],[430,175,40,7]].forEach(function(w){
    svg.appendChild(svgEl('ellipse',{cx:w[0],cy:w[1],rx:w[2],ry:w[3],fill:'rgba(255,255,255,0.12)'}));
  });
  svg.appendChild(svgEl('polygon',{points:'0,148 95,148 95,230 0,230',fill:'#6D4C41'}));
  svg.appendChild(svgEl('polygon',{points:'505,148 600,148 600,230 505,230',fill:'#6D4C41'}));
  svg.appendChild(svgEl('rect',{x:0,y:144,width:95,height:6,fill:'#66BB6A'}));
  svg.appendChild(svgEl('rect',{x:505,y:144,width:95,height:6,fill:'#66BB6A'}));

  const stages=[
    {name:'Foundation',cy:170, draw:function(g,f,a){
      [[88,158,90,30],[422,158,90,30]].forEach(function(r){
        if(f){
          g.appendChild(svgEl('rect',{x:r[0],y:r[1],width:r[2],height:r[3],fill:'url(#bConc)',rx:3}));
          g.appendChild(svgEl('rect',{x:r[0],y:r[1],width:r[2],height:3,fill:'rgba(255,255,255,0.12)'}));
        } else {
          drawSlotRect(g,r[0],r[1],r[2],r[3],f,a,'url(#bConc)',3);
          if(a) g.appendChild(svgEl('rect',{x:r[0]-15,y:r[1]-15,width:r[2]+30,height:r[3]+30,fill:'transparent'}));
        }
      });
    }},
    {name:'Piers',cy:128, draw:function(g,f,a){
      [[100,100,66,60],[434,100,66,60]].forEach(function(r){
        if(f){
          const pts=r[0]+4+','+r[1]+' '+(r[0]+r[2]-4)+','+r[1]+' '+(r[0]+r[2])+','+(r[1]+r[3])+' '+r[0]+','+(r[1]+r[3]);
          g.appendChild(svgEl('polygon',{points:pts,fill:'url(#bConc)'}));
          g.appendChild(svgEl('rect',{x:r[0]-4,y:r[1]-6,width:r[2]+8,height:8,fill:'#78909c',rx:2}));
        } else {
          drawSlotRect(g,r[0],r[1],r[2],r[3],f,a,'url(#bConc)',2);
          if(a) g.appendChild(svgEl('rect',{x:r[0]-15,y:r[1]-15,width:r[2]+30,height:r[3]+30,fill:'transparent'}));
        }
      });
    }},
    {name:'Deck',cy:98, draw:function(g,f,a){
      if(f){
        g.appendChild(svgEl('rect',{x:88,y:91,width:424,height:18,fill:'url(#bRoad)',rx:2}));
        g.appendChild(svgEl('rect',{x:88,y:91,width:424,height:4,fill:'#8d9fa8',rx:2}));
        g.appendChild(svgEl('rect',{x:88,y:105,width:424,height:4,fill:'#7a8c95',rx:2}));
        g.appendChild(svgEl('rect',{x:85,y:91,width:6,height:18,fill:'#607d8b',rx:1}));
        g.appendChild(svgEl('rect',{x:509,y:91,width:6,height:18,fill:'#607d8b',rx:1}));
      } else {
        drawSlotRect(g,88,91,424,18,f,a,'url(#bRoad)',3);
        // Expanded transparent hit rect when active — extra large for mobile
        if(a) g.appendChild(svgEl('rect',{x:78,y:72,width:444,height:56,fill:'transparent'}));
      }
    }},
    {name:'Reinforcement',cy:120, draw:function(g,f,a){
      // Visual rebar shown below the deck (y=112-128) so it doesn't overlap deck hit area
      if(f){
        for(var xi=100;xi<508;xi+=20)
          g.appendChild(svgEl('line',{x1:xi,y1:113,x2:xi,y2:127,stroke:'#FF8F00','stroke-width':'2'}));
        g.appendChild(svgEl('line',{x1:88,y1:116,x2:512,y2:116,stroke:'#FF8F00','stroke-width':'2'}));
        g.appendChild(svgEl('line',{x1:88,y1:124,x2:512,y2:124,stroke:'#FF8F00','stroke-width':'1.5'}));
        // Label band
        g.appendChild(svgEl('rect',{x:88,y:111,width:424,height:18,fill:'rgba(255,143,0,0.08)',rx:2}));
      } else {
        // Ghost / active: show in a distinct band below the deck
        drawSlotRect(g,88,111,424,18,f,a,'rgba(255,143,0,0.15)',3);
        if(a) g.appendChild(svgEl('rect',{x:78,y:100,width:444,height:44,fill:'transparent'}));
      }
    }},
    {name:'Railing',cy:68, draw:function(g,f,a){
      if(f){
        [[85,58,10,22],[505,58,10,22]].forEach(function(r){
          g.appendChild(svgEl('rect',{x:r[0],y:r[1],width:r[2],height:r[3],fill:'#b0bec5',rx:2}));
        });
        g.appendChild(svgEl('rect',{x:85,y:58,width:430,height:4,fill:'#b0bec5',rx:2}));
        g.appendChild(svgEl('rect',{x:85,y:70,width:430,height:3,fill:'#90a4ae',rx:1}));
        for(var xi=95;xi<510;xi+=25)
          g.appendChild(svgEl('rect',{x:xi-2,y:59,width:4,height:19,fill:'#90a4ae',rx:1}));
        g.appendChild(svgEl('line',{x1:85,y1:65,x2:515,y2:65,stroke:'#90a4ae','stroke-width':'1.5'}));
      } else {
        drawSlotRect(g,85,56,430,24,f,a,'#b0bec5',2);
        if(a) g.appendChild(svgEl('rect',{x:75,y:40,width:450,height:52,fill:'transparent'}));
      }
    }}
  ];

  stages.forEach(function(s,i){
    const filled=i<stageIndex, active=i===stageIndex;
    const g=svgEl('g',{'data-slot-index':i});
    // Non-active groups must NOT intercept pointer events
    if(!active) g.setAttribute('pointer-events','none');
    s.draw(g,filled,active);
    svg.appendChild(g);
    if(active){ pulseSlot(g); makeSlotClickable(g); attachSlotTooltip(g,svg,300,s.cy,s.name); }
  });

  if(stageIndex>2){
    var arch=svgEl('g',{'pointer-events':'none'});
    arch.appendChild(svgEl('path',{d:'M 133 109 Q 300 50 467 109',fill:'none',stroke:'#546e7a','stroke-width':'6','stroke-linecap':'round'}));
    arch.appendChild(svgEl('path',{d:'M 133 109 Q 300 50 467 109',fill:'none',stroke:'rgba(255,255,255,0.15)','stroke-width':'2'}));
    [[200,82],[250,68],[300,63],[350,68],[400,82]].forEach(function(p){
      arch.appendChild(svgEl('line',{x1:p[0],y1:p[1],x2:p[0],y2:91,stroke:'#78909c','stroke-width':'1.5'}));
    });
    svg.appendChild(arch);
  }
}
// ---- Draw Dam ----
function drawDam(svg, stageIndex) {
  svg.setAttribute('viewBox','0 0 600 220'); svg.innerHTML='';
  const defs=svgEl('defs',{});
  const cp=svgEl('pattern',{id:'dConc',patternUnits:'userSpaceOnUse',width:'20',height:'20'});
  cp.appendChild(svgEl('rect',{x:0,y:0,width:20,height:20,fill:'#90a4ae'}));
  cp.appendChild(svgEl('circle',{cx:6,cy:7,r:1.3,fill:'rgba(0,0,0,0.13)'}));
  const rp=svgEl('pattern',{id:'dRock',patternUnits:'userSpaceOnUse',width:'16',height:'12'});
  rp.appendChild(svgEl('rect',{x:0,y:0,width:16,height:12,fill:'#8d6e63'}));
  rp.appendChild(svgEl('ellipse',{cx:8,cy:6,rx:6,ry:4,fill:'#a1887f',stroke:'rgba(0,0,0,0.15)','stroke-width':'0.6'}));
  [cp,rp].forEach(function(p){defs.appendChild(p);}); svg.appendChild(defs);

  svg.appendChild(svgEl('rect',{x:0,y:0,width:600,height:80,fill:'#87CEEB'}));
  svg.appendChild(svgEl('polygon',{points:'0,80 120,35 200,55 300,20 400,50 500,30 600,60 600,80',fill:'#66BB6A'}));
  svg.appendChild(svgEl('rect',{x:0,y:80,width:230,height:140,fill:'#1E88E5',opacity:'0.8'}));
  [[60,100],[110,120],[45,145]].forEach(function(w){ svg.appendChild(svgEl('ellipse',{cx:w[0],cy:w[1],rx:30,ry:5,fill:'rgba(255,255,255,0.18)'})); });
  svg.appendChild(svgEl('rect',{x:395,y:160,width:205,height:60,fill:'#8D6E63'}));
  svg.appendChild(svgEl('rect',{x:395,y:158,width:205,height:5,fill:'#66BB6A'}));
  svg.appendChild(svgEl('polygon',{points:'230,80 390,80 395,220 225,220',fill:'#9e9e9e',stroke:'rgba(0,0,0,0.15)','stroke-width':'1'}));

  const stages=[
    {name:'Base',         r:[225,195,170,25], fill:'url(#dConc)', cx:310,cy:190},
    {name:'Core Wall',    r:[285, 80, 30,140],fill:'#546e7a',     cx:300,cy:130},
    {name:'Waterproofing',r:[230, 80, 20,140],fill:'#1E88E5',     cx:240,cy:130},
    {name:'Spillway',     r:[360, 80, 40, 40],fill:'url(#dConc)', cx:380,cy:80 },
    {name:'Facing',       r:[365,120, 30,100],fill:'url(#dRock)', cx:380,cy:130}
  ];

  stages.forEach(function(s,i){
    const filled=i<stageIndex, active=i===stageIndex;
    const g=svgEl('g',{'data-slot-index':i});
    // Non-active groups must NOT intercept pointer events
    if(!active) g.setAttribute('pointer-events','none');
    drawSlotRect(g,s.r[0],s.r[1],s.r[2],s.r[3],filled,active,s.fill);
    // Add a larger transparent hit area when active so narrow slots are easy to tap
    if(active){
      var hr=svgEl('rect',{x:s.r[0]-18,y:s.r[1]-18,
        width:Math.max(s.r[2]+36,70),height:Math.max(s.r[3]+36,70),
        fill:'transparent'});
      g.appendChild(hr);
    }
    svg.appendChild(g);
    if(active){ pulseSlot(g); makeSlotClickable(g); attachSlotTooltip(g,svg,s.cx,s.cy,s.name); }
  });
}

// ---- Draw Skyscraper ----
function drawSkyscraper(svg, stageIndex) {
  svg.setAttribute('viewBox','0 0 600 240'); svg.innerHTML='';
  const defs=svgEl('defs',{});
  const sp=svgEl('pattern',{id:'skSteel',patternUnits:'userSpaceOnUse',width:'10',height:'10'});
  sp.appendChild(svgEl('rect',{x:0,y:0,width:10,height:10,fill:'#546e7a'}));
  sp.appendChild(svgEl('line',{x1:0,y1:5,x2:10,y2:5,stroke:'rgba(255,255,255,0.15)','stroke-width':'1'}));
  sp.appendChild(svgEl('line',{x1:5,y1:0,x2:5,y2:10,stroke:'rgba(255,255,255,0.1)','stroke-width':'1'}));
  const cp=svgEl('pattern',{id:'skConc',patternUnits:'userSpaceOnUse',width:'20',height:'20'});
  cp.appendChild(svgEl('rect',{x:0,y:0,width:20,height:20,fill:'#90a4ae'}));
  cp.appendChild(svgEl('circle',{cx:5,cy:8,r:1.2,fill:'rgba(0,0,0,0.12)'}));
  [sp,cp].forEach(function(p){defs.appendChild(p);}); svg.appendChild(defs);

  // Night sky background
  svg.appendChild(svgEl('rect',{x:0,y:0,width:600,height:240,fill:'#1a237e'}));
  // Silhouette buildings behind
  [[20,130,40,75],[75,118,30,87],[430,135,50,70],[500,120,38,85],[548,130,42,75]].forEach(function(b){
    svg.appendChild(svgEl('rect',{x:b[0],y:b[1],width:b[2],height:b[3],fill:'rgba(255,255,255,0.05)'}));
  });
  // Stars
  [[40,18],[155,28],[385,15],[525,25],[205,8],[465,38],[310,12]].forEach(function(s){
    svg.appendChild(svgEl('circle',{cx:s[0],cy:s[1],r:1.2,fill:'#fff',opacity:'0.65'}));
  });
  // Ground
  svg.appendChild(svgEl('rect',{x:0,y:205,width:600,height:35,fill:'#263238'}));
  // Road markings
  for(var rm=50;rm<560;rm+=60)
    svg.appendChild(svgEl('rect',{x:rm,y:213,width:30,height:4,fill:'rgba(255,255,255,0.12)',rx:2}));

  // -----------------------------------------------------------------------
  // Key insight: each stage occupies a DISTINCT non-overlapping region.
  // Stages drawn bottom-to-top as horizontal bands of a building.
  // This eliminates all click interception.
  //
  // Stage 0 — Deep Foundation:  underground piles  y=195..220
  // Stage 1 — Core Frame:       core column        x=282..318, y=55..200
  // Stage 2 — Floor Slabs:      horizontal bands   x=230..370, every 22px from y=55..200
  // Stage 3 — Curtain Wall:     glass facade       x=230..370, y=55..200 (left+right strips only)
  // Stage 4 — Roof:             triangle + antenna y=30..55
  //
  // Non-active stages set pointer-events:none so they never steal clicks.
  // -----------------------------------------------------------------------

  const BX=230, BW=140, BY=55, BH=145; // building footprint

  var stages=[
    // 0 — Deep Foundation: piles below ground
    {name:'Deep Foundation', cy:215,
     draw:function(g,f,a){
      var piles=[245,270,295,320,345,355];
      piles.forEach(function(px){
        g.appendChild(svgEl('rect',{x:px,y:f?200:a?202:203,width:12,height:f?22:a?18:15,
          fill:f?'url(#skConc)':a?ACTIVE_FILL:GHOST_FILL,
          stroke:f?'rgba(255,255,255,0.15)':a?ACTIVE_STROKE:GHOST_STROKE,
          'stroke-width':a?2:0.8,rx:2}));
      });
      // Pile cap
      if(f) g.appendChild(svgEl('rect',{x:BX,y:198,width:BW,height:8,fill:'#78909c',rx:2}));
      if(a) g.appendChild(svgEl('rect',{x:BX-15,y:185,width:BW+30,height:50,fill:'transparent'}));
    }},

    // 1 — Core Frame: central steel column
    {name:'Core Frame', cy:128,
     draw:function(g,f,a){
      var cx2=BX+BW/2-18, cw=36;
      var ht=f?BH:a?BH:BH;
      g.appendChild(svgEl('rect',{x:cx2,y:BY,width:cw,height:ht,
        fill:f?'url(#skSteel)':a?ACTIVE_FILL:GHOST_FILL,
        stroke:f?'rgba(255,255,255,0.18)':a?ACTIVE_STROKE:GHOST_STROKE,
        'stroke-width':a?2.5:0.8,'stroke-dasharray':f||a?'0':'5,3',rx:2}));
      // Cross-bracing on filled
      if(f){
        for(var by2=BY+10;by2<BY+BH-10;by2+=28){
          g.appendChild(svgEl('line',{x1:cx2,y1:by2,x2:cx2+cw,y2:by2+18,stroke:'rgba(255,255,255,0.18)','stroke-width':'1.2'}));
          g.appendChild(svgEl('line',{x1:cx2+cw,y1:by2,x2:cx2,y2:by2+18,stroke:'rgba(255,255,255,0.18)','stroke-width':'1.2'}));
        }
      }
      if(a) g.appendChild(svgEl('rect',{x:BX-15,y:BY-15,width:BW+30,height:BH+30,fill:'transparent'}));
    }},

    // 2 — Floor Slabs: horizontal bands across full width (but NOT overlapping core)
    {name:'Floor Slabs', cy:128,
     draw:function(g,f,a){
      for(var fy=BY;fy<BY+BH;fy+=22){
        g.appendChild(svgEl('rect',{x:BX,y:fy,width:BW,height:4,
          fill:f?'#78909c':a?'rgba(255,215,0,0.4)':GHOST_FILL,
          stroke:f?'rgba(255,255,255,0.25)':a?ACTIVE_STROKE:GHOST_STROKE,
          'stroke-width':a?1.5:0.7}));
      }
      // Invisible hit-area rect so the whole column is tappable when active
      if(a){
        var hit=svgEl('rect',{x:BX-15,y:BY-15,width:BW+30,height:BH+30,fill:'transparent'});
        g.appendChild(hit);
      }
    }},

    // 3 — Curtain Wall: left and right glass strips only (avoids covering core/floors)
    {name:'Curtain Wall', cy:128,
     draw:function(g,f,a){
      // Left strip
      g.appendChild(svgEl('rect',{x:BX,y:BY,width:18,height:BH,
        fill:f?'rgba(100,181,246,0.65)':a?ACTIVE_FILL:GHOST_FILL,
        stroke:f?'rgba(144,202,249,0.5)':a?ACTIVE_STROKE:GHOST_STROKE,
        'stroke-width':a?2.5:0.8,'stroke-dasharray':f||a?'0':'5,3',rx:1}));
      // Right strip
      g.appendChild(svgEl('rect',{x:BX+BW-18,y:BY,width:18,height:BH,
        fill:f?'rgba(100,181,246,0.65)':a?ACTIVE_FILL:GHOST_FILL,
        stroke:f?'rgba(144,202,249,0.5)':a?ACTIVE_STROKE:GHOST_STROKE,
        'stroke-width':a?2.5:0.8,'stroke-dasharray':f||a?'0':'5,3',rx:1}));
      // Window grid on filled
      if(f){
        [[BX+2,BX+14],[BX+BW-16,BX+BW-2]].forEach(function(xs){
          for(var wy=BY+6;wy<BY+BH-10;wy+=16){
            g.appendChild(svgEl('rect',{x:xs[0],y:wy,width:xs[1]-xs[0],height:10,
              fill:'rgba(144,202,249,0.6)',rx:1}));
          }
        });
      }
      // Hit area when active
      if(a){
        var hit=svgEl('rect',{x:BX-15,y:BY-15,width:BW+30,height:BH+30,fill:'transparent'});
        g.appendChild(hit);
      }
    }},

    // 4 — Roof: triangle above building
    {name:'Roof', cy:42,
     draw:function(g,f,a){
      var pts=BX+','+BY+' '+(BX+BW/2)+',30 '+(BX+BW)+','+BY;
      g.appendChild(svgEl('polygon',{points:pts,
        fill:f?'#455a64':a?ACTIVE_FILL:GHOST_FILL,
        stroke:f?'rgba(255,255,255,0.2)':a?ACTIVE_STROKE:GHOST_STROKE,
        'stroke-width':a?2.5:0.8,'stroke-dasharray':f||a?'0':'5,3'}));
      if(f){
        g.appendChild(svgEl('line',{x1:BX+BW/2,y1:30,x2:BX+BW/2,y2:12,stroke:'#cfd8dc','stroke-width':'2'}));
        g.appendChild(svgEl('circle',{cx:BX+BW/2,cy:10,r:3.5,fill:'#ff1744'}));
        // Antenna blink light
        g.appendChild(svgEl('circle',{cx:BX+BW/2,cy:10,r:5,fill:'rgba(255,23,68,0.25)'}));
      }
      if(a) g.appendChild(svgEl('rect',{x:BX-15,y:5,width:BW+30,height:65,fill:'transparent'}));
    }}
  ];

  stages.forEach(function(s,i){
    const filled=i<stageIndex, active=i===stageIndex;
    const g=svgEl('g',{'data-slot-index':i});

    // CRITICAL FIX: non-active stages must NOT intercept pointer events
    if(!active){
      g.setAttribute('pointer-events','none');
    }

    s.draw(g,filled,active);
    svg.appendChild(g);
    if(active){ pulseSlot(g); makeSlotClickable(g); attachSlotTooltip(g,svg,s.cx||BX+BW/2,s.cy,s.name); }
  });
}

function drawStructure(stageIndex) {
  const svg = document.getElementById('structure-svg');
  if (!svg) return;
  switch (gameState.currentLevelId) {
    case 'wall':       drawWall(svg, stageIndex);       break;
    case 'bridge':     drawBridge(svg, stageIndex);     break;
    case 'dam':        drawDam(svg, stageIndex);         break;
    case 'skyscraper': drawSkyscraper(svg, stageIndex); break;
  }
}

function getCurrentSlots() { return document.querySelectorAll('#structure-svg [data-slot-index]'); }
function markSlotFilled(i) { drawStructure(i + 1); }
function highlightCurrentSlot(i) { drawStructure(i); }

// =============================================================================