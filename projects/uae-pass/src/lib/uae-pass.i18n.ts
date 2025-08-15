export interface UaePassTexts {
  // Login button
  signInWithUaePass: string;
  
  // Callback component
  completingSignIn: string;
  signedInSuccessfully: string;
  redirectingToHomePage: string;
  error: string;
  returnToHome: string;
  
  // Loading states
  loading: string;
  pleaseWait: string;
  
  // Error messages
  windowNotAvailable: string;
  noUrlContext: string;
  securityCheckFailed: string;
  tokenExchangeFailed: string;
  noUserProfile: string;
  userProfileFetchFailed: string;
  
  // Common
  uaePass: string;
}

export const UAE_PASS_TEXTS_EN: UaePassTexts = {
  signInWithUaePass: 'Sign with UAE PASS',
  completingSignIn: 'Completing sign-in…',
  signedInSuccessfully: 'Signed in successfully!',
  redirectingToHomePage: 'Redirecting to home page...',
  error: 'Error',
  returnToHome: 'Return to home',
  loading: 'Loading',
  pleaseWait: 'Please wait',
  windowNotAvailable: 'Window is not available to redirect',
  noUrlContext: 'No URL context available to handle callback',
  securityCheckFailed: 'Security check failed: state mismatch',
  tokenExchangeFailed: 'Failed to obtain access token',
  noUserProfile: 'No user profile data received',
  userProfileFetchFailed: 'Failed to fetch user profile',
  uaePass: 'UAE PASS'
};

export const UAE_PASS_TEXTS_AR: UaePassTexts = {
  signInWithUaePass: 'تسجيل الدخول بهوية الإمارات الرقمية',
  completingSignIn: 'جاري إكمال تسجيل الدخول…',
  signedInSuccessfully: 'تم تسجيل الدخول بنجاح!',
  redirectingToHomePage: 'جاري التوجيه إلى الصفحة الرئيسية...',
  error: 'خطأ',
  returnToHome: 'العودة إلى الصفحة الرئيسية',
  loading: 'جاري التحميل',
  pleaseWait: 'يرجى الانتظار',
  windowNotAvailable: 'النافذة غير متاحة للتوجيه',
  noUrlContext: 'لا يوجد سياق URL متاح للتعامل مع الاستدعاء',
  securityCheckFailed: 'فشل في الفحص الأمني: عدم تطابق الحالة',
  tokenExchangeFailed: 'فشل في الحصول على رمز الوصول',
  noUserProfile: 'لم يتم استلام بيانات الملف الشخصي للمستخدم',
  userProfileFetchFailed: 'فشل في جلب الملف الشخصي للمستخدم',
  uaePass: 'هوية الإمارات الرقمية'
};

export function getUaePassTexts(language: 'en' | 'ar' = 'en'): UaePassTexts {
  return language === 'ar' ? UAE_PASS_TEXTS_AR : UAE_PASS_TEXTS_EN;
}
