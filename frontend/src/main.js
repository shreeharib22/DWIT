import './style.css'

const app = document.querySelector('#app')
const API_URL = 'https://dwit-backend.onrender.com'

// =========================================================
// OFFLINE / ONLINE STATUS
// =========================================================

function updateConnectionStatus() {

  let banner =
    document.querySelector(
      '#connectionStatus'
    )

  if (!banner) {

    banner =
      document.createElement(
        'div'
      )

    banner.id =
      'connectionStatus'

    document.body.appendChild(
      banner
    )
  }

  if (navigator.onLine) {

   banner.textContent =
  'Online'

    banner.className =
      'connection-online'

  } else {

   banner.textContent =
  'Offline · Changes saved locally'


    banner.className =
      'connection-offline'
  }
}

window.addEventListener(
  'online',
  updateConnectionStatus
)

window.addEventListener(
  'offline',
  updateConnectionStatus
)

window.addEventListener(
  'load',
  updateConnectionStatus
)


async function syncPendingVisits() {

  if (!navigator.onLine) {
    return
  }

  const pendingVisits =
    JSON.parse(
      localStorage.getItem(
        'sihgpt_pending_visits'
      ) || '[]'
    )

  if (!pendingVisits.length) {
    return
  }

  const remainingVisits = []

  for (const visit of pendingVisits) {

    try {

      await apiRequest(
        `/staff/${encodeURIComponent(
          visit.user_id
        )}/visits`,
        {
          method: 'POST',
          body: JSON.stringify(
            visit.payload
          )
        }
      )

      console.log(
        'Offline visit synced:',
        visit.id
      )

    } catch (error) {

      console.error(
        'Could not sync offline visit:',
        error
      )

      remainingVisits.push(
        visit
      )
    }
  }

  localStorage.setItem(
    'sihgpt_pending_visits',
    JSON.stringify(
      remainingVisits
    )
  )

  if (
    pendingVisits.length !==
    remainingVisits.length
  ) {

    alert(
      'Offline visits synced successfully.'
    )
  }
}
window.addEventListener(
  'online',
  syncPendingVisits
)


let selectedRole = 'patient'
let selectedFacilityType = ''
let selectedFacility = ''
let selectedLanguage =
  localStorage.getItem('sihgpt_language') || 'en'

const LANGUAGES = {
  en: 'English',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
  mr: 'मराठी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  ml: 'മലയാളം',
  bn: 'বাংলা',
  gu: 'ગુજરાતી',
  pa: 'ਪੰਜਾਬੀ',
  as: 'অসমীয়া'
}

const baseText = {
  en: {
    brand: 'Rural Health',
    platform: 'CONTINUITY PLATFORM',
    connected: 'CONNECTED CARE FOR EVERY COMMUNITY',
    title1: 'One connected view',
    title2: 'of rural care.',
    description:
      'Triage patients faster, coordinate referrals clearly, and keep every care team in sync — from the first check-in to follow-up.',
    coordination: 'care coordination',
    languages: 'regional languages',
    secure: 'role-based access',
    welcome: 'WELCOME BACK',
    signin: 'Sign in to continue',
    patient: 'Patient',
    asha: 'ASHA Worker',
    officer: 'Medical Officer',
    patientId: 'Patient ID',
    patientPlaceholder: 'Enter patient ID',
    patientHelper: 'Patients can use their registered patient ID.',
    ashaId: 'ASHA Worker ID',
    ashaPlaceholder: 'Enter your authorized worker ID',
    ashaHelper: 'Select your assigned facility before continuing.',
    officerId: 'Medical Officer ID',
    officerPlaceholder: 'Enter your authorized officer ID',
    officerHelper: 'Select your assigned facility before continuing.',
    facilityType: 'Facility Type',
    selectFacilityType: 'Select facility type',
    facility: 'Facility',
    selectFacility: 'Select facility',
    selectFacilityFirst: 'Select facility type first',
    access:
      'Your access is protected by role-based permissions and facility authorization.',
    continue: 'Continue',
    help: 'Need help signing in?',
    support: 'Contact support',
    footer: 'Network-ready clinical workflow',
    loginFailed: 'Login failed. Please check your ID.',
    serverError:
      'Unable to connect to the health server. Make sure FastAPI is running.',
    chooseFacilityType: 'Please select your facility type.',
    chooseFacility: 'Please select your facility.',
    signingIn: 'Signing in...'
  },

  hi: {
    brand: 'ग्रामीण स्वास्थ्य',
    platform: 'निरंतरता प्लेटफ़ॉर्म',
    connected: 'हर समुदाय के लिए जुड़ी हुई स्वास्थ्य सेवा',
    title1: 'ग्रामीण स्वास्थ्य सेवा का',
    title2: 'एक जुड़ा हुआ दृश्य।',
    description:
      'मरीजों की जल्दी जांच करें, रेफरल को स्पष्ट रूप से समन्वित करें और हर स्वास्थ्य टीम को एक साथ रखें।',
    coordination: 'स्वास्थ्य समन्वय',
    languages: 'क्षेत्रीय भाषाएँ',
    secure: 'भूमिका आधारित पहुंच',
    welcome: 'वापसी पर स्वागत है',
    signin: 'जारी रखने के लिए साइन इन करें',
    patient: 'मरीज',
    asha: 'आशा कार्यकर्ता',
    officer: 'चिकित्सा अधिकारी',
    patientId: 'मरीज आईडी',
    patientPlaceholder: 'मरीज आईडी दर्ज करें',
    patientHelper: 'अपनी पंजीकृत मरीज आईडी का उपयोग करें।',
    ashaId: 'आशा कार्यकर्ता आईडी',
    ashaPlaceholder: 'अपनी अधिकृत कार्यकर्ता आईडी दर्ज करें',
    ashaHelper: 'जारी रखने से पहले स्वास्थ्य केंद्र चुनें।',
    officerId: 'चिकित्सा अधिकारी आईडी',
    officerPlaceholder: 'अपनी अधिकृत अधिकारी आईडी दर्ज करें',
    officerHelper: 'जारी रखने से पहले स्वास्थ्य केंद्र चुनें।',
    facilityType: 'स्वास्थ्य केंद्र का प्रकार',
    selectFacilityType: 'स्वास्थ्य केंद्र का प्रकार चुनें',
    facility: 'स्वास्थ्य केंद्र',
    selectFacility: 'स्वास्थ्य केंद्र चुनें',
    selectFacilityFirst: 'पहले स्वास्थ्य केंद्र का प्रकार चुनें',
    access:
      'आपकी पहुंच भूमिका आधारित अनुमतियों और स्वास्थ्य केंद्र से सुरक्षित है।',
    continue: 'जारी रखें',
    help: 'साइन इन करने में सहायता चाहिए?',
    support: 'सहायता से संपर्क करें',
    footer: 'नेटवर्क-रेडी क्लिनिकल वर्कफ़्लो',
    loginFailed: 'लॉगिन विफल। कृपया अपनी आईडी जांचें।',
    serverError: 'स्वास्थ्य सर्वर से कनेक्ट नहीं हो पाया।',
    chooseFacilityType: 'कृपया स्वास्थ्य केंद्र का प्रकार चुनें।',
    chooseFacility: 'कृपया स्वास्थ्य केंद्र चुनें।',
    signingIn: 'साइन इन हो रहा है...'
  },

  kn: {
    brand: 'ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ',
    platform: 'ನಿರಂತರತಾ ವೇದಿಕೆ',
    connected: 'ಪ್ರತಿ ಸಮುದಾಯಕ್ಕೂ ಸಂಪರ್ಕಿತ ಆರೋಗ್ಯ ಸೇವೆ',
    title1: 'ಗ್ರಾಮೀಣ ಆರೋಗ್ಯ ಸೇವೆಯ',
    title2: 'ಒಂದು ಸಂಪರ್ಕಿತ ದೃಷ್ಟಿಕೋನ.',
    description:
      'ರೋಗಿಗಳನ್ನು ವೇಗವಾಗಿ ಪರಿಶೀಲಿಸಿ, ರೆಫರಲ್‌ಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಸಂಯೋಜಿಸಿ ಮತ್ತು ಪ್ರತಿಯೊಂದು ಆರೈಕೆ ತಂಡವನ್ನು ಸಂಪರ್ಕದಲ್ಲಿರಿಸಿ.',
    coordination: 'ಆರೈಕೆ ಸಂಯೋಜನೆ',
    languages: 'ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳು',
    secure: 'ಪಾತ್ರ ಆಧಾರಿತ ಪ್ರವೇಶ',
    welcome: 'ಮತ್ತೆ ಸ್ವಾಗತ',
    signin: 'ಮುಂದುವರಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ',
    patient: 'ರೋಗಿ',
    asha: 'ಆಶಾ ಕಾರ್ಯಕರ್ತೆ',
    officer: 'ವೈದ್ಯಾಧಿಕಾರಿ',
    patientId: 'ರೋಗಿ ಐಡಿ',
    patientPlaceholder: 'ರೋಗಿ ಐಡಿ ನಮೂದಿಸಿ',
    patientHelper: 'ನಿಮ್ಮ ನೋಂದಾಯಿತ ರೋಗಿ ಐಡಿ ಬಳಸಿ.',
    ashaId: 'ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ಐಡಿ',
    ashaPlaceholder: 'ಅಧಿಕೃತ ಕಾರ್ಯಕರ್ತೆ ಐಡಿ ನಮೂದಿಸಿ',
    ashaHelper: 'ಮುಂದುವರಿಯುವ ಮೊದಲು ಆರೋಗ್ಯ ಕೇಂದ್ರ ಆಯ್ಕೆಮಾಡಿ.',
    officerId: 'ವೈದ್ಯಾಧಿಕಾರಿ ಐಡಿ',
    officerPlaceholder: 'ಅಧಿಕೃತ ಅಧಿಕಾರಿ ಐಡಿ ನಮೂದಿಸಿ',
    officerHelper: 'ಮುಂದುವರಿಯುವ ಮೊದಲು ಆರೋಗ್ಯ ಕೇಂದ್ರ ಆಯ್ಕೆಮಾಡಿ.',
    facilityType: 'ಆರೋಗ್ಯ ಕೇಂದ್ರದ ಪ್ರಕಾರ',
    selectFacilityType: 'ಆರೋಗ್ಯ ಕೇಂದ್ರದ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ',
    facility: 'ಆರೋಗ್ಯ ಕೇಂದ್ರ',
    selectFacility: 'ಆರೋಗ್ಯ ಕೇಂದ್ರ ಆಯ್ಕೆಮಾಡಿ',
    selectFacilityFirst: 'ಮೊದಲು ಆರೋಗ್ಯ ಕೇಂದ್ರದ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ',
    access:
      'ನಿಮ್ಮ ಪ್ರವೇಶವು ಪಾತ್ರ ಮತ್ತು ಆರೋಗ್ಯ ಕೇಂದ್ರದ ಅನುಮತಿಗಳಿಂದ ಸುರಕ್ಷಿತವಾಗಿದೆ.',
    continue: 'ಮುಂದುವರಿಸಿ',
    help: 'ಸೈನ್ ಇನ್ ಮಾಡಲು ಸಹಾಯ ಬೇಕೇ?',
    support: 'ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ',
    footer: 'ನೆಟ್‌ವರ್ಕ್ ಸಿದ್ಧ ಕ್ಲಿನಿಕಲ್ ವರ್ಕ್‌ಫ್ಲೋ',
    loginFailed: 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ.',
    serverError: 'ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.',
    chooseFacilityType: 'ದಯವಿಟ್ಟು ಆರೋಗ್ಯ ಕೇಂದ್ರದ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ.',
    chooseFacility: 'ದಯವಿಟ್ಟು ಆರೋಗ್ಯ ಕೇಂದ್ರ ಆಯ್ಕೆಮಾಡಿ.',
    signingIn: 'ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ...'
  },

  mr: {
    brand: 'ग्रामीण आरोग्य',
    platform: 'सातत्य प्लॅटफॉर्म',
    connected: 'प्रत्येक समुदायासाठी जोडलेली आरोग्य सेवा',
    title1: 'ग्रामीण आरोग्य सेवेचे',
    title2: 'एक जोडलेले दृश्य.',
    description:
      'रुग्णांची जलद तपासणी करा, रेफरल्स स्पष्टपणे समन्वयित करा आणि प्रत्येक आरोग्य टीमला जोडून ठेवा.',
    coordination: 'आरोग्य समन्वय',
    languages: 'प्रादेशिक भाषा',
    secure: 'भूमिका आधारित प्रवेश',
    welcome: 'पुन्हा स्वागत आहे',
    signin: 'पुढे जाण्यासाठी साइन इन करा',
    patient: 'रुग्ण',
    asha: 'आशा कार्यकर्ता',
    officer: 'वैद्यकीय अधिकारी',
    patientId: 'रुग्ण आयडी',
    patientPlaceholder: 'रुग्ण आयडी प्रविष्ट करा',
    patientHelper: 'आपली नोंदणीकृत रुग्ण आयडी वापरा.',
    ashaId: 'आशा कार्यकर्ता आयडी',
    ashaPlaceholder: 'आपला अधिकृत कार्यकर्ता आयडी प्रविष्ट करा',
    ashaHelper: 'पुढे जाण्यापूर्वी आरोग्य केंद्र निवडा.',
    officerId: 'वैद्यकीय अधिकारी आयडी',
    officerPlaceholder: 'आपला अधिकृत अधिकारी आयडी प्रविष्ट करा',
    officerHelper: 'पुढे जाण्यापूर्वी आरोग्य केंद्र निवडा.',
    facilityType: 'आरोग्य केंद्राचा प्रकार',
    selectFacilityType: 'आरोग्य केंद्राचा प्रकार निवडा',
    facility: 'आरोग्य केंद्र',
    selectFacility: 'आरोग्य केंद्र निवडा',
    selectFacilityFirst: 'प्रथम आरोग्य केंद्राचा प्रकार निवडा',
    access:
      'प्रवेश भूमिका आणि आरोग्य केंद्रानुसार संरक्षित आहे.',
    continue: 'पुढे जा',
    help: 'साइन इन करण्यासाठी मदत हवी आहे?',
    support: 'सपोर्टशी संपर्क करा',
    footer: 'नेटवर्क-रेडी क्लिनिकल वर्कफ्लो',
    loginFailed: 'लॉगिन अयशस्वी.',
    serverError: 'सर्व्हरशी कनेक्ट होऊ शकले नाही.',
    chooseFacilityType: 'कृपया आरोग्य केंद्राचा प्रकार निवडा.',
    chooseFacility: 'कृपया आरोग्य केंद्र निवडा.',
    signingIn: 'साइन इन होत आहे...'
  },

  ta: {
    brand: 'கிராமப்புற சுகாதாரம்',
    platform: 'தொடர்ச்சியான தளம்',
    connected: 'ஒவ்வொரு சமூகத்திற்கும் இணைந்த சுகாதார சேவை',
    title1: 'கிராமப்புற சுகாதாரத்தின்',
    title2: 'ஒருங்கிணைந்த பார்வை.',
    description:
      'நோயாளிகளை விரைவாக பரிசோதித்து, பரிந்துரைகளை ஒருங்கிணைத்து, அனைத்து சுகாதார குழுக்களையும் இணைத்திருங்கள்.',
    coordination: 'சுகாதார ஒருங்கிணைப்பு',
    languages: 'பிராந்திய மொழிகள்',
    secure: 'பங்கு அடிப்படையிலான அணுகல்',
    welcome: 'மீண்டும் வரவேற்கிறோம்',
    signin: 'தொடர உள்நுழையவும்',
    patient: 'நோயாளி',
    asha: 'ஆஷா பணியாளர்',
    officer: 'மருத்துவ அதிகாரி',
    patientId: 'நோயாளி ஐடி',
    patientPlaceholder: 'நோயாளி ஐடியை உள்ளிடவும்',
    patientHelper: 'உங்கள் பதிவு செய்யப்பட்ட நோயாளி ஐடியைப் பயன்படுத்தவும்.',
    ashaId: 'ஆஷா பணியாளர் ஐடி',
    ashaPlaceholder: 'அங்கீகரிக்கப்பட்ட பணியாளர் ஐடியை உள்ளிடவும்',
    ashaHelper: 'தொடர்வதற்கு முன் சுகாதார மையத்தைத் தேர்ந்தெடுக்கவும்.',
    officerId: 'மருத்துவ அதிகாரி ஐடி',
    officerPlaceholder: 'அங்கீகரிக்கப்பட்ட அதிகாரி ஐடியை உள்ளிடவும்',
    officerHelper: 'தொடர்வதற்கு முன் சுகாதார மையத்தைத் தேர்ந்தெடுக்கவும்.',
    facilityType: 'சுகாதார மைய வகை',
    selectFacilityType: 'சுகாதார மைய வகையைத் தேர்ந்தெடுக்கவும்',
    facility: 'சுகாதார மையம்',
    selectFacility: 'சுகாதார மையத்தைத் தேர்ந்தெடுக்கவும்',
    selectFacilityFirst: 'முதலில் சுகாதார மைய வகையைத் தேர்ந்தெடுக்கவும்',
    access: 'உங்கள் அணுகல் பங்கு மற்றும் மைய அனுமதிகளால் பாதுகாக்கப்படுகிறது.',
    continue: 'தொடரவும்',
    help: 'உள்நுழைய உதவி வேண்டுமா?',
    support: 'ஆதரவைத் தொடர்புகொள்ளவும்',
    footer: 'நெட்வொர்க் தயாரான மருத்துவ பணிச்சுற்று',
    loginFailed: 'உள்நுழைவு தோல்வியடைந்தது.',
    serverError: 'சுகாதார சேவையகத்துடன் இணைக்க முடியவில்லை.',
    chooseFacilityType: 'சுகாதார மைய வகையைத் தேர்ந்தெடுக்கவும்.',
    chooseFacility: 'சுகாதார மையத்தைத் தேர்ந்தெடுக்கவும்.',
    signingIn: 'உள்நுழைகிறது...'
  },

  te: {
    brand: 'గ్రామీణ ఆరోగ్యం',
    platform: 'నిరంతర ఆరోగ్య వేదిక',
    connected: 'ప్రతి సమాజానికి అనుసంధానమైన ఆరోగ్య సేవ',
    title1: 'గ్రామీణ ఆరోగ్య సంరక్షణ యొక్క',
    title2: 'ఒక సమగ్ర దృశ్యం.',
    description:
      'రోగులను వేగంగా పరీక్షించండి, రిఫరల్స్‌ను స్పష్టంగా సమన్వయం చేయండి మరియు ప్రతి ఆరోగ్య బృందాన్ని అనుసంధానంగా ఉంచండి.',
    coordination: 'ఆరోగ్య సమన్వయం',
    languages: 'ప్రాంతీయ భాషలు',
    secure: 'పాత్ర ఆధారిత యాక్సెస్',
    welcome: 'తిరిగి స్వాగతం',
    signin: 'కొనసాగించడానికి సైన్ ఇన్ చేయండి',
    patient: 'రోగి',
    asha: 'ఆశా కార్యకర్త',
    officer: 'వైద్య అధికారి',
    patientId: 'రోగి ఐడి',
    patientPlaceholder: 'రోగి ఐడి నమోదు చేయండి',
    patientHelper: 'మీ నమోదిత రోగి ఐడిని ఉపయోగించండి.',
    ashaId: 'ఆశా కార్యకర్త ఐడి',
    ashaPlaceholder: 'అధీకృత కార్యకర్త ఐడిని నమోదు చేయండి',
    ashaHelper: 'కొనసాగించే ముందు ఆరోగ్య కేంద్రాన్ని ఎంచుకోండి.',
    officerId: 'వైద్య అధికారి ఐడి',
    officerPlaceholder: 'అధీకృత అధికారి ఐడిని నమోదు చేయండి',
    officerHelper: 'కొనసాగించే ముందు ఆరోగ్య కేంద్రాన్ని ఎంచుకోండి.',
    facilityType: 'ఆరోగ్య కేంద్రం రకం',
    selectFacilityType: 'ఆరోగ్య కేంద్రం రకాన్ని ఎంచుకోండి',
    facility: 'ఆరోగ్య కేంద్రం',
    selectFacility: 'ఆరోగ్య కేంద్రాన్ని ఎంచుకోండి',
    selectFacilityFirst: 'ముందుగా ఆరోగ్య కేంద్రం రకాన్ని ఎంచుకోండి',
    access: 'మీ యాక్సెస్ పాత్ర మరియు కేంద్ర అనుమతులతో రక్షించబడింది.',
    continue: 'కొనసాగించండి',
    help: 'సైన్ ఇన్ చేయడానికి సహాయం కావాలా?',
    support: 'సపోర్ట్‌ను సంప్రదించండి',
    footer: 'నెట్‌వర్క్-రెడీ క్లినికల్ వర్క్‌ఫ్లో',
    loginFailed: 'లాగిన్ విఫలమైంది.',
    serverError: 'సర్వర్‌కు కనెక్ట్ కాలేకపోయాము.',
    chooseFacilityType: 'దయచేసి ఆరోగ్య కేంద్రం రకాన్ని ఎంచుకోండి.',
    chooseFacility: 'దయచేసి ఆరోగ్య కేంద్రాన్ని ఎంచుకోండి.',
    signingIn: 'సైన్ ఇన్ అవుతోంది...'
  },

  ml: {
    brand: 'ഗ്രാമീണ ആരോഗ്യം',
    platform: 'തുടർച്ചാ പ്ലാറ്റ്ഫോം',
    connected: 'ഓരോ സമൂഹത്തിനും ബന്ധിപ്പിച്ച ആരോഗ്യ സേവനം',
    title1: 'ഗ്രാമീണ ആരോഗ്യത്തിന്റെ',
    title2: 'ഒരു ബന്ധിപ്പിച്ച കാഴ്ച.',
    description:
      'രോഗികളെ വേഗത്തിൽ പരിശോധിക്കുകയും റഫറലുകൾ ഏകോപിപ്പിക്കുകയും എല്ലാ ആരോഗ്യ ടീമുകളെയും ബന്ധിപ്പിച്ച് നിലനിർത്തുകയും ചെയ്യുക.',
    coordination: 'പരിചരണ ഏകോപനം',
    languages: 'പ്രാദേശിക ഭാഷകൾ',
    secure: 'റോൾ അടിസ്ഥാനത്തിലുള്ള പ്രവേശനം',
    welcome: 'വീണ്ടും സ്വാഗതം',
    signin: 'തുടരാൻ സൈൻ ഇൻ ചെയ്യുക',
    patient: 'രോഗി',
    asha: 'ആശാ പ്രവർത്തക',
    officer: 'മെഡിക്കൽ ഓഫീസർ',
    patientId: 'രോഗി ഐഡി',
    patientPlaceholder: 'രോഗി ഐഡി നൽകുക',
    patientHelper: 'നിങ്ങളുടെ രജിസ്റ്റർ ചെയ്ത രോഗി ഐഡി ഉപയോഗിക്കുക.',
    ashaId: 'ആശാ പ്രവർത്തക ഐഡി',
    ashaPlaceholder: 'അംഗീകൃത പ്രവർത്തക ഐഡി നൽകുക',
    ashaHelper: 'തുടരുന്നതിന് മുമ്പ് ആരോഗ്യ കേന്ദ്രം തിരഞ്ഞെടുക്കുക.',
    officerId: 'മെഡിക്കൽ ഓഫീസർ ഐഡി',
    officerPlaceholder: 'അംഗീകൃത ഓഫീസർ ഐഡി നൽകുക',
    officerHelper: 'തുടരുന്നതിന് മുമ്പ് ആരോഗ്യ കേന്ദ്രം തിരഞ്ഞെടുക്കുക.',
    facilityType: 'ആരോഗ്യ കേന്ദ്രത്തിന്റെ തരം',
    selectFacilityType: 'ആരോഗ്യ കേന്ദ്രത്തിന്റെ തരം തിരഞ്ഞെടുക്കുക',
    facility: 'ആരോഗ്യ കേന്ദ്രം',
    selectFacility: 'ആരോഗ്യ കേന്ദ്രം തിരഞ്ഞെടുക്കുക',
    selectFacilityFirst: 'ആദ്യം ആരോഗ്യ കേന്ദ്രത്തിന്റെ തരം തിരഞ്ഞെടുക്കുക',
    access: 'റോൾ അടിസ്ഥാനത്തിലുള്ള അനുമതികളാൽ നിങ്ങളുടെ പ്രവേശനം സംരക്ഷിച്ചിരിക്കുന്നു.',
    continue: 'തുടരുക',
    help: 'സൈൻ ഇൻ ചെയ്യാൻ സഹായം വേണോ?',
    support: 'സപ്പോർട്ടുമായി ബന്ധപ്പെടുക',
    footer: 'നെറ്റ്‌വർക്ക്-റെഡി ക്ലിനിക്കൽ വർക്ക്‌ഫ്ലോ',
    loginFailed: 'ലോഗിൻ പരാജയപ്പെട്ടു.',
    serverError: 'സെർവറുമായി ബന്ധിപ്പിക്കാൻ കഴിഞ്ഞില്ല.',
    chooseFacilityType: 'ആരോഗ്യ കേന്ദ്രത്തിന്റെ തരം തിരഞ്ഞെടുക്കുക.',
    chooseFacility: 'ആരോഗ്യ കേന്ദ്രം തിരഞ്ഞെടുക്കുക.',
    signingIn: 'സൈൻ ഇൻ ചെയ്യുന്നു...'
  },

  bn: {
    brand: 'গ্রামীণ স্বাস্থ্য',
    platform: 'কন্টিনিউটি প্ল্যাটফর্ম',
    connected: 'প্রতিটি সম্প্রদায়ের জন্য সংযুক্ত স্বাস্থ্যসেবা',
    title1: 'গ্রামীণ স্বাস্থ্যসেবার',
    title2: 'একটি সংযুক্ত দৃশ্য।',
    description:
      'রোগীদের দ্রুত পরীক্ষা করুন, রেফারেল সমন্বয় করুন এবং প্রতিটি স্বাস্থ্য দলকে সংযুক্ত রাখুন।',
    coordination: 'স্বাস্থ্য সমন্বয়',
    languages: 'আঞ্চলিক ভাষা',
    secure: 'ভূমিকা ভিত্তিক প্রবেশাধিকার',
    welcome: 'আবার স্বাগতম',
    signin: 'চালিয়ে যেতে সাইন ইন করুন',
    patient: 'রোগী',
    asha: 'আশা কর্মী',
    officer: 'মেডিকেল অফিসার',
    patientId: 'রোগী আইডি',
    patientPlaceholder: 'রোগী আইডি লিখুন',
    patientHelper: 'আপনার নিবন্ধিত রোগী আইডি ব্যবহার করুন।',
    ashaId: 'আশা কর্মী আইডি',
    ashaPlaceholder: 'অনুমোদিত কর্মী আইডি লিখুন',
    ashaHelper: 'চালিয়ে যাওয়ার আগে স্বাস্থ্যকেন্দ্র নির্বাচন করুন।',
    officerId: 'মেডিকেল অফিসার আইডি',
    officerPlaceholder: 'অনুমোদিত অফিসার আইডি লিখুন',
    officerHelper: 'চালিয়ে যাওয়ার আগে স্বাস্থ্যকেন্দ্র নির্বাচন করুন।',
    facilityType: 'স্বাস্থ্যকেন্দ্রের ধরন',
    selectFacilityType: 'স্বাস্থ্যকেন্দ্রের ধরন নির্বাচন করুন',
    facility: 'স্বাস্থ্যকেন্দ্র',
    selectFacility: 'স্বাস্থ্যকেন্দ্র নির্বাচন করুন',
    selectFacilityFirst: 'প্রথমে স্বাস্থ্যকেন্দ্রের ধরন নির্বাচন করুন',
    access: 'ভূমিকা ভিত্তিক অনুমতি এবং স্বাস্থ্যকেন্দ্র দ্বারা আপনার প্রবেশাধিকার সুরক্ষিত।',
    continue: 'চালিয়ে যান',
    help: 'সাইন ইন করতে সাহায্য দরকার?',
    support: 'সহায়তার সাথে যোগাযোগ করুন',
    footer: 'নেটওয়ার্ক-প্রস্তুত ক্লিনিক্যাল ওয়ার্কফ্লো',
    loginFailed: 'লগইন ব্যর্থ হয়েছে।',
    serverError: 'সার্ভারের সাথে সংযোগ করা যায়নি।',
    chooseFacilityType: 'স্বাস্থ্যকেন্দ্রের ধরন নির্বাচন করুন।',
    chooseFacility: 'স্বাস্থ্যকেন্দ্র নির্বাচন করুন।',
    signingIn: 'সাইন ইন হচ্ছে...'
  },

  gu: {
    brand: 'ગ્રામીણ આરોગ્ય',
    platform: 'સાતત્ય પ્લેટફોર્મ',
    connected: 'દરેક સમુદાય માટે જોડાયેલ આરોગ્ય સેવા',
    title1: 'ગ્રામીણ આરોગ્ય સેવાનું',
    title2: 'એક જોડાયેલ દૃશ્ય.',
    description:
      'દર્દીઓની ઝડપથી તપાસ કરો, રેફરલ્સનું સંકલન કરો અને દરેક આરોગ્ય ટીમને જોડાયેલી રાખો.',
    coordination: 'આરોગ્ય સંકલન',
    languages: 'પ્રાદેશિક ભાષાઓ',
    secure: 'ભૂમિકા આધારિત ઍક્સેસ',
    welcome: 'ફરી સ્વાગત છે',
    signin: 'ચાલુ રાખવા સાઇન ઇન કરો',
    patient: 'દર્દી',
    asha: 'આશા કાર્યકર',
    officer: 'મેડિકલ ઓફિસર',
    patientId: 'દર્દી ID',
    patientPlaceholder: 'દર્દી ID દાખલ કરો',
    patientHelper: 'તમારી નોંધાયેલ દર્દી ID નો ઉપયોગ કરો.',
    ashaId: 'આશા કાર્યકર ID',
    ashaPlaceholder: 'તમારી અધિકૃત કાર્યકર ID દાખલ કરો',
    ashaHelper: 'ચાલુ રાખતા પહેલા આરોગ્ય કેન્દ્ર પસંદ કરો.',
    officerId: 'મેડિકલ ઓફિસર ID',
    officerPlaceholder: 'તમારી અધિકૃત ઓફિસર ID દાખલ કરો',
    officerHelper: 'ચાલુ રાખતા પહેલા આરોગ્ય કેન્દ્ર પસંદ કરો.',
    facilityType: 'આરોગ્ય કેન્દ્રનો પ્રકાર',
    selectFacilityType: 'આરોગ્ય કેન્દ્રનો પ્રકાર પસંદ કરો',
    facility: 'આરોગ્ય કેન્દ્ર',
    selectFacility: 'આરોગ્ય કેન્દ્ર પસંદ કરો',
    selectFacilityFirst: 'પહેલા આરોગ્ય કેન્દ્રનો પ્રકાર પસંદ કરો',
    access: 'તમારો ઍક્સેસ ભૂમિકા અને આરોગ્ય કેન્દ્રની પરવાનગીઓથી સુરક્ષિત છે.',
    continue: 'ચાલુ રાખો',
    help: 'સાઇન ઇન કરવામાં મદદ જોઈએ?',
    support: 'સપોર્ટનો સંપર્ક કરો',
    footer: 'નેટવર્ક-તૈયાર ક્લિનિકલ વર્કફ્લો',
    loginFailed: 'લૉગિન નિષ્ફળ થયું.',
    serverError: 'સર્વર સાથે જોડાઈ શક્યા નથી.',
    chooseFacilityType: 'કૃપા કરીને આરોગ્ય કેન્દ્રનો પ્રકાર પસંદ કરો.',
    chooseFacility: 'કૃપા કરીને આરોગ્ય કેન્દ્ર પસંદ કરો.',
    signingIn: 'સાઇન ઇન થઈ રહ્યું છે...'
  },

  pa: {
    brand: 'ਪੇਂਡੂ ਸਿਹਤ',
    platform: 'ਕੰਟੀਨਿਊਟੀ ਪਲੇਟਫਾਰਮ',
    connected: 'ਹਰ ਭਾਈਚਾਰੇ ਲਈ ਜੁੜੀ ਹੋਈ ਸਿਹਤ ਸੇਵਾ',
    title1: 'ਪੇਂਡੂ ਸਿਹਤ ਸੇਵਾ ਦਾ',
    title2: 'ਇੱਕ ਜੁੜਿਆ ਹੋਇਆ ਦ੍ਰਿਸ਼।',
    description:
      'ਮਰੀਜ਼ਾਂ ਦੀ ਤੇਜ਼ੀ ਨਾਲ ਜਾਂਚ ਕਰੋ, ਰੈਫਰਲਾਂ ਦਾ ਤਾਲਮੇਲ ਕਰੋ ਅਤੇ ਹਰ ਸਿਹਤ ਟੀਮ ਨੂੰ ਜੋੜ ਕੇ ਰੱਖੋ।',
    coordination: 'ਸਿਹਤ ਤਾਲਮੇਲ',
    languages: 'ਖੇਤਰੀ ਭਾਸ਼ਾਵਾਂ',
    secure: 'ਭੂਮਿਕਾ ਅਧਾਰਿਤ ਪਹੁੰਚ',
    welcome: 'ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ',
    signin: 'ਜਾਰੀ ਰੱਖਣ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ',
    patient: 'ਮਰੀਜ਼',
    asha: 'ਆਸ਼ਾ ਵਰਕਰ',
    officer: 'ਮੈਡੀਕਲ ਅਫਸਰ',
    patientId: 'ਮਰੀਜ਼ ID',
    patientPlaceholder: 'ਮਰੀਜ਼ ID ਦਰਜ ਕਰੋ',
    patientHelper: 'ਆਪਣੀ ਰਜਿਸਟਰਡ ਮਰੀਜ਼ ID ਵਰਤੋ।',
    ashaId: 'ਆਸ਼ਾ ਵਰਕਰ ID',
    ashaPlaceholder: 'ਆਪਣੀ ਅਧਿਕਾਰਤ ਵਰਕਰ ID ਦਰਜ ਕਰੋ',
    ashaHelper: 'ਜਾਰੀ ਰੱਖਣ ਤੋਂ ਪਹਿਲਾਂ ਸਿਹਤ ਸਹੂਲਤ ਚੁਣੋ।',
    officerId: 'ਮੈਡੀਕਲ ਅਫਸਰ ID',
    officerPlaceholder: 'ਆਪਣੀ ਅਧਿਕਾਰਤ ਅਫਸਰ ID ਦਰਜ ਕਰੋ',
    officerHelper: 'ਜਾਰੀ ਰੱਖਣ ਤੋਂ ਪਹਿਲਾਂ ਸਿਹਤ ਸਹੂਲਤ ਚੁਣੋ।',
    facilityType: 'ਸਿਹਤ ਸਹੂਲਤ ਦੀ ਕਿਸਮ',
    selectFacilityType: 'ਸਿਹਤ ਸਹੂਲਤ ਦੀ ਕਿਸਮ ਚੁਣੋ',
    facility: 'ਸਿਹਤ ਸਹੂਲਤ',
    selectFacility: 'ਸਿਹਤ ਸਹੂਲਤ ਚੁਣੋ',
    selectFacilityFirst: 'ਪਹਿਲਾਂ ਸਿਹਤ ਸਹੂਲਤ ਦੀ ਕਿਸਮ ਚੁਣੋ',
    access: 'ਤੁਹਾਡੀ ਪਹੁੰਚ ਭੂਮਿਕਾ ਅਤੇ ਸਿਹਤ ਸਹੂਲਤ ਦੀਆਂ ਇਜਾਜ਼ਤਾਂ ਨਾਲ ਸੁਰੱਖਿਅਤ ਹੈ।',
    continue: 'ਜਾਰੀ ਰੱਖੋ',
    help: 'ਸਾਈਨ ਇਨ ਕਰਨ ਵਿੱਚ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?',
    support: 'ਸਹਾਇਤਾ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
    footer: 'ਨੈੱਟਵਰਕ-ਤਿਆਰ ਕਲੀਨਿਕਲ ਵਰਕਫਲੋ',
    loginFailed: 'ਲੌਗਇਨ ਅਸਫਲ ਹੋਇਆ।',
    serverError: 'ਸਰਵਰ ਨਾਲ ਕਨੈਕਟ ਨਹੀਂ ਹੋ ਸਕਿਆ।',
    chooseFacilityType: 'ਕਿਰਪਾ ਕਰਕੇ ਸਿਹਤ ਸਹੂਲਤ ਦੀ ਕਿਸਮ ਚੁਣੋ।',
    chooseFacility: 'ਕਿਰਪਾ ਕਰਕੇ ਸਿਹਤ ਸਹੂਲਤ ਚੁਣੋ।',
    signingIn: 'ਸਾਈਨ ਇਨ ਹੋ ਰਿਹਾ ਹੈ...'
  },

  as: {
    brand: 'গ্ৰাম্য স্বাস্থ্য',
    platform: 'কণ্টিনিউটি প্লেটফৰ্ম',
    connected: 'প্ৰতিটো সম্প্ৰদায়ৰ বাবে সংযুক্ত স্বাস্থ্য সেৱা',
    title1: 'গ্ৰাম্য স্বাস্থ্য সেৱাৰ',
    title2: 'এটা সংযুক্ত দৃষ্টিভংগী।',
    description:
      'ৰোগীক দ্ৰুতভাৱে পৰীক্ষা কৰক, ৰেফাৰেলসমূহ সমন্বয় কৰক আৰু প্ৰতিটো স্বাস্থ্য দলক সংযুক্ত ৰাখক।',
    coordination: 'স্বাস্থ্য সমন্বয়',
    languages: 'আঞ্চলিক ভাষা',
    secure: 'ভূমিকা ভিত্তিক প্ৰৱেশ',
    welcome: 'পুনৰ স্বাগতম',
    signin: 'আগবাঢ়িবলৈ ছাইন ইন কৰক',
    patient: 'ৰোগী',
    asha: 'আশা কৰ্মী',
    officer: 'চিকিৎসা বিষয়া',
    patientId: 'ৰোগীৰ ID',
    patientPlaceholder: 'ৰোগীৰ ID লিখক',
    patientHelper: 'আপোনাৰ পঞ্জীয়নভুক্ত ৰোগীৰ ID ব্যৱহাৰ কৰক।',
    ashaId: 'আশা কৰ্মী ID',
    ashaPlaceholder: 'আপোনাৰ অনুমোদিত কৰ্মী ID লিখক',
    ashaHelper: 'আগবাঢ়াৰ আগতে স্বাস্থ্য কেন্দ্ৰ বাছনি কৰক।',
    officerId: 'চিকিৎসা বিষয়া ID',
    officerPlaceholder: 'আপোনাৰ অনুমোদিত বিষয়া ID লিখক',
    officerHelper: 'আগবাঢ়াৰ আগতে স্বাস্থ্য কেন্দ্ৰ বাছনি কৰক।',
    facilityType: 'স্বাস্থ্য কেন্দ্ৰৰ ধৰণ',
    selectFacilityType: 'স্বাস্থ্য কেন্দ্ৰৰ ধৰণ বাছনি কৰক',
    facility: 'স্বাস্থ্য কেন্দ্ৰ',
    selectFacility: 'স্বাস্থ্য কেন্দ্ৰ বাছনি কৰক',
    selectFacilityFirst: 'প্ৰথমে স্বাস্থ্য কেন্দ্ৰৰ ধৰণ বাছনি কৰক',
    access: 'আপোনাৰ প্ৰৱেশ ভূমিকা আৰু স্বাস্থ্য কেন্দ্ৰৰ অনুমতিৰে সুৰক্ষিত।',
    continue: 'আগবাঢ়ক',
    help: 'ছাইন ইন কৰিবলৈ সহায় লাগে?',
    support: 'সহায়তাৰ সৈতে যোগাযোগ কৰক',
    footer: 'নেটৱৰ্ক-প্ৰস্তুত ক্লিনিকেল ৱৰ্কফ্লো',
    loginFailed: 'লগইন বিফল হৈছে।',
    serverError: 'ছাৰ্ভাৰৰ সৈতে সংযোগ কৰিব পৰা নগ’ল।',
    chooseFacilityType: 'অনুগ্ৰহ কৰি স্বাস্থ্য কেন্দ্ৰৰ ধৰণ বাছনি কৰক।',
    chooseFacility: 'অনুগ্ৰহ কৰি স্বাস্থ্য কেন্দ্ৰ বাছনি কৰক।',
    signingIn: 'ছাইন ইন হৈ আছে...'
  }
}

const roles = [
  {
    id: 'patient',
    labelKey: 'patient',
    fieldKey: 'patientId',
    placeholderKey: 'patientPlaceholder',
    helperKey: 'patientHelper'
  },
  {
    id: 'asha',
    labelKey: 'asha',
    fieldKey: 'ashaId',
    placeholderKey: 'ashaPlaceholder',
    helperKey: 'ashaHelper'
  },
  {
    id: 'officer',
    labelKey: 'officer',
    fieldKey: 'officerId',
    placeholderKey: 'officerPlaceholder',
    helperKey: 'officerHelper'
  }
]

const facilityTypes = [
  {
    value: 'PHC',
    label: 'Primary Health Centre (PHC)'
  },
  {
    value: 'CHC',
    label: 'Community Health Centre (CHC)'
  },
  {
    value: 'RURAL_HOSPITAL',
    label: 'Rural Hospital'
  },
  {
    value: 'DISTRICT_HOSPITAL',
    label: 'District Hospital'
  }
]

const facilities = {
  PHC: [
    'PHC Bengaluru Rural',
    'PHC Anekal',
    'PHC Devanahalli'
  ],

  CHC: [
    'CHC Bengaluru Rural',
    'CHC Anekal',
    'CHC Devanahalli'
  ],

  RURAL_HOSPITAL: [
    'Rural Hospital Bengaluru Rural',
    'Rural Hospital Anekal'
  ],

  DISTRICT_HOSPITAL: [
    'District Hospital Bengaluru Rural'
  ]
}

const referralFacilities = [
  {
    id: 'CHC-BENGALURU-RURAL',
    name: 'CHC Bengaluru Rural'
  },
  {
    id: 'CHC-ANEKAL',
    name: 'CHC Anekal'
  },
  {
    id: 'CHC-DEVANAHALLI',
    name: 'CHC Devanahalli'
  },
  {
    id: 'RURAL-HOSPITAL-BENGALURU-RURAL',
    name: 'Rural Hospital Bengaluru Rural'
  },
  {
    id: 'RURAL-HOSPITAL-ANEKAL',
    name: 'Rural Hospital Anekal'
  },
  {
    id: 'DISTRICT-HOSPITAL-BENGALURU-RURAL',
    name: 'District Hospital Bengaluru Rural'
  }
]

function t(key) {
  return (
    baseText[selectedLanguage]?.[key] ||
    baseText.en[key] ||
    key
  )
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function prettyDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString(
    selectedLanguage,
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  )
}

async function apiRequest(
  path,
  options = {}
) {

  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,

        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      }
    )

  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {

    const detail = data?.detail

    if (Array.isArray(detail)) {

      throw new Error(
        detail
          .map(
            item =>
              item.msg ||
              JSON.stringify(item)
          )
          .join(', ')
      )

    }

    throw new Error(
      String(
        detail ||
        data?.message ||
        `Request failed (${response.status})`
      )
    )
  }

  return data
}

async function apiGet(path) {
  return apiRequest(path)
}

function addDwitLogoToDashboardHeaders() {

  document
    .querySelectorAll(
      '.dashboard-header'
    )
    .forEach(
      header => {

        if (
          header.querySelector(
            '.dwit-dashboard-logo'
          )
        ) {
          return
        }

        const logo =
          document.createElement(
            'img'
          )

        logo.className =
          'dwit-dashboard-logo'

        logo.src =
          '/dwit-logo.png'

        logo.alt =
          'DWIT'

        logo.loading =
          'eager'

        header.insertBefore(
          logo,
          header.firstElementChild
        )

      }
    )
}


function attachLogout() {

  document
    .querySelector('#logoutBtn')
    ?.addEventListener(
      'click',
      logout
    )

  addDwitLogoToDashboardHeaders()
}

function logout() {

  localStorage.removeItem(
    'sihgpt_user'
  )

  selectedRole = 'patient'
  selectedFacilityType = ''
  selectedFacility = ''

  renderLogin()
}


/* =========================================================
   LOGIN
========================================================= */

function renderLogin() {

  const role =
    roles.find(
      item =>
        item.id === selectedRole
    ) || roles[0]

  app.innerHTML = `

    <main class="portal">


      <section class="visual-panel">

        <div class="panel-frame">


          <header class="brand-row">

            <div class="brand-lockup">
<div class="brand-mark dwit-brand-mark">
  <img
    src="/dwit-logo.png"
    alt="DWIT"
  >
</div>

              <div class="brand-text">

                <div class="brand-title">
                  ${t('brand')}
                </div>

                <div class="brand-title accent">
                  ${t('platform')}
                </div>

              </div>

            </div>


            <div class="language-select">

              <select
                id="languageSelect"
                aria-label="Language"
              >

                ${Object.entries(
                  LANGUAGES
                )
                  .map(
                    ([code, name]) => `
                      <option
                        value="${code}"
                        ${
                          selectedLanguage === code
                            ? 'selected'
                            : ''
                        }
                      >
                        ${name}
                      </option>
                    `
                  )
                  .join('')}

              </select>

            </div>

          </header>


          <div class="hero-content">

            <div class="eyebrow">

              <span class="eyebrow-dot"></span>

              ${t('connected')}

            </div>


            <h1>

              ${t('title1')}

              <br>

              ${t('title2')}

            </h1>


            <p>
              ${t('description')}
            </p>


            <div class="stats-row">

              <div class="stat-card">
                <strong>24/7</strong>
                <span>
                  ${t('coordination')}
                </span>
              </div>

              <div class="stat-card">
                <strong>11</strong>
                <span>
                  ${t('languages')}
                </span>
              </div>

              <div class="stat-card">
                <strong>Secure</strong>
                <span>
                  ${t('secure')}
                </span>
              </div>

            </div>

          </div>


          <footer class="panel-footer">

            <span>
              DWIT / ACCESS
            </span>

            <span>
              ${t('footer')}
            </span>

          </footer>

        </div>


        <div class="decor-circle circle-one"></div>
        <div class="decor-circle circle-two"></div>
        <div class="decor-circle circle-three"></div>

      </section>


      <section class="auth-panel">

        <div class="auth-shell">


          <div class="auth-topline">

            <span>
              ${t('welcome')}
            </span>

            <span class="step-number">
              01
            </span>

          </div>


          <h2>
            ${t('signin')}
          </h2>


          <div class="auth-card">


            <div class="role-tabs">

              ${roles
                .map(
                  item => `

                    <button
                      type="button"
                      class="role-tab ${
                        selectedRole === item.id
                          ? 'active'
                          : ''
                      }"
                      data-role="${item.id}"
                    >
                      ${t(item.labelKey)}
                    </button>

                  `
                )
                .join('')}

            </div>


            ${
              selectedRole !== 'patient'
                ? `

                  <div class="facility-grid">


                    <div class="field-group">

                      <label
                        for="facilityType"
                      >
                        ${t('facilityType')}
                      </label>


                      <select
                        id="facilityType"
                        class="form-select"
                      >

                        <option value="">
                          ${t('selectFacilityType')}
                        </option>


                        ${facilityTypes
                          .map(
                            item => `

                              <option
                                value="${item.value}"
                                ${
                                  selectedFacilityType ===
                                  item.value
                                    ? 'selected'
                                    : ''
                                }
                              >
                                ${item.label}
                              </option>

                            `
                          )
                          .join('')}

                      </select>

                    </div>


                    <div class="field-group">

                      <label for="facility">
                        ${t('facility')}
                      </label>


                      <select
                        id="facility"
                        class="form-select"
                        ${
                          selectedFacilityType
                            ? ''
                            : 'disabled'
                        }
                      >

                        <option value="">
                          ${
                            selectedFacilityType
                              ? t('selectFacility')
                              : t('selectFacilityFirst')
                          }
                        </option>


                        ${
                          selectedFacilityType &&
                          facilities[
                            selectedFacilityType
                          ]
                            ? facilities[
                                selectedFacilityType
                              ]
                                .map(
                                  item => `

                                    <option
                                      value="${item}"
                                      ${
                                        selectedFacility ===
                                        item
                                          ? 'selected'
                                          : ''
                                      }
                                    >
                                      ${item}
                                    </option>

                                  `
                                )
                                .join('')
                            : ''
                        }

                      </select>

                    </div>

                  </div>

                `
                : ''
            }


            <div class="field-group">

              <label for="userId">
                ${t(role.fieldKey)}
              </label>


              <div class="input-shell">

                <span class="input-prefix">
                  ID
                </span>


                <input
                  id="userId"
                  type="text"
                  autocomplete="off"
                  placeholder="${t(
                    role.placeholderKey
                  )}"
                />

              </div>

            </div>


            <div class="access-note">

              <span class="note-mark">
                ✓
              </span>

              <p>
                ${t('access')}
              </p>

            </div>


            <button
              id="continueBtn"
              class="continue-btn"
              type="button"
            >

              <span id="continueText">
                ${t('continue')}
              </span>

              <span>
                →
              </span>

            </button>


            <p class="helper-text">
              ${t(role.helperKey)}
            </p>

          </div>


          <div class="auth-footer">

            <button
              id="helpButton"
              class="text-button"
              type="button"
            >
              ${t('help')}
            </button>


            <button
              id="supportButton"
              class="text-button"
              type="button"
            >
              ${t('support')}
            </button>

          </div>

        </div>

      </section>

    </main>
  `


  document
    .querySelector('#languageSelect')
    ?.addEventListener(
      'change',
      event => {

        selectedLanguage =
          event.target.value

        localStorage.setItem(
          'sihgpt_language',
          selectedLanguage
        )

        renderLogin()
      }
    )


  document
    .querySelectorAll('.role-tab')
    .forEach(button => {

      button.addEventListener(
        'click',
        () => {

          selectedRole =
            button.dataset.role

          selectedFacilityType = ''
          selectedFacility = ''

          renderLogin()
        }
      )

    })


  document
    .querySelector('#facilityType')
    ?.addEventListener(
      'change',
      event => {

        selectedFacilityType =
          event.target.value

        selectedFacility = ''

        renderLogin()
      }
    )


  document
    .querySelector('#facility')
    ?.addEventListener(
      'change',
      event => {

        selectedFacility =
          event.target.value
      }
    )


  document
    .querySelector('#continueBtn')
    ?.addEventListener(
      'click',
      handleLogin
    )


  document
    .querySelector('#userId')
    ?.addEventListener(
      'keydown',
      event => {

        if (event.key === 'Enter') {
          handleLogin()
        }

      }
    )


  document
    .querySelector('#helpButton')
    ?.addEventListener(
      'click',
      () => {

        alert(
          'Please contact your assigned health facility administrator for assistance.'
        )

      }
    )


  document
    .querySelector('#supportButton')
    ?.addEventListener(
      'click',
      () => {

        alert(
          'DWIT Support\n\nPlease contact your project administrator.'
        )

      }
    )
}


/* =========================================================
   LOGIN HANDLER
========================================================= */

async function handleLogin() {

  const input =
    document.querySelector('#userId')

  const button =
    document.querySelector('#continueBtn')

  const text =
    document.querySelector('#continueText')


  if (!input || !button || !text) {
    return
  }


  const userId =
    input.value.trim()


  if (!userId) {

    input.classList.add('error')

    input.focus()

    setTimeout(
      () => {
        input.classList.remove('error')
      },
      700
    )

    return
  }


  if (
    selectedRole !== 'patient' &&
    !selectedFacilityType
  ) {

    alert(
      t('chooseFacilityType')
    )

    return
  }


  if (
    selectedRole !== 'patient' &&
    !selectedFacility
  ) {

    alert(
      t('chooseFacility')
    )

    return
  }


  button.disabled = true

  text.textContent =
    t('signingIn')


  try {

    const data =
      await apiRequest(
        '/login',
        {
          method: 'POST',

          body: JSON.stringify({

            user_id: userId,

            role: selectedRole,

            facility_type:
              selectedRole === 'patient'
                ? ''
                : selectedFacilityType,

            facility:
              selectedRole === 'patient'
                ? ''
                : selectedFacility

          })
        }
      )


    localStorage.setItem(
      'sihgpt_user',
      JSON.stringify({

        ...data,

        user_id: userId,

        role: selectedRole

      })
    )


    if (
      selectedRole === 'patient'
    ) {

      await renderPatientDashboard(
        userId
      )

    } else {

      await renderStaffDashboard(
        selectedRole,
        userId
      )

    }

  } catch (error) {

    console.error(error)

    alert(
      error.message ||
      t('loginFailed')
    )

  } finally {

    button.disabled = false

    text.textContent =
      t('continue')
  }
}


/* =========================================================
   ARRAY HELPERS
========================================================= */

function getArray(
  data,
  ...keys
) {

  for (
    const key of keys
  ) {

    if (
      Array.isArray(
        data?.[key]
      )
    ) {

      return data[key]
    }
  }


  if (
    Array.isArray(data)
  ) {

    return data
  }


  return []
}


function recordTitle(
  item,
  fallback
) {

  return (
    item?.name ||
    item?.title ||
    item?.medicine ||
    item?.medication ||
    item?.test_name ||
    item?.test ||
    item?.reason ||
    fallback
  )
}


function renderRecords(
  items,
  fallback
) {

  if (
    !items.length
  ) {

    return `
      <div class="empty-records">
        No records available.
      </div>
    `
  }


  return `
    <div class="record-list">

      ${items
        .map(
          item => `

            <div class="record-item">

              <strong>
                ${escapeHtml(
                  recordTitle(
                    item,
                    fallback
                  )
                )}
              </strong>

              <span>
                ${escapeHtml(
                  item?.date ||
                  item?.appointment_date ||
                  item?.result ||
                  item?.status ||
                  item?.instructions ||
                  item?.dosage ||
                  'Recorded'
                )}
              </span>

            </div>

          `
        )
        .join('')}

    </div>
  `
}

function renderVisitTimeline(visits) {

  if (!visits || !visits.length) {
    return `
      <div class="empty-records">
        No visits recorded yet.
      </div>
    `
  }

  return `
    <div class="visit-timeline-list">

      ${visits
        .map(visit => {

          const visitDate =
            visit?.date ||
            visit?.created_at ||
            visit?.recorded_at ||
            'Date not available'

          return `
            <div class="timeline-item">

              <div class="timeline-marker">
                ●
              </div>

              <div class="timeline-content">

                <div class="timeline-header">

                  <div>
                    <strong>
                      Field Visit
                    </strong>

                    <span class="timeline-date">
                      ${escapeHtml(
                        visitDate
                      )}
                    </span>
                  </div>

                  <span class="timeline-status">
                    ${escapeHtml(
                      visit?.triage_status ||
                      'Normal'
                    )}
                  </span>

                </div>


                <div class="timeline-vitals">

                  <div>
                    <span>Temperature</span>
                    <strong>
                      ${escapeHtml(
                        visit?.temperature ||
                        '—'
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Blood Pressure</span>
                    <strong>
                      ${escapeHtml(
                        visit?.blood_pressure ||
                        '—'
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Pulse</span>
                    <strong>
                      ${escapeHtml(
                        visit?.pulse ||
                        '—'
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>SpO₂</span>
                    <strong>
                      ${escapeHtml(
                        visit?.spo2 ||
                        '—'
                      )}
                    </strong>
                  </div>

                </div>


                ${
                  visit?.symptoms
                    ? `
                      <div class="timeline-detail">
                        <span>Symptoms</span>
                        <p>
                          ${escapeHtml(
                            visit.symptoms
                          )}
                        </p>
                      </div>
                    `
                    : ''
                }


                ${
                  visit?.notes
                    ? `
                      <div class="timeline-detail">
                        <span>Notes</span>
                        <p>
                          ${escapeHtml(
                            visit.notes
                          )}
                        </p>
                      </div>
                    `
                    : ''
                }

              </div>

            </div>
          `
        })
        .join('')}

    </div>
  `
}


/* =========================================================
   PATIENT DASHBOARD
========================================================= */
async function loadFacilityFinder() {

  document
  .querySelector('#showPatientQR')
  ?.addEventListener('click', () => {

    const qrValue =
      `DWIT:${patient.patient_id || patientId}`

    const modal =
      document.createElement('div')

    modal.className = 'qr-modal'

    modal.innerHTML = `
      <div class="qr-modal-backdrop"></div>

      <div class="qr-modal-card">
        <button
          type="button"
          class="qr-modal-close"
        >
          ×
        </button>

        <div class="qr-modal-kicker">
          DWIT · PATIENT ID
        </div>

        <h2>My DWIT QR</h2>

        <p>
          Show this QR to an authorized doctor or ASHA worker.
        </p>

        <div
          id="patientQrCode"
          class="patient-qr-code"
        ></div>

        <strong class="patient-qr-id">
          ${escapeHtml(patient.patient_id || patientId)}
        </strong>

        <small>
          This QR contains only your DWIT patient identifier.
        </small>
      </div>
    `

    document.body.appendChild(modal)

    new QRCode(
      document.querySelector('#patientQrCode'),
      {
        text: qrValue,
        width: 220,
        height: 220,
        correctLevel: QRCode.CorrectLevel.M
      }
    )

    const closeModal = () => {
      modal.remove()
    }

    document
      .querySelector('.qr-modal-close')
      ?.addEventListener('click', closeModal)

    document
      .querySelector('.qr-modal-backdrop')
      ?.addEventListener('click', closeModal)
  })

  const mapContainer =
    document.querySelector('#facilityMap')

  const listContainer =
    document.querySelector('#facilityFinderList')

  const status =
    document.querySelector('#facilityLocationStatus')

  const locationButton =
    document.querySelector('#useMyLocationBtn')

  if (
    !mapContainer ||
    !listContainer ||
    !status
  ) {
    return
  }

  let map = null
  let userMarker = null
  let accuracyCircle = null
  let facilityMarkers = []

  const clearMarkers = () => {

    facilityMarkers.forEach(
      marker => map?.removeLayer(marker)
    )

    facilityMarkers = []
  }

  const createMap = (
    latitude,
    longitude
  ) => {

    if (!map) {

      map = L.map(
        mapContainer,
        {
          zoomControl: true
        }
      )

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution:
            '&copy; OpenStreetMap contributors'
        }
      ).addTo(map)

    }

    map.setView(
      [latitude, longitude],
      13
    )

    if (userMarker) {
      map.removeLayer(userMarker)
    }

    if (accuracyCircle) {
      map.removeLayer(accuracyCircle)
    }

    userMarker =
      L.marker(
        [latitude, longitude]
      )
        .addTo(map)
        .bindPopup(
          '<strong>Your Location</strong>'
        )

    accuracyCircle =
      L.circle(
        [latitude, longitude],
        {
          radius: 500,
          weight: 1
        }
      ).addTo(map)
  }

  const renderFacilities = (
    facilities,
    userLatitude,
    userLongitude
  ) => {

    listContainer.innerHTML = ''

    if (!facilities.length) {

      listContainer.innerHTML = `
        <div class="empty-records">
          No nearby healthcare facilities were found.
          Try increasing your search area or moving to
          a different location.
        </div>
      `

      return
    }

    const bounds =
      L.latLngBounds([
        [userLatitude, userLongitude]
      ])

    clearMarkers()

    facilities.forEach(
      facility => {

        const lat =
          Number(facility.lat)

        const lon =
          Number(facility.lon)

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lon)
        ) {
          return
        }

        const name =
          facility.tags?.name ||
          'Healthcare Facility'

        const amenity =
          facility.tags?.amenity ||
          'Healthcare'

        const addressParts = [
          facility.tags?.['addr:housenumber'],
          facility.tags?.['addr:street'],
          facility.tags?.['addr:city'],
          facility.tags?.['addr:state']
        ].filter(Boolean)

        const address =
          addressParts.join(', ') ||
          'Address not available'

        const marker =
          L.marker(
            [lat, lon]
          )
            .addTo(map)
            .bindPopup(
              `
                <strong>
                  ${escapeHtml(name)}
                </strong>
                <br>
                ${escapeHtml(amenity)}
                <br>
                ${escapeHtml(address)}
              `
            )

        facilityMarkers.push(marker)

        bounds.extend(
          [lat, lon]
        )
      }
    )

    map.fitBounds(
      bounds,
      {
        padding: [30, 30]
      }
    )

    const distanceKm = (
      lat1,
      lon1,
      lat2,
      lon2
    ) => {

      const earthRadius = 6371

      const dLat =
        (lat2 - lat1) *
        Math.PI /
        180

      const dLon =
        (lon2 - lon1) *
        Math.PI /
        180

      const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.cos(
          lat1 * Math.PI / 180
        ) *
        Math.cos(
          lat2 * Math.PI / 180
        ) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

      const c =
        2 *
        Math.atan2(
          Math.sqrt(a),
          Math.sqrt(1 - a)
        )

      return earthRadius * c
    }

    const sorted =
      facilities
        .map(
          facility => ({

            ...facility,

            distance:
              distanceKm(
                userLatitude,
                userLongitude,
                Number(facility.lat),
                Number(facility.lon)
              )

          })
        )
        .filter(
          facility =>
            Number.isFinite(
              facility.distance
            )
        )
        .sort(
          (a, b) =>
            a.distance -
            b.distance
        )

    listContainer.innerHTML =
      sorted
        .slice(0, 12)
        .map(
          facility => {

            const name =
              facility.tags?.name ||
              'Healthcare Facility'

            const amenity =
              facility.tags?.amenity ||
              'Healthcare'

            const addressParts = [
              facility.tags?.['addr:housenumber'],
              facility.tags?.['addr:street'],
              facility.tags?.['addr:city'],
              facility.tags?.['addr:state']
            ].filter(Boolean)

            const address =
              addressParts.join(', ') ||
              'Address not available'

            const destination =
              `${facility.lat},${facility.lon}`

            const navigationUrl =
              `https://www.google.com/maps/dir/?api=1` +
              `&origin=${encodeURIComponent(
                `${userLatitude},${userLongitude}`
              )}` +
              `&destination=${encodeURIComponent(
                destination
              )}` +
              `&travelmode=driving`

            return `
              <div class="facility-finder-item">

                <div class="facility-finder-info">

                  <div class="facility-finder-name">
                    ${escapeHtml(name)}
                  </div>

                  <div class="facility-finder-type">
                    ${escapeHtml(amenity)}
                  </div>

                  <div class="facility-finder-address">
                    ${escapeHtml(address)}
                  </div>

                  <div class="facility-distance">
                    ${facility.distance.toFixed(1)} km away
                  </div>

                </div>

                <button
                  type="button"
                  class="facility-map-btn"
                  data-navigation-url="${escapeHtml(
                    navigationUrl
                  )}"
                >
                  Navigate
                </button>

              </div>
            `
          }
        )
        .join('')

    listContainer
      .querySelectorAll(
        '.facility-map-btn'
      )
      .forEach(
        button => {

          button.addEventListener(
            'click',
            () => {

              const url =
                button.dataset.navigationUrl

              if (!url) {
                return
              }

              window.open(
                url,
                '_blank',
                'noopener,noreferrer'
              )
            }
          )

        }
      )
  }

  const findNearbyFacilities =
    (
      latitude,
      longitude
    ) => {

      createMap(
        latitude,
        longitude
      )

      status.textContent =
        'Finding nearby healthcare facilities...'

      listContainer.innerHTML = `
        <div class="dashboard-loading">
          Searching nearby healthcare facilities...
        </div>
      `
const delta = 0.035;

const south = latitude - delta;
const north = latitude + delta;
const west = longitude - delta;
const east = longitude + delta;

const query = `
  [out:json][timeout:25];

  (
    node["amenity"="hospital"](${south},${west},${north},${east});
    way["amenity"="hospital"](${south},${west},${north},${east});
    node["amenity"="clinic"](${south},${west},${north},${east});
    way["amenity"="clinic"](${south},${west},${north},${east});
    node["amenity"="doctors"](${south},${west},${north},${east});
  );

  out center tags;
`;

      fetch(
        'https://dwit-backend.onrender.com/facilities/nearby',
        {
          method: 'POST',
        headers: {
  'Content-Type': 'application/json'
},
body: JSON.stringify({
  query: query
})
        }
      )
        .then(
          response => {

            if (!response.ok) {
              throw new Error(
                'Nearby facility service unavailable.'
              )
            }

            return response.json()
          }
        )
        .then(
          data => {

            const elements =
              Array.isArray(
                data?.elements
              )
                ? data.elements
                : []

            const facilities =
              elements
                .map(
                  element => {

                    const latitudeValue =
                      element.lat ??
                      element.center?.lat

                    const longitudeValue =
                      element.lon ??
                      element.center?.lon

                    return {
                      ...element,
                      lat: latitudeValue,
                      lon: longitudeValue
                    }
                  }
                )
                .filter(
                  element =>
                    Number.isFinite(
                      Number(element.lat)
                    ) &&
                    Number.isFinite(
                      Number(element.lon)
                    )
                )

            status.textContent =
              `${facilities.length} nearby healthcare facilities found.`

            renderFacilities(
              facilities,
              latitude,
              longitude
            )
          }
        )
        .catch(
          error => {

            console.error(
              'Nearby facility search failed:',
              error
            )

            status.textContent =
              'Unable to load nearby facilities.'

            listContainer.innerHTML = `
              <div class="empty-records">
                Nearby facility search is temporarily unavailable.
                Please try again.
              </div>
            `
          }
        )
    }

  const requestLocation = () => {

    if (
      !navigator.geolocation
    ) {

      status.textContent =
        'Your browser does not support location services.'

      return
    }

    locationButton.disabled = true

    locationButton.textContent =
      'Locating...'

    status.textContent =
      'Requesting your current location...'

    navigator.geolocation.getCurrentPosition(
      position => {

        locationButton.disabled = false

        locationButton.textContent =
          '📍 Refresh My Location'

        findNearbyFacilities(
          position.coords.latitude,
          position.coords.longitude
        )
      },

      error => {

        locationButton.disabled = false

        locationButton.textContent =
          '📍 Use My Location'

        let message =
          'Unable to get your location.'

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {

          message =
            'Location permission was denied. Allow location access in your browser and try again.'

        } else if (
          error.code ===
          error.TIMEOUT
        ) {

          message =
            'Location request timed out. Please try again.'

        }

        status.textContent =
          message

        listContainer.innerHTML = `
          <div class="empty-records">
            ${escapeHtml(message)}
          </div>
        `
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    )
  }

  locationButton?.addEventListener(
    'click',
    requestLocation
  )

  requestLocation()
}

async function renderPatientDashboard(patientId) {
  app.innerHTML = `
    <div class="dashboard-page">
      <div class="dashboard-header">
        <div>
          <div class="dashboard-kicker">DWIT ·(Don't Worry I'm There) CONNECTED CARE</div>
          <h1>Loading patient record...</h1>
          <p>Preparing your appointments and health record</p>
        </div>

        <button class="logout-btn" id="logoutBtn" type="button">
          Logout
        </button>
      </div>

      <div class="dashboard-loading">
        Loading your health information...
      </div>
    </div>
  `

  attachLogout()

  try {
    const [
  patientData,
  appointmentData,
  prescriptionData,
  labData,
  referralData,
  doctorData,
  carepassData,
  maternalPregnancyData
] 
  = await Promise.all([
      apiGet(`/patients/${encodeURIComponent(patientId)}`),
      apiGet(`/patients/${encodeURIComponent(patientId)}/appointments`),
      apiGet(`/patients/${encodeURIComponent(patientId)}/prescriptions`),
      apiGet(`/patients/${encodeURIComponent(patientId)}/labs`),
      apiGet(`/patients/${encodeURIComponent(patientId)}/referrals`),
      apiGet('/doctors'),
apiGet(
  `/patients/${encodeURIComponent(patientId)}/carepass`
)
,
apiGet(
  `/maternal/patients/${encodeURIComponent(patientId)}/pregnancies?actor_id=${encodeURIComponent(patientId)}`
)
    ])

    const patient = patientData.patient || patientData

    const appointments = Array.isArray(appointmentData.appointments)
      ? appointmentData.appointments
      : []

    const prescriptions = Array.isArray(prescriptionData.prescriptions)
      ? prescriptionData.prescriptions
      : []

    const labs = Array.isArray(labData.labs)
      ? labData.labs
      : []

    const referrals = Array.isArray(referralData.referrals)
      ? referralData.referrals
      : []

    const doctors = Array.isArray(doctorData.doctors)
      ? doctorData.doctors
      : []

      const maternalPregnancies =
  Array.isArray(maternalPregnancyData?.pregnancies)
    ? maternalPregnancyData.pregnancies
    : []

    const availableDoctors = doctors.filter(
      doctor => doctor.availability_status === 'Available'
    )

    const doctorOptions = availableDoctors.length
      ? availableDoctors.map(doctor => `
          <option value="${doctor.user_id}">
            ${doctor.name} · ${doctor.specialty} · ${doctor.facility_name || doctor.facility_id}
          </option>
        `).join('')
      : `
          <option value="">
            No doctors currently available
          </option>
        `

    function appointmentStatus(status) {
      const safe = String(status || 'Requested')

      return `
        <span class="status-pill">
          ${safe}
        </span>
      `
    }

    function appointmentRecords() {
      if (!appointments.length) {
        return `
          <div class="empty-records">
            No appointments yet.
          </div>
        `
      }

      return `
        <div class="record-list">
          ${appointments.map(item => `
            <div class="record-item">
              <strong>
                ${item.doctor_name || item.doctor || 'Doctor'}
              </strong>

              <span>
                ${item.appointment_date || 'Date not set'}
                ·
                ${item.appointment_time || 'Time not set'}
              </span>

              <span>
                ${item.facility_name || item.facility || 'Facility'}
              </span>

              ${appointmentStatus(item.status)}

              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
                ${
                  item.status !== 'Cancelled' &&
                  item.status !== 'Completed' &&
                  item.status !== 'No-show'
                    ? `
                      <button
                        type="button"
                        class="secondary-action"
                        data-reschedule-id="${item.id}"
                      >
                        Reschedule
                      </button>

                      <button
                        type="button"
                        class="secondary-action"
                        data-cancel-id="${item.id}"
                      >
                        Cancel
                      </button>
                    `
                    : ''
                }
              </div>
            </div>
          `).join('')}
        </div>
      `
    }

    app.innerHTML = `
      <div class="dashboard-page">

       <div class="dashboard-header patient-hero">
          <div>
            <div class="dashboard-kicker">
             DWIT (Don't worry I'm there) · CONNECTED CARE
            </div>

            <h1>
              Welcome, ${patient.name || 'Patient'}
            </h1>

            <p>
              Your connected rural health record
            </p>
          </div>

          <button
            class="logout-btn"
            id="logoutBtn"
            type="button"
          >
            Logout
          </button>
        </div>

       <section class="dashboard-card carepass-card">
  <div class="card-heading">
    <div>
      <div class="card-kicker">CARE CONTINUITY</div>
      <h2>🪪 CAREPASS</h2>
      <p>Continuity-Aware Patient Passport</p>
    </div>

    <div class="carepass-status">
      ${carepassData?.carepass?.current_status?.health_status || 'Stable'}
    </div>
  </div>

  <div class="carepass-summary">

    <div class="carepass-stat">
      <span>Last Visit</span>
      <strong>
        ${
          carepassData?.carepass?.current_status?.last_visit?.visit_date
          || 'No visits'
        }
      </strong>
    </div>

    <div class="carepass-stat">
      <span>Open Items</span>
      <strong>
        ${
          Array.isArray(carepassData?.carepass?.open_items)
            ? carepassData.carepass.open_items.length
            : 0
        }
      </strong>
    </div>

    <div class="carepass-stat">
      <span>Open Referrals</span>
      <strong>
        ${
          Array.isArray(carepassData?.carepass?.open_referrals)
            ? carepassData.carepass.open_referrals.length
            : 0
        }
      </strong>
    </div>

    <div class="carepass-stat">
      <span>Appointments</span>
      <strong>
        ${
          Array.isArray(carepassData?.carepass?.active_appointments)
            ? carepassData.carepass.active_appointments.length
            : 0
        }
      </strong>
    </div>

  </div>

  <div class="carepass-next">
    <span>NEXT CARE ACTION</span>

    <strong>
      ${
        carepassData?.carepass?.next_action?.title
        || 'Continue routine follow-up'
      }
    </strong>

    <p>
      ${
        carepassData?.carepass?.next_action?.detail
        || 'Review the latest patient record.'
      }
    </p>
  </div>

  <div class="carepass-journey">
    <span>CARE JOURNEY</span>

    <div class="carepass-flow">
      ${
        Array.isArray(carepassData?.carepass?.care_journey)
          ? carepassData.carepass.care_journey
              .slice(-6)
              .map(item => `
                <div class="carepass-step">
                  <strong>${item.title || item.type}</strong>
                  <small>
                    ${item.status || ''}
                  </small>
                </div>
              `)
              .join('<div class="carepass-arrow">→</div>')
          : '<div class="carepass-empty">No care journey recorded yet.</div>'
      }
    </div>
  </div>

  <div class="carepass-handover">
    <span>HANDOVER BRIEF</span>
    <p>
      ${
        carepassData?.carepass?.handover_brief
        || 'No handover information available.'
      }
    </p>
  </div>
</section>
<section class="dashboard-card voice-symptom-card">

  <div class="card-heading">
    <div>
      <div class="card-kicker">
        AI HEALTH ASSISTANT
      </div>

      <h2>
        🎙️ Tell Us Your Symptoms
      </h2>

      <p>
        Speak naturally and DWIT will explain your reported symptoms
        in your selected language.
      </p>
    </div>

    <div class="voice-language-badge">
      ${LANGUAGES[selectedLanguage] || 'English'}
    </div>
  </div>

  <div class="voice-symptom-content">

    <button
      type="button"
      id="voiceSymptomBtn"
      class="voice-record-btn"
    >
      <span class="voice-record-icon">🎙️</span>

      <span>
        <strong id="voiceSymptomBtnText">
          Start Speaking
        </strong>

        <small>
          Tap and describe how you are feeling
        </small>
      </span>
    </button>

    <div
      id="voiceSymptomStatus"
      class="voice-status"
    >
      Ready to listen.
    </div>

    <div
      id="voiceTranscript"
      class="voice-transcript"
    >
      <div class="voice-empty">
        Your spoken symptoms will appear here.
      </div>
    </div>

    <button
      type="button"
      id="voiceAnalyzeBtn"
      class="primary-action"
      disabled
    >
      ✨ Explain My Symptoms
    </button>

    <div
      id="voiceAiResult"
      class="voice-ai-result"
      hidden
    >

      <div class="voice-result-section">
        <span>SUMMARY</span>
        <p id="voiceSummary"></p>
      </div>

      <div class="voice-result-section">
        <span>WHAT THIS MEANS</span>
        <p id="voiceExplanation"></p>
      </div>

      <div class="voice-result-section">
        <span>WHAT TO DO NEXT</span>
        <p id="voiceNextSteps"></p>
      </div>

      <div class="voice-result-section voice-warning-section">
        <span>IMPORTANT</span>
        <p id="voiceWarning"></p>
      </div>

      <button
        type="button"
        id="voiceSpeakResultBtn"
        class="secondary-action"
      >
        🔊 Listen
      </button>

    </div>

  </div>

</section>

<div class="patient-qr-bar">

  <div>
    <strong>Patient QR</strong>
    <span>Use this to share your patient ID securely.</span>
  </div>

  <button
    type="button"
    class="patient-qr-button"
    id="showPatientQR"
  >
    Show QR
  </button>

</div>
<div class="dashboard-grid">

          <div class="dashboard-card profile-card">
            <div class="card-heading">
              Patient Profile
            </div>

            <div class="profile-grid">

              <div>
                <span>Patient ID</span>
                <strong>${patient.patient_id || '—'}</strong>
              </div>

              <div>
                <span>Name</span>
                <strong>${patient.name || '—'}</strong>
              </div>

              <div>
                <span>Age</span>
                <strong>${patient.age ?? '—'}</strong>
              </div>

              <div>
                <span>Gender</span>
                <strong>${patient.gender || '—'}</strong>
              </div>

              <div>
                <span>Village</span>
                <strong>${patient.village || '—'}</strong>
              </div>

              <div>
                <span>Blood Group</span>
                <strong>${patient.blood_group || '—'}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>${patient.phone || '—'}</strong>
              </div>

              <div>
                <span>Health Status</span>
                ${appointmentStatus(patient.health_status || 'Stable')}
              </div>

            </div>
          </div>
<div class="patient-section-title">
  <span>CARE & APPOINTMENTS</span>
  <h2>Your visits and upcoming care</h2>
</div>

<section class="dashboard-card ai-appointment-card">

  <div class="card-heading">
    <div>
      <div class="card-kicker">
        DWIT AI · CARE COORDINATOR
      </div>

      <h2>
        🤖 Manage My Appointment
      </h2>

      <p>
        Tell DWIT what you need. Book, reschedule, cancel,
        or check your appointments using natural language.
      </p>
    </div>
  </div>

<div class="ai-appointment-input-row">

  <div class="ai-appointment-message-wrap">

    <textarea
      id="aiAppointmentMessage"
      rows="3"
      placeholder="Example: Book me with a doctor tomorrow morning"
    ></textarea>

    <button
      type="button"
      class="ai-appointment-mic"
      id="aiAppointmentVoiceBtn"
      title="Speak your appointment request"
      aria-label="Speak your appointment request"
    >
      🎙️
    </button>

  </div>

  <button
    type="button"
    class="primary-action"
    id="aiAppointmentBtn"
  >
    Ask DWIT
  </button>

</div>

  <div
    id="aiAppointmentResult"
    class="ai-appointment-result"
    hidden
  ></div>

</section>

          <div class="dashboard-card">
            <div class="card-heading">
              Book a Doctor Appointment
            </div>

            <form id="patientAppointmentForm">

              <div class="form-group">
                <label for="appointmentDoctor">
                  Doctor
                </label>

                <select
                  id="appointmentDoctor"
                  class="form-control"
                  required
                >
                  <option value="">
                    Select a doctor
                  </option>
                  ${doctorOptions}
                </select>
              </div>

              <div class="form-group">
                <label for="appointmentDate">
                  Date
                </label>

                <input
                  id="appointmentDate"
                  class="form-control"
                  type="date"
                  required
                />
              </div>

              <div class="form-group">
                <label for="appointmentTime">
                  Time
                </label>

                <select
                  id="appointmentTime"
                  class="form-control"
                  required
                >
                  <option value="">
                    Select doctor first
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="appointmentReason">
                  Reason
                </label>

                <textarea
                  id="appointmentReason"
                  class="form-control"
                  rows="3"
                  placeholder="Describe the reason for your visit"
                ></textarea>
              </div>

              <button
                type="submit"
                class="primary-action"
                id="bookPatientAppointmentBtn"
                ${availableDoctors.length ? '' : 'disabled'}
              >
                Request Appointment
              </button>

              <div
                id="appointmentFormMessage"
                class="form-message"
                style="margin-top:10px;"
              ></div>

            </form>
          </div>

          <div class="dashboard-card">

            <div class="card-heading">
              My Appointments
            </div>

            ${appointmentRecords()}

          </div>

<section class="dashboard-card maternal-patient-card">
  <div class="card-heading">
    👩‍🍼 Maternal & Child Care
  </div>

  ${
    String(patient.gender || '')
      .trim()
      .toLowerCase() === 'female'
      ? (
          maternalPregnancies.length
            ? `
              <div class="maternal-patient-summary">
                <div class="maternal-summary-item">
                  <span>Pregnancies</span>
                  <strong>${maternalPregnancies.length}</strong>
                </div>

                <div class="maternal-summary-item">
                  <span>Latest Status</span>
                  <strong>
                    ${escapeHtml(
                      maternalPregnancies[0].status || 'Active'
                    )}
                  </strong>
                </div>

                <div class="maternal-summary-item">
                  <span>EDD</span>
                  <strong>
                    ${escapeHtml(
                      maternalPregnancies[0].edd || 'Not recorded'
                    )}
                  </strong>
                </div>

                <div class="maternal-summary-item">
                  <span>Risk Status</span>
                  <strong>
                    ${escapeHtml(
                      maternalPregnancies[0].risk_status || 'Not recorded'
                    )}
                  </strong>
                </div>
              </div>

              <p class="dashboard-description">
                Your maternal care records are available in DWIT as a
                read-only health journey.
              </p>
            `
            : `
              <div class="empty-records">
                No maternal pregnancy record has been registered yet.
              </div>
            `
        )
      : `
          <div class="empty-records">
            Maternal care records are not applicable to this patient profile.
          </div>
        `
  }
</section>

          
         <section class="dashboard-card facility-finder-card">

  <div class="facility-finder-header">

    <div>
      <div class="card-heading">
        Find Care Near You
      </div>

      <p class="dashboard-description">
        Find healthcare facilities near your current location
        and get real navigation directions.
      </p>
    </div>

    <button
      type="button"
      class="facility-location-btn"
      id="useMyLocationBtn"
    >
      📍 Use My Location
    </button>

  </div>

  <div
    id="facilityLocationStatus"
    class="facility-location-status"
  >
    Location not detected yet.
  </div>

  <div
    id="facilityMap"
    class="facility-map"
  ></div>

  <div
    id="facilityFinderList"
    class="facility-finder-list"
  ></div>

</section>

<div class="patient-section-title">
  <span>HEALTH RECORDS</span>
  <h2>Your health information</h2>
</div>
         <div class="dashboard-card patient-record-card">

            <div class="card-heading">
              Prescriptions
            </div>

            ${renderRecords(
              prescriptions,
              'Prescription'
            )}

          </div>

         <div class="dashboard-card patient-record-card">

            <div class="card-heading">
              Lab Reports
            </div>

            ${renderRecords(
              labs,
              'Lab Report'
            )}

          </div>

          <div class="dashboard-card patient-record-card">

            <div class="card-heading">
              Referrals
            </div>

            ${renderRecords(
              referrals,
              'Referral'
            )}

          </div>

        </div>

      </div>
    `

    attachLogout()
loadFacilityFinder()

    // =====================================================
    // AI APPOINTMENT ASSISTANT
    // =====================================================

    const aiAppointmentButton =
      document.querySelector(
        '#aiAppointmentBtn'
      )

    const aiAppointmentMessage =
      document.querySelector(
        '#aiAppointmentMessage'
      )

    const aiAppointmentResult =
      document.querySelector(
        '#aiAppointmentResult'
      )

// =====================================================
// AI APPOINTMENT VOICE INPUT
// =====================================================

const aiAppointmentVoiceButton =
  document.querySelector(
    '#aiAppointmentVoiceBtn'
  )

const AppointmentSpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition

if (
  aiAppointmentVoiceButton &&
  AppointmentSpeechRecognition
) {

  const appointmentSpeech =
    new AppointmentSpeechRecognition()

  appointmentSpeech.continuous = false
  appointmentSpeech.interimResults = true

 appointmentSpeech.lang = 'en-IN'

  appointmentSpeech.onstart = () => {

    aiAppointmentVoiceButton.textContent =
      '🔴'

    aiAppointmentVoiceButton.classList.add(
      'voice-recording'
    )
  }

  appointmentSpeech.onresult =
    event => {

      let transcript = ''

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        transcript +=
          event.results[i][0].transcript
      }

      const messageBox =
        document.querySelector(
          '#aiAppointmentMessage'
        )

      if (messageBox && transcript.trim()) {
        messageBox.value =
          transcript.trim()
      }
    }

  appointmentSpeech.onerror = () => {

    aiAppointmentVoiceButton.textContent =
      '🎙️'

    aiAppointmentVoiceButton.classList.remove(
      'voice-recording'
    )
  }

  appointmentSpeech.onend = () => {

    aiAppointmentVoiceButton.textContent =
      '🎙️'

    aiAppointmentVoiceButton.classList.remove(
      'voice-recording'
    )
  }

  aiAppointmentVoiceButton.addEventListener(
    'click',
    () => {

      try {

        appointmentSpeech.lang =
          speechLanguageMap[selectedLanguage] ||
          'en-IN'

        appointmentSpeech.start()

      } catch (error) {

        console.error(
          'Appointment voice input:',
          error
        )
      }
    }
  )

} else if (aiAppointmentVoiceButton) {

  aiAppointmentVoiceButton.disabled = true

  aiAppointmentVoiceButton.title =
    'Voice input is not supported in this browser'
}


    aiAppointmentButton?.addEventListener(
      'click',
      async () => {

        const message =
          aiAppointmentMessage?.value.trim()

        if (!message) {
          return
        }

        aiAppointmentButton.disabled = true
        aiAppointmentButton.textContent =
          'Understanding...'

        if (aiAppointmentResult) {
          aiAppointmentResult.hidden = false
          aiAppointmentResult.innerHTML = `
            <div class="appointment-ai-loading">
              🤖 DWIT is understanding your request...
            </div>
          `
        }

        try {

          const data =
            await apiRequest(
              '/ai/appointment-assistant',
              {
                method: 'POST',
                body: JSON.stringify({
                  patient_id: patientId,
                  message: message
                })
              }
            )

          if (!data.success) {
            throw new Error(
              data.message ||
              'Unable to process your appointment request.'
            )
          }

          const assistant =
            data.assistant || {}

          const intent =
            assistant.intent || 'unknown'

          const doctor =
            assistant.doctor_name ||
            ''

          const date =
            assistant.date ||
            ''

          const time =
            assistant.time ||
            ''

          const preference =
            assistant.time_preference ||
            ''
if (aiAppointmentResult) {

  aiAppointmentResult.innerHTML = `
    <div class="appointment-ai-understood">

      <div class="appointment-ai-label">
        DWIT UNDERSTOOD
      </div>

      <h3>
        ${escapeHtml(
          intent
            .replace(
              /^./,
              letter => letter.toUpperCase()
            )
        )}
      </h3>

      ${
        doctor
          ? `
            <p>
              <strong>Doctor:</strong>
              ${escapeHtml(doctor)}
            </p>
          `
          : ''
      }

      ${
        date
          ? `
            <p>
              <strong>Date:</strong>
              ${escapeHtml(date)}
            </p>
          `
          : ''
      }

      ${
        time
          ? `
            <p>
              <strong>Time:</strong>
              ${escapeHtml(time)}
            </p>
          `
          : ''
      }

      ${
        preference
          ? `
            <p>
              <strong>Preference:</strong>
              ${escapeHtml(preference)}
            </p>
          `
          : ''
      }

      ${
        intent === 'book' &&
        date &&
        time &&
        assistant.doctor_user_id
          ? `
            <button
              type="button"
              class="primary-action"
              id="confirmAiAppointmentBtn"
            >
              Confirm & Book
            </button>
          `
          : ''
      }

      ${
        intent === 'reschedule' &&
        assistant.appointment_id &&
        date &&
        time
          ? `
            <button
              type="button"
              class="primary-action"
              id="confirmAiAppointmentBtn"
            >
              Confirm & Reschedule
            </button>
          `
          : ''
      }

      ${
        intent === 'cancel' &&
        assistant.appointment_id
          ? `
            <button
              type="button"
              class="primary-action"
              id="confirmAiAppointmentBtn"
            >
              Confirm Cancellation
            </button>
          `
          : ''
      }

      ${
        assistant.needs_confirmation &&
        !(
          (intent === 'book' &&
            date &&
            time &&
            assistant.doctor_user_id) ||
          (intent === 'reschedule' &&
            assistant.appointment_id &&
            date &&
            time) ||
          (intent === 'cancel' &&
            assistant.appointment_id)
        )
          ? `
            <p class="appointment-ai-next">
              I need a specific available slot before I can make the change.
            </p>
          `
          : ''
      }

    </div>
  `

  document
    .querySelector('#confirmAiAppointmentBtn')
    ?.addEventListener(
      'click',
      async () => {

        const confirmButton =
          document.querySelector(
            '#confirmAiAppointmentBtn'
          )

        confirmButton.disabled = true
        confirmButton.textContent =
          'Processing...'

        try {

          const actionData = {
            intent,
            doctor_user_id:
              assistant.doctor_user_id || null,
            date:
              date || null,
            time:
              time || null,
            appointment_id:
              assistant.appointment_id || null,
            reason:
              assistant.reason || ''
          }

          const result =
            await apiRequest(
              '/ai/appointment-assistant',
              {
                method: 'POST',
                body: JSON.stringify({
                  patient_id: patientId,
                  message: 'Confirmed',
                  confirm: true,
                  action: actionData
                })
              }
            )

          if (!result.success) {
            throw new Error(
              result.message ||
              'Unable to complete the appointment.'
            )
          }

          if (aiAppointmentResult) {
            aiAppointmentResult.innerHTML = `
              <div class="appointment-ai-success">
                ✅ Appointment action completed successfully.
              </div>
            `
          }

          setTimeout(
            () => renderPatientDashboard(patientId),
            700
          )

        } catch (error) {

          console.error(
            'AI appointment action error:',
            error
          )

          if (aiAppointmentResult) {
            aiAppointmentResult.innerHTML = `
              <div class="appointment-ai-error">
                ${escapeHtml(
                  error.message ||
                  'Unable to complete the appointment.'
                )}
              </div>
            `
          }

        }
      }
    )
}

          if (aiAppointmentResult) {
            aiAppointmentResult.hidden = false
            aiAppointmentResult.innerHTML = `
              <div class="appointment-ai-error">
                ${escapeHtml(
                  error.message ||
                  'Unable to process your request.'
                )}
              </div>
            `
          }

        } finally {

          aiAppointmentButton.disabled = false
          aiAppointmentButton.textContent =
            'Ask DWIT'

        }
      }
    )


document
  .querySelector('#showPatientQR')
  ?.addEventListener('click', () => {
    const qrValue =
      `DWIT:${patient.patient_id || patientId}`

    const modal =
      document.createElement('div')

    modal.className = 'qr-modal'

    modal.innerHTML = `
      <div class="qr-modal-backdrop"></div>

      <div class="qr-modal-card">
        <button
          type="button"
          class="qr-modal-close"
          aria-label="Close"
        >
          ×
        </button>

        <div class="qr-modal-kicker">
          DWIT · PATIENT ID
        </div>

        <h2>My DWIT QR</h2>

        <p>
          Show this QR to an authorized
          doctor or ASHA worker.
        </p>

        <div
          id="patientQrCode"
          class="patient-qr-code"
        ></div>

        <strong class="patient-qr-id">
          ${escapeHtml(
            patient.patient_id || patientId
          )}
        </strong>

        <small>
          This QR contains only your DWIT
          patient identifier.
        </small>
      </div>
    `

    document.body.appendChild(modal)

    new QRCode(
      document.querySelector('#patientQrCode'),
      {
        text: qrValue,
        width: 220,
        height: 220,
        correctLevel:
          QRCode.CorrectLevel.M
      }
    )

    const closeModal = () => {
      modal.remove()
    }

    modal
      .querySelector('.qr-modal-close')
      ?.addEventListener(
        'click',
        closeModal
      )

    modal
      .querySelector('.qr-modal-backdrop')
      ?.addEventListener(
        'click',
        closeModal
      )
  })


    // =====================================================
    // PATIENT VOICE SYMPTOM ASSISTANT
    // =====================================================

    const voiceButton =
      document.querySelector('#voiceSymptomBtn')

    const voiceButtonText =
      document.querySelector('#voiceSymptomBtnText')

    const voiceStatus =
      document.querySelector('#voiceSymptomStatus')

    const transcriptBox =
      document.querySelector('#voiceTranscript')

    const analyzeButton =
      document.querySelector('#voiceAnalyzeBtn')

    const resultBox =
      document.querySelector('#voiceAiResult')

    const summaryBox =
      document.querySelector('#voiceSummary')

    const explanationBox =
      document.querySelector('#voiceExplanation')

    const nextStepsBox =
      document.querySelector('#voiceNextSteps')

    const warningBox =
      document.querySelector('#voiceWarning')

    const speakResultButton =
      document.querySelector('#voiceSpeakResultBtn')


    let voiceTranscriptText = ''
    let speechRecognition = null
    let isListening = false


    const speechLanguageMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      kn: 'kn-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      ml: 'ml-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      as: 'as-IN'
    }


    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition


    if (!SpeechRecognition) {

      if (voiceStatus) {
        voiceStatus.textContent =
          'Voice input is not supported in this browser. Please use Chrome or Edge.'
      }

      if (voiceButton) {
        voiceButton.disabled = true
      }

    } else {

      speechRecognition =
        new SpeechRecognition()

      speechRecognition.continuous = false
      speechRecognition.interimResults = true

      speechRecognition.lang =
        speechLanguageMap[selectedLanguage] ||
        'en-IN'


      speechRecognition.onstart = () => {

        isListening = true

        if (voiceButton) {
          voiceButton.classList.add(
            'voice-recording'
          )
        }

        if (voiceButtonText) {
          voiceButtonText.textContent =
            'Listening...'
        }

        if (voiceStatus) {
          voiceStatus.textContent =
            'Speak clearly. I am listening.'
        }
      }


      speechRecognition.onresult =
        event => {

          let finalText = ''
          let interimText = ''

          for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
          ) {

            const transcript =
              event.results[i][0].transcript

            if (
              event.results[i].isFinal
            ) {
              finalText += transcript
            } else {
              interimText += transcript
            }
          }

          const displayText =
            `${voiceTranscriptText} ${finalText} ${interimText}`
              .trim()

          if (transcriptBox) {

            transcriptBox.innerHTML = `
              <div class="voice-transcript-label">
                YOU SAID
              </div>

              <p>
                ${escapeHtml(displayText)}
              </p>
            `
          }

          if (finalText.trim()) {

            voiceTranscriptText =
              `${voiceTranscriptText} ${finalText}`
                .trim()

            if (analyzeButton) {
              analyzeButton.disabled = false
            }
          }
        }


      speechRecognition.onerror =
        event => {

          console.error(
            'Speech recognition error:',
            event.error
          )

          isListening = false

          if (voiceButton) {
            voiceButton.classList.remove(
              'voice-recording'
            )
          }

          if (voiceButtonText) {
            voiceButtonText.textContent =
              'Start Speaking'
          }

          if (voiceStatus) {

            if (
              event.error ===
              'not-allowed'
            ) {

              voiceStatus.textContent =
                'Microphone permission was denied. Please allow microphone access.'

            } else {

              voiceStatus.textContent =
                'Unable to understand the recording. Please try again.'
            }
          }
        }


      speechRecognition.onend =
        () => {

          isListening = false

          if (voiceButton) {
            voiceButton.classList.remove(
              'voice-recording'
            )
          }

          if (voiceButtonText) {
            voiceButtonText.textContent =
              'Start Speaking'
          }

          if (
            voiceTranscriptText &&
            voiceStatus
          ) {

            voiceStatus.textContent =
              'Recording complete. You can review it or ask DWIT to explain it.'
          }
        }


      voiceButton?.addEventListener(
        'click',
        () => {

          if (isListening) {

            speechRecognition.stop()

            return
          }

          voiceTranscriptText = ''

          if (transcriptBox) {

            transcriptBox.innerHTML = `
              <div class="voice-transcript-label">
                LISTENING
              </div>

              <p>
                Start speaking...
              </p>
            `
          }

          if (analyzeButton) {
            analyzeButton.disabled = true
          }

          speechRecognition.lang =
            speechLanguageMap[selectedLanguage] ||
            'en-IN'

          speechRecognition.start()
        }
      )


      analyzeButton?.addEventListener(
        'click',
        async () => {

          const symptoms =
            voiceTranscriptText.trim()

          if (!symptoms) {
            return
          }

          analyzeButton.disabled = true
          analyzeButton.textContent =
            '✨ Understanding...'

          if (voiceStatus) {
            voiceStatus.textContent =
              'DWIT AI is preparing your explanation...'
          }

          try {

            const response =
              await fetch(
                `${API_URL}/ai/patient-explanation`,
                {
                  method: 'POST',

                  headers: {
                    'Content-Type':
                      'application/json'
                  },

                  body: JSON.stringify({
                    patient_id:
                      patientId,

                    symptoms:
                      symptoms,

                    language:
                      selectedLanguage
                  })
                }
              )


            const data =
              await response.json()


            if (!response.ok) {

              throw new Error(
                data.detail ||
                data.message ||
                'Unable to generate explanation.'
              )
            }


            if (summaryBox) {
              summaryBox.textContent =
                data.summary || ''
            }

            if (explanationBox) {
              explanationBox.textContent =
                data.explanation || ''
            }

            if (nextStepsBox) {
              nextStepsBox.textContent =
                data.next_steps || ''
            }

            if (warningBox) {
              warningBox.textContent =
                data.warning || ''
            }


            if (resultBox) {
              resultBox.hidden = false
            }

            if (voiceStatus) {
              voiceStatus.textContent =
                'Explanation ready.'
            }

          } catch (error) {

            console.error(
              'Patient AI explanation error:',
              error
            )

            if (voiceStatus) {
              voiceStatus.textContent =
                error.message
            }

          } finally {

            analyzeButton.disabled = false

            analyzeButton.textContent =
              '✨ Explain My Symptoms'
          }
        }
      )


      speakResultButton?.addEventListener(
        'click',
        () => {

          const text = [
            summaryBox?.textContent,
            explanationBox?.textContent,
            nextStepsBox?.textContent,
            warningBox?.textContent
          ]
            .filter(Boolean)
            .join('. ')

          if (!text) {
            return
          }

          if (
            !window.speechSynthesis
          ) {
            alert(
              'Text-to-speech is not supported in this browser.'
            )

            return
          }

          window.speechSynthesis.cancel()

          const utterance =
            new SpeechSynthesisUtterance(text)

          const voiceOutputLanguages = {
            en: 'en-IN',
            hi: 'hi-IN',
            kn: 'kn-IN',
            mr: 'mr-IN',
            ta: 'ta-IN',
            te: 'te-IN',
            ml: 'ml-IN',
            bn: 'bn-IN',
            gu: 'gu-IN',
            pa: 'pa-IN',
            as: 'as-IN'
          }

          utterance.lang =
            voiceOutputLanguages[
              selectedLanguage
            ] || 'en-IN'

          utterance.rate = 0.9

          window.speechSynthesis.speak(
            utterance
          )
        }
      )
    }


    const dateInput =
      document.querySelector('#appointmentDate')

    if (dateInput) {
      const today = new Date()

      const yyyy = today.getFullYear()
      const mm = String(today.getMonth() + 1).padStart(2, '0')
      const dd = String(today.getDate()).padStart(2, '0')

      dateInput.min = `${yyyy}-${mm}-${dd}`
    }

    const doctorSelect =
      document.querySelector('#appointmentDoctor')

    const timeSelect =
      document.querySelector('#appointmentTime')

    doctorSelect?.addEventListener('change', () => {
      const doctor =
        availableDoctors.find(
          item => item.user_id === doctorSelect.value
        )

      if (!doctor || !timeSelect) {
        return
      }

      const start =
        doctor.start_time || '09:00'

      const end =
        doctor.end_time || '17:00'

      const [startHour, startMinute] =
        start.split(':').map(Number)

      const [endHour, endMinute] =
        end.split(':').map(Number)

      const startTotal =
        startHour * 60 + startMinute

      const endTotal =
        endHour * 60 + endMinute

      const slots = []

      for (
        let minutes = startTotal;
        minutes <= endTotal;
        minutes += 30
      ) {
        const hour24 =
          Math.floor(minutes / 60)

        const minute =
          minutes % 60

        const suffix =
          hour24 >= 12 ? 'PM' : 'AM'

        const hour12 =
          hour24 % 12 || 12

        slots.push(`
          <option value="${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}">
            ${hour12}:${String(minute).padStart(2, '0')} ${suffix}
          </option>
        `)
      }

      timeSelect.innerHTML = `
        <option value="">
          Select time
        </option>
        ${slots.join('')}
      `
    })

    document
      .querySelector('#patientAppointmentForm')
      ?.addEventListener('submit', async event => {

        event.preventDefault()

        const message =
          document.querySelector('#appointmentFormMessage')

        const doctorUserId =
          document.querySelector('#appointmentDoctor')?.value

        const appointmentDate =
          document.querySelector('#appointmentDate')?.value

        const appointmentTime =
          document.querySelector('#appointmentTime')?.value

        const reason =
          document.querySelector('#appointmentReason')?.value || ''

        if (
          !doctorUserId ||
          !appointmentDate ||
          !appointmentTime
        ) {
          if (message) {
            message.textContent =
              'Please select doctor, date and time.'
          }

          return
        }

        const button =
          document.querySelector('#bookPatientAppointmentBtn')

        if (button) {
          button.disabled = true
          button.textContent = 'Requesting...'
        }

        try {
          const response = await fetch(
            `${API_URL}/appointments?booked_by=${encodeURIComponent(patientId)}&source_role=patient`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                patient_id: patientId,
                doctor_user_id: doctorUserId,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                reason
              })
            }
          )

          const data = await response.json()

          if (!response.ok) {
            throw new Error(
              data.detail ||
              data.message ||
              'Unable to request appointment.'
            )
          }

          if (message) {
            message.textContent =
              'Appointment requested successfully.'
          }

          await renderPatientDashboard(patientId)

        } catch (error) {

          console.error(error)

          if (message) {
            message.textContent =
              error.message
          }

          if (button) {
            button.disabled = false
            button.textContent = 'Request Appointment'
          }
        }
      })

    document
      .querySelectorAll('[data-cancel-id]')
      .forEach(button => {

        button.addEventListener('click', async () => {

          const appointmentId =
            button.dataset.cancelId

          try {
            const response = await fetch(
              `${API_URL}/appointments/${appointmentId}?booked_by=${encodeURIComponent(patientId)}`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  status: 'Cancelled'
                })
              }
            )

            const data = await response.json()

            if (!response.ok) {
              throw new Error(
                data.detail ||
                'Unable to cancel appointment.'
              )
            }

            await renderPatientDashboard(patientId)

          } catch (error) {
            console.error(error)
            alert(error.message)
          }
        })
      })

    document
      .querySelectorAll('[data-reschedule-id]')
      .forEach(button => {

        button.addEventListener('click', async () => {

          const appointmentId =
            button.dataset.rescheduleId

          const newDate =
            prompt('Enter new date (YYYY-MM-DD):')

          if (!newDate) {
            return
          }

          const newTime =
            prompt('Enter new time (HH:MM):')

          if (!newTime) {
            return
          }

          try {
            const response = await fetch(
              `${API_URL}/appointments/${appointmentId}?booked_by=${encodeURIComponent(patientId)}`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  appointment_date: newDate,
                  appointment_time: newTime
                })
              }
            )

            const data = await response.json()

            if (!response.ok) {
              throw new Error(
                data.detail ||
                'Unable to reschedule appointment.'
              )
            }

            await renderPatientDashboard(patientId)

          } catch (error) {
            console.error(error)
            alert(error.message)
          }
        })
      })

  } catch (error) {

    console.error(error)

    app.innerHTML = `
      <div class="dashboard-page">

        <div class="dashboard-header">

          <div>
            <div class="dashboard-kicker">
              DWIT (Don't worry I'm there)
            </div>

            <h1>
              Unable to load patient data
            </h1>

            <p>
              ${error.message}
            </p>
          </div>

          <button
            class="logout-btn"
            id="logoutBtn"
            type="button"
          >
            Logout
          </button>

        </div>

        <div class="dashboard-error">

          <h3>
            Something went wrong
          </h3>

          <p>
            Please check the backend and try again.
          </p>

        </div>

      </div>
    `

    attachLogout()

    
  }
}


/* =========================================================
   STAFF DASHBOARD
========================================================= */

async function renderStaffDashboard(
  role,
  userId
) {

  const isAsha =
    role === 'asha'


  let patients = []
let referrals = []
let currentPatient = null
let currentVisits = []
let inventory = []
let diagnostics = []


  let session = {}

  try {

    session =
      JSON.parse(
        localStorage.getItem(
          'sihgpt_user'
        ) || '{}'
      )

  } catch {

    session = {}
  }


  const sessionUser =
    session.user ||
    session


  const facilityName =
    sessionUser.facility ||
    selectedFacility ||
    'Assigned Facility'


  async function loadPatients() {

    const data =
      await apiGet(
        `/staff/${encodeURIComponent(
          userId
        )}/patients`
      )


    if (
      data?.success === false
    ) {

      throw new Error(
        data.message ||
        data.detail ||
        'Unable to load patients.'
      )
    }


    return getArray(
      data,
      'patients',
      'data'
    )
  }

  async function loadInventory() {
    const facilityId =
      sessionUser?.facility_id ||
      selectedFacility ||
      ''

    const url = facilityId
      ? `/inventory?facility_id=${encodeURIComponent(facilityId)}`
      : '/inventory'

    const data = await apiGet(url)

    if (data?.success === false) {
      throw new Error(
        data.message ||
        data.detail ||
        'Unable to load medicine inventory.'
      )
    }

    return getArray(
      data,
      'inventory',
      'data'
    )
  }

    async function loadDiagnostics() {
    const facilityId =
      sessionUser?.facility_id ||
      selectedFacility ||
      ''

    const url = facilityId
      ? `/diagnostics?facility_id=${encodeURIComponent(facilityId)}`
      : '/diagnostics'

    const data =
      await apiGet(url)

    if (data?.success === false) {
      throw new Error(
        data.message ||
        data.detail ||
        'Unable to load diagnostics.'
      )
    }

    return getArray(
      data,
      'diagnostics',
      'data'
    )
  }
  async function loadReferrals() {

    if (isAsha) {
      return []
    }


    const data =
      await apiGet(
        `/staff/${encodeURIComponent(
          userId
        )}/referrals`
      )


    if (
      data?.success === false
    ) {

      throw new Error(
        data.message ||
        data.detail ||
        'Unable to load referrals.'
      )
    }


    return getArray(
      data,
      'referrals',
      'data'
    )
  }


  async function loadPatient(
    patientId
  ) {

    const data =
      await apiGet(
        `/staff/${encodeURIComponent(
          userId
        )}/patients/${encodeURIComponent(
          patientId
        )}`
      )


    if (
      data?.success === false
    ) {

      throw new Error(
        data.message ||
        data.detail ||
        'Unable to open patient.'
      )
    }


    return (
      data.patient ||
      data.data ||
      data
    )
  }


  async function loadVisits(
    patientId
  ) {

    try {

      const data =
        await apiGet(
          `/staff/${encodeURIComponent(
            userId
          )}/patients/${encodeURIComponent(
            patientId
          )}/visits`
        )


      return getArray(
        data,
        'visits',
        'timeline',
        'data'
      )

    } catch {

      try {

        const data =
          await apiGet(
            `/patients/${encodeURIComponent(
              patientId
            )}/timeline`
          )


        return getArray(
          data,
          'timeline',
          'visits',
          'data'
        )

      } catch {

        return []
      }
    }
  }


  function renderPatientList(
    items
  ) {

    if (
      !items.length
    ) {

      return `

        <div class="empty-records">
          No patients found in your authorized care context.
        </div>

      `
    }


    return items
      .map(
        patient => `

          <div
            class="staff-patient-item"
            data-patient-id="${escapeHtml(
              patient.patient_id
            )}"
          >


            <div class="staff-patient-info">

              <strong>
                ${escapeHtml(
                  patient.name ||
                  'Unnamed Patient'
                )}
              </strong>


              <span>

                ${escapeHtml(
                  patient.patient_id ||
                  '—'
                )}

                ${
                  patient.village
                    ? ` · ${escapeHtml(
                        patient.village
                      )}`
                    : ''
                }

              </span>


              <small>
                ${escapeHtml(
                  patient.facility_name ||
                  facilityName
                )}
              </small>

            </div>


            <button
              type="button"
              class="view-patient-btn"
              data-patient-id="${escapeHtml(
                patient.patient_id
              )}"
            >
              View
            </button>

          </div>

        `
      )
      .join('')
  }


  function filteredPatients(
    query
  ) {

    const q =
      query
        .trim()
        .toLowerCase()


    if (!q) {
      return patients
    }


    return patients.filter(
      patient =>

        String(
          patient.patient_id ||
          ''
        )
          .toLowerCase()
          .includes(q) ||

        String(
          patient.name ||
          ''
        )
          .toLowerCase()
          .includes(q) ||

        String(
          patient.village ||
          ''
        )
          .toLowerCase()
          .includes(q)
    )
  }

// =====================================================
// DWIT MATERNAL & CHILD CARE CENTER
// =====================================================

async function openMaternalChildCareCenter() {

  const existing =
    document.querySelector(
      '#maternalChildCareOverlay'
    )

  if (existing) {
    existing.remove()
  }

  const overlay =
    document.createElement('div')

  overlay.id =
    'maternalChildCareOverlay'

  overlay.className =
    'maternal-child-care-overlay'

  overlay.innerHTML = `
    <div class="maternal-child-care-modal">

      <div class="maternal-care-header">

<img
  src="/dwit-logo.png"
  alt="DWIT"
  class="dwit-maternal-logo"
>

        <div>
          <div class="dashboard-kicker">
            DWIT · MATERNAL & CHILD CARE
          </div>

          <h2>
            Pregnancy to 6 Years
          </h2>

          <p>
            Track pregnancy, ANC, ASHA visits, delivery,
            postnatal care and every child under 6.
          </p>
        </div>

        <button
          type="button"
          class="modal close-btn"
          id="closeMaternalChildCare"
        >
          ×
        </button>

      </div>

      <div class="maternal-care-search">

        <div>
          <label for="maternalPatientSearch">
            Select Patient
          </label>

          <input
            id="maternalPatientSearch"
            type="text"
            placeholder="Search patient by name, ID or phone"
            autocomplete="off"
          >
        </div>

        <button
          type="button"
          class="primary-action"
          id="maternalSearchPatientBtn"
        >
          Search
        </button>

      </div>

      <div
        id="maternalPatientResults"
        class="maternal-patient-results"
      ></div>

      <div
        id="maternalCareContent"
        class="maternal-care-content"
      >

        <div class="maternal-care-empty">

          <div class="maternal-care-empty-icon">
            👩‍🍼
          </div>

          <h3>
            Select a patient
          </h3>

          <p>
            Search for a patient to open their complete
            maternal and child care journey.
          </p>

        </div>

      </div>

    </div>
  `

  document.body.appendChild(
    overlay
  )

  document
    .querySelector(
      '#closeMaternalChildCare'
    )
    ?.addEventListener(
      'click',
      () => overlay.remove()
    )

  overlay.addEventListener(
    'click',
    event => {

      if (event.target === overlay) {
        overlay.remove()
      }

    }
  )

  const searchInput =
    document.querySelector(
      '#maternalPatientSearch'
    )

  const searchButton =
    document.querySelector(
      '#maternalSearchPatientBtn'
    )

  const resultsBox =
    document.querySelector(
      '#maternalPatientResults'
    )

  async function searchMaternalPatients() {

    const query =
      searchInput?.value?.trim()

    if (!query) {

      if (resultsBox) {
        resultsBox.innerHTML = `
          <div class="maternal-search-message">
            Enter a patient name, ID or phone number.
          </div>
        `
      }

      return
    }

    if (resultsBox) {
      resultsBox.innerHTML = `
        <div class="maternal-search-message">
          Searching patients...
        </div>
      `
    }

    try {

      const result =
        null

     const patients =
  (
    filteredPatients(
      query
    ) || []
  ).filter(
    patient =>
      ['female', 'f'].includes(
        String(
          patient.gender || ''
        )
          .trim()
          .toLowerCase()
      )
  )


      if (!patients.length) {

        if (resultsBox) {
          resultsBox.innerHTML = `
            <div class="maternal-search-message">
              No matching patients found.
            </div>
          `
        }

        return
      }

      if (resultsBox) {

        resultsBox.innerHTML = `
          <div class="maternal-patient-list">

            ${patients
              .map(
                patient => `
                  <button
                    type="button"
                    class="maternal-patient-result"
                    data-patient-id="${escapeHtml(
                      patient.patient_id ||
                      ''
                    )}"
                  >

                    <strong>
                      ${escapeHtml(
                        patient.name ||
                        'Unnamed Patient'
                      )}
                    </strong>

                    <span>
                      ID:
                      ${escapeHtml(
                        patient.patient_id ||
                        '—'
                      )}
                    </span>

                  </button>
                `
              )
              .join('')
            }

          </div>
        `
      }

      document
        .querySelectorAll(
          '.maternal-patient-result'
        )
        .forEach(
          button => {

            button.addEventListener(
              'click',
              () => {

               const patientId =
  button.dataset.patientId

const selectedPatient =
  patients.find(
    patient =>
      String(patient.patient_id) ===
      String(patientId)
  )

const gender =
  String(
    selectedPatient?.gender || ''
  )
    .trim()
    .toLowerCase()

if (
  !['female', 'f'].includes(gender)
) {
  resultsBox.innerHTML = `
    <div class="maternal-search-message error">
      Maternal & Child Care is available only
      for patients with recorded gender as Female.
    </div>
  `
  return
}

if (patientId) {
  loadMaternalPatient(
    patientId
  )
}

              }
            )

          }
        )

    } catch (error) {

      console.error(
        'Maternal patient search:',
        error
      )

      if (resultsBox) {
        resultsBox.innerHTML = `
          <div class="maternal-search-message error">
            Unable to search patients right now.
          </div>
        `
      }

    }
  }

  async function loadMaternalPatient(
    patientId
  ) {

    const selectedPatient =
  patients.find(
    patient =>
      String(patient.patient_id) ===
      String(patientId)
  )

const patientGender =
  String(
    selectedPatient?.gender || ''
  )
    .trim()
    .toLowerCase()

if (
  !['female', 'f'].includes(
    patientGender
  )
) {
  if (resultsBox) {
    resultsBox.innerHTML = `
      <div class="maternal-search-message error">
        Maternal & Child Care is available only
        for patients with recorded gender as Female.
      </div>
    `
  }

  return
}

    const content =
      document.querySelector(
        '#maternalCareContent'
      )

    if (!content) {
      return
    }

    if (resultsBox) {
      resultsBox.innerHTML = ''
    }

    content.innerHTML = `
      <div class="maternal-care-loading">
        Loading maternal & child records...
      </div>
    `

    try {

      const pregnancyResult =
        await apiRequest(
          `/maternal/patients/${encodeURIComponent(
            patientId
          )}/pregnancies?actor_id=${encodeURIComponent(
            getCurrentActorId()
          )}`
        )

      const childResult =
        await apiRequest(
          `/maternal/patients/${encodeURIComponent(
            patientId
          )}/children?actor_id=${encodeURIComponent(
            getCurrentActorId()
          )}`
        )

      const pregnancies =
        pregnancyResult?.pregnancies ||
        []

      const children =
        childResult?.children ||
        []

      const activePregnancy =
        pregnancies.find(
          pregnancy =>
            pregnancy.status === 'Active'
        ) ||
        pregnancies[0] ||
        null

let ancMilestones = []

if (activePregnancy?.id) {
  const ancResult =
    await apiRequest(
      `/maternal/pregnancies/${encodeURIComponent(
        activePregnancy.id
      )}/anc?actor_id=${encodeURIComponent(
        getCurrentActorId()
      )}`
    )

  ancMilestones =
    ancResult?.visits ||
    ancResult?.anc_visits ||
    []
}

const [
  homeResult,
  maternalVaccineResult,
  labResult,
  deliveryResult,
  postnatalResult,
  familyResult,
  schemeResult,
  childHealthResults,
  childVaccineResults
] = await Promise.all([
  activePregnancy?.id
    ? apiRequest(
        `/maternal/pregnancies/${encodeURIComponent(
          activePregnancy.id
        )}/asha-home-visits?actor_id=${encodeURIComponent(
          getCurrentActorId()
        )}`
      ).catch(() => null)
    : null,

  activePregnancy?.id
    ? apiRequest(
        `/maternal/pregnancies/${encodeURIComponent(
          activePregnancy.id
        )}/vaccinations?actor_id=${encodeURIComponent(
          getCurrentActorId()
        )}`
      ).catch(() => null)
    : null,

  activePregnancy?.id
    ? apiRequest(
        `/maternal/pregnancies/${encodeURIComponent(
          activePregnancy.id
        )}/labs?actor_id=${encodeURIComponent(
          getCurrentActorId()
        )}`
      ).catch(() => null)
    : null,

  activePregnancy?.id
    ? apiRequest(
        `/maternal/pregnancies/${encodeURIComponent(
          activePregnancy.id
        )}/delivery?actor_id=${encodeURIComponent(
          getCurrentActorId()
        )}`
      ).catch(() => null)
    : null,

  activePregnancy?.id
    ? apiRequest(
        `/maternal/pregnancies/${encodeURIComponent(
          activePregnancy.id
        )}/postnatal?actor_id=${encodeURIComponent(
          getCurrentActorId()
        )}`
      ).catch(() => null)
    : null,

  apiRequest(
    `/maternal/patients/${encodeURIComponent(
      patientId
    )}/family-planning?actor_id=${encodeURIComponent(
      getCurrentActorId()
    )}`
  ).catch(() => null),

  apiRequest(
    `/maternal/patients/${encodeURIComponent(
      patientId
    )}/schemes?actor_id=${encodeURIComponent(
      getCurrentActorId()
    )}`
  ).catch(() => null),

  Promise.all(
    children.map(
      child =>
        apiRequest(
          `/maternal/children/${encodeURIComponent(
            child.child_id
          )}/health-visits?actor_id=${encodeURIComponent(
            getCurrentActorId()
          )}`
        ).catch(() => null)
    )
  ),

  Promise.all(
    children.map(
      child =>
        apiRequest(
          `/maternal/children/${encodeURIComponent(
            child.child_id
          )}/immunizations?actor_id=${encodeURIComponent(
            getCurrentActorId()
          )}`
        ).catch(() => null)
    )
  )
])

const careData = {
  homeSummary:
    homeResult?.summary || {
      total: 0,
      completed: 0,
      scheduled: 0,
      missed: 0
    },

  maternalVaccineSummary:
    maternalVaccineResult?.summary || {
      total: 0,
      completed: 0,
      pending: 0,
      missed: 0
    },

  labs:
    labResult?.labs || [],

  delivery:
    deliveryResult?.delivery || null,

  postnatalVisits:
    postnatalResult?.visits || [],

  postnatalSummary:
    postnatalResult?.summary || {},

  familyRecords:
    familyResult?.records || [],

  schemeSummary:
    schemeResult?.summary || {
      total: 0,
      eligible: 0,
      applied: 0,
      approved: 0,
      benefit_received: 0,
      needs_action: 0
    },

  childHealthResults:
    Array.isArray(childHealthResults)
      ? childHealthResults
      : [],

  childVaccineResults:
    Array.isArray(childVaccineResults)
      ? childVaccineResults
      : []
}


     content.innerHTML =
  renderMaternalPatientOverview(
    patientId,
    activePregnancy,
    pregnancies,
    children,
    ancMilestones,
    careData
  )

      wireMaternalPatientActions(
        patientId
      )

    } catch (error) {

      console.error(
        'Maternal patient loading:',
        error
      )

      content.innerHTML = `
        <div class="maternal-care-empty">

          <div class="maternal-care-empty-icon">
            ⚠️
          </div>

          <h3>
            Unable to load records
          </h3>

          <p>
            ${escapeHtml(
              error?.message ||
              'Please try again.'
            )}
          </p>

        </div>
      `

    }
  }

function renderMaternalJourneyGraphic(
  pregnancy,
  ancMilestones = [],
  children = []
) {
  const ancList =
    Array.isArray(ancMilestones)
      ? ancMilestones
      : []

 const completedANC =
  Math.min(
    ancList.filter(
      item => item.status === 'Completed'
    ).length,
    4
  )

  const hasPregnancy =
    Boolean(pregnancy)

  const hasChildren =
    Array.isArray(children) &&
    children.length > 0

  const steps = [
    {
      label: 'Pregnancy',
      icon: '🤰',
      state: hasPregnancy
        ? 'is-complete'
        : 'is-due'
    },
    {
      label: 'ANC 1',
      icon: '1',
      state:
        completedANC >= 1
          ? 'is-complete'
          : hasPregnancy
          ? 'is-due'
          : 'is-upcoming'
    },
    {
      label: 'ANC 2',
      icon: '2',
      state:
        completedANC >= 2
          ? 'is-complete'
          : completedANC === 1
          ? 'is-due'
          : 'is-upcoming'
    },
    {
      label: 'ANC 3',
      icon: '3',
      state:
        completedANC >= 3
          ? 'is-complete'
          : completedANC === 2
          ? 'is-due'
          : 'is-upcoming'
    },
    {
      label: 'ANC 4',
      icon: '4',
      state:
        completedANC >= 4
          ? 'is-complete'
          : completedANC === 3
          ? 'is-due'
          : 'is-upcoming'
    },
    {
      label: 'Delivery',
      icon: '🏥',
      state: 'is-upcoming'
    },
    {
      label: 'Postnatal',
      icon: '❤️',
      state: 'is-upcoming'
    },
    {
      label: 'Child 0–6',
      icon: '👶',
      state: hasChildren
        ? 'is-complete'
        : 'is-upcoming'
    }
  ]

  const progress =
    hasPregnancy
      ? Math.round(
          ((1 + completedANC) / 5) * 100
        )
      : 0

  return `
    <section class="maternal-journey-graphic">

      <div class="maternal-graphic-header">

        <div>
          <div class="dashboard-kicker">
            CARE PATHWAY
          </div>

          <h3>
            MATERNAL CARE JOURNEY
          </h3>

          <p>
            Pregnancy → ANC → Delivery →
            Postnatal → Child 0–6
          </p>
        </div>

        <div class="maternal-graphic-stats">

          <div>
            <strong>
              ${hasPregnancy ? 'Active' : '—'}
            </strong>
            <span>Pregnancy</span>
          </div>

          <div>
            <strong>
              ${completedANC}/4
            </strong>
            <span>ANC Completed</span>
          </div>

          <div>
            <strong>
              ${hasChildren ? children.length : 0}
            </strong>
            <span>Children</span>
          </div>

        </div>

      </div>

      <div class="maternal-progress-bar">

        <div
          class="maternal-progress-fill"
          style="width: ${progress}%"
        ></div>

      </div>

      <div class="maternal-stepper">

        ${steps
          .map(
            (step, index) => `
              <div class="maternal-step ${step.state}">

                <div class="maternal-step-icon">
                  ${step.icon}
                </div>

                <strong>
                  ${step.label}
                </strong>

              </div>

              ${
                index < steps.length - 1
                  ? `
                    <div class="maternal-step-connector"></div>
                  `
                  : ''
              }
            `
          )
          .join('')}

      </div>

      <div class="maternal-anc-cards">

        ${[
          ['ANC 1', '<12 weeks'],
          ['ANC 2', '14–26 weeks'],
          ['ANC 3', '28–34 weeks'],
          ['ANC 4', '36 weeks–delivery']
        ]
          .map(
            ([title, window], index) => {
              const complete =
                completedANC >= index + 1

              const due =
                !complete &&
                completedANC === index

              const state =
                complete
                  ? 'is-complete'
                  : due
                  ? 'is-due'
                  : 'is-upcoming'

              return `
                <div
                  class="maternal-anc-card ${state}"
                >

                  <div>
                    <strong>
                      ${title}
                    </strong>

                    <span>
                      ${window}
                    </span>
                  </div>

                  <b>
                    ${
                      complete
                        ? '✓'
                        : due
                        ? 'DUE'
                        : '○'
                    }
                  </b>

                </div>
              `
            }
          )
          .join('')}

      </div>

    </section>
  `
}

function renderMaternalVisualDashboard(
  pregnancy,
  ancMilestones = [],
  children = [],
  careData = {}
) {
  const ancList =
    Array.isArray(ancMilestones)
      ? ancMilestones
      : []

  const homeSummary =
    careData.homeSummary || {}

  const vaccineSummary =
    careData.maternalVaccineSummary || {}

  const labs =
    Array.isArray(careData.labs)
      ? careData.labs
      : []

  const postnatalVisits =
    Array.isArray(careData.postnatalVisits)
      ? careData.postnatalVisits
      : []

  const familyRecords =
    Array.isArray(careData.familyRecords)
      ? careData.familyRecords
      : []

  const schemeSummary =
    careData.schemeSummary || {}

  const childHealthResults =
    Array.isArray(careData.childHealthResults)
      ? careData.childHealthResults
      : []

  const childVaccineResults =
    Array.isArray(careData.childVaccineResults)
      ? careData.childVaccineResults
      : []

  const completedANC =
    ancList.filter(
      item => item.status === 'Completed'
    ).length

  const completedHome =
    Number(homeSummary.completed || 0)

  const missedHome =
    Number(homeSummary.missed || 0)

  const completedMaternalVaccines =
    Number(vaccineSummary.completed || 0)

  const maternalVaccinesTotal =
    Number(vaccineSummary.total || 0)

  const completedPostnatal =
    Number(
      careData.postnatalSummary?.completed ||
      postnatalVisits.length ||
      0
    )

  const deliveryRecorded =
    Boolean(careData.delivery)

  const childrenCount =
    children.length

  const childHealthVisits =
    childHealthResults.flatMap(
      result =>
        Array.isArray(result?.visits)
          ? result.visits
          : []
    )

  const childVaccineSummaries =
    childVaccineResults.map(
      result =>
        result?.summary || {}
    )

  const childVaccinesTotal =
    childVaccineSummaries.reduce(
      (total, summary) =>
        total +
        Number(summary.total || 0),
      0
    )

  const childVaccinesCompleted =
    childVaccineSummaries.reduce(
      (total, summary) =>
        total +
        Number(summary.completed || 0),
      0
    )

  const referralAlerts = []

  if (
    pregnancy?.risk_status &&
    pregnancy.risk_status !== 'Low Risk'
  ) {
    referralAlerts.push(
      `Pregnancy risk: ${pregnancy.risk_status}`
    )
  }

  ancList.forEach(
    milestone => {
      if (milestone.visit?.high_risk) {
        referralAlerts.push(
          `ANC ${milestone.visit_number}: high-risk flag`
        )
      }

      if (milestone.visit?.referral_required) {
        referralAlerts.push(
          `ANC ${milestone.visit_number}: referral required`
        )
      }
    }
  )

  if (missedHome > 0) {
    referralAlerts.push(
      `${missedHome} ASHA home visit(s) marked missed`
    )
  }

  if (
    careData.delivery?.referral_required
  ) {
    referralAlerts.push(
      'Delivery record requires referral'
    )
  }

  if (
    careData.delivery?.complications
  ) {
    referralAlerts.push(
      'Delivery complications recorded'
    )
  }

  childHealthVisits.forEach(
    visit => {
      if (visit.referral_required) {
        referralAlerts.push(
          'Child health visit has referral flag'
        )
      }
    }
  )

  const weightPoints =
    ancList
      .filter(
        item =>
          item.visit?.weight !== undefined &&
          item.visit?.weight !== null &&
          item.visit?.weight !== ''
      )
      .map(
        item => ({
          date:
            item.visit.visit_date ||
            `ANC ${item.visit_number}`,
          value:
            Number(item.visit.weight)
        })
      )
      .filter(
        point =>
          Number.isFinite(point.value)
      )

  const haemoglobinPoints =
    ancList
      .filter(
        item =>
          item.visit?.haemoglobin !== undefined &&
          item.visit?.haemoglobin !== null &&
          item.visit?.haemoglobin !== ''
      )
      .map(
        item => ({
          date:
            item.visit.visit_date ||
            `ANC ${item.visit_number}`,
          value:
            Number(item.visit.haemoglobin)
        })
      )
      .filter(
        point =>
          Number.isFinite(point.value)
      )

  const renderMiniTrend = (
    title,
    unit,
    points
  ) => {
    if (!points.length) {
      return `
        <div class="maternal-trend-card is-empty">
          <div class="maternal-trend-title">
            <strong>${title}</strong>
            <span>No recorded data</span>
          </div>

          <div class="maternal-trend-empty">
            Data will appear after measurements are recorded.
          </div>
        </div>
      `
    }

    const values =
      points.map(point => point.value)

    const min =
      Math.min(...values)

    const max =
      Math.max(...values)

    const range =
      max - min || 1

    const width = 320
    const height = 100
    const padding = 12

    const step =
      points.length === 1
        ? 0
        : (width - padding * 2) /
          (points.length - 1)

    const svgPoints =
      points
        .map(
          (point, index) => {
            const x =
              padding +
              step * index

            const y =
              height -
              padding -
              (
                (
                  point.value - min
                ) / range
              ) *
              (height - padding * 2)

            return `${x},${y}`
          }
        )
        .join(' ')

    return `
      <div class="maternal-trend-card">

        <div class="maternal-trend-title">
          <strong>${title}</strong>
          <span>${unit}</span>
        </div>

        <div class="maternal-trend-chart">

          <svg
            viewBox="0 0 ${width} ${height}"
            preserveAspectRatio="none"
          >

            <polyline
              points="${svgPoints}"
              fill="none"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            ${
              points
                .map(
                  (point, index) => {
                    const x =
                      padding +
                      step * index

                    const y =
                      height -
                      padding -
                      (
                        (
                          point.value - min
                        ) / range
                      ) *
                      (height - padding * 2)

                    return `
                      <circle
                        cx="${x}"
                        cy="${y}"
                        r="4"
                        fill="currentColor"
                      />
                    `
                  }
                )
                .join('')
            }

          </svg>

        </div>

        <div class="maternal-trend-labels">

          <span>
            ${escapeHtml(
              String(points[0].date)
            )}
          </span>

          <strong>
            ${escapeHtml(
              String(
                points[points.length - 1].value
              )
            )}
          </strong>

          <span>
            ${escapeHtml(
              String(
                points[points.length - 1].date
              )
            )}
          </span>

        </div>

      </div>
    `
  }

  const recordCoverageItems = [
    {
      label: 'Pregnancy',
      complete: Boolean(pregnancy)
    },
    {
      label: 'ANC',
      complete: completedANC === 4
    },
    {
      label: 'ASHA',
      complete: completedHome > 0
    },
    {
      label: 'Vaccines',
      complete:
        maternalVaccinesTotal > 0 &&
        completedMaternalVaccines ===
          maternalVaccinesTotal
    },
    {
      label: 'Delivery',
      complete: deliveryRecorded
    },
    {
      label: 'Postnatal',
      complete: completedPostnatal > 0
    },
    {
      label: 'Children',
      complete: childrenCount > 0
    },
    {
      label: 'Child Vaccines',
      complete:
        childVaccinesTotal > 0 &&
        childVaccinesCompleted ===
          childVaccinesTotal
    }
  ]

  const coverageCompleted =
    recordCoverageItems.filter(
      item => item.complete
    ).length

  const coveragePercent =
    Math.round(
      (
        coverageCompleted /
        recordCoverageItems.length
      ) * 100
    )

    const childVisualCards =
  children.map(
    (child, index) => {

      const healthResult =
        childHealthResults[index] || {}

      const vaccineResult =
        childVaccineResults[index] || {}

      const healthVisits =
        Array.isArray(
          healthResult?.visits
        )
          ? healthResult.visits
          : []

      const vaccineSummary =
        vaccineResult?.summary || {}

      const vaccineTotal =
        Number(
          vaccineSummary.total || 0
        )

      const vaccineCompleted =
        Number(
          vaccineSummary.completed || 0
        )

      const vaccinePercent =
        vaccineTotal > 0
          ? Math.round(
              (
                vaccineCompleted /
                vaccineTotal
              ) * 100
            )
          : 0

      const weightPoints =
        healthVisits
          .slice()
          .reverse()
          .filter(
            visit =>
              visit.weight !== undefined &&
              visit.weight !== null &&
              visit.weight !== ''
          )
          .map(
            visit => Number(visit.weight)
          )
          .filter(
            value =>
              Number.isFinite(value)
          )

      const latestVisit =
        healthVisits[0] || {}

      return {
        child,
        healthVisits,
        latestVisit,
        vaccineTotal,
        vaccineCompleted,
        vaccinePercent,
        weightPoints
      }
    }
  )

  return `
   <section
  class="maternal-visual-dashboard"
  style="--maternal-coverage: ${coveragePercent}"
>

      <div class="maternal-dashboard-heading">

        <div>
          <div class="dashboard-kicker">
            CARE OVERVIEW
          </div>

          <h3>
            Mother & Child Health Dashboard
          </h3>

          <p>
            A visual summary of recorded maternal
            and child care information.
          </p>
        </div>

        <div class="maternal-coverage-ring">
          <div>
            <strong>${coveragePercent}%</strong>
            <span>Record coverage</span>
          </div>
        </div>

      </div>


      <div class="maternal-visual-stat-grid">

        <div class="maternal-visual-stat">
          <span>ANC</span>
          <strong>${completedANC}/4</strong>
          <small>Milestones</small>
        </div>

        <div class="maternal-visual-stat">
          <span>ASHA Visits</span>
          <strong>${completedHome}</strong>
          <small>Completed</small>
        </div>

        <div class="maternal-visual-stat">
          <span>Vaccines</span>
          <strong>
            ${completedMaternalVaccines}/${maternalVaccinesTotal}
          </strong>
          <small>Maternal</small>
        </div>

        <div class="maternal-visual-stat">
          <span>Children</span>
          <strong>${childrenCount}</strong>
          <small>0–6 years</small>
        </div>

        <div class="maternal-visual-stat">
          <span>Labs</span>
          <strong>${labs.length}</strong>
          <small>Reports</small>
        </div>

        <div class="maternal-visual-stat">
          <span>Postnatal</span>
          <strong>${completedPostnatal}</strong>
          <small>Visits</small>
        </div>

      </div>


      <div class="maternal-care-status-board">

        <div class="maternal-care-status-main">

          <div class="maternal-status-board-title">
            Care pathway
          </div>

          <div class="maternal-status-path">

            ${recordCoverageItems
              .map(
                item => `
                  <div
                    class="
                      maternal-status-node
                      ${
                        item.complete
                          ? 'is-complete'
                          : 'is-pending'
                      }
                    "
                  >
                    <span>
                      ${
                        item.complete
                          ? '✓'
                          : '○'
                      }
                    </span>

                    <strong>
                      ${item.label}
                    </strong>
                  </div>
                `
              )
              .join('')}

          </div>

        </div>


        <div
          class="
            maternal-risk-board
            ${
              referralAlerts.length
                ? 'has-alerts'
                : ''
            }
          "
        >

          <div class="maternal-status-board-title">
            Risk & alerts
          </div>

          ${
            referralAlerts.length
              ? `
                <div class="maternal-alert-list">
                  ${referralAlerts
                    .slice(0, 5)
                    .map(
                      alert => `
                        <div class="maternal-alert-item">
                          <span>!</span>
                          <strong>
                            ${escapeHtml(alert)}
                          </strong>
                        </div>
                      `
                    )
                    .join('')}
                </div>
              `
              : `
                <div class="maternal-alert-clear">
                  ✓ No recorded alerts in the loaded records
                </div>
              `
          }

        </div>

      </div>


      <div class="maternal-trend-grid">

        ${renderMiniTrend(
          'Weight trend',
          'Recorded weight',
          weightPoints
        )}

        ${renderMiniTrend(
          'Haemoglobin trend',
          'Recorded Hb',
          haemoglobinPoints
        )}

      </div>


      <div class="maternal-secondary-visual-grid">

        <div class="maternal-secondary-card">

          <div class="maternal-secondary-icon">
            🏠
          </div>

          <div>
            <span>ASHA home visits</span>

            <strong>
              ${completedHome} completed
            </strong>

            <small>
              ${missedHome} missed ·
              ${Number(
                homeSummary.scheduled || 0
              )} scheduled
            </small>
          </div>

        </div>


        <div class="maternal-secondary-card">

          <div class="maternal-secondary-icon">
            💉
          </div>

          <div>
            <span>Immunization</span>

            <strong>
              ${completedMaternalVaccines}
              /${maternalVaccinesTotal}
            </strong>

            <small>
              ${Number(
                vaccineSummary.pending || 0
              )} pending ·
              ${Number(
                vaccineSummary.missed || 0
              )} missed
            </small>
          </div>

        </div>


        <div class="maternal-secondary-card">

          <div class="maternal-secondary-icon">
            🏥
          </div>

          <div>
            <span>Delivery</span>

            <strong>
              ${
                deliveryRecorded
                  ? 'Recorded'
                  : 'Not recorded'
              }
            </strong>

            <small>
              ${
                careData.delivery?.delivery_date
                  ? escapeHtml(
                      careData.delivery.delivery_date
                    )
                  : 'Awaiting record'
              }
            </small>
          </div>

        </div>


        <div class="maternal-secondary-card">

          <div class="maternal-secondary-icon">
            👶
          </div>

          <div>
            <span>Children 0–6</span>

            <strong>
              ${childrenCount} linked
            </strong>

            <small>
              ${
                childHealthVisits.length
              } health visits recorded
            </small>
          </div>

        </div>


        <div class="maternal-secondary-card">

          <div class="maternal-secondary-icon">
            📋
          </div>

          <div>
            <span>Family planning</span>

            <strong>
              ${familyRecords.length}
              record(s)
            </strong>

            <small>
              ${
                familyRecords.filter(
                  item =>
                    item.status ===
                    'Follow-up Due'
                ).length
              } follow-up due
            </small>
          </div>

        </div>


        <div class="maternal-secondary-card">

          <div class="maternal-secondary-icon">
            🏛️
          </div>

          <div>
            <span>Government schemes</span>

            <strong>
              ${Number(
                schemeSummary.approved || 0
              )} approved
            </strong>

            <small>
              ${Number(
                schemeSummary.needs_action || 0
              )} needs action
            </small>
          </div>

        </div>

      </div>

<div class="maternal-child-visual-section">

  <div class="maternal-child-visual-heading">

    <div>
      <div class="dashboard-kicker">
        CHILD HEALTH · 0–6 YEARS
      </div>

      <h4>
        Growth & Vaccination Overview
      </h4>

      <p>
        Visual snapshot of each linked child's
        recorded health and immunization data.
      </p>
    </div>

  </div>

  ${
    childVisualCards.length
      ? `
        <div class="maternal-child-visual-grid">

          ${childVisualCards
            .map(
              item => `
                <div class="maternal-child-visual-card">

                  <div class="maternal-child-visual-top">

                    <div class="maternal-child-avatar">
                      👶
                    </div>

                    <div>
                      <strong>
                        ${escapeHtml(
                          item.child.name ||
                          'Child'
                        )}
                      </strong>

                      <span>
                        ${
                          item.latestVisit
                            ?.visit_date ||
                          'No health visit recorded'
                        }
                      </span>
                    </div>

                  </div>


                  <div class="maternal-child-metrics">

                    <div>
                      <span>Weight</span>
                      <strong>
                        ${
                          item.latestVisit
                            ?.weight ||
                          '—'
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Height</span>
                      <strong>
                        ${
                          item.latestVisit
                            ?.height ||
                          '—'
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Health Visits</span>
                      <strong>
                        ${item.healthVisits.length}
                      </strong>
                    </div>

                  </div>


                  <div class="maternal-child-vaccine-progress">

                    <div class="maternal-child-progress-label">

                      <span>
                        Vaccination
                      </span>

                      <strong>
                        ${item.vaccineCompleted}/${item.vaccineTotal}
                      </strong>

                    </div>

                    <div class="maternal-child-progress-track">

                      <div
                        class="maternal-child-progress-fill"
                        style="width: ${item.vaccinePercent}%"
                      ></div>

                    </div>

                    <small>
                      ${item.vaccinePercent}% recorded
                    </small>

                  </div>


                  <div class="maternal-child-growth-badge">

                    <span>
                      Growth records
                    </span>

                    <strong>
                      ${
                        item.weightPoints.length
                      }
                    </strong>

                  </div>

                </div>
              `
            )
            .join('')}

        </div>
      `
      : `
        <div class="maternal-child-visual-empty">
          No children are linked to this maternal record yet.
        </div>
      `
  }

</div>


    </section>
  `
}


function renderMaternalPatientOverview(
  patientId,
  activePregnancy,
  pregnancies,
  children,
  ancMilestones = [],
  careData = {}
) {


    const pregnancy =
      activePregnancy
const completedANC = pregnancy
  ? ancMilestones.filter(
      item => item.status === 'Completed'
    ).length
  : '—'

    const pregnancyNumber =
      pregnancy?.pregnancy_number ||
      '—'

    const riskStatus =
      pregnancy?.risk_status ||
      'Not registered'

    const ashaName =
      pregnancy?.assigned_asha_name ||
      'Not assigned'

    return `

      <div class="maternal-patient-overview">

        <div class="maternal-patient-hero">

          <div>

            <div class="dashboard-kicker">
              MATERNAL & CHILD CARE
            </div>

            <h3>
              Complete Care Journey
            </h3>

            <p>
              Patient:
              <strong>
                ${escapeHtml(patientId)}
              </strong>
            </p>

          </div>

          <div class="maternal-hero-actions">

<button
  type="button"
  class="secondary-action"
  id="maternalBackToSearchBtn"
>
  ← Back to Patient Search
</button>

            <button
              type="button"
              class="secondary-action"
              id="maternalAddPregnancyBtn"
            >
              + Record Pregnancy
            </button>

          </div>

        </div>
 
        ${renderMaternalJourneyGraphic(
          pregnancy,
          ancMilestones,
          children
        )}


        ${renderMaternalVisualDashboard(
  pregnancy,
  ancMilestones,
  children,
  careData
)}


        ${
          pregnancy
            ? `
              <div class="maternal-summary-grid">

                <div class="maternal-summary-card">
                  <span>Pregnancy</span>
                  <strong>
                    #${escapeHtml(
                      String(pregnancyNumber)
                    )}
                  </strong>
                </div>

                <div class="maternal-summary-card">
                  <span>EDD</span>
                  <strong>
                    ${escapeHtml(
                      pregnancy.edd_date ||
                      'Not recorded'
                    )}
                  </strong>
                </div>

                <div class="maternal-summary-card">
                  <span>ANC</span>
                  <strong>
                    ${completedANC} / 4
                  </strong>
                </div>

                <div class="maternal-summary-card">
                  <span>Assigned ASHA</span>
                  <strong>
                    ${escapeHtml(
                      ashaName
                    )}
                  </strong>
                </div>

                <div class="maternal-summary-card">
                  <span>Risk</span>
                  <strong>
                    ${escapeHtml(
                      riskStatus
                    )}
                  </strong>
                </div>

              </div>
            `
            : `
              <div class="maternal-care-empty">
                <div class="maternal-care-empty-icon">
                  👩‍🍼
                </div>

                <h3>
                  No pregnancy currently registered
                </h3>

                <p>
                  An authorized ASHA worker or doctor
                  can register a pregnancy.
                </p>

                <button
                  type="button"
                  class="primary-action"
                  id="maternalAddPregnancyBtn"
                >
                  + Record Pregnancy
                </button>
              </div>
            `
        }

        <div class="maternal-care-tabs">

          <button
            type="button"
            class="maternal-care-tab active"
            data-maternal-tab="overview"
          >
            Overview
          </button>

          <button
            type="button"
            class="maternal-care-tab"
            data-maternal-tab="anc"
          >
            ANC Visits
          </button>

          <button
            type="button"
            class="maternal-care-tab"
            data-maternal-tab="home"
          >
            ASHA Home Visits
          </button>

          <button
            type="button"
            class="maternal-care-tab"
            data-maternal-tab="vaccines"
          >
            Vaccinations
          </button>

          <button
            type="button"
            class="maternal-care-tab"
            data-maternal-tab="labs"
          >
            Lab Reports
          </button>

          <button
            type="button"
            class="maternal-care-tab"
            data-maternal-tab="delivery"
          >
            Delivery
          </button>

          <button
            type="button"
            class="maternal-care-tab"
            data-maternal-tab="postnatal"
          >
            Postnatal
          </button>

          <button
            type="button"
            class="maternal-care-tab"
            data-maternal-tab="children"
          >
            Children 0–6
          </button>

          <button
            type="button"
            class="maternal-care-tab"
            data-maternal-tab="family"
          >
            Family Planning
          </button>

          <button
            type="button"
            class="maternal-care-tab"
            data-maternal-tab="schemes"
          >
            Schemes
          </button>

        </div>

        <div
          id="maternalTabContent"
          class="maternal-tab-content"
        >

          <div class="maternal-timeline">

            <div class="maternal-timeline-title">
              Mother → Baby Care Journey
            </div>

            <div class="maternal-journey">

              <div class="journey-step completed">
                <span>✓</span>
                <strong>Pregnancy</strong>
              </div>

              <div class="journey-line"></div>

              <div class="journey-step">
                <span>2/4</span>
                <strong>ANC</strong>
              </div>

              <div class="journey-line"></div>

              <div class="journey-step">
                <span>→</span>
                <strong>ASHA Visits</strong>
              </div>

              <div class="journey-line"></div>

              <div class="journey-step">
                <span>○</span>
                <strong>Delivery</strong>
              </div>

              <div class="journey-line"></div>

              <div class="journey-step">
                <span>○</span>
                <strong>Postnatal</strong>
              </div>

              <div class="journey-line"></div>

              <div class="journey-step">
                <span>👶</span>
                <strong>Children 0–6</strong>
              </div>

            </div>

          </div>

          <div class="maternal-section-grid">

            <div class="maternal-section-card">
              <div class="maternal-card-icon">
                🩺
              </div>

              <h4>
                ANC Tracking
              </h4>

              <p>
                Four antenatal care milestones,
                clinical observations and referrals.
              </p>

              <button
                type="button"
                class="secondary-action maternal-tab-jump"
                data-jump-tab="anc"
              >
                Open ANC
              </button>
            </div>

            <div class="maternal-section-card">
              <div class="maternal-card-icon">
                🏠
              </div>

              <h4>
                ASHA Home Visits
              </h4>

              <p>
                Schedule, complete and monitor
                maternal home visits.
              </p>

              <button
                type="button"
                class="secondary-action maternal-tab-jump"
                data-jump-tab="home"
              >
                Open Visits
              </button>
            </div>

            <div class="maternal-section-card">
              <div class="maternal-card-icon">
                💉
              </div>

              <h4>
                Vaccinations
              </h4>

              <p>
                Maternal vaccination and
                child immunization timelines.
              </p>

              <button
                type="button"
                class="secondary-action maternal-tab-jump"
                data-jump-tab="vaccines"
              >
                Open Vaccines
              </button>
            </div>

            <div class="maternal-section-card">
              <div class="maternal-card-icon">
                👶
              </div>

              <h4>
                Children 0–6
              </h4>

              <p>
                Multiple children, growth,
                health visits and vaccines.
              </p>

              <button
                type="button"
                class="secondary-action maternal-tab-jump"
                data-jump-tab="children"
              >
                Open Children
              </button>
            </div>

          </div>

          <div class="maternal-pregnancy-history">

            <div class="maternal-section-title">
              Pregnancy History
            </div>

            ${
              pregnancies.length
                ? pregnancies
                    .map(
                      item => `
                        <div class="maternal-history-row">

                          <strong>
                            Pregnancy #${escapeHtml(
                              String(
                                item.pregnancy_number
                              )
                            )}
                          </strong>

                          <span>
                            ${escapeHtml(
                              item.status ||
                              'Unknown'
                            )}
                          </span>

                          <span>
                            EDD:
                            ${escapeHtml(
                              item.edd_date ||
                              'Not recorded'
                            )}
                          </span>

                          <span>
                            ASHA:
                            ${escapeHtml(
                              item.assigned_asha_name ||
                              'Not assigned'
                            )}
                          </span>

                        </div>
                      `
                    )
                    .join('')
                : `
                  <div class="maternal-search-message">
                    No pregnancy history recorded.
                  </div>
                `
            }

          </div>

          <div class="maternal-children-preview">

            <div class="maternal-section-title">
              Children
            </div>

            ${
              children.length
                ? children
                    .map(
                      child => `
                        <div class="maternal-history-row">

                          <strong>
                            ${escapeHtml(
                              child.name ||
                              'Child'
                            )}
                          </strong>

                          <span>
                            DOB:
                            ${escapeHtml(
                              child.date_of_birth ||
                              'Not recorded'
                            )}
                          </span>

                          <span>
                            Pregnancy #${escapeHtml(
                              String(
                                child.pregnancy_number ||
                                '—'
                              )
                            )}
                          </span>

                        </div>
                      `
                    )
                    .join('')
                : `
                  <div class="maternal-search-message">
                    No children registered yet.
                  </div>
                `
            }

          </div>

        </div>

      </div>
    `
  }

  async function loadMaternalCareTab(
    patientId,
    tab
  ) {

    const target =
      document.querySelector(
        '#maternalTabContent'
      )

    if (!target) {
      return
    }

    if (tab === 'overview') {
      return
    }

    target.innerHTML = `
      <div class="maternal-care-loading">
        Loading ${escapeHtml(tab)}...
      </div>
    `

    try {

      const pregnancyResult =
        await apiRequest(
          `/maternal/patients/${encodeURIComponent(
            patientId
          )}/pregnancies?actor_id=${encodeURIComponent(
            getCurrentActorId()
          )}`
        )

      const pregnancies =
        pregnancyResult?.pregnancies ||
        []

      const pregnancy =
        pregnancies.find(
          item =>
            item.status === 'Active'
        ) ||
        pregnancies[0] ||
        null

      if (!pregnancy) {

        target.innerHTML = `
          <div class="maternal-care-empty">

            <div class="maternal-care-empty-icon">
              👩‍🍼
            </div>

            <h3>
              No pregnancy record
            </h3>

            <p>
              An authorized ASHA worker or doctor
              must register a pregnancy first.
            </p>

          </div>
        `

        return
      }

      const pregnancyId =
        pregnancy.id

      // =================================================
      // ANC TAB
      // =================================================

      if (tab === 'anc') {

        const result =
          await apiRequest(
            `/maternal/pregnancies/${encodeURIComponent(
              pregnancyId
            )}/anc?actor_id=${encodeURIComponent(
              getCurrentActorId()
            )}`
          )

        const milestones =
          result?.milestones ||
          []

        const summary =
          result?.summary ||
          {
            completed: 0,
            total: 4
          }

        target.innerHTML = `

          <div class="maternal-module-header">

            <div>
              <div class="dashboard-kicker">
                ANTENATAL CARE
              </div>

              <h3>
                ANC Journey
              </h3>

              <p>
                Track all four antenatal care
                milestones for this pregnancy.
              </p>
            </div>

            <button
              type="button"
              class="primary-action"
              id="addANCVisitBtn"
            >
              + Record ANC Visit
            </button>

          </div>


          <div class="maternal-anc-progress">

            <div class="maternal-progress-number">
              ${summary.completed} / ${summary.total}
            </div>

            <div>
              <strong>
                ANC milestones completed
              </strong>

              <span>
                Next due:
                ${
                  milestones.find(
                    item =>
                      item.status !== 'Completed'
                  )?.window ||
                  'All milestones recorded'
                }
              </span>
            </div>

          </div>


          <div class="maternal-anc-timeline">

            ${
              milestones
                .map(
                  milestone => {

                    const completed =
                      milestone.status ===
                      'Completed'

                    const visit =
                      milestone.visit

                    return `
                      <div
                        class="
                          maternal-anc-item
                          ${
                            completed
                              ? 'completed'
                              : 'pending'
                          }
                        "
                      >

                        <div class="maternal-anc-number">
                          ${
                            completed
                              ? '✓'
                              : milestone.visit_number
                          }
                        </div>

                        <div class="maternal-anc-body">

                          <div class="maternal-anc-top">

                            <strong>
                              ANC ${escapeHtml(
                                String(
                                  milestone.visit_number
                                )
                              )}
                            </strong>

                            <span>
                              ${escapeHtml(
                                milestone.window
                              )}
                            </span>

                            <span
                              class="
                                maternal-status-pill
                                ${
                                  completed
                                    ? 'done'
                                    : 'due'
                                }
                              "
                            >
                              ${
                                completed
                                  ? 'Completed'
                                  : 'Due'
                              }
                            </span>

                          </div>

                          ${
                            visit
                              ? `
                                <div class="maternal-anc-details">

                                  <span>
                                    📅
                                    ${escapeHtml(
                                      visit.visit_date ||
                                      'Date not recorded'
                                    )}
                                  </span>

                                  ${
                                    visit.blood_pressure
                                      ? `
                                        <span>
                                          BP:
                                          ${escapeHtml(
                                            visit.blood_pressure
                                          )}
                                        </span>
                                      `
                                      : ''
                                  }

                                  ${
                                    visit.weight
                                      ? `
                                        <span>
                                          Weight:
                                          ${escapeHtml(
                                            visit.weight
                                          )}
                                        </span>
                                      `
                                      : ''
                                  }

                                  ${
                                    visit.haemoglobin
                                      ? `
                                        <span>
                                          Hb:
                                          ${escapeHtml(
                                            visit.haemoglobin
                                          )}
                                        </span>
                                      `
                                      : ''
                                  }

                                  ${
                                    visit.clinician_name
                                      ? `
                                        <span>
                                          👨‍⚕️
                                          ${escapeHtml(
                                            visit.clinician_name
                                          )}
                                        </span>
                                      `
                                      : ''
                                  }

                                </div>

                                ${
                                  visit.high_risk
                                    ? `
                                      <div class="maternal-warning">
                                        ⚠ High-risk review recorded
                                      </div>
                                    `
                                    : ''
                                }

                                ${
                                  visit.referral_required
                                    ? `
                                      <div class="maternal-warning">
                                        ↗ Referral required
                                      </div>
                                    `
                                    : ''
                                }
                              `
                              : `
                                <div class="maternal-anc-empty">
                                  This milestone has not been recorded yet.
                                </div>
                              `
                          }

                        </div>

                      </div>
                    `
                  }
                )
                .join('')
            }

          </div>


          <div
            id="ancVisitFormContainer"
            class="maternal-form-container"
            hidden
          ></div>

        `

        const addButton =
          document.querySelector(
            '#addANCVisitBtn'
          )

        const formContainer =
          document.querySelector(
            '#ancVisitFormContainer'
          )

        addButton?.addEventListener(
          'click',
          () => {

            if (!formContainer) {
              return
            }

            formContainer.hidden = false

            formContainer.innerHTML = `

              <form
                id="ancVisitForm"
                class="maternal-record-form"
              >

                <div class="maternal-form-title">
                  Record ANC Visit
                </div>

                <div class="maternal-form-grid">

                  <label>
                    ANC Visit
                    <select
                      name="visit_number"
                      required
                    >
                      <option value="1">
                        ANC 1 — &lt; 12 weeks
                      </option>

                      <option value="2">
                        ANC 2 — 14–26 weeks
                      </option>

                      <option value="3">
                        ANC 3 — 28–34 weeks
                      </option>

                      <option value="4">
                        ANC 4 — 36 weeks–delivery
                      </option>
                    </select>
                  </label>

                  <label>
                    Visit Date
                    <input
                      type="date"
                      name="visit_date"
                      required
                    >
                  </label>

                  <label>
                    Blood Pressure
                    <input
                      type="text"
                      name="blood_pressure"
                      placeholder="e.g. 118/76"
                    >
                  </label>

                  <label>
                    Weight
                    <input
                      type="text"
                      name="weight"
                      placeholder="e.g. 54 kg"
                    >
                  </label>

                  <label>
                    Haemoglobin
                    <input
                      type="text"
                      name="haemoglobin"
                      placeholder="e.g. 11.8 g/dL"
                    >
                  </label>

                  <label>
                    Urine Result
                    <input
                      type="text"
                      name="urine_result"
                      placeholder="Optional"
                    >
                  </label>

                  <label>
                    Next Visit Date
                    <input
                      type="date"
                      name="next_visit_date"
                    >
                  </label>

                  <label>
                    Clinician User ID
                    <input
                      type="text"
                      name="clinician_user_id"
                      placeholder="Optional"
                    >
                  </label>

                </div>

                <label>
                  Investigations
                  <textarea
                    name="investigations"
                    rows="2"
                    placeholder="Tests / investigations"
                  ></textarea>
                </label>

                <label>
                  Findings
                  <textarea
                    name="findings"
                    rows="2"
                    placeholder="Clinical findings"
                  ></textarea>
                </label>

                <label>
                  Notes
                  <textarea
                    name="notes"
                    rows="2"
                    placeholder="Additional notes"
                  ></textarea>
                </label>

                <div class="maternal-form-checks">

                  <label>
                    <input
                      type="checkbox"
                      name="high_risk"
                    >
                    High-risk pregnancy review
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      name="referral_required"
                    >
                    Referral required
                  </label>

                </div>

<div
  id="ancVisitFormMessage"
  class="form-message"
  role="alert"
></div>

                <div class="maternal-form-actions">

                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Save ANC Visit
                  </button>

                  <button
                    type="button"
                    class="secondary-action"
                    id="cancelANCVisitBtn"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            `

            document
              .querySelector(
                '#cancelANCVisitBtn'
              )
              ?.addEventListener(
                'click',
                () => {
                  formContainer.hidden = true
                  formContainer.innerHTML = ''
                }
              )

            document
              .querySelector(
                '#ancVisitForm'
              )
              ?.addEventListener(
                'submit',
                async event => {

                  event.preventDefault()

                  const form =
                    event.currentTarget

                  const formData =
                    new FormData(form)

                  const payload = {
                    visit_number: Number(
                      formData.get(
                        'visit_number'
                      )
                    ),

                    visit_date:
                      formData.get(
                        'visit_date'
                      ) || null,

                    clinician_user_id:
                      formData.get(
                        'clinician_user_id'
                      ) || null,

                    blood_pressure:
                      formData.get(
                        'blood_pressure'
                      ) || null,

                    weight:
                      formData.get(
                        'weight'
                      ) || null,

                    haemoglobin:
                      formData.get(
                        'haemoglobin'
                      ) || null,

                    urine_result:
                      formData.get(
                        'urine_result'
                      ) || null,

                    investigations:
                      formData.get(
                        'investigations'
                      ) || null,

                    findings:
                      formData.get(
                        'findings'
                      ) || null,

                    high_risk:
                      formData.get(
                        'high_risk'
                      ) === 'on',

                    referral_required:
                      formData.get(
                        'referral_required'
                      ) === 'on',

                    next_visit_date:
                      formData.get(
                        'next_visit_date'
                      ) || null,

                    notes:
                      formData.get(
                        'notes'
                      ) || null
                  }

                  const saveButton =
                    form.querySelector(
                      'button[type="submit"]'
                    )

                  if (saveButton) {
                    saveButton.disabled = true
                    saveButton.textContent =
                      'Saving...'
                  }

                  try {

                    const saved =
                      await apiRequest(
                        `/maternal/pregnancies/${encodeURIComponent(
                          pregnancyId
                        )}/anc`,
                        {
                          method: 'POST',
                          body:
                            JSON.stringify(
                              payload
                            )
                        }
                      )

                    if (
                      !saved ||
                      !saved.success
                    ) {
                      throw new Error(
                        saved?.message ||
                        'Unable to save ANC visit.'
                      )
                    }

                    await loadMaternalCareTab(
                      patientId,
                      'anc'
                    )

                  } catch (error) {

                    console.error(
                      'Save ANC visit:',
                      error
                    )
const messageBox =
  document.querySelector(
    '#ancVisitFormMessage'
  )

if (messageBox) {
  messageBox.textContent =
    error?.message ||
    'Unable to save ANC visit.'

  messageBox.className =
    'form-message error'
}
                  }

                }
              )

          }
        )

        return
      }



            // =================================================
      // ASHA HOME VISITS
      // =================================================

      if (tab === 'home') {

        const result =
          await apiRequest(
            `/maternal/pregnancies/${encodeURIComponent(
              pregnancyId
            )}/asha-home-visits?actor_id=${encodeURIComponent(
              getCurrentActorId()
            )}`
          )

        const visits =
          result?.visits ||
          []

        const summary =
          result?.summary ||
          {
            total: 0,
            completed: 0,
            scheduled: 0,
            missed: 0
          }

        const assignedAsha =
          pregnancy.assigned_asha_name ||
          'Not assigned'

        target.innerHTML = `

          <div class="maternal-module-header">

            <div>

              <div class="dashboard-kicker">
                ASHA FIELD WORKFLOW
              </div>

              <h3>
                Home Visits
              </h3>

              <p>
                Track scheduled, completed and missed
                visits for the pregnant woman.
              </p>

            </div>

            <button
              type="button"
              class="primary-action"
              id="addAshaHomeVisitBtn"
            >
              + Record Home Visit
            </button>

          </div>


          <div class="asha-visit-summary">

            <div class="asha-summary-card">

              <span>
                Assigned ASHA
              </span>

              <strong>
                ${escapeHtml(
                  assignedAsha
                )}
              </strong>

            </div>

            <div class="asha-summary-card">

              <span>
                Total Visits
              </span>

              <strong>
                ${summary.total}
              </strong>

            </div>

            <div class="asha-summary-card">

              <span>
                Completed
              </span>

              <strong>
                ${summary.completed}
              </strong>

            </div>

            <div class="asha-summary-card">

              <span>
                Due / Scheduled
              </span>

              <strong>
                ${summary.scheduled}
              </strong>

            </div>

            <div class="asha-summary-card">

              <span>
                Missed
              </span>

              <strong>
                ${summary.missed}
              </strong>

            </div>

          </div>


          <div class="asha-home-visit-list">

            ${
              visits.length
                ? visits
                    .map(
                      visit => {

                        const status =
                          String(
                            visit.status ||
                            'Scheduled'
                          )

                        const statusClass =
                          status
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              '-'
                            )

                        return `

                          <div
                            class="
                              asha-home-visit-card
                              ${statusClass}
                            "
                          >

                            <div
                              class="asha-home-visit-date"
                            >

                              <span>
                                ${
                                  status ===
                                  'Completed'
                                    ? '✓'
                                    : status ===
                                      'Missed'
                                      ? '!'
                                      : '○'
                                }
                              </span>

                            </div>

                            <div
                              class="asha-home-visit-main"
                            >

                              <div
                                class="asha-home-visit-top"
                              >

                                <strong>
                                  ${
                                    visit.visit_date ||
                                    visit.scheduled_date ||
                                    'Visit'
                                  }
                                </strong>

                                <span
                                  class="
                                    maternal-status-pill
                                    ${
                                      status ===
                                      'Completed'
                                        ? 'done'
                                        : status ===
                                          'Missed'
                                          ? 'missed'
                                          : 'due'
                                    }
                                  "
                                >
                                  ${escapeHtml(
                                    status
                                  )}
                                </span>

                              </div>

                              ${
                                visit.purpose
                                  ? `
                                    <p>
                                      <strong>
                                        Purpose:
                                      </strong>
                                      ${escapeHtml(
                                        visit.purpose
                                      )}
                                    </p>
                                  `
                                  : ''
                              }

                              ${
                                visit.observations
                                  ? `
                                    <p>
                                      <strong>
                                        Observations:
                                      </strong>
                                      ${escapeHtml(
                                        visit.observations
                                      )}
                                    </p>
                                  `
                                  : ''
                              }

                              ${
                                visit.counselling
                                  ? `
                                    <p>
                                      <strong>
                                        Counselling:
                                      </strong>
                                      ${escapeHtml(
                                        visit.counselling
                                      )}
                                    </p>
                                  `
                                  : ''
                              }

                              ${
                                visit.warning_signs
                                  ? `
                                    <div
                                      class="maternal-warning"
                                    >
                                      ⚠
                                      ${escapeHtml(
                                        visit.warning_signs
                                      )}
                                    </div>
                                  `
                                  : ''
                              }

                              ${
                                visit.referral_required
                                  ? `
                                    <div
                                      class="maternal-warning"
                                    >
                                      ↗ Referral required
                                    </div>
                                  `
                                  : ''
                              }

                              ${
                                visit.offline_created
                                  ? `
                                    <span
                                      class="asha-offline-badge"
                                    >
                                      📡 Offline visit
                                    </span>
                                  `
                                  : ''
                              }

                            </div>

                          </div>

                        `
                      }
                    )
                    .join('')
                : `
                  <div
                    class="maternal-care-empty"
                  >

                    <div
                      class="maternal-care-empty-icon"
                    >
                      🏠
                    </div>

                    <h3>
                      No home visits recorded
                    </h3>

                    <p>
                      Record the first ASHA home visit
                      for this pregnancy.
                    </p>

                  </div>
                `
            }

          </div>


          <div
            id="ashaHomeVisitFormContainer"
            class="maternal-form-container"
            hidden
          ></div>

        `


        const addVisitButton =
          document.querySelector(
            '#addAshaHomeVisitBtn'
          )

        const formContainer =
          document.querySelector(
            '#ashaHomeVisitFormContainer'
          )


        addVisitButton?.addEventListener(
          'click',
          () => {

            if (!formContainer) {
              return
            }

            formContainer.hidden = false

            const assignedAshaId =
              pregnancy.assigned_asha_user_id ||
              getCurrentActorId()

            formContainer.innerHTML = `

              <form
                id="ashaHomeVisitForm"
                class="maternal-record-form"
              >

                <div class="maternal-form-title">
                  Record ASHA Home Visit
                </div>

                <div class="maternal-form-grid">

                  <label>
                    Scheduled Date

                    <input
                      type="date"
                      name="scheduled_date"
                      required
                    >

                  </label>


                  <label>
                    Visit Date

                    <input
                      type="date"
                      name="visit_date"
                    >

                  </label>


                  <label>
                    Visit Status

                    <select
                      name="status"
                    >

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Scheduled">
                        Scheduled
                      </option>

                      <option value="Missed">
                        Missed
                      </option>

                    </select>

                  </label>


                  <label>
                    Purpose

                    <input
                      type="text"
                      name="purpose"
                      placeholder="e.g. routine home follow-up"
                    >

                  </label>

                </div>


                <label>
                  Observations

                  <textarea
                    name="observations"
                    rows="3"
                    placeholder="Record observations"
                  ></textarea>

                </label>


                <label>
                  Counselling

                  <textarea
                    name="counselling"
                    rows="3"
                    placeholder="Counselling / guidance provided"
                  ></textarea>

                </label>


                <label>
                  Warning Signs

                  <textarea
                    name="warning_signs"
                    rows="2"
                    placeholder="Record any warning signs"
                  ></textarea>

                </label>


                <label>
                  Notes

                  <textarea
                    name="notes"
                    rows="2"
                    placeholder="Additional notes"
                  ></textarea>

                </label>


                <div
                  class="maternal-form-checks"
                >

                  <label>

                    <input
                      type="checkbox"
                      name="referral_required"
                    >

                    Referral required

                  </label>

                </div>


                <div
                  class="maternal-form-actions"
                >

                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Save Home Visit
                  </button>

                  <button
                    type="button"
                    class="secondary-action"
                    id="cancelAshaHomeVisitBtn"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            `


            document
              .querySelector(
                '#cancelAshaHomeVisitBtn'
              )
              ?.addEventListener(
                'click',
                () => {

                  formContainer.hidden =
                    true

                  formContainer.innerHTML =
                    ''

                }
              )


            document
              .querySelector(
                '#ashaHomeVisitForm'
              )
              ?.addEventListener(
                'submit',
                async event => {

                  event.preventDefault()

                  const form =
                    event.currentTarget

                  const formData =
                    new FormData(form)

                  const payload = {

                    asha_user_id:
                      assignedAshaId,

                    scheduled_date:
                      formData.get(
                        'scheduled_date'
                      ) || null,

                    visit_date:
                      formData.get(
                        'visit_date'
                      ) || null,

                    status:
                      formData.get(
                        'status'
                      ) || 'Completed',

                    purpose:
                      formData.get(
                        'purpose'
                      ) || null,

                    observations:
                      formData.get(
                        'observations'
                      ) || null,

                    counselling:
                      formData.get(
                        'counselling'
                      ) || null,

                    warning_signs:
                      formData.get(
                        'warning_signs'
                      ) || null,

                    referral_required:
                      formData.get(
                        'referral_required'
                      ) === 'on',

                    notes:
                      formData.get(
                        'notes'
                      ) || null,

                    offline_created: false
                  }


                  const saveButton =
                    form.querySelector(
                      'button[type="submit"]'
                    )

                  if (saveButton) {

                    saveButton.disabled =
                      true

                    saveButton.textContent =
                      'Saving...'

                  }


                  try {

                    const saved =
                      await apiRequest(
                        `/maternal/pregnancies/${encodeURIComponent(
                          pregnancyId
                        )}/asha-home-visits?actor_id=${encodeURIComponent(
                          getCurrentActorId()
                        )}`,
                        {
                          method: 'POST',

                          body:
                            JSON.stringify(
                              payload
                            )
                        }
                      )


                    if (
                      !saved ||
                      !saved.success
                    ) {

                      throw new Error(
                        saved?.message ||
                        'Unable to save home visit.'
                      )

                    }


                    await loadMaternalCareTab(
                      patientId,
                      'home'
                    )

                  } catch (error) {

                    console.error(
                      'Save ASHA home visit:',
                      error
                    )

                    alert(
                      error?.message ||
                      'Unable to save home visit.'
                    )

                    if (saveButton) {

                      saveButton.disabled =
                        false

                      saveButton.textContent =
                        'Save Home Visit'

                    }

                  }

                }
              )

          }
        )

        return
      }


            // =================================================
      // MATERNAL VACCINATIONS
      // =================================================

      if (tab === 'vaccines') {

        const result =
          await apiRequest(
            `/maternal/pregnancies/${encodeURIComponent(
              pregnancyId
            )}/vaccinations?actor_id=${encodeURIComponent(
              getCurrentActorId()
            )}`
          )

        const vaccinations =
          result?.vaccinations ||
          []

        const summary =
          result?.summary ||
          {
            total: 0,
            completed: 0,
            pending: 0,
            missed: 0
          }

        target.innerHTML = `

          <div class="maternal-module-header">

            <div>

              <div class="dashboard-kicker">
                MATERNAL IMMUNIZATION
              </div>

              <h3>
                Mother Vaccination Tracker
              </h3>

              <p>
                Track maternal vaccinations recorded
                by the healthcare worker.
              </p>

            </div>

            <button
              type="button"
              class="primary-action"
              id="addMaternalVaccineBtn"
            >
              + Record Vaccination
            </button>

          </div>


          <div class="asha-visit-summary">

            <div class="asha-summary-card">

              <span>Total</span>

              <strong>
                ${summary.total}
              </strong>

            </div>

            <div class="asha-summary-card">

              <span>Completed</span>

              <strong>
                ${summary.completed}
              </strong>

            </div>

            <div class="asha-summary-card">

              <span>Pending</span>

              <strong>
                ${summary.pending}
              </strong>

            </div>

            <div class="asha-summary-card">

              <span>Missed</span>

              <strong>
                ${summary.missed}
              </strong>

            </div>

          </div>


          <div class="maternal-vaccine-list">

            ${
              vaccinations.length
                ? vaccinations
                    .map(
                      vaccination => {

                        const status =
                          String(
                            vaccination.status ||
                            'Pending'
                          )

                        const statusClass =
                          status
                            .toLowerCase()
                            .replace(
                              /\s+/g,
                              '-'
                            )

                        return `

                          <div
                            class="
                              maternal-vaccine-card
                              ${statusClass}
                            "
                          >

                            <div
                              class="maternal-vaccine-icon"
                            >
                              💉
                            </div>

                            <div
                              class="maternal-vaccine-main"
                            >

                              <div
                                class="
                                  maternal-vaccine-top
                                "
                              >

                                <div>

                                  <strong>
                                    ${escapeHtml(
                                      vaccination.vaccine_name ||
                                      'Vaccine'
                                    )}
                                  </strong>

                                  <span>
                                    ${escapeHtml(
                                      vaccination.dose ||
                                      'Dose'
                                    )}
                                  </span>

                                </div>

                                <span
                                  class="
                                    maternal-status-pill
                                    ${
                                      status ===
                                      'Completed'
                                        ? 'done'
                                        : status ===
                                          'Missed'
                                          ? 'missed'
                                          : 'due'
                                    }
                                  "
                                >
                                  ${escapeHtml(
                                    status
                                  )}
                                </span>

                              </div>


                              <div
                                class="
                                  maternal-vaccine-details
                                "
                              >

                                ${
                                  vaccination
                                    .scheduled_date
                                    ? `
                                      <span>
                                        📅 Scheduled:
                                        ${escapeHtml(
                                          vaccination.scheduled_date
                                        )}
                                      </span>
                                    `
                                    : ''
                                }

                                ${
                                  vaccination
                                    .administered_date
                                    ? `
                                      <span>
                                        ✓ Administered:
                                        ${escapeHtml(
                                          vaccination.administered_date
                                        )}
                                      </span>
                                    `
                                    : ''
                                }

                                ${
                                  vaccination.notes
                                    ? `
                                      <span>
                                        📝
                                        ${escapeHtml(
                                          vaccination.notes
                                        )}
                                      </span>
                                    `
                                    : ''
                                }

                              </div>

                            </div>

                          </div>

                        `
                      }
                    )
                    .join('')
                : `
                  <div class="maternal-care-empty">

                    <div
                      class="maternal-care-empty-icon"
                    >
                      💉
                    </div>

                    <h3>
                      No maternal vaccinations recorded
                    </h3>

                    <p>
                      Add the vaccination record when
                      it is documented by the healthcare worker.
                    </p>

                  </div>
                `
            }

          </div>


          <div
            id="maternalVaccineFormContainer"
            class="maternal-form-container"
            hidden
          ></div>

        `


        const addVaccineButton =
          document.querySelector(
            '#addMaternalVaccineBtn'
          )

        const formContainer =
          document.querySelector(
            '#maternalVaccineFormContainer'
          )


        addVaccineButton?.addEventListener(
          'click',
          () => {

            if (!formContainer) {
              return
            }

            formContainer.hidden = false

            formContainer.innerHTML = `

              <form
                id="maternalVaccineForm"
                class="maternal-record-form"
              >

                <div class="maternal-form-title">
                  Record Maternal Vaccination
                </div>


                <div class="maternal-form-grid">

                  <label>
                    Vaccine Name

                    <input
                      type="text"
                      name="vaccine_name"
                      placeholder="e.g. Td"
                      required
                    >

                  </label>


                  <label>
                    Dose

                    <input
                      type="text"
                      name="dose"
                      placeholder="e.g. Dose 1"
                      required
                    >

                  </label>


                  <label>
                    Scheduled Date

                    <input
                      type="date"
                      name="scheduled_date"
                    >

                  </label>


                  <label>
                    Administered Date

                    <input
                      type="date"
                      name="administered_date"
                    >

                  </label>


                  <label>
                    Status

                    <select name="status">

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Missed">
                        Missed
                      </option>

                      <option value="Not Due">
                        Not Due
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>

                    </select>

                  </label>

                </div>


                <label>
                  Notes

                  <textarea
                    name="notes"
                    rows="3"
                    placeholder="Optional notes"
                  ></textarea>

                </label>


                <div
                  class="maternal-form-actions"
                >

                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Save Vaccination
                  </button>

                  <button
                    type="button"
                    class="secondary-action"
                    id="cancelMaternalVaccineBtn"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            `


            document
              .querySelector(
                '#cancelMaternalVaccineBtn'
              )
              ?.addEventListener(
                'click',
                () => {

                  formContainer.hidden =
                    true

                  formContainer.innerHTML =
                    ''

                }
              )


            document
              .querySelector(
                '#maternalVaccineForm'
              )
              ?.addEventListener(
                'submit',
                async event => {

                  event.preventDefault()

                  const form =
                    event.currentTarget

                  const formData =
                    new FormData(form)

                  const payload = {

                    vaccine_name:
                      formData.get(
                        'vaccine_name'
                      ),

                    dose:
                      formData.get(
                        'dose'
                      ),

                    scheduled_date:
                      formData.get(
                        'scheduled_date'
                      ) || null,

                    administered_date:
                      formData.get(
                        'administered_date'
                      ) || null,

                    status:
                      formData.get(
                        'status'
                      ) || 'Pending',

                    notes:
                      formData.get(
                        'notes'
                      ) || null

                  }


                  const saveButton =
                    form.querySelector(
                      'button[type="submit"]'
                    )

                  if (saveButton) {

                    saveButton.disabled =
                      true

                    saveButton.textContent =
                      'Saving...'

                  }


                  try {

                    const saved =
                      await apiRequest(
                        `/maternal/pregnancies/${encodeURIComponent(
                          pregnancyId
                        )}/vaccinations?actor_id=${encodeURIComponent(
                          getCurrentActorId()
                        )}`,
                        {
                          method: 'POST',

                          body:
                            JSON.stringify(
                              payload
                            )
                        }
                      )


                    if (
                      !saved ||
                      !saved.success
                    ) {

                      throw new Error(
                        saved?.message ||
                        'Unable to save vaccination.'
                      )

                    }


                    await loadMaternalCareTab(
                      patientId,
                      'vaccines'
                    )

                  } catch (error) {

                    console.error(
                      'Save maternal vaccination:',
                      error
                    )

                    alert(
                      error?.message ||
                      'Unable to save vaccination.'
                    )

                    if (saveButton) {

                      saveButton.disabled =
                        false

                      saveButton.textContent =
                        'Save Vaccination'

                    }

                  }

                }
              )

          }
        )

        return
      }


            // =================================================
      // PREGNANCY LAB REPORTS
      // =================================================

      if (tab === 'labs') {

        const result =
          await apiRequest(
            `/maternal/pregnancies/${encodeURIComponent(
              pregnancyId
            )}/labs?actor_id=${encodeURIComponent(
              getCurrentActorId()
            )}`
          )

        const labs =
          result?.labs ||
          []

        target.innerHTML = `

          <div class="maternal-module-header">

            <div>

              <div class="dashboard-kicker">
                PREGNANCY HEALTH RECORDS
              </div>

              <h3>
                Lab Reports
              </h3>

              <p>
                Pregnancy-linked investigations and
                laboratory reports.
              </p>

            </div>

            <button
              type="button"
              class="primary-action"
              id="addPregnancyLabBtn"
            >
              + Add Lab Report
            </button>

          </div>


          <div class="maternal-lab-summary">

            <div class="maternal-lab-count">
              <span>Total Reports</span>
              <strong>${labs.length}</strong>
            </div>

            <div class="maternal-lab-info">
              <span>Linked To</span>
              <strong>
                Pregnancy #${escapeHtml(
                  String(
                    pregnancy.pregnancy_number ||
                    '—'
                  )
                )}
              </strong>
            </div>

          </div>


          <div class="maternal-lab-list">

            ${
              labs.length
                ? labs
                    .map(
                      lab => `

                        <div class="maternal-lab-card">

                          <div class="maternal-lab-icon">
                            🧪
                          </div>

                          <div class="maternal-lab-main">

                            <div class="maternal-lab-top">

                              <div>

                                <strong>
                                  ${escapeHtml(
                                    lab.test_name ||
                                    'Lab Test'
                                  )}
                                </strong>

                                <span>
                                  ${escapeHtml(
                                    lab.report_date ||
                                    'Date not recorded'
                                  )}
                                </span>

                              </div>

                              <span
                                class="
                                  maternal-status-pill
                                  ${
                                    String(
                                      lab.status ||
                                      ''
                                    ).toLowerCase() ===
                                    'available'
                                      ? 'done'
                                      : 'due'
                                  }
                                "
                              >
                                ${escapeHtml(
                                  lab.status ||
                                  'Available'
                                )}
                              </span>

                            </div>

                            <div class="maternal-lab-result">

                              <span>
                                Result
                              </span>

                              <strong>
                                ${escapeHtml(
                                  lab.result ||
                                  'No result recorded'
                                )}
                              </strong>

                            </div>

                          </div>

                        </div>

                      `
                    )
                    .join('')
                : `
                  <div class="maternal-care-empty">

                    <div
                      class="maternal-care-empty-icon"
                    >
                      🧪
                    </div>

                    <h3>
                      No lab reports recorded
                    </h3>

                    <p>
                      Add a pregnancy-linked lab report
                      to keep investigations in one place.
                    </p>

                  </div>
                `
            }

          </div>


          <div
            id="pregnancyLabFormContainer"
            class="maternal-form-container"
            hidden
          ></div>

        `


        const addLabButton =
          document.querySelector(
            '#addPregnancyLabBtn'
          )

        const formContainer =
          document.querySelector(
            '#pregnancyLabFormContainer'
          )


        addLabButton?.addEventListener(
          'click',
          () => {

            if (!formContainer) {
              return
            }

            formContainer.hidden = false

            formContainer.innerHTML = `

              <form
                id="pregnancyLabForm"
                class="maternal-record-form"
              >

                <div class="maternal-form-title">
                  Add Pregnancy Lab Report
                </div>


                <div class="maternal-form-grid">

                  <label>
                    Test Name

                    <input
                      type="text"
                      name="test_name"
                      placeholder="e.g. Haemoglobin"
                      required
                    >

                  </label>


                  <label>
                    Report Date

                    <input
                      type="date"
                      name="report_date"
                      required
                    >

                  </label>


                  <label>
                    Status

                    <select name="status">

                      <option value="Available">
                        Available
                      </option>

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Under Review">
                        Under Review
                      </option>

                    </select>

                  </label>

                </div>


                <label>
                  Result

                  <textarea
                    name="result"
                    rows="4"
                    placeholder="Enter laboratory result"
                    required
                  ></textarea>

                </label>


                <div class="maternal-form-actions">

                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Save Lab Report
                  </button>

                  <button
                    type="button"
                    class="secondary-action"
                    id="cancelPregnancyLabBtn"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            `


            document
              .querySelector(
                '#cancelPregnancyLabBtn'
              )
              ?.addEventListener(
                'click',
                () => {

                  formContainer.hidden =
                    true

                  formContainer.innerHTML =
                    ''

                }
              )


            document
              .querySelector(
                '#pregnancyLabForm'
              )
              ?.addEventListener(
                'submit',
                async event => {

                  event.preventDefault()

                  const form =
                    event.currentTarget

                  const formData =
                    new FormData(form)

                  const payload = {

                    test_name:
                      formData.get(
                        'test_name'
                      ),

                    result:
                      formData.get(
                        'result'
                      ),

                    report_date:
                      formData.get(
                        'report_date'
                      ),

                    status:
                      formData.get(
                        'status'
                      ) ||
                      'Available'

                  }


                  const saveButton =
                    form.querySelector(
                      'button[type="submit"]'
                    )

                  if (saveButton) {

                    saveButton.disabled =
                      true

                    saveButton.textContent =
                      'Saving...'

                  }


                  try {

                    const saved =
                      await apiRequest(
                        `/maternal/pregnancies/${encodeURIComponent(
                          pregnancyId
                        )}/labs?actor_id=${encodeURIComponent(
                          getCurrentActorId()
                        )}`,
                        {
                          method: 'POST',

                          body:
                            JSON.stringify(
                              payload
                            )
                        }
                      )


                    if (
                      !saved ||
                      !saved.success
                    ) {

                      throw new Error(
                        saved?.message ||
                        'Unable to save lab report.'
                      )

                    }


                    await loadMaternalCareTab(
                      patientId,
                      'labs'
                    )

                  } catch (error) {

                    console.error(
                      'Save pregnancy lab:',
                      error
                    )

                    alert(
                      error?.message ||
                      'Unable to save lab report.'
                    )

                    if (saveButton) {

                      saveButton.disabled =
                        false

                      saveButton.textContent =
                        'Save Lab Report'

                    }

                  }

                }
              )

          }
        )

        return
      }


            // =================================================
      // DELIVERY
      // =================================================

      if (tab === 'delivery') {

        const result =
          await apiRequest(
            `/maternal/pregnancies/${encodeURIComponent(
              pregnancyId
            )}/delivery?actor_id=${encodeURIComponent(
              getCurrentActorId()
            )}`
          )

        const delivery =
          result?.delivery ||
          null

        target.innerHTML = `

          <div class="maternal-module-header">

            <div>

              <div class="dashboard-kicker">
                DELIVERY
              </div>

              <h3>
                Delivery Record
              </h3>

              <p>
                Record delivery details and connect
                the pregnancy to the newborn records.
              </p>

            </div>

            ${
              delivery
                ? ''
                : `
                  <button
                    type="button"
                    class="primary-action"
                    id="addDeliveryBtn"
                  >
                    + Record Delivery
                  </button>
                `
            }

          </div>


          ${
            delivery
              ? `

                <div class="delivery-status-banner">

                  <div class="delivery-status-icon">
                    ✓
                  </div>

                  <div>

                    <strong>
                      Delivery recorded
                    </strong>

                    <span>
                      Pregnancy #${escapeHtml(
                        String(
                          pregnancy.pregnancy_number ||
                          '—'
                        )
                      )}
                    </span>

                  </div>

                </div>


                <div class="delivery-details-grid">

                  <div class="delivery-detail-card">

                    <span>
                      Delivery Date
                    </span>

                    <strong>
                      ${escapeHtml(
                        delivery.delivery_date ||
                        'Not recorded'
                      )}
                    </strong>

                  </div>


                  <div class="delivery-detail-card">

                    <span>
                      Facility
                    </span>

                    <strong>
                      ${escapeHtml(
                        delivery.facility_id ||
                        'Not recorded'
                      )}
                    </strong>

                  </div>


                  <div class="delivery-detail-card">

                    <span>
                      Delivery Mode
                    </span>

                    <strong>
                      ${escapeHtml(
                        delivery.delivery_mode ||
                        'Not recorded'
                      )}
                    </strong>

                  </div>


                  <div class="delivery-detail-card">

                    <span>
                      Baby Count
                    </span>

                    <strong>
                      ${escapeHtml(
                        String(
                          delivery.baby_count ||
                          1
                        )
                      )}
                    </strong>

                  </div>

                </div>


                ${
                  delivery.complications
                    ? `
                      <div class="delivery-note delivery-alert">

                        <strong>
                          Complications
                        </strong>

                        <span>
                          ${escapeHtml(
                            delivery.complications
                          )}
                        </span>

                      </div>
                    `
                    : ''
                }


                ${
                  delivery.referral_required
                    ? `
                      <div class="maternal-warning">
                        ↗ Referral required
                      </div>
                    `
                    : ''
                }


                ${
                  delivery.notes
                    ? `
                      <div class="delivery-note">

                        <strong>
                          Notes
                        </strong>

                        <span>
                          ${escapeHtml(
                            delivery.notes
                          )}
                        </span>

                      </div>
                    `
                    : ''
                }

              `
              : `

                <div class="delivery-planning-card">

                  <div class="delivery-planning-icon">
                    🏥
                  </div>

                  <div>

                    <span>
                      Expected Delivery Date
                    </span>

                    <strong>
                      ${escapeHtml(
                        pregnancy.edd_date ||
                        'Not recorded'
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Assigned ASHA
                    </span>

                    <strong>
                      ${escapeHtml(
                        pregnancy.assigned_asha_name ||
                        'Not assigned'
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Risk Status
                    </span>

                    <strong>
                      ${escapeHtml(
                        pregnancy.risk_status ||
                        'Not recorded'
                      )}
                    </strong>

                  </div>

                </div>

              `
          }


          <div
            id="deliveryFormContainer"
            class="maternal-form-container"
            hidden
          ></div>

        `


        const addDeliveryButton =
          document.querySelector(
            '#addDeliveryBtn'
          )

        const formContainer =
          document.querySelector(
            '#deliveryFormContainer'
          )


        addDeliveryButton?.addEventListener(
          'click',
          () => {

            if (!formContainer) {
              return
            }

            formContainer.hidden = false

            formContainer.innerHTML = `

              <form
                id="deliveryForm"
                class="maternal-record-form"
              >

                <div class="maternal-form-title">
                  Record Delivery
                </div>


                <div class="maternal-form-grid">

                  <label>
                    Delivery Date

                    <input
                      type="date"
                      name="delivery_date"
                      required
                    >

                  </label>


                  <label>
                    Delivery Mode

                    <select
                      name="delivery_mode"
                    >

                      <option value="">
                        Select mode
                      </option>

                      <option value="Vaginal">
                        Vaginal
                      </option>

                      <option value="C-section">
                        C-section
                      </option>

                      <option value="Assisted">
                        Assisted
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </label>


                  <label>
                    Baby Count

                    <input
                      type="number"
                      name="baby_count"
                      min="1"
                      value="1"
                      required
                    >

                  </label>

                </div>


                <label>
                  Complications

                  <textarea
                    name="complications"
                    rows="3"
                    placeholder="Record any delivery complications"
                  ></textarea>

                </label>


                <label>
                  Notes

                  <textarea
                    name="notes"
                    rows="3"
                    placeholder="Additional delivery notes"
                  ></textarea>

                </label>


                <div class="maternal-form-checks">

                  <label>

                    <input
                      type="checkbox"
                      name="referral_required"
                    >

                    Referral required

                  </label>

                </div>


                <div class="maternal-form-actions">

                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Save Delivery
                  </button>

                  <button
                    type="button"
                    class="secondary-action"
                    id="cancelDeliveryBtn"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            `


            document
              .querySelector(
                '#cancelDeliveryBtn'
              )
              ?.addEventListener(
                'click',
                () => {

                  formContainer.hidden = true

                  formContainer.innerHTML = ''

                }
              )


            document
              .querySelector(
                '#deliveryForm'
              )
              ?.addEventListener(
                'submit',
                async event => {

                  event.preventDefault()

                  const form =
                    event.currentTarget

                  const formData =
                    new FormData(form)

                  const payload = {

                    delivery_date:
                      formData.get(
                        'delivery_date'
                      ),

                    delivery_mode:
                      formData.get(
                        'delivery_mode'
                      ) || null,

                    baby_count:
                      Number(
                        formData.get(
                          'baby_count'
                        ) || 1
                      ),

                    complications:
                      formData.get(
                        'complications'
                      ) || null,

                    referral_required:
                      formData.get(
                        'referral_required'
                      ) === 'on',

                    notes:
                      formData.get(
                        'notes'
                      ) || null

                  }


                  const saveButton =
                    form.querySelector(
                      'button[type="submit"]'
                    )

                  if (saveButton) {

                    saveButton.disabled = true

                    saveButton.textContent =
                      'Saving...'

                  }


                  try {

                    const saved =
                      await apiRequest(
                        `/maternal/pregnancies/${encodeURIComponent(
                          pregnancyId
                        )}/delivery?actor_id=${encodeURIComponent(
                          getCurrentActorId()
                        )}`,
                        {
                          method: 'POST',

                          body:
                            JSON.stringify(
                              payload
                            )
                        }
                      )


                    if (
                      !saved ||
                      !saved.success
                    ) {

                      throw new Error(
                        saved?.message ||
                        'Unable to save delivery.'
                      )

                    }


                    await loadMaternalCareTab(
                      patientId,
                      'delivery'
                    )

                  } catch (error) {

                    console.error(
                      'Save delivery:',
                      error
                    )

                    alert(
                      error?.message ||
                      'Unable to save delivery.'
                    )

                    if (saveButton) {

                      saveButton.disabled =
                        false

                      saveButton.textContent =
                        'Save Delivery'

                    }

                  }

                }
              )

          }
        )

        return
      }

            // =================================================
      // POSTNATAL CARE
      // =================================================

      if (tab === 'postnatal') {

        const result =
          await apiRequest(
            `/maternal/pregnancies/${encodeURIComponent(
              pregnancyId
            )}/postnatal?actor_id=${encodeURIComponent(
              getCurrentActorId()
            )}`
          )

        const visits =
          result?.visits ||
          []

        const completed =
          result?.summary?.completed ||
          visits.length

        target.innerHTML = `

          <div class="maternal-module-header">

            <div>

              <div class="dashboard-kicker">
                POSTNATAL CARE
              </div>

              <h3>
                Mother & Newborn Follow-up
              </h3>

              <p>
                Track post-delivery follow-up for both
                the mother and newborn.
              </p>

            </div>

            <button
              type="button"
              class="primary-action"
              id="addPostnatalVisitBtn"
            >
              + Record Postnatal Visit
            </button>

          </div>


          <div class="postnatal-summary-grid">

            <div class="postnatal-summary-card">

              <span>
                Visits Recorded
              </span>

              <strong>
                ${completed}
              </strong>

            </div>

            <div class="postnatal-summary-card">

              <span>
                Mother Follow-up
              </span>

              <strong>
                ${
                  visits.some(
                    visit =>
                      visit.maternal_status
                  )
                    ? 'Recorded'
                    : 'Pending'
                }
              </strong>

            </div>

            <div class="postnatal-summary-card">

              <span>
                Newborn Follow-up
              </span>

              <strong>
                ${
                  visits.some(
                    visit =>
                      visit.newborn_status
                  )
                    ? 'Recorded'
                    : 'Pending'
                }
              </strong>

            </div>

            <div class="postnatal-summary-card">

              <span>
                Family Planning
              </span>

              <strong>
                ${
                  visits.some(
                    visit =>
                      visit.family_planning_counselling
                  )
                    ? 'Discussed'
                    : 'Pending'
                }
              </strong>

            </div>

          </div>


          <div class="postnatal-timeline">

            ${
              visits.length
                ? visits
                    .map(
                      visit => `

                        <div class="postnatal-visit-card">

                          <div class="postnatal-visit-marker">
                            ${escapeHtml(
                              String(
                                visit.visit_number
                              )
                            )}
                          </div>

                          <div class="postnatal-visit-content">

                            <div class="postnatal-visit-top">

                              <div>

                                <strong>
                                  Postnatal Visit ${
                                    escapeHtml(
                                      String(
                                        visit.visit_number
                                      )
                                    )
                                  }
                                </strong>

                                <span>
                                  ${escapeHtml(
                                    visit.visit_date ||
                                    'Date not recorded'
                                  )}
                                </span>

                              </div>

                              <span
                                class="
                                  maternal-status-pill
                                  done
                                "
                              >
                                Recorded
                              </span>

                            </div>


                            ${
                              visit.maternal_status
                                ? `
                                  <div class="postnatal-info-block">

                                    <strong>
                                      Mother
                                    </strong>

                                    <span>
                                      ${escapeHtml(
                                        visit.maternal_status
                                      )}
                                    </span>

                                  </div>
                                `
                                : ''
                            }


                            ${
                              visit.newborn_status
                                ? `
                                  <div class="postnatal-info-block">

                                    <strong>
                                      Newborn
                                    </strong>

                                    <span>
                                      ${escapeHtml(
                                        visit.newborn_status
                                      )}
                                    </span>

                                  </div>
                                `
                                : ''
                            }


                            ${
                              visit.family_planning_counselling
                                ? `
                                  <span class="postnatal-tag">
                                    ✓ Family-planning counselling recorded
                                  </span>
                                `
                                : ''
                            }


                            ${
                              visit.referral_required
                                ? `
                                  <div class="maternal-warning">
                                    ↗ Referral required
                                  </div>
                                `
                                : ''
                            }


                            ${
                              visit.notes
                                ? `
                                  <p class="postnatal-notes">
                                    ${escapeHtml(
                                      visit.notes
                                    )}
                                  </p>
                                `
                                : ''
                            }

                          </div>

                        </div>

                      `
                    )
                    .join('')
                : `
                  <div class="maternal-care-empty">

                    <div class="maternal-care-empty-icon">
                      🍼
                    </div>

                    <h3>
                      No postnatal visits recorded
                    </h3>

                    <p>
                      Record the first post-delivery
                      follow-up visit.
                    </p>

                  </div>
                `
            }

          </div>


          <div
            id="postnatalFormContainer"
            class="maternal-form-container"
            hidden
          ></div>

        `


        const addPostnatalButton =
          document.querySelector(
            '#addPostnatalVisitBtn'
          )

        const formContainer =
          document.querySelector(
            '#postnatalFormContainer'
          )


        addPostnatalButton?.addEventListener(
          'click',
          () => {

            if (!formContainer) {
              return
            }

            formContainer.hidden = false

            formContainer.innerHTML = `

              <form
                id="postnatalVisitForm"
                class="maternal-record-form"
              >

                <div class="maternal-form-title">
                  Record Postnatal Visit
                </div>


                <div class="maternal-form-grid">

                  <label>
                    Visit Number

                    <input
                      type="number"
                      name="visit_number"
                      min="1"
                      value="${
                        visits.length + 1
                      }"
                      required
                    >

                  </label>


                  <label>
                    Visit Type

                    <select name="visit_type">

                      <option value="Postnatal">
                        Postnatal
                      </option>

                      <option value="Mother Follow-up">
                        Mother Follow-up
                      </option>

                      <option value="Newborn Follow-up">
                        Newborn Follow-up
                      </option>

                      <option value="Combined Follow-up">
                        Combined Follow-up
                      </option>

                    </select>

                  </label>


                  <label>
                    Visit Date

                    <input
                      type="date"
                      name="visit_date"
                      required
                    >

                  </label>

                </div>


                <label>
                  Maternal Status

                  <textarea
                    name="maternal_status"
                    rows="3"
                    placeholder="Mother's current status"
                  ></textarea>

                </label>


                <label>
                  Newborn Status

                  <textarea
                    name="newborn_status"
                    rows="3"
                    placeholder="Newborn's current status"
                  ></textarea>

                </label>


                <label>
                  Notes

                  <textarea
                    name="notes"
                    rows="3"
                    placeholder="Additional notes"
                  ></textarea>

                </label>


                <div class="maternal-form-checks">

                  <label>

                    <input
                      type="checkbox"
                      name="family_planning_counselling"
                    >

                    Family-planning counselling recorded

                  </label>


                  <label>

                    <input
                      type="checkbox"
                      name="referral_required"
                    >

                    Referral required

                  </label>

                </div>


                <div class="maternal-form-actions">

                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Save Postnatal Visit
                  </button>

                  <button
                    type="button"
                    class="secondary-action"
                    id="cancelPostnatalBtn"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            `


            document
              .querySelector(
                '#cancelPostnatalBtn'
              )
              ?.addEventListener(
                'click',
                () => {

                  formContainer.hidden =
                    true

                  formContainer.innerHTML =
                    ''

                }
              )


            document
              .querySelector(
                '#postnatalVisitForm'
              )
              ?.addEventListener(
                'submit',
                async event => {

                  event.preventDefault()

                  const form =
                    event.currentTarget

                  const formData =
                    new FormData(form)

                  const payload = {

                    visit_number:
                      Number(
                        formData.get(
                          'visit_number'
                        ) || 1
                      ),

                    visit_type:
                      formData.get(
                        'visit_type'
                      ) || 'Postnatal',

                    visit_date:
                      formData.get(
                        'visit_date'
                      ) || null,

                    maternal_status:
                      formData.get(
                        'maternal_status'
                      ) || null,

                    newborn_status:
                      formData.get(
                        'newborn_status'
                      ) || null,

                    family_planning_counselling:
                      formData.get(
                        'family_planning_counselling'
                      ) === 'on',

                    referral_required:
                      formData.get(
                        'referral_required'
                      ) === 'on',

                    notes:
                      formData.get(
                        'notes'
                      ) || null

                  }


                  const saveButton =
                    form.querySelector(
                      'button[type="submit"]'
                    )

                  if (saveButton) {

                    saveButton.disabled =
                      true

                    saveButton.textContent =
                      'Saving...'

                  }


                  try {

                    const saved =
                      await apiRequest(
                        `/maternal/pregnancies/${encodeURIComponent(
                          pregnancyId
                        )}/postnatal?actor_id=${encodeURIComponent(
                          getCurrentActorId()
                        )}`,
                        {
                          method: 'POST',

                          body:
                            JSON.stringify(
                              payload
                            )
                        }
                      )


                    if (
                      !saved ||
                      !saved.success
                    ) {

                      throw new Error(
                        saved?.message ||
                        'Unable to save postnatal visit.'
                      )

                    }


                    await loadMaternalCareTab(
                      patientId,
                      'postnatal'
                    )

                  } catch (error) {

                    console.error(
                      'Save postnatal visit:',
                      error
                    )

                    alert(
                      error?.message ||
                      'Unable to save postnatal visit.'
                    )

                    if (saveButton) {

                      saveButton.disabled =
                        false

                      saveButton.textContent =
                        'Save Postnatal Visit'

                    }

                  }

                }
              )

          }
        )

        return
      }

      // =================================================
      // CHILDREN 0–6 YEARS
      // =================================================

      if (tab === 'children') {

        const result =
          await apiRequest(
            `/maternal/patients/${encodeURIComponent(
              patientId
            )}/children?actor_id=${encodeURIComponent(
              getCurrentActorId()
            )}`
          )

        const children =
          result?.children ||
          []

        target.innerHTML = `

          <div class="maternal-module-header">

            <div>

              <div class="dashboard-kicker">
                CHILD HEALTH · 0–6 YEARS
              </div>

              <h3>
                Children
              </h3>

              <p>
                Keep every child linked to the correct
                pregnancy without overwriting family history.
              </p>

            </div>

            <button
              type="button"
              class="primary-action"
              id="addChildBtn"
            >
              + Register Child
            </button>

          </div>


          <div class="child-care-summary">

            <div class="child-summary-card">

              <span>
                Children
              </span>

              <strong>
                ${children.length}
              </strong>

            </div>

            <div class="child-summary-card">

              <span>
                Age Range
              </span>

              <strong>
                0–6 Years
              </strong>

            </div>

            <div class="child-summary-card">

              <span>
                Vaccination Records
              </span>

              <strong>
                ${
                  children.reduce(
                    (
                      total,
                      child
                    ) =>
                      total +
                      (
                        child
                          .immunization_summary
                          ?.completed ||
                        0
                      ),
                    0
                  )
                }
              </strong>

            </div>

            <div class="child-summary-card">

              <span>
                Family Tracking
              </span>

              <strong>
                ${
                  children.length
                    ? 'Active'
                    : 'Ready'
                }
              </strong>

            </div>

          </div>


          <div class="children-care-list">

            ${
              children.length
                ? children
                    .map(
                      child => {

                        const age =
                          child.age ||
                          {}

                        const ageText =
                          age.years !== undefined
                            ? `${age.years}y ${
                                age.months || 0
                              }m`
                            : 'Age unavailable'

                        const vaccineSummary =
                          child.immunization_summary ||
                          {}

                        const vaccineTotal =
                          vaccineSummary.total ||
                          0

                        const vaccineCompleted =
                          vaccineSummary.completed ||
                          0

                        const vaccinePercent =
                          vaccineTotal > 0
                            ? Math.round(
                                (
                                  vaccineCompleted /
                                  vaccineTotal
                                ) * 100
                              )
                            : 0

                        return `

                          <div
                            class="child-care-card"
                            data-child-id="${escapeHtml(
                              child.child_id ||
                              ''
                            )}"
                          >

                            <div class="child-care-avatar">
                              👶
                            </div>


                            <div class="child-care-main">

                              <div
                                class="child-care-top"
                              >

                                <div>

                                  <strong>
                                    ${escapeHtml(
                                      child.name ||
                                      'Child'
                                    )}
                                  </strong>

                                  <span>
                                    ${
                                      child.sex
                                        ? escapeHtml(
                                            child.sex
                                          )
                                        : ''
                                    }

                                    ${
                                      child.sex &&
                                      child.date_of_birth
                                        ? ' · '
                                        : ''
                                    }

                                    ${
                                      child.date_of_birth
                                        ? escapeHtml(
                                            child.date_of_birth
                                          )
                                        : ''
                                    }
                                  </span>

                                </div>

                                <span
                                  class="
                                    child-age-badge
                                  "
                                >
                                  ${escapeHtml(
                                    ageText
                                  )}
                                </span>

                              </div>


                              <div
                                class="
                                  child-care-meta
                                "
                              >

                                <span>
                                  Pregnancy #${
                                    escapeHtml(
                                      String(
                                        child.pregnancy_number ||
                                        '—'
                                      )
                                    )
                                  }
                                </span>

                                <span>
                                  ID:
                                  ${escapeHtml(
                                    child.child_id ||
                                    '—'
                                  )}
                                </span>

                              </div>


                              <div
                                class="
                                  child-immunization-mini
                                "
                              >

                                <div
                                  class="
                                    child-immunization-mini-top
                                  "
                                >

                                  <span>
                                    Immunization tracking
                                  </span>

                                  <strong>
                                    ${
                                      vaccineTotal
                                        ? `${vaccinePercent}%`
                                        : 'Not started'
                                    }
                                  </strong>

                                </div>

                                <div
                                  class="
                                    child-progress-track
                                  "
                                >
                                  <div
                                    class="
                                      child-progress-fill
                                    "
                                    style="
                                      width:${vaccinePercent}%;
                                    "
                                  ></div>
                                </div>

                              </div>


                              <div
                                class="
                                  child-care-actions
                                "
                              >

                                <button
                                  type="button"
                                  class="secondary-action child-vaccines-btn"
                                  data-child-id="${escapeHtml(
                                    child.child_id ||
                                    ''
                                  )}"
                                >
                                  💉 Vaccines
                                </button>

                                <button
                                  type="button"
                                  class="secondary-action child-health-btn"
                                  data-child-id="${escapeHtml(
                                    child.child_id ||
                                    ''
                                  )}"
                                >
                                  📈 Growth & Health
                                </button>

                                <button
                                  type="button"
                                  class="secondary-action child-labs-btn"
                                  data-child-id="${escapeHtml(
                                    child.child_id ||
                                    ''
                                  )}"
                                >
                                  🧪 Labs
                                </button>

                              </div>

                            </div>

                          </div>

                        `
                      }
                    )
                    .join('')
                : `

                  <div class="maternal-care-empty">

                    <div
                      class="maternal-care-empty-icon"
                    >
                      👶
                    </div>

                    <h3>
                      No children registered
                    </h3>

                    <p>
                      After a delivery is recorded,
                      register the newborn here and continue
                      the 0–6 year care journey.
                    </p>

                    <button
                      type="button"
                      class="primary-action"
                      id="addChildBtnEmpty"
                    >
                      + Register Child
                    </button>

                  </div>

                `
            }

          </div>


          <div
            id="childRegistrationFormContainer"
            class="maternal-form-container"
            hidden
          ></div>

        `


        const addChildButton =
          document.querySelector(
            '#addChildBtn'
          ) ||
          document.querySelector(
            '#addChildBtnEmpty'
          )

        const formContainer =
          document.querySelector(
            '#childRegistrationFormContainer'
          )


        addChildButton?.addEventListener(
          'click',
          () => {

            if (!formContainer) {
              return
            }

            formContainer.hidden = false

            const pregnancyOptions =
              pregnancies
                .map(
                  item => `
                    <option
                      value="${escapeHtml(
                        String(
                          item.id
                        )
                      )}"
                    >
                      Pregnancy #${escapeHtml(
                        String(
                          item.pregnancy_number
                        )
                      )} — ${
                        escapeHtml(
                          item.status ||
                          'Recorded'
                        )
                      }
                    </option>
                  `
                )
                .join('')


            formContainer.innerHTML = `

              <form
                id="childRegistrationForm"
                class="maternal-record-form"
              >

                <div class="maternal-form-title">
                  Register Child
                </div>


                <div class="maternal-rh-info">

                  <strong>
                    Link this child to a pregnancy
                  </strong>

                  <br>

                  The correct pregnancy must already have
                  a delivery record.

                </div>


                <div class="maternal-form-grid">

                  <label>
                    Pregnancy

                    <select
                      name="pregnancy_id"
                      required
                    >

                      ${
                        pregnancyOptions ||
                        `
                          <option value="">
                            No pregnancy records available
                          </option>
                        `
                      }

                    </select>

                  </label>


                  <label>
                    Child Name

                    <input
                      type="text"
                      name="name"
                      placeholder="Child name"
                    >

                  </label>


                  <label>
                    Date of Birth

                    <input
                      type="date"
                      name="date_of_birth"
                      required
                    >

                  </label>


                  <label>
                    Sex

                    <select name="sex">

                      <option value="">
                        Select
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </label>


                  <label>
                    Birth Weight

                    <input
                      type="text"
                      name="birth_weight"
                      placeholder="e.g. 2.8 kg"
                    >

                  </label>


                  <label>
                    Blood Group

                    <input
                      type="text"
                      name="blood_group"
                      placeholder="Optional"
                    >

                  </label>

                </div>


                <label>
                  Notes

                  <textarea
                    name="notes"
                    rows="3"
                    placeholder="Additional newborn notes"
                  ></textarea>

                </label>


                <div
                  class="maternal-form-actions"
                >

                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Register Child
                  </button>

                  <button
                    type="button"
                    class="secondary-action"
                    id="cancelChildRegistrationBtn"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            `


            document
              .querySelector(
                '#cancelChildRegistrationBtn'
              )
              ?.addEventListener(
                'click',
                () => {

                  formContainer.hidden =
                    true

                  formContainer.innerHTML =
                    ''

                }
              )


            document
              .querySelector(
                '#childRegistrationForm'
              )
              ?.addEventListener(
                'submit',
                async event => {

                  event.preventDefault()

                  const form =
                    event.currentTarget

                  const formData =
                    new FormData(form)

                  const selectedPregnancyId =
                    formData.get(
                      'pregnancy_id'
                    )

                  const payload = {

                    name:
                      formData.get(
                        'name'
                      ) || null,

                    date_of_birth:
                      formData.get(
                        'date_of_birth'
                      ),

                    sex:
                      formData.get(
                        'sex'
                      ) || null,

                    birth_weight:
                      formData.get(
                        'birth_weight'
                      ) || null,

                    blood_group:
                      formData.get(
                        'blood_group'
                      ) || null,

                    notes:
                      formData.get(
                        'notes'
                      ) || null

                  }


                  const saveButton =
                    form.querySelector(
                      'button[type="submit"]'
                    )

                  if (saveButton) {

                    saveButton.disabled =
                      true

                    saveButton.textContent =
                      'Registering...'

                  }


                  try {

                    const saved =
                      await apiRequest(
                        `/maternal/pregnancies/${encodeURIComponent(
                          selectedPregnancyId
                        )}/children?actor_id=${encodeURIComponent(
                          getCurrentActorId()
                        )}`,
                        {
                          method: 'POST',

                          body:
                            JSON.stringify(
                              payload
                            )
                        }
                      )


                    if (
                      !saved ||
                      !saved.success
                    ) {

                      throw new Error(
                        saved?.message ||
                        'Unable to register child.'
                      )

                    }


                    await loadMaternalCareTab(
                      patientId,
                      'children'
                    )

                  } catch (error) {

                    console.error(
                      'Register child:',
                      error
                    )

                    alert(
                      error?.message ||
                      'Unable to register child.'
                    )

                    if (saveButton) {

                      saveButton.disabled =
                        false

                      saveButton.textContent =
                        'Register Child'

                    }

                  }

                }
              )

          }
        )


        document
          .querySelectorAll(
            '.child-vaccines-btn'
          )
          .forEach(
            button => {

              button.addEventListener(
                'click',
                () => {

                  window.dwitSelectedChildId =
                    button.dataset.childId || ''

                  const vaccineTab =
                    document.querySelector(
                      '.maternal-care-tab[data-maternal-tab="vaccines"]'
                    )

                  vaccineTab?.click()

                }
              )

            }
          )


        document
          .querySelectorAll(
            '.child-health-btn'
          )
          .forEach(
            button => {

              button.addEventListener(
                'click',
                () => {

                  window.dwitSelectedChildId =
                    button.dataset.childId || ''

                 
                }
              )

            }
          )


        document
          .querySelectorAll(
            '.child-labs-btn'
          )
          .forEach(
            button => {

              button.addEventListener(
                'click',
                () => {

                  window.dwitSelectedChildId =
                    button.dataset.childId || ''

                  alert(
                    'Child-linked lab reports will open from the Labs module.'
                  )

                }
              )

            }
          )


        return
      }

          // =================================================
      // CHILD VACCINATIONS
      // =================================================

      if (tab === 'child-vaccines') {

        const childId =
          window.dwitSelectedChildId || ''

        if (!childId) {

          target.innerHTML = `
            <div class="maternal-care-empty">

              <div class="maternal-care-empty-icon">
                👶
              </div>

              <h3>
                Select a child first
              </h3>

              <p>
                Open Children 0–6 and select a child
                to view vaccination records.
              </p>

            </div>
          `

          return
        }

        const result =
          await apiRequest(
            `/maternal/children/${encodeURIComponent(
              childId
            )}/immunizations?actor_id=${encodeURIComponent(
              getCurrentActorId()
            )}`
          )

        const vaccinations =
          result?.immunizations ||
          []

        const summary =
          result?.summary ||
          {
            total: 0,
            completed: 0,
            pending: 0,
            missed: 0
          }

        target.innerHTML = `

          <div class="maternal-module-header">

            <div>

              <div class="dashboard-kicker">
                CHILD IMMUNIZATION · 0–6 YEARS
              </div>

              <h3>
                Child Vaccination Tracker
              </h3>

              <p>
                Track vaccination records for the
                selected child.
              </p>

            </div>

            <button
              type="button"
              class="primary-action"
              id="addChildVaccineBtn"
            >
              + Record Vaccination
            </button>

          </div>


          <div class="child-care-summary">

            <div class="child-summary-card">
              <span>Total</span>
              <strong>
                ${summary.total}
              </strong>
            </div>

            <div class="child-summary-card">
              <span>Completed</span>
              <strong>
                ${summary.completed}
              </strong>
            </div>

            <div class="child-summary-card">
              <span>Pending</span>
              <strong>
                ${summary.pending}
              </strong>
            </div>

            <div class="child-summary-card">
              <span>Missed</span>
              <strong>
                ${summary.missed}
              </strong>
            </div>

          </div>


          <div class="child-vaccine-list">

            ${
              vaccinations.length
                ? vaccinations
                    .map(
                      vaccine => {

                        const status =
                          String(
                            vaccine.status ||
                            'Pending'
                          )

                        return `
                          <div
                            class="
                              child-vaccine-card
                              ${
                                status
                                  .toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    '-'
                                  )
                              }
                            "
                          >

                            <div
                              class="child-vaccine-icon"
                            >
                              💉
                            </div>

                            <div
                              class="child-vaccine-main"
                            >

                              <div
                                class="
                                  child-vaccine-top
                                "
                              >

                                <div>

                                  <strong>
                                    ${escapeHtml(
                                      vaccine.vaccine_name ||
                                      'Vaccine'
                                    )}
                                  </strong>

                                  <span>
                                    ${escapeHtml(
                                      vaccine.dose ||
                                      'Dose'
                                    )}
                                  </span>

                                </div>

                                <span
                                  class="
                                    maternal-status-pill
                                    ${
                                      status ===
                                      'Completed'
                                        ? 'done'
                                        : status ===
                                          'Missed'
                                          ? 'missed'
                                          : 'due'
                                    }
                                  "
                                >
                                  ${escapeHtml(
                                    status
                                  )}
                                </span>

                              </div>


                              <div
                                class="
                                  child-vaccine-details
                                "
                              >

                                ${
                                  vaccine.scheduled_date
                                    ? `
                                      <span>
                                        📅 Scheduled:
                                        ${escapeHtml(
                                          vaccine.scheduled_date
                                        )}
                                      </span>
                                    `
                                    : ''
                                }

                                ${
                                  vaccine.administered_date
                                    ? `
                                      <span>
                                        ✓ Administered:
                                        ${escapeHtml(
                                          vaccine.administered_date
                                        )}
                                      </span>
                                    `
                                    : ''
                                }

                                ${
                                  vaccine.notes
                                    ? `
                                      <span>
                                        📝
                                        ${escapeHtml(
                                          vaccine.notes
                                        )}
                                      </span>
                                    `
                                    : ''
                                }

                              </div>

                            </div>

                          </div>
                        `
                      }
                    )
                    .join('')
                : `
                  <div class="maternal-care-empty">

                    <div class="maternal-care-empty-icon">
                      💉
                    </div>

                    <h3>
                      No child vaccinations recorded
                    </h3>

                    <p>
                      Record the child's vaccination
                      history here.
                    </p>

                  </div>
                `
            }

          </div>


          <div
            id="childVaccineFormContainer"
            class="maternal-form-container"
            hidden
          ></div>

        `


        const addButton =
          document.querySelector(
            '#addChildVaccineBtn'
          )

        const formContainer =
          document.querySelector(
            '#childVaccineFormContainer'
          )


        addButton?.addEventListener(
          'click',
          () => {

            if (!formContainer) {
              return
            }

            formContainer.hidden = false

            formContainer.innerHTML = `

              <form
                id="childVaccineForm"
                class="maternal-record-form"
              >

                <div class="maternal-form-title">
                  Record Child Vaccination
                </div>


                <div class="maternal-form-grid">

                  <label>
                    Vaccine Name

                    <input
                      type="text"
                      name="vaccine_name"
                      placeholder="Vaccine name"
                      required
                    >

                  </label>


                  <label>
                    Dose

                    <input
                      type="text"
                      name="dose"
                      placeholder="Dose"
                      required
                    >

                  </label>


                  <label>
                    Scheduled Date

                    <input
                      type="date"
                      name="scheduled_date"
                    >

                  </label>


                  <label>
                    Administered Date

                    <input
                      type="date"
                      name="administered_date"
                    >

                  </label>


                  <label>
                    Status

                    <select name="status">

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Missed">
                        Missed
                      </option>

                      <option value="Not Due">
                        Not Due
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>

                    </select>

                  </label>

                </div>


                <label>
                  Notes

                  <textarea
                    name="notes"
                    rows="3"
                    placeholder="Optional notes"
                  ></textarea>

                </label>


                <div
                  class="maternal-form-actions"
                >

                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Save Vaccination
                  </button>

                  <button
                    type="button"
                    class="secondary-action"
                    id="cancelChildVaccineBtn"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            `


            document
              .querySelector(
                '#cancelChildVaccineBtn'
              )
              ?.addEventListener(
                'click',
                () => {

                  formContainer.hidden =
                    true

                  formContainer.innerHTML =
                    ''

                }
              )


            document
              .querySelector(
                '#childVaccineForm'
              )
              ?.addEventListener(
                'submit',
                async event => {

                  event.preventDefault()

                  const form =
                    event.currentTarget

                  const formData =
                    new FormData(form)

                  const payload = {

                    vaccine_name:
                      formData.get(
                        'vaccine_name'
                      ),

                    dose:
                      formData.get(
                        'dose'
                      ),

                    scheduled_date:
                      formData.get(
                        'scheduled_date'
                      ) || null,

                    administered_date:
                      formData.get(
                        'administered_date'
                      ) || null,

                    status:
                      formData.get(
                        'status'
                      ) || 'Pending',

                    notes:
                      formData.get(
                        'notes'
                      ) || null

                  }

                  const saveButton =
                    form.querySelector(
                      'button[type="submit"]'
                    )

                  if (saveButton) {

                    saveButton.disabled =
                      true

                    saveButton.textContent =
                      'Saving...'

                  }

                  try {

                    const saved =
                      await apiRequest(
                        `/maternal/children/${encodeURIComponent(
                          childId
                        )}/immunizations?actor_id=${encodeURIComponent(
                          getCurrentActorId()
                        )}`,
                        {
                          method: 'POST',

                          body:
                            JSON.stringify(
                              payload
                            )
                        }
                      )

                    if (
                      !saved ||
                      !saved.success
                    ) {
                      throw new Error(
                        saved?.message ||
                        'Unable to save vaccination.'
                      )
                    }

                    await loadMaternalCareTab(
                      patientId,
                      'child-vaccines'
                    )

                  } catch (error) {

                    console.error(
                      'Save child vaccination:',
                      error
                    )

                    alert(
                      error?.message ||
                      'Unable to save vaccination.'
                    )

                    if (saveButton) {

                      saveButton.disabled =
                        false

                      saveButton.textContent =
                        'Save Vaccination'

                    }

                  }

                }
              )

          }
        )

        return
      }


            // =================================================
      // CHILD GROWTH & HEALTH
      // =================================================

      if (tab === 'child-health') {

        const childId =
          window.dwitSelectedChildId || ''

        if (!childId) {

          target.innerHTML = `
            <div class="maternal-care-empty">

              <div class="maternal-care-empty-icon">
                👶
              </div>

              <h3>
                Select a child first
              </h3>

              <p>
                Open Children 0–6 and select a child
                to view growth and health records.
              </p>

            </div>
          `

          return
        }

        const result =
          await apiRequest(
            `/maternal/children/${encodeURIComponent(
              childId
            )}/health-visits?actor_id=${encodeURIComponent(
              getCurrentActorId()
            )}`
          )

        const visits =
          result?.visits ||
          []

        target.innerHTML = `

          <div class="maternal-module-header">

            <div>

              <div class="dashboard-kicker">
                CHILD HEALTH · 0–6 YEARS
              </div>

              <h3>
                Growth & Health
              </h3>

              <p>
                Track routine health visits,
                growth measurements and development notes.
              </p>

            </div>

            <button
              type="button"
              class="secondary-action"
              id="backToChildrenBtn"
            >
              ← Back to Children
            </button>

          </div>


          <div class="child-health-summary">

            <div class="child-summary-card">

              <span>
                Health Visits
              </span>

              <strong>
                ${visits.length}
              </strong>

            </div>

            <div class="child-summary-card">

              <span>
                Latest Weight
              </span>

              <strong>
                ${
                  visits[0]?.weight ||
                  'Not recorded'
                }
              </strong>

            </div>

            <div class="child-summary-card">

              <span>
                Latest Height
              </span>

              <strong>
                ${
                  visits[0]?.height ||
                  'Not recorded'
                }
              </strong>

            </div>

            <div class="child-summary-card">

              <span>
                Referral
              </span>

              <strong>
                ${
                  visits.some(
                    visit =>
                      visit.referral_required
                  )
                    ? 'Required'
                    : 'None recorded'
                }
              </strong>

            </div>

          </div>


          <div class="child-health-list">

            ${
              visits.length
                ? visits
                    .map(
                      visit => `

                        <div
                          class="child-health-card"
                        >

                          <div
                            class="child-health-icon"
                          >
                            📈
                          </div>

                          <div
                            class="child-health-main"
                          >

                            <div
                              class="child-health-top"
                            >

                              <div>

                                <strong>
                                  ${escapeHtml(
                                    visit.visit_type ||
                                    'Routine Visit'
                                  )}
                                </strong>

                                <span>
                                  ${escapeHtml(
                                    visit.visit_date ||
                                    'Date not recorded'
                                  )}
                                </span>

                              </div>

                              ${
                                visit.referral_required
                                  ? `
                                    <span
                                      class="
                                        maternal-status-pill
                                        missed
                                      "
                                    >
                                      Referral
                                    </span>
                                  `
                                  : `
                                    <span
                                      class="
                                        maternal-status-pill
                                        done
                                      "
                                    >
                                      Recorded
                                    </span>
                                  `
                              }

                            </div>


                            <div
                              class="child-health-measures"
                            >

                              ${
                                visit.weight
                                  ? `
                                    <span>
                                      ⚖ Weight:
                                      ${escapeHtml(
                                        visit.weight
                                      )}
                                    </span>
                                  `
                                  : ''
                              }

                              ${
                                visit.height
                                  ? `
                                    <span>
                                      📏 Height:
                                      ${escapeHtml(
                                        visit.height
                                      )}
                                    </span>
                                  `
                                  : ''
                              }

                            </div>


                            ${
                              visit.developmental_notes
                                ? `
                                  <div
                                    class="
                                      child-health-info-block
                                    "
                                  >

                                    <strong>
                                      Development
                                    </strong>

                                    <span>
                                      ${escapeHtml(
                                        visit.developmental_notes
                                      )}
                                    </span>

                                  </div>
                                `
                                : ''
                            }


                            ${
                              visit.findings
                                ? `
                                  <div
                                    class="
                                      child-health-info-block
                                    "
                                  >

                                    <strong>
                                      Findings
                                    </strong>

                                    <span>
                                      ${escapeHtml(
                                        visit.findings
                                      )}
                                    </span>

                                  </div>
                                `
                                : ''
                            }


                            ${
                              visit.notes
                                ? `
                                  <p
                                    class="child-health-notes"
                                  >
                                    ${escapeHtml(
                                      visit.notes
                                    )}
                                  </p>
                                `
                                : ''
                            }

                          </div>

                        </div>

                      `
                    )
                    .join('')
                : `
                  <div class="maternal-care-empty">

                    <div
                      class="maternal-care-empty-icon"
                    >
                      📈
                    </div>

                    <h3>
                      No health visits recorded
                    </h3>

                    <p>
                      Record the child's first
                      growth and health visit.
                    </p>

                  </div>
                `
            }

          </div>


          <div
            id="childHealthFormContainer"
            class="maternal-form-container"
            hidden
          ></div>

        `


        const backButton =
          document.querySelector(
            '#backToChildrenBtn'
          )

        backButton?.addEventListener(
          'click',
          async () => {

            await loadMaternalCareTab(
              patientId,
              'children'
            )

          }
        )


        const addButton =
          document.createElement('button')

        addButton.type =
          'button'

        addButton.className =
          'primary-action'

        addButton.textContent =
          '+ Record Health Visit'

        const moduleHeader =
          target.querySelector(
            '.maternal-module-header'
          )

        if (moduleHeader) {
          moduleHeader.appendChild(
            addButton
          )
        }


        const formContainer =
          document.querySelector(
            '#childHealthFormContainer'
          )


        addButton.addEventListener(
          'click',
          () => {

            if (!formContainer) {
              return
            }

            formContainer.hidden = false

            formContainer.innerHTML = `

              <form
                id="childHealthForm"
                class="maternal-record-form"
              >

                <div class="maternal-form-title">
                  Record Child Health Visit
                </div>


                <div class="maternal-form-grid">

                  <label>
                    Visit Date

                    <input
                      type="date"
                      name="visit_date"
                      required
                    >

                  </label>


                  <label>
                    Visit Type

                    <select name="visit_type">

                      <option value="Routine">
                        Routine
                      </option>

                      <option value="Growth Monitoring">
                        Growth Monitoring
                      </option>

                      <option value="Development Review">
                        Development Review
                      </option>

                      <option value="Illness Follow-up">
                        Illness Follow-up
                      </option>

                    </select>

                  </label>


                  <label>
                    Weight

                    <input
                      type="text"
                      name="weight"
                      placeholder="e.g. 8.5 kg"
                    >

                  </label>


                  <label>
                    Height

                    <input
                      type="text"
                      name="height"
                      placeholder="e.g. 72 cm"
                    >

                  </label>

                </div>


                <label>
                  Developmental Notes

                  <textarea
                    name="developmental_notes"
                    rows="3"
                    placeholder="Development observations"
                  ></textarea>

                </label>


                <label>
                  Findings

                  <textarea
                    name="findings"
                    rows="3"
                    placeholder="Health findings"
                  ></textarea>

                </label>


                <label>
                  Notes

                  <textarea
                    name="notes"
                    rows="2"
                    placeholder="Additional notes"
                  ></textarea>

                </label>


                <div
                  class="maternal-form-checks"
                >

                  <label>

                    <input
                      type="checkbox"
                      name="referral_required"
                    >

                    Referral required

                  </label>

                </div>


                <div
                  class="maternal-form-actions"
                >

                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Save Health Visit
                  </button>

                  <button
                    type="button"
                    class="secondary-action"
                    id="cancelChildHealthBtn"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            `


            document
              .querySelector(
                '#cancelChildHealthBtn'
              )
              ?.addEventListener(
                'click',
                () => {

                  formContainer.hidden =
                    true

                  formContainer.innerHTML =
                    ''

                }
              )


            document
              .querySelector(
                '#childHealthForm'
              )
              ?.addEventListener(
                'submit',
                async event => {

                  event.preventDefault()

                  const form =
                    event.currentTarget

                  const formData =
                    new FormData(form)

                  const payload = {

                    visit_date:
                      formData.get(
                        'visit_date'
                      ),

                    visit_type:
                      formData.get(
                        'visit_type'
                      ) ||
                      'Routine',

                    weight:
                      formData.get(
                        'weight'
                      ) || null,

                    height:
                      formData.get(
                        'height'
                      ) || null,

                    developmental_notes:
                      formData.get(
                        'developmental_notes'
                      ) || null,

                    findings:
                      formData.get(
                        'findings'
                      ) || null,

                    referral_required:
                      formData.get(
                        'referral_required'
                      ) === 'on',

                    notes:
                      formData.get(
                        'notes'
                      ) || null

                  }


                  const saveButton =
                    form.querySelector(
                      'button[type="submit"]'
                    )

                  if (saveButton) {

                    saveButton.disabled =
                      true

                    saveButton.textContent =
                      'Saving...'

                  }


                  try {

                    const saved =
                      await apiRequest(
                        `/maternal/children/${encodeURIComponent(
                          childId
                        )}/health-visits?actor_id=${encodeURIComponent(
                          getCurrentActorId()
                        )}`,
                        {
                          method: 'POST',

                          body:
                            JSON.stringify(
                              payload
                            )
                        }
                      )


                    if (
                      !saved ||
                      !saved.success
                    ) {

                      throw new Error(
                        saved?.message ||
                        'Unable to save health visit.'
                      )

                    }


                    await loadMaternalCareTab(
                      patientId,
                      'child-health'
                    )

                  } catch (error) {

                    console.error(
                      'Save child health visit:',
                      error
                    )

                    alert(
                      error?.message ||
                      'Unable to save health visit.'
                    )

                    if (saveButton) {

                      saveButton.disabled =
                        false

                      saveButton.textContent =
                        'Save Health Visit'

                    }

                  }

                }
              )

          }
        )

        return
      }


            // =================================================
      // FAMILY PLANNING
      // =================================================

      if (tab === 'family') {

        const result =
          await apiRequest(
            `/maternal/patients/${encodeURIComponent(
              patientId
            )}/family-planning?actor_id=${encodeURIComponent(
              getCurrentActorId()
            )}`
          )

        const records =
          result?.records ||
          []

        target.innerHTML = `

          <div class="maternal-module-header">

            <div>

              <div class="dashboard-kicker">
                FAMILY PLANNING
              </div>

              <h3>
                Family Planning & Counselling
              </h3>

              <p>
                Record counselling, follow-up and
                patient-selected family planning information.
              </p>

            </div>

            <button
              type="button"
              class="primary-action"
              id="addFamilyPlanningBtn"
            >
              + Record Counselling
            </button>

          </div>


          <div class="family-planning-summary">

            <div class="family-planning-stat">
              <span>Records</span>
              <strong>${records.length}</strong>
            </div>

            <div class="family-planning-stat">
              <span>Follow-up Due</span>
              <strong>
                ${
                  records.filter(
                    item =>
                      item.status ===
                      'Follow-up Due'
                  ).length
                }
              </strong>
            </div>

            <div class="family-planning-stat">
              <span>Completed</span>
              <strong>
                ${
                  records.filter(
                    item =>
                      item.status ===
                      'Completed'
                  ).length
                }
              </strong>
            </div>

            <div class="family-planning-stat">
              <span>Last Counselling</span>
              <strong>
                ${
                  records[0]?.counselling_date ||
                  'Not recorded'
                }
              </strong>
            </div>

          </div>


          <div class="family-planning-list">

            ${
              records.length
                ? records
                    .map(
                      record => `

                        <div
                          class="family-planning-card"
                        >

                          <div
                            class="family-planning-icon"
                          >
                            🤝
                          </div>

                          <div
                            class="family-planning-main"
                          >

                            <div
                              class="family-planning-top"
                            >

                              <div>

                                <strong>
                                  ${escapeHtml(
                                    record.method_selected ||
                                    'Counselling recorded'
                                  )}
                                </strong>

                                <span>
                                  ${escapeHtml(
                                    record.counselling_date ||
                                    'Date not recorded'
                                  )}
                                </span>

                              </div>

                              <span
                                class="
                                  maternal-status-pill
                                  ${
                                    record.status ===
                                    'Completed'
                                      ? 'done'
                                      : record.status ===
                                        'Follow-up Due'
                                        ? 'missed'
                                        : 'due'
                                  }
                                "
                              >
                                ${escapeHtml(
                                  record.status ||
                                  'Counselling'
                                )}
                              </span>

                            </div>


                            ${
                              record.methods_discussed
                                ? `
                                  <div
                                    class="
                                      family-planning-info
                                    "
                                  >

                                    <strong>
                                      Methods discussed
                                    </strong>

                                    <span>
                                      ${escapeHtml(
                                        record.methods_discussed
                                      )}
                                    </span>

                                  </div>
                                `
                                : ''
                            }


                            ${
                              record.follow_up_date
                                ? `
                                  <div
                                    class="
                                      family-planning-info
                                    "
                                  >

                                    <strong>
                                      Follow-up
                                    </strong>

                                    <span>
                                      ${escapeHtml(
                                        record.follow_up_date
                                      )}
                                    </span>

                                  </div>
                                `
                                : ''
                            }


                            ${
                              record.notes
                                ? `
                                  <p
                                    class="
                                      family-planning-notes
                                    "
                                  >
                                    ${escapeHtml(
                                      record.notes
                                    )}
                                  </p>
                                `
                                : ''
                            }

                          </div>

                        </div>

                      `
                    )
                    .join('')
                : `
                  <div class="maternal-care-empty">

                    <div
                      class="maternal-care-empty-icon"
                    >
                      🤝
                    </div>

                    <h3>
                      No family planning records
                    </h3>

                    <p>
                      Record counselling or follow-up
                      information here.
                    </p>

                  </div>
                `
            }

          </div>


          <div
            id="familyPlanningFormContainer"
            class="maternal-form-container"
            hidden
          ></div>

        `


        const addButton =
          document.querySelector(
            '#addFamilyPlanningBtn'
          )

        const formContainer =
          document.querySelector(
            '#familyPlanningFormContainer'
          )


        addButton?.addEventListener(
          'click',
          () => {

            if (!formContainer) {
              return
            }

            formContainer.hidden = false

            const pregnancyOptions =
              pregnancies
                .map(
                  item => `
                    <option value="${escapeHtml(
                      String(item.id)
                    )}">
                      Pregnancy #${escapeHtml(
                        String(
                          item.pregnancy_number
                        )
                      )}
                    </option>
                  `
                )
                .join('')


            formContainer.innerHTML = `

              <form
                id="familyPlanningForm"
                class="maternal-record-form"
              >

                <div class="maternal-form-title">
                  Record Family Planning Counselling
                </div>


                <div
                  class="maternal-form-grid"
                >

                  <label>
                    Pregnancy

                    <select
                      name="pregnancy_id"
                    >

                      <option value="">
                        General family planning
                      </option>

                      ${pregnancyOptions}

                    </select>

                  </label>


                  <label>
                    Counselling Date

                    <input
                      type="date"
                      name="counselling_date"
                    >

                  </label>


                  <label>
                    Follow-up Date

                    <input
                      type="date"
                      name="follow_up_date"
                    >

                  </label>


                  <label>
                    Status

                    <select
                      name="status"
                    >

                      <option value="Counselling">
                        Counselling
                      </option>

                      <option value="Method Selected">
                        Method Selected
                      </option>

                      <option value="Follow-up Due">
                        Follow-up Due
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Declined">
                        Declined
                      </option>

                      <option value="Deferred">
                        Deferred
                      </option>

                    </select>

                  </label>

                </div>


                <label>
                  Methods Discussed

                  <textarea
                    name="methods_discussed"
                    rows="3"
                    placeholder="Record what was discussed"
                  ></textarea>

                </label>


                <label>
                  Method Selected

                  <input
                    type="text"
                    name="method_selected"
                    placeholder="Record the patient's selected option, if applicable"
                  >

                </label>


                <label>
                  Notes

                  <textarea
                    name="notes"
                    rows="3"
                    placeholder="Additional counselling notes"
                  ></textarea>

                </label>


                <div
                  class="maternal-form-actions"
                >

                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Save Record
                  </button>

                  <button
                    type="button"
                    class="secondary-action"
                    id="cancelFamilyPlanningBtn"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            `


            document
              .querySelector(
                '#cancelFamilyPlanningBtn'
              )
              ?.addEventListener(
                'click',
                () => {

                  formContainer.hidden =
                    true

                  formContainer.innerHTML =
                    ''

                }
              )


            document
              .querySelector(
                '#familyPlanningForm'
              )
              ?.addEventListener(
                'submit',
                async event => {

                  event.preventDefault()

                  const form =
                    event.currentTarget

                  const formData =
                    new FormData(form)

                  const pregnancyValue =
                    formData.get(
                      'pregnancy_id'
                    )

                  const payload = {

                    pregnancy_id:
                      pregnancyValue
                        ? Number(
                            pregnancyValue
                          )
                        : null,

                    counselling_date:
                      formData.get(
                        'counselling_date'
                      ) || null,

                    methods_discussed:
                      formData.get(
                        'methods_discussed'
                      ) || null,

                    method_selected:
                      formData.get(
                        'method_selected'
                      ) || null,

                    follow_up_date:
                      formData.get(
                        'follow_up_date'
                      ) || null,

                    status:
                      formData.get(
                        'status'
                      ) ||
                      'Counselling',

                    notes:
                      formData.get(
                        'notes'
                      ) || null

                  }


                  const saveButton =
                    form.querySelector(
                      'button[type="submit"]'
                    )

                  if (saveButton) {

                    saveButton.disabled =
                      true

                    saveButton.textContent =
                      'Saving...'

                  }


                  try {

                    const saved =
                      await apiRequest(
                        `/maternal/patients/${encodeURIComponent(
                          patientId
                        )}/family-planning?actor_id=${encodeURIComponent(
                          getCurrentActorId()
                        )}`,
                        {
                          method: 'POST',

                          body:
                            JSON.stringify(
                              payload
                            )
                        }
                      )


                    if (
                      !saved ||
                      !saved.success
                    ) {

                      throw new Error(
                        saved?.message ||
                        'Unable to save family planning record.'
                      )

                    }


                    await loadMaternalCareTab(
                      patientId,
                      'family'
                    )

                  } catch (error) {

                    console.error(
                      'Save family planning:',
                      error
                    )

                    alert(
                      error?.message ||
                      'Unable to save family planning record.'
                    )

                    if (saveButton) {

                      saveButton.disabled =
                        false

                      saveButton.textContent =
                        'Save Record'

                    }

                  }

                }
              )

          }
        )

        return
      }

      // =================================================
      // GOVERNMENT SCHEMES
      // =================================================

      if (tab === 'schemes') {

        const result =
          await apiRequest(
            `/maternal/patients/${encodeURIComponent(
              patientId
            )}/schemes?actor_id=${encodeURIComponent(
              getCurrentActorId()
            )}`
          )

        const schemes =
          result?.schemes ||
          []

        const summary =
          result?.summary ||
          {
            total: 0,
            eligible: 0,
            applied: 0,
            approved: 0,
            benefit_received: 0,
            needs_action: 0
          }

        target.innerHTML = `

          <div class="maternal-module-header">

            <div>

              <div class="dashboard-kicker">
                GOVERNMENT BENEFITS
              </div>

              <h3>
                Government Schemes
              </h3>

              <p>
                Track eligibility, application progress,
                approvals and benefits for the mother.
              </p>

            </div>

            <button
              type="button"
              class="primary-action"
              id="addSchemeBtn"
            >
              + Add Scheme
            </button>

          </div>


          <div class="scheme-summary-grid">

            <div class="scheme-summary-card">
              <span>Total Records</span>
              <strong>
                ${summary.total}
              </strong>
            </div>

            <div class="scheme-summary-card">
              <span>Eligible</span>
              <strong>
                ${summary.eligible}
              </strong>
            </div>

            <div class="scheme-summary-card">
              <span>Approved</span>
              <strong>
                ${summary.approved}
              </strong>
            </div>

            <div class="scheme-summary-card">
              <span>Benefits Received</span>
              <strong>
                ${summary.benefit_received}
              </strong>
            </div>

            <div class="scheme-summary-card">
              <span>Needs Action</span>
              <strong>
                ${summary.needs_action}
              </strong>
            </div>

          </div>


          <div class="scheme-list">

            ${
              schemes.length
                ? schemes
                    .map(
                      scheme => {

                        const eligibility =
                          String(
                            scheme.eligibility_status ||
                            'To Verify'
                          )

                        const application =
                          String(
                            scheme.application_status ||
                            'Not Applied'
                          )

                        let statusClass =
                          'due'

                        if (
                          application ===
                          'Benefit Received'
                        ) {
                          statusClass = 'done'
                        } else if (
                          application ===
                          'Rejected'
                        ) {
                          statusClass = 'missed'
                        }

                        return `

                          <div
                            class="scheme-card"
                          >

                            <div class="scheme-icon">
                              🏛️
                            </div>


                            <div class="scheme-main">

                              <div
                                class="scheme-top"
                              >

                                <div>

                                  <strong>
                                    ${escapeHtml(
                                      scheme.scheme_name ||
                                      'Government Scheme'
                                    )}
                                  </strong>

                                  <span>
                                    Eligibility:
                                    ${escapeHtml(
                                      eligibility
                                    )}
                                  </span>

                                </div>

                                <span
                                  class="
                                    maternal-status-pill
                                    ${statusClass}
                                  "
                                >
                                  ${escapeHtml(
                                    application
                                  )}
                                </span>

                              </div>


                              <div
                                class="scheme-details"
                              >

                                ${
                                  scheme.application_date
                                    ? `
                                      <span>
                                        📝 Applied:
                                        ${escapeHtml(
                                          scheme.application_date
                                        )}
                                      </span>
                                    `
                                    : ''
                                }

                                ${
                                  scheme.approval_date
                                    ? `
                                      <span>
                                        ✓ Approved:
                                        ${escapeHtml(
                                          scheme.approval_date
                                        )}
                                      </span>
                                    `
                                    : ''
                                }

                                ${
                                  scheme.benefit_received_date
                                    ? `
                                      <span>
                                        💰 Benefit:
                                        ${escapeHtml(
                                          scheme.benefit_received_date
                                        )}
                                      </span>
                                    `
                                    : ''
                                }

                              </div>


                              ${
                                scheme.notes
                                  ? `
                                    <div
                                      class="scheme-notes"
                                    >
                                      ${escapeHtml(
                                        scheme.notes
                                      )}
                                    </div>
                                  `
                                  : ''
                              }

                            </div>

                          </div>

                        `
                      }
                    )
                    .join('')
                : `
                  <div class="maternal-care-empty">

                    <div class="maternal-care-empty-icon">
                      🏛️
                    </div>

                    <h3>
                      No scheme records
                    </h3>

                    <p>
                      Add a government scheme record
                      for this patient.
                    </p>

                  </div>
                `
            }

          </div>


          <div
            id="schemeFormContainer"
            class="maternal-form-container"
            hidden
          ></div>

        `


        const addButton =
          document.querySelector(
            '#addSchemeBtn'
          )

        const formContainer =
          document.querySelector(
            '#schemeFormContainer'
          )


        addButton?.addEventListener(
          'click',
          () => {

            if (!formContainer) {
              return
            }

            formContainer.hidden = false

            const pregnancyOptions =
              pregnancies
                .map(
                  item => `
                    <option
                      value="${escapeHtml(
                        String(item.id)
                      )}"
                    >
                      Pregnancy #${escapeHtml(
                        String(
                          item.pregnancy_number
                        )
                      )}
                    </option>
                  `
                )
                .join('')


            formContainer.innerHTML = `

              <form
                id="schemeForm"
                class="maternal-record-form"
              >

                <div class="maternal-form-title">
                  Add Government Scheme
                </div>


                <div
                  class="maternal-form-grid"
                >

                  <label>
                    Scheme Name

                    <input
                      type="text"
                      name="scheme_name"
                      placeholder="e.g. PMMVY"
                      required
                    >

                  </label>


                  <label>
                    Pregnancy

                    <select
                      name="pregnancy_id"
                    >

                      <option value="">
                        General record
                      </option>

                      ${pregnancyOptions}

                    </select>

                  </label>


                  <label>
                    Eligibility

                    <select
                      name="eligibility_status"
                    >

                      <option value="To Verify">
                        To Verify
                      </option>

                      <option value="Eligible">
                        Eligible
                      </option>

                      <option value="Under Review">
                        Under Review
                      </option>

                      <option value="Not Eligible">
                        Not Eligible
                      </option>

                    </select>

                  </label>


                  <label>
                    Application Status

                    <select
                      name="application_status"
                    >

                      <option value="Not Applied">
                        Not Applied
                      </option>

                      <option value="Application Started">
                        Application Started
                      </option>

                      <option value="Applied">
                        Applied
                      </option>

                      <option value="Approved">
                        Approved
                      </option>

                      <option value="Rejected">
                        Rejected
                      </option>

                      <option value="Benefit Received">
                        Benefit Received
                      </option>

                      <option value="Closed">
                        Closed
                      </option>

                    </select>

                  </label>


                  <label>
                    Application Date

                    <input
                      type="date"
                      name="application_date"
                    >

                  </label>


                  <label>
                    Approval Date

                    <input
                      type="date"
                      name="approval_date"
                    >

                  </label>


                  <label>
                    Benefit Received Date

                    <input
                      type="date"
                      name="benefit_received_date"
                    >

                  </label>

                </div>


                <label>
                  Notes

                  <textarea
                    name="notes"
                    rows="3"
                    placeholder="Additional scheme notes"
                  ></textarea>

                </label>


                <div
                  class="maternal-form-actions"
                >

                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Save Scheme
                  </button>

                  <button
                    type="button"
                    class="secondary-action"
                    id="cancelSchemeBtn"
                  >
                    Cancel
                  </button>

                </div>

              </form>

            `


            document
              .querySelector(
                '#cancelSchemeBtn'
              )
              ?.addEventListener(
                'click',
                () => {

                  formContainer.hidden =
                    true

                  formContainer.innerHTML =
                    ''

                }
              )


            document
              .querySelector(
                '#schemeForm'
              )
              ?.addEventListener(
                'submit',
                async event => {

                  event.preventDefault()

                  const form =
                    event.currentTarget

                  const formData =
                    new FormData(form)

                  const pregnancyValue =
                    formData.get(
                      'pregnancy_id'
                    )

                  const payload = {

                    pregnancy_id:
                      pregnancyValue
                        ? Number(
                            pregnancyValue
                          )
                        : null,

                    scheme_name:
                      formData.get(
                        'scheme_name'
                      ),

                    eligibility_status:
                      formData.get(
                        'eligibility_status'
                      ) ||
                      'To Verify',

                    application_status:
                      formData.get(
                        'application_status'
                      ) ||
                      'Not Applied',

                    application_date:
                      formData.get(
                        'application_date'
                      ) || null,

                    approval_date:
                      formData.get(
                        'approval_date'
                      ) || null,

                    benefit_received_date:
                      formData.get(
                        'benefit_received_date'
                      ) || null,

                    notes:
                      formData.get(
                        'notes'
                      ) || null

                  }


                  const saveButton =
                    form.querySelector(
                      'button[type="submit"]'
                    )

                  if (saveButton) {

                    saveButton.disabled =
                      true

                    saveButton.textContent =
                      'Saving...'

                  }


                  try {

                    const saved =
                      await apiRequest(
                        `/maternal/patients/${encodeURIComponent(
                          patientId
                        )}/schemes?actor_id=${encodeURIComponent(
                          getCurrentActorId()
                        )}`,
                        {
                          method: 'POST',

                          body:
                            JSON.stringify(
                              payload
                            )
                        }
                      )


                    if (
                      !saved ||
                      !saved.success
                    ) {

                      throw new Error(
                        saved?.message ||
                        'Unable to save scheme.'
                      )

                    }


                    await loadMaternalCareTab(
                      patientId,
                      'schemes'
                    )

                  } catch (error) {

                    console.error(
                      'Save government scheme:',
                      error
                    )

                    alert(
                      error?.message ||
                      'Unable to save scheme.'
                    )

                    if (saveButton) {

                      saveButton.disabled =
                        false

                      saveButton.textContent =
                        'Save Scheme'

                    }

                  }

                }
              )

          }
        )

        return
      }

      // =================================================
      // OTHER TABS — TEMPORARY HANDOFF
      // =================================================

      const labels = {
        home: 'ASHA Home Visits',
        vaccines: 'Vaccinations',
        labs: 'Lab Reports',
        delivery: 'Delivery',
        postnatal: 'Postnatal Care',
        children: 'Children 0–6',
        family: 'Family Planning',
        schemes: 'Government Schemes'
      }

      target.innerHTML = `
        <div class="maternal-care-empty">

          <div class="maternal-care-empty-icon">
            🔧
          </div>

          <h3>
            ${escapeHtml(
              labels[tab] || tab
            )}
          </h3>

          <p>
            This module is connected to the DWIT
            backend and will be built next.
          </p>

        </div>
      `

    } catch (error) {

      console.error(
        'Maternal care tab:',
        error
      )

      target.innerHTML = `
        <div class="maternal-care-empty">

          <div class="maternal-care-empty-icon">
            ⚠️
          </div>

          <h3>
            Unable to load this module
          </h3>

          <p>
            ${escapeHtml(
              error?.message ||
              'Please try again.'
            )}
          </p>

        </div>
      `
    }
  }

  function wireMaternalPatientActions(
    patientId
  ) {

    document
  .querySelector(
    '#maternalBackToSearchBtn'
  )
  ?.addEventListener(
    'click',
    () => {

      const content =
        document.querySelector(
          '#maternalCareContent'
        )

      const searchInput =
        document.querySelector(
          '#maternalPatientSearch'
        )

      const resultsBox =
        document.querySelector(
          '#maternalPatientResults'
        )

      if (content) {
        content.innerHTML = `
          <div class="maternal-care-empty">

            <div class="maternal-care-empty-icon">
              👩‍🍼
            </div>

            <h3>
              Select a patient
            </h3>

            <p>
              Search for a patient to open their
              maternal and child care journey.
            </p>

          </div>
        `
      }

      if (searchInput) {
        searchInput.value = ''
        searchInput.focus()
      }

      if (resultsBox) {
        resultsBox.innerHTML = ''
      }

const maternalContent =
  document.querySelector(
    '#maternalCareContent'
  )

maternalContent?.scrollTo({
  top: 0,
  behavior: 'smooth'
})

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })

    }
  )

    document
      .querySelector(
        '#maternalAddPregnancyBtn'
      )
      ?.addEventListener(
        'click',
        () => {

         const existingForm =
  document.querySelector(
    '#maternalPregnancyFormOverlay'
  )

if (existingForm) {
  existingForm.remove()
}

const formOverlay =
  document.createElement('div')

formOverlay.id =
  'maternalPregnancyFormOverlay'

formOverlay.className =
  'maternal-form-overlay'

formOverlay.innerHTML = `
  <div class="maternal-form-modal">

    <div class="maternal-form-modal-header">

      <div>
        <div class="dashboard-kicker">
          MATERNAL & CHILD CARE
        </div>

        <h3>
          Register Pregnancy
        </h3>

        <p>
          Pregnancy registration can only be completed
          by an authorized ASHA worker or doctor.
        </p>
      </div>

      <button
        type="button"
        class="modal close-btn"
        id="closeMaternalPregnancyForm"
      >
        ×
      </button>

    </div>

    <form
      id="maternalPregnancyForm"
      class="maternal-record-form"
    >

      <div class="maternal-form-grid">

        <label>
          LMP Date
          <input
            type="date"
            name="lmp_date"
            required
          >
        </label>

        <label>
          Expected Delivery Date
          <input
            type="date"
            name="edd_date"
          >
        </label>

        <label>
          Mother's Blood Group
          <input
            type="text"
            name="mother_blood_group"
            placeholder="e.g. O+"
          >
        </label>

        <label>
          Partner Blood Group
          <span class="maternal-field-optional">
            Optional
          </span>
          <input
            type="text"
            name="partner_blood_group"
            placeholder="e.g. O+"
          >
        </label>

        <label>
          Assigned ASHA User ID
          <input
            type="text"
            name="assigned_asha_user_id"
            placeholder="ASHA user ID"
          >
        </label>

        <label>
          Risk Status
          <select name="risk_status">
            <option value="Low Risk">
              Low Risk
            </option>

            <option value="High Risk">
              High Risk
            </option>

            <option value="Under Review">
              Under Review
            </option>
          </select>
        </label>

      </div>

      <label>
        Notes
        <textarea
          name="notes"
          rows="3"
          placeholder="Additional clinical notes"
        ></textarea>
      </label>

      <div class="maternal-rh-info">
        <strong>Clinical review:</strong>
        If the recorded blood groups indicate a possible
        Rh-related concern, DWIT will flag the record
        for clinician review.
      </div>

      <div class="maternal-form-actions">

        <button
          type="submit"
          class="primary-action"
        >
          Register Pregnancy
        </button>

        <button
          type="button"
          class="secondary-action"
          id="cancelMaternalPregnancyForm"
        >
          Cancel
        </button>

      </div>

    </form>

  </div>
`

document.body.appendChild(
  formOverlay
)

document
  .querySelector(
    '#closeMaternalPregnancyForm'
  )
  ?.addEventListener(
    'click',
    () => formOverlay.remove()
  )

document
  .querySelector(
    '#cancelMaternalPregnancyForm'
  )
  ?.addEventListener(
    'click',
    () => formOverlay.remove()
  )

document
  .querySelector(
    '#maternalPregnancyForm'
  )
  ?.addEventListener(
    'submit',
    async event => {

      event.preventDefault()

      const form =
        event.currentTarget

      const formData =
        new FormData(form)

      const payload = {

        patient_id: patientId,

        lmp_date:
          formData.get('lmp_date') ||
          null,

        edd_date:
          formData.get('edd_date') ||
          null,

        mother_blood_group:
          formData.get(
            'mother_blood_group'
          ) || null,

        partner_blood_group:
          formData.get(
            'partner_blood_group'
          ) || null,

        assigned_asha_user_id:
          formData.get(
            'assigned_asha_user_id'
          ) || null,

        risk_status:
          formData.get(
            'risk_status'
          ) || 'Low Risk',

        notes:
          formData.get('notes') ||
          null
      }

      const submitButton =
        form.querySelector(
          'button[type="submit"]'
        )

      if (submitButton) {
        submitButton.disabled = true
        submitButton.textContent =
          'Registering...'
      }

      try {

        const result =
          await apiRequest(
           `/maternal/pregnancies?actor_id=${encodeURIComponent(
  getCurrentActorId()
)}`,
            {
              method: 'POST',

              body:
                JSON.stringify(
                  payload
                )
            }
          )

        if (
          !result ||
          !result.success
        ) {
          throw new Error(
            result?.message ||
            'Unable to register pregnancy.'
          )
        }

        formOverlay.remove()

        await loadMaternalPatient(
          patientId
        )

      } catch (error) {

        console.error(
          'Pregnancy registration:',
          error
        )

        alert(
          error?.message ||
          'Unable to register pregnancy.'
        )

        if (submitButton) {
          submitButton.disabled = false
          submitButton.textContent =
            'Register Pregnancy'
        }

      }

    }
  )

        }
      )

    document
      .querySelectorAll(
        '.maternal-care-tab'
      )
      .forEach(
        button => {

          button.addEventListener(
            'click',
            async () => {

              document
                .querySelectorAll(
                  '.maternal-care-tab'
                )
                .forEach(
                  item =>
                    item.classList.remove(
                      'active'
                    )
                )

              button.classList.add(
                'active'
              )

              const tab =
                button.dataset.maternalTab

              const target =
                document.querySelector(
                  '#maternalTabContent'
                )

              if (target) {

               await loadMaternalCareTab(
  patientId,
  tab
)

              }

            }
          )

        }
      )

    document
      .querySelectorAll(
        '.maternal-tab-jump'
      )
      .forEach(
        button => {

          button.addEventListener(
            'click',
            () => {

              const targetTab =
                button.dataset.jumpTab

              const tabButton =
                document.querySelector(
                  `.maternal-care-tab[data-maternal-tab="${targetTab}"]`
                )

              tabButton?.click()

            }
          )

        }
      )
  }
function getCurrentActorId() {
  return userId || ''
}
  searchButton?.addEventListener(
    'click',
    searchMaternalPatients
  )

  searchInput?.addEventListener(
    'keydown',
    event => {

      if (event.key === 'Enter') {
        searchMaternalPatients()
      }

    }
  )
}


  async function openAppointmentsCenter() {



    const existing = document.querySelector('#appointmentsCenterOverlay')
    if (existing) existing.remove()

    const overlay = document.createElement('div')
    overlay.id = 'appointmentsCenterOverlay'
    overlay.className = 'appointments-center-overlay'
    overlay.innerHTML = `
      <div class="appointments-center-modal">
        <div class="appointments-center-head">
          <div>
            <div class="dashboard-kicker">DWIT (Don't worry I'm there) · CARE COORDINATION</div>
            <h2>Appointment Center</h2>
            <p>Book, view and manage real appointments linked to the patient record.</p>
          </div>
          <button type="button" class="modal-close-btn" id="closeAppointmentsCenter">×</button>
        </div>

        <div class="appointments-center-grid">
          <section class="dashboard-card">
            <div class="card-heading">${isAsha ? 'Book for a Patient' : 'Today / Upcoming Appointments'}</div>
            ${isAsha ? `
              <form id="appointmentBookingForm" class="appointment-form">
                <label>Patient
                  <select id="appointmentPatient" required>
                    <option value="">Select patient</option>
                    ${patients.map(p => `<option value="${escapeHtml(p.patient_id)}">${escapeHtml(p.name)} · ${escapeHtml(p.patient_id)}</option>`).join('')}
                  </select>
                </label>
                <label>Doctor
                  <select id="appointmentDoctor" required>
                    <option value="">Loading doctors…</option>
                  </select>
                </label>
                <div class="appointment-doctor-meta" id="appointmentDoctorMeta">Select a doctor to see availability.</div>
                <div class="appointment-two-col">
                  <label>Date<input id="appointmentDate" type="date" required></label>
                  <label>Time<input id="appointmentTime" type="time" required></label>
                </div>
                <label>Reason
                  <textarea id="appointmentReason" rows="3" placeholder="Reason for appointment"></textarea>
                </label>
                <button class="primary-action" type="submit">Book Appointment</button>
              </form>
            ` : `
              <div id="doctorAppointmentList" class="appointment-list">Loading appointments…</div>
            `}
          </section>

          <section class="dashboard-card">
            <div class="card-heading">${isAsha ? 'Upcoming Appointments' : 'My Availability'}</div>
            ${isAsha ? `
              <div id="staffAppointmentList" class="appointment-list">Loading appointments…</div>
            ` : `
              <form id="doctorAvailabilityForm" class="appointment-form">
                <label>Status
                  <select id="doctorAvailabilityStatus">
                    <option>Available</option>
                    <option>Busy</option>
                    <option>Unavailable</option>
                    <option>On Leave</option>
                    <option>Emergency Only</option>
                  </select>
                </label>
                <label>Specialty<input id="doctorAvailabilitySpecialty" value="General Medicine"></label>
                <label>Working Days<input id="doctorAvailabilityDays" value="Mon,Tue,Wed,Thu,Fri"></label>
                <div class="appointment-two-col">
                  <label>Start<input id="doctorAvailabilityStart" type="time" value="09:00"></label>
                  <label>End<input id="doctorAvailabilityEnd" type="time" value="17:00"></label>
                </div>
                <button class="primary-action" type="submit">Save Availability</button>
                <div class="appointment-doctor-meta" id="availabilitySaveMessage"></div>
              </form>
            `}
          </section>
        </div>
      </div>
    `

    document.body.appendChild(overlay)



    
    document.querySelector('#closeAppointmentsCenter')?.addEventListener('click', () => overlay.remove())
    overlay.addEventListener('click', event => { if (event.target === overlay) overlay.remove() })

    try {
      const doctorsData = await apiGet(`/doctors?facility_id=${encodeURIComponent(sessionUser.facility_id || '')}`)
      const doctors = doctorsData.doctors || []

      if (isAsha) {
        const doctorSelect = document.querySelector('#appointmentDoctor')
        doctorSelect.innerHTML = `<option value="">Select doctor</option>` + doctors.map(d => `
          <option value="${escapeHtml(d.user_id)}">${escapeHtml(d.name)} · ${escapeHtml(d.specialty)} · ${escapeHtml(d.availability_status)}</option>
        `).join('')

        const doctorMeta = document.querySelector('#appointmentDoctorMeta')
        doctorSelect.addEventListener('change', () => {
          const d = doctors.find(item => item.user_id === doctorSelect.value)
          if (!d) { doctorMeta.textContent = 'Select a doctor to see availability.'; return }
          doctorMeta.textContent = `${d.specialty} · ${d.availability_status} · ${d.working_days} · ${d.start_time}–${d.end_time} · ${d.facility_name || 'Assigned Facility'}`
        })

        document.querySelector('#appointmentBookingForm')?.addEventListener('submit', async event => {
          event.preventDefault()
          const payload = {
            patient_id: document.querySelector('#appointmentPatient').value,
            doctor_user_id: doctorSelect.value,
            appointment_date: document.querySelector('#appointmentDate').value,
            appointment_time: document.querySelector('#appointmentTime').value,
            reason: document.querySelector('#appointmentReason').value.trim()
          }
          try {
            const created = await apiRequest(`/appointments?booked_by=${encodeURIComponent(userId)}&source_role=asha`, {
              method: 'POST',
              body: JSON.stringify(payload)
            })
            alert(`Appointment booked for ${created.appointment.appointment_date} at ${created.appointment.appointment_time}.`)
            await refreshStaffAppointmentList()
          } catch (error) {
            alert(error.message || 'Unable to book appointment.')
          }
        })

        await refreshStaffAppointmentList()
      } else {
        const availability = await apiGet(`/doctors/${encodeURIComponent(userId)}/availability`)
        const a = availability.availability
        document.querySelector('#doctorAvailabilityStatus').value = a.status || 'Available'
        document.querySelector('#doctorAvailabilitySpecialty').value = a.specialty || 'General Medicine'
        document.querySelector('#doctorAvailabilityDays').value = a.working_days || 'Mon,Tue,Wed,Thu,Fri'
        document.querySelector('#doctorAvailabilityStart').value = a.start_time || '09:00'
        document.querySelector('#doctorAvailabilityEnd').value = a.end_time || '17:00'

        document.querySelector('#doctorAvailabilityForm')?.addEventListener('submit', async event => {
          event.preventDefault()
          try {
            await apiRequest(`/doctors/${encodeURIComponent(userId)}/availability`, {
              method: 'PUT',
              body: JSON.stringify({
                status: document.querySelector('#doctorAvailabilityStatus').value,
                specialty: document.querySelector('#doctorAvailabilitySpecialty').value.trim(),
                working_days: document.querySelector('#doctorAvailabilityDays').value.trim(),
                start_time: document.querySelector('#doctorAvailabilityStart').value,
                end_time: document.querySelector('#doctorAvailabilityEnd').value
              })
            })
            document.querySelector('#availabilitySaveMessage').textContent = 'Availability saved.'
          } catch (error) {
            document.querySelector('#availabilitySaveMessage').textContent = error.message || 'Unable to save availability.'
          }
        })
        await refreshStaffAppointmentList()
      }
    } catch (error) {
      const target = document.querySelector('#staffAppointmentList, #doctorAppointmentList')
      if (target) target.innerHTML = `<div class="empty-records">${escapeHtml(error.message || 'Unable to load appointments.')}</div>`
    }
  }

  async function refreshStaffAppointmentList() {
    const target = document.querySelector(isAsha ? '#staffAppointmentList' : '#doctorAppointmentList')
    if (!target) return
    try {
      const data = await apiGet(`/staff/${encodeURIComponent(userId)}/appointments`)
      const items = data.appointments || []
      if (!items.length) {
        target.innerHTML = '<div class="empty-records">No appointments found.</div>'
        return
      }
      target.innerHTML = items.map(item => `
        <div class="appointment-item">
          <div class="appointment-item-main">
            <strong>${escapeHtml(item.patient_name || item.patient_id)}</strong>
            <span>${escapeHtml(item.patient_id)} · ${escapeHtml(item.doctor_name || item.doctor || 'Doctor')}</span>
            <small>${escapeHtml(item.appointment_date)} · ${escapeHtml(item.appointment_time)}${item.reason ? ` · ${escapeHtml(item.reason)}` : ''}</small>
          </div>
          <div class="appointment-item-side">
            <span class="appointment-status status-${String(item.status || '').toLowerCase().replaceAll(' ', '-')}">${escapeHtml(item.status || 'Upcoming')}</span>
            <button type="button" class="secondary-action small-action cancel-appointment-btn" data-appointment-id="${item.id}">Cancel</button>
          </div>
        </div>
      `).join('')

      target.querySelectorAll('.cancel-appointment-btn').forEach(button => {
        button.addEventListener('click', async () => {
          if (!confirm('Cancel this appointment?')) return
          try {
            await apiRequest(`/appointments/${encodeURIComponent(button.dataset.appointmentId)}?booked_by=${encodeURIComponent(userId)}`, {
              method: 'PATCH',
              body: JSON.stringify({ status: 'Cancelled' })
            })
            await refreshStaffAppointmentList()
          } catch (error) {
            alert(error.message || 'Unable to cancel appointment.')
          }
        })
      })
    } catch (error) {
      target.innerHTML = `<div class="empty-records">${escapeHtml(error.message || 'Unable to load appointments.')}</div>`
    }
  }

  function renderWorkspace() {

    async function startQrScanner() {
  if (typeof Html5Qrcode === 'undefined') {
    alert('QR scanner is unavailable. Please refresh the page.')
    return
  }

  const modal = document.createElement('div')

  modal.className = 'qr-scanner-modal'

  modal.innerHTML = `
    <div class="qr-scanner-backdrop"></div>

    <div class="qr-scanner-card">

      <button
        type="button"
        class="qr-scanner-close"
        id="closeQrScanner"
        aria-label="Close QR scanner"
      >
        ×
      </button>

      <div class="qr-modal-kicker">
        DWIT · PATIENT IDENTIFICATION
      </div>

      <h2>Scan Patient QR</h2>

      <p>
        Point the camera at the patient's DWIT QR code.
      </p>

      <div
        id="qr-reader"
        class="qr-reader"
      ></div>

      <div
        id="qr-scan-status"
        class="qr-scan-status"
      >
        Waiting for camera...
      </div>

    </div>
  `

  document.body.appendChild(modal)

  const scanner = new Html5Qrcode('qr-reader')

  let closed = false

  const cleanup = async () => {
    if (closed) return

    closed = true

    try {
      await scanner.stop()
    } catch {}

    try {
      await scanner.clear()
    } catch {}

    modal.remove()
  }

  document
    .querySelector('#closeQrScanner')
    ?.addEventListener('click', cleanup)

  document
    .querySelector('.qr-scanner-backdrop')
    ?.addEventListener('click', cleanup)

  const status =
    document.querySelector('#qr-scan-status')

  try {
    await scanner.start(
      {
        facingMode: 'environment'
      },
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250
        }
      },
      async decodedText => {

        const value =
          String(decodedText || '').trim()

        if (!value.startsWith('DWIT:')) {
          if (status) {
            status.textContent =
              'Invalid DWIT QR code.'
          }

          return
        }

        const patientId =
          value.slice(5).trim()

        if (!patientId) {
          if (status) {
            status.textContent =
              'Patient ID not found in QR code.'
          }

          return
        }

        if (status) {
          status.textContent =
            `Patient found: ${patientId}`
        }

        try {
          await scanner.stop()
        } catch {}

        try {
          await scanner.clear()
        } catch {}

        modal.remove()

        await openPatient(patientId)
      },
      () => {
        // Camera is scanning.
      }
    )

    if (status) {
      status.textContent =
        'Camera ready — point it at the patient QR.'
    }

  } catch (error) {
    console.error('QR scanner error:', error)

    if (status) {
      status.textContent =
        'Unable to access camera. Please allow camera permission.'
    }
  }
}

    const needsReview =
      patients.filter(
        patient =>
          [
            'Needs Review',
            'Urgent'
          ].includes(
            patient.health_status
          )
      ).length


    const pending =
      referrals.filter(
        referral =>
          ![
            'Completed',
            'Rejected'
          ].includes(
            referral.status
          )
      ).length


    app.innerHTML = `

      <div class="dashboard-page">


        <div class="dashboard-header">

          <div>

            <div class="dashboard-kicker">
              DWIT (Don't worry I'm there) · SECURE CARE NETWORK
            </div>

            <h1>
              ${
                isAsha
                  ? 'ASHA Worker Portal'
                  : 'Medical Officer Portal'
              }
            </h1>

            <p>
              ${escapeHtml(
                facilityName
              )}
            </p>

          </div>


          <button
            class="logout-btn"
            id="logoutBtn"
            type="button"
          >
            Logout
          </button>

        </div>


        <div class="dashboard-stats">


          <div class="dashboard-stat">

            <span>
              Authorized Patients
            </span>

            <strong>
              ${patients.length}
            </strong>

          </div>


          <div class="dashboard-stat">

            <span>
              Needs Review
            </span>

            <strong>
              ${needsReview}
            </strong>

          </div>


          <div class="dashboard-stat">

            <span>
              ${
                isAsha
                  ? 'Field Workflow'
                  : 'Referral Queue'
              }
            </span>

            <strong>
              ${
                isAsha
                  ? 'Ready'
                  : pending
              }
            </strong>

          </div>


        </div>


       <div class="staff-quick-actions">

  <button
    type="button"
    class="secondary-action quick-action"
    id="openAppointmentsCenterBtn"
  >
    📅 ${isAsha ? 'Appointments' : 'Appointments & Availability'}
  </button>

  <button
    type="button"
    class="secondary-action quick-action maternal-care-launch"
    id="openMaternalCareBtn"
  >
    👩‍🍼 Maternal & Child Care
  </button>

  ${isAsha ? `
    <div class="quick-action-note">
      Book a doctor slot for an authorized patient
      and track upcoming appointments.
    </div>
  ` : `
    <div class="quick-action-note">
      Set your availability and manage your appointment queue.
    </div>
  `}

</div>

        <div class="staff-workspace">
<section class="dashboard-card medicine-inventory-card">

  <div class="card-heading">
    💊 Medicine Inventory
  </div>

  <p class="dashboard-description">
    Real-time medicine availability across your facility.
  </p>

  ${
    inventory.length
      ? `
        <div class="inventory-grid">

          ${inventory.map(item => {

            const statusClass =
              item.status === 'Available'
                ? 'inventory-available'
                : item.status === 'Low Stock'
                  ? 'inventory-low'
                  : 'inventory-out'

            return `
              <div class="inventory-item">

                <div class="inventory-item-top">

                  <div>
                    <strong class="inventory-medicine-name">
                      ${escapeHtml(item.medicine_name)}
                    </strong>

                    <span class="inventory-category">
                      ${escapeHtml(item.category || 'General')}
                    </span>
                  </div>

                  <span class="inventory-status ${statusClass}">
                    ${escapeHtml(item.status)}
                  </span>

                </div>

                <div class="inventory-stock-row">

                  <span>
                    Stock
                  </span>

                  <strong>
                    ${escapeHtml(String(item.stock_quantity))}
                    ${escapeHtml(item.unit || 'units')}
                  </strong>

                </div>

                <div class="inventory-stock-row">

                  <span>
                    Minimum level
                  </span>

                  <span>
                    ${escapeHtml(String(item.minimum_stock))}
                  </span>

                </div>

              </div>
            `
          }).join('')}

        </div>
      `
      : `
        <div class="empty-records">
          No medicine inventory available.
        </div>
      `
  }

</section>
<section class="dashboard-card diagnostics-availability-card">

  <div class="card-heading">
    🧪 Diagnostics Availability
  </div>

  <p class="dashboard-description">
    Check which diagnostic services are available at your facility.
  </p>

  ${
    diagnostics.length
      ? `
        <div class="diagnostics-grid">

          ${diagnostics.map(item => {

            const statusClass =
              item.status === 'Available'
                ? 'diagnostic-available'
                : item.status === 'Limited'
                  ? 'diagnostic-limited'
                  : 'diagnostic-unavailable'

            return `
              <div class="diagnostic-item">

                <div class="diagnostic-top">

                  <div>
                    <strong class="diagnostic-test-name">
                      ${escapeHtml(
                        item.test_name ||
                        'Diagnostic Test'
                      )}
                    </strong>

                    <span class="diagnostic-category">
                      ${escapeHtml(
                        item.category ||
                        'General'
                      )}
                    </span>
                  </div>

                  <span class="diagnostic-status ${statusClass}">
                    ${escapeHtml(
                      item.status ||
                      'Unknown'
                    )}
                  </span>

                </div>

                <div class="diagnostic-facility">
                  ${escapeHtml(
                    item.facility_name ||
                    facilityName ||
                    'Assigned Facility'
                  )}
                </div>

              </div>
            `
          }).join('')}

        </div>
      `
      : `
        <div class="empty-records">
          No diagnostic availability data found.
        </div>
      `
  }

</section>
          <section
            class="dashboard-card staff-main-card"
          >

            <div class="card-heading">

              ${
                isAsha
                  ? 'Identify Patient'
                  : 'Patient Queue'
              }

            </div>


            ${
              isAsha
                ? `

                  <div class="nfc-panel">


                    <div class="nfc-icon">
                      📳
                    </div>


                    <div class="nfc-copy">

                      <h3>
                        NFC Patient Identification
                      </h3>

                      <p>
                        Tap a patient NFC card on a compatible phone.
                      </p>

                    </div>


                    <button
                      type="button"
                      class="primary-action"
                      id="scanNfcBtn"
                    >
                      Scan NFC
                    </button>

                  </div>


                  <div class="search-divider">
                    <span>OR</span>
                  </div>

                `
                : ''
            }

            <div class="qr-scan-panel">

  <div class="qr-scan-icon">
    ▣
  </div>

  <div class="qr-scan-copy">
    <div class="card-kicker">
      QUICK IDENTIFICATION
    </div>

    <h3>
      QR Patient Identification
    </h3>

    <p>
      Scan the patient's DWIT QR code using this device's camera.
    </p>
  </div>

  <button
    type="button"
    class="primary-action"
    id="scanQrBtn"
  >
    Scan Patient QR
  </button>

</div>

<div class="search-divider">
  <span>OR</span>
</div>

<div class="register-patient-panel">

  <div class="register-patient-copy">
    <h3>New Patient Registration</h3>

    <p>
      Create a new patient record and automatically
      generate a unique Patient ID.
    </p>
  </div>

  ${
    isAsha
      ? `
        <button
          type="button"
          class="secondary-action"
          id="registerPatientBtn"
        >
          + Register New Patient
        </button>
      `
      : ''
  }

</div>

<div
  id="registerPatientFormWrap"
  style="display:none;"
>
  <form
    id="newPatientForm"
    class="action-card"
  >

    <div class="card-heading">
      Register New Patient
    </div>

    <div class="form-grid">

      <label>
        Patient Name
        <input
          type="text"
          id="newPatientName"
          required
          placeholder="Enter full name"
        />
      </label>

      <label>
        Age
        <input
          type="number"
          id="newPatientAge"
          min="0"
          max="120"
          placeholder="Age"
        />
      </label>

      <label>
        Gender
        <select id="newPatientGender">
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <label>
        Phone
        <input
          type="tel"
          id="newPatientPhone"
          placeholder="Phone number"
        />
      </label>

      <label>
        Village
        <input
          type="text"
          id="newPatientVillage"
          placeholder="Village"
        />
      </label>

      <label>
        Blood Group
        <select id="newPatientBloodGroup">
          <option value="">Select</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
      </label>

      <label>
        Initial Health Status
        <select id="newPatientHealthStatus">
          <option value="Stable">Stable</option>
          <option value="Needs Review">Needs Review</option>
          <option value="Critical">Critical</option>
        </select>
      </label>

    </div>

    <div class="form-actions">

      <button
        type="submit"
        class="primary-action"
      >
        Create Patient ID
      </button>

      <button
        type="button"
        class="secondary-action"
        id="cancelRegisterPatient"
      >
        Cancel
      </button>

    </div>

  </form>
</div>

            <div class="patient-search">


              <input
                id="staffPatientSearch"
                type="search"
                placeholder="Search Patient ID, name or village..."
                autocomplete="off"
              />


              <button
                type="button"
                class="primary-action"
                id="searchPatientBtn"
              >
                Search
              </button>


            </div>


            <div
              id="patientSearchResults"
              class="staff-patient-list"
            >

              ${renderPatientList(
                patients
              )}

            </div>


          </section>


          ${
            isAsha
              ? `

                <section class="dashboard-card">

                  <div class="card-heading">
                    Field Workflow
                  </div>


                  <div class="workflow-list">


                    <div class="workflow-step">

                      <strong>
                        01
                      </strong>

                      <span>
                        Identify patient using NFC, QR or Patient ID.
                      </span>

                    </div>


                    <div class="workflow-step">

                      <strong>
                        02
                      </strong>

                      <span>
                        Review previous care information.
                      </span>

                    </div>


                    <div class="workflow-step">

                      <strong>
                        03
                      </strong>

                      <span>
                        Record vitals and field observations.
                      </span>

                    </div>


                    <div class="workflow-step">

                      <strong>
                        04
                      </strong>

                      <span>
                        Create a referral when higher care is required.
                      </span>

                    </div>


                  </div>

                </section>

              `
              : `

                <section class="dashboard-card">


                  <div class="card-heading">
                    Referral Queue
                  </div>


                  <div class="referral-list">


                    ${
                      referrals.length

                        ? referrals
                            .map(
                              referral => `

                                <button
                                  type="button"
                                  class="referral-item"
                                  data-patient-id="${escapeHtml(
                                    referral.patient_id ||
                                    ''
                                  )}"
                                >


                                  <div>

                                    <strong>
                                      ${escapeHtml(
                                        referral.patient_name ||
                                        referral.patient_id ||
                                        'Patient'
                                      )}
                                    </strong>


                                    <span>
                                      ${escapeHtml(
                                        referral.from_facility_name ||
                                        referral.from_facility ||
                                        'Referral'
                                      )}
                                    </span>


                                    <small>
                                      ${escapeHtml(
                                        referral.reason ||
                                        'No reason provided'
                                      )}
                                    </small>

                                  </div>


                                  <div class="referral-meta">

                                    <span>
                                      ${escapeHtml(
                                        referral.priority ||
                                        'Normal'
                                      )}
                                    </span>

                                    <span>
                                      ${escapeHtml(
                                        referral.status ||
                                        'Pending'
                                      )}
                                    </span>

                                  </div>

                                </button>

                              `
                            )
                            .join('')

                        : `

                          <div class="empty-records">
                            No referrals assigned to this facility.
                          </div>

                        `
                    }


                  </div>

                </section>

              `
          }


        </div>

      </div>

    `


    attachLogout()


    const search =
      document.querySelector(
        '#staffPatientSearch'
      )


    const results =
      document.querySelector(
        '#patientSearchResults'
      )


    const runSearch =
      () => {

        results.innerHTML =
          renderPatientList(
            filteredPatients(
              search.value
            )
          )

        attachPatientButtons()
      }


    document
      .querySelector(
        '#searchPatientBtn'
      )
      ?.addEventListener(
        'click',
        runSearch
      )


    search?.addEventListener(
      'keydown',
      event => {

        if (
          event.key ===
          'Enter'
        ) {

          runSearch()

        }

      }
    )


    search?.addEventListener(
      'input',
      () => {

        if (
          !search.value.trim()
        ) {

          runSearch()

        }

      }
    )


    document
      .querySelector(
        '#scanNfcBtn'
      )
      ?.addEventListener(
        'click',
        startNfcScan
      )

      document
  .querySelector(
    '#scanQrBtn'
  )
  ?.addEventListener(
    'click',
    startQrScanner
  )

    attachPatientButtons()

    document.querySelector('#openAppointmentsCenterBtn')?.addEventListener('click', openAppointmentsCenter)

document
  .querySelector('#openMaternalCareBtn')
  ?.addEventListener(
    'click',
    () => {
      openMaternalChildCareCenter()
    }
  )

    document
  .querySelector(
    '#registerPatientBtn'
  )
  ?.addEventListener(
    'click',
    () => {

      const formWrap =
        document.querySelector(
          '#registerPatientFormWrap'
        )

      if (formWrap) {
        formWrap.style.display =
          formWrap.style.display === 'none'
            ? 'block'
            : 'none'
      }

    }
  )


document
  .querySelector(
    '#cancelRegisterPatient'
  )
  ?.addEventListener(
    'click',
    () => {

      const formWrap =
        document.querySelector(
          '#registerPatientFormWrap'
        )

      const form =
        document.querySelector(
          '#newPatientForm'
        )

      if (formWrap) {
        formWrap.style.display = 'none'
      }

      form?.reset()

    }
  )


document
  .querySelector(
    '#newPatientForm'
  )
  ?.addEventListener(
    'submit',
    async event => {

      event.preventDefault()

      const payload = {
        name:
          document.querySelector(
            '#newPatientName'
          ).value.trim(),

        age:
          document.querySelector(
            '#newPatientAge'
          ).value
            ? Number(
                document.querySelector(
                  '#newPatientAge'
                ).value
              )
            : null,

        gender:
          document.querySelector(
            '#newPatientGender'
          ).value,

        phone:
          document.querySelector(
            '#newPatientPhone'
          ).value.trim(),

        village:
          document.querySelector(
            '#newPatientVillage'
          ).value.trim(),

        blood_group:
          document.querySelector(
            '#newPatientBloodGroup'
          ).value,

        health_status:
          document.querySelector(
            '#newPatientHealthStatus'
          ).value
      }


      if (!payload.name) {
        alert(
          'Please enter the patient name.'
        )

        return
      }


      try {

        const response =
          await fetch(
            `${API_URL}/staff/${encodeURIComponent(
              userId
            )}/patients/register`,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify(
                  payload
                )
            }
          )


        const result =
          await response.json()


        if (!response.ok) {

          throw new Error(
            result.detail ||
            result.message ||
            'Unable to register patient.'
          )

        }


        const newPatient =
          result.patient


    const patientId = newPatient.patient_id

alert(
  `Patient registered successfully!\n\n` +
  `Patient ID: ${patientId}\n` +
  `Name: ${newPatient.name}`
)

const writeToNfc =
  confirm(
    `Patient ${patientId} has been created.\n\n` +
    `Do you want to write ${patientId} to an NFC card now?`
  )

if (writeToNfc) {
  await writePatientToNfc(patientId)
}


        patients =
          await loadPatients()


        renderWorkspace()

      } catch (error) {

        console.error(
          error
        )

        alert(
          error.message ||
          'Unable to register patient.'
        )

      }

    }
  )


    document
      .querySelectorAll(
        '.referral-item'
      )
      .forEach(item => {

        item.addEventListener(
          'click',
          () => {

            const patientId =
              item.dataset.patientId


            if (
              patientId
            ) {

              openPatient(
                patientId
              )

            }

          }
        )

      })
  }


  function attachPatientButtons() {

    document
      .querySelectorAll(
        '.view-patient-btn'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          event => {

            event.stopPropagation()


            openPatient(
              button.dataset.patientId
            )

          }
        )

      })
  }


  async function openPatient(
    patientId
  ) {

    try {

      currentPatient =
        await loadPatient(
          patientId
        )


      currentVisits =
        await loadVisits(
          patientId
        )


      renderPatientView()

    } catch (error) {

      console.error(error)


      alert(
        error.message ||
        'Unable to open this patient.'
      )
    }
  }




/* =========================================================
   PATIENT WORKSPACE ENHANCEMENT
   Keeps the existing data/actions but groups them into a
   focused patient workspace instead of a scattered page.
========================================================= */
function enhancePatientWorkspace(isAsha) {

  const page = document.querySelector('.dashboard-page')
  const recordGrid = page?.querySelector('.patient-record-grid')

  if (!page || !recordGrid || page.dataset.workspaceEnhanced === 'true') {
    return
  }

  page.dataset.workspaceEnhanced = 'true'

  const cards = Array.from(recordGrid.children)
  const profileCard = cards[0] || null
  const visitsCard = cards[1] || null
  const timelineCard = cards[2] || null

  const actionCards = Array.from(
    page.querySelectorAll('.dashboard-card.action-card')
  )

  const workspace = document.createElement('section')
  workspace.className = 'patient-workspace'

  const nav = document.createElement('div')
  nav.className = 'patient-workspace-nav'
  nav.setAttribute('role', 'tablist')
  nav.setAttribute('aria-label', 'Patient record sections')

  const panes = new Map()

  function addPane(key, label, nodes) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'patient-workspace-tab'
    button.dataset.tab = key
    button.setAttribute('role', 'tab')
    button.textContent = label

    const pane = document.createElement('div')
    pane.className = 'patient-workspace-pane'
    pane.dataset.pane = key
    pane.setAttribute('role', 'tabpanel')

    nodes.filter(Boolean).forEach(node => pane.appendChild(node))

    if (!nodes.some(Boolean)) {
      const empty = document.createElement('div')
      empty.className = 'patient-workspace-empty'
      empty.textContent = 'No information available yet.'
      pane.appendChild(empty)
    }

    nav.appendChild(button)
    workspace.appendChild(pane)
    panes.set(key, pane)
  }

  addPane('overview', 'Overview', [profileCard])
  addPane('visits', 'Visits', [visitsCard])
  addPane('timeline', 'Journey', [timelineCard])
  addPane('actions', isAsha ? 'Care Actions' : 'Clinical Review', actionCards)

  recordGrid.replaceWith(workspace)

  const directCards = Array.from(
    page.querySelectorAll(':scope > .dashboard-card.action-card')
  )
  directCards.forEach(card => {
    if (card.parentElement === page) {
      card.remove()
    }
  })

  workspace.insertBefore(nav, workspace.firstChild)

  function activate(key) {
    nav.querySelectorAll('.patient-workspace-tab').forEach(button => {
      const active = button.dataset.tab === key
      button.classList.toggle('active', active)
      button.setAttribute('aria-selected', String(active))
      button.tabIndex = active ? 0 : -1
    })

    panes.forEach((pane, paneKey) => {
      pane.classList.toggle('active', paneKey === key)
    })
  }

  nav.querySelectorAll('.patient-workspace-tab').forEach(button => {
    button.addEventListener('click', () => activate(button.dataset.tab))
  })

  activate('overview')

  // Allow left/right arrow navigation between tabs without changing the
  // existing desktop/mobile navigation model.
  nav.addEventListener('keydown', event => {
    const tabs = Array.from(nav.querySelectorAll('.patient-workspace-tab'))
    const index = tabs.indexOf(document.activeElement)
    if (index < 0) return

    let nextIndex = index
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
    if (nextIndex !== index) {
      event.preventDefault()
      tabs[nextIndex].focus()
      activate(tabs[nextIndex].dataset.tab)
    }
  })
}


  function renderPatientView() {

    const patient =
      currentPatient


    if (!patient) {
      return
    }


    app.innerHTML = `

      <div class="dashboard-page">


        <div class="dashboard-header">


          <div>


            <button
              type="button"
              class="back-btn"
              id="backToWorkspace"
            >
              ← Back
            </button>


            <div class="dashboard-kicker">
              DWIT (Don't worry I'm there) · AUTHORIZED PATIENT RECORD
            </div>


            <h1>
              ${escapeHtml(
                patient.name ||
                'Patient'
              )}
            </h1>


            <p>

              ${escapeHtml(
                patient.patient_id ||
                ''
              )}

              ·

              ${escapeHtml(
                patient.facility_name ||
                facilityName
              )}

            </p>


          </div>


          <button
            class="logout-btn"
            id="logoutBtn"
            type="button"
          >
            Logout
          </button>


        </div>


        <div class="patient-record-grid">


          <section class="dashboard-card">


            <div class="card-heading">
              Patient Profile
            </div>


            <div class="profile-grid">


              <div>
                <span>Patient ID</span>
                <strong>
                  ${escapeHtml(
                    patient.patient_id ||
                    '—'
                  )}
                </strong>
              </div>


              <div>
                <span>Name</span>
                <strong>
                  ${escapeHtml(
                    patient.name ||
                    '—'
                  )}
                </strong>
              </div>


              <div>
                <span>Age</span>
                <strong>
                  ${escapeHtml(
                    patient.age ??
                    '—'
                  )}
                </strong>
              </div>


              <div>
                <span>Gender</span>
                <strong>
                  ${escapeHtml(
                    patient.gender ||
                    '—'
                  )}
                </strong>
              </div>


              <div>
                <span>Village</span>
                <strong>
                  ${escapeHtml(
                    patient.village ||
                    '—'
                  )}
                </strong>
              </div>


              <div>
                <span>Blood Group</span>
                <strong>
                  ${escapeHtml(
                    patient.blood_group ||
                    '—'
                  )}
                </strong>
              </div>


              <div>
                <span>Phone</span>
                <strong>
                  ${escapeHtml(
                    patient.phone ||
                    '—'
                  )}
                </strong>
              </div>


              <div>
                <span>Status</span>
                <strong>
                  ${escapeHtml(
                    patient.health_status ||
                    'Stable'
                  )}
                </strong>
              </div>


            </div>


          </section>


          <section class="dashboard-card">


            <div class="card-heading">
              Recent Visits
            </div>


            ${renderRecords(
              currentVisits,
              'Visit'
            )}


          </section>
          <section class="dashboard-card">

  <div class="card-heading">
    Visit Timeline
  </div>

 ${renderVisitTimeline(
  currentVisits
)}

</section>


        </div>


        ${
          isAsha

            ? `

              <section
                class="dashboard-card action-card"
              >


                <div class="card-heading">
                  Record Field Visit
                </div>


                <form id="visitForm">


                  <div class="form-grid">


                    <div class="field-group">

                      <label
                        for="visitSymptoms"
                      >
                        Symptoms
                      </label>


                      <textarea
                        id="visitSymptoms"
                        rows="3"
                        placeholder="Describe symptoms..."
                      ></textarea>


                    </div>


                    <div class="field-group">

                      <label
                        for="visitTemperature"
                      >
                        Temperature
                      </label>


                      <input
                        id="visitTemperature"
                        placeholder="99.2 F"
                      />

                    </div>


                    <div class="field-group">

                      <label
                        for="visitBP"
                      >
                        Blood Pressure
                      </label>


                      <input
                        id="visitBP"
                        placeholder="118/76"
                      />

                    </div>


                    <div class="field-group">

                      <label
                        for="visitPulse"
                      >
                        Pulse
                      </label>


                      <input
                        id="visitPulse"
                        placeholder="78"
                      />

                    </div>


                    <div class="field-group">

                      <label
                        for="visitSpo2"
                      >
                        SpO₂
                      </label>


                      <input
                        id="visitSpo2"
                        placeholder="98"
                      />

                    </div>


                    <div class="field-group">

                      <label
                        for="visitTriage"
                      >
                        Triage
                      </label>


                      <select
                        id="visitTriage"
                      >

                        <option value="Normal">
                          Normal
                        </option>

                        <option value="Review">
                          Needs Review
                        </option>

                        <option value="Urgent">
                          Urgent
                        </option>

                      </select>


                    </div>


                  </div>


                  <div class="field-group">

                    <label
                      for="visitNotes"
                    >
                      ASHA Notes
                    </label>


                    <textarea
                      id="visitNotes"
                      rows="4"
                      placeholder="Additional observations..."
                    ></textarea>

                  </div>

                                    <div class="ai-assessment-panel" id="aiAssessmentPanel">

                    <div class="ai-assessment-header">

                      <div>
                        <div class="ai-assessment-kicker">
                          AI-ASSISTED ASSESSMENT
                        </div>

                        <h3>
                          Smart Triage
                        </h3>

                        <p>
                          Analyze the recorded symptoms and vitals
                          before saving the visit.
                        </p>
                      </div>

                      <button
                        type="button"
                        class="secondary-action"
                        id="runAIAssessmentBtn"
                      >
                        Run AI Assessment
                      </button>

                    </div>

                    <div
                      id="aiAssessmentResult"
                      class="ai-assessment-result"
                      hidden
                    >

                      <div class="ai-result-summary">

                        <div class="ai-result-item">
                          <span>Priority</span>
                          <strong id="aiPriority">—</strong>
                        </div>

                        <div class="ai-result-item">
                          <span>Care Level</span>
                          <strong id="aiCareLevel">—</strong>
                        </div>

                        <div class="ai-result-item">
                          <span>Human Review</span>
                          <strong id="aiHumanReview">—</strong>
                        </div>

                      </div>

                      <div class="ai-result-block">
                        <h4>Why</h4>
                        <ul id="aiReasons"></ul>
                      </div>

                      <div class="ai-result-block">
                        <h4>Next Action</h4>
                        <p id="aiNextAction">—</p>
                      </div>

                      <div class="ai-result-disclaimer">
                        Decision-support only. This assessment does not
                        provide an autonomous diagnosis or treatment
                        recommendation.
                      </div>

                    </div>

                  </div>


                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Save Visit
                  </button>


                </form>


              </section>


              <section
                class="dashboard-card action-card"
              >


                <div class="card-heading">
                  Create Referral
                </div>


                <form id="referralForm">


                  <div class="form-grid">


                    <div class="field-group">

                      <label
                        for="referralFacility"
                      >
                        Destination Facility
                      </label>


                      <select
                        id="referralFacility"
                      >

                        <option value="">
                          Select destination
                        </option>


                        ${referralFacilities
                          .map(
                            item => `

                              <option
                                value="${item.id}"
                              >
                                ${item.name}
                              </option>

                            `
                          )
                          .join('')}


                      </select>


                    </div>


                    <div class="field-group">

                      <label
                        for="referralPriority"
                      >
                        Priority
                      </label>


                      <select
                        id="referralPriority"
                      >

                        <option value="Normal">
                          Normal
                        </option>

                        <option value="High">
                          High
                        </option>

                        <option value="Urgent">
                          Urgent
                        </option>

                      </select>


                    </div>


                  </div>


                  <div class="field-group">

                    <label
                      for="referralReason"
                    >
                      Reason
                    </label>


                    <textarea
                      id="referralReason"
                      rows="4"
                      placeholder="Explain the reason for referral..."
                    ></textarea>

                  </div>


                  <button
                    type="submit"
                    class="primary-action"
                  >
                    Create Referral
                  </button>


                </form>


              </section>


            `

            : `

              <section
                class="dashboard-card action-card"
              >


                <div class="card-heading">
                  Medical Officer Review
                </div>


                <div class="doctor-review-summary">


                  <div>

                    <span>
                      Access scope
                    </span>

                    <strong>
                      ${escapeHtml(
                        facilityName
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Record source
                    </span>

                    <strong>
                      ${escapeHtml(
                        patient.facility_name ||
                        'Authorized care context'
                      )}
                    </strong>

                  </div>


                </div>


                <div class="doctor-note">

                  This record is shown because this medical officer
                  is authorized for the facility or an active referral.

                </div>


                ${renderDoctorActions(
                  patient
                )}


              </section>

            `
        }


      </div>

    `


    attachLogout()

    enhancePatientWorkspace(isAsha)

    document
      .querySelector(
        '#backToWorkspace'
      )
      ?.addEventListener(
        'click',
        renderWorkspace
      )


    document
      .querySelector(
        '#visitForm'
      )
      ?.addEventListener(
        'submit',
        saveVisit
      )

      document
  .querySelector(
    '#runAIAssessmentBtn'
  )
  ?.addEventListener(
    'click',
    runAIAssessment
  )

     document
  .querySelector(
    '#doctorConsultationForm'
  )
  ?.addEventListener(
    'submit',
    async event => {

      event.preventDefault()

      if (!currentPatient?.patient_id) {
        alert('No patient selected.')
        return
      }

      const form =
        event.currentTarget

      const button =
        form.querySelector(
          'button[type="submit"]'
        )

      const diagnosis =
        document.querySelector(
          '#doctorDiagnosis'
        )?.value.trim() || ''

      const consultationNotes =
        document.querySelector(
          '#doctorConsultationNotes'
        )?.value.trim() || ''

      const medicine =
        document.querySelector(
          '#doctorMedicine'
        )?.value.trim() || ''

      const dosage =
        document.querySelector(
          '#doctorDosage'
        )?.value.trim() || ''

      const frequency =
        document.querySelector(
          '#doctorFrequency'
        )?.value.trim() || ''

      const duration =
        document.querySelector(
          '#doctorDuration'
        )?.value.trim() || ''

    const inventoryMatch =
      inventory.find(item => {
        const entered =
          medicine.toLowerCase().trim()

        const stockName =
          item.medicine_name
            .toLowerCase()
            .trim()

        return (
          stockName === entered ||
          stockName.includes(entered) ||
          entered.includes(stockName)
        )
      })

    if (medicine && inventory.length) {
      if (!inventoryMatch) {
        const proceed =
          confirm(
            `Medicine "${medicine}" is not listed in this facility's inventory.\n\n` +
            `Do you want to continue with the prescription anyway?`
          )

        if (!proceed) {
          return
        }
      } else if (
        inventoryMatch.status ===
        'Out of Stock'
      ) {
        const proceed =
          confirm(
            `⚠ ${inventoryMatch.medicine_name} is OUT OF STOCK.\n\n` +
            `Current stock: 0 ${inventoryMatch.unit}\n\n` +
            `The prescription can still be recorded.\n` +
            `Continue?`
          )

        if (!proceed) {
          return
        }
      } else if (
        inventoryMatch.status ===
        'Low Stock'
      ) {
        const proceed =
          confirm(
            `⚠ ${inventoryMatch.medicine_name} is LOW STOCK.\n\n` +
            `Current stock: ${inventoryMatch.stock_quantity} ${inventoryMatch.unit}\n` +
            `Minimum level: ${inventoryMatch.minimum_stock}\n\n` +
            `Continue with the prescription?`
          )

        if (!proceed) {
          return
        }
      }
    }

      const followUp =
        document.querySelector(
          '#doctorFollowUp'
        )?.value.trim() || ''

      if (
        !diagnosis &&
        !consultationNotes
      ) {
        alert(
          'Please enter a diagnosis or consultation note.'
        )
        return
      }

      const hasPrescription =
        Boolean(
          medicine ||
          dosage ||
          frequency ||
          duration
        )

      if (
        hasPrescription &&
        (
          !medicine ||
          !dosage ||
          !frequency ||
          !duration
        )
      ) {
        alert(
          'Please complete medicine, dosage, frequency, and duration.'
        )
        return
      }

      button.disabled = true
      button.textContent = 'Saving...'

      try {

        await apiRequest(
          `/doctor/${encodeURIComponent(
            userId
          )}/patients/${encodeURIComponent(
            currentPatient.patient_id
          )}/consultation`,
          {
            method: 'POST',

            body: JSON.stringify({
              patient_id:
                currentPatient.patient_id,

              diagnosis,

              consultation_notes:
                consultationNotes,

              medicine,

              dosage,

              frequency,

              duration,

              follow_up:
                followUp
            })
          }
        )

        if (medicine) {

          await apiRequest(
            `/doctor/${encodeURIComponent(
              userId
            )}/patients/${encodeURIComponent(
              currentPatient.patient_id
            )}/prescription`,
            {
              method: 'POST',

              body: JSON.stringify({
                patient_id:
                  currentPatient.patient_id,

                medicine,

                dosage,

                frequency,

                duration
              })
            }
          )
        }

        alert(
          medicine
            ? 'Consultation and prescription saved successfully.'
            : 'Consultation saved successfully.'
        )

        currentVisits =
          await loadVisits(
            currentPatient.patient_id
          )

        currentPatient =
          await loadPatient(
            currentPatient.patient_id
          )

        renderPatientView()

      } catch (error) {

        console.error(error)

        alert(
          error.message ||
          'Unable to save consultation.'
        )

      } finally {

        button.disabled = false
        button.textContent =
          'Save Consultation'

      }
    }
  )

    document
      .querySelector(
        '#referralForm'
      )
      ?.addEventListener(
        'submit',
        saveReferral
      )


    document
      .querySelectorAll(
        '[data-referral-status]'
      )
      .forEach(
        button => {

          button.addEventListener(
            'click',
            () =>
              updateReferralStatus(
                button.dataset.referralStatus
              )
          )

        }
      )
  }


  function renderDoctorActions(
  patient
) {

  const referral =
    referrals.find(
      item =>
        String(
          item.patient_id
        ) ===
        String(
          patient.patient_id
        )
    )

  return `

    <section class="action-card">

      <div class="card-heading">
        Doctor Consultation & Prescription
      </div>

      <p class="doctor-note">
        Record the medical officer consultation, diagnosis,
        follow-up plan, and prescription for this patient.
      </p>

      <form id="doctorConsultationForm">

        <div class="form-grid">

          <div class="field-group">

            <label for="doctorDiagnosis">
              Diagnosis
            </label>

            <input
              id="doctorDiagnosis"
              type="text"
              placeholder="Enter diagnosis"
            />

          </div>


          <div class="field-group">

            <label for="doctorFollowUp">
              Follow-up
            </label>

            <input
              id="doctorFollowUp"
              type="text"
              placeholder="e.g. Review after 7 days"
            />

          </div>


          <div class="field-group">

            <label for="doctorMedicine">
              Medicine
            </label>

            <input
              id="doctorMedicine"
              type="text"
              placeholder="Medicine name"
            />

          </div>


          <div class="field-group">

            <label for="doctorDosage">
              Dosage
            </label>

            <input
              id="doctorDosage"
              type="text"
              placeholder="e.g. 500 mg"
            />

          </div>


          <div class="field-group">

            <label for="doctorFrequency">
              Frequency
            </label>

            <input
              id="doctorFrequency"
              type="text"
              placeholder="e.g. Twice daily"
            />

          </div>


          <div class="field-group">

            <label for="doctorDuration">
              Duration
            </label>

            <input
              id="doctorDuration"
              type="text"
              placeholder="e.g. 5 days"
            />

          </div>

        </div>


        <div class="field-group">

          <label for="doctorConsultationNotes">
            Consultation Notes
          </label>

          <textarea
            id="doctorConsultationNotes"
            rows="5"
            placeholder="Clinical observations, treatment advice, and instructions..."
          ></textarea>

        </div>


        <button
          type="submit"
          class="primary-action"
        >
          Save Consultation
        </button>

      </form>

    </section>


    ${
      referral
        ? `

          <section class="action-card">

            <div class="card-heading">
              Referral Management
            </div>


            <div class="referral-detail">

              <strong>
                Referral:
              </strong>

              ${escapeHtml(
                referral.reason ||
                'Clinical referral'
              )}

              ·

              <strong>
                Priority:
              </strong>

              ${escapeHtml(
                referral.priority ||
                'Normal'
              )}

              ·

              <strong>
                Status:
              </strong>

              ${escapeHtml(
                referral.status ||
                'Pending'
              )}

            </div>


            <div class="action-row">

              <button
                type="button"
                class="secondary-action"
                data-referral-status="Accepted"
              >
                Accept Referral
              </button>


              <button
                type="button"
                class="primary-action"
                data-referral-status="In Progress"
              >
                Mark In Progress
              </button>


              <button
                type="button"
                class="secondary-action"
                data-referral-status="Completed"
              >
                Complete Referral
              </button>

            </div>

          </section>

        `
        : `

          <div class="empty-records">
            No referral action is currently linked to this patient.
          </div>

        `
    }

  `
}


  async function updateReferralStatus(
    status
  ) {

    const referral =
      referrals.find(
        item =>
          String(
            item.patient_id
          ) ===
          String(
            currentPatient?.patient_id
          )
      )


    if (!referral?.id) {

      alert(
        'No referral ID available for this patient.'
      )

      return
    }


    try {

      const data =
       await apiRequest(
  `/staff/${encodeURIComponent(
    userId
  )}/referrals/${encodeURIComponent(
    referral.id
  )}/status?status=${encodeURIComponent(
    status
  )}`,
  {
    method: 'POST'
  }
)

      if (
        data?.success === false
      ) {

        throw new Error(
          data.message ||
          data.detail ||
          'Unable to update referral status.'
        )
      }


      const index =
        referrals.findIndex(
          item =>
            String(item.id) ===
            String(referral.id)
        )


      if (
        index >= 0
      ) {

        referrals[index].status =
          status

      }


      alert(
        `Referral marked ${status}.`
      )


      renderPatientView()

    } catch (error) {

      alert(
        error.message ||
        'Unable to update referral status.'
      )
    }
  }
 
  async function runAIAssessment() {

  if (!currentPatient?.patient_id) {
    alert('No patient selected.')
    return
  }

  const button =
    document.querySelector(
      '#runAIAssessmentBtn'
    )

  const resultPanel =
    document.querySelector(
      '#aiAssessmentResult'
    )

  try {

    button.disabled = true
    button.textContent =
      'Analyzing...'

    const payload = {
      patient_id:
        currentPatient.patient_id,

      symptoms:
        document.querySelector(
          '#visitSymptoms'
        )?.value.trim() || '',

      temperature:
        document.querySelector(
          '#visitTemperature'
        )?.value.trim() || '',

      blood_pressure:
        document.querySelector(
          '#visitBP'
        )?.value.trim() || '',

      pulse:
        document.querySelector(
          '#visitPulse'
        )?.value.trim() || '',

      spo2:
        document.querySelector(
          '#visitSpo2'
        )?.value.trim() || '',

      notes:
        document.querySelector(
          '#visitNotes'
        )?.value.trim() || ''
    }

    const data =
      await apiRequest(
        '/ai/assessment',
        {
          method: 'POST',

          body:
            JSON.stringify(
              payload
            )
        }
      )

    if (
      data?.success === false
    ) {
      throw new Error(
        data.message ||
        data.detail ||
        'AI assessment failed.'
      )
    }

    const assessment =
      data.assessment

    document.querySelector(
      '#aiPriority'
    ).textContent =
      assessment.priority ||
      '—'

    document.querySelector(
      '#aiCareLevel'
    ).textContent =
      assessment.care_level ||
      '—'

    document.querySelector(
      '#aiHumanReview'
    ).textContent =
      assessment.human_review_required
        ? 'Required'
        : 'Not required'

    const reasons =
      document.querySelector(
        '#aiReasons'
      )

    reasons.innerHTML =
      (
        assessment.explanation ||
        []
      )
        .map(
          reason =>
            `<li>${escapeHtml(
              reason
            )}</li>`
        )
        .join('')

    document.querySelector(
      '#aiNextAction'
    ).textContent =
      assessment.next_action ||
      '—'

    resultPanel.hidden =
      false

  } catch (error) {

    console.error(
      'AI assessment error:',
      error
    )

    alert(
      error.message ||
      'Unable to run AI assessment.'
    )

  } finally {

    button.disabled =
      false

    button.textContent =
      'Run AI Assessment'
  }
}

  async function saveVisit(
    event
  ) {

    event.preventDefault()


    const button =
      event.target.querySelector(
        'button[type="submit"]'
      )


    button.disabled = true
    button.textContent =
      'Saving...'


    try {

      const payload = {

        patient_id:
          currentPatient.patient_id,

        symptoms:
          document.querySelector(
            '#visitSymptoms'
          )?.value.trim() || '',

        temperature:
          document.querySelector(
            '#visitTemperature'
          )?.value.trim() || '',

        blood_pressure:
          document.querySelector(
            '#visitBP'
          )?.value.trim() || '',

        pulse:
          document.querySelector(
            '#visitPulse'
          )?.value.trim() || '',

        spo2:
          document.querySelector(
            '#visitSpo2'
          )?.value.trim() || '',

        notes:
          document.querySelector(
            '#visitNotes'
          )?.value.trim() || '',

        triage_status:
          document.querySelector(
            '#visitTriage'
          )?.value ||
          'Normal'

      }


    if (!navigator.onLine) {

  const pendingVisits =
    JSON.parse(
      localStorage.getItem(
        'sihgpt_pending_visits'
      ) || '[]'
    )

  pendingVisits.push({
    id:
      `offline-${Date.now()}`,

    user_id:
      userId,

    patient_id:
      payload.patient_id,

    payload:
      payload,

    created_at:
      new Date().toISOString()
  })

  localStorage.setItem(
    'sihgpt_pending_visits',
    JSON.stringify(
      pendingVisits
    )
  )

  alert(
    'Offline mode\n\n' +
    'Field visit saved on this device.\n' +
    'It will be synced when internet returns.'
  )

  renderPatientView()

  return
}


      const data =
        await apiRequest(
          `/staff/${encodeURIComponent(
            userId
          )}/visits`,
          {
            method: 'POST',

            body:
              JSON.stringify(
                payload
              )
          }
        )


      if (
        data?.success === false
      ) {

        throw new Error(
          data.message ||
          data.detail ||
          'Unable to save field visit.'
        )
      }


      alert(
        'Field visit saved successfully.'
      )


      currentVisits =
        await loadVisits(
          currentPatient.patient_id
        )


      renderPatientView()

    } catch (error) {

      alert(
        error.message ||
        'Unable to save field visit.'
      )

    } finally {

      button.disabled = false

      button.textContent =
        'Save Visit'
    }
  }


  async function saveReferral(
    event
  ) {

    event.preventDefault()


    const destination =
      document.querySelector(
        '#referralFacility'
      )?.value || ''


    const priority =
      document.querySelector(
        '#referralPriority'
      )?.value ||
      'Normal'


    const reason =
      document.querySelector(
        '#referralReason'
      )?.value.trim() || ''


    if (!destination) {

      alert(
        'Please select a destination facility.'
      )

      return
    }


    if (!reason) {

      alert(
        'Please enter the referral reason.'
      )

      return
    }


    const button =
      event.target.querySelector(
        'button[type="submit"]'
      )


    button.disabled = true

    button.textContent =
      'Creating...'


    try {

      const data =
        await apiRequest(
          `/staff/${encodeURIComponent(
            userId
          )}/referrals`,
          {
            method: 'POST',

            body:
              JSON.stringify({

                patient_id:
                  currentPatient.patient_id,

                to_facility_id:
                  destination,

                reason,

                priority

              })
          }
        )


      if (
        data?.success === false
      ) {

        throw new Error(
          data.message ||
          data.detail ||
          'Unable to create referral.'
        )
      }


      alert(
        'Referral created successfully.'
      )


      referrals =
        await loadReferrals()


      renderPatientView()

    } catch (error) {

      alert(
        error.message ||
        'Unable to create referral.'
      )

    } finally {

      button.disabled = false

      button.textContent =
        'Create Referral'
    }
  }

  async function writePatientToNfc(patientId) {

  if (!('NDEFReader' in window)) {
    alert(
      'NFC writing is not available on this device/browser.\n\n' +
      'Use Chrome on Android with NFC enabled and HTTPS.'
    )
    return
  }

  if (!window.isSecureContext) {
    alert(
      'NFC writing requires HTTPS.\n\n' +
      'The deployed HTTPS version of SIHGPT is required.'
    )
    return
  }

  try {

    const writer = new NDEFReader()

    alert(
      `Ready to write ${patientId}.\n\n` +
      `Hold the blank NFC card/tag near the back of the phone.`
    )

    await writer.write({
      records: [
        {
          recordType: 'text',
          data: patientId
        }
      ]
    })

    alert(
      `NFC card programmed successfully!\n\n` +
      `Patient ID: ${patientId}`
    )

    console.log(
      'NFC write successful:',
      patientId
    )

  } catch (error) {

    console.error(
      'NFC write failed:',
      error
    )

    alert(
      'NFC writing failed.\n\n' +
      (
        error.message ||
        'Please make sure the NFC tag is writable and try again.'
      )
    )
  }
}

async function startNfcScan() {
  console.log('--- SIHGPT NFC DEBUG ---')
  console.log('NDEFReader:', 'NDEFReader' in window)
  console.log('Secure context:', window.isSecureContext)
  console.log('Protocol:', window.location.protocol)
  console.log('URL:', window.location.href)
  console.log('User agent:', navigator.userAgent)

  // Check Web NFC API
  if (!('NDEFReader' in window)) {
    alert(
      'Web NFC is not available in this browser/device.\n\n' +
      'Use Chrome on Android and open SIHGPT over HTTPS.\n\n' +
      'For the demo, you can use Patient ID: PAT001.'
    )

    const patientId = prompt(
      'Enter Patient ID instead:',
      'PAT001'
    )

    if (patientId?.trim()) {
      await openPatient(patientId.trim())
    }

    return
  }

  // Web NFC requires a secure context
  if (!window.isSecureContext) {
    alert(
      'Web NFC requires a secure HTTPS connection.\n\n' +
      'Your current SIHGPT page is using HTTP.\n\n' +
      'Open the HTTPS version of SIHGPT for NFC.'
    )

    return
  }

  try {
    const reader = new NDEFReader()

    await reader.scan()

    alert(
      'NFC scanner ready!\n\n' +
      'Hold the patient NFC card near the back of the phone.'
    )

    console.log('NFC scanner started successfully.')

    reader.addEventListener(
      'reading',
      async event => {
        console.log('NFC TAG DETECTED')
        console.log(event)

        let patientId = ''

        // Read text records
        for (const record of event.message.records) {
          try {
            console.log(
              'NFC record type:',
              record.recordType
            )

            if (
              record.recordType === 'text' ||
              record.recordType === 'unknown'
            ) {
              const decoder = new TextDecoder(
                record.encoding || 'utf-8'
              )

              const value = decoder
                .decode(record.data)
                .trim()

              console.log(
                'NFC text:',
                value
              )

              if (value) {
                patientId = value
                break
              }
            }
          } catch (error) {
            console.warn(
              'Could not read NFC record:',
              error
            )
          }
        }

        // Also handle URL records
        if (!patientId) {
          for (const record of event.message.records) {
            try {
              if (record.recordType === 'url') {
                const decoder = new TextDecoder()

                const url = decoder
                  .decode(record.data)
                  .trim()

                console.log(
                  'NFC URL:',
                  url
                )

                // Extract PAT001 from a URL
                const match = url.match(
                  /(PAT\d+)/i
                )

                if (match) {
                  patientId =
                    match[1].toUpperCase()

                  break
                }
              }
            } catch (error) {
              console.warn(
                'Could not read NFC URL:',
                error
              )
            }
          }
        }

        if (!patientId) {
          alert(
            'NFC card detected, but no Patient ID was found.\n\n' +
            'The card should contain:\n\nPAT001'
          )

          return
        }

        console.log(
          'Patient identified by NFC:',
          patientId
        )

        await openPatient(patientId)

if (
  String(currentPatient?.gender || '')
    .trim()
    .toLowerCase() === 'female'
) {
  setTimeout(() => {
    if (
      typeof openMaternalChildCareCenter === 'function'
    ) {
      openMaternalChildCareCenter()
    }
  }, 300)
}
      },
      {
        once: true
      }
    )

    reader.addEventListener(
      'readingerror',
      event => {
        console.error(
          'NFC reading error:',
          event
        )

        alert(
          'NFC was detected, but the card could not be read.\n\n' +
          'Try holding the card against the back of the phone for 1–2 seconds.'
        )
      }
    )

  } catch (error) {
    console.error(
      'NFC startup error:',
      error
    )

    alert(
      'Unable to start NFC scanning.\n\n' +
      error.message
    )
  }
}


  try {

    app.innerHTML = `

      <div class="dashboard-page">


        <div class="dashboard-header">


          <div>

            <div class="dashboard-kicker">
            DWIT · CARE NETWORK
            </div>


            <h1>
              ${
                isAsha
                  ? 'ASHA Worker Portal'
                  : 'Medical Officer Portal'
              }
            </h1>


            <p>
              Loading your facility workspace...
            </p>

          </div>


          <button
            class="logout-btn"
            id="logoutBtn"
            type="button"
          >
            Logout
          </button>


        </div>


        <div class="dashboard-loading">
          Connecting to your secure facility workspace...
        </div>


      </div>

    `


    attachLogout()


    patients =
      await loadPatients()


    referrals =
      await loadReferrals()


    inventory =
  await loadInventory()  


  diagnostics =
  await loadDiagnostics()


    renderWorkspace()

  } catch (error) {

    console.error(error)


    app.innerHTML = `

      <div class="dashboard-page">


        <div class="dashboard-header">


          <div>

            <div class="dashboard-kicker">
              DWIT · CARE NETWORK
            </div>


            <h1>
              Unable to load workspace
            </h1>


            <p>
              ${escapeHtml(
                error.message
              )}
            </p>

          </div>


          <button
            class="logout-btn"
            id="logoutBtn"
            type="button"
          >
            Logout
          </button>


        </div>


        <div class="dashboard-error">


          <h3>
            Secure connection failed
          </h3>


          <p>
            Make sure FastAPI is running and try logging in again.
          </p>


          <button
            id="retryWorkspaceBtn"
            class="primary-action"
            type="button"
          >
            Retry
          </button>


        </div>


      </div>

    `


    attachLogout()


    document
      .querySelector(
        '#retryWorkspaceBtn'
      )
      ?.addEventListener(
        'click',
        () =>
          renderStaffDashboard(
            role,
            userId
          )
      )
  }
}


/* =========================================================
   START APP
========================================================= */

renderLogin()