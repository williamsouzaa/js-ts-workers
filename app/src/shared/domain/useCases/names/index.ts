export enum E_OBRIGACAO_CODIGO_LAYOUT {
  EFINANCEIRA_CADASTRO_DECLARANTE     = '001',
  EFINANCEIRA_ABERTURA                = '002',
  EFINANCEIRA_MOVIMENTACAO_FINACEIRA  = '003',
  EFINANCEIRA_PREVIDENCIA_PRIVADA     = '004',
  EFINANCEIRA_FECHAMENTO              = '005',
  EFINANCEIRA_EXCLUSAO                = '006',
  EFINANCEIRA_CADASTRO_PATROCINADOS   = '008',
  EFINANCEIRA_EXCLUSAO_TOTAL          = '009',

  EFINANCEIRA_REPASSE_ABERTURA        = '012',
  EFINANCEIRA_REPASSE_FECHAMENTO      = '013',
  EFINANCEIRA_REPASSE_MOVIMENTO       = '014'
}

// ============================================================================
// ============================================================================

export enum E_OBRIGACAO {
  E_FINANCEIRA = 'efinanceira',
  REINF        = 'reinf',
  ESOCIAL      = 'esocial',
  NFSE         = 'nota_fiscal_eletronica'
}


// ============================================================================
// ============================================================================

export enum E_WORKER_PROCESS {
  QUEUE = 'queue'
}

export enum E_WORKERS_PROCESS_QUEUE {
  PROCESS_PACKAGE = 'processPackage'
}

// ============================================================================
// ============================================================================

export enum E_LAYOUTS_PACKAGE_SIZE {
  EFINANCEIRA_CADASTRO_DECLARANTE = 1,
  EFINANCEIRA_ABERTURA = 1,
  EFINANCEIRA_MOVIMENTACAO_FINACEIRA = 3,
  EFINANCEIRA_PREVIDENCIA_PRIVADA = 3,
  EFINANCEIRA_FECHAMENTO = 1,
  EFINANCEIRA_EXCLUSAO = 1,
  EFINANCEIRA_CADASTRO_PATROCINADOS = 1,
  EFINANCEIRA_EXCLUSAO_TOTAL = 1
}