import './style.css'

const app = document.querySelector('#app')
const API_URL = 'http://192.168.1.9:8000'

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

function attachLogout() {

  document
    .querySelector('#logoutBtn')
    ?.addEventListener(
      'click',
      logout
    )
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

              <div class="brand-mark">
                <span>RH</span>
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
              SIHGPT / ACCESS
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
          'SIHGPT Support\n\nPlease contact your project administrator.'
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

async function renderPatientDashboard(
  patientId
) {

  app.innerHTML = `

    <div class="dashboard-page">

      <div class="dashboard-header">

        <div>

          <div class="dashboard-kicker">
            SIHGPT · CONNECTED CARE
          </div>

          <h1>
            Loading patient record...
          </h1>

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
        Loading your health information...
      </div>

    </div>

  `


  attachLogout()


  try {

    const results =
      await Promise.allSettled([

        apiGet(
          `/patients/${encodeURIComponent(
            patientId
          )}`
        ),

        apiGet(
          `/patients/${encodeURIComponent(
            patientId
          )}/appointments`
        ),

        apiGet(
          `/patients/${encodeURIComponent(
            patientId
          )}/prescriptions`
        ),

        apiGet(
          `/patients/${encodeURIComponent(
            patientId
          )}/labs`
        ),

        apiGet(
          `/patients/${encodeURIComponent(
            patientId
          )}/referrals`
        ),

        apiGet(
          `/patients/${encodeURIComponent(
            patientId
          )}/timeline`
        )

      ])


    if (
      results[0].status ===
      'rejected'
    ) {

      throw results[0].reason
    }


    const patientData =
      results[0].value


    const patient =
      patientData?.patient ||
      patientData?.data ||
      patientData


    const appointments =
      results[1].status ===
      'fulfilled'
        ? getArray(
            results[1].value,
            'appointments',
            'data'
          )
        : []


    const prescriptions =
      results[2].status ===
      'fulfilled'
        ? getArray(
            results[2].value,
            'prescriptions',
            'data'
          )
        : []


    const labs =
      results[3].status ===
      'fulfilled'
        ? getArray(
            results[3].value,
            'labs',
            'data'
          )
        : []


    const referrals =
      results[4].status ===
      'fulfilled'
        ? getArray(
            results[4].value,
            'referrals',
            'data'
          )
        : []


    const timeline =
      results[5].status ===
      'fulfilled'
        ? getArray(
            results[5].value,
            'timeline',
            'visits',
            'data'
          )
        : []


    app.innerHTML = `

      <div class="dashboard-page">


        <div class="dashboard-header">

          <div>

            <div class="dashboard-kicker">
              SIHGPT · PATIENT PORTAL
            </div>

            <h1>
              Welcome,
              ${escapeHtml(
                patient?.name ||
                patientId
              )}
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


        <div class="dashboard-grid">


          <section
            class="dashboard-card profile-card"
          >

            <div class="card-heading">
              Patient Profile
            </div>


            <div class="profile-grid">


              <div>

                <span>
                  Patient ID
                </span>

                <strong>
                  ${escapeHtml(
                    patient?.patient_id ||
                    patientId
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Name
                </span>

                <strong>
                  ${escapeHtml(
                    patient?.name ||
                    '—'
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Age
                </span>

                <strong>
                  ${escapeHtml(
                    patient?.age ??
                    '—'
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Gender
                </span>

                <strong>
                  ${escapeHtml(
                    patient?.gender ||
                    '—'
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Village
                </span>

                <strong>
                  ${escapeHtml(
                    patient?.village ||
                    '—'
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Blood Group
                </span>

                <strong>
                  ${escapeHtml(
                    patient?.blood_group ||
                    '—'
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Phone
                </span>

                <strong>
                  ${escapeHtml(
                    patient?.phone ||
                    '—'
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Facility
                </span>

                <strong>
                  ${escapeHtml(
                    patient?.facility_name ||
                    patient?.facility ||
                    '—'
                  )}
                </strong>

              </div>


            </div>

          </section>


          <section class="dashboard-card">

            <div class="card-heading">
              Visits / Timeline
            </div>

            ${renderRecords(
              timeline,
              'Visit'
            )}

          </section>


          <section class="dashboard-card">

            <div class="card-heading">
              Appointments
            </div>

            ${renderRecords(
              appointments,
              'Appointment'
            )}

          </section>


          <section class="dashboard-card">

            <div class="card-heading">
              Prescriptions
            </div>

            ${renderRecords(
              prescriptions,
              'Prescription'
            )}

          </section>


          <section class="dashboard-card">

            <div class="card-heading">
              Lab Reports
            </div>

            ${renderRecords(
              labs,
              'Lab Report'
            )}

          </section>


          <section
            class="dashboard-card dashboard-card-wide"
          >

            <div class="card-heading">
              Referrals
            </div>

            ${renderRecords(
              referrals,
              'Referral'
            )}

          </section>


        </div>

      </div>

    `


    attachLogout()

  } catch (error) {

    console.error(error)


    app.innerHTML = `

      <div class="dashboard-page">


        <div class="dashboard-header">

          <div>

            <div class="dashboard-kicker">
              SIHGPT
            </div>

            <h1>
              Unable to load patient data
            </h1>

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
            ${escapeHtml(
              error.message
            )}
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


  function renderWorkspace() {

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
              SIHGPT · SECURE CARE NETWORK
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


        <div class="staff-workspace">


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
                        Identify patient using NFC or Patient ID.
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


    attachPatientButtons()

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
              SIHGPT · AUTHORIZED PATIENT RECORD
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
              SIHGPT · CARE NETWORK
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


    renderWorkspace()

  } catch (error) {

    console.error(error)


    app.innerHTML = `

      <div class="dashboard-page">


        <div class="dashboard-header">


          <div>

            <div class="dashboard-kicker">
              SIHGPT · CARE NETWORK
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