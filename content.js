// Edit text here, or use the website's Edit content panel and download this file.
// Chapter/theme groupings and connection lines are editable starter organization,
// NOT claims about the book or verified biological pathways.
window.BEHAVE_CONTENT = {
  version: 1,
  nodes: [
    {id:'behavior',title:'Behavior in context',chapter:'1',theme:'Context',x:635,y:585},
    {id:'frontal',title:'Frontal cortex',chapter:'2',theme:'Brain',x:124,y:150},
    {id:'amygdala',title:'Amygdala',chapter:'2',theme:'Brain',x:191,y:220},
    {id:'hypothalamus',title:'Hypothalamus',chapter:'2',theme:'Connections',x:246,y:246},
    {id:'hippocampus',title:'Hippocampus',chapter:'2',theme:'Brain',x:280,y:212},
    {id:'reward',title:'Reward circuitry',chapter:'2',theme:'Connections',x:220,y:164},
    {id:'eyes',title:'Eyes / sensory input',chapter:'3',theme:'Context',x:495,y:190},
    {id:'ears',title:'Ears / sensory input',chapter:'3',theme:'Context',x:560,y:212},
    {id:'heart',title:'Heart / bodily response',chapter:'1',theme:'Body',x:507,y:401},
    {id:'adrenals',title:'Adrenal glands',chapter:'1',theme:'Body',x:555,y:445}
  ].map(node => ({...node,
    explanation:'[ADD YOUR EXPLANATION: Explain this concept using your notes from Chapters 1–3. Rename or reassign this entry if needed.]',
    evidence:'[ADD TEXT EVIDENCE: Insert a verified short quotation or a clearly labeled paraphrase from your copy of Behave.]',
    citation:'[ADD CITATION: chapter, page number, and edition.]',
    interpretation:'[ADD YOUR INTERPRETATION: Connect this concept to a theme, author’s technique, or idea from your reading guide.]',
    connectionNote:'[ADD CONNECTION: Explain the proposed links below. Lines are conceptual placeholders, not verified biological pathways.]'
  })),
  links: [['frontal','amygdala'],['amygdala','hypothalamus'],['hippocampus','amygdala'],['reward','frontal'],['eyes','frontal'],['ears','amygdala'],['hypothalamus','heart'],['hypothalamus','adrenals'],['heart','behavior']]
};
