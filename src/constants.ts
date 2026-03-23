export interface InfoCard {
  id: string;
  title: { en: string; ar: string };
  category: { en: string; ar: string };
  content: { en: string; ar: string };
  tags: { en: string[]; ar: string[] };
}

export const KNOWLEDGE_BASE: InfoCard[] = [
  {
    id: "1",
    title: { en: "The Fermi Paradox", ar: "مفارقة فيرمي" },
    category: { en: "Astronomy", ar: "علم الفلك" },
    content: { 
      en: "The Fermi Paradox is the discrepancy between the high probability of extraterrestrial life and the lack of evidence for it. Given the billions of stars in our galaxy and the high likelihood of Earth-like planets, why haven't we heard from anyone?",
      ar: "مفارقة فيرمي هي التناقض بين الاحتمالية العالية لوجود حياة خارج كوكب الأرض والافتقار إلى أدلة عليها. بالنظر إلى مليارات النجوم في مجرتنا والاحتمالية العالية لوجود كواكب شبيهة بالأرض ، لماذا لم نسمع من أي شخص؟"
    },
    tags: { en: ["Space", "Science", "Aliens"], ar: ["الفضاء", "العلم", "الفضائيين"] }
  },
  {
    id: "2",
    title: { en: "Quantum Entanglement", ar: "التشابك الكمي" },
    category: { en: "Physics", ar: "الفيزياء" },
    content: { 
      en: "Quantum entanglement is a phenomenon where two or more particles become connected in such a way that the state of one particle instantly influences the state of the others, regardless of the distance between them. Einstein famously called it 'spooky action at a distance'.",
      ar: "التشابك الكمي هو ظاهرة يصبح فيها جزيئين أو أكثر مرتبطين بطريقة تجعل حالة أحد الجسيمات تؤثر فوراً على حالة الجسيمات الأخرى ، بغض النظر عن المسافة بينهما. أطلق أينشتاين عليها اسم 'عمل مخيف عن بعد'."
    },
    tags: { en: ["Quantum", "Physics", "Mechanics"], ar: ["الكم", "الفيزياء", "الميكانيكا"] }
  },
  {
    id: "3",
    title: { en: "The Library of Alexandria", ar: "مكتبة الإسكندرية" },
    category: { en: "History", ar: "التاريخ" },
    content: { 
      en: "One of the largest and most significant libraries of the ancient world, the Library of Alexandria was dedicated to the Muses. It flourished under the patronage of the Ptolemaic dynasty and functioned as a major center of scholarship until its destruction.",
      ar: "واحدة من أكبر وأهم المكتبات في العالم القديم ، كانت مكتبة الإسكندرية مخصصة لربات الفنون. ازدهرت تحت رعاية الأسرة البطلمية وعملت كمركز رئيسي للمنح الدراسية حتى تدميرها."
    },
    tags: { en: ["History", "Knowledge", "Ancient World"], ar: ["التاريخ", "المعرفة", "العالم القديم"] }
  },
  {
    id: "4",
    title: { en: "Artificial Neural Networks", ar: "الشبكات العصبية الاصطناعية" },
    category: { en: "Technology", ar: "التكنولوجيا" },
    content: { 
      en: "Inspired by the biological neural networks that constitute animal brains, ANNs are computing systems that 'learn' to perform tasks by considering examples, generally without being programmed with task-specific rules.",
      ar: "مستوحاة من الشبكات العصبية البيولوجية التي تشكل أدمغة الحيوانات ، فإن الشبكات العصبية الاصطناعية هي أنظمة حوسبة 'تتعلم' أداء المهام من خلال النظر في الأمثلة ، بشكل عام دون برمجتها بقواعد محددة للمهام."
    },
    tags: { en: ["AI", "Computing", "Machine Learning"], ar: ["الذكاء الاصطناعي", "الحوسبة", "تعلم الآلة"] }
  },
  {
    id: "5",
    title: { en: "The Great Barrier Reef", ar: "الحاجز المرجاني العظيم" },
    category: { en: "Nature", ar: "الطبيعة" },
    content: { 
      en: "The world's largest coral reef system, composed of over 2,900 individual reefs and 900 islands. It is located in the Coral Sea, off the coast of Queensland, Australia, and is visible from outer space.",
      ar: "أكبر نظام للشعاب المرجانية في العالم ، ويتألف من أكثر من 2900 شعاب مرجانية فردية و 900 جزيرة. يقع في بحر المرجان ، قبالة ساحل كوينزلاند ، أستراليا ، ويمكن رؤيته من الفضاء الخارجي."
    },
    tags: { en: ["Environment", "Ocean", "Biology"], ar: ["البيئة", "المحيط", "الأحياء"] }
  },
  {
    id: "6",
    title: { en: "Blockchain Technology", ar: "تكنولوجيا البلوكشين" },
    category: { en: "Finance", ar: "المالية" },
    content: { 
      en: "A blockchain is a growing list of records, called blocks, that are linked together using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.",
      ar: "البلوكشين عبارة عن قائمة متزايدة من السجلات ، تسمى الكتل ، المرتبطة ببعضها البعض باستخدام التشفير. تحتوي كل كتلة على هاش تشفيري للكتلة السابقة وطابع زمني وبيانات المعاملة."
    },
    tags: { en: ["Crypto", "Finance", "Security"], ar: ["الكريبتو", "المالية", "الأمان"] }
  },
  {
    id: "7",
    title: { en: "The Renaissance", ar: "عصر النهضة" },
    category: { en: "History", ar: "التاريخ" },
    content: { 
      en: "A fervent period of European cultural, artistic, political and economic 'rebirth' following the Middle Ages. Generally described as taking place from the 14th century to the 17th century, the Renaissance promoted the rediscovery of classical philosophy, literature and art.",
      ar: "فترة حماسية من 'الولادة الجديدة' الثقافية والفنية والسياسية والاقتصادية الأوروبية في أعقاب العصور الوسطى. توصف عموماً بأنها حدثت من القرن الرابع عشر إلى القرن السابع عشر ، وعزز عصر النهضة إعادة اكتشاف الفلسفة الكلاسيكية والأدب والفن."
    },
    tags: { en: ["Art", "Culture", "Europe"], ar: ["الفن", "الثقافة", "أوروبا"] }
  },
  {
    id: "8",
    title: { en: "Photosynthesis", ar: "البناء الضوئي" },
    category: { en: "Biology", ar: "الأحياء" },
    content: { 
      en: "The process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. It generally involves the green pigment chlorophyll and generates oxygen as a byproduct.",
      ar: "العملية التي تستخدم من خلالها النباتات الخضراء وبعض الكائنات الحية الأخرى ضوء الشمس لتصنيع الأطعمة بمساعدة الكلوروفيل. وهي تنطوي عموماً على صبغة الكلوروفيل الخضراء وتولد الأكسجين كمنتج ثانوي."
    },
    tags: { en: ["Plants", "Energy", "Science"], ar: ["النباتات", "الطاقة", "العلم"] }
  }
];
