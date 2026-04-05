// The EXACT 11 Distinct Mathematical Nets of a Cube (Hexominoes)
// Each object represents the spanning tree of the folded cube.
// Root is ALWAYS 'bottom' (The Top Roof facing +Y when folded).

export const VALID_CUBE_NETS = [
  // --- 1-4-1 Variations (Backbone of 4, with 2 flaps) ---
  // 1. Cross (Flaps at pos 2)
  { id:'bottom', children: [ {id:'back', edge:'top'}, {id:'front', edge:'bottom', children:[{id:'top', edge:'bottom'}]}, {id:'left', edge:'left'}, {id:'right', edge:'right'} ] },
  
  // 2. T-Shape (Flaps at pos 1)
  { id:'bottom', children: [ {id:'back', edge:'top', children:[{id:'left', edge:'left'}, {id:'right', edge:'right'}]}, {id:'front', edge:'bottom', children:[{id:'top', edge:'bottom'}]} ] },
  
  // 3. Shift 1 (Flaps at pos 1 and 2)
  { id:'bottom', children: [ {id:'back', edge:'top', children:[{id:'left', edge:'left'}]}, {id:'right', edge:'right'}, {id:'front', edge:'bottom', children:[{id:'top', edge:'bottom'}]} ] },
  
  // 4. Asymmetric (Flaps at pos 1 and 3)
  { id:'bottom', children: [ {id:'back', edge:'top', children:[{id:'left', edge:'left'}]}, {id:'front', edge:'bottom', children:[{id:'right', edge:'right'}, {id:'top', edge:'bottom'}]} ] },
  
  // 5. S-Shape (Flaps at pos 1 and 4)
  { id:'bottom', children: [ {id:'back', edge:'top', children:[{id:'left', edge:'left'}]}, {id:'front', edge:'bottom', children:[{id:'top', edge:'bottom', children:[{id:'right', edge:'right'}]}]} ] },
  
  // 6. Middle-Shift (Flaps at pos 2 and 3)
  { id:'bottom', children: [ {id:'back', edge:'top'}, {id:'left', edge:'left'}, {id:'front', edge:'bottom', children:[{id:'right', edge:'right'}, {id:'top', edge:'bottom'}]} ] },

  // --- 2-3-1 Variations (Backbone of 3, with a 2-block and 1-block) ---
  // 7. 2-block at pos 1, 1-block at pos 1
  { id:'bottom', children: [ {id:'front', edge:'bottom'}, {id:'back', edge:'top', children:[{id:'left', edge:'left', children:[{id:'top', edge:'top'}]}, {id:'right', edge:'right'}]} ] },
  
  // 8. 2-block at pos 1, 1-block at pos 2
  { id:'bottom', children: [ {id:'right', edge:'right'}, {id:'front', edge:'bottom'}, {id:'back', edge:'top', children:[{id:'left', edge:'left', children:[{id:'top', edge:'top'}]}]} ] },
  
  // 9. 2-block at pos 1, 1-block at pos 3
  { id:'bottom', children: [ {id:'front', edge:'bottom', children:[{id:'right', edge:'right'}]}, {id:'back', edge:'top', children:[{id:'left', edge:'left', children:[{id:'top', edge:'top'}]}]} ] },

  // --- 2-2-2 Variations ---
  // 10. Staircase
  { id:'bottom', children: [ {id:'left', edge:'left', children:[{id:'back', edge:'top'}]}, {id:'front', edge:'bottom', children:[{id:'right', edge:'right', children:[{id:'top', edge:'bottom'}]}]} ] },

  // --- 3-3 Variations ---
  // 11. Offset Rows
  { id:'bottom', children: [ {id:'left', edge:'left'}, {id:'right', edge:'right', children:[{id:'front', edge:'bottom', children:[{id:'top', edge:'right', children:[{id:'back', edge:'right'}]}]}]} ] }
];
