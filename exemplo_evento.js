{
  identifier: 'fiscalOBligationsEventsPackage',
  fiscalOBligationsEventsPackage: {
    packageReference: {
      keyGroup: 'efinanceira#003#12345678000199#2026#5',
      packageIndex: 2
    }
  },
  worker: { id: 1 },
  message: 'mainThread',
  entryData: [
    {
      from: {
        identifider: 'sqs',
        sqs: {
          messageId: 'ccbdfb29-19ed-4a11-96c3-bbe32c39894f',
          receiptId: 'MzJhZGJhMzQtNzQ5MC00MzEyLThjMzAtYTIwZjMyZGQ5ZmFmIGFybjphd3M6c3FzOnVzLWVhc3QtMTowMDAwMDAwMDAwMDA6ZmlsYS1kZS1wcm9jZXNzYW1lbnRvIGNjYmRmYjI5LTE5ZWQtNGExMS05NmMzLWJiZTMyYzM5ODk0ZiAxNzc4ODc3NTc5LjQzMTU5OTE='
        }
      },
      event: {
        obrigacao: 'efinanceira',
        efinanceira: {
          cnpjEmpresa: '12345678000199',
          idGov: 'ID1778876244537',
          ano: 2026,
          mes: 5,
          anoMes: 202605,
          codLayout: '003',
          evento: {
            eFinanceira: {
              evtMovOpFin: {
                ideEvento: {
                  indRetificacao: 1,
                  tpAmb: 2,
                  aplicEmi: 1,
                  verAplic: '1.3.0'
                },
                ideDeclarante: { cnpjDeclarante: '03710817267559' },
                ideDeclarado: {
                  tpNI: 1,
                  tpDeclarado: [ 'STTR' ],
                  NIDeclarado: '77064433751',
                  NIF: [],
                  inDeclaracaoPropriaCRS: 'CRS901',
                  NomeDeclarado: 'Heitor Braga',
                  DataNasc: '1978-03-24',
                  InfoNascimento: {
                    Municipio: 'Reis do Sul',
                    PaisNasc: { Pais: 'BR' }
                  },
                  Endereco: [
                    {
                      tpEndereco: 'RESID',
                      EnderecoEstrutura: {
                        Logradouro: 'Avenida Barros',
                        Numero: '1825',
                        Complemento: 'Ap01',
                        Bairro: 'Rutland',
                        CEP: '56524478',
                        Municipio: 'Sirineu de Nossa Senhora',
                        UF: 'RO'
                      },
                      Pais: 'BR'
                    }
                  ],
                  paisResid: [ { Pais: 'BR' } ],
                  PaisNacionalidade: [ { Pais: 'BR' } ]
                },
                mesCaixa: {
                  anoMesCaixa: '202302',
                  movOpFin: {
                    Conta: [
                      {
                        infoConta: {
                          Reportavel: [ { Pais: 'BR' }, { Pais: 'US' } ],
                          tpConta: 'D',
                          subTpConta: 'CI',
                          tpNumConta: 'CONTA',
                          numConta: '0253-48249167',
                          dtAberturaConta: '2020-02-29',
                          formaAberturaConta: 2,
                          tpRelacaoDeclarado: 5,
                          moeda: 'BRL',
                          NoTitulares: '2',
                          BalancoConta: {
                            totCreditos: '56003,95',
                            totDebitos: '63950,39',
                            totCreditosMesmaTitularidade: '25103,67',
                            totDebitosMesmaTitularidade: '46855,16',
                            vlrUltDia: '99471,48'
                          },
                          PgtosAcum: [
                            {
                              tpPgto: [ 'TED' ],
                              totPgtosAcum: '469139,16'
                            },
                            {
                              tpPgto: [ 'CREDITO' ],
                              totPgtosAcum: '267688,94'
                            },
                            {
                              tpPgto: [ 'DEBITO' ],
                              totPgtosAcum: '164252,01'
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      from: {
        identifider: 'sqs',
        sqs: {
          messageId: 'e6d89245-935f-4f3f-86f4-6d0a7b56cbd3',
          receiptId: 'NjAzZjRlMzUtMGFhMS00NjExLWI0YWYtODE3NmIyYzFlODg5IGFybjphd3M6c3FzOnVzLWVhc3QtMTowMDAwMDAwMDAwMDA6ZmlsYS1kZS1wcm9jZXNzYW1lbnRvIGU2ZDg5MjQ1LTkzNWYtNGYzZi04NmY0LTZkMGE3YjU2Y2JkMyAxNzc4ODc3NTc5LjQzMTYzNDc='
        }
      },
      event: {
        obrigacao: 'efinanceira',
        efinanceira: {
          cnpjEmpresa: '12345678000199',
          idGov: 'EVT-1778876244537-3',
          ano: 2026,
          mes: 5,
          anoMes: 202605,
          codLayout: '003',
          evento: {
            eFinanceira: {
              evtMovOpFin: {
                ideEvento: {
                  indRetificacao: 1,
                  tpAmb: 2,
                  aplicEmi: 1,
                  verAplic: '1.3.0'
                },
                ideDeclarante: { cnpjDeclarante: '96030831104564' },
                ideDeclarado: {
                  tpNI: 1,
                  tpDeclarado: [ 'FATCA', 'CRS' ],
                  NIDeclarado: '27476871227',
                  NIF: [],
                  inDeclaracaoPropriaCRS: 'CRS901',
                  NomeDeclarado: 'Isaac Albuquerque',
                  DataNasc: '1970-06-24',
                  InfoNascimento: {
                    Municipio: 'Nogueira do Sul',
                    PaisNasc: { Pais: 'BR' }
                  },
                  Endereco: [
                    {
                      tpEndereco: 'COMERC',
                      EnderecoEstrutura: {
                        Logradouro: 'Travessa Marina',
                        Numero: '3555',
                        Complemento: 'Bloco B',
                        Bairro: 'Perry County',
                        CEP: '74843040',
                        Municipio: 'Tertuliano do Descoberto',
                        UF: 'MG'
                      },
                      Pais: 'BR'
                    }
                  ],
                  paisResid: [ { Pais: 'BR' } ],
                  PaisNacionalidade: [ { Pais: 'BR' } ]
                },
                mesCaixa: {
                  anoMesCaixa: '202109',
                  movOpFin: {
                    Conta: [
                      {
                        infoConta: {
                          Reportavel: [ { Pais: 'BR' } ],
                          tpConta: 'C',
                          subTpConta: 'CI',
                          tpNumConta: 'CONTA',
                          numConta: '6412-99059346',
                          dtAberturaConta: '2017-09-19',
                          formaAberturaConta: 1,
                          tpRelacaoDeclarado: 1,
                          moeda: 'EUR',
                          NoTitulares: '10',
                          Fundo: { CNPJ: '71071606180031' },
                          BalancoConta: {
                            totCreditos: '962435,72',
                            totDebitos: '361061,61',
                            totCreditosMesmaTitularidade: '154098,68',
                            totDebitosMesmaTitularidade: '64456,40',
                            vlrUltDia: '397412,65'
                          },
                          PgtosAcum: [
                            {
                              tpPgto: [ 'DEBITO' ],
                              totPgtosAcum: '20772,92'
                            },
                            {
                              tpPgto: [ 'BOLETO' ],
                              totPgtosAcum: '238042,49'
                            },
                            {
                              tpPgto: [ 'DOC' ],
                              totPgtosAcum: '110221,76'
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      from: {
        identifider: 'sqs',
        sqs: {
          messageId: '10a966d3-34e7-4154-a00d-d3740de0a6c6',
          receiptId: 'ZjBjNDdjZjktYzM2MS00M2RhLWI0YTQtNzI1OTY4MzVkMjJlIGFybjphd3M6c3FzOnVzLWVhc3QtMTowMDAwMDAwMDAwMDA6ZmlsYS1kZS1wcm9jZXNzYW1lbnRvIDEwYTk2NmQzLTM0ZTctNDE1NC1hMDBkLWQzNzQwZGUwYTZjNiAxNzc4ODc3NTc5LjQzMTY2Mg=='
        }
      },
      event: {
        obrigacao: 'efinanceira',
        efinanceira: {
          cnpjEmpresa: '12345678000199',
          idGov: 'EVT-1778876699029-0',
          ano: 2026,
          mes: 5,
          anoMes: 202605,
          codLayout: '003',
          evento: {
            eFinanceira: {
              evtMovOpFin: {
                ideEvento: {
                  indRetificacao: 1,
                  tpAmb: 2,
                  aplicEmi: 1,
                  verAplic: '1.3.0'
                },
                ideDeclarante: { cnpjDeclarante: '75563947048169' },
                ideDeclarado: {
                  tpNI: 1,
                  tpDeclarado: [ 'STTR', 'FATCA' ],
                  NIDeclarado: '59580969492',
                  NIF: [],
                  inDeclaracaoPropriaCRS: 'CRS902',
                  NomeDeclarado: 'Yuri Moraes',
                  DataNasc: '1989-08-15',
                  InfoNascimento: {
                    Municipio: 'Moreira de Nossa Senhora',
                    PaisNasc: { Pais: 'BR' }
                  },
                  Endereco: [
                    {
                      tpEndereco: 'RESID',
                      EnderecoEstrutura: {
                        Logradouro: 'Marginal Daniel',
                        Numero: '7904',
                        Complemento: 'Sala5',
                        Bairro: 'Central',
                        CEP: '23025704',
                        Municipio: 'Barros do Descoberto',
                        UF: 'RN'
                      },
                      Pais: 'BR'
                    }
                  ],
                  paisResid: [ { Pais: 'BR' } ],
                  PaisNacionalidade: [ { Pais: 'BR' } ]
                },
                mesCaixa: {
                  anoMesCaixa: '202007',
                  movOpFin: {
                    Conta: [
                      {
                        infoConta: {
                          Reportavel: [ { Pais: 'BR' } ],
                          tpConta: 'D',
                          subTpConta: 'CC',
                          tpNumConta: 'AGENCIA',
                          numConta: '0553-27562512',
                          dtAberturaConta: '2001-12-23',
                          formaAberturaConta: 2,
                          tpRelacaoDeclarado: 3,
                          moeda: 'USD',
                          NoTitulares: '7',
                          Fundo: { CNPJ: '12087089429787' },
                          BalancoConta: {
                            totCreditos: '541952,30',
                            totDebitos: '11318,55',
                            totCreditosMesmaTitularidade: '44201,06',
                            totDebitosMesmaTitularidade: '89085,53',
                            vlrUltDia: '456454,63'
                          },
                          PgtosAcum: [
                            {
                              tpPgto: [ 'BOLETO' ],
                              totPgtosAcum: '407875,51'
                            },
                            {
                              tpPgto: [ 'DEBITO' ],
                              totPgtosAcum: '316604,91'
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }
  ]
}