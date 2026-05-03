const evento = {
  id: "EVT-123",
  layout: "003",
  // ... outras 8 chaves pequenas
  payloadGigante: '{"transacoes": [...]}' // Já é uma string!
};

// 1. Separamos o gigante dos pequenos
const { payloadGigante, ...camposPequenos } = evento;

console.log("Campos pequenos:", camposPequenos);