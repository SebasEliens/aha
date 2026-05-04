import type { Report } from '@/app/types'

// ─── Report 1: Marktanalyse Eindhoven (CBRE / Sonneborgh) ────────────────────

export const marktanalyseEindhoven: Report = {
  id: 'mock-report-1',
  name: 'Marktanalyse Eindhoven',
  status: 'draft',
  sections: [
    {
      id: 's1',
      title: 'Samenvatting',
      type: 'executive_summary',
      elements: [
        {
          id: 'e1-1',
          type: 'stat_card',
          data: {
            items: [
              {
                label: 'Bevolking Eindhoven (2023)',
                value: '243.400',
                unit: 'inwoners',
              },
              {
                label: 'Groei 80+ tot 2050',
                value: '+128%',
                unit: '',
                trendPositive: false,
              },
              {
                label: 'Totaal Wlz-tekort 2050',
                value: '2.068',
                unit: 'plaatsen',
                trendPositive: false,
              },
              {
                label: 'Extramuraal aanbod nu',
                value: '60',
                unit: 'plaatsen',
                trendPositive: false,
              },
            ],
          },
        },
        {
          id: 'e1-2',
          type: 'text_block',
          data: {
            content:
              'CBRE heeft in opdracht van Sonneborgh onderzoek gedaan naar de marktpotentie van 43 woonzorgeenheden in de voormalige Jacobuskerk aan de Orionstraat 5 te Eindhoven. De conclusie is helder: de ontwikkeling is zeer kansrijk.\n\nEindhoven kent een structureel tekort aan extramurale 24-uurszorglocaties. Momenteel zijn er slechts 60 extramurale plaatsen beschikbaar — terwijl de vraag groeit van 308 (2022) naar 1.324 plaatsen in 2050. Dit is een groei van 330%. Het beleid van de overheid om Wlz-zorg steeds vaker extramuraal te verzilveren versterkt deze urgentie verder.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: 'Demografische Ontwikkeling',
      type: 'content',
      elements: [
        {
          id: 'e2-1',
          type: 'text_block',
          data: {
            content:
              'De Eindhovense bevolking groeit van 243.400 (2023) naar circa 295.200 inwoners in 2050 (+21,3%). De meest relevante groep — 80-plussers — groeit het sterkst. CBS verwacht voor alle leeftijdscategorieën een toename, met uitzondering van de groep 20–40 jaar.',
          },
        },
        {
          id: 'e2-2',
          type: 'data_table',
          title: 'Bevolkingsprognose Eindhoven per leeftijdsgroep',
          data: {
            columns: ['Leeftijdsgroep', '2023', '2050', 'Groei #', 'Groei %'],
            rows: [
              ['70–80 jaar', '18.700', '27.000', '+8.300', '+44,4%'],
              ['80–90 jaar', '9.300', '20.400', '+11.100', '+119,4%'],
              ['90+ jaar', '1.900', '5.100', '+3.200', '+168,4%'],
              ['Totaal 80+', '11.200', '25.500', '+14.300', '+127,7%'],
            ],
            note: 'Bron: CBS bevolkingsprognose 2024',
          },
        },
        {
          id: 'e2-3',
          type: 'line_chart',
          title: 'Ontwikkeling 80+ leeftijdsgroepen Eindhoven 2022–2050',
          data: {
            series: [
              {
                label: '80–90 jaar',
                values: [9300, 10200, 13500, 16500, 19100, 20000, 20400],
              },
              {
                label: '90+ jaar',
                values: [1900, 2100, 2800, 3500, 4200, 4700, 5100],
              },
            ],
            labels: ['2022', '2025', '2030', '2035', '2040', '2045', '2050'],
            yLabel: 'Aantal personen',
          },
        },
      ],
    },
    {
      id: 's3',
      title: 'Zorgvraag & Aanbod',
      type: 'content',
      elements: [
        {
          id: 'e3-1',
          type: 'text_block',
          data: {
            content:
              'De totale Wlz-zorgvraag (24-uurszorg) groeit van 1.582 plaatsen in 2022 naar 3.442 in 2050 (+118%). Opvallend is de sterke groei van de extramurale vraag: van 308 naar 1.324 plaatsen (+330%). Dit wordt gedreven door overheidsbeleid dat extramuralisering stimuleert en door de stijgende vraag naar particuliere woonzorgarrangementen.',
          },
        },
        {
          id: 'e3-2',
          type: 'data_table',
          title: 'Confrontatie Wlz vraag en aanbod Eindhoven',
          data: {
            columns: [
              '',
              '2022',
              '2025',
              '2030',
              '2035',
              '2040',
              '2045',
              '2050',
            ],
            rows: [
              [
                'Extramurale vraag',
                '308',
                '590',
                '752',
                '887',
                '1.048',
                '1.196',
                '1.324',
              ],
              [
                'Intramurale vraag',
                '1.274',
                '1.117',
                '1.225',
                '1.440',
                '1.691',
                '1.923',
                '2.118',
              ],
              [
                'Totale Wlz-vraag',
                '1.582',
                '1.707',
                '1.977',
                '2.327',
                '2.739',
                '3.119',
                '3.442',
              ],
              ['Extramuraal aanbod', '60', '60', '60', '60', '60', '60', '60'],
              [
                'Intramuraal aanbod',
                '1.314',
                '1.314',
                '1.314',
                '1.314',
                '1.314',
                '1.314',
                '1.314',
              ],
              [
                'Extramuraal tekort',
                '-248',
                '-530',
                '-692',
                '-827',
                '-988',
                '-1.136',
                '-1.264',
              ],
              [
                'Intramuraal tekort/overschot',
                '+40',
                '+197',
                '+89',
                '-126',
                '-377',
                '-609',
                '-804',
              ],
              [
                'Totaal Wlz-tekort',
                '-208',
                '-333',
                '-603',
                '-953',
                '-1.365',
                '-1.745',
                '-2.068',
              ],
            ],
            note: 'Bron: CBS, CIZ indicatiegegevens 2024, CBRE Healthcare berekening',
          },
        },
        {
          id: 'e3-3',
          type: 'bar_chart',
          title: 'Totaal Wlz-tekort Eindhoven 2022–2050 (aantal plaatsen)',
          data: {
            series: [
              {
                label: 'Totaal Wlz-tekort',
                values: [208, 333, 603, 953, 1365, 1745, 2068],
              },
            ],
            labels: ['2022', '2025', '2030', '2035', '2040', '2045', '2050'],
            yLabel: 'Plaatsen',
          },
        },
      ],
    },
    {
      id: 's4',
      title: 'Huidig Aanbod',
      type: 'content',
      elements: [
        {
          id: 'e4-1',
          type: 'text_block',
          data: {
            content:
              'In gemeente Eindhoven zijn momenteel slechts 2 extramurale woonzorglocaties actief met in totaal 60 plaatsen. Dit staat in schril contrast met de vraag. Er zijn 21 intramurale locaties met 1.314 plaatsen, maar het intramurale aanbod biedt onvoldoende antwoord op de groeiende extramurale vraag.',
          },
        },
        {
          id: 'e4-2',
          type: 'comparison_table',
          title: 'Extramurale woonzorglocaties gemeente Eindhoven',
          data: {
            columns: [
              'Naam',
              'Aanbieder',
              'Eenheden',
              'Energielabel',
              'Woonlasten/mnd',
            ],
            rows: [
              {
                cells: [
                  'Zorgvilla Weisshorn',
                  'Claris Zorggroep',
                  '26',
                  'A+',
                  '€ 4.250+',
                ],
                highlight: false,
              },
              {
                cells: ['Philomenahof', 'ComforZorg', '34', '–', '€ 3.180+'],
                highlight: false,
              },
              {
                cells: [
                  'Nieuw initiatief (Orionstraat)',
                  'Sonneborgh / Zavier',
                  '43',
                  'A++',
                  'n.t.b.',
                ],
                highlight: true,
              },
            ],
            note: 'Highlighted: nieuwe ontwikkeling in het onbediende middensegment',
          },
        },
      ],
    },
    {
      id: 's5',
      title: 'Conclusies',
      type: 'content',
      elements: [
        {
          id: 'e5-1',
          type: 'bullet_list',
          title: 'Belangrijkste bevindingen',
          data: {
            items: [
              'De ontwikkeling van 43 woonzorgeenheden aan de Orionstraat is zeer kansrijk gezien het structurele tekort.',
              'Het extramuraal Wlz-tekort loopt op van -248 plaatsen (2022) naar -1.264 plaatsen (2050).',
              'Slechts 60 extramurale plaatsen beschikbaar in de gehele gemeente Eindhoven.',
              '55% van huishoudens met hoofdverdiener 65+ heeft een middel of hoog inkomen — voldoende financiële draagkracht.',
              'Overheidsbeleid stuurt actief op extramuralisering van Wlz-zorg, wat de vraag verder vergroot.',
              'De combinatie van beperkt aanbod en sterk groeiende vraag elimineert commercieel risico voor een goed gepositioneerde nieuwe locatie.',
            ],
          },
        },
      ],
    },
  ],
}

// ─── Report 2: Marktpotentie Particuliere Woonzorg (Wilgenboom) ───────────────

export const marktpotentieWoonzorg: Report = {
  id: 'mock-report-2',
  name: 'Marktpotentie Particuliere Woonzorg Eindhoven',
  status: 'draft',
  sections: [
    {
      id: 's1',
      title: 'Managementsamenvatting',
      type: 'executive_summary',
      elements: [
        {
          id: 'e1-1',
          type: 'stat_card',
          data: {
            items: [
              {
                label: 'Groei 80+ Eindhoven tot 2050',
                value: '+112%',
                unit: '',
                trendPositive: false,
              },
              { label: 'Mediaan vermogen 65+', value: '€ 246.000', unit: '' },
              {
                label: 'Onbediend prijssegment',
                value: '€3.000–€3.800',
                unit: '/maand',
              },
              {
                label: 'Extramuraal tekort 2050',
                value: '1.145',
                unit: 'plaatsen',
                trendPositive: false,
              },
            ],
          },
        },
        {
          id: 'e1-2',
          type: 'text_block',
          data: {
            content:
              'Wilgenboom heeft een strategisch marktonderzoek uitgevoerd naar de haalbaarheid van hoogwaardige particuliere woonzorg in de regio Brainport Eindhoven. De centrale bevinding: er bestaat een significant en volledig onbediend marktsegment in het prijsbereik €3.000–€3.800 per maand.\n\nDe cohort 80+ groeit van 8.200 (2025) naar 17.400 (2050) — een stijging van 112%. Zuidoost-Brabant heeft de hoogste wachtdruk voor verpleeghuiszorg van heel Nederland. Het mediaan vermogen van 65-plussers bedraagt €246.000, waarbij 61% meer dan €100.000 vermogen heeft. De financiële draagkracht voor middensegment woonzorg is daarmee ruimschoots aanwezig.\n\nAdvies: start met 24–30 appartementen van 45–55 m² in het segment €3.200–€3.600 all-in per maand, bij voorkeur in Woensel-Noord, Tongelre of Gestel.',
          },
        },
      ],
    },
    {
      id: 's2',
      title: 'Locatieanalyse',
      type: 'content',
      elements: [
        {
          id: 'e2-1',
          type: 'text_block',
          data: {
            content:
              'De wijkanalyse toont grote verschillen in vergrijzingsgraad binnen Eindhoven. Gestelse Ontginning en Achtse Molen kennen de hoogste concentratie 65-plussers (23%). Voor een woonzorglocatie is nabijheid van eerstelijnszorg, dagelijkse voorzieningen en goede bereikbaarheid essentieel. Het Stroomz-netwerk met 20 praktijken en 100 huisartsen biedt uitstekende dekking in de aanbevolen wijken.',
          },
        },
        {
          id: 'e2-2',
          type: 'data_table',
          title: 'Vergrijzing per wijk Eindhoven (2024)',
          data: {
            columns: ['Wijk', 'Inwoners', '65+', '% 65+', 'Relevantie'],
            rows: [
              ['Gestelse Ontginning', '5.420', '1.247', '23%', 'Hoog ★'],
              ['Achtse Molen', '4.180', '961', '23%', 'Hoog ★'],
              ['Oud-Tongelre', '8.950', '1.790', '20%', 'Hoog ★'],
              ['Oud-Gestel', '13.410', '2.414', '18%', 'Midden'],
              ['Oud-Stratum', '12.295', '1.844', '15%', 'Midden'],
              ['Oud-Woensel', '11.875', '1.188', '10%', 'Laag'],
            ],
            note: 'Bron: CBS Wijkmonitor 2024',
          },
        },
      ],
    },
    {
      id: 's3',
      title: 'Zorgvraagprognose',
      type: 'content',
      elements: [
        {
          id: 'e3-1',
          type: 'data_table',
          title: 'Zorgvraagprognose gemeente Eindhoven (aantal plaatsen)',
          data: {
            columns: [
              'Zorgtype',
              '2025',
              '2030',
              '2035',
              '2040',
              '2045',
              '2050',
              'Δ%',
            ],
            rows: [
              [
                'Extramuraal totaal',
                '340',
                '510',
                '720',
                '940',
                '1.120',
                '1.280',
                '+482%',
              ],
              [
                'Intramuraal totaal',
                '1.300',
                '1.470',
                '1.690',
                '1.920',
                '2.100',
                '2.200',
                '+83%',
              ],
              [
                'Totaal Wlz (24-uurs)',
                '1.640',
                '1.980',
                '2.410',
                '2.860',
                '3.220',
                '3.480',
                '+145%',
              ],
              [
                'Ambulant (Zvw)',
                '2.890',
                '3.420',
                '4.050',
                '4.680',
                '5.250',
                '5.780',
                '+136%',
              ],
            ],
            note: 'Bron: CBS bevolkingsprognose 2024, CIZ indicatiegegevens, Wilgenboom berekening',
          },
        },
        {
          id: 'e3-2',
          type: 'area_chart',
          title: 'Extramurale vraag vs. aanbod Eindhoven 2021–2050',
          data: {
            series: [
              {
                label: 'Vraag extramurale plaatsen',
                values: [220, 340, 510, 720, 940, 1120, 1280],
              },
              {
                label: 'Aanbod (gelijkblijvend scenario)',
                values: [120, 135, 135, 135, 135, 135, 135],
              },
            ],
            labels: ['2021', '2025', '2030', '2035', '2040', '2045', '2050'],
            yLabel: 'Aantal plaatsen',
          },
        },
      ],
    },
    {
      id: 's4',
      title: 'Huidig Aanbod & Concurrentie',
      type: 'content',
      elements: [
        {
          id: 'e4-1',
          type: 'text_block',
          data: {
            content:
              'Het huidige extramurale aanbod in de regio Eindhoven bestaat uit 6 locaties met in totaal 142 plaatsen. Het marktgap is groot: geen enkele aanbieder opereert in het segment €3.000–€3.800 per maand met een modern energielabel. Het budget-segment (Villa de Maalderij, €2.250) richt zich op Wlz-basisfinanciering. Het premiumsegment (Villa De Kleine Heide, €4.500–€5.425) richt zich op een andere doelgroep.',
          },
        },
        {
          id: 'e4-2',
          type: 'comparison_table',
          title: 'Concurrentieoverzicht extramurale woonzorg regio Eindhoven',
          data: {
            columns: [
              'Aanbieder',
              'm²',
              'Energielabel',
              'Prijs/mnd',
              'Segment',
            ],
            rows: [
              {
                cells: [
                  'Villa De Kleine Heide',
                  '41–83',
                  'A',
                  '€ 4.500–€ 5.425',
                  'Premium',
                ],
                highlight: false,
              },
              {
                cells: [
                  'Claris Weisshorn',
                  '35–53',
                  'A+++',
                  '€ 4.250+',
                  'Premium',
                ],
                highlight: false,
              },
              {
                cells: [
                  'Residentie Haelst (Rosorum)',
                  '25–40',
                  'C',
                  '€ 3.950–€ 5.150',
                  'Premium',
                ],
                highlight: false,
              },
              {
                cells: [
                  'Groot Bijstervelt',
                  '30–50',
                  'Monument',
                  '€ 3.950+',
                  'Premium',
                ],
                highlight: false,
              },
              {
                cells: [
                  'ONBEDIEND SEGMENT',
                  '45–55',
                  'A++',
                  '€ 3.000–€ 3.800',
                  'Midden',
                ],
                highlight: true,
              },
              {
                cells: ['Huize Populier', 'n.b.', 'C', '€ 2.685', 'Budget'],
                highlight: false,
              },
              {
                cells: [
                  'Villa de Maalderij',
                  'n.b.',
                  'A+',
                  '€ 2.250',
                  'Budget',
                ],
                highlight: false,
              },
            ],
            note: 'Highlighted: volledig onbediend marktsegment — geen enkele aanbieder actief',
          },
        },
      ],
    },
    {
      id: 's5',
      title: 'Confrontatie Vraag & Aanbod',
      type: 'content',
      elements: [
        {
          id: 'e5-1',
          type: 'data_table',
          title: 'Vraag-aanbod confrontatie Wlz extramuraal Eindhoven',
          data: {
            columns: [
              '',
              '2021',
              '2025',
              '2030',
              '2035',
              '2040',
              '2045',
              '2050',
            ],
            rows: [
              [
                'Extramurale vraag',
                '220',
                '340',
                '510',
                '720',
                '940',
                '1.120',
                '1.280',
              ],
              [
                'Extramuraal aanbod',
                '120',
                '135',
                '135',
                '135',
                '135',
                '135',
                '135',
              ],
              [
                'Extramuraal tekort',
                '-100',
                '-205',
                '-375',
                '-585',
                '-805',
                '-985',
                '-1.145',
              ],
              [
                'Intramurale vraag',
                '1.200',
                '1.300',
                '1.470',
                '1.690',
                '1.920',
                '2.100',
                '2.200',
              ],
              [
                'Intramuraal aanbod',
                '1.420',
                '1.420',
                '1.420',
                '1.420',
                '1.420',
                '1.420',
                '1.420',
              ],
              [
                'Intramuraal tekort/overschot',
                '+220',
                '+120',
                '-50',
                '-270',
                '-500',
                '-680',
                '-780',
              ],
              [
                'Totaal Wlz tekort/overschot',
                '+120',
                '-85',
                '-425',
                '-855',
                '-1.305',
                '-1.665',
                '-1.925',
              ],
            ],
            note: 'Scenario: gelijkblijvend aanbod. Bron: CBS, CIZ, Wilgenboom berekening',
          },
        },
      ],
    },
    {
      id: 's6',
      title: 'Conclusies & Aanbevelingen',
      type: 'content',
      elements: [
        {
          id: 'e6-1',
          type: 'text_block',
          data: {
            content:
              'Op basis van het marktonderzoek adviseert Wilgenboom een ontwikkeling in het middensegment die inspeelt op de combinatie van groeiende vraag, onbediend prijssegment en sterke financiële draagkracht van de doelgroep. Het woningvermogen van 65-plussers in Eindhoven (mediaan WOZ €530.000 in topwijken) maakt financiering van €3.200–€3.600 per maand over een periode van 15–20 jaar uit eigen vermogen haalbaar.',
          },
        },
        {
          id: 'e6-2',
          type: 'bullet_list',
          title: 'Strategische aanbevelingen',
          data: {
            items: [
              'Ontwikkel 24–30 appartementen van 45–55 m² in het segment €3.200–€3.600 all-in per maand.',
              'Kies een locatie in Gestelse Ontginning, Achtse Molen of Oud-Tongelre (hoogste vergrijzingsgraad).',
              'Energielabel A++ is een randvoorwaarde — lagere servicekosten en toekomstbestendigheid.',
              'Positioneer als "beste werkgever" in de regio om personeelstekort te beperken.',
              'Investeer in zichtbaarheid via het Stroomz-netwerk (100 huisartsen, 20 praktijken in Eindhoven).',
              'Ontwikkel het wervingsplan voor personeel parallel aan de bouwplanontwikkeling.',
              'Bij gelijkblijvend aanbod groeit het extramurale tekort naar 1.145 plaatsen in 2050 — structurele ruimte voor meerdere initiatieven.',
            ],
          },
        },
      ],
    },
  ],
}

export const mockReports: Report[] = [
  marktanalyseEindhoven,
  marktpotentieWoonzorg,
]
