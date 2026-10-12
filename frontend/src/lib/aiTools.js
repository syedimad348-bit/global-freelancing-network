// Curated directory of AI tools. Names, sites and categories are real;
// ratings and descriptions are editorial.

export const TOOLS = [
  // Writing & Productivity Assistants
  { name: 'Claude',          category: 'Writing',     pricing: 'Free + Pro',  rating: 4.9, badge: 'Editor pick', site: 'https://claude.ai',           desc: 'Long-form thinking partner with a thoughtful, careful writing voice.' },
  { name: 'ChatGPT',         category: 'Writing',     pricing: 'Free + Plus', rating: 4.8, site: 'https://chat.openai.com',  desc: 'The Swiss-army assistant for everyday writing, coding and research.' },
  { name: 'Gemini',          category: 'Writing',     pricing: 'Free + Pro',  rating: 4.6, site: 'https://gemini.google.com',desc: 'Google\'s assistant with deep web + Workspace integrations.' },
  { name: 'Copy.ai',         category: 'Writing',     pricing: 'Free + Pro',  rating: 4.3, site: 'https://www.copy.ai',      desc: 'Marketing copy generator with workflow automations.' },
  { name: 'Jasper',          category: 'Writing',     pricing: '$39+/mo',     rating: 4.4, site: 'https://www.jasper.ai',    desc: 'Brand-voice AI built for marketing teams.' },
  { name: 'Writesonic',      category: 'Writing',     pricing: 'Free + Pro',  rating: 4.2, site: 'https://writesonic.com',   desc: 'Long-form articles, ads and product descriptions.' },
  { name: 'Rytr',            category: 'Writing',     pricing: 'Free + $9/mo',rating: 4.1, site: 'https://rytr.me',          desc: 'Affordable copy + content assistant.' },
  { name: 'Sudowrite',       category: 'Writing',     pricing: '$10+/mo',     rating: 4.5, site: 'https://www.sudowrite.com',desc: 'Fiction writing AI loved by novelists.' },
  { name: 'Wordtune',        category: 'Writing',     pricing: 'Free + Pro',  rating: 4.4, site: 'https://www.wordtune.com', desc: 'Rephrase and tighten any sentence on the fly.' },
  { name: 'Grammarly',       category: 'Writing',     pricing: 'Free + Pro',  rating: 4.6, site: 'https://www.grammarly.com',desc: 'The grammar/style checker, now with generative AI.' },
  { name: 'QuillBot',        category: 'Writing',     pricing: 'Free + Pro',  rating: 4.3, site: 'https://quillbot.com',     desc: 'Paraphrase, summarize and check grammar instantly.' },
  { name: 'Hemingway',       category: 'Writing',     pricing: '$20 once',    rating: 4.4, site: 'https://hemingwayapp.com', desc: 'Editor that flags long, dense sentences.' },
  { name: 'Lex',             category: 'Writing',     pricing: 'Free',        rating: 4.5, site: 'https://lex.page',         desc: 'A doc editor with AI prompts where your cursor sits.' },
  { name: 'Notion AI',       category: 'Writing',     pricing: '$10/mo',      rating: 4.4, site: 'https://www.notion.so/product/ai', desc: 'Summarize, rewrite and brainstorm inside your workspace.' },

  // Coding & Developer Tools
  { name: 'Cursor',          category: 'Coding',      pricing: 'Free + Pro',  rating: 4.9, badge: 'Trending', site: 'https://www.cursor.com', desc: 'AI-native code editor that pairs with you.' },
  { name: 'GitHub Copilot',  category: 'Coding',      pricing: '$10/mo',      rating: 4.6, site: 'https://github.com/features/copilot', desc: 'Inline code suggestions across every editor.' },
  { name: 'Codeium',         category: 'Coding',      pricing: 'Free + Pro',  rating: 4.5, site: 'https://codeium.com',      desc: 'Free, fast autocompletions for 70+ languages.' },
  { name: 'Tabnine',         category: 'Coding',      pricing: 'Free + Pro',  rating: 4.3, site: 'https://www.tabnine.com',  desc: 'Privacy-focused AI code completion.' },
  { name: 'Replit Agent',    category: 'Coding',      pricing: 'Replit Core', rating: 4.7, site: 'https://replit.com',       desc: 'Build, run and deploy apps from a single prompt.' },
  { name: 'Bolt.new',        category: 'Coding',      pricing: 'Free + Pro',  rating: 4.6, badge: 'New', site: 'https://bolt.new', desc: 'Prompt-to-fullstack-app, instantly deployable.' },
  { name: 'Lovable',         category: 'Coding',      pricing: 'Free + Pro',  rating: 4.5, site: 'https://lovable.dev',      desc: 'Generate full React apps from natural language.' },
  { name: 'v0',              category: 'Coding',      pricing: 'Free + Pro',  rating: 4.7, badge: 'New', site: 'https://v0.dev', desc: 'Generate React UIs from a prompt.' },
  { name: 'CodeRabbit',      category: 'Coding',      pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.coderabbit.ai',desc: 'AI code review for every PR.' },
  { name: 'Sweep',           category: 'Coding',      pricing: 'Free + Pro',  rating: 4.2, site: 'https://sweep.dev',        desc: 'Junior dev bot that turns issues into PRs.' },
  { name: 'Phind',           category: 'Coding',      pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.phind.com',    desc: 'Search engine tuned for developers.' },
  { name: 'Continue',        category: 'Coding',      pricing: 'Free',        rating: 4.4, site: 'https://www.continue.dev', desc: 'Open-source autopilot for your IDE.' },
  { name: 'Aider',           category: 'Coding',      pricing: 'Free',        rating: 4.6, site: 'https://aider.chat',       desc: 'Pair-program with LLMs in your terminal.' },
  { name: 'Warp',            category: 'Coding',      pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.warp.dev',     desc: 'Modern terminal with AI command suggestions.' },
  { name: 'CodeWhisperer',   category: 'Coding',      pricing: 'Free + Pro',  rating: 4.2, site: 'https://aws.amazon.com/codewhisperer/', desc: 'AWS\'s AI code companion.' },

  // Design & Visual
  { name: 'Figma AI',        category: 'Design',      pricing: 'Beta',        rating: 4.5, site: 'https://www.figma.com/ai',  desc: 'Magic editing inside the design tool you use daily.' },
  { name: 'Galileo AI',      category: 'Design',      pricing: 'Free + Pro',  rating: 4.3, site: 'https://www.usegalileo.ai', desc: 'Generate Figma-ready UI from prompts.' },
  { name: 'Uizard',          category: 'Design',      pricing: 'Free + Pro',  rating: 4.2, site: 'https://uizard.io',         desc: 'Sketch → wireframe → prototype with AI.' },
  { name: 'Khroma',          category: 'Design',      pricing: 'Free',        rating: 4.4, site: 'https://www.khroma.co',     desc: 'A color palette generator that learns your taste.' },
  { name: 'Looka',           category: 'Design',      pricing: '$20+ once',   rating: 4.0, site: 'https://looka.com',         desc: 'Generate a logo + brand kit in minutes.' },
  { name: 'Brandmark',       category: 'Design',      pricing: '$25+ once',   rating: 4.1, site: 'https://brandmark.io',      desc: 'AI logo + identity generator.' },
  { name: 'Recraft',         category: 'Design',      pricing: 'Free + Pro',  rating: 4.6, badge: 'Editor pick', site: 'https://www.recraft.ai', desc: 'Vector + raster generator with brand consistency.' },
  { name: 'Magnific',        category: 'Design',      pricing: '$39+/mo',     rating: 4.7, site: 'https://magnific.ai',       desc: 'Insane upscale + relight for AI images.' },
  { name: 'Designs.ai',      category: 'Design',      pricing: '$19+/mo',     rating: 4.0, site: 'https://designs.ai',        desc: 'Bundle of AI design generators (logo, video, mockups).' },
  { name: 'Stitch',          category: 'Design',      pricing: 'Free + Pro',  rating: 4.4, site: 'https://stitch.withgoogle.com', desc: 'Design and code an app from a prompt (Google Labs).' },
  { name: 'Visily',          category: 'Design',      pricing: 'Free + Pro',  rating: 4.3, site: 'https://www.visily.ai',     desc: 'Sketch-to-design app builder for non-designers.' },
  { name: 'Krea',            category: 'Design',      pricing: 'Free + Pro',  rating: 4.6, site: 'https://www.krea.ai',       desc: 'Real-time generative canvas for designers.' },

  // Image Generation
  { name: 'Midjourney',      category: 'Image',       pricing: '$10+/mo',     rating: 4.8, badge: 'Editor pick', site: 'https://www.midjourney.com', desc: 'The artist\'s favorite for painterly, cinematic images.' },
  { name: 'DALL·E 3',        category: 'Image',       pricing: 'In ChatGPT',  rating: 4.6, site: 'https://openai.com/index/dall-e-3', desc: 'Text-to-image inside ChatGPT, great with text in images.' },
  { name: 'Stable Diffusion',category: 'Image',       pricing: 'Free OSS',    rating: 4.5, site: 'https://stability.ai',       desc: 'Open-source image generation, run anywhere.' },
  { name: 'Adobe Firefly',   category: 'Image',       pricing: 'Free + Pro',  rating: 4.4, site: 'https://firefly.adobe.com',  desc: 'Commercially safe image generation by Adobe.' },
  { name: 'Ideogram',        category: 'Image',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://ideogram.ai',        desc: 'Generates beautiful typography inside images.' },
  { name: 'Leonardo.ai',     category: 'Image',       pricing: 'Free + Pro',  rating: 4.4, site: 'https://leonardo.ai',        desc: 'Game/concept-art focused image platform.' },
  { name: 'Playground',      category: 'Image',       pricing: 'Free + Pro',  rating: 4.3, site: 'https://playground.com',     desc: 'Easy image generator with style controls.' },
  { name: 'Lexica',          category: 'Image',       pricing: 'Free + Pro',  rating: 4.2, site: 'https://lexica.art',         desc: 'Search AI images + generate your own.' },
  { name: 'Imagen 3',        category: 'Image',       pricing: 'Gemini',      rating: 4.5, site: 'https://deepmind.google/technologies/imagen-3/', desc: 'Google DeepMind\'s flagship image model.' },
  { name: 'Bing Image Creator', category: 'Image',    pricing: 'Free',        rating: 4.2, site: 'https://www.bing.com/create',desc: 'Free DALL·E image generation in Bing.' },
  { name: 'Flux',            category: 'Image',       pricing: 'Free + Pro',  rating: 4.7, site: 'https://blackforestlabs.ai', desc: 'Black Forest Labs\' photorealistic open-source model.' },
  { name: 'Civitai',         category: 'Image',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://civitai.com',        desc: 'Community hub for Stable Diffusion models + LoRAs.' },

  // Video Generation
  { name: 'Runway',          category: 'Video',       pricing: '$15+/mo',     rating: 4.6, badge: 'Editor pick', site: 'https://runwayml.com', desc: 'Generative video, in-painting, slow-mo and more.' },
  { name: 'Sora',            category: 'Video',       pricing: 'ChatGPT Pro', rating: 4.7, site: 'https://openai.com/sora',    desc: 'OpenAI\'s text-to-video model with cinematic quality.' },
  { name: 'Pika',            category: 'Video',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://pika.art',           desc: 'Idea-to-video tool popular on social.' },
  { name: 'Luma Dream Machine', category: 'Video',    pricing: 'Free + Pro',  rating: 4.6, site: 'https://lumalabs.ai/dream-machine', desc: 'Lifelike camera motion from a prompt or image.' },
  { name: 'HeyGen',          category: 'Video',       pricing: '$24+/mo',     rating: 4.5, site: 'https://www.heygen.com',     desc: 'AI avatars and dubbing for marketing video.' },
  { name: 'Synthesia',       category: 'Video',       pricing: '$22+/mo',     rating: 4.4, site: 'https://www.synthesia.io',   desc: 'Studio-grade AI avatars for training videos.' },
  { name: 'Descript',        category: 'Video',       pricing: 'Free + Pro',  rating: 4.7, site: 'https://www.descript.com',   desc: 'Edit podcasts and videos like a doc.' },
  { name: 'Opus Clip',       category: 'Video',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.opus.pro',       desc: 'Auto-cuts long videos into viral shorts.' },
  { name: 'Veed',            category: 'Video',       pricing: 'Free + Pro',  rating: 4.4, site: 'https://www.veed.io',        desc: 'Browser video editor with AI subtitles.' },
  { name: 'Kling',           category: 'Video',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://kling.ai',           desc: 'Long, high-fidelity AI video clips.' },
  { name: 'Kapwing',         category: 'Video',       pricing: 'Free + Pro',  rating: 4.3, site: 'https://www.kapwing.com',    desc: 'Collaborative video editor with AI tools.' },
  { name: 'InVideo',         category: 'Video',       pricing: 'Free + Pro',  rating: 4.2, site: 'https://invideo.io',         desc: 'Text-to-video for marketers and creators.' },

  // Audio & Voice
  { name: 'ElevenLabs',      category: 'Audio',       pricing: '$5+/mo',      rating: 4.8, badge: 'Editor pick', site: 'https://elevenlabs.io', desc: 'Hyper-realistic AI voices and dubbing.' },
  { name: 'Suno',            category: 'Audio',       pricing: 'Free + Pro',  rating: 4.7, badge: 'Trending', site: 'https://suno.ai', desc: 'Generate full songs from a prompt.' },
  { name: 'Udio',            category: 'Audio',       pricing: 'Free + Pro',  rating: 4.6, site: 'https://www.udio.com',       desc: 'Text-to-music with great vocal quality.' },
  { name: 'Murf',            category: 'Audio',       pricing: '$19+/mo',     rating: 4.4, site: 'https://murf.ai',            desc: 'Studio-quality voiceover generator.' },
  { name: 'PlayHT',          category: 'Audio',       pricing: '$19+/mo',     rating: 4.3, site: 'https://play.ht',            desc: 'Realistic AI voices and TTS API.' },
  { name: 'Resemble',        category: 'Audio',       pricing: 'Free + Pro',  rating: 4.4, site: 'https://www.resemble.ai',    desc: 'Custom AI voice cloning for brands.' },
  { name: 'Adobe Podcast',   category: 'Audio',       pricing: 'Free Beta',   rating: 4.6, site: 'https://podcast.adobe.com',  desc: 'Studio-grade voice cleanup for any audio.' },
  { name: 'Krisp',           category: 'Audio',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://krisp.ai',           desc: 'Removes background noise from any call.' },
  { name: 'AssemblyAI',      category: 'Audio',       pricing: 'Free + API',  rating: 4.7, site: 'https://www.assemblyai.com', desc: 'State-of-the-art speech-to-text API.' },
  { name: 'Whisper',         category: 'Audio',       pricing: 'Open source', rating: 4.7, site: 'https://github.com/openai/whisper', desc: 'OpenAI\'s open-source transcription model.' },

  // Productivity & Automation
  { name: 'Granola',         category: 'Productivity',pricing: 'Free + Pro',  rating: 4.8, badge: 'Hidden gem', site: 'https://www.granola.ai', desc: 'AI notes for meetings without a bot in the call.' },
  { name: 'Reflect',         category: 'Productivity',pricing: '$10/mo',      rating: 4.6, site: 'https://reflect.app',        desc: 'Note-taking app with built-in AI search and writing.' },
  { name: 'Mem',             category: 'Productivity',pricing: 'Free + Pro',  rating: 4.4, site: 'https://mem.ai',             desc: 'Self-organizing notes with an AI chat layer.' },
  { name: 'Otter.ai',        category: 'Productivity',pricing: 'Free + Pro',  rating: 4.5, site: 'https://otter.ai',           desc: 'Real-time meeting transcription and summaries.' },
  { name: 'Fireflies',       category: 'Productivity',pricing: 'Free + Pro',  rating: 4.4, site: 'https://fireflies.ai',       desc: 'Records, transcribes and analyzes meetings.' },
  { name: 'Fathom',          category: 'Productivity',pricing: 'Free + Pro',  rating: 4.6, site: 'https://fathom.video',       desc: 'Free AI meeting recorder, summarizer and CRM sync.' },
  { name: 'Read AI',         category: 'Productivity',pricing: 'Free + Pro',  rating: 4.3, site: 'https://www.read.ai',        desc: 'Smart meeting notes + sentiment analysis.' },
  { name: 'Reclaim',         category: 'Productivity',pricing: 'Free + Pro',  rating: 4.4, site: 'https://reclaim.ai',         desc: 'AI calendar that protects time for habits and focus.' },
  { name: 'Motion',          category: 'Productivity',pricing: '$19+/mo',     rating: 4.5, site: 'https://www.usemotion.com',  desc: 'AI-driven calendar + task manager.' },
  { name: 'Magical',         category: 'Productivity',pricing: 'Free + Pro',  rating: 4.4, site: 'https://www.getmagical.com', desc: 'AI text expander that automates repetitive typing.' },
  { name: 'Zapier AI',       category: 'Productivity',pricing: 'Free + Paid', rating: 4.5, site: 'https://zapier.com/ai',      desc: 'Build automations and bots from natural language.' },
  { name: 'Make',            category: 'Productivity',pricing: 'Free + Paid', rating: 4.4, site: 'https://www.make.com',       desc: 'Visual automation platform with AI nodes.' },
  { name: 'n8n',             category: 'Productivity',pricing: 'Free + Paid', rating: 4.6, site: 'https://n8n.io',             desc: 'Open-source automation with built-in LLM steps.' },

  // Research & Knowledge
  { name: 'Perplexity',      category: 'Research',    pricing: 'Free + Pro',  rating: 4.7, badge: 'Editor pick', site: 'https://www.perplexity.ai', desc: 'Ask the web — get cited answers, fast.' },
  { name: 'Elicit',          category: 'Research',    pricing: 'Free + Pro',  rating: 4.5, site: 'https://elicit.com',         desc: 'Research assistant for academic literature.' },
  { name: 'Consensus',       category: 'Research',    pricing: 'Free + Pro',  rating: 4.5, site: 'https://consensus.app',      desc: 'Search 200M+ papers and get evidence summaries.' },
  { name: 'Scite',           category: 'Research',    pricing: '$20+/mo',     rating: 4.4, site: 'https://scite.ai',           desc: 'See how a paper has been cited (supporting / contrasting).' },
  { name: 'You.com',         category: 'Research',    pricing: 'Free + Pro',  rating: 4.3, site: 'https://you.com',            desc: 'Search engine with multimodel chat.' },
  { name: 'Arc Search',      category: 'Research',    pricing: 'Free',        rating: 4.6, site: 'https://arc.net/search',     desc: 'Browse for me — Arc reads 6 sites and writes you a page.' },
  { name: 'Komo',            category: 'Research',    pricing: 'Free',        rating: 4.2, site: 'https://komo.ai',            desc: 'Private, fast AI search.' },
  { name: 'Andi',            category: 'Research',    pricing: 'Free',        rating: 4.0, site: 'https://andisearch.com',     desc: 'Ad-free conversational search.' },

  // Documents & PDFs
  { name: 'ChatPDF',         category: 'Documents',   pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.chatpdf.com',    desc: 'Chat with any PDF in seconds.' },
  { name: 'Humata',          category: 'Documents',   pricing: 'Free + Pro',  rating: 4.4, site: 'https://www.humata.ai',      desc: 'Q&A across long documents and contracts.' },
  { name: 'PDF.ai',          category: 'Documents',   pricing: 'Free + Pro',  rating: 4.3, site: 'https://pdf.ai',             desc: 'Summarize and search across multiple PDFs.' },
  { name: 'Adobe Acrobat AI',category: 'Documents',   pricing: 'Acrobat Pro', rating: 4.4, site: 'https://www.adobe.com/acrobat/generative-ai-pdf.html', desc: 'AI assistant inside Acrobat for any PDF.' },
  { name: 'NotebookLM',      category: 'Documents',   pricing: 'Free',        rating: 4.7, badge: 'Editor pick', site: 'https://notebooklm.google.com', desc: 'Google\'s research companion for your own sources.' },
  { name: 'Glean',           category: 'Documents',   pricing: 'Enterprise',  rating: 4.6, site: 'https://www.glean.com',      desc: 'Workplace search across all your apps.' },

  // Career & Hiring
  { name: 'DailyRadar',      category: 'Career',      pricing: 'Free + Pro',  rating: 4.9, badge: 'Editor pick', site: 'https://dailyradar.app', desc: 'Live jobs, AI Resume scoring, Interview Coach — one workspace.' },
  { name: 'Teal',            category: 'Career',      pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.tealhq.com',     desc: 'Job tracker, resume builder and AI matching.' },
  { name: 'Rezi',            category: 'Career',      pricing: 'Free + Pro',  rating: 4.4, site: 'https://www.rezi.ai',        desc: 'AI resume builder optimized for ATS.' },
  { name: 'Kickresume',      category: 'Career',      pricing: 'Free + Pro',  rating: 4.3, site: 'https://www.kickresume.com', desc: 'Resume + cover letter builder with AI.' },
  { name: 'Enhancv',         category: 'Career',      pricing: 'Free + Pro',  rating: 4.4, site: 'https://enhancv.com',        desc: 'Beautiful resumes with AI rewrite.' },
  { name: 'Final Round AI',  category: 'Career',      pricing: '$96+/mo',     rating: 4.3, site: 'https://www.finalroundai.com', desc: 'Live interview copilot.' },
  { name: 'Yoodli',          category: 'Career',      pricing: 'Free + Pro',  rating: 4.5, site: 'https://yoodli.ai',          desc: 'Practice speaking and interviews with AI feedback.' },
  { name: 'Interviewing.io', category: 'Career',      pricing: 'Free + Paid', rating: 4.6, site: 'https://interviewing.io',    desc: 'Anonymous mock interviews with engineers.' },
  { name: 'Pramp',           category: 'Career',      pricing: 'Free',        rating: 4.4, site: 'https://www.pramp.com',      desc: 'Peer-to-peer mock interview platform.' },

  // Marketing & SEO
  { name: 'Surfer SEO',      category: 'Marketing',   pricing: '$89+/mo',     rating: 4.5, site: 'https://surferseo.com',      desc: 'Content optimization for Google rankings.' },
  { name: 'Frase',           category: 'Marketing',   pricing: '$15+/mo',     rating: 4.3, site: 'https://www.frase.io',       desc: 'AI content briefs and writer.' },
  { name: 'Clearscope',      category: 'Marketing',   pricing: '$170+/mo',    rating: 4.6, site: 'https://www.clearscope.io',  desc: 'Premium content optimization for SERPs.' },
  { name: 'NeuronWriter',    category: 'Marketing',   pricing: '$23+/mo',     rating: 4.3, site: 'https://www.neuronwriter.com', desc: 'Affordable SEO content optimizer.' },
  { name: 'AdCreative.ai',   category: 'Marketing',   pricing: '$29+/mo',     rating: 4.4, site: 'https://www.adcreative.ai',  desc: 'Generate ad creatives in seconds.' },
  { name: 'Predis',          category: 'Marketing',   pricing: 'Free + Pro',  rating: 4.3, site: 'https://predis.ai',          desc: 'Social media post generator and scheduler.' },
  { name: 'Ocoya',           category: 'Marketing',   pricing: '$15+/mo',     rating: 4.2, site: 'https://www.ocoya.com',      desc: 'AI for content + social media.' },
  { name: 'FeedHive',        category: 'Marketing',   pricing: '$19+/mo',     rating: 4.4, site: 'https://www.feedhive.com',   desc: 'Social media management with AI suggestions.' },
  { name: 'Tweet Hunter',    category: 'Marketing',   pricing: '$49+/mo',     rating: 4.5, site: 'https://tweethunter.io',     desc: 'AI assist for growing on X / Twitter.' },
  { name: 'Hypefury',        category: 'Marketing',   pricing: '$19+/mo',     rating: 4.4, site: 'https://hypefury.com',       desc: 'Schedule + amplify tweets with AI.' },
  { name: 'Buffer AI',       category: 'Marketing',   pricing: 'Free + Pro',  rating: 4.3, site: 'https://buffer.com/ai-assistant', desc: 'AI inside Buffer\'s social scheduler.' },
  { name: 'Mutiny',          category: 'Marketing',   pricing: 'Enterprise',  rating: 4.5, site: 'https://www.mutinyhq.com',   desc: 'AI website personalization for B2B.' },

  // Sales & Outreach
  { name: 'Apollo.io',       category: 'Sales',       pricing: 'Free + Pro',  rating: 4.6, site: 'https://www.apollo.io',      desc: 'Sales engagement + AI prospecting.' },
  { name: 'Clay',            category: 'Sales',       pricing: 'Free + Pro',  rating: 4.7, badge: 'Trending', site: 'https://www.clay.com', desc: 'GTM data + AI enrichment for outbound.' },
  { name: 'Lavender',        category: 'Sales',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.lavender.ai',    desc: 'AI email coach for sellers.' },
  { name: 'Regie.ai',        category: 'Sales',       pricing: 'Custom',      rating: 4.4, site: 'https://www.regie.ai',       desc: 'Generative AI for sales sequences.' },
  { name: 'Outreach',        category: 'Sales',       pricing: 'Custom',      rating: 4.3, site: 'https://www.outreach.io',    desc: 'Sales execution platform with AI assist.' },
  { name: 'Salesloft',       category: 'Sales',       pricing: 'Custom',      rating: 4.3, site: 'https://salesloft.com',      desc: 'Engagement platform with Rhythm AI.' },
  { name: 'Clari Copilot',   category: 'Sales',       pricing: 'Custom',      rating: 4.4, site: 'https://www.clari.com/products/copilot/', desc: 'Conversation intelligence for sales calls.' },
  { name: 'Gong',            category: 'Sales',       pricing: 'Custom',      rating: 4.6, site: 'https://www.gong.io',        desc: 'Revenue intelligence platform powered by AI.' },

  // Customer Support
  { name: 'Intercom Fin',    category: 'Support',     pricing: 'Custom',      rating: 4.5, site: 'https://www.intercom.com/fin', desc: 'AI agent that resolves customer questions.' },
  { name: 'Zendesk AI',      category: 'Support',     pricing: 'Custom',      rating: 4.4, site: 'https://www.zendesk.com/service/ai/', desc: 'AI in the Zendesk help-desk suite.' },
  { name: 'Ada',             category: 'Support',     pricing: 'Custom',      rating: 4.5, site: 'https://www.ada.cx',         desc: 'Brand-trained AI customer service.' },
  { name: 'Forethought',     category: 'Support',     pricing: 'Custom',      rating: 4.3, site: 'https://forethought.ai',     desc: 'AI ticket triage and resolution.' },
  { name: 'Tidio',           category: 'Support',     pricing: 'Free + Pro',  rating: 4.4, site: 'https://www.tidio.com',      desc: 'Live chat + AI bot for SMBs.' },
  { name: 'Crisp',           category: 'Support',     pricing: 'Free + Pro',  rating: 4.3, site: 'https://crisp.chat',         desc: 'Inbox + chatbot with MagicReply AI.' },

  // Data & Analytics
  { name: 'Hex',             category: 'Data',        pricing: 'Free + Pro',  rating: 4.6, site: 'https://hex.tech',           desc: 'Notebook + dashboard tool with Magic AI.' },
  { name: 'Mode AI',         category: 'Data',        pricing: 'Custom',      rating: 4.4, site: 'https://mode.com',           desc: 'AI helper inside Mode\'s SQL/notebook tool.' },
  { name: 'Julius',          category: 'Data',        pricing: 'Free + Pro',  rating: 4.5, site: 'https://julius.ai',          desc: 'Chat with your data and produce charts.' },
  { name: 'Akkio',           category: 'Data',        pricing: '$50+/mo',     rating: 4.3, site: 'https://www.akkio.com',      desc: 'No-code ML for marketers and analysts.' },
  { name: 'Defog',           category: 'Data',        pricing: 'Free + Pro',  rating: 4.4, site: 'https://defog.ai',           desc: 'Natural-language → SQL across your warehouse.' },
  { name: 'AI2SQL',          category: 'Data',        pricing: 'Free + Pro',  rating: 4.2, site: 'https://www.ai2sql.io',      desc: 'Plain English to SQL queries.' },
  { name: 'Vanna AI',        category: 'Data',        pricing: 'Open source', rating: 4.5, site: 'https://vanna.ai',           desc: 'Train your own text-to-SQL on your schema.' },

  // Agents & Frameworks
  { name: 'LangChain',       category: 'Agents',      pricing: 'Open source', rating: 4.6, site: 'https://www.langchain.com',  desc: 'The most popular framework for building LLM apps.' },
  { name: 'LlamaIndex',      category: 'Agents',      pricing: 'Open source', rating: 4.5, site: 'https://www.llamaindex.ai',  desc: 'Data framework for RAG over your documents.' },
  { name: 'CrewAI',          category: 'Agents',      pricing: 'Open source', rating: 4.5, site: 'https://www.crewai.com',     desc: 'Build collaborative multi-agent systems.' },
  { name: 'AutoGen',         category: 'Agents',      pricing: 'Open source', rating: 4.4, site: 'https://microsoft.github.io/autogen/', desc: 'Microsoft\'s multi-agent conversation framework.' },
  { name: 'Lindy',           category: 'Agents',      pricing: 'Free + Pro',  rating: 4.4, site: 'https://www.lindy.ai',       desc: 'No-code AI employees for any workflow.' },
  { name: 'Relevance AI',    category: 'Agents',      pricing: 'Free + Pro',  rating: 4.3, site: 'https://relevanceai.com',    desc: 'Build no-code AI workforces.' },
  { name: 'OpenAI GPTs',     category: 'Agents',      pricing: 'ChatGPT Plus',rating: 4.5, site: 'https://chat.openai.com/gpts', desc: 'Build custom GPTs without code.' },
  { name: 'Replicate',       category: 'Agents',      pricing: 'Pay-per-use', rating: 4.6, site: 'https://replicate.com',      desc: 'Run any open-source model with one API call.' },
  { name: 'Vercel AI SDK',   category: 'Agents',      pricing: 'Open source', rating: 4.7, site: 'https://sdk.vercel.ai',      desc: 'Streaming AI for TypeScript apps, by Vercel.' },
  { name: 'Anthropic API',   category: 'Agents',      pricing: 'Pay-per-use', rating: 4.8, site: 'https://www.anthropic.com',  desc: 'Claude\'s API for builders.' },
  { name: 'OpenAI API',      category: 'Agents',      pricing: 'Pay-per-use', rating: 4.7, site: 'https://platform.openai.com',desc: 'GPT-4o, o-series, embeddings, voice.' },
  { name: 'Together AI',     category: 'Agents',      pricing: 'Pay-per-use', rating: 4.5, site: 'https://www.together.ai',    desc: 'Cheap, fast inference for open-source models.' },

  // Vector / RAG
  { name: 'Pinecone',        category: 'Infra',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.pinecone.io',    desc: 'Managed vector database for production RAG.' },
  { name: 'Weaviate',        category: 'Infra',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://weaviate.io',        desc: 'Open-source vector database with hybrid search.' },
  { name: 'Chroma',          category: 'Infra',       pricing: 'Open source', rating: 4.6, site: 'https://www.trychroma.com',  desc: 'Embedding database loved by hackers.' },
  { name: 'Qdrant',          category: 'Infra',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://qdrant.tech',        desc: 'High-performance vector search engine.' },
  { name: 'Milvus',          category: 'Infra',       pricing: 'Open source', rating: 4.4, site: 'https://milvus.io',          desc: 'Open-source vector database for billion-scale RAG.' },
  { name: 'Supabase Vector', category: 'Infra',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://supabase.com/vector',desc: 'Postgres vector store with pgvector.' },

  // Observability & Eval
  { name: 'LangSmith',       category: 'Infra',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.langchain.com/langsmith', desc: 'Tracing, eval and monitoring for LLM apps.' },
  { name: 'Langfuse',        category: 'Infra',       pricing: 'Free + Pro',  rating: 4.6, site: 'https://langfuse.com',       desc: 'Open-source LLM observability + analytics.' },
  { name: 'Helicone',        category: 'Infra',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://helicone.ai',        desc: 'Drop-in proxy for LLM logs and analytics.' },
  { name: 'Braintrust',      category: 'Infra',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.braintrust.dev', desc: 'Eval and experimentation for LLM apps.' },
  { name: 'PromptLayer',     category: 'Infra',       pricing: 'Free + Pro',  rating: 4.3, site: 'https://promptlayer.com',    desc: 'Prompt management + version control.' },

  // Slides & Documents
  { name: 'Gamma',           category: 'Slides',      pricing: 'Free + Pro',  rating: 4.7, badge: 'Editor pick', site: 'https://gamma.app', desc: 'Generate beautiful decks and docs from a prompt.' },
  { name: 'Tome',            category: 'Slides',      pricing: 'Free + Pro',  rating: 4.4, site: 'https://tome.app',           desc: 'AI-native storytelling and decks.' },
  { name: 'Beautiful.ai',    category: 'Slides',      pricing: '$12+/mo',     rating: 4.3, site: 'https://www.beautiful.ai',   desc: 'Smart slide templates that auto-design.' },
  { name: 'Plus AI',         category: 'Slides',      pricing: '$10+/mo',     rating: 4.4, site: 'https://www.plusdocs.com',   desc: 'AI for Google Slides — generate and remix.' },
  { name: 'Decktopus',       category: 'Slides',      pricing: '$15+/mo',     rating: 4.3, site: 'https://www.decktopus.com',  desc: 'Generate decks from a single prompt.' },

  // Translation & Language
  { name: 'DeepL',           category: 'Translation', pricing: 'Free + Pro',  rating: 4.8, badge: 'Editor pick', site: 'https://www.deepl.com', desc: 'The most natural translations for pro use.' },
  { name: 'DeepL Write',     category: 'Translation', pricing: 'Free + Pro',  rating: 4.6, site: 'https://www.deepl.com/write',desc: 'Better word choice and tone in 9 languages.' },
  { name: 'Smartcat',        category: 'Translation', pricing: 'Custom',      rating: 4.4, site: 'https://www.smartcat.com',   desc: 'AI translation + localization platform.' },

  // Education & Learning
  { name: 'Khan Academy AI', category: 'Education',   pricing: 'Free',        rating: 4.6, site: 'https://www.khanmigo.ai',    desc: 'Khan Academy\'s AI tutor for students.' },
  { name: 'Duolingo Max',    category: 'Education',   pricing: '$30/mo',      rating: 4.5, site: 'https://www.duolingo.com/max',desc: 'GPT-4 powered language tutor.' },
  { name: 'Quizlet AI',      category: 'Education',   pricing: 'Free + Pro',  rating: 4.4, site: 'https://quizlet.com',        desc: 'Q-Chat tutor + AI flashcard generation.' },
  { name: 'StudyFetch',      category: 'Education',   pricing: 'Free + Pro',  rating: 4.4, site: 'https://www.studyfetch.com', desc: 'AI study assistant for any course material.' },
  { name: 'Coursera Coach',  category: 'Education',   pricing: 'Coursera Plus',rating: 4.3,site: 'https://www.coursera.org',   desc: 'AI tutor inside Coursera courses.' },

  // Health & Wellness
  { name: 'Whoop Coach',     category: 'Health',      pricing: 'Whoop sub',   rating: 4.4, site: 'https://www.whoop.com',      desc: 'GPT-4 powered fitness coach in the Whoop app.' },
  { name: 'Oura AI',         category: 'Health',      pricing: 'Oura sub',    rating: 4.5, site: 'https://ouraring.com',       desc: 'AI insights from your Oura ring data.' },
  { name: 'Wysa',            category: 'Health',      pricing: 'Free + Pro',  rating: 4.4, site: 'https://www.wysa.com',       desc: 'Mental health AI chatbot.' },

  // Real Estate & Niche
  { name: 'Lalal.ai',        category: 'Music',       pricing: 'Free + Pro',  rating: 4.6, site: 'https://www.lalal.ai',       desc: 'Stem splitter — separate vocals + instruments.' },
  { name: 'Splice AI',       category: 'Music',       pricing: 'Splice sub',  rating: 4.5, site: 'https://splice.com',         desc: 'AI sample search for producers.' },
  { name: 'Boomy',           category: 'Music',       pricing: 'Free + Pro',  rating: 4.2, site: 'https://boomy.com',          desc: 'Make + monetize AI songs.' },
  { name: 'Soundraw',        category: 'Music',       pricing: '$17+/mo',     rating: 4.4, site: 'https://soundraw.io',        desc: 'Royalty-free AI music for creators.' },

  // Misc Power Tools
  { name: 'Raycast AI',      category: 'Productivity',pricing: '$8+/mo',      rating: 4.7, badge: 'Editor pick', site: 'https://www.raycast.com/ai', desc: 'AI in your Mac launcher — Cmd+Space and ask.' },
  { name: 'Arc Max',         category: 'Productivity',pricing: 'Free',        rating: 4.5, site: 'https://arc.net/max',        desc: 'AI features baked into the Arc browser.' },
  { name: 'SaneBox',         category: 'Productivity',pricing: '$7+/mo',      rating: 4.5, site: 'https://www.sanebox.com',    desc: 'AI inbox triage that learns your priorities.' },
  { name: 'Superhuman AI',   category: 'Productivity',pricing: '$30+/mo',     rating: 4.6, site: 'https://superhuman.com',     desc: 'Email at the speed of thought, with AI assist.' },
  { name: 'Bardeen',         category: 'Productivity',pricing: 'Free + Pro',  rating: 4.4, site: 'https://www.bardeen.ai',     desc: 'Browser automations triggered by AI.' },
  { name: 'Browse.ai',       category: 'Productivity',pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.browse.ai',      desc: 'Train a bot to scrape any site, no code.' },
  { name: 'Browserbase',     category: 'Infra',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.browserbase.com',desc: 'Headless browser infra for AI agents.' },
  { name: 'E2B',             category: 'Infra',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://e2b.dev',            desc: 'Sandbox cloud for running AI-generated code.' },

  // Extra image / video
  { name: 'ClipDrop',        category: 'Image',       pricing: 'Free + Pro',  rating: 4.5, site: 'https://clipdrop.co',        desc: 'Suite of image utilities by Stability AI.' },
  { name: 'Remove.bg',       category: 'Image',       pricing: 'Free + Pro',  rating: 4.7, site: 'https://www.remove.bg',      desc: 'One-click background remover.' },
  { name: 'Upscayl',         category: 'Image',       pricing: 'Free OSS',    rating: 4.5, site: 'https://upscayl.org',        desc: 'Free, open-source AI image upscaler.' },
  { name: 'NightCafe',       category: 'Image',       pricing: 'Free + Pro',  rating: 4.3, site: 'https://nightcafe.studio',   desc: 'Friendly AI art community + generator.' },

  // More Productivity / Misc
  { name: 'Cal.com AI',      category: 'Productivity',pricing: 'Free + Pro',  rating: 4.4, site: 'https://cal.com',            desc: 'Open-source scheduling with AI helpers.' },
  { name: 'Ellie',           category: 'Productivity',pricing: '$10/mo',      rating: 4.3, site: 'https://ellieai.com',        desc: 'AI email reply trained in your voice.' },
  { name: 'Mailmaestro',     category: 'Productivity',pricing: 'Free + Pro',  rating: 4.3, site: 'https://www.maestrolabs.com',desc: 'AI assistant inside Outlook + Gmail.' },
  { name: 'Compose AI',      category: 'Productivity',pricing: 'Free + Pro',  rating: 4.2, site: 'https://www.compose.ai',     desc: 'AI autocomplete for email & docs.' },
  { name: 'Tactiq',          category: 'Productivity',pricing: 'Free + Pro',  rating: 4.4, site: 'https://tactiq.io',          desc: 'Live transcripts in Meet/Zoom/Teams.' },
  { name: 'Fellow',          category: 'Productivity',pricing: 'Free + Pro',  rating: 4.4, site: 'https://fellow.app',         desc: 'AI meeting agendas, notes and follow-ups.' },

  // Finance / Legal
  { name: 'Harvey',          category: 'Legal',       pricing: 'Enterprise',  rating: 4.5, site: 'https://www.harvey.ai',      desc: 'Generative AI for elite law firms.' },
  { name: 'Spellbook',       category: 'Legal',       pricing: 'Custom',      rating: 4.4, site: 'https://www.spellbook.legal',desc: 'AI contract drafting in MS Word.' },
  { name: 'Ironclad AI',     category: 'Legal',       pricing: 'Custom',      rating: 4.4, site: 'https://ironcladapp.com',    desc: 'AI inside the contract lifecycle platform.' },
  { name: 'Kasisto',         category: 'Finance',     pricing: 'Custom',      rating: 4.3, site: 'https://kasisto.com',        desc: 'AI for banking and financial services.' },

  // Hiring / HR
  { name: 'HireVue',         category: 'HR',          pricing: 'Custom',      rating: 4.3, site: 'https://www.hirevue.com',    desc: 'AI-driven video interview platform.' },
  { name: 'Eightfold',       category: 'HR',          pricing: 'Custom',      rating: 4.5, site: 'https://eightfold.ai',       desc: 'AI talent intelligence for the enterprise.' },
  { name: 'Paradox',         category: 'HR',          pricing: 'Custom',      rating: 4.4, site: 'https://www.paradox.ai',     desc: 'Conversational AI for hourly hiring (Olivia).' },

  // Niche Power Tools
  { name: 'Beehiiv AI',      category: 'Marketing',   pricing: 'Free + Pro',  rating: 4.5, site: 'https://www.beehiiv.com',    desc: 'Newsletter platform with AI writing tools.' },
  { name: 'Substack AI',     category: 'Marketing',   pricing: 'Free',        rating: 4.3, site: 'https://substack.com',       desc: 'Native AI assist inside the Substack editor.' },
  { name: 'Pico',            category: 'Coding',      pricing: 'Free + Pro',  rating: 4.3, site: 'https://picoapps.xyz',       desc: 'AI mini-app generator for makers.' },
  { name: 'Cody by Sourcegraph', category: 'Coding',  pricing: 'Free + Pro',  rating: 4.5, site: 'https://sourcegraph.com/cody',desc: 'Code intelligence assistant on your repo.' },
  { name: 'Mintlify',        category: 'Documents',   pricing: 'Free + Pro',  rating: 4.6, site: 'https://mintlify.com',       desc: 'AI-powered docs your devs actually want to write.' },

  // Travel & Lifestyle
  { name: 'Layla',           category: 'Travel',      pricing: 'Free + Pro',  rating: 4.3, site: 'https://justlayla.com',      desc: 'Conversational AI travel agent.' },
  { name: 'Wonderplan',      category: 'Travel',      pricing: 'Free',        rating: 4.2, site: 'https://wonderplan.ai',      desc: 'AI itinerary builder.' },
  { name: 'Roam Around',     category: 'Travel',      pricing: 'Free + Pro',  rating: 4.1, site: 'https://www.roamaround.io',  desc: 'AI trip planning chatbot.' },

  // Image extras
  { name: 'Photoroom',       category: 'Image',       pricing: 'Free + Pro',  rating: 4.6, site: 'https://www.photoroom.com',  desc: 'AI photo editor for ecommerce + creators.' },
  { name: 'Pixlr AI',        category: 'Image',       pricing: 'Free + Pro',  rating: 4.4, site: 'https://pixlr.com',          desc: 'Browser image editor with AI tools.' },
  { name: 'ProWritingAid',   category: 'Writing',     pricing: 'Free + Pro',  rating: 4.4, site: 'https://prowritingaid.com',  desc: 'In-depth grammar + style suggestions.' },

  // Knowledge & search
  { name: 'Mendable',        category: 'Documents',   pricing: 'Free + Pro',  rating: 4.4, site: 'https://www.mendable.ai',    desc: 'Add a chatbot to any docs site.' },
  { name: 'Dust',            category: 'Productivity',pricing: '$29+/mo',     rating: 4.5, site: 'https://dust.tt',             desc: 'Custom AI assistants connected to your tools.' },
  { name: 'Anything LLM',    category: 'Agents',      pricing: 'Open source', rating: 4.4, site: 'https://anythingllm.com',    desc: 'Self-host a private RAG chatbot in minutes.' },
  { name: 'Open WebUI',      category: 'Agents',      pricing: 'Open source', rating: 4.6, site: 'https://openwebui.com',      desc: 'A polished UI for any local or hosted LLM.' },
  { name: 'Ollama',          category: 'Agents',      pricing: 'Free OSS',    rating: 4.7, site: 'https://ollama.com',         desc: 'Run open-source LLMs locally with one command.' },
  { name: 'LM Studio',       category: 'Agents',      pricing: 'Free',        rating: 4.6, site: 'https://lmstudio.ai',        desc: 'Desktop app for running local LLMs.' },

  // Misc tail (round us out)
  { name: 'Otterwave',       category: 'Audio',       pricing: 'Free + Pro',  rating: 4.2, site: 'https://otterwave.com',      desc: 'AI music remixing for creators.' },
  { name: 'Soundverse',      category: 'Audio',       pricing: 'Free + Pro',  rating: 4.3, site: 'https://www.soundverse.ai',  desc: 'AI music generation studio.' },
  { name: 'Storyteller AI',  category: 'Writing',     pricing: '$5+/mo',      rating: 4.2, site: 'https://www.storyteller.ai', desc: 'AI children\'s book generator.' },
  { name: 'Heeyo',           category: 'Education',   pricing: 'Free + Pro',  rating: 4.3, site: 'https://www.heeyo.ai',       desc: 'Safe AI playmate for kids.' },
  { name: 'Tutor AI',        category: 'Education',   pricing: 'Free + Pro',  rating: 4.2, site: 'https://www.tutorai.me',     desc: 'On-demand AI tutor for any topic.' },
  { name: 'CommandBar',      category: 'Productivity',pricing: 'Custom',      rating: 4.4, site: 'https://www.commandbar.com', desc: 'In-app AI command palette + onboarding.' },
];

// Compute simple ranking (1-N) by rating then editor pick
TOOLS.sort((a, b) => (b.rating - a.rating) || (a.name.localeCompare(b.name)));
TOOLS.forEach((t, i) => { t.rank = i + 1; });

export const TOOL_CATEGORIES = ['All', ...Array.from(new Set(TOOLS.map((t) => t.category))).sort()];
