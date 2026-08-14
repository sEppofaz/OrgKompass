const MODULES = [];
const GLOSSARY = [];
const DIAGRAMS = {};

function moduleKey(m) { return m.id; }
function questionKey(q) { return q.id; }
function glossaryKey(g) { return g.term.trim().toLowerCase(); }
