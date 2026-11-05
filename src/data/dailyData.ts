export interface DailyDataInfo {
  day: string;
  planet: string;
  planetIcon: string;
  colour: string;
  colourHex: string;
  colourBg: string;
  grain: string;
  quality: string;
  activity: string;
  activityIcon: string;
  activityDesc: string;
}

export const DAILY_DATA: Record<number, DailyDataInfo> = {
  0: { day: 'Sunday', planet: 'Sun', planetIcon: '☉', colour: 'White · Gold', colourHex: '#c9a84c', colourBg: '#fdfcf7', grain: 'Wheat', quality: 'Light · Warmth · Clarity', activity: 'Rest & Family', activityIcon: '✦', activityDesc: 'A day of rest, family and the living world outside' },
  1: { day: 'Monday', planet: 'Moon', planetIcon: '☽', colour: 'Purple · Violet', colourHex: '#7a4a9e', colourBg: '#f3eef8', grain: 'Rice', quality: 'Rhythm · Reflection · Flow', activity: 'Bread Making Day', activityIcon: '✦', activityDesc: 'Grinding grain · kneading dough · baking bread together' },
  2: { day: 'Tuesday', planet: 'Mars', planetIcon: '♂', colour: 'Red · Crimson', colourHex: '#b83030', colourBg: '#fdf0f0', grain: 'Barley', quality: 'Courage · Strength · Will', activity: 'Painting Day', activityIcon: '✦', activityDesc: 'Wet-on-wet watercolour · colour stories · singing while painting' },
  3: { day: 'Wednesday', planet: 'Mercury', planetIcon: '☿', colour: 'Yellow', colourHex: '#c9a010', colourBg: '#fdfae8', grain: 'Millet', quality: 'Lightness · Clarity · Exchange', activity: 'Handwork Day', activityIcon: '✦', activityDesc: 'Beeswax · knitting · simple sewing · nature crafts · wool work · wood sanding' },
  4: { day: 'Thursday', planet: 'Jupiter', planetIcon: '♃', colour: 'Orange', colourHex: '#d4650a', colourBg: '#fdf3e8', grain: 'Rye', quality: 'Wisdom · Expansion · Truth', activity: 'Soup & Garden Day', activityIcon: '✦', activityDesc: 'Chopping vegetables · making soup · gardening · composting · caring for animals' },
  5: { day: 'Friday', planet: 'Venus', planetIcon: '♀', colour: 'Green', colourHex: '#3a7a4a', colourBg: '#eef4ef', grain: 'Oats', quality: 'Beauty · Feeling · Love', activity: 'Nature & Play Day', activityIcon: '✦', activityDesc: 'Nature walk · forest walk · picnic · eurythmy · puppet play · music and movement' },
  6: { day: 'Saturday', planet: 'Saturn', planetIcon: '♄', colour: 'Blue', colourHex: '#2a5090', colourBg: '#edf2fb', grain: 'Corn · Maize', quality: 'Structure · Depth · Earth', activity: 'Gardening & Outdoor', activityIcon: '✦', activityDesc: 'Digging, planting and tending the living earth' }
};

export interface SplashVerse {
  title: string;
  moment: string;
  text: string;
}

export const SPLASH_VERSES: SplashVerse[] = [
  { title: 'Morning — Opening', moment: 'All ages · Morning circle', text: 'Good morning, dear Earth\nGood morning, dear Sun\nGood morning, dear trees\nAnd the flowers, everyone\nGood morning, dear bees\nAnd birds in the trees\nGood morning to you\nAnd good morning to me' },
  { title: 'The Sun with Loving Light', moment: 'Rudolf Steiner · Grades 1–4', text: 'The Sun with loving light\nMakes bright for me each day\nThe soul with spirit power\nGives strength unto my limbs\nIn sunlight shining clear\nI revere, oh God\nThe strength of humankind\nWhich thou so graciously\nHast planted in my soul\nThat I with all my might\nMay love to work and learn' },
  { title: 'The Earth Is Firm', moment: 'Grades 1–3 · Morning', text: 'The earth is firm beneath my feet\nThe sun shines bright above\nAnd here I stand, so straight and strong\nAll things to know and love' },
  { title: 'Meal Blessing', moment: 'All ages · Before meals', text: 'The earth that grows for us this food\nThe sun that makes it ripe and good\nDear Earth, dear Sun, by you we live\nOur loving thanks to you we give' },
  { title: 'Morning Has Come', moment: 'All ages · Morning', text: 'Morning has come\nNight is away\nRise with the sun\nAnd welcome the day' },
  { title: 'The Earth Speaks', moment: 'Kindergarten · Nature', text: 'Down is the earth, up is the sky\nHere is my family and here am I\nThe golden sun is shining\nUp in the sky so blue\nGood morning, happy morning\nGood morning, sun, to you' },
  { title: 'Lantern Song', moment: 'Martinmas · November', text: 'I go with my little lantern\nMy lantern goes with me\nAbove the stars are shining\nBelow us shines the street\nLaterne, Laterne\nSonne, Mond und Sterne' },
  { title: 'Story Time', moment: 'Kindergarten–Grade 2 · Transition', text: 'Fairies of the story time\nCome and share your stories with me\nI am listening with my ears\nAnd I am sitting quietly' },
  { title: 'End of Day', moment: 'All ages · Closing', text: 'Now we take our love and light\nBack to mother smiling bright\nBack to mother, kind and warm\nHolding baby in their arms\nGoodbye now, goodbye!\nBlessings on our day!' },
  { title: 'Blessings on the Blossoms', moment: 'Spring · Easter', text: 'Blessings on the blossoms\nBlessings on the fruit\nBlessings on the leaves and stems\nBlessings on the root' },
  { title: 'The Stars Once Spoke', moment: 'Rudolf Steiner', text: 'The stars once spoke to man.\nIt is world destiny\nThat they are silent now.\nTo become aware of this silence\nCan bring pain to man in earthly life.\nBut in the deepening silence\nThere grows and ripens\nWhat man speaks to the stars.\nTo become aware of this speaking\nCan become strength for the spirit of man.' },
  { title: 'Grade 1 Morning Verse', moment: 'Grades 1–3 · Rudolf Steiner', text: 'I look into the world\nIn which the sun is shining\nIn which the stars are sparkling\nIn which the stones repose\n\nWhere living plants are growing\nWhere creatures, feeling, live\nWhere human beings, souled\nGive dwelling to the spirit' }
];

export interface COTSVerse {
  num: number;
  title: string;
  english: string;
}

export const COTS_VERSES: COTSVerse[] = [
  { num:1, title:"Week 1 — Easter", english:"When out of world-wide spaces\nThe sun speaks to the human mind,\nAnd joy from depths of soul\nBecomes, in seeing, one with light,\nThen rising from the sheath of self,\nThoughts soar to distances of space\nAnd dimly bind\nThe human being to the spirit's life." },
  { num:2, title:"Week 2", english:"Into the outer world of the senses\nThe power of thought must lose its separate being\nAnd spirit worlds discover\nThe human shoot once more\nWhich, finding in themselves its seed,\nYet in itself must find\nThe fruits born of the soul." },
  { num:3, title:"Week 3", english:"Thus to the World-All, wondering,\nSpeaks man's maturing feeling-sense:\nThe world, it will not be contained\nIn human breast alone,\nEarth-shackled thought that would attain\nTo lofty spirit-realms,\nMust find its way in soul." },
  { num:4, title:"Week 4", english:"I sense a kindred nature to my own\nIn this world-dawning freshness:\nI feel how through the spirit's senses\nThe world evokes man's being.\nThe power of thinking, growing clear,\nGains strength to call forth from itself\nThe sense of self I feel." },
  { num:5, title:"Week 5", english:"Within the light that out of spirit depths\nWeaves germinating power into space\nAnd manifests the gods' creative work:\nWithin its weaving lives the soul." },
  { num:6, title:"Week 6", english:"There has arisen from its narrow limits\nMy self and, world-becoming, finds itself\nAs revelation of all things;\nIt only now can clearly feel\nThat where it seemed to lose itself\nIn emptiness of illimitable space,\nIn itself the spirit finds itself." },
  { num:7, title:"Week 7", english:"My self is threatening to take flight,\nDrawn strongly by the world's temptations.\nNow, Memory, come forth\nFrom spirit depths, enkindling light;\nEnkindle for me thinking's power —\nWhich lends itself to losing what it willed\nIn dullness of the senses' glory." },
  { num:8, title:"Week 8", english:"The senses' might grows in alliance\nWith the creating word of worlds\nAnd, with my being, damps\nMy power of thinking down to dream:\nNow, spirit memory, arise\nAnd strengthen the beholding eye,\nAt the cost of cosmic forces\nThat newly make the self its own." },
  { num:9, title:"Week 9", english:"Forgetful of my own will's being,\nWorld-warmth prophesying my summer,\nThis is my inmost feeling now.\nI can, in bright release,\nAnnounce to all the world:\nThis summer of the soul was born\nAnd now brings forth its fruit in me." },
  { num:10, title:"Week 10", english:"To summer's radiant heights\nThe sun in shining majesty ascends;\nIt takes my human feeling\nInto its own wide realms of space.\nSomething within my depths has sensed\nA presentiment; I feel\nThat I shall gain the spirit." },
  { num:11, title:"Week 11", english:"In this the sun's high hour it rests\nWith me to know as mine own thought\nWhat to the senses manifests\nIn World-All as the Father's deed,\nWithin my power of thinking,\nTo feel myself as World-creating,\nTo know myself as Spirit-born." },
  { num:12, title:"Week 12", english:"The world-soul's splendour unfolding\nRises from the deeps of darkness;\nIt sheds its loving light abroad\nAnd fills the expanse of heaven.\nMy heart feels moved with secret\nPresages of new spirit-birth;\nThe world's surging movement\nMakes me feel, within the All, myself." },
  { num:13, title:"Week 13", english:"And when I live in spirit depths,\nFrom soul-ground beauties spring to view\nFrom out my godlike nature:\nThe world, in summer's glory,\nFills senses with its lavishness;\nThe soul can find in spirit\nA second summer." },
  { num:14, title:"Week 14", english:"Surrendering to senses' revelation\nI lost the drive of my own being,\nAnd dreamlike thinking seemed\nTo daze and rob me of myself.\nYet quickening there draws near\nIn sense appearance — world creative magic\nTo which my will of thinking gives itself." },
  { num:15, title:"Week 15", english:"I feel enchanted weaving\nOf spirit within outer glory.\nIn dullness of the senses\nIt has pressed my own being\nTo sleep; but cosmic thinking lives\nIn union with my spirit-growth\nAnd strengthens the perceiving power." },
  { num:16, title:"Week 16", english:"To carry spirit light into world winter-depths\nIs stern command of my own being;\nThat, germinating, the divine\nMight shine into the future,\nSinking into soul's foundations;\nGive seeds to the All-World-Will\nFor future sprouting." },
  { num:17, title:"Week 17", english:"Thus speaks the word of worlds\nWhich I, through spirit senses' gate,\nCan, by God's grace, receive:\nFill thou thy spirit depths\nWith my wide world-horizons\nTo find me there in thee." },
  { num:18, title:"Week 18", english:"Can I expand my soul\nThat it unites itself\nWith cosmic Word received\nAs seed? I sense\nThat I must find the strength\nTo fashion worthily\nMy soul as spirit garment." },
  { num:19, title:"Week 19", english:"To rescue from bewilderments of sense\nMy power of sight within myself —\nTo know the world anew\nIn beholding soul:\nThis can, with spirit ardour\nThat thinks itself through worlds,\nBecome a fruit for spirit." },
  { num:20, title:"Week 20", english:"Thus speaks the cosmic spirit\nTo that part of my soul\nThat seeks the light of world-becoming:\nMy living warmth of being\nOutpours through thee.\nLet thy willing\nBe warmed through me." },
  { num:21, title:"Week 21", english:"I feel strange power, bearing fruit\nAnd gaining strength to give myself to me.\nI sense the seed maturing\nAnd expectation, light-filled, weaving\nIn me on my own life's behalf.\nMy power of thinking, growing clearer,\nUnveils for me the world's enigma." },
  { num:22, title:"Week 22", english:"The light from spirit depths\nStrives outward, sun-imbued,\nBecomes self will and shines\nInto the dullness of the senses:\nLight, living, weaves and works\nIn Man's creative labours,\nAnd from the All-World-Life\nOutpours the spirit into man." },
  { num:23, title:"Week 23", english:"Autumn feels the spirit's work\nAnd summer's end re-echoes\nIn me: The day grows shorter,\nThe power of light grows weaker;\nThrough night's wide spreading\nI feel in me the growing\nOf Michaelic spirit." },
  { num:24, title:"Week 24 — Michaelmas", english:"In the expanses of the ether\nA light of cosmic life is kindled;\nIn me is kindled courage-warmth\nFor all the wide world-strivings:\nI feel myself freed from the spell\nOf earth-existence and in all,\nIs spirit light-filled, gladly free." },
  { num:25, title:"Week 25", english:"I can belong now to myself\nAnd, shining, spread my inner light\nInto the dark of space and time.\nToward sleep is drawing\nThe world-creator-plan;\nbut my soul-will\nWill waken cosmic morning." },
  { num:26, title:"Week 26", english:"Nature, I would fain contain thee,\nMother world, within my inner being.\nI would Earth-spirit's\nWealth and splendour carry in me.\nYet only in my own soul-depths\nThe spirit's force, creative, lives,\nAnd thither is the way." },
  { num:27, title:"Week 27", english:"When from the soul's depths\nThe spirit turns to the world-being\nAnd beauty wells from wide expanses,\nThen streaming from the farthest heavens\nThe life force flows through human bodies;\nUniting — powerfully working —\nThe spirit-essence with Man's being." },
  { num:28, title:"Week 28", english:"Ripening, I can feel my own being's might;\nStrength-giving, light illumines me from world:\nMy life in light of thinking\nShines clearly through the senses' darkness:\nThe spirit realm, divined,\nIs taking shape as human word,\nAs I, in fields of God, myself create." },
  { num:29, title:"Week 29", english:"To ignite by thinking world creative force,\nTo win the strength to walk through space\nWith forces of my spirit life:\nThis is my summer fruit.\nBy gathering it the soul grows strong.\nI lead it to the spirit's winter depths\nAnd guard it there through winter." },
  { num:30, title:"Week 30", english:"Blossoming in the soul's own depths,\nSelf-feeling's essence\nWas poured from spirit fire-fountains.\nBut in the spirit's summer\nNow self-feeling's force\nIs granted to carry cosmic warmth\nInto the winter's cold." },
  { num:31, title:"Week 31", english:"The light from spirit depths\nStrives outward to reveal\nWorld being's ownmost nature:\nNow let my inner light\nIllume the spirit darkness\nAnd warm the wintry cold\nWith fire of heart." },
  { num:32, title:"Week 32", english:"I feel my own force, bearing fruit\nAnd gaining strength to give myself to me.\nI sense the world-soul-weaving\nAnd expectation, sense-filled, weaving\nIn me on my own behalf.\nMy inner glow of feeling\nUnveils to me the soul's own power." },
  { num:33, title:"Week 33", english:"Thus speaks the word of worlds\nWhich I, through soul-grace, can receive\nAnd, sensing, take into my heart:\nFill thou thy spirit depths\nWith my wide worlds of worlds\nTo find me in thee." },
  { num:34, title:"Week 34", english:"Secret soul of worlds,\nI feel thee deep within me,\nIn thee thou art all around me;\nIn thee thou art within me;\nMy thinking's secret\nIs thy gift to me;\nMy willing's power\nIs thy breathing in and out." },
  { num:35, title:"Week 35 — Advent", english:"Can I know life's very nature\nThat I find myself within the world?\nI feel the power lend itself to me\nOf world-becoming, here and now,\nTo fashion for myself\nAs spirit form\nMy selfhood's being." },
  { num:36, title:"Week 36", english:"Within my being's depths there speaks,\nIntent on revelation,\nThe cosmic Word mysteriously:\nImbue your labor's aims\nWith my bright spirit light\nTo sacrifice yourself through me." },
  { num:37, title:"Week 37", english:"To carry spirit light into world winter-depths\nIs stern command of my own being;\nThat, germinating, the divine\nMight shine into the future,\nSinking into soul's foundations;\nGive seeds to the All-World-Will\nFor future spirit life." },
  { num:38, title:"Week 38", english:"I feel, as if released from spell,\nThe spirit child within my soul;\nIn heart light has been kindled\nHoly cosmic word,\nWhich carries in the heights of heaven\nThe grace of spirit-birth\nTo souls of human beings." },
  { num:39, title:"Week 39 — Christmas", english:"Surrendering to spirit revelation\nI gain the light of cosmic being;\nThe power of thinking, growing clearer,\nKindles ever stronger\nThe fire of my soul-love;\nIt pours into the world-becoming\nThe forces of my love." },
  { num:40, title:"Week 40", english:"I feel the force of cosmic being;\nThus speaks my thinking self to me,\nRemembering the spirit's growth:\nWorld-birth-day of the world-spirit\nWas my soul's birth-day too;\nI will devote myself to spirit\nAnd live and work in it." },
  { num:41, title:"Week 41", english:"The soul's creative might\nStrives outward from the heart's own core,\nTo kindle godly life in human life;\nIn loving, working, in the outer world,\nIt wants to free the light\nIn human souls\nFor spirit birth." },
  { num:42, title:"Week 42", english:"In this the shrouding gloom of winter\nThe soul feels ardently impelled\nTo manifest its innate strength,\nTo guide itself to realms of darkness,\nAnticipating thus\nThrough warmth of heart\nThe sense-world's revelation." },
  { num:43, title:"Week 43", english:"In winter's depths is kindled\nTrue spirit life with glowing warmth;\nIt gives to world appearance,\nTo senses' empty show,\nThe power to exist in time.\nThus grows the soul\nIn union with the World-Soul." },
  { num:44, title:"Week 44", english:"In reaching to the spirit's realms\nI find the world-self, growing,\nAnd, growing, finding world-self,\nI find the human self:\nFor spirit roots the human self\nIn realms of cosmic life\nAnd founds it in the spirit." },
  { num:45, title:"Week 45", english:"My strength of thinking comes from cosmic life,\nMy strength of feeling from the cosmic life;\nAnd cosmic life works mightily\nIn my strength of willing;\nWhat I think is cosmic thinking,\nWhat I feel is cosmic feeling,\nWhat I will is cosmic willing." },
  { num:46, title:"Week 46", english:"The world threatens to stupefy\nThe inborn forces of my soul;\nNow, memory, arise\nFrom spirit depths, enkindling light;\nEnkindle for me thinking's power —\nWhich lends itself to losing what it willed\nIn dullness of the senses' glory." },
  { num:47, title:"Week 47", english:"I feel from world-will's surging\nThe spirit speaking:\nLet your thoughts be full of courage\nFor the spirit work of worlds;\nFor I enkindle spirit knowledge\nIn human hearts to light.\nI give you inner strength." },
  { num:48, title:"Week 48", english:"The soul's creative might now feels itself\nOn spirit's fruitful soil;\nCosmic thinking, weaving bright,\nIs now alive within\nThe certainty of self;\nAnd from the soul's depths rises\nA human self-awareness." },
  { num:49, title:"Week 49", english:"I feel the force, myself creating,\nPresent and future, mine to use;\nAll power of knowledge,\nAll power of memory\nUnite in me through light of thinking;\nAnd my self-knowing glows,\nA living world of spirit." },
  { num:50, title:"Week 50", english:"Thus to the World-All, wondering,\nSpeaks man's maturing self:\nThe world will be contained\nIn human breast from now on;\nEarth-fettered thought draws\nInto spirit realms\nAnd finds itself in spirit." },
  { num:51, title:"Week 51", english:"Into the inner being of Man\nPour the riches of the senses;\nThe World-Spirit finds itself\nIn the mirror image of human eyes,\nFrom which its power\nMust replenish itself." },
  { num:52, title:"Week 52 — Easter Eve", english:"When from the depths of soul\nThe Spirit turns to the world existence\nAnd beauty wells from wide expanses,\nThen streaming from the farthest heavens\nThe life force flows through human bodies;\nUniting — powerfully working —\nThe spirit-essence to the life of Man." }
];

export function getCurrentCOTSIndex(): number {
  const easterDates = [
    new Date(2024, 2, 31),
    new Date(2025, 3, 20),
    new Date(2026, 3, 5),
    new Date(2027, 2, 28),
    new Date(2028, 3, 16),
    new Date(2029, 3, 1)
  ];
  const today = new Date();
  let easterBase = easterDates[0];
  for (const e of easterDates) {
    if (e <= today) easterBase = e;
  }
  const daysSince = Math.floor((today.getTime() - easterBase.getTime()) / 86400000);
  const index = Math.floor(daysSince / 7) % 52;
  return index < 0 ? index + 52 : index;
}
