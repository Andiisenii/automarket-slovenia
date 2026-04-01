import { useLanguage } from '@/lib/LanguageContext'
import { Card } from '@/components/ui/Card'
import { Shield, Lock, Mail, Phone, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PrivacyPage() {
  const { language } = useLanguage()
  const isSl = language === 'sl'

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isSl ? 'Politika zasebnosti' : 'Privacy Policy'}
          </h1>
          <p className="text-gray-600">
            {isSl ? 'Zaščita vaših osebnih podatkov' : 'Protecting your personal data'}
          </p>
        </div>

        <Card className="p-8 mb-8">
          <div className="prose max-w-none">
            <p className="text-sm text-gray-500 mb-6">
              {isSl ? 'Zadnja posodobitev: Marec 2026' : 'Last updated: March 2026'}
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isSl ? '1. Uvod' : '1. Introduction'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isSl 
                ? 'AutoMarket Slovenia (v nadaljevanju "mi", "naš" ali "AutoMarket") spoštuje vašo zasebnost. Ta politika zasebnosti pojasnjuje, kako zbiramo, uporabljamo, razkrivamo in varujemo vaše osebne podatke, ko uporabljate našo platformo.'
                : 'AutoMarket Slovenia (hereinafter "we", "our" or "AutoMarket") respects your privacy. This privacy policy explains how we collect, use, disclose and protect your personal data when you use our platform.'}
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isSl ? '2. Podatki, ki jih zbiramo' : '2. Data We Collect'}
            </h2>
            <p className="text-gray-600 mb-4">
              {isSl ? 'Zbiramo naslednje vrste podatkov:' : 'We collect the following types of data:'}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>{isSl ? 'Osebni podatki (ime, priimek, email, telefon)' : 'Personal information (name, surname, email, phone)'}</li>
              <li>{isSl ? 'Podatki o vozilu (znamka, model, cena, fotografije)' : 'Vehicle data (brand, model, price, photos)'}</li>
              <li>{isSl ? 'Podatki o uporabi in napravi' : 'Usage and device data'}</li>
              <li>{isSl ? 'Komunikacija med uporabniki' : 'Communication between users'}</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isSl ? '3. Uporaba podatkov' : '3. Use of Data'}
            </h2>
            <p className="text-gray-600 mb-4">
              {isSl ? 'Vaše podatke uporabljamo za:' : 'We use your data for:'}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>{isSl ? 'Omogočanje objave in iskanja vozil' : 'Enabling vehicle listing and search'}</li>
              <li>{isSl ? 'Komunikacijo med kupci in prodajalci' : 'Communication between buyers and sellers'}</li>
              <li>{isSl ? 'Izboljšanje naših storitev' : 'Improving our services'}</li>
              <li>{isSl ? 'Pošiljanje pomembnih obvestil' : 'Sending important notifications'}</li>
              <li>{isSl ? 'Preprečevanje goljufij in zlorab' : 'Preventing fraud and abuse'}</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isSl ? '4. Varovanje podatkov' : '4. Data Protection'}
            </h2>
            <div className="flex items-start gap-3 mb-6">
              <Lock className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <p className="text-gray-600">
                {isSl 
                  ? 'Uporabljamo napredne varnostne ukrepe za zaščito vaših podatkov, vključno s šifriranjem SSL, varnim shranjevanjem in rednimi varnostnimi pregledi. Vaši podatki so shranjeni na varnih strežnikih v EU.'
                  : 'We use advanced security measures to protect your data, including SSL encryption, secure storage and regular security audits. Your data is stored on secure servers in the EU.'}
              </p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isSl ? '5. Vaše pravice' : '5. Your Rights'}
            </h2>
            <p className="text-gray-600 mb-4">
              {isSl ? 'V skladu z GDPR imate naslednje pravice:' : 'Under GDPR, you have the following rights:'}
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
              <li>{isSl ? 'Pravica do dostopa do vaših podatkov' : 'Right to access your data'}</li>
              <li>{isSl ? 'Pravica do popravka podatkov' : 'Right to correct your data'}</li>
              <li>{isSl ? 'Pravica do izbrisa podatkov' : 'Right to delete your data'}</li>
              <li>{isSl ? 'Pravica do prenosljivosti podatkov' : 'Right to data portability'}</li>
              <li>{isSl ? 'Pravica do ugovora obdelavi' : 'Right to object to processing'}</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isSl ? '6. Piškotki' : '6. Cookies'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isSl 
                ? 'Uporabljamo piškotke za izboljšanje uporabniške izkušnje. Piškotke lahko onemogočite v nastavitvah brskalnika, vendar lahko to vpliva na delovanje nekaterih funkcij.'
                : 'We use cookies to improve user experience. You can disable cookies in your browser settings, but this may affect the functionality of some features.'}
            </p>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isSl ? '7. Kontakt' : '7. Contact'}
            </h2>
            <p className="text-gray-600 mb-4">
              {isSl 
                ? 'Če imate vprašanja o naši politiki zasebnosti, nas kontaktirajte:'
                : 'If you have questions about our privacy policy, contact us:'}
            </p>
            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              <p className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4" /> info@vozilo.si
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" /> +386 40 123 456
              </p>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Link to="/" className="text-orange-500 hover:text-orange-600 font-medium">
            ← {isSl ? 'Nazaj na domov' : 'Back to Home'}
          </Link>
        </div>

      </div>
    </div>
  )
}
