// Categorias e Funções Musicais Oficiais do Sistema Cruz Church
export const CATEGORIAS_MUSICAIS = [
  {
    naipe: 'Vocal',
    funcoes: [
      'Vocal Líder',
      'Soprano',
      'Contralto',
      'Tenor',
      'Backing Vocal'
    ]
  },
  {
    naipe: 'Harmonia',
    funcoes: [
      'Teclado / Piano',
      'Violão Aço',
      'Guitarra Solo',
      'Guitarra Base'
    ]
  },
  {
    naipe: 'Ritmo',
    funcoes: [
      'Contrabaixo',
      'Bateria',
      'Percussão'
    ]
  },
  {
    naipe: 'Áudio & Som',
    funcoes: [
      'Técnico de Som (FOH)',
      'Operador de Retorno / Palco'
    ]
  },
  {
    naipe: 'Mídia & Transmissão',
    funcoes: [
      'Transmissão ao Vivo',
      'Projeção / Letras',
      'Câmeras',
      'Iluminação'
    ]
  }
]

// Lista plana com todas as funções para seleção rápida
export const TODAS_AS_FUNCOES = CATEGORIAS_MUSICAIS.flatMap(cat =>
  cat.funcoes.map(funcao => ({ funcao, naipe: cat.naipe }))
)

export function obterNaipePorFuncao(funcaoNome) {
  for (const cat of CATEGORIAS_MUSICAIS) {
    if (cat.funcoes.some(f => f.toLowerCase() === (funcaoNome || '').toLowerCase())) {
      return cat.naipe
    }
  }
  return 'Geral'
}
