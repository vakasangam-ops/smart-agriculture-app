import bcrypt from 'bcryptjs';

export async function getSeedData() {
  const passwordHash = await bcrypt.hash('Krishi@123', 10);

  const users = [
    {
      id: 'usr_farmer_1',
      name: 'Ramesh Varma (రామేశ్ వర్మ)',
      phone: '9876543210',
      email: 'ramesh.farmer@krishisahayak.in',
      password_hash: passwordHash,
      role: 'FARMER',
      village: 'Tenali',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      language: 'te',
      created_at: '2026-06-01T08:00:00Z'
    },
    {
      id: 'usr_farmer_2',
      name: 'Suresh Patil (सुरेश पाटिल)',
      phone: '9876543211',
      email: 'suresh.patil@krishisahayak.in',
      password_hash: passwordHash,
      role: 'FARMER',
      village: 'Baramati',
      district: 'Pune',
      state: 'Maharashtra',
      language: 'hi',
      created_at: '2026-06-10T09:30:00Z'
    },
    {
      id: 'usr_staff_1',
      name: 'Anitha Devi (అనిత దేవి)',
      phone: '9876543220',
      email: 'anitha.rbk@krishisahayak.in',
      password_hash: passwordHash,
      role: 'SERVICE_CENTER_STAFF',
      village: 'Tenali RBK Center',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      language: 'te',
      created_at: '2026-05-15T10:00:00Z'
    },
    {
      id: 'usr_expert_1',
      name: 'Dr. K. Venkat Rao (వ్యవసాయ శాస్త్రవేత్త)',
      phone: '9876543230',
      email: 'dr.venkatrao@kvk.icar.gov.in',
      password_hash: passwordHash,
      role: 'AGRI_EXPERT',
      village: 'KVK Lam Agronomy Station',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      language: 'te',
      created_at: '2026-05-10T11:00:00Z'
    },
    {
      id: 'usr_admin_1',
      name: 'Rajesh Sharma (పరిపాలనాధికారి)',
      phone: '9876543240',
      email: 'rajesh.admin@krishisahayak.gov.in',
      password_hash: passwordHash,
      role: 'ADMIN',
      village: 'District Agriculture Office',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      language: 'en',
      created_at: '2026-05-01T09:00:00Z'
    }
  ];

  const farms = [
    {
      id: 'farm_1',
      user_id: 'usr_farmer_1',
      farm_name: 'Sri Lakshmi Chenu (శ్రీ లక్ష్మి చేను)',
      survey_no: '142/3B',
      area_acres: 4.5,
      soil_type: 'Black Cotton Soil (నల్లరేగడి నేల)',
      irrigation_type: 'Canal & Borewell (కాలువ & బోరు)',
      village: 'Tenali',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      created_at: '2026-06-02T10:00:00Z'
    },
    {
      id: 'farm_2',
      user_id: 'usr_farmer_1',
      farm_name: 'Ganga Polam (గంగా పొలం)',
      survey_no: '88/1A',
      area_acres: 3.0,
      soil_type: 'Alluvial Loam (ఒండ్రు నేల)',
      irrigation_type: 'Krishna Canal Riverlift',
      village: 'Kollipara',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      created_at: '2026-06-05T14:00:00Z'
    },
    {
      id: 'farm_3',
      user_id: 'usr_farmer_2',
      farm_name: 'Sai Krishi Sheti (साई कृषि शेत)',
      survey_no: '210/4',
      area_acres: 6.0,
      soil_type: 'Medium Black Soil (मध्यम काली मिट्टी)',
      irrigation_type: 'Drip Irrigation & Well (ड्रिप सिंचाई)',
      village: 'Baramati',
      district: 'Pune',
      state: 'Maharashtra',
      created_at: '2026-06-12T11:00:00Z'
    }
  ];

  const crops = [
    {
      id: 'crop_1',
      farm_id: 'farm_1',
      crop_name: 'Guntur Teja Chilli (మిరప)',
      variety: 'LCA-334 / Teja Super',
      season: 'Kharif',
      sowing_date: '2026-07-15',
      expected_harvest_date: '2027-01-20',
      stage: 'Flowering & Fruit Setting',
      health_status: 'Issue Reported (Leaf Curl)',
      area_acres: 2.5,
      created_at: '2026-07-15T09:00:00Z'
    },
    {
      id: 'crop_2',
      farm_id: 'farm_1',
      crop_name: 'BPT 5204 Samba Mahsuri Paddy (వరి)',
      variety: 'BPT 5204 (Sub-1)',
      season: 'Kharif',
      sowing_date: '2026-08-01',
      expected_harvest_date: '2026-11-25',
      stage: 'Grain Filling',
      health_status: 'Healthy',
      area_acres: 2.0,
      created_at: '2026-08-01T10:00:00Z'
    },
    {
      id: 'crop_3',
      farm_id: 'farm_3',
      crop_name: 'Yellow Soybean (सोयाबीन)',
      variety: 'JS-335',
      season: 'Kharif',
      sowing_date: '2026-06-25',
      expected_harvest_date: '2026-10-15',
      stage: 'Pod Maturity',
      health_status: 'Healthy',
      area_acres: 6.0,
      created_at: '2026-06-25T11:30:00Z'
    }
  ];

  const crop_issues = [
    {
      id: 'iss_1',
      crop_id: 'crop_1',
      farmer_id: 'usr_farmer_1',
      title: 'Severe leaf curling, upward puckering, and yellow mosaic in chilli crop',
      description: 'The top young leaves are curling upwards into boat shapes with shortened internodes. Noticed small yellowish specks and flower drop since past 5 days.',
      image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80',
      symptoms: 'Upward leaf curl, yellow veins, flower drop, stunted apical growth',
      preliminary_ai_advisory: 'Automated preliminary pattern match: Symptoms strongly correlate with Chilli Leaf Curl Begomovirus transmitted by Whitefly (Bemisia tabaci) and Thrips (Scirtothrips dorsalis). Not an official guarantee. Awaiting scientist confirmation.',
      ai_disclaimer: 'Automated preliminary advisory is for early screening only and does NOT guarantee diagnosis. Always verify with designated KVK/ICAR scientist before spraying chemicals.',
      urgency: 'HIGH',
      status: 'RESOLVED',
      expert_id: 'usr_expert_1',
      expert_diagnosis: 'Confirmed Chilli Leaf Curl Complex (Thrips + Whitefly vector infestation with early begomovirus symptoms).',
      chemical_treatment: 'Diafenthiuron 50% WP @ 1.25 g/L OR Fipronil 5% SC @ 2.0 ml/L of clean water.',
      organic_treatment: 'Neem Oil (Azadirachtin 10,000 ppm) @ 2.5 ml/L + Dashaparni Kashayam. Install 20 yellow and blue sticky traps per acre.',
      dosage: 'Spraying volume: 200 Litres of water per acre using hollow cone nozzle.',
      spray_instructions: 'Spray strictly between 4:30 PM and 6:30 PM when wind speed is under 12 km/h. Ensure complete coverage under the foliage.',
      safety_precautions: 'Wear full sleeve clothing, eye goggles, and nitrile gloves. Strict Pre-Harvest Interval (PHI) of 14 days before harvest.',
      expert_notes: 'Maintain adequate soil moisture; drought stress increases mite and thrips multiplication. Repeat organic spray after 8 days.',
      resolved_at: '2026-09-28T16:00:00Z',
      created_at: '2026-09-27T08:30:00Z'
    },
    {
      id: 'iss_2',
      crop_id: 'crop_2',
      farmer_id: 'usr_farmer_1',
      title: 'Spindle-shaped brown lesions on paddy leaf blade (Suspected Blast)',
      description: 'Found diamond/spindle shaped spots with grey center and brown margins on lower and middle leaves in nursery plot.',
      image_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
      symptoms: 'Spindle-shaped lesions, brown margins, ash center',
      preliminary_ai_advisory: 'Preliminary match: Magnaporthe oryzae (Rice Blast / Leaf Blast). High humidity (>90%) and cloudy weather accelerate spread. Consult KVK agronomist immediately.',
      ai_disclaimer: 'Automated advisory is for preliminary screening only and does NOT guarantee diagnosis. Final treatment must follow qualified agricultural expert review.',
      urgency: 'HIGH',
      status: 'UNDER_REVIEW',
      expert_id: 'usr_expert_1',
      expert_diagnosis: 'Pending physical sample verification. Preliminary recommendation issued.',
      chemical_treatment: 'Tricyclazole 75% WP @ 0.6 g/L water or Isoprothiolane 40% EC @ 1.5 ml/L.',
      organic_treatment: 'Pseudomonas fluorescens 0.5% (5g/L) foliar spray. Avoid excessive urea application.',
      dosage: '200 L water per acre.',
      spray_instructions: 'Spray in morning once dew dries up. Avoid spraying if rain forecasted within 4 hours.',
      safety_precautions: 'Do not drain paddy water into adjacent fish ponds.',
      expert_notes: 'Field inspection scheduled for tomorrow morning.',
      resolved_at: null,
      created_at: '2026-10-02T11:15:00Z'
    }
  ];

  const services = [
    {
      id: 'srv_1',
      code: 'EQP-TRAC-575',
      name: 'Mahindra 575 DI Tractor with 9-Tyne Cultivator (ట్రాక్టర్ దున్నకం)',
      category: 'EQUIPMENT_RENTAL',
      description: 'Heavy duty 45 HP tractor for deep plowing, land preparation, and rotavating. Includes fuel and certified operator.',
      unit: 'PER_HOUR',
      rate_inr: 450.00,
      subsidy_applicable: true,
      subsidy_pct: 50.00,
      availability_status: 'AVAILABLE',
      center_name: 'Tenali Rythu Bharosa Kendram (RBK)',
      village: 'Tenali',
      contact_phone: '08644-223344'
    },
    {
      id: 'srv_2',
      code: 'EQP-DRONE-01',
      name: 'Agriculture Drone Foliar Spraying (వ్యవసాయ డ్రోన్ స్ప్రేయింగ్)',
      category: 'DRONE_SPRAY',
      description: 'Precision battery-operated 10L drone for micronutrient & biopesticide spraying. Covers 1 acre in just 8 minutes with uniform atomization.',
      unit: 'PER_ACRE',
      rate_inr: 350.00,
      subsidy_applicable: true,
      subsidy_pct: 40.00,
      availability_status: 'AVAILABLE',
      center_name: 'Tenali Rythu Bharosa Kendram (RBK)',
      village: 'Tenali',
      contact_phone: '08644-223344'
    },
    {
      id: 'srv_3',
      code: 'LAB-SOIL-STD',
      name: 'Comprehensive Soil Health Card Test (సమగ్ర నేల పరీక్ష)',
      category: 'SOIL_TESTING',
      description: 'Analysis of pH, EC, Organic Carbon, Available Nitrogen (N), Phosphorus (P2O5), Potassium (K2O), Zinc, Iron, and tailored fertilizer card.',
      unit: 'PER_SAMPLE',
      rate_inr: 120.00,
      subsidy_applicable: true,
      subsidy_pct: 100.00,
      availability_status: 'AVAILABLE',
      center_name: 'Guntur District Soil Testing Laboratory',
      village: 'Guntur KVK',
      contact_phone: '0863-229911'
    },
    {
      id: 'srv_4',
      code: 'EQP-HARV-02',
      name: 'Tracked Paddy Combine Harvester (వరి కోత యంత్రం)',
      category: 'EQUIPMENT_RENTAL',
      description: 'Rubber-tracked combine harvester suitable for wet and marshy paddy fields. Cuts, threshes, and cleans paddy in single operation.',
      unit: 'PER_HOUR',
      rate_inr: 1800.00,
      subsidy_applicable: false,
      subsidy_pct: 0.00,
      availability_status: 'AVAILABLE',
      center_name: 'Tenali Rythu Bharosa Kendram (RBK)',
      village: 'Tenali',
      contact_phone: '08644-223344'
    },
    {
      id: 'srv_5',
      code: 'CSC-PMKISAN-EKYC',
      name: 'PM-KISAN e-KYC & Land Seeding Verification (ఇ-కేవైసీ సేవా కేంద్రం)',
      category: 'CSC_SERVICES',
      description: 'Biometric Aadhaar authentication, NPCI bank account DBT linking, and land record seeding for PM-KISAN & Rythu Bharosa installments.',
      unit: 'FIXED',
      rate_inr: 25.00,
      subsidy_applicable: false,
      subsidy_pct: 0.00,
      availability_status: 'AVAILABLE',
      center_name: 'Tenali Rythu Bharosa Kendram (RBK)',
      village: 'Tenali',
      contact_phone: '08644-223344'
    }
  ];

  const service_bookings = [
    {
      id: 'sbk_1',
      service_id: 'srv_2',
      farmer_id: 'usr_farmer_1',
      booking_date: '2026-10-08',
      time_slot: '07:00 AM - 09:00 AM',
      quantity: 2.5,
      total_amount_inr: 525.00, // 350 * 2.5 * 0.60 after subsidy
      status: 'CONFIRMED',
      farmer_notes: 'Foliar micronutrient & bio-stimulant spray on chilli plot 1.',
      staff_notes: 'Drone operator Shri Satyanarayana assigned. Verified battery and chemical tank.',
      assigned_staff_id: 'usr_staff_1',
      created_at: '2026-10-03T10:00:00Z'
    },
    {
      id: 'sbk_2',
      service_id: 'srv_3',
      farmer_id: 'usr_farmer_1',
      booking_date: '2026-10-10',
      time_slot: '10:00 AM - 12:00 PM',
      quantity: 1.0,
      total_amount_inr: 0.00, // 100% subsidized
      status: 'PENDING',
      farmer_notes: 'Soil sample collection from Survey No 88/1A after paddy harvest.',
      staff_notes: 'Sample collection kit handed over to farmer.',
      assigned_staff_id: 'usr_staff_1',
      created_at: '2026-10-04T14:30:00Z'
    }
  ];

  const soil_health_records = [
    {
      id: 'shc_1',
      farmer_id: 'usr_farmer_1',
      farm_id: 'farm_1',
      sample_date: '2026-05-20',
      ph_level: 7.8,
      organic_carbon_pct: 0.42,
      nitrogen_kg_ha: 185.0, // Low (<280)
      phosphorus_kg_ha: 38.5, // Medium (23-56)
      potassium_kg_ha: 340.0, // High (>280)
      zinc_ppm: 0.48, // Deficient (<0.6)
      iron_ppm: 5.2, // Sufficient
      electrical_conductivity: 0.45,
      recommendations: 'Organic carbon is low; incorporate 5 tonnes/acre Farm Yard Manure (FYM) or green manuring with Sunnhemp. Nitrogen is deficient; split urea applications. Apply 10 kg Zinc Sulphate (21% Zn) per acre.',
      fertilizer_plan: 'Base dose: 50 kg DAP + 25 kg MOP + 10 kg ZnSO4. Top dressing: Urea in 3 splits at 25, 45, and 65 days after transplanting.',
      tested_by: 'usr_expert_1',
      lab_name: 'Regional Agricultural Research Station Soil Testing Lab, Lam, Guntur',
      created_at: '2026-05-28T12:00:00Z'
    }
  ];

  const schemes = [
    {
      id: 'sch_1',
      scheme_code: 'PM-KISAN',
      name_en: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      name_te: 'పీఎం కిసాన్ (ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి)',
      name_hi: 'पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)',
      department: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
      level: 'CENTRAL',
      state_scope: 'ALL_INDIA',
      category: 'Income Support',
      max_benefit_inr: 6000.00,
      benefit_summary_en: 'Direct income support of ₹6,000 per year transferred directly to bank account in 3 equal installments of ₹2,000 every 4 months.',
      benefit_summary_te: 'సంవత్సరానికి ₹6,000 ప్రత్యక్ష ఆదాయ సహాయం, ప్రతి 4 నెలలకు ఒకసారి ₹2,000 చొప్పున 3 విడతలలో నేరుగా బ్యాంకు ఖాతాకు జమ.',
      benefit_summary_hi: 'सालाना ₹6,000 की प्रत्यक्ष आय सहायता, हर 4 महीने में ₹2,000 की 3 समान किस्तों में सीधे बैंक खाते में हस्तांतरित।',
      eligibility_en: 'All small and marginal landholder farmer families with cultivable land in their names. Must have Aadhaar linked bank account and completed e-KYC. Institutional landholders and high income taxpayers excluded.',
      eligibility_te: 'తమ పేరుపై సాగుభూమి ఉన్న రైతులందరూ అర్హులు. ఆధార్ అనుసంధాన బ్యాంక్ ఖాతా మరియు ఇ-కేవైసీ తప్పనిసరి. ఆదాయపు పన్ను చెల్లింపుదారులు మినహాయింపు.',
      eligibility_hi: 'अपने नाम पर खेती योग्य भूमि वाले सभी किसान परिवार। आधार से जुड़ा बैंक खाता और ई-केवाईसी अनिवार्य। आयकर दाता पात्र नहीं हैं।',
      required_documents: 'Aadhaar Card, Land Revenue Record (Pattadar Passbook / 1-B Record), Bank Passbook copy with IFSC, Mobile number linked with Aadhaar.',
      official_portal_url: 'https://pmkisan.gov.in',
      is_active: true
    },
    {
      id: 'sch_2',
      scheme_code: 'YSR-RB',
      name_en: 'YSR Rythu Bharosa - PM KISAN Combined Scheme',
      name_te: 'వైఎస్సార్ రైతు భరోసా - పీఎం కిసాన్ పథకం',
      name_hi: 'वाईएसआर रायथु भरोसा - पीएम किसान संयुक्त योजना',
      department: 'Department of Agriculture, Govt of Andhra Pradesh',
      level: 'STATE',
      state_scope: 'Andhra Pradesh',
      category: 'Input Subsidy',
      max_benefit_inr: 13500.00,
      benefit_summary_en: 'Total financial assistance of ₹13,500 per farmer family per year (₹7,500 state grant + ₹6,000 PM KISAN), distributed before Kharif, Rabi, and Sankranti harvest.',
      benefit_summary_te: 'రైతు కుటుంబానికి ఏడాదికి మొత్తం ₹13,500 ఆర్థిక సహాయం (రాష్ట్ర వాటా ₹7,500 + పీఎం కిసాన్ ₹6,000), ఖరీఫ్, రబీ మరియు సంక్రాంతి పంట కోత సమయంలో అందజేత.',
      benefit_summary_hi: 'प्रति किसान परिवार प्रति वर्ष कुल ₹13,500 की वित्तीय सहायता (राज्य अनुदान ₹7,500 + पीएम किसान ₹6,000)।',
      eligibility_en: 'Resident farmers of Andhra Pradesh cultivating land. Also covers Tenant Farmers (CCRC card holders) belonging to SC, ST, BC, and Minority communities.',
      eligibility_te: 'ఆంధ్రప్రదేశ్ లో భూమి కలిగిన రైతులు మరియు కౌలు రైతులు (CCRC కార్డుదారులు). ఎస్సీ, ఎస్టీ, బీసీ, మైనారిటీ కౌలు రైతులకు ప్రత్యేక ప్రాధాన్యత.',
      eligibility_hi: 'आंध्र प्रदेश के काश्तकार व पट्टाधारक किसान। एससी, एसटी, ओबीसी पट्टेदार किसानों को भी शामिल किया गया है।',
      required_documents: 'Pattadar Passbook, CCRC Agreement (for tenant farmers), Aadhaar Card, Active Bank Account, Rice Card (Ration card).',
      official_portal_url: 'https://ysrrythubharosa.ap.gov.in',
      is_active: true
    },
    {
      id: 'sch_3',
      scheme_code: 'PMFBY',
      name_en: 'PM Fasal Bima Yojana (Crop Insurance)',
      name_te: 'ప్రధాన మంత్రి ఫసల్ బీమా యోజన (పంట బీమా)',
      name_hi: 'प्रधानमंत्री फसल बीमा योजना (फसल बीमा)',
      department: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
      level: 'CENTRAL',
      state_scope: 'ALL_INDIA',
      category: 'Crop Insurance',
      max_benefit_inr: 50000.00,
      benefit_summary_en: 'Comprehensive risk coverage for standing crops against drought, flood, cyclone, pests, and localized post-harvest losses. Farmers pay only 1.5% to 2% premium.',
      benefit_summary_te: 'కరువు, వరదలు, తెగుళ్లు మరియు పంట కోత అనంతర నష్టాల నుండి సమగ్ర రక్షణ. రైతులు కేవలం 1.5% నుండి 2% ప్రీమియం మాత్రమే చెల్లించాలి.',
      benefit_summary_hi: 'सूखा, बाढ़, चक्रवात, कीटों से फसल क्षति पर संपूर्ण बीमा कवरेज। किसानों द्वारा केवल 1.5% से 2% प्रीमियम देय।',
      eligibility_en: 'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers. Both loanee and non-loanee farmers eligible.',
      eligibility_te: 'నోటిఫై చేయబడిన ప్రాంతాలలో పంటలు సాగు చేసే రైతులందరికీ వర్తిస్తుంది. బ్యాంకు రుణాలు పొందిన మరియు పొందని రైతులు కూడా దరఖాస్తు చేసుకోవచ్చు.',
      eligibility_hi: 'अधिसूचित क्षेत्रों में अधिसूचित फसल उगाने वाले सभी किसान। ऋणी और गैर-ऋणी दोनों किसान पात्र हैं।',
      required_documents: 'Land Record (Pahani / ROR / 1-B), Sowing Certificate from Village Agriculture Assistant (VAA), Aadhaar Card, Bank Passbook.',
      official_portal_url: 'https://pmfby.gov.in',
      is_active: true
    },
    {
      id: 'sch_4',
      scheme_code: 'SMAM-SUBSIDY',
      name_en: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      name_te: 'వ్యవసాయ యాంత్రీకరణ సబ్-మిషన్ (SMAM సబ్సిడీ)',
      name_hi: 'कृषि यंत्रीकरण उप-मिशन (एसएमएएम सब्सिडी)',
      department: 'Department of Agriculture, Cooperation and Farmers Welfare',
      level: 'CENTRAL',
      state_scope: 'ALL_INDIA',
      category: 'Farm Machinery Subsidy',
      max_benefit_inr: 125000.00,
      benefit_summary_en: '40% to 50% capital subsidy on purchase of Tractors, Power Tillers, Drone Sprayers, Rotavators, and Solar Pumps.',
      benefit_summary_te: 'ట్రాక్టర్లు, పవర్ టిల్లర్లు, వ్యవసాయ డ్రోన్లు, రోటవేటర్లపై 40% నుండి 50% వరకు రాయితీ.',
      benefit_summary_hi: 'ट्रैक्टर, रोटावेटर, पावर टिलर और ड्रोन खरीद पर 40% से 50% तक सरकारी सब्सिडी।',
      eligibility_en: 'Individual farmers, custom hiring centers (CHC), and farmer producer organizations (FPO). Priority for women, SC, ST, and marginal farmers.',
      eligibility_te: 'వ్యక్తిగత రైతులు, కస్టమ్ హైరింగ్ కేంద్రాలు (సిహెచ్‌సి) మరియు రైతు ఉత్పత్తిదారుల సంఘాలు (ఎఫ్‌పిఓ). మహిళలు మరియు ఎస్సీ/ఎస్టీలకు ప్రాధాన్యత.',
      eligibility_hi: 'व्यक्तिगत किसान, कस्टम हायरिंग सेंटर और एफपीओ। महिला, एससी व एसटी किसानों को प्राथमिकता।',
      required_documents: 'Aadhaar Card, Land ownership document, Caste certificate (if applicable), Bank cancelled cheque, Quotation from authorized dealer.',
      official_portal_url: 'https://agrimachinery.nic.in',
      is_active: true
    }
  ];

  const scheme_applications = [
    {
      id: 'app_1',
      scheme_id: 'sch_1',
      farmer_id: 'usr_farmer_1',
      application_no: 'PMK-2026-AP-99214',
      applicant_name: 'Ramesh Varma',
      aadhaar_last4: '5421',
      bank_account_last4: '9082',
      ifsc: 'SBIN0001234',
      land_passbook_no: 'AP-GNT-TN-1423',
      acres_applied: 4.5,
      documents_uploaded: 'Pattadar_Passbook_142.pdf, Aadhaar_Copy.pdf, Bank_Passbook.pdf',
      status: 'VERIFIED_BY_CENTER',
      verified_by: 'usr_staff_1',
      verification_notes: 'Physical land inspection completed. Aadhaar e-KYC active. Recommended for approval.',
      submission_date: '2026-08-14T11:00:00Z',
      updated_at: '2026-08-16T15:20:00Z'
    },
    {
      id: 'app_2',
      scheme_id: 'sch_4',
      farmer_id: 'usr_farmer_1',
      application_no: 'SMAM-2026-8812',
      applicant_name: 'Ramesh Varma',
      aadhaar_last4: '5421',
      bank_account_last4: '9082',
      ifsc: 'SBIN0001234',
      land_passbook_no: 'AP-GNT-TN-1423',
      acres_applied: 4.5,
      documents_uploaded: 'Tractor_Quotation.pdf, Land_Record.pdf',
      status: 'SUBMITTED',
      verified_by: null,
      verification_notes: null,
      submission_date: '2026-10-01T09:40:00Z',
      updated_at: '2026-10-01T09:40:00Z'
    }
  ];

  const market_prices = [
    {
      id: 'mkt_1',
      commodity_en: 'Chilli (Dry Red / Teja)',
      commodity_te: 'ఎండు మిర్చి (తేజ)',
      commodity_hi: 'लाल मिर्च (तेजा)',
      variety: 'Teja Premium Grade A',
      market_center: 'Guntur e-NAM Agriculture Market Yard',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      arrival_date: '2026-10-05',
      min_price: 16500.00,
      max_price: 21800.00,
      modal_price: 19400.00,
      unit: 'Quintal (100 kg)',
      trend: 'RISING',
      is_verified_feed: true,
      data_source_label: 'e-NAM Live APMC Feed (Guntur Market Yard)'
    },
    {
      id: 'mkt_2',
      commodity_en: 'Paddy (Common / BPT 5204)',
      commodity_te: 'వరి ధాన్యం (సాంబ మసూరి)',
      commodity_hi: 'धान (सांभा मसूरी)',
      variety: 'BPT 5204 Grade A',
      market_center: 'Tenali AMC Market Yard',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      arrival_date: '2026-10-05',
      min_price: 2280.00,
      max_price: 2460.00,
      modal_price: 2360.00,
      unit: 'Quintal (100 kg)',
      trend: 'STABLE',
      is_verified_feed: true,
      data_source_label: 'AP State Civil Supplies / e-NAM APMC'
    },
    {
      id: 'mkt_3',
      commodity_en: 'Cotton (Medium Staple)',
      commodity_te: 'పత్తి (మధ్యస్థ పింజ)',
      commodity_hi: 'कपास (मध्यम स्टेपल)',
      variety: 'Bt Cotton (Bunny / ATM)',
      market_center: 'Warangal Agricultural Market Committee',
      district: 'Warangal',
      state: 'Telangana',
      arrival_date: '2026-10-05',
      min_price: 6950.00,
      max_price: 7520.00,
      modal_price: 7280.00,
      unit: 'Quintal (100 kg)',
      trend: 'RISING',
      is_verified_feed: true,
      data_source_label: 'Telangana Rythu Bandhu APMC Feed'
    },
    {
      id: 'mkt_4',
      commodity_en: 'Soybean (Yellow)',
      commodity_te: 'సోయాబీన్ (పసుపు)',
      commodity_hi: 'सोयाबीन (पीला)',
      variety: 'JS-335 / Yellow',
      market_center: 'Latur APMC Yard',
      district: 'Latur',
      state: 'Maharashtra',
      arrival_date: '2026-10-05',
      min_price: 4200.00,
      max_price: 4780.00,
      modal_price: 4560.00,
      unit: 'Quintal (100 kg)',
      trend: 'FALLING',
      is_verified_feed: true,
      data_source_label: 'MSAMB Maharashtra State Agmarknet'
    },
    {
      id: 'mkt_5',
      commodity_en: 'Wheat (Sharbati / Lokwan)',
      commodity_te: 'గోధుమలు',
      commodity_hi: 'गेहूं (शरबती / लोकवन)',
      variety: 'Lokwan Grade I',
      market_center: 'Indore Mandi',
      district: 'Indore',
      state: 'Madhya Pradesh',
      arrival_date: '2026-10-05',
      min_price: 2450.00,
      max_price: 2850.00,
      modal_price: 2650.00,
      unit: 'Quintal (100 kg)',
      trend: 'STABLE',
      is_verified_feed: true,
      data_source_label: 'MP Mandi Board Agmarknet Feed'
    },
    {
      id: 'mkt_6',
      commodity_en: 'Tomato (Hybrid)',
      commodity_te: 'టమోటా (హైబ్రిడ్)',
      commodity_hi: 'टमाटर (हाइब्रिड)',
      variety: 'Vaishnavi / US-440',
      market_center: 'Madanapalle Tomato Market',
      district: 'Annamayya',
      state: 'Andhra Pradesh',
      arrival_date: '2026-10-05',
      min_price: 1400.00,
      max_price: 2200.00,
      modal_price: 1850.00,
      unit: 'Quintal (100 kg)',
      trend: 'RISING',
      is_verified_feed: true,
      data_source_label: 'Horticulture Market Information Network'
    }
  ];

  const farm_finances = [
    {
      id: 'fin_1',
      farm_id: 'farm_1',
      crop_id: 'crop_1',
      farmer_id: 'usr_farmer_1',
      type: 'EXPENSE',
      category: 'SEEDS',
      amount_inr: 4800.00,
      description: 'LCA-334 Teja Chilli seedlings from certified nursery (12,000 seedlings)',
      transaction_date: '2026-07-10',
      created_at: '2026-07-10T12:00:00Z'
    },
    {
      id: 'fin_2',
      farm_id: 'farm_1',
      crop_id: 'crop_1',
      farmer_id: 'usr_farmer_1',
      type: 'EXPENSE',
      category: 'FERTILIZER',
      amount_inr: 7200.00,
      description: '4 bags DAP + 2 bags Potash from Tenali RBK subsidized counter',
      transaction_date: '2026-07-18',
      created_at: '2026-07-18T14:00:00Z'
    },
    {
      id: 'fin_3',
      farm_id: 'farm_1',
      crop_id: 'crop_1',
      farmer_id: 'usr_farmer_1',
      type: 'EXPENSE',
      category: 'LABOR',
      amount_inr: 6500.00,
      description: 'Transplanting & ridge making labor wages (10 female laborers @ ₹400/day + refreshments)',
      transaction_date: '2026-07-20',
      created_at: '2026-07-20T17:00:00Z'
    },
    {
      id: 'fin_4',
      farm_id: 'farm_1',
      crop_id: 'crop_1',
      farmer_id: 'usr_farmer_1',
      type: 'EXPENSE',
      category: 'PESTICIDE',
      amount_inr: 2150.00,
      description: 'Neem oil biopesticide + sticky traps for leaf curl vector management',
      transaction_date: '2026-09-29',
      created_at: '2026-09-29T11:00:00Z'
    },
    {
      id: 'fin_5',
      farm_id: 'farm_1',
      crop_id: 'crop_2',
      farmer_id: 'usr_farmer_1',
      type: 'INCOME',
      category: 'SUBSIDY_RECEIPT',
      amount_inr: 2000.00,
      description: 'PM-KISAN 17th Installment DBT transfer into SBI account',
      transaction_date: '2026-08-15',
      created_at: '2026-08-15T10:00:00Z'
    }
  ];

  const advisory_alerts = [
    {
      id: 'alt_1',
      title: 'Alert: Thrips & Leaf Curl Flare-Up in Guntur Chilli Belt',
      message: 'Sudden dry sunny spell following light showers has triggered severe thrips vector multiplication. Farmers are advised to avoid synthetic pyrethroids which aggravate mite flare-up. Use sticky traps and recommended bio-formulations.',
      severity: 'CRITICAL_PEST',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      broadcast_by_name: 'Dr. K. Venkat Rao (Senior Entomologist KVK Lam)',
      active_until: '2026-10-15',
      created_at: '2026-10-02T09:00:00Z'
    },
    {
      id: 'alt_2',
      title: 'Weather Advisory: Low Pressure System over Bay of Bengal',
      message: 'Moderate to heavy rain expected across Coastal Andhra districts between Oct 9 and Oct 11. Postpone all chemical and fertilizer spraying operations. Clear field drainage channels to prevent waterlogging in paddy nurseries.',
      severity: 'WEATHER_ALERT',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      broadcast_by_name: 'District Agro-Meteorology Advisory Unit (DAMU)',
      active_until: '2026-10-12',
      created_at: '2026-10-04T16:00:00Z'
    }
  ];

  return {
    users,
    farms,
    crops,
    crop_issues,
    services,
    service_bookings,
    soil_health_records,
    schemes,
    scheme_applications,
    market_prices,
    farm_finances,
    advisory_alerts
  };
}
