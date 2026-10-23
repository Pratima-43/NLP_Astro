import { AstrologyResult } from '@/types';

export const mockAstrologyResult: AstrologyResult = {
  zodiacSign: {
    name: 'Leo (Simha)',
    symbol: '♌',
    element: 'Fire',
    rulingPlanet: 'Sun (Surya)',
    dateRange: 'Jul 23 - Aug 22',
    traits: ['Leadership', 'Creative', 'Generous', 'Dramatic', 'Confident'],
  },
  ascendant: 'Scorpio (Vrishchika)',
  moonSign: 'Cancer (Karka)',
  sunSign: 'Leo (Simha)',
  planetPositions: [
    {
      planet: 'Sun',
      sign: 'Leo',
      house: 1,
      degree: "15°23'",
      retrograde: false,
    },
    {
      planet: 'Moon',
      sign: 'Cancer',
      house: 9,
      degree: "22°45'",
      retrograde: false,
    },
    {
      planet: 'Mars',
      sign: 'Aries',
      house: 6,
      degree: "8°12'",
      retrograde: false,
    },
    {
      planet: 'Mercury',
      sign: 'Virgo',
      house: 11,
      degree: "3°56'",
      retrograde: false,
    },
    {
      planet: 'Jupiter',
      sign: 'Sagittarius',
      house: 2,
      degree: "18°34'",
      retrograde: false,
    },
    {
      planet: 'Venus',
      sign: 'Libra',
      house: 12,
      degree: "27°11'",
      retrograde: false,
    },
    {
      planet: 'Saturn',
      sign: 'Capricorn',
      house: 3,
      degree: "12°08'",
      retrograde: true,
    },
    {
      planet: 'Rahu',
      sign: 'Gemini',
      house: 8,
      degree: "19°42'",
      retrograde: true,
    },
    {
      planet: 'Ketu',
      sign: 'Sagittarius',
      house: 2,
      degree: "19°42'",
      retrograde: true,
    },
  ],
  houses: [
    {
      number: 1,
      sign: 'Leo',
      significance: 'Self, Physical Body, Vitality & Personal Outlook',
      planets: ['Sun'],
    },
    {
      number: 2,
      sign: 'Virgo',
      significance: 'Wealth, Speech, Family Assets & Values',
      planets: ['Jupiter', 'Ketu'],
    },
    {
      number: 3,
      sign: 'Libra',
      significance: 'Courage, Siblings, Communication & Fine Arts',
      planets: ['Saturn (R)'],
    },
    {
      number: 4,
      sign: 'Scorpio',
      significance: 'Mother, Home, Emotional Foundation & Inner Peace',
      planets: [],
    },
    {
      number: 5,
      sign: 'Sagittarius',
      significance: 'Intelligence, Creativity, Children & Past Merits (Purva Punya)',
      planets: [],
    },
    {
      number: 6,
      sign: 'Capricorn',
      significance: 'Health, Overcoming Obstacles, Service & Competitive Drive',
      planets: ['Mars'],
    },
    {
      number: 7,
      sign: 'Aquarius',
      significance: 'Partnerships, Marriage, Public Relations & Business Alliances',
      planets: [],
    },
    {
      number: 8,
      sign: 'Pisces',
      significance: 'Transformation, Occult Knowledge, Longevity & Intuitive Depth',
      planets: ['Rahu'],
    },
    {
      number: 9,
      sign: 'Aries',
      significance: 'Dharma, Higher Learning, Philosophy & Divine Grace',
      planets: ['Moon'],
    },
    {
      number: 10,
      sign: 'Taurus',
      significance: 'Career, Status, Public Standing & Executive Ambition',
      planets: [],
    },
    {
      number: 11,
      sign: 'Gemini',
      significance: 'Gains, Aspirations, Social Networks & Mentorship',
      planets: ['Mercury'],
    },
    {
      number: 12,
      sign: 'Cancer',
      significance: 'Subconscious, Liberation (Moksha), Foreign Lands & Solitude',
      planets: ['Venus'],
    },
  ],
  nakshatra: {
    name: 'Purva Phalguni',
    lord: 'Venus',
    pada: 2,
    deity: 'Bhaga (God of Prosperity and Delight)',
    description:
      'Purva Phalguni is symbolized by the front legs of a hammock or bed, representing relaxation, rejuvenation, artistic refinement, and social charisma. Ruled by Venus and presiding over the sign of Leo, individuals born under this nakshatra exude magnetic charm, generous warmth, and an innate capacity to lead through inspiration and creative excellence rather than mere authority.',
  },
  dashaOverview: [
    {
      planet: 'Venus (Shukra)',
      startDate: '2018-04-12',
      endDate: '2038-04-12',
      isActive: true,
      description:
        'A major 20-year period centered on creative fulfillment, relationship evolution, aesthetic mastery, and financial expansion. Cultivate deep harmony and value-driven projects.',
    },
    {
      planet: 'Sun (Surya)',
      startDate: '2038-04-12',
      endDate: '2044-04-12',
      isActive: false,
      description:
        'A 6-year epoch of heightened authority, public prominence, career zenith, and profound self-actualization as your natural solar vitality takes center stage.',
    },
    {
      planet: 'Moon (Chandra)',
      startDate: '2044-04-12',
      endDate: '2054-04-12',
      isActive: false,
      description:
        'A 10-year cycle emphasizing emotional tranquility, intuitive mastery, family legacy, philanthropic contributions, and spiritual pilgrimages.',
    },
    {
      planet: 'Mars (Mangala)',
      startDate: '2054-04-12',
      endDate: '2061-04-12',
      isActive: false,
      description:
        'A decisive 7-year phase characterized by focused executive action, institutional leadership, property investments, and the elimination of lingering obstacles.',
    },
    {
      planet: 'Rahu',
      startDate: '2061-04-12',
      endDate: '2079-04-12',
      isActive: false,
      description:
        'An intense 18-year period of unconventional breakthroughs, global travels, technological innovation, and deep exploration of metaphysical mysteries.',
    },
  ],
  horoscope: {
    daily: {
      period: 'daily',
      sign: 'Leo (Simha)',
      prediction:
        'Solar alignments today amplify your natural communicative flair and creative instinct. A strategic conversation this afternoon opens unexpected pathways for collaborative ventures. Prioritize clarity in professional exchanges.',
      luckyNumber: 7,
      luckyColor: 'Royal Gold',
      rating: 5,
    },
    weekly: {
      period: 'weekly',
      sign: 'Leo (Simha)',
      prediction:
        'With Mercury transiting favorably through your gain sector and the Moon illuminating intuitive realms, this week favors conceptual design, contract renegotiations, and resolving past family misunderstandings with graceful firmness.',
      luckyNumber: 3,
      luckyColor: 'Amber Saffron',
      rating: 4,
    },
    monthly: {
      period: 'monthly',
      sign: 'Leo (Simha)',
      prediction:
        'A potent monthly cycle under your ruling Sun urges you to step boldly into mentorship or strategic planning roles. Financial discipline combined with intuitive market timing yields tangible long-term stability.',
      luckyNumber: 1,
      luckyColor: 'Deep Crimson',
      rating: 5,
    },
  },
  careerInsights: [
    {
      title: 'Visionary Leadership & Executive Command',
      description:
        'Sun positioned in the 1st house in fiery Leo bestows an unmistakable commanding presence. You thrive in positions where you define strategic vision, inspire collective morale, and steer creative or entrepreneurial directions.',
      icon: 'Crown',
    },
    {
      title: 'Aesthetic Innovation & Creative Directorship',
      description:
        'With Venus ruling your Purva Phalguni nakshatra alongside an exalted Mercury in the 11th house, your intellect blends computational logic with high aesthetic sensibility, ideal for design, media, architecture, and technology ventures.',
      icon: 'Palette',
    },
    {
      title: 'Long-Term Fiscal Strategy & Resource Governance',
      description:
        'Jupiter conjunct Ketu in the 2nd house of assets encourages ethical accumulation and diversified investments. You achieve lasting wealth through disciplined, value-accretive initiatives rather than speculative ventures.',
      icon: 'TrendingUp',
    },
  ],
  relationshipInsights: [
    {
      title: 'Loyalty Rooted in Mutual Admiration',
      description:
        'Your solar heart values unwavering devotion and sincere admiration. You flourish in relationships where both partners celebrate each other’s personal victories and offer unconditional emotional bedrock.',
      icon: 'HeartHandshake',
    },
    {
      title: 'Passionate Expression Balanced with Playfulness',
      description:
        'Purva Phalguni inspires delightful romantic warmth, affectionate generosity, and shared celebratory moments. You view romance as a sacred art of mutual adoration and joyful living.',
      icon: 'Sparkles',
    },
    {
      title: 'Protective Family Stewardship',
      description:
        'With Cancer Moon nestled in the 9th house, your family ties are held with philosophical reverence. You intuitively protect family welfare and impart foundational moral principles to future generations.',
      icon: 'Shield',
    },
  ],
  generalInsights: [
    {
      title: 'Vitality, Cardiovascular & Solar Energy Alignment',
      description:
        'As a Leo native with Mars in the 6th house, regular cardiovascular movement, sun salutations, and mindful hydration maintain your vibrant baseline. Watch for work-induced nervous fatigue.',
      icon: 'Activity',
    },
    {
      title: 'Spiritual Maturation & Philosophical Reflection',
      description:
        'The 9th house Cancer Moon grants an innate mystical receptivity. Periods of silent contemplation, nature retreats, and sacred literature study restore your energetic equilibrium.',
      icon: 'Moon',
    },
    {
      title: 'Life Purpose: The Generous Architect',
      description:
        'Your chart reflects the archetype of the Generous Architect: one tasked with constructing meaningful structures, empowering others to lead, and leaving behind a luminous cultural and human legacy.',
      icon: 'Compass',
    },
  ],
};
