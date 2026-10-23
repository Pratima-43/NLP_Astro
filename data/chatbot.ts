import { mockAstrologyResult } from '@/data/astrology';
import { mockNumerologyResult } from '@/data/numerology';
import { mockPalmistryResult } from '@/data/palmistry';
import { mockCombinedReport } from '@/data/combinedReport';

export const suggestedQuestions: string[] = [
  'How do my Vedic astrology chart and Life Path number align?',
  'What do my palm lines reveal about my career trajectory?',
  'Where do my three systems agree the most?',
  'Why is there a conflict between my Leo Sun and Life Path 7?',
  'What is my focus for this week based on planetary transits?',
  'How does my current Venus Dasha impact my relationships?',
  'What numbers and signs am I most compatible with?',
  'What guidance does my combined report give for starting new ventures?',
];

export const chatResponses: Record<string, string> = {
  combined:
    'Your combined AstroVerse reading reveals a remarkable synergy between your Leo Sun in the 1st House, Life Path 7, and Water Hand. While your astrology awards you executive charisma and leadership instincts, your numerology grounds you in deep analytical truth-seeking, and your palmistry reflects heightened emotional empathy and creative precision. Together, they depict an "Intuitive Architect" who leads by inspiring others through original ideas rather than brute authority.',

  agreements:
    'All three systems agree on three central pillars of your life: extraordinary intuitive perception, profound creative storytelling gifts, and long-term disciplined wealth accumulation. Your Cancer Moon in the 9th house, Life Path 7, and Water Hand all verify that your intuitive gut instincts are remarkably accurate. Furthermore, your Purva Phalguni nakshatra, Destiny Number 3, and the palm\'s Writer\'s Fork unanimously highlight your ability to articulate complex thoughts into compelling creative works.',

  conflicts:
    'The most prominent apparent tension lies between your fiery Leo Sun in the 1st House and your contemplative Life Path 7 (supported by your sensitive Water Hand). Your astrology points toward radiant outward expression and public visibility, while numerology and palmistry highlight a profound need for solitude, quiet research, and emotional sanctuary. The resolution is "selective spotlighting": you flourish by stepping into public thought leadership to share your work, but guarding your private downtime fiercely to avoid sensory exhaustion.',

  career:
    'Your career blueprint synthesizes executive authority with creative authorship. Vedic astrology places the Sun in your 1st house in Leo for visionary leadership; numerology provides the analytical depth of Life Path 7 alongside the narrative charisma of Destiny 3; and your palm showcases a defined fate line starting in the lunar sector alongside an elevated Mercury mount. You are exceptionally suited for Creative Directorship, Strategic Technology Architecture, Research Leadership, or founding visionary independent ventures.',

  relationship:
    'In love, your systems emphasize deep emotional integrity, mutual admiration, and respectful boundaries. With your Moon in Cancer in the 9th house and a long, upward-curving Heart Line touching the Jupiter mount, you offer profound loyalty and seek an intellectual and spiritual equal. Numerologically, as a Life Path 7 with a 9 Soul Urge, you connect best with partners vibrating to numbers 3, 5, or 7 who celebrate your independence and share your passion for meaningful growth.',

  love:
    'Your romantic profile combines fiery Leo warmth with the deep, protective devotion of a Cancer Moon and an upward-reaching Heart Line. You do not engage in superficial connections; you view love as a sacred alliance requiring mutual respect and shared ideals. Because your active Venus Dasha (2018–2038) is currently governing your chart, this 20-year cycle brings significant relationship maturation, emotional deepening, and genuine harmony.',

  astrology:
    'In Vedic Astrology, you are a Leo Sun (Simha) with a Scorpio Ascendant (Vrishchika) and Cancer Moon (Karka) in the 9th house of Dharma and higher learning. Your birth nakshatra is Purva Phalguni (ruled by Venus and the deity Bhaga), giving you charismatic warmth, aesthetic taste, and natural magnanimity. You are currently in the expansive 20-year Vimshottari Venus Dasha (2018–2038), which strongly activates your creative, financial, and relational sectors.',

  chart:
    'Your birth chart features Sun in Leo in the 1st house granting vitality, an exalted Mercury in Virgo in the 11th house of gains, and Jupiter with Ketu in Sagittarius in the 2nd house of wealth. Mars in Aries in the 6th house gives you the stamina to overcome obstacles, while Saturn retrograde in Capricorn in the 3rd house builds methodical persistence in communication. Your planetary alignment supports enduring status achieved through disciplined intellectual and creative enterprise.',

  birth:
    'Based on your birth parameters (August 15, 1998 at 05:30 AM in Jaipur, Rajasthan), you were born at dawn with the Sun rising in its own sign of Leo. This dawn configuration imbues you with high solar vitality, natural leadership traits, and a lifelong calling to illuminate others through your ideas and actions.',

  numerology:
    'Your numerological matrix is governed by Life Path 7 (The Seeker), Destiny Number 3 (The Communicator), and Soul Urge 9 (The Humanitarian). This creates a fascinating balance: you have the introspective intellect of a philosopher (7), the charismatic expressive gift of a creator (3), and the altruistic heart of a reformer (9). Your birthday 14 reduces to 5, granting you agility, while your current Personal Year 1 marks an auspicious time for bold new beginnings.',

  lifepath:
    'As a Life Path 7, your journey centers on seeking fundamental truths, cultivating spiritual wisdom, and understanding the deeper mechanics of life. You possess an innate analytical mind that pierces through superficiality, excelling in research, philosophy, and system architecture. Your main life lesson is balancing solitary introspection with open-hearted engagement with the world.',

  number:
    'Your primary vibrational numbers are 7 (Life Path), 3 (Destiny/Expression), 9 (Soul Urge), 5 (Personality & Birthday 14/5), and 1 (Current Personal Year). Your lucky numbers are 7, 16, 25, and 34. Currently operating in Personal Year 1, the universe urges you to take decisive personal initiative, start key projects, and establish your independence.',

  palmistry:
    'Your palms reveal a classic Water Hand structure with an elongated palm and sensitive, flexible fingers, denoting heightened intuition, emotional depth, and aesthetic discernment. Your clear Head Line features a classic "Writer\'s Fork" descending toward the Mount of Moon, signaling a mind that effortlessly marries analytical rigor with imaginative storytelling. Your well-padded Venus and Mercury mounts confirm warmth, vitality, and commercial fluency.',

  palm:
    'Examining your palm topography, your Heart Line is long and curves upward toward the Jupiter mount, reflecting high romantic standards and enduring loyalty. Your Life Line sweeps widely around the thumb, showing resilient vitality and stamina, while your Fate Line gains sharp definition from the lunar quadrant after age 25. The prominent Mercury mount beneath the little finger denotes exceptional persuasive speaking and writing acumen.',

  compatibility:
    'Numerologically, as a Life Path 7, you are most compatible with numbers 3, 5, and 7. Number 3s bring joyful expressive energy that helps you share your thoughts, 5s match your intellectual curiosity and desire for freedom, and fellow 7s respect your need for contemplative silence. In astrology, your Leo Sun and Cancer Moon harmonize well with fellow Fire and Water signs who offer both passionate encouragement and emotional safety.',

  week:
    'For this week, planetary transits highlight Mercury\'s harmonious movement through your gain sector and the Moon stimulating your intuitive 9th house. This is an exceptional week for conceptualizing creative projects, finalizing proposals, and engaging in strategic planning. Your lucky color for the week is Amber Saffron, your lucky number is 3, and your energy rating is 4 out of 5.',

  focus:
    'Your primary focus right now should be aligning with your Personal Year 1 energy: plant seeds for long-term aspirations. Because you are simultaneously navigating your Venus Dasha, prioritize creative ventures, design refinement, and partnerships built on mutual respect. Take time in the mornings for quiet mental grounding to let your Life Path 7 intuition guide your daily decisions.',

  health:
    'Your physical vitality is sustained by the solar fire of Leo combined with the grounding endurance of Mars in the 6th house. Your sensitive Water Hand and Cancer Moon, however, make your digestive system and nervous equilibrium sensitive to sustained stress or noisy environments. Regular cardiovascular exercise, clean hydration, and dedicated periods of daily quiet meditation are your primary remedies.',

  growth:
    'Your personal and spiritual growth accelerates when you bridge the gap between solitary study and public expression. Avoid the Life Path 7 trap of cynical isolation by leaning into your Destiny 3 gift of creative sharing. Ground yourself through artistic expression, honor your emotional sensitivity as a diagnostic superpower, and celebrate your milestone victories openly.',

  outOfScope:
    'As AstroVerse’s AI Astrologer, I specialize exclusively in Vedic astrology, numerology, palmistry, and your personalized combined readings. I cannot provide assistance with general computer code, general world trivia, medical diagnoses, or unrelated tasks. How can I guide you regarding your birth chart, numbers, or hand lines today?',

  default:
    'That is a thoughtful inquiry. According to your combined AstroVerse profile—bridging your Leo Sun, Purva Phalguni nakshatra, Life Path 7, and Water Hand palm structure—your strengths lie in synthesizing deep intuition with creative leadership. You are currently positioned in your expansive Venus Dasha and Personal Year 1, creating an auspicious window for intentional new beginnings. Would you like to explore how this influences your career, relationships, or personal growth?',
};

export function getMatchedResponse(message: string): string {
  if (!message || message.trim().length === 0) {
    return chatResponses.default;
  }

  const clean = message.toLowerCase().trim();

  // 1. Check for out-of-scope non-astrological queries
  const outOfScopePatterns = [
    'write code',
    'python',
    'javascript',
    'typescript',
    'html',
    'css',
    'sql',
    'debug',
    'weather in',
    'recipe',
    'cook',
    'stock price',
    'crypto',
    'bitcoin',
    'homework',
    'math equation',
    'who won',
    'sports score',
  ];
  if (outOfScopePatterns.some((pattern) => clean.includes(pattern))) {
    return chatResponses.outOfScope;
  }

  // 2. Check for cross-system / combined keywords first
  if (
    clean.includes('agree') ||
    clean.includes('agreement') ||
    clean.includes('concur') ||
    clean.includes('common') ||
    clean.includes('overlap')
  ) {
    return chatResponses.agreements;
  }

  if (
    clean.includes('disagree') ||
    clean.includes('conflict') ||
    clean.includes('contradict') ||
    clean.includes('oppose') ||
    clean.includes('difference')
  ) {
    return chatResponses.conflicts;
  }

  if (
    clean.includes('combined') ||
    clean.includes('synthesis') ||
    clean.includes('overview') ||
    clean.includes('all three') ||
    clean.includes('together') ||
    clean.includes('holistic') ||
    clean.includes('triad')
  ) {
    return chatResponses.combined;
  }

  // 3. Module-specific keywords
  // Palmistry
  if (
    clean.includes('palmistry') ||
    clean.includes('palm') ||
    clean.includes('hand') ||
    clean.includes('mount') ||
    clean.includes('fate line')
  ) {
    if (clean.includes('career') || clean.includes('work')) {
      return chatResponses.career;
    }
    return chatResponses.palmistry;
  }

  // Numerology
  if (
    clean.includes('life path') ||
    clean.includes('lifepath') ||
    clean.includes('seeker')
  ) {
    return chatResponses.lifepath;
  }

  if (
    clean.includes('numerology') ||
    clean.includes('soul urge') ||
    clean.includes('destiny number') ||
    clean.includes('personality number') ||
    clean.includes('personal year') ||
    clean.includes('lucky number')
  ) {
    return chatResponses.numerology;
  }

  if (clean.includes('number')) {
    return chatResponses.number;
  }

  // Astrology
  if (
    clean.includes('astrology') ||
    clean.includes('vedic') ||
    clean.includes('zodiac') ||
    clean.includes('horoscope') ||
    clean.includes('simha') ||
    clean.includes('leo') ||
    clean.includes('scorpio') ||
    clean.includes('cancer moon') ||
    clean.includes('nakshatra') ||
    clean.includes('purva phalguni') ||
    clean.includes('dasha') ||
    clean.includes('transit')
  ) {
    return chatResponses.astrology;
  }

  if (clean.includes('chart') || clean.includes('house') || clean.includes('planet')) {
    return chatResponses.chart;
  }

  if (clean.includes('birth') || clean.includes('born') || clean.includes('jaipur')) {
    return chatResponses.birth;
  }

  // 4. Thematic keywords
  if (
    clean.includes('career') ||
    clean.includes('profession') ||
    clean.includes('job') ||
    clean.includes('business') ||
    clean.includes('money') ||
    clean.includes('wealth') ||
    clean.includes('venture')
  ) {
    return chatResponses.career;
  }

  if (
    clean.includes('compatible') ||
    clean.includes('compatibility') ||
    clean.includes('match')
  ) {
    return chatResponses.compatibility;
  }

  if (
    clean.includes('relationship') ||
    clean.includes('marriage') ||
    clean.includes('partner')
  ) {
    return chatResponses.relationship;
  }

  if (
    clean.includes('love') ||
    clean.includes('romance') ||
    clean.includes('dating') ||
    clean.includes('heart')
  ) {
    return chatResponses.love;
  }

  if (
    clean.includes('week') ||
    clean.includes('weekly') ||
    clean.includes('today') ||
    clean.includes('daily')
  ) {
    return chatResponses.week;
  }

  if (
    clean.includes('focus') ||
    clean.includes('advice') ||
    clean.includes('action') ||
    clean.includes('priority')
  ) {
    return chatResponses.focus;
  }

  if (
    clean.includes('health') ||
    clean.includes('vitality') ||
    clean.includes('energy') ||
    clean.includes('body')
  ) {
    return chatResponses.health;
  }

  if (
    clean.includes('growth') ||
    clean.includes('spiritual') ||
    clean.includes('evolution') ||
    clean.includes('lesson')
  ) {
    return chatResponses.growth;
  }

  // 5. Default fallback
  return chatResponses.default;
}
