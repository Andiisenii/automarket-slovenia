import { useLanguage } from '@/lib/LanguageContext'
import { Card } from '@/components/ui/Card'
import { FileText, CheckCircle, AlertCircle, Shield, Car } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TermsPage() {
  const { language } = useLanguage()
  const isSl = language === 'sl'

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isSl ? 'Pogoji uporabe' : 'Terms of Service'}
          </h1>
          <p className="text-gray-600">
            {isSl ? 'Pravila in pogoji uporabe platforme' : 'Rules and conditions for using the platform'}
          </p>
        </div>

        <Card className="p-8 mb-8">
          <p className="text-sm text-gray-500 mb-6">
            {isSl ? 'Zadnja posodobitev: Marec 2026' : 'Last updated: March 2026'}
          </p>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isSl ? '1. Sprejetje pogojev' : '1. Acceptance of Terms'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isSl 
              ? 'Z uporabo platforme AutoMarket Slovenia soglašate s temi pogoji uporabe. Če se strinjate s temi pogoji, lahko še naprej uporabljate našo platformo.'
              : 'By using the AutoMarket Slovenia platform, you agree to these terms of service. If you agree to these terms, you may continue to use our platform.'}
          </p>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isSl ? '2. Opis storitve' : '2. Service Description'}
          </h2>
          <div className="flex items-start gap-3 mb-6">
            <Car className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
            <p className="text-gray-600">
              {isSl 
                ? 'AutoMarket je spletna platforma, ki omogoča uporabnikom objavljanje, iskanje in pregledovanje oglasov za vozila. Nismo posrednik in ne prevzemamo odgovornosti za transakcije med uporabniki.'
                : 'AutoMarket is an online platform that allows users to post, search and browse vehicle listings. We are not an intermediary and do not assume responsibility for transactions between users.'}
            </p>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isSl ? '3. Obveznosti uporabnikov' : '3. User Obligations'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isSl ? 'Uporabniki se strinjajo, da:' : 'Users agree to:'}
          </p>
          <ul className="space-y-3 mb-6">
            {[
              isSl ? 'Objavljajo resnične in točne informacije o vozilih' : 'Post true and accurate information about vehicles',
              isSl ? 'Ne objavljajo lažnih ali zavajajočih oglasov' : 'Do not post false or misleading advertisements',
              isSl ? 'Spoštujejo druge uporabnike in njihovo zasebnost' : 'Respect other users and their privacy',
              isSl ? 'Ne uporabljajo platforme za nezakonite namene' : 'Do not use the platform for illegal purposes',
              isSl ? 'Imajo pravico do prodaje vozil, ki jih objavljajo' : 'Have the right to sell vehicles they post',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isSl ? '4. Prepovedane vsebine' : '4. Prohibited Content'}
          </h2>
          <div className="bg-red-50 p-4 rounded-xl mb-6">
            <ul className="space-y-2">
              {[
                isSl ? 'Vozila brez veljavne dokumentacije' : 'Vehicles without valid documentation',
                isSl ? 'Ukradena vozila ali vozila z neplačanimi davki' : 'Stolen vehicles or vehicles with unpaid taxes',
                isSl ? 'Oglasi z neresničnimi podatki' : 'Ads with false information',
                isSl ? 'Promocija drugih konkurenčnih platform' : 'Promotion of other competing platforms',
                isSl ? 'Vsebina, ki krši veljavno zakonodajo' : 'Content that violates applicable law',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isSl ? '5. Odgovornost' : '5. Liability'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isSl 
              ? 'AutoMarket ne prevzema odgovornosti za:'
              : 'AutoMarket assumes no responsibility for:'}
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>{isSl ? 'Resničnost objavljenih oglasov' : 'Truthfulness of published advertisements'}</li>
            <li>{isSl ? 'Kakovost in stanje vozil' : 'Quality and condition of vehicles'}</li>
            <li>{isSl ? 'Transakcije med uporabniki' : 'Transactions between users'}</li>
            <li>{isSl ? 'Morebitne spore med kupci in prodajalci' : 'Any disputes between buyers and sellers'}</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isSl ? '6. Plačila in naročnine' : '6. Payments and Subscriptions'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isSl 
              ? 'Nekatere funkcije platforme so plačljive. Plačila so enkratna ali naročnina. Vračilo je možno v 14 dneh od nakupa, če storitev ni bila uporabljena.'
              : 'Some platform features are payable. Payments are one-time or subscription-based. Refunds are possible within 14 days of purchase if the service has not been used.'}
          </p>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isSl ? '7. Promocija vozil (Boost)' : '7. Vehicle Promotion (Boost)'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isSl 
              ? 'Promocijske storitve (Boost) omogočajo vidnejšo objavo vozila. Veljavnost promocije je odvisna od izbranega paketa. Promocija ni jamstvo za prodajo.'
              : 'Promotion services (Boost) enable more prominent vehicle listing. Promotion validity depends on the selected package. Promotion is not a guarantee of sale.'}
          </p>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isSl ? '8. Prekinitev storitve' : '8. Service Termination'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isSl 
              ? 'AutoMarket si pridržuje pravico do prekinitve dostopa uporabnikom, ki kršijo te pogoje ali zakonodajo. Uporabnik lahko kadar koli izbriše svoj račun.'
              : 'AutoMarket reserves the right to terminate access for users who violate these terms or legislation. Users can delete their account at any time.'}
          </p>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isSl ? '9. Spremembe pogojev' : '9. Changes to Terms'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isSl 
              ? 'Pridržujemo si pravico do spremembe teh pogojev. Spremembe bodo objavljene na tej strani. Nadaljnja uporaba platforme pomeni sprejetje spremenjenih pogojev.'
              : 'We reserve the right to change these terms. Changes will be posted on this page. Continued use of the platform means acceptance of the changed terms.'}
          </p>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isSl ? '10. Kontakt' : '10. Contact'}
          </h2>
          <p className="text-gray-600 mb-4">
            {isSl 
              ? 'Za vprašanja o pogojih nas kontaktirajte:'
              : 'For questions about the terms, contact us:'}
          </p>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-gray-700">📧 info@vozilo.si</p>
            <p className="text-gray-700">📞 +386 40 123 456</p>
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
