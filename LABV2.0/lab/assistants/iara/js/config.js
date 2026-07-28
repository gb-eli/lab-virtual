export const MODELS = Object.freeze([
  {id:"core",name:"IARA Núcleo",sub:"Econômica e cuidadosa",speed:1,intelligence:100,cost:12,delay:3000,c1:"#60e6ff",c2:"#6d65ff"},
  {id:"flux",name:"IARA Flux",sub:"30% mais capacidade",speed:1.3,intelligence:130,cost:20,delay:2300,c1:"#57f1d2",c2:"#4d8cff"},
  {id:"plus",name:"IARA Plus",sub:"Equilíbrio para o dia a dia",speed:2,intelligence:200,cost:38,delay:1500,c1:"#a777ff",c2:"#5565ff"},
  {id:"advanced",name:"IARA Advanced",sub:"Análise detalhada e rápida",speed:8,intelligence:480,cost:68,delay:760,c1:"#ff61cf",c2:"#7957ff"},
  {id:"solar",name:"IARA Solar Ultra",sub:"30× velocidade e alta profundidade",speed:30,intelligence:1100,cost:100,delay:360,c1:"#ffd35b",c2:"#ff5f32"}
]);

export const STORAGE_KEYS = Object.freeze({
  tokens: "labds.iara.v8.tokens",
  usedCodes: "labds.iara.v8.codes",
  initialGrant: "labds.iara.v8.initial500"
});

export const VAULT_PARTS = Object.freeze(["CFET6ozUE1SQSFUS", "EVkO6wUQVRlUJZVL", "X9kTLpjO2IDMy0SV", "=QFTVFkVtU0REVET"]);
export const ROUTE_PEPPER = "iara-route-v3|";
export const CREDIT_PEPPER = "iara-credit-v3|";
export const DEFAULT_TOKENS = 500;
