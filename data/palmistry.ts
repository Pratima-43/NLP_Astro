import { PalmistryResult } from '@/types';

export const mockPalmistryResult: PalmistryResult = {
  heartLine: {
    name: 'Heart Line (Emotional Vector)',
    description: 'Traverses horizontally beneath the mounts at the base of the fingers.',
    interpretation:
      'Originating between the index and middle fingers and curving gently toward the Mount of Jupiter, your heart line indicates profound emotional depth, selective vulnerability, and enduring loyalty once trust is earned. You perceive relationships as sacred covenants, demanding emotional honesty and reciprocal devotion.',
    length: 'Long',
    depth: 'Deep',
    characteristics: [
      'Curved upward toward Jupiter mount',
      'Deep, unblemished impression in mid-section',
      'Delicate branch terminations indicating empathetic listening',
    ],
  },
  headLine: {
    name: 'Head Line (Intellectual Vector)',
    description: 'Extends across the mid-palm representing mental agility and cognitive style.',
    interpretation:
      'A clear, gently sloping head line reaching toward the upper Mount of Moon demonstrates a harmonious synthesis of analytical logic and imaginative intuition. Rather than choosing between facts and feelings, you evaluate complex problems through both empirical reasoning and holistic pattern recognition.',
    length: 'Medium',
    depth: 'Moderate',
    characteristics: [
      'Gentle slope toward the lunar mount',
      'Unbroken trajectory indicating sustained mental focus',
      'Clear fork (Writer’s Fork) near termination denoting verbal eloquence',
    ],
  },
  lifeLine: {
    name: 'Life Line (Vitality & Resilience Vector)',
    description: 'Encircles the Mount of Venus, charting vitality, resilience, and lifestyle grounding.',
    interpretation:
      'Tracing a wide, robust arc around the base of the thumb, your life line signals immense reserve vitality, restorative physical resilience, and a deep appreciation for life’s sensory pleasures. Even during demanding professional stretches, your body rebounds swiftly through rest and quiet grounding.',
    length: 'Long',
    depth: 'Deep',
    characteristics: [
      'Expansive sweep maximizing Venusian territory',
      'Crisp clarity without cross-cutting islands',
      'Upward striving branches marking milestone career initiatives',
    ],
  },
  fateLine: {
    name: 'Fate Line (Saturn Line of Purpose)',
    description: 'Rises vertically through the center of the palm toward the Mount of Saturn.',
    interpretation:
      'Beginning distinctly around the mid-palm after age 25, the fate line indicates a self-fashioned destiny rather than an inherited career track. It reflects deliberate pivots, self-directed milestones, and progressive autonomy in your professional realm.',
    length: 'Medium',
    depth: 'Light',
    characteristics: [
      'Emerges from the lunar quadrant indicating success through public engagement',
      'Becomes increasingly defined after age 28',
      'Direct connection with creative and communicative projects',
    ],
  },
  mounts: [
    {
      name: 'Mount of Jupiter',
      location: 'Beneath the index finger',
      significance: 'Ambition, Leadership, Wisdom & Dignity',
      reading:
        'Well-developed and firm, indicating natural command, high moral integrity, and an inclination to mentor others with warmth and authoritative guidance.',
    },
    {
      name: 'Mount of Saturn',
      location: 'Beneath the middle finger',
      significance: 'Discipline, Solitude, Prudence & Perseverance',
      reading:
        'Balanced elevation without excess padding, denoting reflective seriousness, philosophical introspection, and the patience to build lasting institutions.',
    },
    {
      name: 'Mount of Apollo (Sun)',
      location: 'Beneath the ring finger',
      significance: 'Creativity, Charisma, Aesthetics & Public Recognition',
      reading:
        'Moderately raised with fine vertical rays, pointing to refined aesthetic discernment, an appreciation for music and visual arts, and subtle charismatic appeal.',
    },
    {
      name: 'Mount of Mercury',
      location: 'Beneath the little finger',
      significance: 'Commerce, Communication, Persuasion & Wit',
      reading:
        'Prominent and clear, suggesting swift commercial instincts, eloquent verbal framing, and agility in translating technical concepts into accessible language.',
    },
    {
      name: 'Mount of Venus',
      location: 'At the base of the thumb',
      significance: 'Vitality, Love, Passion & Sensory Refinement',
      reading:
        'Full, warm, and elevated, reflecting generous social hospitality, passionate romantic ardor, and a deep love for comfortable, beautiful environments.',
    },
    {
      name: 'Mount of Moon (Luna)',
      location: 'Base of the palm opposite the thumb',
      significance: 'Intuition, Imagination, Subconscious Mind & Travel',
      reading:
        'Broad and softly rounded, indicating a prolific imaginative life, receptive psychic antennae, and frequent yearnings for journeys near water or abroad.',
    },
    {
      name: 'Mount of Mars (Upper & Lower)',
      location: 'Inner edge below index (Lower) and outer edge between Mercury and Moon (Upper)',
      significance: 'Courage, Resilience, Tenacity & Moral Fortitude',
      reading:
        'Lower Mars denotes active initiative and pioneering drive, while well-padded Upper Mars demonstrates steadfast calm during disputes and immense mental perseverance.',
    },
  ],
  handShape: {
    type: 'Water Hand',
    element: 'Water',
    description:
      'Characterized by an elongated, rectangular palm and slender, flexible fingers with soft, supple skin texture. The water hand symbolizes deep emotional receptivity, perceptive intuition, aesthetic sensitivity, and a rich internal realm.',
    traits: [
      'Highly Intuitive & Perceptive',
      'Aesthetically Sensitive & Creative',
      'Emotionally Responsive & Empathetic',
      'Need for Calming, Harmonious Environments',
    ],
  },
  fingerAnalysis: [
    {
      finger: 'Index Finger (Jupiter)',
      trait: 'Visionary Leadership & Moral Stance',
      reading:
        'Straight and balanced in proportion to the palm, signaling an ethical leadership demeanor that inspires consensus rather than demanding blind obedience.',
    },
    {
      finger: 'Middle Finger (Saturn)',
      trait: 'Responsibility & Philosophical Equilibrium',
      reading:
        'Sturdy, erect, and well-aligned, indicating a solemn respect for ethical boundaries, rigorous accountability, and dedication to long-term commitments.',
    },
    {
      finger: 'Ring Finger (Apollo)',
      trait: 'Creativity & Aesthetic Expression',
      reading:
        'Gracefully tapered with a well-developed second phalange, representing refined aesthetic taste, artistic sensibility, and self-expression through creative media.',
    },
    {
      finger: 'Little Finger (Mercury)',
      trait: 'Communication & Strategic Articulation',
      reading:
        'Reaching comfortably above the top knuckle of the ring finger, this denotes exceptional communicative poise, persuasive storytelling, and quick commercial acumen.',
    },
  ],
  careerTendencies: [
    'Strategic Leadership in creative, technology, or research-driven enterprises',
    'Creative Writing, Content Directorship, and Visual Narrative Design',
    'Consulting roles demanding cross-functional synthesis and empathetic diplomacy',
    'Independent entrepreneurial ventures where visionary freedom is prioritized',
  ],
  personalTendencies: [
    'Deep emotional loyalty paired with a healthy requirement for sacred personal solitude',
    'Instinctive attunement to unspoken micro-expressions and atmospheric group dynamics',
    'Generous hospitality toward trusted confidants and kindred spirits',
    'Periodic withdrawal to tranquil spaces to recharge mental and physical vitality',
  ],
  generalReport:
    'Your chirological topography displays a quintessential Water Hand architecture enriched by an expansive Mount of Venus and an intuitive Mount of Moon. The convergence of a long, upward-curving Heart Line and a gently sloping Head Line equipped with a writer\'s fork reveals an individual whose emotional instincts and intellectual capabilities operate in sophisticated synergy.\n\nWhile the hand structure emphasizes inner depth, emotional discernment, and solitary contemplation, the prominent Mercury Mount and extended little finger confer persuasive communicative fluency and commercial acumen. Your palms reflect the journey of an intuitive architect: one who perceives unseen connections, transforms deep feelings into tangible creative works, and leads others with integrity, elegance, and quiet inner certainty.',
};
