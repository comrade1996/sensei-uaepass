export interface UaePassTexts {
  signInWithUaePass: string;
}

export const UAE_PASS_TEXTS_EN: UaePassTexts = {
  signInWithUaePass: 'Sign in with UAE PASS',
};

export const UAE_PASS_TEXTS_AR: UaePassTexts = {
  signInWithUaePass: 'تسجيل الدخول بالهوية الرقمية',
};

export function getUaePassTexts(language: 'en' | 'ar' = 'en'): UaePassTexts {
  return language === 'ar' ? UAE_PASS_TEXTS_AR : UAE_PASS_TEXTS_EN;
}
