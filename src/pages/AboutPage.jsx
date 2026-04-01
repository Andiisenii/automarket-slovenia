import { Link } from 'react-router-dom'
import { Shield, CreditCard, Lock, CheckCircle, Car, Users, MessageCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useLanguage } from '@/lib/LanguageContext'

export function AboutPage() {
  const { language } = useLanguage()
  
  const isSl = language === 'sl'
  
  const whyChooseUs = isSl ? [
    'Brezplačna objava do 5 vozil',
    'Hitra in enostavna objava',
    'Promocija vozil (boost)',
    'Priljubljena vozila',
    'Direkten kontakt s prodajalci',
    'Ocene in mnenja uporabnikov',
    'Podpora v slovenskem jeziku'
  ] : [
    'Free listing up to 2 vehicles',
    'Fast and easy listing',
    'Vehicle promotion (boost)',
    'Favorite vehicles',
    'Direct contact with sellers',
    'User ratings and reviews',
    'Support in Slovenian language'
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isSl ? 'O AutoMarket Slovenia' : 'About AutoMarket Slovenia'}
          </h1>
          <p className="text-xl text-gray-600">
            {isSl 
              ? 'Vaša zaupanja vredna platforma za nakup in prodajo vozil'
              : 'Your trusted platform for buying and selling vehicles'}
          </p>
        </div>

        {/* What We Do */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isSl ? 'Kaj ponujamo?' : 'What We Offer'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Car className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {isSl ? 'Široka izbira vozil' : 'Wide Selection of Vehicles'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isSl 
                    ? 'Tisoče vozil vseh znamk, modelov in cenovnih razredov na enem mestu.'
                    : 'Thousands of vehicles of all brands, models and price ranges in one place.'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {isSl ? 'Preverjeni prodajalci' : 'Verified Sellers'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isSl 
                    ? 'Vsak prodajalec je preverjen. Zasebni in poslovni uporabniki z ocenami.'
                    : 'Every seller is verified. Private and business users with ratings.'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {isSl ? 'Direktno sporočanje' : 'Direct Messaging'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isSl 
                    ? 'Sporočajte se neposredno s prodajalci prek telefona, WhatsApp ali Viber.'
                    : 'Communicate directly with sellers via phone, WhatsApp or Viber.'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {isSl ? 'Priljubljena vozila' : 'Favorite Vehicles'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isSl 
                    ? 'Shranite vozila med priljubljene in sledite spremembam cen.'
                    : 'Save vehicles to favorites and track price changes.'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isSl ? 'Kako deluje?' : 'How It Works'}
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {isSl ? 'Iskanje vozila' : 'Find a Vehicle'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isSl 
                    ? 'Preglejte naše vozilo po znamki, modelu, ceni, letniku ali lokaciji.'
                    : 'Browse our vehicles by brand, model, price, year or location.'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {isSl ? 'Kontaktirajte prodajalca' : 'Contact the Seller'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isSl 
                    ? 'Pošljite sporočilo ali pokličite prodajalca direktno preko oglasa.'
                    : 'Send a message or call the seller directly through the listing.'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {isSl ? 'Ogled in nakup' : 'Viewing and Purchase'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isSl 
                    ? 'Dogovorite se za ogled vozila in opravite nakup varno.'
                    : 'Arrange a viewing and make a safe purchase.'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {isSl ? 'Prodajte svoje vozilo' : 'Sell Your Vehicle'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isSl 
                    ? 'Objavite svoje vozilo in dosežite tisoče potencialnih kupcev.'
                    : 'List your vehicle and reach thousands of potential buyers.'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Security */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isSl ? 'Varno plačilo' : 'Secure Payment'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {isSl ? 'Šifrirane transakcije' : 'Encrypted Transactions'}
              </h3>
              <p className="text-gray-600 text-sm">
                {isSl 
                  ? 'Vsi podatki so šifrirani z najnovejšimi varnostnimi protokoli.'
                  : 'All data is encrypted with the latest security protocols.'}
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {isSl ? 'Varne plačilne metode' : 'Secure Payment Methods'}
              </h3>
              <p className="text-gray-600 text-sm">
                {isSl 
                  ? 'Podpiramo varna plačila s kreditnimi karticami in drugimi metodami.'
                  : 'We support secure payments with credit cards and other methods.'}
              </p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {isSl ? 'Varovanje podatkov' : 'Data Protection'}
              </h3>
              <p className="text-gray-600 text-sm">
                {isSl 
                  ? 'Vaši osebni podatki so varovani skladno z GDPR predpisi.'
                  : 'Your personal data is protected according to GDPR regulations.'}
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>{isSl ? 'Nasvet:' : 'Tip:'}</strong> {isSl 
                ? 'Pri nakupu vozila vedno preverite prodajalca, se dogovorite za ogled in uporabite varne načine plačila. Ne plačujte vnaprej za vozila, ki jih niste videli v živo.'
                : 'When buying a vehicle, always verify the seller, arrange a viewing and use secure payment methods. Do not pay in advance for vehicles you have not seen in person.'}
            </p>
          </div>
        </Card>

        {/* Why Choose Us */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isSl ? 'Zakaj izbrati nas?' : 'Why Choose Us?'}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {whyChooseUs.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link to="/cars">
            <Button className="px-8 py-3 text-lg">
              <Car className="w-5 h-5 mr-2" />
              {isSl ? 'Preglej vozila' : 'Browse Vehicles'}
            </Button>
          </Link>
        </div>

      </div>
    </div>
  )
}
