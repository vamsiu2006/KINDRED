import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface EmergencyProps {
  user: User;
}

interface EmergencyContact {
  name: string;
  number: string;
  type: 'ambulance' | 'police' | 'fire' | 'hospital' | 'hotline';
  description: string;
}

interface CountryEmergencyData {
  country: string;
  countryCode: string;
  flag: string;
  panicNumber: string;
  contacts: EmergencyContact[];
}

const EMERGENCY_CONTACTS_BY_COUNTRY: { [key: string]: CountryEmergencyData } = {
  'US': {
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    panicNumber: '911',
    contacts: [
      {
        name: '911 Emergency',
        number: '911',
        type: 'ambulance',
        description: 'Immediate medical, fire, or police emergency'
      },
      {
        name: 'Ambulance Service',
        number: '911',
        type: 'ambulance',
        description: 'Medical emergencies and ambulance dispatch'
      },
      {
        name: 'Poison Control',
        number: '1-800-222-1222',
        type: 'hospital',
        description: '24/7 poison control and medical guidance'
      },
      {
        name: 'Mental Health Crisis',
        number: '988',
        type: 'hotline',
        description: 'Suicide & crisis lifeline - 24/7 support'
      },
      {
        name: 'Non-Emergency',
        number: '311',
        type: 'hospital',
        description: 'Non-urgent medical questions and referrals'
      }
    ]
  },
  'GB': {
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    panicNumber: '999',
    contacts: [
      {
        name: '999 Emergency',
        number: '999',
        type: 'ambulance',
        description: 'Police, ambulance, fire, and rescue services'
      },
      {
        name: '112 EU Emergency',
        number: '112',
        type: 'ambulance',
        description: 'Alternative emergency number (EU standard)'
      },
      {
        name: 'NHS 111',
        number: '111',
        type: 'hospital',
        description: 'Non-emergency medical advice and guidance'
      },
      {
        name: 'Samaritans',
        number: '116-123',
        type: 'hotline',
        description: '24/7 emotional support and crisis helpline'
      }
    ]
  },
  'IN': {
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    panicNumber: '112',
    contacts: [
      {
        name: '112 Emergency',
        number: '112',
        type: 'ambulance',
        description: 'Universal emergency number - all services'
      },
      {
        name: '108 Ambulance',
        number: '108',
        type: 'ambulance',
        description: 'Free ambulance service across India'
      },
      {
        name: '102 Ambulance',
        number: '102',
        type: 'ambulance',
        description: 'Medical emergency ambulance service'
      },
      {
        name: 'Mental Health',
        number: '9152987821',
        type: 'hotline',
        description: 'COOJ Mental Health Foundation helpline'
      }
    ]
  },
  'AU': {
    country: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    panicNumber: '000',
    contacts: [
      {
        name: '000 Emergency',
        number: '000',
        type: 'ambulance',
        description: 'Police, ambulance, and fire services'
      },
      {
        name: '112 Mobile Emergency',
        number: '112',
        type: 'ambulance',
        description: 'Emergency number for mobile phones'
      },
      {
        name: 'Lifeline',
        number: '13-11-14',
        type: 'hotline',
        description: '24/7 crisis support and suicide prevention'
      },
      {
        name: 'Healthdirect',
        number: '1800-022-222',
        type: 'hospital',
        description: '24/7 health advice from nurses'
      }
    ]
  },
  'CA': {
    country: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    panicNumber: '911',
    contacts: [
      {
        name: '911 Emergency',
        number: '911',
        type: 'ambulance',
        description: 'Police, ambulance, fire, and rescue services'
      },
      {
        name: 'Telehealth',
        number: '811',
        type: 'hospital',
        description: 'Non-emergency health information and advice'
      },
      {
        name: 'Poison Control',
        number: '1-844-764-7669',
        type: 'hospital',
        description: '24/7 poison control center'
      },
      {
        name: 'Crisis Services',
        number: '988',
        type: 'hotline',
        description: 'Suicide prevention and mental health crisis'
      }
    ]
  },
  'DE': {
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    panicNumber: '112',
    contacts: [
      {
        name: '112 Emergency',
        number: '112',
        type: 'ambulance',
        description: 'Fire and medical emergencies'
      },
      {
        name: '110 Police',
        number: '110',
        type: 'police',
        description: 'Police emergency number'
      },
      {
        name: 'Medical On-Call',
        number: '116-117',
        type: 'hospital',
        description: 'Non-emergency medical service'
      },
      {
        name: 'TelefonSeelsorge',
        number: '0800-111-0-111',
        type: 'hotline',
        description: '24/7 crisis and counseling hotline'
      }
    ]
  },
  'FR': {
    country: 'France',
    countryCode: 'FR',
    flag: '🇫🇷',
    panicNumber: '112',
    contacts: [
      {
        name: '112 Emergency',
        number: '112',
        type: 'ambulance',
        description: 'European emergency number'
      },
      {
        name: '15 SAMU',
        number: '15',
        type: 'ambulance',
        description: 'Medical emergencies and ambulance'
      },
      {
        name: '17 Police',
        number: '17',
        type: 'police',
        description: 'Police emergency number'
      },
      {
        name: 'SOS Suicide',
        number: '01-45-39-40-00',
        type: 'hotline',
        description: '24/7 suicide prevention hotline'
      }
    ]
  },
  'JP': {
    country: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    panicNumber: '119',
    contacts: [
      {
        name: '119 Fire/Ambulance',
        number: '119',
        type: 'ambulance',
        description: 'Fire and medical emergencies'
      },
      {
        name: '110 Police',
        number: '110',
        type: 'police',
        description: 'Police emergency number'
      },
      {
        name: 'Tokyo English Lifeline',
        number: '03-5774-0992',
        type: 'hotline',
        description: 'Free anonymous telephone counseling'
      }
    ]
  },
  'CN': {
    country: 'China',
    countryCode: 'CN',
    flag: '🇨🇳',
    panicNumber: '120',
    contacts: [
      {
        name: '120 Ambulance',
        number: '120',
        type: 'ambulance',
        description: 'Medical emergency and ambulance service'
      },
      {
        name: '110 Police',
        number: '110',
        type: 'police',
        description: 'Police emergency number'
      },
      {
        name: '119 Fire',
        number: '119',
        type: 'fire',
        description: 'Fire emergency services'
      },
      {
        name: 'Beijing Suicide Hotline',
        number: '010-82951332',
        type: 'hotline',
        description: '24/7 psychological crisis intervention'
      }
    ]
  },
  'BR': {
    country: 'Brazil',
    countryCode: 'BR',
    flag: '🇧🇷',
    panicNumber: '192',
    contacts: [
      {
        name: '192 Ambulance',
        number: '192',
        type: 'ambulance',
        description: 'Medical emergency service (SAMU)'
      },
      {
        name: '190 Police',
        number: '190',
        type: 'police',
        description: 'Military police emergency'
      },
      {
        name: '193 Fire',
        number: '193',
        type: 'fire',
        description: 'Fire department emergency'
      },
      {
        name: 'CVV Helpline',
        number: '188',
        type: 'hotline',
        description: '24/7 emotional support and suicide prevention'
      }
    ]
  }
};

const Emergency: React.FC<EmergencyProps> = ({ user }) => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [countryCode, setCountryCode] = useState<string>('US');
  const [isDetectingCountry, setIsDetectingCountry] = useState(true);
  const [detectedCountry, setDetectedCountry] = useState<string>('');

  useEffect(() => {
    detectLocationAndCountry();
  }, []);

  const detectLocationAndCountry = async () => {
    setIsDetectingCountry(true);
    
    // Try geolocation first
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ lat, lon });
          
          // Use reverse geocoding to get country
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            const data = await response.json();
            const detectedCode = data.countryCode || 'US';
            setCountryCode(detectedCode);
            setDetectedCountry(data.countryName || EMERGENCY_CONTACTS_BY_COUNTRY[detectedCode]?.country || 'your location');
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            // Fallback to IP-based detection
            await detectCountryByIP();
          }
          setIsDetectingCountry(false);
        },
        async (error) => {
          setLocationError('Unable to access location. Using IP-based detection...');
          // Fallback to IP-based detection
          await detectCountryByIP();
          setIsDetectingCountry(false);
        }
      );
    } else {
      setLocationError('Geolocation not supported. Using IP-based detection...');
      await detectCountryByIP();
      setIsDetectingCountry(false);
    }
  };

  const detectCountryByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      const detectedCode = data.country_code || 'US';
      setCountryCode(detectedCode);
      setDetectedCountry(data.country_name || EMERGENCY_CONTACTS_BY_COUNTRY[detectedCode]?.country || 'your location');
      
      // Also set approximate location for maps
      if (data.latitude && data.longitude) {
        setLocation({
          lat: data.latitude,
          lon: data.longitude
        });
      }
    } catch (error) {
      console.error('IP-based country detection failed:', error);
      setCountryCode('US'); // Default to US
      setDetectedCountry('United States');
    }
  };

  const handlePanicButton = () => {
    setIsPanicActive(true);
    setTimeout(() => setIsPanicActive(false), 5000);
  };

  const makeCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ambulance':
        return '🚑';
      case 'police':
        return '👮';
      case 'fire':
        return '🚒';
      case 'hospital':
        return '🏥';
      case 'hotline':
        return '📞';
      default:
        return '⚠️';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ambulance':
        return 'from-red-500/20 to-pink-500/20 border-red-500/40';
      case 'police':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/40';
      case 'fire':
        return 'from-orange-500/20 to-red-500/20 border-orange-500/40';
      case 'hospital':
        return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40';
      case 'hotline':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/40';
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-500/40';
    }
  };

  const currentCountryData = EMERGENCY_CONTACTS_BY_COUNTRY[countryCode] || EMERGENCY_CONTACTS_BY_COUNTRY['US'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3 gradient-text" style={{
          background: 'linear-gradient(135deg, #ff3366 0%, #ff6b9d 50%, #00ff88 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🚨 EMERGENCY SERVICES
        </h1>
        <p className="text-gray-400 text-lg">Immediate access to emergency contacts and help</p>
      </div>

      {isDetectingCountry && (
        <div className="glass-card p-6 border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-spin">🌍</span>
            <div>
              <h3 className="font-bold text-cyan-400 mb-1">Detecting Your Location...</h3>
              <p className="text-gray-300 text-sm">Finding emergency services in your area</p>
            </div>
          </div>
        </div>
      )}

      {!isDetectingCountry && (
        <div className="glass-card p-6 border-2 border-emerald-500/40">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-5xl">{currentCountryData.flag}</span>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Emergency Services in {currentCountryData.country}
                </h3>
                <p className="text-gray-400 text-sm">
                  {detectedCountry ? `Detected: ${detectedCountry}` : 'Location detected'}
                </p>
              </div>
            </div>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/10 border border-emerald-500/30 text-white hover:bg-white/20 transition-all duration-300 cursor-pointer"
            >
              <option value="US">🇺🇸 United States</option>
              <option value="GB">🇬🇧 United Kingdom</option>
              <option value="IN">🇮🇳 India</option>
              <option value="AU">🇦🇺 Australia</option>
              <option value="CA">🇨🇦 Canada</option>
              <option value="DE">🇩🇪 Germany</option>
              <option value="FR">🇫🇷 France</option>
              <option value="JP">🇯🇵 Japan</option>
              <option value="CN">🇨🇳 China</option>
              <option value="BR">🇧🇷 Brazil</option>
            </select>
          </div>
        </div>
      )}

      <div className="glass-card p-8 border-2 border-red-500/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5 animate-pulse"></div>
        <div className="relative z-10">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-bounce">🆘</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">PANIC BUTTON</h2>
            <p className="text-gray-300 mb-6">Click to call {currentCountryData.panicNumber} immediately</p>
          </div>
          <button
            onMouseDown={handlePanicButton}
            onTouchStart={handlePanicButton}
            className={`w-full py-8 rounded-2xl font-bold text-2xl transition-all duration-300 ${
              isPanicActive
                ? 'bg-gradient-to-r from-red-600 to-pink-600 scale-95 shadow-2xl shadow-red-500/50'
                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 hover:scale-105'
            } text-white shadow-lg hover:shadow-2xl hover:shadow-red-500/30`}
            onClick={() => {
              if (window.confirm(`⚠️ EMERGENCY ALERT\n\nAre you sure you want to call ${currentCountryData.panicNumber}?`)) {
                makeCall(currentCountryData.panicNumber);
              }
            }}
          >
            {isPanicActive ? `🚨 CALLING ${currentCountryData.panicNumber}...` : `🆘 EMERGENCY - CALL ${currentCountryData.panicNumber}`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentCountryData.contacts.map((contact, index) => (
          <div
            key={index}
            className={`glass-card p-6 border-2 bg-gradient-to-br ${getTypeColor(contact.type)} hover:scale-105 transition-all duration-300 cursor-pointer group`}
            onClick={() => makeCall(contact.number)}
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
              {getTypeIcon(contact.type)}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{contact.name}</h3>
            <p className="text-3xl font-bold mb-3 gradient-text" style={{
              background: 'linear-gradient(135deg, #00ff88, #00d9ff)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {contact.number}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">{contact.description}</p>
            <div className="mt-4 py-2 px-4 rounded-full bg-white/10 text-emerald-400 text-center font-semibold group-hover:bg-emerald-500/20 transition-all duration-300">
              Tap to Call
            </div>
          </div>
        ))}
      </div>

      {location && (
        <div className="glass-card p-6 border border-emerald-500/30">
          <h3 className="text-2xl font-bold mb-4 gradient-text" style={{
            background: 'linear-gradient(135deg, #00ff88, #00d9ff)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            📍 Your Location
          </h3>
          <div className="space-y-3">
            <p className="text-gray-300">
              <span className="font-semibold text-emerald-400">Coordinates:</span>{' '}
              {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
            </p>
            <a
              href={`https://www.google.com/maps/search/hospital+near+me/@${location.lat},${location.lon},15z`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-center hover:from-emerald-600 hover:to-teal-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30"
            >
              🏥 Find Nearest Hospitals
            </a>
            <a
              href={`https://www.google.com/maps/search/emergency+room+near+me/@${location.lat},${location.lon},15z`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-center hover:from-cyan-600 hover:to-blue-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/30"
            >
              🚑 Find Nearest Emergency Rooms
            </a>
          </div>
        </div>
      )}

      {locationError && (
        <div className="glass-card p-6 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-bold text-yellow-400 mb-1">Location Info</h3>
              <p className="text-gray-300 text-sm">{locationError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6 border border-purple-500/30">
        <h3 className="text-2xl font-bold mb-4 gradient-text" style={{
          background: 'linear-gradient(135deg, #ff3366, #ff6b9d)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          💡 Emergency Tips
        </h3>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✅</span>
            <div>
              <span className="font-semibold text-white">Stay Calm:</span> Take deep breaths and speak clearly when calling emergency services.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✅</span>
            <div>
              <span className="font-semibold text-white">Provide Location:</span> Share your exact location and any landmarks.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✅</span>
            <div>
              <span className="font-semibold text-white">Medical Info:</span> Have your medical conditions and medications ready to share.
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">✅</span>
            <div>
              <span className="font-semibold text-white">Stay on the Line:</span> Don't hang up until instructed by the operator.
            </div>
          </li>
        </ul>
      </div>

      <div className="glass-card p-6 border border-emerald-500/30 text-center">
        <p className="text-gray-400 text-sm">
          <span className="text-emerald-400 font-semibold">Hello {user.name}!</span> In case of emergency, use these resources immediately. Your safety is our top priority. 💚
        </p>
      </div>
    </div>
  );
};

export default Emergency;
